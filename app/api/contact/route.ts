import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { name, email, message, gdpr_consent } = await request.json();
    console.log('Contact form submission:', { name, email, message, gdpr_consent });

    if (!name || !email || !message || !gdpr_consent) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Get access token
    const tokenResponse = await fetch('https://login.microsoftonline.com/' + process.env.TENANT_ID + '/oauth2/v2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.CLIENT_ID!,
        client_secret: process.env.CLIENT_SECRET!,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials'
      })
    });

    const tokenData = await tokenResponse.json();
    console.log('Token response status:', tokenResponse.status);

    if (!tokenResponse.ok) {
      console.error('Token error:', tokenData);
      throw new Error('Failed to get access token');
    }

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

    console.log('Email response status:', emailResponse.status);

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Graph API error:', errorText);
      throw new Error('Failed to send email');
    }

    console.log('Email sent successfully!');
    return NextResponse.json({
      success: true,
      message: 'Thank you! We will contact you soon.'
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}