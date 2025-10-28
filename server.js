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
    console.log(`🎧 Serving local sample music for query: ${query}`);

    // ✅ Local sample list (real playable MP3s from Free Music Archive)
    const allTracks = [
      {
        id: "1",
        title: "Chillwave Sunrise",
        artist: "Loyalty Freak Music",
        genre: "Electronic",
        audio_url:
          "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Loyalty_Freak_Music/LOFI_and_LAYERS/Loyalty_Freak_Music_-_01_-_Chillwave_Sunrise.mp3",
      },
      {
        id: "2",
        title: "Ambient Dreamscape",
        artist: "Kabbalistic Village",
        genre: "Ambient",
        audio_url:
          "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Kabbalistic_Village/Meditations/Kabbalistic_Village_-_01_-_Ambient_Dreamscape.mp3",
      },
      {
        id: "3",
        title: "Night Ride",
        artist: "Scott Holmes Music",
        genre: "Cinematic",
        audio_url:
          "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Scott_Holmes_Music/Energy/Scott_Holmes_Music_-_01_-_Night_Ride.mp3",
      },
      {
        id: "4",
        title: "Peaceful Piano",
        artist: "Kevin MacLeod",
        genre: "Classical",
        audio_url:
          "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Kevin_MacLeod/Classical_Sampler/Kevin_MacLeod_-_Peaceful_Piano.mp3",
      },
    ];

    const filtered = allTracks.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.artist.toLowerCase().includes(query) ||
        t.genre.toLowerCase().includes(query)
    );

    res.json(filtered.length ? filtered : allTracks);
  } catch (error) {
    console.error("❌ Local track error:", error);
    res.status(500).json({ error: "Server error" });
  }
});
// ✅ Start server
app.listen(PORT, () => {
  console.log(`🎧 Music Mania Backend running on port ${PORT}`);
});
