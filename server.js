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
    console.log(`🎧 Fetching open FMA dataset for query: ${query}`);

    const url = "https://raw.githubusercontent.com/OpenDataDE/FreeMusicArchiveDataset/master/track_sample.json";
    const response = await fetch(url);

    console.log("Response status:", response.status);
    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch FMA dataset" });
    }

    const data = await response.json();

    // Validate data
    if (!Array.isArray(data)) {
      console.error("❌ Invalid format:", data);
      return res.status(500).json({ error: "Invalid data format" });
    }

    // Filter and simplify
    const filtered = data.filter(
      (t) =>
        (t.track_title && t.track_title.toLowerCase().includes(query)) ||
        (t.artist_name && t.artist_name.toLowerCase().includes(query))
    );

    const tracks = (filtered.length ? filtered : data.slice(0, 10)).map((t) => ({
      id: t.track_id || Math.random().toString(36).substring(7),
      title: t.track_title,
      artist: t.artist_name,
      genre: t.tags || "Unknown",
      audio_url:
        t.track_listens > 0
          ? `https://files.freemusicarchive.org/storage-freemusicarchive-org/music/${encodeURIComponent(
              t.artist_name
            )}/${encodeURIComponent(t.album_title || "Unknown")}/${encodeURIComponent(
              t.track_title
            )}.mp3`
          : "",
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
