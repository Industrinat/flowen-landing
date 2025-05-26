import HowItWorks from '../components/HowItWorks'
import Testimonials from '../components/Testimonials'

export default function Home() {
  return (
    <main className="relative w-full min-h-screen overflow-hidden text-white bg-gradient-to-b from-indigo-950 via-indigo-900 to-slate-950">
      {/* Logotyp */}
      <aside className="absolute top-6 right-8 z-20">
        <img
          src="/logo.png"
          alt="Flowen logotype"
          className="h-12 w-auto drop-shadow-md"
        />
      </aside>

      {/* Innehåll */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4 py-12">
        <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg mb-4">Välkommen till Flowen</h1>

        <HowItWorks />

        {/* Kontaktformulär + Video sida vid sida */}
        <div className="mt-12 flex flex-col md:flex-row w-full max-w-6xl mx-auto gap-8">
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
        <div className="mt-12 w-full flex justify-center">
          <Testimonials />
        </div>

        <p className="text-lg md:text-2xl mt-6 drop-shadow">Flowen. Performance non stop.</p>
        <a
          href="#"
          className="mt-8 px-6 py-3 bg-white text-black font-semibold rounded-xl shadow hover:bg-gray-100 transition"
        >
          Start now
        </a>
      </div>
    </main>
  )
}
