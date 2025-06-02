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
from classImplementation import UserState,WhatsAppMessage,TeachingAssignment,Session,AttendanceRecord,AttendanceService,WhatsAppBot
# Configure comprehensive logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="WhatsApp Attendance Bot", version="2.0.0")
security = HTTPBearer()

# Configuration with validation
EXISTING_BACKEND_URL = os.getenv("EXISTING_BACKEND_URL", "http://localhost:3000").rstrip('/')
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")

# Session timeout (30 minutes)
SESSION_TIMEOUT = timedelta(minutes=30)

# In-memory session storage with cleanup (use Redis in production)
user_sessions: Dict[str, Dict] = {}

# Initialize bot
bot = WhatsAppBot()

def create_twiml_response(message: str) -> str:
    """Create TwiML response for Twilio with enhanced error handling"""
    try:
        # Escape XML characters
        message = message.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        
        # Ensure message is not too long for SMS/WhatsApp
        if len(message) > 1600:
            message = message[:1597] + "..."
        
        return f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>{message}</Message>
</Response>"""
    except Exception as e:
        logger.error(f"Error creating TwiML response: {e}")
        return """<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>Sorry, there was an error processing your request. Please try again.</Message>
</Response>"""

@app.post("/webhook/whatsapp")
async def whatsapp_webhook(request: Request):
    """Handle incoming WhatsApp messages with comprehensive error handling"""
    try:
        # Parse form data from Twilio
        form_data = await request.form()
        message_data = dict(form_data)
        
        phone_number = message_data.get("From", "").strip()
        message_body = message_data.get("Body", "").strip()
        message_sid = message_data.get("MessageSid", "")
        
        # Validate required fields
        if not phone_number:
            logger.error("Missing phone number in webhook")
            return Response(
                content=create_twiml_response("❌ Invalid request: missing phone number"),
                media_type="application/xml"
            )
        
        if not message_body:
            logger.warning(f"Empty message body from {phone_number}")
            return Response(
                content=create_twiml_response("❌ Empty message received. Please send a valid command."),
                media_type="application/xml"
            )
        
        logger.info(f"Received message from {phone_number}: {message_body}")

        # Process the message using bot
        response_message = await bot.process_message(phone_number, message_body)

        # Create and return TwiML response
        twiml_response = create_twiml_response(response_message)
        return Response(content=twiml_response, media_type="application/xml")

    except Exception as e:
        logger.error(f"Unhandled error in WhatsApp webhook: {e}")
        logger.error(traceback.format_exc())
        error_twiml = create_twiml_response("❌ Sorry, an error occurred while processing your message. Please try again.")
        return Response(content=error_twiml, media_type="application/xml")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": app.version,
        "timestamp": datetime.now().isoformat()
    }


@app.get("/debug/sessions")
async def debug_sessions():
    """Return sanitized active session data for debugging"""
    try:
        sanitized_sessions = {
            phone: {
                k: (v if k != "user_token" else "***")  # Mask tokens
                for k, v in session.items()
            }
            for phone, session in user_sessions.items()
        }
        return {
            "active_sessions": len(sanitized_sessions),
            "sessions": sanitized_sessions
        }
    except Exception as e:
        logger.error(f"Error fetching sessions: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8001)
