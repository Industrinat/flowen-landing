export default function ThankYou() {
  return (
    <main className="relative w-full min-h-screen text-white bg-gradient-to-b from-indigo-950 via-indigo-900 to-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white/10 backdrop-blur rounded-2xl p-12 shadow-xl border border-white/10">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-4xl font-bold mb-4">Thank You!</h1>
          <p className="text-xl text-indigo-300 mb-8">
            Your message has been sent successfully. We'll get back to you within 24 hours.
          </p>
          <div className="space-y-4">
            <a href="/" className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-8 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200">
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}