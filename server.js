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
    const url = "https://cdn.jsdelivr.net/gh/publicdata/music-sample-db@main/fma_tracks.json";
    console.log("Fetching:", url);

    const response = await fetch(url);
    console.log("Response status:", response.status, response.statusText);

    const text = await response.text();
    console.log("First 200 chars of body:", text.slice(0, 200));

    // Try to parse JSON
    const data = JSON.parse(text);
    console.log("Parsed data length:", Array.isArray(data) ? data.length : "not array");

    res.json(data.slice(0, 5));
  } catch (error) {
    console.error("Detailed fetch error:", error);
    res.status(500).json({ error: error.message });
  }
});
// ✅ Start server
app.listen(PORT, () => {
  console.log(`🎧 Music Mania Backend running on port ${PORT}`);
});
