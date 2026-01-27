require("dotenv").config();
const express = require("express");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.post("/api/ask", async (req, res) => {
  try {
    const { business, question } = req.body;

    const prompt = `
Kamu adalah AI customer service untuk toko online.

Profil toko:
Nama: ${business.name}
Produk: ${business.product}
Harga: ${business.price}
Aturan: ${business.rules}
Jam kerja: ${business.hours}

Tugas kamu:
Jawab pertanyaan customer dengan sopan, singkat, dan meyakinkan.

Customer bertanya:
"${question}"
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const answer = data.choices[0].message.content;

    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ answer: "Terjadi error di server AI." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Luna AI running on port " + PORT);
});
