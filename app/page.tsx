import HowItWorks from '../components/HowItWorks'
import Testimonials from '../components/Testimonials'

export default function Home() {
  return (
    <main className="relative w-full min-h-screen overflow-hidden text-white bg-gradient-to-b from-indigo-950 via-indigo-900 to-slate-950">

      {/* Header med logga och hero */}
      <header className="flex flex-col items-center justify-center pt-16 pb-8">
        <img
          src="/logo.png"
          alt="Flowen logotype"
          className="h-32 w-auto max-w-xs"
        />
        <h1 className="mt-10 text-4xl md:text-6xl font-extrabold text-center drop-shadow-lg leading-tight">
          Next gen CRM for modern teams
        </h1>
        {/* Animerad linje */}
        <div
          className="mx-auto mt-4 mb-2 h-1 w-32 rounded-full"
          style={{
            background: "linear-gradient(90deg, #818cf8, #4ade80, transparent, transparent, #38bdf8, #818cf8)",
            backgroundSize: "400% 100%",
            animation: "moveGradientVanish 6s linear infinite"
          }}
        ></div>
        <span className="mt-2 text-xl md:text-2xl text-indigo-300 font-semibold tracking-wide block">
          Performance, non stop.
        </span>
        <a
          href="#"
          className="mt-8 px-8 py-4 bg-white text-black font-bold rounded-2xl shadow-xl hover:bg-gray-100 transition"
        >
          Start now
        </a>
      </header>

      {/* Innehåll */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[40vh] text-center px-4 py-12">
        <HowItWorks />

        {/* Kontaktformulär + Video sida vid sida */}
        <div className="mt-16 flex flex-col md:flex-row w-full max-w-6xl mx-auto gap-8">
          {/* Formulär */}
          <form
            action="https://formspree.io/f/myzwpajk"
            method="POST"
            className="w-full md:w-1/2 bg-white bg-opacity-90 text-black p-6 rounded-xl shadow"
          >
            <h2 className="text-xl font-semibold mb-4 text-left">Contact</h2>
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
              ></textarea>
            </label>
            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
            >
              Skicka
            </button>
          </form>

          {/* Video */}
          <div className="w-full md:w-1/2 rounded-xl overflow-hidden shadow-lg">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover brightness-[0.5]"
            >
              <source src="/videos/surfing-background.mp4" type="video/mp4" />
            </video>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-16 w-full flex justify-center">
          <Testimonials />
        </div>
      </div>
    </main>
  )
}
