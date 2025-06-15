'use client';

import React, { useState, useEffect } from 'react';
import { FlowenEmailVerification } from './FlowenEmailVerification';
import DemoUpload from './DemoUpload';

export function FlowenUploadFlow() {
  const [step, setStep] = useState(1);
  const [userEmail, setUserEmail] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  // Kontrollera URL-parametrar för verifiering
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const verified = urlParams.get('verified');
    const email = urlParams.get('email');
    
    if (verified === 'true' && email) {
      setUserEmail(email);
      setIsVerified(true);
      setStep(3); // Gå direkt till upload
    }
  }, []);

  const handleEmailSubmit = (email: string) => {
    setUserEmail(email);
    setStep(2); // Gå till "email sent" steg
  };

  const handleVerificationComplete = () => {
    setIsVerified(true);
    setStep(3); // Gå till upload
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        
        {/* Flowen Header - samma på alla steg */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Flowen</h1>
          <p className="text-xl text-gray-600 mb-2">Secure File Sharing Made Simple</p>
        </div>

        <div className="max-w-2xl mx-auto">
          
          {/* Steg 1: E-postverifiering */}
          {step === 1 && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 1: Verify Your Email</h2>
                <p className="text-gray-600">Enter your email to start sharing files</p>
              </div>
              <FlowenEmailVerification onEmailSent={handleEmailSubmit} />
            </div>
          )}

          {/* Steg 2: E-post skickad */}
          {step === 2 && (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📧</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Check Your Email!</h2>
              <p className="text-gray-600 mb-6">
                We've sent a verification link to: <strong>{userEmail}</strong>
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Click the link in your email to continue to file upload.
              </p>
              <button 
                onClick={handleVerificationComplete}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
              >
                I've verified my email
              </button>
            </div>
          )}

          {/* Steg 3: Filuppladdning */}
          {step === 3 && isVerified && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 2: Upload Your File</h2>
                <p className="text-gray-600">Verified: {userEmail}</p>
              </div>
              <DemoUpload userEmail={userEmail} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}