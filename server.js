require("dotenv").config();
const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_KEY) {
  console.error("❌ OPENAI_API_KEY belum ada di .env");
  process.exit(1);
}

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const USERS_FILE = "./users.json";

// ---------- Utils ----------
function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
  }
  return JSON.parse(fs.readFileSync(USERS_FILE));
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function today() {
  return new Date().toISOString().split("T")[0];
}

// ---------- Register ----------
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.json({ error: "Username & password wajib" });

  const users = loadUsers();
  if (users.find(u => u.username === username))
    return res.json({ error: "User sudah ada" });

  users.push({
    username,
    password,
    plan: "free",      // free | premium
    limit: 5,          // free limit per hari
    lastChat: today()
  });

  saveUsers(users);
  res.json({ success: true, message: "Register sukses" });
});

// ---------- Login ----------
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) return res.json({ error: "Login gagal" });

  res.json({
    success: true,
    username: user.username,
    plan: user.plan,
    limit: user.limit
  });
});

// ---------- Chat ----------
app.post("/chat", async (req, res) => {
  const { username, message } = req.body;
  if (!username || !message)
    return res.json({ error: "Username & message wajib" });

  const users = loadUsers();
  const user = users.find(u => u.username === username);
  if (!user) return res.json({ error: "User tidak ditemukan" });

  // reset limit harian
  if (user.lastChat !== today()) {
    user.lastChat = today();
    if (user.plan === "free") user.limit = 5;
  }

  if (user.plan === "free" && user.limit <= 0) {
    return res.json({ error: "Limit free habis hari ini" });
  }

  // panggil OpenAI
  const fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: message }]
    })
  });

  const d = await r.json();
  const reply = d.choices?.[0]?.message?.content || "No response";

  if (user.plan === "free") user.limit--;
  saveUsers(users);

  res.json({
    reply,
    remaining: user.plan === "free" ? user.limit : "unlimited",
    plan: user.plan
  });
});

// ---------- Upgrade Premium (manual) ----------
app.post("/upgrade", (req, res) => {
  const { username } = req.body;
  const users = loadUsers();
  const user = users.find(u => u.username === username);
  if (!user) return res.json({ error: "User tidak ada" });

  user.plan = "premium";
  user.limit = 999999;
  saveUsers(users);

  res.json({ success: true, message: "User jadi premium" });
});

// ---------- Root ----------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 SaaS Luna aktif di http://localhost:${PORT}`);
});
