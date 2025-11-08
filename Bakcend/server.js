import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

// ✅ Root check
app.get("/", (req, res) => {
  res.send("🎧 Music Mania backend is running!");
});

// 🌍 Multiple Audius discovery nodes (fallback system)
const discoveryNodes = [
  "https://audius-discovery-1.cdn.audius.co",
  "https://audius-discovery-2.cdn.audius.co",
  "https://audius-discovery-3.cdn.audius.co",
];

async function fetchWithFallback(endpoint) {
  for (const node of discoveryNodes) {
    try {
      const res = await fetch(`${node}${endpoint}`);
      if (res.ok) {
        console.log(`✅ Using node: ${node}`);
        return await res.json();
      } else {
        console.warn(`⚠️ Node ${node} returned ${res.status}`);
      }
    } catch (e) {
      console.warn(`❌ Node failed: ${node}`, e.message);
    }
  }
  throw new Error("All Audius nodes failed");
}

// ✅ Trending songs (Audius)
app.get("/api/trending", async (req, res) => {
  try {
    const data = await fetchWithFallback("/v1/tracks/trending?app_name=MusicMania");
    res.json(data);
  } catch (err) {
    console.error("Trending fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch trending songs" });
  }
});

// ✅ Discover songs (Free Music Archive)
app.get("/api/discover", async (req, res) => {
  try {
    const response = await fetch("https://freemusicarchive.org/api/get/tracks.json?limit=10");
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Discover fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch discover songs" });
  }
});

// ✅ Search songs (Audius)
app.get("/api/music", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Missing query" });

  try {
    const data = await fetchWithFallback(
      `/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=MusicMania`
    );

    const tracks = (data?.data || []).map((t) => ({
      id: t.id,
      title: t.title,
      artist: t.user?.name || "Unknown Artist",
      image:
        t.artwork?.["480x480"] ||
        t.artwork?.["150x150"] ||
        "https://cdn-icons-png.flaticon.com/512/727/727245.png",
      audio_url: `/proxy-audio?url=${encodeURIComponent(
        `https://audius-discovery-1.cdn.audius.co/v1/tracks/${t.id}/stream`
      )}`,
    }));

    res.json({ tracks });
  } catch (err) {
    console.error("Search fetch error:", err.message);
    res.status(500).json({ error: "Failed to search songs" });
  }
});

// ✅ Audio proxy (bypass CORS)
app.get("/proxy-audio", async (req, res) => {
  const audioUrl = req.query.url;
  if (!audioUrl) return res.status(400).send("Missing URL");

  try {
    const response = await fetch(audioUrl);
    if (!response.ok) throw new Error("Audio fetch failed");

    const contentType = response.headers.get("content-type") || "audio/mpeg";
    res.setHeader("Content-Type", contentType);
    response.body.pipe(res);
  } catch (err) {
    console.error("Proxy error:", err.message);
    res.status(500).send("Proxy failed");
  }
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Music Mania backend running on port ${PORT}`)
);