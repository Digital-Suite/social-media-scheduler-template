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
        author_name TEXT,
        author_handle TEXT,
        author_avatar_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database initialized successfully.');

    // Migration for existing tables
    try { await dbRun('ALTER TABLE posts ADD COLUMN title TEXT;'); } catch(e) {}
    try { await dbRun('ALTER TABLE posts ADD COLUMN hashtags TEXT;'); } catch(e) {}
    try { await dbRun('ALTER TABLE posts ADD COLUMN author_name TEXT;'); } catch(e) {}
    try { await dbRun('ALTER TABLE posts ADD COLUMN author_handle TEXT;'); } catch(e) {}
    try { await dbRun('ALTER TABLE posts ADD COLUMN author_avatar_url TEXT;'); } catch(e) {}
    try { await dbRun('ALTER TABLE posts ADD COLUMN account_id INTEGER;'); } catch(e) {}
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
    // Ensure all dates are explicitly treated as UTC by appending 'Z'
    const formattedRows = rows.map(row => ({
      ...row,
      post_time: row.post_time ? (row.post_time.endsWith('Z') ? row.post_time : `${row.post_time}Z`.replace(' ', 'T')) : row.post_time,
      created_at: row.created_at ? (row.created_at.endsWith('Z') ? row.created_at : `${row.created_at}Z`.replace(' ', 'T')) : row.created_at
    }));
    res.json(formattedRows);
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
  const { platform, title, content, hashtags, mediaUrl, postTime, sessionToken, apiBaseUrl, authorName, authorHandle, authorAvatarUrl, accountId } = req.body;
  
  try {
    const result = await dbRun(
      'INSERT INTO posts (platform, title, content, hashtags, media_url, post_time, session_token, api_base_url, status, author_name, author_handle, author_avatar_url, account_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [platform, title || null, content || '', JSON.stringify(hashtags || []), mediaUrl || null, postTime, sessionToken, apiBaseUrl, 'scheduled', authorName || null, authorHandle || null, authorAvatarUrl || null, accountId || null]
    );
    const newPost = await dbGet('SELECT * FROM posts WHERE id = ?', [result.lastID]);
    newPost.post_time = newPost.post_time ? `${newPost.post_time}Z`.replace(' ', 'T') : newPost.post_time;
    newPost.created_at = newPost.created_at ? `${newPost.created_at}Z`.replace(' ', 'T') : newPost.created_at;
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

app.put('/api/posts/:id', async (req, res) => {
  const { postTime } = req.body;
  try {
    await dbRun("UPDATE posts SET post_time = ?, status = 'scheduled' WHERE id = ?", [postTime, req.params.id]);
    const updatedPost = await dbGet('SELECT * FROM posts WHERE id = ?', [req.params.id]);
    updatedPost.post_time = updatedPost.post_time ? `${updatedPost.post_time}Z`.replace(' ', 'T') : updatedPost.post_time;
    updatedPost.created_at = updatedPost.created_at ? `${updatedPost.created_at}Z`.replace(' ', 'T') : updatedPost.created_at;
    res.json(updatedPost);
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
            mediaUrl: post.media_url,
            accountId: post.account_id
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

        // Emit updated post to all connected clients
        const updatedPost = await dbGet('SELECT * FROM posts WHERE id = ?', [post.id]);
        if (updatedPost) {
          updatedPost.post_time = updatedPost.post_time ? `${updatedPost.post_time}Z`.replace(' ', 'T') : updatedPost.post_time;
          updatedPost.created_at = updatedPost.created_at ? `${updatedPost.created_at}Z`.replace(' ', 'T') : updatedPost.created_at;
          io.emit('post_updated', updatedPost);
        }
      } catch (err) {
        console.error(`Network error publishing post ${post.id}:`, err);
      }
    }
  } catch (err) {
    console.error('Error in cron job:', err);
  }
});

// Cron Job for cleaning up old media files (runs daily at midnight)
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily media cleanup...');
  try {
    const files = fs.readdirSync(uploadsDir);
    const now = Date.now();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtimeMs > SEVEN_DAYS_MS) {
        // Check if file is referenced by any scheduled post
        const row = await dbGet("SELECT count(*) as count FROM posts WHERE status = 'scheduled' AND media_url LIKE ?", [`%${file}`]);
        if (row && row.count === 0) {
          console.log(`Deleting old unused media file: ${file}`);
          fs.unlinkSync(filePath);
        }
      }
    }
  } catch (err) {
    console.error('Error in media cleanup cron job:', err);
  }
});


// SPA Catch-all route MUST be last
app.use((req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'API route not found' });
  res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
});

// Socket.io for Realtime Health Check Architecture
const pkg = require('./package.json');
io.on('connection', (socket) => {
  socket.emit('health', { status: 'Online', version: pkg.version });

  let updateInterval;

  socket.on('register_session', async (data) => {
    const checkUpdates = async () => {
      try {
        const res = await fetch(`${data.apiBaseUrl}/api/v1/apps`, {
          headers: { Authorization: `Bearer ${data.sessionToken}` }
        });
        if (res.ok) {
          const apps = await res.json();
          const me = apps.find(a => a.name === 'Social Media Scheduler');
          if (me && me.latestVersion && me.latestVersion !== pkg.version) {
            // Simple string comparison works for semantic versioning assuming same digit counts, 
            // but for safety let's just check if it's different and assume newer since we only bump forward
            socket.emit('update_available', { version: me.latestVersion });
          }
        }
      } catch (err) {
        console.error('Update check failed', err);
      }
    };

    // Check immediately
    await checkUpdates();
    // Then check every 30 seconds
    updateInterval = setInterval(checkUpdates, 30000);
  });

  socket.on('disconnect', () => {
    if (updateInterval) clearInterval(updateInterval);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Social Media Scheduler running on port ${PORT}`);
});
