const apiKey = 'v1:B0hYyO1TOymWEE7ro0uOdqjZ:zIIWIJQkpFxWBczs6qm0Fave';
import fs from 'fs';

console.log("STARTAR API-ANROP...");

async function callV0() {
  try {
    const url = 'https://api.v0.dev/v1/chat/completions';
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };
    const body = JSON.stringify({
      model: "v0-1.0-md",
      messages: [
        {
          role: "user",
          content: "Generate a responsive testimonial section as a React component for a SaaS landing page. Use shadcn/ui cards and Tailwind CSS. Output only the code, and nothing else."
        }
      ]
    });

    console.log("SÄNDER REQUEST...");
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body
    });

    console.log("FICK RESPONSE, STATUS:", response.status);

    if (!response.ok) {
      const text = await response.text();
      console.error("API ERROR:", response.status, text);
      return;
    }

    const data = await response.json();
    console.log("SVAR FRÅN API:", JSON.stringify(data, null, 2));
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      fs.writeFileSync('v0-output.txt', data.choices[0].message.content);
      console.log('Kod sparad till v0-output.txt!');
    } else {
      console.log("INGEN KOD RETURNERAD!");
    }
  } catch (err) {
    console.error("FEL VID ANROP:", err);
  }
}

callV0();
