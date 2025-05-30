export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-950 via-indigo-900 to-slate-950 text-white px-6 py-16">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-lg mb-4">
          We only use the information you provide in this form to contact you about Flowen.
          You will never receive more than one email per month. Your personal data will not be stored for any other purposes.
        </p>
        <p className="text-lg mb-4">
          If you become a customer, applicable laws such as the Swedish Accounting Act (bokföringslagen) will apply to any necessary data retention.
        </p>
        <p className="text-lg mb-4">
          You can opt out at any time or request information about your stored data by contacting us at{" "}
          <a href="mailto:privacy@flowen.eu" className="underline text-indigo-300 hover:text-indigo-100">
            privacy@flowen.eu
          </a>.
        </p>
        <p className="text-sm text-slate-400 mt-6">This policy is effective as of May 2025. We reserve the right to update this policy if necessary.</p>

        {/* Back to Home button */}
        <div className="mt-12">
          <a
            href="/"
            className="inline-block px-6 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </main>
  );
}
