require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// Serve static files from the React frontend build
app.use(express.static(path.join(__dirname, 'client/dist')));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'social-media-scheduler', version: '1.0.0' });
});

// SPA Catch-all route MUST be last
app.use((req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'API route not found' });
  res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
});

// Socket.io for Realtime Health Check Architecture
io.on('connection', (socket) => {
  socket.emit('health', { status: 'Online', version: '1.0.0' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Social Media Scheduler running on port ${PORT}`);
});
