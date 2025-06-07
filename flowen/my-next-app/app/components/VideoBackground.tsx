'use client';

export default function VideoBackground() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-1/2 left-1/2 min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover brightness-[0.6] saturate-[1.2] contrast-[1.05] z-0"
      >
        <source src="/videos/surfing-background.mp4" type="video/mp4" />
      </video>
      <div className="relative z-10 text-white text-center pt-40 px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Välkommen till Flowen</h1>
        <p className="text-lg md:text-2xl">En plats för fokus, flöde och tillväxt.</p>
      </div>
    </div>
  );
}
