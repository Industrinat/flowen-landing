import SurfingScene from "../components/SurfingScene";

export default function Home() {
  return (
    <main style={{ maxWidth: 700, margin: "0 auto", padding: 20, textAlign: "center" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>Välkommen till Flowen!</h1>

      {/* Animationen */}
      <div style={{ marginBottom: 40 }}>
        <SurfingScene />
      </div>

      {/* Placeholder för mer innehåll senare */}
      <p>Här kan du lägga till mer innehåll senare</p>
    </main>
  );
}

