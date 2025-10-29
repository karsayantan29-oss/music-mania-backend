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
    console.log(`🎧 Fetching from Free Music Archive for: ${query}`);

    // Fetch Free Music Archive JSON feed (always public and real MP3s)
    const response = await fetch("https://freemusicarchive.org/featured.json");
    const data = await response.json();

    if (!data || !data.aTracks) throw new Error("Invalid response from FMA");

    // Filter and format results
    const tracks = data.aTracks
      .filter(
        (t) =>
          t.track_title.toLowerCase().includes(query) ||
          t.artist_name.toLowerCase().includes(query) ||
          t.genre_title.toLowerCase().includes(query)
      )
      .map((t, i) => ({
        id: t.track_id || i.toString(),
        title: t.track_title,
        artist: t.artist_name,
        genre: t.genre_title || "Unknown",
        audio_url: t.track_url || t.track_listen_url,
        image_url: t.album_image_file || null,
      }));

    res.json(tracks.length ? tracks : data.aTracks.slice(0, 20));
  } catch (err) {
    console.error("❌ Music API Error:", err);
    res.status(500).json({ error: "Failed to fetch music" });
  }
});
// ✅ Start server
app.listen(PORT, () => {
  console.log(`🎧 Music Mania Backend running on port ${PORT}`);
});
