// app/api/send-verification/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Microsoft Graph configuration
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const TENANT_ID = process.env.TENANT_ID;

// Get access token
async function getAccessToken() {
  try {
    const response = await axios.post(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`, 
      new URLSearchParams({
        client_id: CLIENT_ID!,
        client_secret: CLIENT_SECRET!,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials'
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data.access_token;
  } catch (error: any) {
    console.error('Token error:', error.response?.data || error.message);
    throw error;
  }
}

// Send email via Graph API
async function sendEmail(senderEmail: string, recipientEmail: string, subject: string, content: string) {
  try {
    console.log('Getting access token...');
    const accessToken = await getAccessToken();
    console.log('Access token received');
  
    const emailData = {
      message: {
        subject: subject,
        body: {
          contentType: 'Text',
          content: content
        },
        toRecipients: [{
          emailAddress: {
            address: recipientEmail
          }
        }]
      }
    };

    console.log('Sending email from:', senderEmail);
    console.log('Sending email to:', recipientEmail);

    await axios.post(`https://graph.microsoft.com/v1.0/users/${senderEmail}/sendMail`, 
      emailData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
  
    console.log('Email sent successfully via Microsoft Graph');
    return true;
  } catch (error: any) {
    console.error('Send email error details:');
    console.error('Status:', error.response?.status);
    console.error('Error data:', JSON.stringify(error.response?.data, null, 2));
    throw error;
  }
}

// Smart URL detection function
const getBaseUrl = (req: NextRequest) => {
  const origin = req.headers.get('origin') || req.headers.get('referer');
  console.log('Request origin:', origin);
  
  if (origin && origin.includes('localhost')) {
    return 'http://localhost:3000';
  }
  return 'https://flowen.eu';
};

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    console.log('Sending verification email to:', email);

    // Log verification email activity
    const emailLog = {
      timestamp: new Date(),
      type: 'verification',
      email: email
    };
    
    // Create logs directory if it doesn't exist
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    fs.appendFileSync(path.join(logsDir, 'email-activity.json'), JSON.stringify(emailLog) + '\n');
    console.log('Verification email activity logged');

    // Smart URL detection
    const baseUrl = getBaseUrl(req);
    const verificationLink = `${baseUrl}/?email=${encodeURIComponent(email)}&verified=true`;

    console.log('Base URL detected:', baseUrl);
    console.log('Verification link:', verificationLink);

    const subject = "Flowen - Email Verification";
    const emailContent = `Hello!

Welcome to Flowen file sharing.

Click the link below to verify your email and start uploading files:

${verificationLink}

Best regards,
Flowen Team`;

    const systemEmail = process.env.SENDER_EMAIL || "info@flowen.eu";

    await sendEmail(systemEmail, email, subject, emailContent);

    return NextResponse.json({ 
      success: true, 
      message: 'Verification email sent',
      email: email,
      baseUrl: baseUrl
    });
  } catch (error: any) {
    console.error('Email verification error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to send verification email: ' + error.message
    }, { status: 500 });
  }
}
