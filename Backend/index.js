const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const express = require("express");
const cors = require("cors");

// ===== FILE DATABASE =====
let data = JSON.parse(fs.readFileSync("data.json", "utf-8"));
let users = data.users;
let spaces = data.spaces;

const saveData = () => {
  fs.writeFileSync(
    "data.json",
    JSON.stringify({ users, spaces }, null, 2)
  );
};

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
  const email = req.body.email.trim();
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { email, password: hashedPassword };
  users.push(newUser);
  saveData();

  res.json({ message: "User registered", user: { email } });
});

app.post("/login", async (req, res) => {
  const email = req.body.email.trim();
  const password = req.body.password;

  const user = users.find(
    (u) => u.email === email
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  res.json({ user: { email: user.email } });
});

// ===== SPACES =====

// GET
app.get("/spaces", (req, res) => {
  res.json(spaces);
});

// CREATE
app.post("/spaces", upload.single("image"), (req, res) => {
  const newSpace = {
    id: Date.now(),
    title: req.body.title,
    description: req.body.description,
    reserved: false,
    owner: req.body.owner,
    price: req.body.price,
    category: req.body.category,
    image: req.file ? `/uploads/${req.file.filename}` : null,
    reserverdBy: null,
  };

  spaces.push(newSpace);
  saveData();

  res.json(newSpace);
});

// DELETE
app.delete("/spaces/:id", (req, res) => {
  const spaceId = parseInt(req.params.id);

  spaces = spaces.filter((s) => s.id !== spaceId);
  saveData();

  res.json({ message: "Space deleted" });
});

// RESERVE
app.patch("/spaces/:id/reserve", (req, res) => {
  const spaceId = parseInt(req.params.id);
  const space = spaces.find((s) => s.id === spaceId);

  if (!space) {
    return res.status(404).json({ error: "Space not found" });
  }

  if (space.reserved) {
    return res.status(400).json({ error: "Space already reserved" });
  }

  space.reserved = true;
  space.reservedBy = req.body.user || "Unknown";

  saveData();

  res.json(space);
});

// EDIT
app.put("/spaces/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const index = spaces.findIndex((s) => s.id === id);

  if (index === -1) 
    return res.status(404).json({ error: "Space not found" });
  

  spaces[index] = { ...req.body, reserved: spaces[index].reserved, reservedBy: spaces[index].reservedBy };
  saveData();

  res.json(spaces[index]);
});

// ===== START server =====
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});