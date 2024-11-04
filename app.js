const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Dummy credentials (In a real app, use a database and encrypt passwords)
const USERNAME = 'user';
const PASSWORD = 'password';

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Middleware to serve static files
app.use(express.static('public'));
app.use(express.json());  // to handle JSON data for login

// Authentication route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === USERNAME && password === PASSWORD) {
    res.json({ success: true });
  } else {
    res.json({ success: false, message: 'Invalid credentials' });
  }
});

// Secure upload route
app.post('/upload', (req, res, next) => {
  if (req.headers.authorization === 'authenticated') {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
}, upload.single('file'), (req, res) => {
  res.send(`File uploaded successfully: ${req.file.filename}`);
});

// Secure download route
app.get('/download/:filename', (req, res) => {
  if (req.headers.authorization === 'authenticated') {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, 'uploads', filename);
    if (fs.existsSync(filepath)) {
      res.download(filepath);
    } else {
      res.status(404).send('File not found');
    }
  } else {
    res.status(401).send('Unauthorized');
  }
});

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
