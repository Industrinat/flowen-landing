export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden text-white">
      {/* Videobakgrund */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-1/2 left-1/2 min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover z-0 brightness-[0.5]"
      >
        <source src="/videos/surfing-background.mp4" type="video/mp4" />
      </video>

      {/* Text och knapp ovanpå */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg">Välkommen till Flowen</h1>
        <p className="text-lg md:text-2xl mt-4 drop-shadow">Surfing through clarity, code & flow.</p>
        <a
          href="#"
          className="mt-8 px-6 py-3 bg-white text-black font-semibold rounded-xl shadow hover:bg-gray-100 transition"
        >
          Kom igång
        </a>
      </div>
    </main>
  );
}
