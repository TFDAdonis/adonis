# <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Gaiadex - Salinity Map</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
</head>
<body class="bg-gray-100">
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-4">Gaiadex - Salinity Map</h1>
    <div id="map" class="h-96 mb-4"></div>
    <form id="salinity-form" class="mb-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input type="number" id="conductivity" placeholder="Conductivity (µS/cm)" class="p-2 border rounded" required />
        <input type="number" id="temperature" placeholder="Temperature (°C)" class="p-2 border rounded" required />
        <button type="submit" class="bg-blue-500 text-white p-2 rounded">Calculate Salinity</button>
      </div>
    </form>
    <p id="salinity-result" class="text-xl font-semibold"></p>
    <div id="ai-assistant" class="mt-6 p-4 bg-white rounded shadow">
      <h2 class="text-2xl font-bold mb-2">AI Assistant</h2>
      <div id="ai-response" class="mb-2"></div>
      <input type="text" id="ai-input" placeholder="Ask a question..." class="w-full p-2 border rounded" />
    </div>
  </div>

  <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
  <script src="app.js"></script>
</body>
</html>
// Initialize the map
const map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Salinity calculation using UNESCO 1983 algorithm
function calculateSalinity(conductivity, temperature) {
  // Placeholder formula for demonstration purposes
  return (0.008 * conductivity) / (1 + 0.02 * (temperature - 25));
}

// Handle form submission
document.getElementById('salinity-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const conductivity = parseFloat(document.getElementById('conductivity').value);
  const temperature = parseFloat(document.getElementById('temperature').value);
  const salinity = calculateSalinity(conductivity, temperature);
  document.getElementById('salinity-result').textContent = `Calculated Salinity: ${salinity.toFixed(2)} PSU`;
});

// AI Assistant integration
document.getElementById('ai-input').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    const query = e.target.value;
    // Replace with actual OpenRouterAI API call
    fetch('https://api.openrouter.ai/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: query })
    })
    .then(response => response.json())
    .then(data => {
      document.getElementById('ai-response').textContent = data.answer;
    })
    .catch(error => {
      document.getElementById('ai-response').textContent = 'Error fetching AI response.';
    });
    e.target.value = '';
  }
});
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Gaiadex</title>
  <link rel="stylesheet" href="style.css"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
</head>
<body>
  <header>
    <img src="assets/images/logo.png" alt="Gaiadex Logo" class="logo"/>
    <h1>Gaiadex</h1>
    <p>Interactive Salinity Mapping with AI Assistance</p>
  </header>

  <main>
    <div id="map"></div>
    <div id="salinity-info">
      <h2>Salinity Data</h2>
      <p id="salinity-value">Click on the map to get salinity data.</p>
    </div>
    <div id="ai-assistant">
      <h2>AI Assistant</h2>
      <div id="chatbox">
        <div id="chat-log"></div>
        <input type="text" id="user-input" placeholder="Ask about salinity..." />
        <button id="send-btn">Send</button>
      </div>
    </div>
  </main>

  <footer>
    <p>&copy; 2025 Gaiadex. All rights reserved.</p>
  </footer>

  <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
  <script src="script.js"></script>
</body>
</html>
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background-color: #eef2f3;
  color: #333;
}

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

#map {
  height: 500px;
  margin: 1em;
  border: 2px solid #2c3e50;
}

#salinity-info, #ai-assistant {
  margin: 1em;
  padding: 1em;
  background-color: white;
  border-radius: 5px;
}

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

footer {
  text-align: center;
  padding: 1em;
  background-color: #2c3e50;
  color: white;
}
// Initialize the map
const map = L.map('map').setView([0, 0], 2);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Function to fetch salinity data
async function fetchSalinity(lat, lon) {
  const apiKey = 'YOUR_OPENWEATHERMAP_API_KEY'; // Replace with your API key
  const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`);
  const data = await response.json();
  // Assuming salinity data is part of the response; replace with actual data extraction
  const salinity = data.main.humidity; // Placeholder
  document.getElementById('salinity-value').textContent = `Salinity at (${lat.toFixed(2)}, ${lon.toFixed(2)}): ${salinity} PSU`;
}

// Handle map clicks
map.on('click', function(e) {
  const { lat, lng } = e.latlng;
  fetchSalinity(lat, lng);
});

// AI Assistant functionality
document.getElementById('send-btn').addEventListener('click', async () => {
  const userInput = document.getElementById('user-input').value;
  if (!userInput) return;

  const chatLog = document.getElementById('chat-log');
  chatLog.innerHTML += `<p><strong>You:</strong> ${userInput}</p>`;

  // Call OpenAI API
  const apiKey = 'YOUR_OPENAI_API_KEY'; // Replace with your API key
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: userInput }]
    })
  });

  const data = await response.json();
  const aiResponse = data.choices[0].message.content;
  chatLog.innerHTML += `<p><strong>AI:</strong> ${aiResponse}</p>`;
  document.getElementById('user-input').value = '';
});
