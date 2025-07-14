// app/api/send-files/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Microsoft Graph configuration (samma som i send-verification)
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const TENANT_ID = process.env.TENANT_ID;

// Get access token (kopierad från send-verification)
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

// Send email via Graph API (modifierad för HTML)
async function sendEmail(recipientEmail: string, subject: string, htmlContent: string) {
  try {
    console.log('Getting access token...');
    const accessToken = await getAccessToken();
    console.log('Access token received');
  
    const emailData = {
      message: {
        subject: subject,
        body: {
          contentType: 'HTML',  // Ändrat till HTML
          content: htmlContent
        },
        toRecipients: [{
          emailAddress: {
            address: recipientEmail
          }
        }]
      }
    };

    const systemEmail = process.env.SENDER_EMAIL || "info@flowen.eu";
    console.log('Sending email from:', systemEmail);
    console.log('Sending email to:', recipientEmail);

    await axios.post(`https://graph.microsoft.com/v1.0/users/${systemEmail}/sendMail`, 
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
    console.error('Send email error:', error.response?.data || error.message);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { senderName, senderEmail, recipientEmail, message, files } = body;

    console.log('Sending files:', {
      from: `${senderName} <${senderEmail}>`,
      to: recipientEmail,
      fileCount: files.length
    });

    // Skapa snygg HTML email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f7f7f7; }
          .file-box { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .button { display: inline-block; background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Files Shared via Flowen</h1>
          </div>
          <div class="content">
            <p><strong>${senderName}</strong> has shared ${files.length} file(s) with you.</p>
            ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
            
            <h3>Your Files:</h3>
            ${files.map((file: { name: string, size: number, shareUrl: string }) => `
              <div class="file-box">
                <strong>${file.name}</strong><br>
                Size: ${(file.size / 1024 / 1024).toFixed(2)} MB<br>
                <a href="${file.shareUrl}" class="button">Download File</a>
              </div>
            `).join('')}
            
            <p><em>Links expire in 7 days. Download your files soon!</em></p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Skicka email
    await sendEmail(
      recipientEmail,
      `${senderName} shared files with you via Flowen`,
      emailHtml
    );

    return NextResponse.json({
      success: true,
      message: 'Files sent successfully',
      sentTo: recipientEmail,
      fileCount: files.length
    });

  } catch (error) {
    console.error('Send files error:', error);
    return NextResponse.json(
      { error: 'Failed to send files' },
      { status: 500 }
    );
  }
}