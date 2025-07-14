import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Send verification request received');
    
    const { email, acceptMarketing, type } = await request.json();
    
    // Validera input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Generera verification token
    const verificationToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 timmar
    
    console.log('✅ Generating verification for:', email);
    console.log('🎯 Type:', type || 'file-sharing');
    
    // Skapa verification URL baserat på typ
    let verificationUrl;
    let emailSubject;
    let emailContent;
    
    if (type === 'trial') {
      // Trial verification
      verificationUrl = `${getBaseUrl()}/verify-trial?token=${verificationToken}&email=${encodeURIComponent(email)}`;
      emailSubject = '🎉 Activate your Flowen 14-day free trial';
      emailContent = createTrialEmailContent(email, verificationUrl);
    } else {
      // Standard file sharing verification (din befintliga logik)
      verificationUrl = `${getBaseUrl()}/verify?token=${verificationToken}&email=${encodeURIComponent(email)}`;
      emailSubject = '📎 Verify your email to share files securely';
      emailContent = createFileShareEmailContent(email, verificationUrl);
    }
    
    // Här skulle du spara token i databas (för nu simulerar vi)
    // await saveVerificationToken(email, verificationToken, type, expiresAt);
    console.log('💾 TODO: Save verification token to database');
    console.log('🔑 Token:', verificationToken);
    console.log('⏰ Expires:', expiresAt.toISOString());
    
    // Skicka email via Microsoft Graph (återanvänd din befintliga email-kod)
    try {
      await sendEmailViaGraph({
        to: email,
        subject: emailSubject,
        htmlContent: emailContent
      });
      
      console.log('✅ Verification email sent successfully');
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Verification email sent',
      email: email,
      type: type || 'file-sharing',
      expiresAt: expiresAt.toISOString()
    });
    
  } catch (error) {
    console.error('❌ Send verification error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to send verification email. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper functions
function generateVerificationToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) + 
         Date.now().toString(36);
}

function getBaseUrl(): string {
  // Detect environment
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Server-side detection
  if (process.env.NODE_ENV === 'production') {
    return 'https://flowen.eu';
  }
  
  return 'http://localhost:3000';
}

function createTrialEmailContent(email: string, verificationUrl: string): string {
  return `
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 20px;">
      
      <p style="background: #f0f0f0; padding: 10px; border-radius: 5px; font-size: 12px; color: #666;">
        <strong>Having trouble viewing this email? <a href="${verificationUrl}">Click here to activate your trial directly</a></strong>
      </p>
      
      <h2>🎉 Welcome to Flowen!</h2>
      
      <p>Hi! You've requested a 14-day free trial for: <strong>${email}</strong></p>
      
      <div style="background: #007bff; padding: 15px; text-align: center; margin: 20px 0; border-radius: 5px;">
        <a href="${verificationUrl}" style="color: white; text-decoration: none; font-size: 16px; font-weight: bold;">
          🚀 ACTIVATE YOUR 14-DAY FREE TRIAL
        </a>
      </div>
      
      <p>Or copy this link: <br><strong>${verificationUrl}</strong></p>
      
      <p>What you get:</p>
      <ul>
        <li>🔐 End-to-end encrypted file sharing</li>
        <li>👥 Team management and collaboration</li>
        <li>📄 Project tools and Kanban boards</li>
      </ul>
      
      <p><small>Link expires in 24 hours for security.</small></p>
      <p><strong>Flowen.eu</strong> - Secure project management for teams</p>
    </body>
    </html>
  `;
}

function createFileShareEmailContent(email: string, verificationUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify your email for secure file sharing</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; color: white; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px;">📎 Verify Your Email</h1>
        <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Secure file sharing with Flowen</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
        <h2 style="color: #333; margin-top: 0;">Almost ready to share files!</h2>
        <p>Hi! 👋</p>
        <p>You've requested to share files securely using <strong>${email}</strong>.</p>
        <p>Click the button below to verify your email and proceed with secure file upload:</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" 
           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                  color: white; 
                  padding: 15px 30px; 
                  text-decoration: none; 
                  border-radius: 8px; 
                  font-weight: bold; 
                  font-size: 16px; 
                  display: inline-block;">
          🔐 Verify Email & Upload Files
        </a>
      </div>
      
      <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #4caf50;">
        <h3 style="color: #2e7d32; margin-top: 0;">🔒 Your security matters</h3>
        <p style="margin-bottom: 0; color: #666;">
          All files are encrypted with military-grade AES-256 encryption before upload. 
          Only you and your recipients can access them.
        </p>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
        <p>This link expires in 24 hours for security reasons.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p style="margin-top: 20px;">
          <strong>Flowen.eu</strong> - Secure file sharing you can trust
        </p>
      </div>
      
    </body>
    </html>
  `;
}

async function sendEmailViaGraph(emailData: {
  to: string;
  subject: string;
  htmlContent: string;
}) {
  try {
    console.log('📧 Sending email via Microsoft Graph...');
    console.log('📬 To:', emailData.to);
    console.log('📋 Subject:', emailData.subject);

    // Microsoft Graph credentials från .env.local
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const tenantId = process.env.TENANT_ID;

    if (!clientId || !clientSecret || !tenantId) {
      throw new Error('Missing Microsoft Graph credentials in .env.local');
    }

    // Få access token
    const tokenResponse = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials'
      })
    });

    if (!tokenResponse.ok) {
      throw new Error(`Token request failed: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Skicka email via Microsoft Graph
    const emailPayload = {
      message: {
        subject: emailData.subject,
        body: {
          contentType: 'HTML',
          content: emailData.htmlContent
        },
        toRecipients: [
          {
            emailAddress: {
              address: emailData.to
            }
          }
        ]
      }
    };

    const emailResponse = await fetch(`https://graph.microsoft.com/v1.0/users/${process.env.SENDER_EMAIL}/sendMail`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(emailPayload)
});

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      throw new Error(`Email send failed: ${emailResponse.status} - ${errorText}`);
    }

    console.log('✅ Email sent successfully via Microsoft Graph');
    return { success: true };

  } catch (error) {
    console.error('❌ Microsoft Graph email error:', error);
    throw error;
  }
}

// GET method för att hantera fel requests
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to send verification email.' },
    { status: 405 }
  );
}