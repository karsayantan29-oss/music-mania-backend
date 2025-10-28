import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors({
  origin: [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "https://musicmania.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());

// ✅ Route to fetch music from Pixabay
app.get("/api/music", async (req, res) => {
  const query = req.query.q || "chill";
  const PIXABAY_KEY = process.env.PIXABAY_KEY;

  const url = `https://pixabay.com/api/music/?key=${PIXABAY_KEY}&q=${encodeURIComponent(query)}&per_page=10`;
  console.log("🔍 Fetching:", url);

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Check if Pixabay returned an error
    if (data.error) {
      console.error("❌ Pixabay API error:", data);
      return res.status(500).json({ error: data.error });
    }

    res.json(data);
  } catch (err) {
    console.error("❌ Fetch failed:", err);
    res.status(500).json({ error: "Failed to fetch music" });
  }
});

// Test route
app.get("/", (req, res) => res.send("🎧 Music Mania Backend (Pixabay API connected)"));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));