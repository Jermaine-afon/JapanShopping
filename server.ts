import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3000;

// Support JSON payloads up to 20mb for base64 image uploads
app.use(express.json({ limit: '20mb' }));

// Persistence directory
const DATA_DIR = path.resolve(process.cwd(), 'data');
const REQUESTS_FILE = path.join(DATA_DIR, 'shopping_requests.json');
const PURCHASED_FILE = path.join(DATA_DIR, 'purchased_map.json');

// Ensure data folder and files exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadRequests(): any[] {
  try {
    if (fs.existsSync(REQUESTS_FILE)) {
      const content = fs.readFileSync(REQUESTS_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading requests file:', err);
  }
  return [];
}

function saveRequests(requests: any[]): void {
  try {
    fs.writeFileSync(REQUESTS_FILE, JSON.stringify(requests, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving requests file:', err);
  }
}

function loadPurchasedMap(): Record<string, boolean> {
  try {
    if (fs.existsSync(PURCHASED_FILE)) {
      const content = fs.readFileSync(PURCHASED_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading purchased file:', err);
  }
  return {};
}

function savePurchasedMap(map: Record<string, boolean>): void {
  try {
    fs.writeFileSync(PURCHASED_FILE, JSON.stringify(map, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving purchased file:', err);
  }
}

// In-memory cache synced with disk
let cachedRequests: any[] = loadRequests();
let cachedPurchased: Record<string, boolean> = loadPurchasedMap();

// API Endpoints
app.get('/api/requests', (req, res) => {
  res.json(cachedRequests);
});

app.post('/api/requests', (req, res) => {
  const newItem = req.body;
  if (!newItem || !newItem.productName || !newItem.requesterName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const itemWithId = {
    ...newItem,
    id: newItem.id || `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: newItem.createdAt || new Date().toISOString(),
  };

  cachedRequests = [itemWithId, ...cachedRequests];
  saveRequests(cachedRequests);
  res.status(201).json(itemWithId);
});

app.delete('/api/requests/:id', (req, res) => {
  const { id } = req.params;
  cachedRequests = cachedRequests.filter((item) => item.id !== id);
  saveRequests(cachedRequests);
  res.json({ success: true, count: cachedRequests.length });
});

app.delete('/api/requests', (req, res) => {
  cachedRequests = [];
  cachedPurchased = {};
  saveRequests(cachedRequests);
  savePurchasedMap(cachedPurchased);
  res.json({ success: true, count: 0 });
});

app.get('/api/purchased', (req, res) => {
  res.json(cachedPurchased);
});

app.post('/api/purchased/:id', (req, res) => {
  const { id } = req.params;
  const { isPurchased } = req.body;

  if (typeof isPurchased === 'boolean') {
    cachedPurchased[id] = isPurchased;
  } else {
    cachedPurchased[id] = !cachedPurchased[id];
  }

  savePurchasedMap(cachedPurchased);
  res.json(cachedPurchased);
});

async function startServer() {
  // Mount Vite middlewares in development or static assets in production
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve('dist'))) {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Japan Haul shared server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
