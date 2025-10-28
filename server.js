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

    // ✅ Use a static JSON feed with real MP3 URLs
    const url = "https://raw.githubusercontent.com/shalvah/fma-sample-data/master/tracks.json";
    const response = await fetch(url);
    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error("❌ Invalid response:", data);
      return res.status(500).json({ error: "Invalid data format from source" });
    }

    // Filter by query
    const filtered = data.filter(
      (t) =>
        (t.title && t.title.toLowerCase().includes(query)) ||
        (t.artist && t.artist.toLowerCase().includes(query))
    );

    // Clean up data
    const tracks = (filtered.length ? filtered : data.slice(0, 10)).map((t) => ({
      id: t.track_id || Math.random().toString(36).substring(7),
      title: t.title || "Unknown Title",
      artist: t.artist || "Unknown Artist",
      genre: t.genre || "Misc",
      audio_url: t.audio_url || t.url || "",
    }));

    res.json(tracks);
  } catch (error) {
    console.error("❌ Error fetching tracks:", error);
    res.status(500).json({ error: "Error fetching tracks" });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🎧 Music Mania Backend running on port ${PORT}`);
});
