import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;

// ✅ Free Music Archive (FMA) API
app.get("/api/music", async (req, res) => {
  try {
    const query = req.query.q || "chill";
    console.log("🔍 Fetching from Free Music Archive for query:", query);

    const url = `https://freemusicarchive.org/api/trackSearch?q=${encodeURIComponent(query)}&limit=10`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data || !data.aTracks) {
      return res.status(500).json({ error: "Invalid FMA API response" });
    }

    const tracks = data.aTracks.map(track => ({
      title: track.track_title,
      artist: track.artist_name,
      url: track.track_url,
    }));

    res.json(tracks);
  } catch (err) {
    console.error("❌ Error fetching from FMA:", err);
    res.status(500).json({ error: "Failed to fetch music" });
  }
});

app.get("/", (req, res) => {
  res.send("🎧 Music Mania Backend (Free Music Archive connected)");
});

app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));