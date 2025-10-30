import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3001;

// ✅ Search songs (Audius API)
app.get("/api/music", async (req, res) => {
  try {
    const query = req.query.q || "chill";
    console.log("🔍 Searching for:", query);

    const url = `https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(
      query
    )}&app_name=MusicMania&limit=20`;

    const response = await fetch(url);
    const json = await response.json();

    if (!json || !json.data) return res.json([]);

    const tracks = json.data.map((t) => ({
      id: t.id,
      title: t.title,
      artist: t.user?.name || "Unknown",
      artwork: t.artwork?.["150x150"] || t.artwork?.["480x480"] || "",
      genre: t.genre || "",
      audio_url: `https://audius-discovery-2.cdn.audius.co/v1/tracks/${t.id}/stream`,
    }));

    res.json(tracks);
  } catch (err) {
    console.error("❌ Music fetch failed:", err);
    res.status(500).json({ error: "Failed to fetch music" });
  }
});

// ✅ Trending songs (Top 20 this week)
app.get("/api/trending", async (req, res) => {
  try {
    console.log("🔥 Fetching trending songs...");
    const url =
      "https://discoveryprovider.audius.co/v1/tracks/trending?app_name=MusicMania&limit=20";
    const response = await fetch(url);
    const json = await response.json();

    if (!json || !json.data) return res.json([]);

    const tracks = json.data.map((t) => ({
      id: t.id,
      title: t.title,
      artist: t.user?.name || "Unknown",
      artwork: t.artwork?.["150x150"] || t.artwork?.["480x480"] || "",
      genre: t.genre || "",
      audio_url: `https://audius-discovery-2.cdn.audius.co/v1/tracks/${t.id}/stream`,
    }));

    res.json(tracks);
  } catch (err) {
    console.error("❌ Trending fetch failed:", err);
    res.status(500).json({ error: "Failed to fetch trending songs" });
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