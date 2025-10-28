import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors({
  origin: [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "https://musicmania.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());

// ====== Pixabay Music Proxy Route ======
const PIXABAY_KEY = process.env.PIXABAY_KEY;

app.get("/api/music", async (req, res) => {
  try {
    const query = req.query.q || "chill";
    const url = `https://pixabay.com/api/music/?key=${PIXABAY_KEY}&q=${encodeURIComponent(query)}&per_page=10`;
    console.log("🔍 Fetching from Pixabay:", url);
    const response = await fetch(url);
    const data = await response.json();
   console.log("✅ Pixabay response:", data);
   
    res.json(data);
  } catch (error) {
    console.error("Pixabay fetch error:", error);
    res.status(500).json({ error: "Failed to fetch music" });
  }
});

// ====== Test route ======
app.get("/", (req, res) => {
  res.send("🎧 Music Mania Backend (Pixabay API connected)");
});

// ====== Start Server ======
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Backend running at http://localhost:${PORT}`));
