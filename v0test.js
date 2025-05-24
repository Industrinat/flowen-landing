const fetch = require('node-fetch');

const apiKey = 'v1:B0hYyO1TOymWEE7ro0uOdqjZ:zIIWIJQkpFxWBczs6qm0Fave';

async function callV0() {
  try {
    const response = await fetch('https://api.v0.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "v0-1.0-md",
        messages: [
          { role: "user", content: "Create a Next.js landing page for a CRM system called Flowen. Use Tailwind and shadcn/ui." }
        ]
      })
    });

    if (!response.ok) {
      console.error("API ERROR:", response.status, await response.text());
      return;
    }

    const data = await response.json();
    console.log("RESULTAT FRÅN V0:");
    console.log(data.choices[0].message.content);
  } catch (err) {
    console.error("FEL VID ANROP:", err);
  }
}

callV0();
