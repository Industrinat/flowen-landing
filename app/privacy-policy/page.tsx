"use client";
import { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function PrivacyPolicy() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    gdpr_consent: false,
    newsletter_consent: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = target.checked;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    // resten av funktionen...
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        window.location.href = '/thank-you';
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error sending message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-indigo-950 via-indigo-900 to-slate-950 text-white px-6 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Privacy Policy Content */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
            <p className="text-lg mb-4">
              We only use the information you provide in this form to contact you about Flowen.
              You will never receive more than one email per month. Your personal data will not be stored for any other purposes.
            </p>
            <p className="text-lg mb-4">
              If you become a customer, applicable laws such as the Swedish Accounting Act (bokföringslagen) will apply to any necessary data retention.
            </p>
            <p className="text-lg mb-4">
              You can opt out at any time or request information about your stored data by using our contact form or contacting us through our website.
            </p>
            <p className="text-sm text-slate-400 mt-6">
              This policy is effective as of May 2025. We reserve the right to update this policy if necessary.
            </p>
          </div>

          {/* Contact Form */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-8 shadow-xl border border-white/10 mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">Have Privacy Questions?</h2>
            <p className="text-center text-indigo-300 mb-8">Contact us directly about your data privacy concerns</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Your privacy question or data request..."
                />
              </div>

              {/* GDPR Consent - Required */}
              <div className="space-y-4 border-t border-white/20 pt-6">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="gdpr_consent"
                    checked={formData.gdpr_consent}
                    onChange={handleChange}
                    required
                    className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded bg-white/20"
                  />
                  <label className="text-sm text-white/90 leading-relaxed">
                    I agree to the processing of my personal data according to this Privacy Policy. 
                    This is required to process your inquiry. *
                  </label>
                </div>

                {/* Newsletter Consent - Optional */}
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="newsletter_consent"
                    checked={formData.newsletter_consent}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded bg-white/20"
                  />
                  <label className="text-sm text-white/90 leading-relaxed">
                    I would like to receive updates about Flowen's security features and product news via email. 
                    <span className="text-white/70 block mt-1">
                      (Optional - you can unsubscribe at any time)
                    </span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Send Privacy Inquiry'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-white/70">
                🔒 Your data is processed securely and in full compliance with GDPR regulations.
              </p>
            </div>
          </div>

          {/* Back to Home button */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-block px-6 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
