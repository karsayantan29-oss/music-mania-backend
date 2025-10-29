
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3001;

// ✅ Fetch songs from Audius API (no API key needed)
app.get("/api/music", async (req, res) => {
  try {
    const query = (req.query.q || "chill").toLowerCase();
    console.log(`🔍 Fetching from Audius API for query: ${query}`);

    // Audius open search endpoint
    const endpoint = `https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(
      query
    )}&app_name=MusicMania`;

    const response = await fetch(endpoint);
    const data = await response.json();

    if (!data || !data.data) {
      console.error("❌ Invalid response from Audius:", data);
      return res.status(500).json({ error: "Audius API returned invalid data" });
    }

    // Format & clean the track data
    const tracks = data.data
      .filter((t) => t.stream_url && t.title && t.user)
      .map((t) => ({
        id: t.id,
        title: t.title,
        artist: t.user.name,
        genre: t.genre || "Unknown",
        image_url:
          t.artwork?.["480x480"] ||
          t.artwork?.["150x150"] ||
          "https://via.placeholder.com/300x300?text=No+Image",
        audio_url: t.stream_url, // direct streaming URL
      }));

    console.log(`✅ Found ${tracks.length} tracks for "${query}"`);
    res.json(tracks.slice(0, 20)); // limit to top 20 for speed
  } catch (error) {
    console.error("❌ Audius fetch error:", error);
    res.status(500).json({ error: "Server error fetching Audius tracks" });
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