import React from "react";
import HowItWorks from '../components/HowItWorks'
import Testimonials from '../components/Testimonials'
import styles from './page.module.css'   // Importera CSS-modulen!

export default function Home() {
  return (
    <main className="relative w-full min-h-screen overflow-hidden text-white bg-gradient-to-b from-indigo-950 via-indigo-900 to-slate-950">

      {/* Header med logga, vit platta och hero */}
      <header className="flex flex-col items-center justify-center pt-16 pb-8">
        {/* Platta + logga */}
        <div className="relative flex items-center justify-center mb-4" style={{ height: 160 }}>
          {/* Vit, rundad platta med skugga */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-28 bg-white rounded-3xl shadow-2xl z-0" />
          {/* Stor logga */}
          <img
            src="/logoFlowen.png"
            alt="Flowen logotype"
            className="relative z-10 h-40 w-auto max-w-xs"
            style={{ background: "none" }}
          />
        </div>
        {/* Rubrik, linje, tagline, knapp */}
        <h1 className="mt-6 text-4xl md:text-6xl font-extrabold text-center drop-shadow-lg leading-tight">
          Next generation CRM for modern teams
        </h1>
        {/* Animerad linje */}
        <div className={styles.customline}></div>
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
              Send
            </button>
          </form>

          {/* Video */}
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

        {/* Testimonials */}
        <div className="mt-16 w-full flex justify-center">
          <Testimonials />
        </div>
      </div>
    </main>
  )
}
