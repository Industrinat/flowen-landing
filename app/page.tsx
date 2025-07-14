"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import styles from './page.module.css';
import { BarChart3, Users, Clock, ArrowRight, Shield, FileText, Star } from 'lucide-react';

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Trial signup state
  const [email, setEmail] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isTrialLoading, setIsTrialLoading] = useState(false);
  const [trialError, setTrialError] = useState('');
  const [trialStep, setTrialStep] = useState(1); // 1: signup, 2: check email, 3: verified

  // Trial success state
  const [showTrialSuccess, setShowTrialSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const searchParams = useSearchParams();

  // Handle trial success from email verification
  useEffect(() => {
    const trialActivated = searchParams.get('trial-activated');
    const emailParam = searchParams.get('email');
    
    if (trialActivated === 'true' && emailParam) {
      setShowTrialSuccess(true);
      setUserEmail(emailParam);
      
      // Ta bort parameters från URL efter 5 sekunder
      setTimeout(() => {
        window.history.replaceState({}, '', '/');
        setShowTrialSuccess(false);
      }, 5000);
    }
  }, [searchParams]);

  const handleTrialSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setTrialError('Please enter your email address');
      return;
    }

    if (!acceptTerms) {
      setTrialError('You must accept our terms to start your free trial');
      return;
    }

    setIsTrialLoading(true);
    setTrialError('');

    try {
      // Send verification email instead of activating trial directly
      const response = await fetch('/api/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          acceptMarketing: acceptTerms,
          type: 'trial' // Indicate this is for trial signup
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTrialStep(2); // Move to "check email" step
      } else {
        setTrialError(data.error || 'Failed to send verification email. Please try again.');
      }
    } catch (error) {
      console.error('Trial signup error:', error);
      setTrialError('Network error. Please try again.');
    } finally {
      setIsTrialLoading(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log('Form submitted!');
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
      gdpr_consent: formData.get('gdpr_consent') === 'on'
    };

    console.log('Data to send:', data);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const result = await response.json();
      console.log('Result:', result);
      if (response.ok) {
        console.log('SUCCESS - about to redirect');
        console.log('Current location:', window.location.href);
        window.location.href = '/thank-you';
        console.log('Redirect command sent');
        return;
      } else {
        console.log('RESPONSE NOT OK');
        setSubmitMessage('Error: ' + result.error);
      }
    } catch (error) {
      console.log('Catch error:', error);
      setSubmitMessage('Error sending message. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden text-white bg-gradient-to-b from-indigo-950 via-indigo-900 to-slate-950">
      
      {/* Trial Success Banner */}
      {showTrialSuccess && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-green-500 text-white p-4 text-center shadow-lg">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold">🎉 Trial Activated Successfully!</h2>
            <p className="mt-1">
              Welcome {userEmail}! Your 14-day free trial is now active.
            </p>
            <button 
              onClick={() => setShowTrialSuccess(false)}
              className="ml-4 text-green-100 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <header className="flex flex-col items-center justify-center pt-16 pb-8">
        
        {/* Badge */}
        <div className="inline-flex items-center px-4 py-2 bg-blue-100/20 text-blue-300 rounded-full text-sm font-medium mb-6">
          <Star className="w-4 h-4 mr-2" />
          Secure project management for teams
        </div>
  
        <h1 className="mt-6 text-4xl md:text-6xl font-extrabold text-center drop-shadow-lg leading-tight">
          Project management and CRM for teams
        </h1>
        <div className={styles.customline}></div>
        <span className="mt-2 text-l md:text-2xl text-indigo-300 font-semibold tracking-wide block">
          End-to-end encrypted file sharing with team management
        </span>
      </header>

      {/* Trial Signup Section */}
      <div className={`mt-24 w-full flex justify-center ${showTrialSuccess ? 'mt-32' : ''}`}>
        <div className="max-w-4xl mx-auto p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20">
          
          {trialStep === 1 ? (
            /* Step 1: Email Signup */
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Try Flowen free for 14 days
                </h2>
                <p className="text-xl text-indigo-200 max-w-2xl mx-auto">
                  Get full access to secure file sharing, team management, and project collaboration tools.
                </p>
              </div>

              {/* Features Preview */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">End-to-End Encryption</h3>
                  <p className="text-white/70 text-sm">Military-grade AES-256 security</p>
                </div>

                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Team Management</h3>
                  <p className="text-white/70 text-sm">Collaborate securely with your team</p>
                </div>

                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">Project Tools</h3>
                  <p className="text-white/70 text-sm">Kanban boards and file management</p>
                </div>
              </div>

              {/* Trial Signup Form */}
              <div className="max-w-md mx-auto">
                <form onSubmit={handleTrialSignup} className="space-y-6">
                  <div>
                    <input
                      type="email"
                      placeholder="Enter your business email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-4 bg-white/20 backdrop-blur border border-white/30 rounded-xl text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-1 h-5 w-5 text-blue-500 bg-white/20 border-white/30 rounded focus:ring-blue-400"
                      required
                    />
                    <label htmlFor="acceptTerms" className="text-sm text-white/90 leading-relaxed">
                      I agree to receive product updates and accept the terms of service for my 14-day free trial.
                    </label>
                  </div>

                  {trialError && (
                    <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4">
                      <p className="text-red-200 text-sm">{trialError}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isTrialLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl transition duration-300 shadow-lg flex items-center justify-center"
                  >
                    {isTrialLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Start Free Trial
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </button>
                </form>

                <p className="text-center text-xs text-white/60 mt-4">
                  ✓ No credit card required ✓ Cancel anytime ✓ Full access
                </p>

                {/* Already have account? */}
                <div className="text-center mt-6">
                  <p className="text-white/70 text-sm">
                    Already have an account?{' '}
                    <a href="/login" className="text-blue-400 hover:text-blue-300 underline">
                      Sign in here
                    </a>
                  </p>
                </div>
              </div>
            </>
          ) : trialStep === 2 ? (
            /* Step 2: Check Email */
            <div className="max-w-md mx-auto text-center">
              <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📧</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Check Your Email!</h2>
              <p className="text-indigo-200 mb-6">
                We've sent a verification link to: <strong className="text-white">{email}</strong>
              </p>
              <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-4 mb-6">
                <p className="text-blue-300 text-sm">
                  🔐 Click the link in your email to activate your 14-day free trial<br/>
                  📧 Check your spam folder if you don't see it<br/>
                  ⏰ Link expires in 24 hours
                </p>
              </div>
              <p className="text-sm text-white/70 mb-8">
                You must click the link in your email to proceed with your trial.
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p className="text-sm text-white/60">Waiting for email verification...</p>
              
              {/* Back to signup option */}
              <button 
                onClick={() => {
                  setTrialStep(1);
                  setEmail('');
                  setAcceptTerms(false);
                  setTrialError('');
                }}
                className="mt-6 text-white/70 hover:text-white text-sm underline"
              >
                Use a different email address
              </button>
            </div>
          ) : (
            /* Step 3: Trial Success (after email verification) */
            <div className="max-w-md mx-auto text-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🎉</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Welcome to Flowen!</h2>
              <p className="text-indigo-200 mb-4">
                Your 14-day free trial has started for: <strong className="text-white">{email}</strong>
              </p>
              
              <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-4 mb-6">
                <p className="text-blue-300 text-sm mb-3">
                  ✅ Trial activated<br/>
                  🔐 End-to-end encryption enabled<br/>
                  👥 Team features unlocked<br/>
                  📄 Project tools ready
                </p>
              </div>

              <div className="space-y-3">
                <a 
                  href="/login"
                  className="block w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl transition duration-300 shadow-lg"
                >
                  Sign In & Start Using Flowen
                </a>
              </div>

              <p className="text-xs text-white/60 mt-4">
                Your trial includes all premium features for 14 days
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Rest of your existing content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-12">
        <HowItWorks />
        
        <section className="w-full py-8 mt-12">
          <div className="max-w-3xl mx-auto px-4">
            <div className="relative pt-[56.25%]">
              <iframe
                src="https://player.vimeo.com/video/1089639271?h=8ff109a510&badge=0&autopause=0&player_id=0&app_id=58479"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                title="Flowen Intro"
                className="absolute top-0 left-0 w-full h-full rounded-xl shadow-xl"
              ></iframe>
            </div>
          </div>
        </section>
        
        <section className="w-full py-20 bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-950 text-white">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Insights you can act on
            </h2>
            <p className="text-lg text-indigo-300 mb-12 max-w-2xl mx-auto">
              Flowen helps you see patterns across projects, clients, and teams — so you can make smarter decisions, faster.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 shadow-xl border border-white/10">
                <div className="flex items-center justify-center mb-4">
                  <BarChart3 className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Open Deals</h3>
                <p className="text-4xl font-bold text-green-400 mb-1">37</p>
                <p className="text-sm text-indigo-200">↑ 12% this month</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 shadow-xl border border-white/10">
                <div className="flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Client Activity</h3>
                <p className="text-4xl font-bold text-yellow-400 mb-1">128</p>
                <p className="text-sm text-indigo-200">Last 7 days</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 shadow-xl border border-white/10">
                <div className="flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Avg. Response Time</h3>
                <p className="text-4xl font-bold text-blue-400 mb-1">1h 45m</p>
                <p className="text-sm text-indigo-200">Across all leads</p>
              </div>
            </div>
          </div>
        </section>
        
        <div className="mt-16 w-full flex justify-center">
          <Testimonials />
        </div>
        
        <section className="w-full py-16 bg-gradient-to-b from-slate-950 via-indigo-950 to-indigo-900 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">🎙 Flowen Talks</h2>
            <p className="text-lg md:text-xl text-indigo-200 mb-8">
              Short, visual episodes where we share what drives Flowen — starting with what matters most: your data.
            </p>
            <div className="relative pt-[56.25%] rounded-xl overflow-hidden shadow-2xl">
              <iframe
                src="https://player.vimeo.com/video/1089666568?h=a5282fb83b&badge=0&autopause=0&player_id=0&app_id=58479"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                title="Flowen Talks – Ep. 01: The Heart of Flowen"
                className="absolute top-0 left-0 w-full h-full"
              ></iframe>
            </div>
          </div>
        </section>
        
        <div className="mt-16 flex flex-col md:flex-row w-full max-w-6xl mx-auto gap-8">
          <div className="w-full md:w-1/2">
            <form
              onSubmit={handleContactSubmit}
              className="bg-white bg-opacity-90 text-black p-6 rounded-xl shadow"
            >
              <h2 className="text-xl font-semibold mb-4 text-left">Contact</h2>
              {submitMessage && (
                <div className={`mb-4 p-3 rounded ${submitMessage.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {submitMessage}
                </div>
              )}
              <label className="block mb-3 text-left">
                <span className="text-sm font-medium">Name</span>
                <input
                  type="text"
                  name="name"
                  required
                  className="mt-1 w-full border px-3 py-2 rounded focus:outline-none focus:ring"
                />
              </label>
              <label className="block mb-3 text-left">
                <span className="text-sm font-medium">E-mail</span>
                <input
                  type="email"
                  name="email"
                  required
                  className="mt-1 w-full border px-3 py-2 rounded focus:outline-none focus:ring"
                />
              </label>
              <label className="block mb-4 text-left">
                <span className="text-sm font-medium">Message</span>
                <textarea
                  name="message"
                  rows={4}
                  required
                  className="mt-1 w-full border px-3 py-2 rounded focus:outline-none focus:ring"
                />
              </label>
              <label className="block mb-4 text-left">
                <input
                  type="checkbox"
                  name="gdpr_consent"
                  required
                  className="mr-2"
                />
                <span className="text-sm">
                  I agree that my personal data will be processed solely for the purpose of contacting me about Flowen. Read our
                  <a href="/privacy-policy" className="underline text-indigo-600 hover:text-indigo-400 ml-1">privacy policy</a>.
                </span>
              </label>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
          <div className="w-full md:w-1/2 rounded-xl overflow-hidden shadow-lg">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover brightness-[0.9]"
            >
              <source src="/videos/surfing-background.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </div>
  );
}