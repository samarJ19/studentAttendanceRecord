from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import httpx
import json
import logging
from datetime import datetime
import os
from enum import Enum

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="WhatsApp Attendance Bot", version="1.0.0")
security = HTTPBearer()

# Configuration
EXISTING_BACKEND_URL = os.getenv("EXISTING_BACKEND_URL", "http://localhost:3000")
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")

# In-memory session storage (use Redis in production)
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
    course: Dict[str, Any]  # Course object with name, etc.
    branch: Dict[str, Any]  # Branch object with name, etc.

class Session(BaseModel):
    id: str
    date: str
    topic: Optional[str]
    assignmentId: str

class AttendanceRecord(BaseModel):
    id: str
    sessionId: str
    studentId: str
    enrollmentId: str
    present: bool
    student: Dict[str, Any]  # Student object with user details

class AttendanceService:
    def __init__(self):
        self.http_client = httpx.AsyncClient()
    
    async def authenticate_user(self, email: str, password: str) -> Optional[Dict]:
        """Authenticate user with existing backend using email and password"""
        try:
            response = await self.http_client.post(
                f"{EXISTING_BACKEND_URL}/api/auth/login",
                json={"email": email, "password": password}
            )
            if response.status_code == 200:
                res = await response.json()
                return res
            else:
                logger.warning(f"Authentication failed with status code: {response.status_code}")
                return None
        except Exception as e:
                logger.error(f"Authentication error: {e}")
                return None
    async def get_teaching_assignments(self, user_token: str) -> List[Dict]:
        """Get user's teaching assignments"""
        try:
            headers = {"Authorization": f"Bearer {user_token}"}
            response = await self.http_client.get(
                f"{EXISTING_BACKEND_URL}/api/teachers/assignments",
                headers=headers
            )
            if response.status_code == 200:
                return await response.json()
            return []
        except Exception as e:
            logger.error(f"Error fetching assignments: {e}")
            return []
    
    async def get_sessions(self, assignment_id: str, user_token: str) -> List[Dict]:
        """Get sessions for an assignment"""
        try:
            headers = {"Authorization": f"Bearer {user_token}"}
            response = await self.http_client.get(
                f"{EXISTING_BACKEND_URL}/api/teachers/sessions/{assignment_id}",
                headers=headers
            )
            if response.status_code == 200:
                return await response.json()
            return []
        except Exception as e:
            logger.error(f"Error fetching sessions: {e}")
            return []
    
    async def create_session(self, assignment_id: str, user_token: str, topic: str) -> Optional[Dict]:
        """Create a new session"""
        try:
            headers = {"Authorization": f"Bearer {user_token}"}
            response = await self.http_client.post(
                f"{EXISTING_BACKEND_URL}/api/teachers/sessions",
                headers=headers,
                json={
                    "assignmentId": assignment_id,
                    "date": datetime.now().isoformat(),
                    "topic": topic
                }
            )
            if response.status_code == 201:
                return await response.json()
            return None
        except Exception as e:
            logger.error(f"Error creating session: {e}")
            return None
    
    async def get_session_attendance(self, session_id: str, user_token: str) -> List[Dict]:
        """Get attendance records for a session"""
        try:
            headers = {"Authorization": f"Bearer {user_token}"}
            response = await self.http_client.get(
                f"{EXISTING_BACKEND_URL}/api/teachers/sessions/{session_id}/attendance",
                headers=headers
            )
            if response.status_code == 200:
                return await response.json()
            return []
        except Exception as e:
            logger.error(f"Error fetching attendance: {e}")
            return []
    
    async def mark_attendance_batch(self, session_id: str, attendance_records: List[Dict], user_token: str) -> bool:
        """Mark attendance for multiple students using batch update"""
        try:
            headers = {"Authorization": f"Bearer {user_token}"}
            response = await self.http_client.put(
                f"{EXISTING_BACKEND_URL}/api/teachers/attendance/batch/{session_id}",
                headers=headers,
                json={"attendanceRecords": attendance_records}
            )
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Error marking attendance: {e}")
            return False

attendance_service = AttendanceService()

class WhatsAppBot:
    def __init__(self):
        self.twilio_client = None
        if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
            from twilio.rest import Client
            self.twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    
    async def send_message(self, to: str, message: str):
        """Send WhatsApp message via Twilio"""
        if not self.twilio_client:
            logger.warning("Twilio client not configured")
            return
        
        try:
            message = self.twilio_client.messages.create(
                body=message,
                from_=TWILIO_WHATSAPP_NUMBER,
                to=to
            )
            logger.info(f"Message sent: {message.sid}")
        except Exception as e:
            logger.error(f"Error sending message: {e}")
    
    def get_user_session(self, phone_number: str) -> Dict:
        """Get or create user session"""
        if phone_number not in user_sessions:
            user_sessions[phone_number] = {
                "state": UserState.UNAUTHENTICATED,
                "user_token": None,
                "current_assignment": None,
                "current_session": None,
                "assignments": [],
                "sessions": [],
                "pending_topic": None,
                "attendance_records": []
            }
        return user_sessions[phone_number]
    
    def update_user_session(self, phone_number: str, updates: Dict):
        """Update user session"""
        if phone_number in user_sessions:
            user_sessions[phone_number].update(updates)
    
    async def handle_authentication(self, phone_number: str, message: str) -> str:
        """Handle user authentication"""
        if message.lower().startswith('login'):
            # Extract credentials from message (format: login email password)
            parts = message.split()
            if len(parts) >= 3:
                email = parts[1]
                password = ' '.join(parts[2:])  # Handle passwords with spaces
                print("Email: ",email, "Password: ",password)
                auth_result = await attendance_service.authenticate_user(email, password)
                
                if auth_result and auth_result.get("user", {}).get("role") == "TEACHER":
                    self.update_user_session(phone_number, {
                        "state": UserState.AUTHENTICATED,
                        "user_token": auth_result.get("token"),
                        "user_info": auth_result.get("user")
                    })
                    user = auth_result.get("user", {})
                    return f"✅ Welcome {user.get('firstName', '')} {user.get('lastName', '')}!\nAuthentication successful! Type 'assignments' to view your teaching assignments."
                else:
                    return "❌ Authentication failed or you don't have teacher privileges. Please check your credentials and try again.\nFormat: login <email> <password>"
            else:
                return "❌ Invalid format. Use: login <email> <password>"
        else:
            return "👋 Welcome to Attendance Bot!\nPlease login first using: login <email> <password>"
    
    async def handle_assignments(self, phone_number: str) -> str:
        """Handle teaching assignments display"""
        session = self.get_user_session(phone_number)
        assignments = await attendance_service.get_teaching_assignments(session["user_token"])
        
        if not assignments:
            return "❌ No teaching assignments found."
        
        self.update_user_session(phone_number, {
            "assignments": assignments,
            "state": UserState.SELECTING_ASSIGNMENT
        })
        
        message = "📚 Your Teaching Assignments:\n\n"
        for i, assignment in enumerate(assignments, 1):
            course_name = assignment.get('course', {}).get('name', 'Unknown Course')
            branch_name = assignment.get('branch', {}).get('name', 'Unknown Branch')
            message += f"{i}. {course_name}\n   📍 {branch_name} - Semester {assignment.get('semester')} - Section {assignment.get('section')}\n\n"
        
        message += f"Reply with assignment number (1-{len(assignments)}) to select:"
        return message
    
    async def handle_assignment_selection(self, phone_number: str, message: str) -> str:
        """Handle assignment selection"""
        session = self.get_user_session(phone_number)
        
        try:
            selection = int(message) - 1
            assignments = session["assignments"]
            
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
                message = f"📖 Selected: {course_name}\n📍 {branch_name} - Semester {selected_assignment.get('semester')} - Section {selected_assignment.get('section')}\n\n"
                
                if sessions:
                    message += "📅 Recent Sessions:\n"
                    for i, sess in enumerate(sessions[:5], 1):  # Show only last 5 sessions
                        date_str = sess.get('date', '').split('T')[0]  # Format date
                        topic = sess.get('topic', 'No topic')
                        message += f"{i}. {date_str} - {topic}\n"
                    message += f"\nOptions:\n• Reply 'new' to create new session\n• Reply 1-{min(len(sessions), 5)} to select existing session\n• Reply 'all' to see all sessions"
                else:
                    message += "No previous sessions found.\nReply 'new' to create a new session."
                
                return message
            else:
                return f"❌ Invalid selection. Please choose 1-{len(assignments)}"
        except ValueError:
            return "❌ Please enter a valid number."
    
    async def handle_session_selection(self, phone_number: str, message: str) -> str:
        """Handle session selection or creation"""
        session = self.get_user_session(phone_number)
        sessions = session["sessions"]
        
        if message.lower() == 'new':
            # Ask for topic before creating session
            self.update_user_session(phone_number, {
                "state": UserState.WAITING_FOR_TOPIC
            })
            return "📝 Enter topic for the new session:"
        
        if message.lower() == 'all':
            if sessions:
                message_text = "📅 All Sessions:\n\n"
                for i, sess in enumerate(sessions, 1):
                    date_str = sess.get('date', '').split('T')[0]
                    topic = sess.get('topic', 'No topic')
                    message_text += f"{i}. {date_str} - {topic}\n"
                message_text += f"\nReply with session number (1-{len(sessions)}) to select or 'new' to create new:"
                return message_text
            else:
                return "No sessions found. Reply 'new' to create new session."
        
        try:
            selection = int(message) - 1
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
                
                response = f"📅 Selected: {date_str} - {topic}\n"
                response += f"👥 Current Status: {present_count}/{total_count} present\n\n"
                response += "📝 Mark attendance by sending roll numbers separated by commas or spaces.\n"
                response += "Example: 101, 102, 103 or 101 102 103\n\n"
                response += "Type 'status' to see current attendance or 'done' when finished."
                
                return response
            else:
                return f"❌ Invalid selection. Please choose 1-{len(sessions)} or 'new'"
        except ValueError:
            return "❌ Please enter a valid number, 'new', or 'all'."
    
    async def handle_topic_input(self, phone_number: str, message: str) -> str:
        """Handle topic input for new session"""
        session = self.get_user_session(phone_number)
        
        # Create new session with topic
        new_session = await attendance_service.create_session(
            session["current_assignment"]['id'], 
            session["user_token"],
            message.strip()
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
            return f"✅ New session created!\n📝 Topic: {message.strip()}\n👥 {total_students} students enrolled\n\n📝 Ready to mark attendance!\nSend roll numbers separated by commas or spaces.\nExample: 101, 102, 103 or 101 102 103\n\nType 'status' to see current attendance."
        else:
            self.update_user_session(phone_number, {
                "state": UserState.SELECTING_SESSION
            })
            return "❌ Failed to create new session. Please try again."
    
    async def handle_attendance_marking(self, phone_number: str, message: str) -> str:
        """Handle attendance marking"""
        session = self.get_user_session(phone_number)
        
        if message.lower() == 'status':
            return self.get_attendance_status(session)
        
        if message.lower() == 'done':
            present_count = sum(1 for record in session["attendance_records"] if record.get('present'))
            total_count = len(session["attendance_records"])
            return f"✅ Attendance session completed!\n📊 Final count: {present_count}/{total_count} students present\n\nType 'assignments' to start over or select another assignment."
        
        # Parse roll numbers from message
        roll_numbers = []
        for part in message.replace(',', ' ').split():
            if part.strip().isdigit():
                roll_numbers.append(part.strip())
        
        if not roll_numbers:
            return "❌ No valid roll numbers found. Please send roll numbers separated by commas or spaces.\nExample: 101, 102, 103\n\nType 'status' to see current attendance."
        
        # Find students by roll numbers and mark them present
        attendance_records = session["attendance_records"]
        updates = []
        found_students = []
        not_found = []
        
        for roll_number in roll_numbers:
            student_found = False
            for record in attendance_records:
                student = record.get('student', {})
                if student.get('rollNumber') == roll_number:
                    updates.append({
                        "studentId": record['studentId'],
                        "present": True
                    })
                    # Update local record
                    record['present'] = True
                    found_students.append(f"{roll_number} ({student.get('user', {}).get('firstName', '')} {student.get('user', {}).get('lastName', '')})")
                    student_found = True
                    break
            
            if not student_found:
                not_found.append(roll_number)
        
        if updates:
            success = await attendance_service.mark_attendance_batch(
                session["current_session"]['id'],
                updates,
                session["user_token"]
            )
            
            if success:
                response = f"✅ Attendance marked for {len(updates)} students:\n"
                for student in found_students:
                    response += f"• {student}\n"
                
                if not_found:
                    response += f"\n❌ Roll numbers not found: {', '.join(not_found)}"
                
                # Show updated count
                present_count = sum(1 for record in attendance_records if record.get('present'))
                total_count = len(attendance_records)
                response += f"\n\n📊 Total present: {present_count}/{total_count}"
                response += f"\n\nContinue marking or type 'done' when finished."
                
                return response
            else:
                return "❌ Failed to mark attendance. Please try again."
        else:
            return f"❌ No valid students found for roll numbers: {', '.join(roll_numbers)}\nPlease check the roll numbers and try again."
    
    def get_attendance_status(self, session: Dict) -> str:
        """Get current attendance status"""
        attendance_records = session["attendance_records"]
        
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
        
        response += f"\n📈 Total: {len(present_students)}/{len(attendance_records)} present"
        
        return response
    
    async def process_message(self, phone_number: str, message: str) -> str:
        """Process incoming WhatsApp message"""
        session = self.get_user_session(phone_number)
        state = session["state"]
        
        # Handle special commands
        if message.lower() == 'assignments' and state != UserState.UNAUTHENTICATED:
            return await self.handle_assignments(phone_number)
        elif message.lower() == 'help':
            return self.get_help_message(state)
        elif message.lower() == 'logout':
            user_sessions.pop(phone_number, None)
            return "👋 Logged out successfully. Send any message to start again."
        
        # Handle state-based processing
        if state == UserState.UNAUTHENTICATED:
            return await self.handle_authentication(phone_number, message)
        elif state == UserState.AUTHENTICATED:
            if message.lower() == 'assignments':
                return await self.handle_assignments(phone_number)
            else:
                return "Type 'assignments' to view your teaching assignments."
        elif state == UserState.SELECTING_ASSIGNMENT:
            return await self.handle_assignment_selection(phone_number, message)
        elif state == UserState.SELECTING_SESSION:
            return await self.handle_session_selection(phone_number, message)
        elif state == UserState.WAITING_FOR_TOPIC:
            return await self.handle_topic_input(phone_number, message)
        elif state == UserState.MARKING_ATTENDANCE:
            return await self.handle_attendance_marking(phone_number, message)
        
        return "❌ Something went wrong. Type 'help' for assistance."
    
    def get_help_message(self, state: UserState) -> str:
        """Get help message based on current state"""
        if state == UserState.UNAUTHENTICATED:
            return "📱 Attendance Bot Help\n\n🔐 Login: login <email> <password>\n💡 Example: login teacher@school.edu mypassword"
        else:
            return """📱 Attendance Bot Help

📚 assignments - View teaching assignments
❓ help - Show this help message  
🚪 logout - Logout from system

🔄 You can type 'assignments' anytime to start over.

📝 When marking attendance:
• Send roll numbers: 101, 102, 103
• status - Check current attendance
• done - Finish attendance session"""

bot = WhatsAppBot()

def create_twiml_response(message: str) -> str:
    """Create TwiML response for Twilio"""
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>{message}</Message>
</Response>"""

@app.post("/webhook/whatsapp")
async def whatsapp_webhook(request: Request):
    """Handle incoming WhatsApp messages"""
    try:
        form_data = await request.form()
        message_data = dict(form_data)
        
        phone_number = message_data.get("From", "")
        message_body = message_data.get("Body", "").strip()
        
        logger.info(f"Received message from {phone_number}: {message_body}")
        
        # Process the message
        response_message = await bot.process_message(phone_number, message_body)
        
        # Create TwiML response
        twiml_response = create_twiml_response(response_message)
        
        logger.info(f"Sending response: {response_message}")
        
        # Return TwiML response to Twilio
        return Response(content=twiml_response, media_type="application/xml")
    
    except Exception as e:
        logger.error(f"Error processing webhook: {e}")
        # Return error message as TwiML
        error_twiml = create_twiml_response("❌ Sorry, there was an error processing your message. Please try again.")
        return Response(content=error_twiml, media_type="application/xml")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/sessions")
async def get_active_sessions():
    """Get active user sessions (for debugging)"""
    return {
        "active_sessions": len(user_sessions),
        "sessions": {phone: {k: v for k, v in session.items() if k != "user_token"} 
                    for phone, session in user_sessions.items()}
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8001)
