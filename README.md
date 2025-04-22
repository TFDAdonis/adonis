<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Gaiadex</title>
  <link rel="stylesheet" href="style.css" />
  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet/dist/leaflet.css"
  />
</head>
<body>
  <header>
    <img src="assets/logo.png" alt="Gaiadex Logo" class="logo" />
    <h1>Gaiadex</h1>
    <p>Interactive Salinity Mapping with AI Assistance</p>
  </header>

  <main>
    <div id="map"></div>

    <section id="salinity-info">
      <h2>Salinity Data</h2>
      <p id="salinity-value">Click on the map to get salinity data.</p>
    </section>

    <section id="ai-assistant">
      <h2>AI Assistant</h2>
      <div id="chatbox">
        <div id="chat-log"></div>
        <input type="text" id="user-input" placeholder="Ask about salinity..." />
        <button id="send-btn">Send</button>
      </div>
    </section>
  </main>

  <footer>
    <p>&copy; 2025 Gaiadex. All rights reserved.</p>
  </footer>

  <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
  <script src="script.js"></script>
</body>
</html>
/* Global */
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background-color: #eef2f3;
  color: #333;
}

/* Header */
header {
  background-color: #2c3e50;
  color: white;
  padding: 1em;
  text-align: center;
}
.logo {
  width: 50px;
  vertical-align: middle;
}

/* Map */
#map {
  height: 500px;
  margin: 1em;
  border: 2px solid #2c3e50;
}

/* Info Panels */
#salinity-info,
#ai-assistant {
  margin: 1em;
  padding: 1em;
  background-color: white;
  border-radius: 5px;
}

/* Chatbox */
#chatbox {
  display: flex;
  flex-direction: column;
}
#chat-log {
  height: 150px;
  overflow-y: auto;
  border: 1px solid #ccc;
  padding: 0.5em;
  margin-bottom: 0.5em;
  background-color: #f9f9f9;
}
#user-input {
  padding: 0.5em;
  margin-bottom: 0.5em;
}
#send-btn {
  padding: 0.5em;
  background-color: #2c3e50;
  color: white;
  border: none;
  cursor: pointer;
}

/* Footer */
footer {
  text-align: center;
  padding: 1em;
  background-color: #2c3e50;
  color: white;
}
// 1. Initialize the Leaflet map
const map = L.map('map').setView([0, 0], 2);

// 2. Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// 3. Salinity lookup (using humidity as placeholder)
async function fetchSalinity(lat, lon) {
  const apiKey = 'YOUR_OPENWEATHERMAP_API_KEY';
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`
  );
  const data = await res.json();
  const salinity = data.main.humidity; // replace with real salinity if available
  document.getElementById(
    'salinity-value'
  ).textContent = `Salinity at (${lat.toFixed(
    2
  )}, ${lon.toFixed(2)}): ${salinity} PSU`;
}

// 4. Handle map clicks
map.on('click', (e) => {
  fetchSalinity(e.latlng.lat, e.latlng.lng);
});

// 5. AI Assistant via OpenRouter
document.getElementById('send-btn').addEventListener('click', async () => {
  const inputEl = document.getElementById('user-input');
  const query = inputEl.value;
  if (!query) return;
  // Display user message
  const chatLog = document.getElementById('chat-log');
  chatLog.innerHTML += `<p><strong>You:</strong> ${query}</p>`;
  inputEl.value = '';

  // Call OpenRouter AI
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer YOUR_OPENROUTER_API_KEY'
    },
    body: JSON.stringify({
      model: 'openai/gpt-3.5-turbo',
      messages: [{ role: 'user', content: query }]
    })
  });
  const result = await response.json();
  const reply = result.choices[0].message.content || 'No response';
  chatLog.innerHTML += `<p><strong>AI:</strong> ${reply}</p>`;
});

