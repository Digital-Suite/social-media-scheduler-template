require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const cron = require('node-cron');
const multer = require('multer');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/dist')));

// Ensure data directory exists
const dataDir = process.env.NODE_ENV === 'production' ? '/app/data' : path.join(__dirname, 'data');
const uploadsDir = path.join(dataDir, 'uploads');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/uploads', express.static(uploadsDir));

// Database connection
const dbPath = path.join(dataDir, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Error opening database:', err);
});

// Helper for promise-based queries
const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function (err) {
    if (err) reject(err);
    else resolve(this);
  });
});

const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) reject(err);
    else resolve(rows);
  });
});

const dbGet = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) reject(err);
    else resolve(row);
  });
});

// Initialize database
async function initDb() {
  try {
    await dbRun(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        platform VARCHAR(50) NOT NULL,
        title TEXT,
        content TEXT NOT NULL,
        hashtags TEXT,
        media_url TEXT,
        post_time DATETIME NOT NULL,
        status VARCHAR(20) DEFAULT 'scheduled',
        session_token TEXT,
        api_base_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database initialized successfully.');

    // Migration for existing tables
    try { await dbRun('ALTER TABLE posts ADD COLUMN title TEXT;'); } catch(e) {}
    try { await dbRun('ALTER TABLE posts ADD COLUMN hashtags TEXT;'); } catch(e) {}
  } catch (err) {
    console.error('Failed to initialize database:', err);
  }
}
initDb();

// Setup Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext)
  }
})
const upload = multer({ storage: storage })

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'social-media-scheduler', version: '1.0.0' });
});

app.get('/api/posts', async (req, res) => {
  try {
    const rows = await dbAll('SELECT * FROM posts ORDER BY post_time ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/upload', upload.single('media'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.get('host');
  const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

app.post('/api/posts', async (req, res) => {
  const { platform, title, content, hashtags, mediaUrl, postTime, sessionToken, apiBaseUrl } = req.body;
  
  // ensure content isn't strictly null to pass constraint if it's purely media
  const safeContent = content || '';
  const tagsStr = Array.isArray(hashtags) ? JSON.stringify(hashtags) : null;

  try {
    const result = await dbRun(
      'INSERT INTO posts (platform, title, content, hashtags, media_url, post_time, session_token, api_base_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [platform, title || null, safeContent, tagsStr, mediaUrl || null, postTime, sessionToken, apiBaseUrl]
    );
    const newPost = await dbGet('SELECT * FROM posts WHERE id = ?', [result.lastID]);
    res.json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM posts WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Cron Job for publishing posts
cron.schedule('* * * * *', async () => {
  console.log('Checking for scheduled posts...');
  try {
    const rows = await dbAll("SELECT * FROM posts WHERE status = 'scheduled' AND post_time <= datetime('now')");
    for (const post of rows) {
      console.log(`Publishing post ${post.id} to ${post.platform}...`);
      if (!post.session_token || !post.api_base_url) {
        console.error(`Post ${post.id} missing session token or API base URL. Marking as failed.`);
        await dbRun("UPDATE posts SET status = 'failed' WHERE id = ?", [post.id]);
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
            title: post.title,
            content: post.content,
            hashtags: post.hashtags ? JSON.parse(post.hashtags) : undefined,
            mediaUrl: post.media_url
          })
        });

        const data = await response.json();
        if (response.ok && data.success) {
          console.log(`Successfully published post ${post.id}!`);
          await dbRun("UPDATE posts SET status = 'published' WHERE id = ?", [post.id]);
        } else {
          console.error(`Failed to publish post ${post.id}:`, data);
          await dbRun("UPDATE posts SET status = 'failed' WHERE id = ?", [post.id]);
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
