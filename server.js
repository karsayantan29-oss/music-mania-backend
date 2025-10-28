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
    const query = req.query.q?.toLowerCase() || "chill";
    console.log(`🔍 Fetching from FMA JSON feed (featured) for query: ${query}`);

    const url = "https://freemusicarchive.org/featured.json";
    const response = await fetch(url);
    const data = await response.json();

    if (!data || !data.aTracks) {
      console.error("❌ No tracks found or bad response:", data);
      return res.status(500).json({ error: "Failed to fetch tracks from FMA feed" });
    }

    // Filter by query (optional)
    const filtered = data.aTracks.filter((t) =>
      t.track_title.toLowerCase().includes(query) ||
      t.artist_name.toLowerCase().includes(query)
    );

    // Simplify and send to frontend
    const tracks = (filtered.length ? filtered : data.aTracks).map((t) => ({
      id: t.track_id,
      title: t.track_title,
      artist: t.artist_name,
      album: t.album_title || "Unknown Album",
      genre: t.track_genre || "Unknown",
      audio_url: t.track_url,
      image_url: t.album_image_file || "https://freemusicarchive.org/img/logo.png",
    }));

    res.json(tracks);
  } catch (error) {
    console.error("❌ Error fetching from FMA feed:", error);
    res.status(500).json({ error: "Error fetching tracks" });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🎧 Music Mania Backend running on port ${PORT}`);
});
