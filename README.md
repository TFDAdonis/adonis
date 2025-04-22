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
