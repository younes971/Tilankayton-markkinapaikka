const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const express = require("express");
const cors = require("cors");
const db = require("./db");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");

const SECRET = "mysecret123";

// ===== MULTER =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ===== APP =====
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// ===== AUTH =====
app.post("/register", async (req, res) => {
  try {
    const email = req.body.email.trim();
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const [existing] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [email, hashedPassword]
    );

    res.json({ message: "User registered", user: { email } });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const email = req.body.email.trim();
    const password = req.body.password;

    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    const user = rows[0];

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { email: user.email },
      SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: { email: user.email }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===== SPACES =====

// GET
app.get("/spaces", async (req, res) => {
  console.log("USING DATABASE NOW");
  try {
    const [rows] = await db.query("SELECT * FROM spaces");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// CREATE 
app.post("/spaces", auth, upload.single("image"), async (req, res) => {
  try {
    await db.query(
      `INSERT INTO spaces 
      (title, description, owner, price, category, startDate, endDate, image, reserved, reservedBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NULL)`,
      [
        req.body.title,
        req.body.description,
        req.user.email,
        req.body.price,
        req.body.category,
        req.body.startDate,
        req.body.endDate,
        req.file ? `/uploads/${req.file.filename}` : null,
      ]
    );

    res.json({ message: "Space created" });

  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({ error: "DB error" });
  }
});

// DELETE 
app.delete("/spaces/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;

    const [rows] = await db.query(
      "SELECT owner FROM spaces WHERE id = ?",
      [id]
    );

    const space = rows[0];

    if (!space) {
      return res.status(404).json({ error: "Space not found" });
    }

    if (space.owner !== req.user.email) {
      return res.status(403).json({ error: "Not allowed" });
    }

    await db.query("DELETE FROM spaces WHERE id = ?", [id]);

    res.json({ message: "Deleted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// RESERVE
app.patch("/spaces/:id/reserve", auth, async (req, res) => {
  const id = Number(req.params.id);
  const user = req.user.email.trim().toLowerCase();

  try {
    const [rows] = await db.query(
      "SELECT id, owner, reserved, reservedBy FROM spaces WHERE id = ?",
      [id]
    );

    const space = rows[0];

    if (!space) {
      return res.status(404).json({ error: "Space not found" });
    }

    const owner = (space.owner || "").trim().toLowerCase();
    const reservedBy = (space.reservedBy || "").trim().toLowerCase();

    if (owner === user) {
      return res.status(400).json({
        error: "You cannot reserve your own space",
      });
    }

    if (space.reserved && reservedBy === user) {
      return res.status(400).json({
        error: "You already reserved this space",
      });
    }

    if (space.reserved && reservedBy && reservedBy !== user) {
      return res.status(400).json({
        error: "This space is already reserved",
      });
    }

    await db.query(
      "UPDATE spaces SET reserved = 1, reservedBy = ? WHERE id = ?",
      [user, id]
    );

    res.json({
      message: "Reserved successfully",
    });
  } catch (err) {
    console.error("RESERVE ERROR:", err);
    res.status(500).json({
      error: "Server error",
    });
  }
});

// EDIT
app.put("/spaces/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;

    const [rows] = await db.query(
      "SELECT owner FROM spaces WHERE id = ?",
      [id]
    );

    const space = rows[0];

    if (!space) {
      return res.status(404).json({ error: "Space not found" });
    }

    if (space.owner !== req.user.email) {
      return res.status(403).json({ error: "Not allowed" });
    }

    await db.query(
      `UPDATE spaces 
       SET title=?, description=?, price=?, category=? 
       WHERE id=?`,
      [
        req.body.title,
        req.body.description,
        req.body.price,
        req.body.category,
        id,
      ]
    );

    res.json({ message: "Updated" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// ===== LIKE / UNLIKE SPACE =====
app.patch("/spaces/:id/like", auth, async (req, res) => {
  try {
    const spaceId = Number(req.params.id);
    const userEmail = req.user.email.trim().toLowerCase();

    const [existing] = await db.query(
      "SELECT id FROM space_likes WHERE spaceId = ? AND userEmail = ?",
      [spaceId, userEmail]
    );

    if (existing.length > 0) {
      
      // Unlike
      
      await db.query(
        "DELETE FROM space_likes WHERE spaceId = ? AND userEmail = ?",
        [spaceId, userEmail]
      );

      await db.query(
        "UPDATE spaces SET likes = GREATEST(COALESCE(likes, 0) - 1, 0) WHERE id = ?",
        [spaceId]
      );

      return res.json({
        liked: false,
        message: "Like removed",
      });
    }

    // Like
    await db.query(
      "INSERT INTO space_likes (spaceId, userEmail) VALUES (?, ?)",
      [spaceId, userEmail]
    );

    await db.query(
      "UPDATE spaces SET likes = COALESCE(likes, 0) + 1 WHERE id = ?",
      [spaceId]
    );

    res.json({
      liked: true,
      message: "Space liked",
    });
  } catch (err) {
    console.error("LIKE ERROR:", err);
    res.status(500).json({
      error: "Server error",
    });
  }
});

// ===== GET COMMENTS =====
app.get("/spaces/:id/comments", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, user_email, comment, created_at
       FROM comments
       WHERE space_id = ?
       ORDER BY created_at DESC`,
      [req.params.id]
    );

    res.json(rows);
  } catch (err) {
    console.error("GET COMMENTS ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===== ADD COMMENT =====
app.post("/spaces/:id/comments", auth, async (req, res) => {
  try {
    const { comment } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        error: "Comment cannot be empty",
      });
    }

    await db.query(
      `INSERT INTO comments (space_id, user_email, comment)
       VALUES (?, ?, ?)`,
      [
        req.params.id,
        req.user.email,
        comment.trim(),
      ]
    );

    res.json({
      message: "Comment added successfully",
    });
  } catch (err) {
    console.error("ADD COMMENT ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===== START =====
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:3001`);
});
