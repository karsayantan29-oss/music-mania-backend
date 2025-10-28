import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;

// 🎵 Free Music Archive API (no key needed)
app.get("/api/music", async (req, res) => {
  try {
    const query = req.query.q || "chill";
    console.log("🔍 Fetching from FMA:", query);

    const url = `https://freemusicarchive.org/featured.json`;
    const response = await fetch(url);
    const data = await response.json();

    // Simplify results
    const tracks = (data?.dataset || [])
      .filter(t => t?.track_title && t?.track_url && t?.artist_name)
      .map(t => ({
        title: t.track_title,
        artist: t.artist_name,
        url: t.track_url,
        genre: t.tags || "",
      }));

    res.json(tracks.slice(0, 10));
  } catch (err) {
    console.error("❌ Error fetching from FMA:", err);
    res.status(500).json({ error: "Failed to fetch from FMA" });
  }
});

app.get("/", (req, res) => {
  res.send("🎧 Music Mania Backend (Free Music Archive connected)");
});

app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
