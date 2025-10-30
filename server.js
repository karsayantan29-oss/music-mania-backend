import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;

// 🎵 HOME TRENDING SONGS — Audius
app.get("/api/trending", async (req, res) => {
  try {
    console.log("🔥 Fetching trending songs...");
    const url = "https://discoveryprovider.audius.co/v1/tracks/trending?app_name=MusicMania&limit=20";
    const response = await fetch(url);
    const json = await response.json();

    if (!json?.data) {
      return res.json({ data: [] });
    }

    // Fix stream URL for frontend
    const formatted = json.data.map(t => ({
      id: t.id,
      title: t.title,
      user: { name: t.user?.name || "Unknown Artist" },
      artwork: t.artwork || {},
      stream_url: `https://audius-discovery-2.cdn.audius.co/v1/tracks/${t.id}/stream`
    }));

    res.json({ data: formatted });
  } catch (err) {
    console.error("❌ Trending fetch failed:", err);
    res.status(500).json({ error: "Failed to fetch trending songs" });
  }
});

// 🔍 SEARCH SONGS — Free Music Archive fallback
app.get("/api/music", async (req, res) => {
  try {
    const query = req.query.q?.toLowerCase() || "chill";
    console.log(`🎧 Searching FMA for "${query}"...`);

    const response = await fetch("https://freemusicarchive.org/featured.json");
    const data = await response.json();

    if (!data?.aTracks) {
      return res.json({ tracks: [] });
    }

    const filtered = data.aTracks
      .filter(t => t.track_title.toLowerCase().includes(query))
      .slice(0, 15)
      .map(t => ({
        title: t.track_title,
        artist: t.artist_name,
        image: t.track_image_file || "https://cdn-icons-png.flaticon.com/512/727/727245.png",
        audio_url: t.track_file_url
      }));

    res.json({ tracks: filtered });
  } catch (err) {
    console.error("❌ Search fetch failed:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

app.get("/", (req, res) => {
  res.send("🎧 Music Mania Backend is Running");
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
