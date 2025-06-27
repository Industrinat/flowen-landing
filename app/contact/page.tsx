export default function Contact() {
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
          <form action="https://formspree.io/f/myzwpajk" method="POST" className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                name="name"
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
                required
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                name="message"
                rows={5}
                required
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Tell us about your security requirements..."
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              Send Message
            </button>
          </form>
        </div>

        <div className="text-center mt-8">
          <a href="/" className="text-indigo-300 hover:text-white transition-colors">
            ← Back to Home
          </a>
        </div>
      </div>
    </main>
  );
}