import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;

// ✅ Free Music Archive (FMA) feed (no API key needed)
app.get("/api/music", async (req, res) => {
  try {
    const query = (req.query.q || "chill").toLowerCase();
    console.log(`🎧 Fetching open music feed for query: ${query}`);

    // ✅ Use a verified, CORS-safe JSON feed
    const url = "https://cdn.jsdelivr.net/gh/publicdata/music-sample-db@main/fma_tracks.json";
    const response = await fetch(url);
    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error("❌ Invalid response format:", data);
      return res.status(500).json({ error: "Invalid data format from source" });
    }

    // Filter by query keyword
    const filtered = data.filter(
      (t) =>
        (t.title && t.title.toLowerCase().includes(query)) ||
        (t.artist && t.artist.toLowerCase().includes(query))
    );

    const tracks = (filtered.length ? filtered : data.slice(0, 10)).map((t) => ({
      id: t.id || Math.random().toString(36).substring(7),
      title: t.title || "Untitled",
      artist: t.artist || "Unknown Artist",
      genre: t.genre || "Misc",
      audio_url: t.audio_url || "",
      image_url:
        t.image_url ||
        "https://upload.wikimedia.org/wikipedia/commons/4/4f/FMA_logo.png",
    }));

    res.json(tracks);
  } catch (error) {
    console.error("❌ Error fetching tracks:", error.message);
    res.status(500).json({ error: "Error fetching tracks" });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🎧 Music Mania Backend running on port ${PORT}`);
});
