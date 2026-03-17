const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
  origin: ['chrome-extension://*', 'http://localhost:*']
}));
app.use(express.json());

// Load phishing dataset
const datasetPath = path.join(__dirname, 'phishing-dataset.json');
let phishingDomains = [];
try {
  phishingDomains = JSON.parse(fs.readFileSync(datasetPath, 'utf8')).domains || [];
} catch (err) {
  console.log('Dataset not found, using empty list');
}

// API: Check domain risk
app.get('/check-domain', (req, res) => {
  const domain = req.query.domain?.toLowerCase().trim();
  if (!domain) {
    return res.status(400).json({ error: 'Domain required' });
  }

  const isPhishing = phishingDomains.some(d => domain.includes(d) || d.includes(domain));
  const risk = isPhishing ? 95 : 5; // High risk if match

  res.json({
    risk: risk,
    isPhishing,
    reason: isPhishing ? 'Known phishing domain' : 'Clean'
  });
});

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'GuardAIN Backend running', port: PORT });
});

app.listen(PORT, () => {
  console.log(`GuardAIN Backend running on http://localhost:${PORT}`);
});
