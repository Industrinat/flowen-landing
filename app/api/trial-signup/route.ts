import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 Trial signup request received');
    
    const { email, acceptMarketing } = await request.json();
    
    // Validera input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    if (!acceptMarketing) {
      return NextResponse.json(
        { error: 'You must accept the terms to start your trial' },
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

    console.log('✅ Trial signup for:', email);
    
    // Här kan du senare lägga till:
    // - Spara till databas
    // - Skicka welcome email
    // - Skapa temporär användare
    // - Sätta trial period (14 dagar)
    
    // För nu, bara simulera framgång
    const trialStartDate = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);
    
    // Optional: Skicka email via Microsoft Graph (som din befintliga email-funktionalitet)
    try {
      // Du kan återanvända din Microsoft Graph email-kod från andra API routes
      console.log('📧 TODO: Send welcome email to:', email);
    } catch (emailError) {
      console.warn('⚠️ Email sending failed, but trial still activated:', emailError);
      // Fortsätt även om email misslyckas
    }
    
    return NextResponse.json({
      success: true,
      message: 'Trial activated successfully',
      email: email,
      trialStartDate: trialStartDate.toISOString(),
      trialEndDate: trialEndDate.toISOString(),
      trialDays: 14
    });
    
  } catch (error) {
    console.error('❌ Trial signup error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to start trial. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET method för att hantera fel requests
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to start trial.' },
    { status: 405 }
  );
}