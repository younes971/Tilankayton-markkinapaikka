const multer = require("multer");
const path = require("path");

const express = require("express");
const cors = require("cors");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

const app = express();
const PORT = 3001;

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// TEMP DATABASE (in memory)
let spaces = [];
let users = [];

// ROUTES
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  const newUser = { email, password };
  users.push(newUser);

  console.log("Users:", users);

  res.json({ message: "User registered" });
});
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  res.json({ email: user.email });
});

// GET all spaces
app.get("/spaces", (req, res) => {
  console.log("GET /spaces called");
  res.json(spaces);
});

// POST new space
app.post("/spaces", upload.single("image"), (req, res) => {
  console.log(req.body);
  const newSpace = {
    id: Date.now(),
    title: req.body.title,
    description: req.body.description,
    reserved: false,
    owner: req.body.owner,
    price: req.body.price,
    category: req.body.category,
    image: req.file ? `/uploads/${req.file.filename}` : null,
  };

  spaces.push(newSpace);
  res.json(newSpace);
});


// DELETE a space
app.delete("/spaces/:id", (req, res) => {
  const spaceId = parseInt(req.params.id);

  spaces = spaces.filter((s) => s.id !== spaceId);

  console.log(`Deleted space ${spaceId}`);
  res.json({ message: "Space deleted" });
});

// PATCH /spaces/:id/reserve
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
  res.json(space);
});

app.put("/spaces/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const index = spaces.findIndex((s) => s.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Space not found" });
  }

  // UPDATE SPACE
  spaces[index] = req.body;

  res.json(spaces[index]);
});

// start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
