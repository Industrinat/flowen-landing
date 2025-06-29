
"use client";

import { EmailWithProTips } from "../components/EmailWithProTips";
import DemoUpload from "../components/DemoUpload";
import React, { useState } from "react";
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import styles from './page.module.css';
import { BarChart3, Users, Clock } from 'lucide-react';

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
    <main className="relative w-full min-h-screen overflow-hidden text-white bg-gradient-to-b from-indigo-950 via-indigo-900 to-slate-950">
      <header className="flex flex-col items-center justify-center pt-16 pb-8">
        <div className="relative flex items-center justify-center mb-4" style={{ height: 160 }}>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-28 bg-white rounded-3xl shadow-2xl z-0" />
          <img
            src="/logoFlowen.png"
            alt="Flowen logotype"
            className="relative z-10 h-40 w-auto max-w-xs"
            style={{ background: "none" }}
          />
        </div>
        <h1 className="mt-6 text-4xl md:text-6xl font-extrabold text-center drop-shadow-lg leading-tight">
          Projects and CRM for modern teams
        </h1>
        <div className={styles.customline}></div>
        <span className="mt-2 text-l md:text-2xl text-indigo-300 font-semibold tracking-wide block">
          Performance, non stop.
        </span>
      </header>

      <div className="mt-24 w-full flex justify-center">
        <EmailWithProTips />
      </div>

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
              onSubmit={handleSubmit}
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
    </main>
  );
}