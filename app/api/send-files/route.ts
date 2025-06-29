// app/api/send-files/route.ts
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

export async function POST(req: NextRequest) {
  try {
    const { senderName, senderEmail, recipientEmail, message, files } = await req.json();
    
    console.log('Send files request:', { senderName, senderEmail, recipientEmail, filesCount: files?.length });

    if (!senderName || !senderEmail || !recipientEmail || !files || !Array.isArray(files)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: senderName, senderEmail, recipientEmail, files' 
      }, { status: 400 });
    }

    const filesList = files.map((file: any) => 
      `• ${file.name} (${(file.size / 1024).toFixed(1)} KB)\n  Download: ${file.shareUrl}`
    ).join('\n\n');
  
    const emailContent = `Hello!

${senderName} (${senderEmail}) has shared ${files.length} file(s) with you via Flowen.

${message ? `Message: "${message}"` : ''}

Files:
${filesList}

These links will expire in 7 days.

Best regards,
Flowen File Sharing`;
  
    const subject = `${senderName} shared ${files.length} file(s) with you`;
    const systemEmail = process.env.SENDER_EMAIL || "info@flowen.eu";
  
    await sendEmail(systemEmail, recipientEmail, subject, emailContent);
  
    console.log(`Email sent to ${recipientEmail} from ${systemEmail} via Microsoft Graph`);
  
    // Log email activity
    const emailLog = {
      timestamp: new Date(),
      type: 'file_sharing',
      senderName,
      senderEmail, 
      recipientEmail,
      filesCount: files.length,
      fileNames: files.map((f: any) => f.name),
      message: message || null
    };
    
    // Create logs directory if it doesn't exist
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    fs.appendFileSync(path.join(logsDir, 'email-activity.json'), JSON.stringify(emailLog) + '\n');
    console.log('Email activity logged');
  
    return NextResponse.json({ 
      success: true, 
      message: `Files sent to ${recipientEmail}`,
      filesCount: files.length
    });

  } catch (error: any) {
    console.error('Send files error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to send files: ' + error.message 
    }, { status: 500 });
  }
}