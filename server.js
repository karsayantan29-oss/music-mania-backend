
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3001;

// ✅ Fetch songs from Audius API (no API key needed)
app.get("/api/trending", async (req, res) => {
  try {
    console.log("🔥 Fetching trending songs...");
    const url = "https://discoveryprovider.audius.co/v1/tracks/trending?app_name=MusicMania&limit=20";
    const response = await fetch(url);
    const json = await response.json();

    if (!json || !json.data) return res.json([]);

    const mapped = json.data.map((track) => ({
      id: track.id,
      title: track.title,
      artist: track.user?.name || "Unknown Artist",
      genre: track.genre || "Unknown",
      audio_url: `https://audius-discovery-1.cultur3stake.com/v1/tracks/${track.id}/stream`,
      artwork: track.artwork?.['480x480'] || track.artwork?.['150x150'] || "",
    }));

    res.json(mapped);
  } catch (error) {
    console.error("❌ Trending route error:", error);
    res.status(500).json({ error: "Failed to fetch trending tracks" });
  }
});
// ✅ Base route for testing
app.get("/", (req, res) => {
  res.send("🎧 Music Mania Backend (Audius API connected and streaming)");
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Music Mania Backend running on port ${PORT}`);
});