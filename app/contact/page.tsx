"use client";
import { useState } from 'react';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function Contact() {
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

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const responseData = await response.json();
      console.log('Response data:', responseData);

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
    <main className="relative w-full min-h-screen text-white bg-gradient-to-b from-indigo-950 via-indigo-900 to-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-indigo-300">
            Get in touch about enterprise security features
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-2xl p-8 shadow-xl border border-white/10">
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
                placeholder="Tell us about your security requirements..."
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
                  I agree to the processing of my personal data according to Flowen's{' '}
                  <Link href="/privacy-policy" className="text-indigo-300 hover:text-indigo-200 underline">
                    Privacy Policy
                  </Link>
                  . This is required to process your inquiry. *
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
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/70">
              🔒 Your data is processed securely and in full compliance with GDPR regulations.
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link href="/" className="text-indigo-300 hover:text-white transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
