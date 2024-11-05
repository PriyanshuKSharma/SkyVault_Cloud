const express = require("express");
const path = require("path");
const fs = require("fs");
const formidable = require("formidable");
const session = require("express-session");

const app = express();
const PORT = 3000;

// Dummy credentials for authentication
const USERNAME = "user";
const PASSWORD = "password";

// Set up session management
app.use(
  session({
    secret: "your_secret_key", // Replace with a strong secret in production
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

// Serve static files
app.use(express.static("public"));
app.use(express.json()); // For parsing JSON data in login

// Authentication route
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === USERNAME && password === PASSWORD) {
    req.session.authenticated = true; // Set session as authenticated
    res.json({ success: true });
  } else {
    res.json({ success: false, message: "Invalid credentials" });
  }
});

// Upload route with formidable
app.post("/upload", (req, res) => {
  if (req.session.authenticated) {
    const form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, "uploads");
    form.keepExtensions = true;

    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(form.uploadDir)) {
      fs.mkdirSync(form.uploadDir, { recursive: true });
    }

    form.parse(req, (err, fields, files) => {
      if (err) {
        return res.status(500).send("File upload failed");
      }

      const oldPath = files.file.filepath; // Get the temporary file path
      const newPath = path.join(form.uploadDir, files.file.originalFilename);

      // Move the file to the final destination
      fs.rename(oldPath, newPath, (err) => {
        if (err) {
          return res.status(500).send("Error moving the file");
        }
        res.json({ success: true, filename: files.file.originalFilename });
      });
    });
  } else {
    res.status(401).send("Unauthorized");
  }
});

// Secure download route
app.get("/download/:filename", (req, res) => {
  if (req.session.authenticated) {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, "uploads", filename);
    if (fs.existsSync(filepath)) {
      res.download(filepath, (err) => {
        if (err) {
          res.status(500).send("Error downloading the file");
        }
      });
    } else {
      res.status(404).send("File not found");
    }
  } else {
    res.status(401).send("Unauthorized");
  }
});

// Home route redirects to login by default
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Serve index.html only if the user is authenticated
app.get("/index.html", (req, res) => {
  if (req.session.authenticated) {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  } else {
    res.redirect("/");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
