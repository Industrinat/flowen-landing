'use client';

import { useState } from 'react';

interface Props {
  onEmailSent: (email: string) => void;
}

export function FlowenEmailVerification({ onEmailSent }: Props) {
  const [email, setEmail] = useState('');
  const [acceptNewsletter, setAcceptNewsletter] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!acceptNewsletter) {
      setError('You must accept our monthly newsletter to use this free service');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      
      const response = await fetch(`${apiUrl}/send-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          acceptMarketing: acceptNewsletter,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onEmailSent(email); // Gå till nästa steg
      } else {
        setError(data.error || 'Failed to send verification email');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="your@email.com"
            required
          />
        </div>

        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="newsletter"
            checked={acceptNewsletter}
            onChange={(e) => setAcceptNewsletter(e.target.checked)}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            required
          />
          <label htmlFor="newsletter" className="text-sm text-gray-700">
            I accept to receive a monthly newsletter to use this free service. 
            <span className="text-gray-500 block mt-1">
              (Required - we'll send max 1 email per month with updates and tips)
            </span>
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
        >
          {isLoading ? 'Sending...' : 'Send Verification Email'}
        </button>
      </form>
    </div>
  );
}