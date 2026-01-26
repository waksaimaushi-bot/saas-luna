require("dotenv").config();
const express = require("express");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.post("/api/ask", async (req, res) => {
  try {
    const { business_profile, question } = req.body;

    // validasi body
    if (!business_profile || !question) {
      return res.status(400).json({
        error: "Body tidak lengkap",
      });
    }

    const prompt = `
Kamu adalah AI customer service untuk bisnis berikut:

Nama bisnis: ${business_profile.name}
Tipe: ${business_profile.type}
Produk: ${business_profile.products}
Harga: ${business_profile.price}
Aturan: ${business_profile.rules}
Jam kerja: ${business_profile.working_hours}

Jawab pertanyaan customer secara singkat, ramah, dan profesional.

Pertanyaan: ${question}
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: "Kamu adalah AI customer service bisnis." },
          { role: "user", content: prompt },
        ],
        temperature: 0.6,
      }),
    });

    const data = await response.json();

    // kalau error dari OpenAI
    if (data.error) {
      console.log("OPENAI ERROR:", data.error);
      return res.status(500).json({
        error: data.error.message,
      });
    }

    const answer = data.choices[0].message.content;
    res.json({ answer });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ answer: "Terjadi error di server AI." });
  }
});

app.listen(3000, () => {
  console.log("✅ SaaS Luna aktif di http://localhost:3000");
});
