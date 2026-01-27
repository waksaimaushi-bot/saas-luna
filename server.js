const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// serve static files dari folder public
app.use(express.static(path.join(__dirname, "public")));

// root -> index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// test route (buat cek deploy)
app.get("/tes", (req, res) => {
  res.send("TES BARU DARI SERVER 🔥");
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
