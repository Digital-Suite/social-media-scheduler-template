require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { Pool } = require('pg');
const cron = require('node-cron');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/dist')));

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database
async function initDb() {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn('DATABASE_URL is not set! Skipping DB init.');
      return;
    }
    await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        platform VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        media_url TEXT,
        post_time TIMESTAMP NOT NULL,
        status VARCHAR(20) DEFAULT 'scheduled',
        session_token TEXT,
        api_base_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize database:', err);
  }
}
initDb();

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'social-media-scheduler', version: '1.0.0' });
});

app.get('/api/posts', async (req, res) => {
  if (!process.env.DATABASE_URL) return res.json([]);
  try {
    const result = await pool.query('SELECT * FROM posts ORDER BY post_time ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/posts', async (req, res) => {
  if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'Database not configured' });
  const { platform, content, mediaUrl, postTime, sessionToken, apiBaseUrl } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO posts (platform, content, media_url, post_time, session_token, api_base_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [platform, content, mediaUrl, postTime, sessionToken, apiBaseUrl]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cron Job for publishing posts
cron.schedule('* * * * *', async () => {
  if (!process.env.DATABASE_URL) return;
  console.log('Checking for scheduled posts...');
  try {
    const result = await pool.query("SELECT * FROM posts WHERE status = 'scheduled' AND post_time <= NOW()");
    for (const post of result.rows) {
      console.log(`Publishing post ${post.id} to ${post.platform}...`);
      if (!post.session_token || !post.api_base_url) {
        console.error(`Post ${post.id} missing session token or API base URL. Marking as failed.`);
        await pool.query("UPDATE posts SET status = 'failed' WHERE id = $1", [post.id]);
        continue;
      }

      try {
        const response = await fetch(`${post.api_base_url}/api/v1/social/publish`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${post.session_token}`
          },
          body: JSON.stringify({
            platform: post.platform,
            content: post.content,
            mediaUrl: post.media_url
          })
        });

        const data = await response.json();
        if (response.ok && data.success) {
          console.log(`Successfully published post ${post.id}!`);
          await pool.query("UPDATE posts SET status = 'published' WHERE id = $1", [post.id]);
        } else {
          console.error(`Failed to publish post ${post.id}:`, data);
          await pool.query("UPDATE posts SET status = 'failed' WHERE id = $1", [post.id]);
        }
      } catch (err) {
        console.error(`Network error publishing post ${post.id}:`, err);
      }
    }
  } catch (err) {
    console.error('Error in cron job:', err);
  }
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
