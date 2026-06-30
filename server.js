require("dotenv").config();
const express = require("express");
const session = require("express-session");
const rateLimit = require("express-rate-limit");
const path = require("path");
const { ANIME } = require("@consumet/extensions");

const app = express();
const PORT = process.env.PORT || 3000;

const seriesRequests = [];

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.use(
  session({
    secret: "super-secret-crown-key",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use("/api/", limiter);

function isAuthenticated(req, res, next) {
  if (req.session.authenticated) return next();
  res.redirect("/login");
}

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.post("/login", (req, res) => {
  if (req.body.password === process.env.ACCESS_PASSWORD) {
    req.session.authenticated = true;
    res.redirect("/");
  } else {
    res.send("<h2>Wrong Password!</h2><a href='/login'>Try Again</a>");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

app.get("/", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/trending", isAuthenticated, async (req, res) => {
  try {
    const gogo = new ANIME.Gogoanime();
    const data = await gogo.fetchTopAiring();
    res.json(data.results || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/popular", isAuthenticated, async (req, res) => {
  try {
    const gogo = new ANIME.Gogoanime();
    const data = await gogo.fetchPopular();
    res.json(data.results || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/recent", isAuthenticated, async (req, res) => {
  try {
    const gogo = new ANIME.Gogoanime();
    const data = await gogo.fetchRecentEpisodes();
    res.json(data.results || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/search", isAuthenticated, async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.json([]);
    const gogo = new ANIME.Gogoanime();
    const results = await gogo.search(query);
    res.json(results.results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/anime/:id", isAuthenticated, async (req, res) => {
  try {
    const gogo = new ANIME.Gogoanime();
    const info = await gogo.fetchAnimeInfo(req.params.id);
    res.json(info);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/episodes/:id", isAuthenticated, async (req, res) => {
  try {
    const gogo = new ANIME.Gogoanime();
    const info = await gogo.fetchAnimeInfo(req.params.id);
    res.json(info.episodes || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/stream", isAuthenticated, async (req, res) => {
  try {
    const episodeId = req.query.id;
    if (!episodeId) return res.status(400).json({ error: "No ID provided" });
    const gogo = new ANIME.Gogoanime();
    const sources = await gogo.fetchEpisodeSources(episodeId);
    res.json({ url: sources.sources[0]?.url || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/request", isAuthenticated, (req, res) => {
  const { title, reason } = req.body;
  if (!title) return res.status(400).json({ error: "Title required" });
  seriesRequests.push({ title, reason, requestedAt: new Date() });
  res.json({ success: true, total: seriesRequests.length });
});

app.get("/api/requests", isAuthenticated, (req, res) => {
  res.json(seriesRequests);
});

app.listen(PORT, () =>
  console.log("👑 Crown Streamer running on port " + PORT)
);
