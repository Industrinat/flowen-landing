import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { name, email, message, gdpr_consent } = await request.json();

    if (!name || !email || !message || !gdpr_consent) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Get access token
    const tokenResponse = await fetch('https://login.microsoftonline.com/' + process.env.AZURE_TENANT_ID + '/oauth2/v2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.AZURE_CLIENT_ID!,
        client_secret: process.env.AZURE_CLIENT_SECRET!,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials'
      })
    });

    const tokenData = await tokenResponse.json();

    // Send email via Graph API
    const emailResponse = await fetch('https://graph.microsoft.com/v1.0/users/info@flowen.eu/sendMail', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: {
          subject: `Contact Form: ${name}`,
          body: {
            contentType: 'Text',
            content: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
          },
          toRecipients: [{
            emailAddress: { address: 'info@flowen.eu' }
          }],
          replyTo: [{
            emailAddress: { address: email, name: name }
          }]
        }
      })
    });

    if (!emailResponse.ok) {
      throw new Error('Failed to send email');
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you! We will contact you soon.'
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
