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
    const query = req.query.q?.trim();
    if (!query) return res.json({ tracks: [] });

    console.log(`🎧 Searching Audius for "${query}"...`);

    const url = `https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=MusicMania&limit=20`;
    const response = await fetch(url);
    const json = await response.json();

    if (!json?.data?.length) {
      return res.json({ tracks: [] });
    }

    const results = json.data.map(t => ({
      title: t.title || "Unknown",
      artist: t.user?.name || "Unknown Artist",
      image: t.artwork?.['150x150'] || "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      audio_url: `https://audius-discovery-2.cdn.audius.co/v1/tracks/${t.id}/stream`
    }));

    res.json({ tracks: results });
  } catch (err) {
    console.error("❌ Search failed:", err);
    res.status(500).json({ error: "Search failed" });
  }
});
app.get("/", (req, res) => {
  res.send("🎧 Music Mania Backend is Running");
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
