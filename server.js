import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;     // e.g. http://localhost:3000/callback
const FRONTEND_URI = process.env.FRONTEND_URI;     // e.g. http://127.0.0.1:5500

// ====== 1. LOGIN - redirect to Spotify authorize page ======
app.get("/login", (req, res) => {
  const scopes = [
    "user-read-private",
    "user-read-email",
    "streaming",
    "user-read-playback-state",
    "user-modify-playback-state",
  ].join(" ");

  const authUrl =
    "https://accounts.spotify.com/authorize?" +
    new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID,
      scope: scopes,
      redirect_uri: REDIRECT_URI,
    });

  res.redirect(authUrl);
});

// ====== 2. CALLBACK - exchange code for tokens ======
app.get("/callback", async (req, res) => {
  const code = req.query.code || null;

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const tokenData = await tokenResponse.json();

  if (tokenData.error) {
    console.error("Token exchange error:", tokenData);
    return res.status(400).send("Error fetching token");
  }

  // Redirect back to frontend with tokens in query string
  const redirectUrl = `${FRONTEND_URI}?access_token=${tokenData.access_token}&refresh_token=${tokenData.refresh_token}`;
  res.redirect(redirectUrl);
});

// ====== 3. OPTIONAL: Refresh token endpoint ======
app.get("/refresh_token", async (req, res) => {
  const refresh_token = req.query.refresh_token;

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  const refreshResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data = await refreshResponse.json();
  res.json(data);
});

// ====== Start Server ======
const PORT = 3001;
app.listen(PORT, () => console.log(` Backend running at http://localhost:${PORT}`));
