const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("INI DARI INDEX.JS 🔥 KALAU MUNCUL BERARTI FIX TOTAL");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("SERVER JALAN DI PORT", PORT);
});
