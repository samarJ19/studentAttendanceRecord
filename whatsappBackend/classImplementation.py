from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import Response
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any, Union
import httpx
import json
import logging
from datetime import datetime, timedelta
import os
from enum import Enum
import asyncio
from urllib.parse import quote
import traceback
import re

# Configure comprehensive logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# Configuration with validation
EXISTING_BACKEND_URL = os.getenv("EXISTING_BACKEND_URL", "http://localhost:3000").rstrip('/')
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")
# Session timeout (30 minutes)
SESSION_TIMEOUT = timedelta(minutes=30)

# In-memory session storage with cleanup (use Redis in production)
user_sessions: Dict[str, Dict] = {}


class UserState(Enum):
    UNAUTHENTICATED = "unauthenticated"
    AUTHENTICATED = "authenticated"
    SELECTING_ASSIGNMENT = "selecting_assignment"
    SELECTING_SESSION = "selecting_session"
    MARKING_ATTENDANCE = "marking_attendance"
    WAITING_FOR_TOPIC = "waiting_for_topic"

class WhatsAppMessage(BaseModel):
    From: str
    To: str
    Body: str
    MessageSid: str

class TeachingAssignment(BaseModel):
    id: str
    teacherId: str
    courseId: str
    branchId: str
    semester: int
    section: str
    academicYear: str
    active: bool
    course: Dict[str, Any]
    branch: Dict[str, Any]

class Session(BaseModel):
    id: str
    date: str
    topic: Optional[str] = None
    assignmentId: str

class AttendanceRecord(BaseModel):
    id: str
    sessionId: str
    studentId: str
    enrollmentId: str
    present: bool
    student: Dict[str, Any]

class AttendanceService:
    def __init__(self):
        self.http_client = httpx.AsyncClient(timeout=30.0)
        self.max_retries = 3
        self.retry_delay = 1.0
    
    async def _make_request_with_retry(self, method: str, url: str, **kwargs) -> Optional[httpx.Response]:
        """Make HTTP request with retry mechanism"""
        for attempt in range(self.max_retries):
            try:
                response = await self.http_client.request(method, url, **kwargs)
                return response
            except httpx.TimeoutException:
                logger.warning(f"Request timeout on attempt {attempt + 1} for {url}")
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(self.retry_delay * (attempt + 1))
                else:
                    logger.error(f"Request failed after {self.max_retries} attempts: {url}")
                    return None
            except Exception as e:
                logger.error(f"Request error on attempt {attempt + 1} for {url}: {e}")
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(self.retry_delay * (attempt + 1))
                else:
                    return None
        return None
    
    async def authenticate_user(self, email: str, password: str) -> Optional[Dict]:
        """Authenticate user with existing backend using email and password"""
        try:
            logger.info(f"Attempting authentication for email: {email}")
            
            # Validate input
            if not email or not password:
                logger.warning("Empty email or password provided")
                return None
            
            # Clean email
            email = email.strip().lower()
            
            response = await self._make_request_with_retry(
                "POST",
                f"{EXISTING_BACKEND_URL}/api/auth/login",
                json={"email": email, "password": password},
                headers={"Content-Type": "application/json"}
            )
            
            if response is None:
                logger.error("Failed to get response from authentication endpoint")
                return None
                
            logger.info(f"Authentication response status: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    auth_data = response.json()
                    logger.info(f"Authentication successful for {email}")
                    logger.debug(f"Auth response keys: {list(auth_data.keys())}")
                    
                    # Validate response structure
                    if not isinstance(auth_data, dict):
                        logger.error("Invalid authentication response format")
                        return None
                    
                    # Check for user data
                    user_data = auth_data.get("user") or auth_data.get("data", {}).get("user")
                    token = auth_data.get("token") or auth_data.get("access_token") or auth_data.get("data", {}).get("token")
                    
                    if not user_data or not token:
                        logger.error(f"Missing user data or token in response: user={bool(user_data)}, token={bool(token)}")
                        return None
                    
                    # Check user role
                    user_role = user_data.get("role", "").upper()
                    logger.info(f"User role: {user_role}")
                    
                    if user_role != "TEACHER":
                        logger.warning(f"User {email} does not have TEACHER role: {user_role}")
                        return None
                    
                    return {
                        "user": user_data,
                        "token": token
                    }
                    
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse authentication response: {e}")
                    logger.error(f"Response content: {response.text}")
                    return None
            else:
                logger.warning(f"Authentication failed with status {response.status_code}")
                try:
                    error_data = response.json()
                    logger.warning(f"Error details: {error_data}")
                except:
                    logger.warning(f"Error response: {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Authentication error: {e}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            return None
    
    async def get_teaching_assignments(self, user_token: str) -> List[Dict]:
        """Get user's teaching assignments"""
        try:
            logger.info("Fetching teaching assignments")
            headers = {
                "Authorization": f"Bearer {user_token}",
                "Content-Type": "application/json"
            }
            
            response = await self._make_request_with_retry(
                "GET",
                f"{EXISTING_BACKEND_URL}/api/teachers/assignments",
                headers=headers
            )
            
            if response is None:
                logger.error("Failed to get assignments response")
                return []
                
            if response.status_code == 200:
                assignments = response.json()
                logger.info(f"Retrieved {len(assignments)} assignments")
                return assignments if isinstance(assignments, list) else []
            else:
                logger.warning(f"Failed to fetch assignments: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error fetching assignments: {e}")
            return []
    
    async def get_sessions(self, assignment_id: str, user_token: str) -> List[Dict]:
        """Get sessions for an assignment"""
        try:
            logger.info(f"Fetching sessions for assignment: {assignment_id}")
            headers = {
                "Authorization": f"Bearer {user_token}",
                "Content-Type": "application/json"
            }
            
            response = await self._make_request_with_retry(
                "GET",
                f"{EXISTING_BACKEND_URL}/api/teachers/sessions/{assignment_id}",
                headers=headers
            )
            
            if response is None:
                logger.error("Failed to get sessions response")
                return []
                
            if response.status_code == 200:
                sessions = response.json()
                logger.info(f"Retrieved {len(sessions)} sessions")
                return sessions if isinstance(sessions, list) else []
            else:
                logger.warning(f"Failed to fetch sessions: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error fetching sessions: {e}")
            return []
    
    async def create_session(self, assignment_id: str, user_token: str, topic: str) -> Optional[Dict]:
        """Create a new session"""
        try:
            logger.info(f"Creating new session for assignment: {assignment_id}")
            headers = {
                "Authorization": f"Bearer {user_token}",
                "Content-Type": "application/json"
            }
            
            session_data = {
                "assignmentId": assignment_id,
                "date": datetime.now().isoformat(),
                "topic": topic.strip()
            }
            
            response = await self._make_request_with_retry(
                "POST",
                f"{EXISTING_BACKEND_URL}/api/teachers/sessions",
                headers=headers,
                json=session_data
            )
            
            if response is None:
                logger.error("Failed to create session")
                return None
                
            if response.status_code in [200, 201]:
                session = response.json()
                logger.info(f"Created session with ID: {session.get('id')}")
                return session
            else:
                logger.warning(f"Failed to create session: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error creating session: {e}")
            return None
    
    async def get_session_attendance(self, session_id: str, user_token: str) -> List[Dict]:
        """Get attendance records for a session"""
        try:
            logger.info(f"Fetching attendance for session: {session_id}")
            headers = {
                "Authorization": f"Bearer {user_token}",
                "Content-Type": "application/json"
            }
            
            response = await self._make_request_with_retry(
                "GET",
                f"{EXISTING_BACKEND_URL}/api/teachers/sessions/{session_id}/attendance",
                headers=headers
            )
            
            if response is None:
                logger.error("Failed to get attendance response")
                return []
                
            if response.status_code == 200:
                attendance = response.json()
                logger.info(f"Retrieved {len(attendance)} attendance records")
                return attendance if isinstance(attendance, list) else []
            else:
                logger.warning(f"Failed to fetch attendance: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error fetching attendance: {e}")
            return []
    
    async def mark_attendance_batch(self, session_id: str, attendance_records: List[Dict], user_token: str) -> bool:
        """Mark attendance for multiple students using batch update"""
        try:
            logger.info(f"Marking attendance for {len(attendance_records)} students in session: {session_id}")
            headers = {
                "Authorization": f"Bearer {user_token}",
                "Content-Type": "application/json"
            }
            
            payload = {"attendanceRecords": attendance_records}
            
            response = await self._make_request_with_retry(
                "PUT",
                f"{EXISTING_BACKEND_URL}/api/teachers/attendance/batch/{session_id}",
                headers=headers,
                json=payload
            )
            
            if response is None:
                logger.error("Failed to mark attendance")
                return False
                
            success = response.status_code == 200
            if success:
                logger.info("Attendance marked successfully")
            else:
                logger.warning(f"Failed to mark attendance: {response.status_code}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error marking attendance: {e}")
            return False
    
    async def close(self):
        """Close HTTP client"""
        await self.http_client.aclose()

attendance_service = AttendanceService()

class WhatsAppBot:
    def __init__(self):
        self.twilio_client = None
        if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
            try:
                from twilio.rest import Client
                self.twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
                logger.info("Twilio client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Twilio client: {e}")
    
    async def send_message(self, to: str, message: str):
        """Send WhatsApp message via Twilio"""
        if not self.twilio_client:
            logger.warning("Twilio client not configured")
            return
        
        try:
            # Truncate long messages
            if len(message) > 1600:
                message = message[:1597] + "..."
            
            twilio_message = self.twilio_client.messages.create(
                body=message,
                from_=TWILIO_WHATSAPP_NUMBER,
                to=to
            )
            logger.info(f"Message sent: {twilio_message.sid}")
        except Exception as e:
            logger.error(f"Error sending message: {e}")
    
    def cleanup_expired_sessions(self):
        """Clean up expired sessions"""
        current_time = datetime.now()
        expired_sessions = []
        
        for phone, session in user_sessions.items():
            last_activity = session.get("last_activity")
            if last_activity and isinstance(last_activity, datetime):
                if current_time - last_activity > SESSION_TIMEOUT:
                    expired_sessions.append(phone)
        
        for phone in expired_sessions:
            logger.info(f"Cleaning up expired session for {phone}")
            user_sessions.pop(phone, None)
    
    def get_user_session(self, phone_number: str) -> Dict:
        """Get or create user session"""
        self.cleanup_expired_sessions()
        
        if phone_number not in user_sessions:
            user_sessions[phone_number] = {
                "state": UserState.UNAUTHENTICATED,
                "user_token": None,
                "user_info": None,
                "current_assignment": None,
                "current_session": None,
                "assignments": [],
                "sessions": [],
                "pending_topic": None,
                "attendance_records": [],
                "last_activity": datetime.now(),
                "login_attempts": 0,
                "last_login_attempt": None
            }
        else:
            # Update last activity
            user_sessions[phone_number]["last_activity"] = datetime.now()
        
        return user_sessions[phone_number]
    
    def update_user_session(self, phone_number: str, updates: Dict):
        """Update user session"""
        if phone_number in user_sessions:
            user_sessions[phone_number].update(updates)
            user_sessions[phone_number]["last_activity"] = datetime.now()
    
    def parse_login_credentials(self, message: str) -> Optional[tuple]:
        """Parse login credentials from message"""
        try:
            parts = message.split()
            if len(parts) < 3:
                return None
            
            email = parts[1].strip()
            password = ' '.join(parts[2:]).strip()  # Handle passwords with spaces
            
            # Basic email validation
            if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
                return None
            
            return email, password
        except Exception:
            return None
    
    async def handle_authentication(self, phone_number: str, message: str) -> str:
        """Handle user authentication with rate limiting"""
        session = self.get_user_session(phone_number)
        
        # Rate limiting
        current_time = datetime.now()
        last_attempt = session.get("last_login_attempt")
        
        if last_attempt and current_time - last_attempt < timedelta(seconds=5):
            return "⏰ Please wait a moment before trying again."
        
        if session.get("login_attempts", 0) >= 5:
            if last_attempt and current_time - last_attempt < timedelta(minutes=15):
                return "🔒 Too many failed attempts. Please wait 15 minutes before trying again."
            else:
                # Reset attempts after 15 minutes
                session["login_attempts"] = 0
        
        if message.lower().startswith('login'):
            credentials = self.parse_login_credentials(message)
            
            if not credentials:
                return "❌ Invalid format. Use: login <email> <password>\n💡 Example: login teacher@school.edu mypassword"
            
            email, password = credentials
            
            # Update attempt tracking
            session["login_attempts"] = session.get("login_attempts", 0) + 1
            session["last_login_attempt"] = current_time
            
            logger.info(f"Login attempt {session['login_attempts']} for {email} from {phone_number}")
            
            auth_result = await attendance_service.authenticate_user(email, password)
            
            if auth_result and auth_result.get("user", {}).get("role", "").upper() == "TEACHER":
                # Reset failed attempts on success
                session["login_attempts"] = 0
                
                self.update_user_session(phone_number, {
                    "state": UserState.AUTHENTICATED,
                    "user_token": auth_result.get("token"),
                    "user_info": auth_result.get("user")
                })
                
                user = auth_result.get("user", {})
                first_name = user.get('firstName', '')
                last_name = user.get('lastName', '')
                name = f"{first_name} {last_name}".strip() or "Teacher"
                
                return f"✅ Welcome {name}!\n🎉 Authentication successful!\n\n📚 Type 'assignments' to view your teaching assignments.\n💡 Type 'help' for available commands."
            else:
                attempts_left = 5 - session.get("login_attempts", 0)
                if attempts_left > 0:
                    return f"❌ Authentication failed or you don't have teacher privileges.\n🔍 Please check your credentials and try again.\n⚠️ {attempts_left} attempts remaining.\n\n📝 Format: login <email> <password>"
                else:
                    return "🔒 Too many failed attempts. Please wait 15 minutes before trying again."
        else:
            return """👋 Welcome to the Attendance Bot!

🔐 Please login first using:
login <email> <password>

💡 Example: login teacher@school.edu mypassword

❓ Type 'help' for more information."""
    
    async def handle_assignments(self, phone_number: str) -> str:
        """Handle teaching assignments display"""
        session = self.get_user_session(phone_number)
        
        try:
            assignments = await attendance_service.get_teaching_assignments(session["user_token"])
            
            if not assignments:
                return "❌ No teaching assignments found.\n\n📞 Please contact your administrator if you believe this is an error."
            
            self.update_user_session(phone_number, {
                "assignments": assignments,
                "state": UserState.SELECTING_ASSIGNMENT
            })
            
            message = "📚 Your Teaching Assignments:\n\n"
            for i, assignment in enumerate(assignments, 1):
                course_name = assignment.get('course', {}).get('name', 'Unknown Course')
                branch_name = assignment.get('branch', {}).get('name', 'Unknown Branch')
                semester = assignment.get('semester', 'N/A')
                section = assignment.get('section', 'N/A')
                
                message += f"{i}. 📖 {course_name}\n"
                message += f"   📍 {branch_name} | Sem {semester} | Sec {section}\n\n"
            
            message += f"📝 Reply with assignment number (1-{len(assignments)}) to select:"
            return message
            
        except Exception as e:
            logger.error(f"Error handling assignments: {e}")
            return "❌ Error retrieving assignments. Please try again later."
    
    async def handle_assignment_selection(self, phone_number: str, message: str) -> str:
        """Handle assignment selection"""
        session = self.get_user_session(phone_number)
        
        try:
            selection = int(message.strip()) - 1
            assignments = session.get("assignments", [])
            
            if not assignments:
                return "❌ No assignments available. Type 'assignments' to refresh."
            
            if 0 <= selection < len(assignments):
                selected_assignment = assignments[selection]
                self.update_user_session(phone_number, {
                    "current_assignment": selected_assignment,
                    "state": UserState.SELECTING_SESSION
                })
                
                sessions = await attendance_service.get_sessions(selected_assignment['id'], session["user_token"])
                self.update_user_session(phone_number, {"sessions": sessions})
                
                course_name = selected_assignment.get('course', {}).get('name', 'Unknown Course')
                branch_name = selected_assignment.get('branch', {}).get('name', 'Unknown Branch')
                semester = selected_assignment.get('semester', 'N/A')
                section = selected_assignment.get('section', 'N/A')
                
                response = f"✅ Selected Assignment:\n📖 {course_name}\n📍 {branch_name} | Sem {semester} | Sec {section}\n\n"
                
                if sessions:
                    response += "📅 Recent Sessions:\n"
                    for i, sess in enumerate(sessions[:5], 1):  # Show only last 5 sessions
                        date_str = sess.get('date', '').split('T')[0]
                        topic = sess.get('topic', 'No topic')
                        response += f"{i}. {date_str} - {topic}\n"
                    
                    response += f"\n🎯 Options:\n"
                    response += f"• 'new' - Create new session\n"
                    response += f"• 1-{min(len(sessions), 5)} - Select existing session\n"
                    response += f"• 'all' - View all sessions"
                else:
                    response += "📭 No previous sessions found.\n\n💡 Reply 'new' to create a new session."
                
                return response
            else:
                return f"❌ Invalid selection. Please choose 1-{len(assignments)}"
                
        except ValueError:
            return "❌ Please enter a valid number."
        except Exception as e:
            logger.error(f"Error handling assignment selection: {e}")
            return "❌ Error processing selection. Please try again."
    
    async def handle_session_selection(self, phone_number: str, message: str) -> str:
        """Handle session selection or creation"""
        session = self.get_user_session(phone_number)
        sessions = session.get("sessions", [])
        message_lower = message.lower().strip()
        
        try:
            if message_lower == 'new':
                self.update_user_session(phone_number, {
                    "state": UserState.WAITING_FOR_TOPIC
                })
                return "📝 Enter topic for the new session:\n\n💡 Example: Introduction to Data Structures"
            
            if message_lower == 'all':
                if sessions:
                    response = "📅 All Sessions:\n\n"
                    for i, sess in enumerate(sessions, 1):
                        date_str = sess.get('date', '').split('T')[0]
                        topic = sess.get('topic', 'No topic')
                        response += f"{i}. {date_str} - {topic}\n"
                    response += f"\n📝 Reply with session number (1-{len(sessions)}) to select or 'new' to create new:"
                    return response
                else:
                    return "📭 No sessions found.\n\n💡 Reply 'new' to create new session."
            
            # Try to parse as session number
            selection = int(message_lower) - 1
            if 0 <= selection < len(sessions):
                selected_session = sessions[selection]
                self.update_user_session(phone_number, {
                    "current_session": selected_session,
                    "state": UserState.MARKING_ATTENDANCE
                })
                
                # Get current attendance for this session
                attendance_records = await attendance_service.get_session_attendance(
                    selected_session['id'], session["user_token"]
                )
                self.update_user_session(phone_number, {
                    "attendance_records": attendance_records
                })
                
                date_str = selected_session.get('date', '').split('T')[0]
                topic = selected_session.get('topic', 'No topic')
                
                # Show current attendance status
                present_count = sum(1 for record in attendance_records if record.get('present'))
                total_count = len(attendance_records)
                
                response = f"📅 Selected Session:\n🗓️ {date_str}\n📚 {topic}\n\n"
                response += f"👥 Current Status: {present_count}/{total_count} present\n\n"
                response += "📝 Mark attendance by sending roll numbers:\n"
                response += "💡 Examples:\n• 101, 102, 103\n• 101 102 103\n\n"
                response += "🎯 Commands:\n• 'status' - Check current attendance\n• 'done' - Finish session"
                
                return response
            else:
                return f"❌ Invalid selection. Please choose 1-{len(sessions)}, 'new', or 'all'"
                
        except ValueError:
            return "❌ Please enter a valid number, 'new', or 'all'."
        except Exception as e:
            logger.error(f"Error handling session selection: {e}")
            return "❌ Error processing selection. Please try again."
    
    async def handle_topic_input(self, phone_number: str, message: str) -> str:
        """Handle topic input for new session"""
        session = self.get_user_session(phone_number)
        topic = message.strip()
        
        if not topic:
            return "❌ Topic cannot be empty. Please enter a topic for the session:"
        
        if len(topic) > 200:
            return "❌ Topic is too long. Please keep it under 200 characters:"
        
        try:
            # Create new session with topic
            new_session = await attendance_service.create_session(
                session["current_assignment"]['id'], 
                session["user_token"],
                topic
            )
            
            if new_session:
                # Get attendance records for the new session
                attendance_records = await attendance_service.get_session_attendance(
                    new_session['id'], session["user_token"]
                )
                
                self.update_user_session(phone_number, {
                    "current_session": new_session,
                    "state": UserState.MARKING_ATTENDANCE,
                    "attendance_records": attendance_records
                })
                
                total_students = len(attendance_records)
                response = f"✅ New session created successfully!\n\n"
                response += f"📚 Topic: {topic}\n"
                response += f"👥 {total_students} students enrolled\n\n"
                response += f"📝 Ready to mark attendance!\n"
                response += f"💡 Send roll numbers: 101, 102, 103\n\n"
                response += f"🎯 Commands:\n• 'status' - Check attendance\n• 'done' - Finish session"
                
                return response
            else:
                self.update_user_session(phone_number, {
                    "state": UserState.SELECTING_SESSION
                })
                return "❌ Failed to create new session. Please try again or contact support."
                
        except Exception as e:
            logger.error(f"Error handling topic input: {e}")
            return "❌ Error creating session. Please try again."
    
    def parse_roll_numbers(self, message: str) -> List[str]:
        """Parse roll numbers from message"""
        # Remove common separators and split
        cleaned = re.sub(r'[,;|]', ' ', message)
        parts = cleaned.split()
        
        roll_numbers = []
        for part in parts:
            part = part.strip()
            # Accept alphanumeric roll numbers
            if re.match(r'^[a-zA-Z0-9]+$', part):
                roll_numbers.append(part.upper())
        
        return roll_numbers
    
    async def handle_attendance_marking(self, phone_number: str, message: str) -> str:
        """Handle attendance marking"""
        session = self.get_user_session(phone_number)
        message_lower = message.lower().strip()
        
        try:
            if message_lower == 'status':
                return self.get_attendance_status(session)
            
            if message_lower == 'done':
                present_count = sum(1 for record in session.get("attendance_records", []) if record.get('present'))
                total_count = len(session.get("attendance_records", []))
                
                response = f"✅ Attendance session completed!\n\n"
                response += f"📊 Final Summary:\n"
                response += f"✅ Present: {present_count}/{total_count} students\n"
                response += f"📈 Attendance Rate: {(present_count/total_count*100):.1f}%\n\n"
                response += f"🎯 What's next?\n"
                response += f"• 'assignments' - Start new session\n"
                response += f"• 'help' - View commands"
                
                return response
            
            # Parse roll numbers from message
            roll_numbers = self.parse_roll_numbers(message)
            
            if not roll_numbers:
                return "❌ No valid roll numbers found.\n\n📝 Please send roll numbers separated by commas or spaces:\n💡 Example: 101, 102, 103\n\n🎯 Commands:\n• 'status' - Check attendance\n• 'done' - Finish session"
            
            # Find students by roll numbers and mark them present
            attendance_records = session.get("attendance_records", [])
            updates = []
            found_students = []
            not_found = []
            already_present = []
            
            for roll_number in roll_numbers:
                student_found = False
                for record in attendance_records:
                    student = record.get('student', {})
                    if student.get('rollNumber', '').upper() == roll_number.upper():
                        if record.get('present'):
                            # Student already marked present
                            user = student.get('user', {})
                            name = f"{user.get('firstName', '')} {user.get('lastName', '')}".strip()
                            already_present.append(f"{roll_number} ({name})")
                        else:
                            # Mark student present
                            updates.append({
                                "studentId": record['studentId'],
                                "present": True
                            })
                            # Update local record
                            record['present'] = True
                            user = student.get('user', {})
                            name = f"{user.get('firstName', '')} {user.get('lastName', '')}".strip()
                            found_students.append(f"{roll_number} ({name})")
                        student_found = True
                        break
                
                if not student_found:
                    not_found.append(roll_number)
            
            # Build response message
            response_parts = []
            
            if updates:
                success = await attendance_service.mark_attendance_batch(
                    session["current_session"]['id'],
                    updates,
                    session["user_token"]
                )
                
                if success:
                    response_parts.append(f"✅ Attendance marked for {len(updates)} students:")
                    for student in found_students[:10]:  # Limit to 10 to avoid long messages
                        response_parts.append(f"• {student}")
                    if len(found_students) > 10:
                        response_parts.append(f"... and {len(found_students) - 10} more")
                else:
                    return "❌ Failed to mark attendance. Please try again."
            
            if already_present:
                response_parts.append(f"\n⚠️ Already present ({len(already_present)}):")
                for student in already_present[:5]:  # Limit to 5
                    response_parts.append(f"• {student}")
                if len(already_present) > 5:
                    response_parts.append(f"... and {len(already_present) - 5} more")
            
            if not_found:
                response_parts.append(f"\n❌ Roll numbers not found: {', '.join(not_found)}")
            
            if not response_parts:
                return "❌ No valid actions performed. Please check roll numbers and try again."
            
            # Add current status
            present_count = sum(1 for record in attendance_records if record.get('present'))
            total_count = len(attendance_records)
            response_parts.append(f"\n📊 Total present: {present_count}/{total_count} ({(present_count/total_count*100):.1f}%)")
            response_parts.append(f"\n💡 Continue marking or type 'done' when finished.")
            
            return "\n".join(response_parts)
            
        except Exception as e:
            logger.error(f"Error handling attendance marking: {e}")
            return "❌ Error processing attendance. Please try again."
    
    def get_attendance_status(self, session: Dict) -> str:
        """Get current attendance status"""
        attendance_records = session.get("attendance_records", [])
        
        if not attendance_records:
            return "❌ No attendance records found."
        
        present_students = []
        absent_students = []
        
        for record in attendance_records:
            student = record.get('student', {})
            user = student.get('user', {})
            name = f"{user.get('firstName', '')} {user.get('lastName', '')}".strip()
            roll_number = student.get('rollNumber', 'N/A')
            
            if record.get('present'):
                present_students.append(f"• {roll_number} - {name}")
            else:
                absent_students.append(f"• {roll_number} - {name}")
        
        response = f"📊 Attendance Status\n\n"
        response += f"✅ Present ({len(present_students)}):\n"
        for student in present_students[:10]:  # Show first 10
            response += f"{student}\n"
        if len(present_students) > 10:
            response += f"... and {len(present_students) - 10} more\n"
        
        response += f"\n❌ Absent ({len(absent_students)}):\n"
        for student in absent_students[:10]:  # Show first 10
            response += f"{student}\n"
        if len(absent_students) > 10:
            response += f"... and {len(absent_students) - 10} more\n"
        
        attendance_rate = (len(present_students) / len(attendance_records) * 100) if attendance_records else 0
        response += f"\n📈 Total: {len(present_students)}/{len(attendance_records)} present ({attendance_rate:.1f}%)"
        
        return response
    
    async def process_message(self, phone_number: str, message: str) -> str:
        """Process incoming WhatsApp message"""
        try:
            # Clean phone number format
            phone_number = phone_number.strip()
            message = message.strip()
            
            if not message:
                return "❌ Empty message received. Please send a valid command."
            
            session = self.get_user_session(phone_number)
            state = session["state"]
            
            logger.info(f"Processing message from {phone_number} in state {state}: {message}")
            
            # Handle special commands that work in any authenticated state
            if message.lower() == 'assignments' and state != UserState.UNAUTHENTICATED:
                return await self.handle_assignments(phone_number)
            elif message.lower() == 'help':
                return self.get_help_message(state)
            elif message.lower() == 'logout':
                user_sessions.pop(phone_number, None)
                return "👋 Logged out successfully. Send any message to start again."
            elif message.lower() == 'restart' and state != UserState.UNAUTHENTICATED:
                # Reset to authenticated state but keep login info
                session["state"] = UserState.AUTHENTICATED
                session["current_assignment"] = None
                session["current_session"] = None
                session["assignments"] = []
                session["sessions"] = []
                session["attendance_records"] = []
                return "🔄 Session restarted. Type 'assignments' to view your teaching assignments."
            
            # Handle state-based processing
            if state == UserState.UNAUTHENTICATED:
                return await self.handle_authentication(phone_number, message)
            elif state == UserState.AUTHENTICATED:
                if message.lower() == 'assignments':
                    return await self.handle_assignments(phone_number)
                else:
                    return "📚 Type 'assignments' to view your teaching assignments.\n💡 Type 'help' for more commands."
            elif state == UserState.SELECTING_ASSIGNMENT:
                return await self.handle_assignment_selection(phone_number, message)
            elif state == UserState.SELECTING_SESSION:
                return await self.handle_session_selection(phone_number, message)
            elif state == UserState.WAITING_FOR_TOPIC:
                return await self.handle_topic_input(phone_number, message)
            elif state == UserState.MARKING_ATTENDANCE:
                return await self.handle_attendance_marking(phone_number, message)
            
            return "❌ Something went wrong. Type 'help' for assistance or 'restart' to reset."
            
        except Exception as e:
            logger.error(f"Error processing message from {phone_number}: {e}")
            logger.error(traceback.format_exc())
            return "❌ An unexpected error occurred. Please try again or contact support."
    
    def get_help_message(self, state: UserState) -> str:
        """Get help message based on current state"""
        if state == UserState.UNAUTHENTICATED:
            return """📱 Attendance Bot Help

🔐 Login Commands:
• login <email> <password> - Sign in as teacher

💡 Example: login teacher@school.edu mypassword

⚠️ Note: Only teachers can use this bot"""
        else:
            return """📱 Attendance Bot Help

🎯 Main Commands:
• assignments - View teaching assignments
• help - Show this help message  
• logout - Sign out from system
• restart - Reset current session

📝 During Attendance:
• Send roll numbers: 101, 102, 103
• status - Check current attendance
• done - Finish attendance session

🔄 You can type 'assignments' anytime to start over."""