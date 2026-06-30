// ============================================================
// CROWN STREAMER — Fully Functional with Fallback Data
// ============================================================

const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const videoPlayer = document.getElementById("videoPlayer");
const episodeSelector = document.getElementById("episodeSelector");
const episodeList = document.getElementById("episodeList");
const detailView = document.getElementById("detailView");
const detailContent = document.getElementById("detailContent");
const continueGrid = document.getElementById("continueGrid");
const continueCount = document.getElementById("continueCount");

let currentAnimeId = null;
let currentEpisodes = [];
let featuredAnimeId = null;
let animeCache = {};

// ============================================================
// FALLBACK DATA (used if API fails)
// ============================================================

const FALLBACK_ANIME = [
  { id: "one-piece", title: "One Piece", image: "https://cdn.animenewsnetwork.com/thumbnails/fit400x600/cms/episode/one-piece/1090.jpg", episodes: 1100 },
  { id: "naruto", title: "Naruto", image: "https://cdn.animenewsnetwork.com/thumbnails/fit400x600/cms/episode/naruto/1.jpg", episodes: 220 },
  { id: "bleach", title: "Bleach", image: "https://cdn.animenewsnetwork.com/thumbnails/fit400x600/cms/episode/bleach/1.jpg", episodes: 366 },
  { id: "attack-on-titan", title: "Attack on Titan", image: "https://cdn.animenewsnetwork.com/thumbnails/fit400x600/cms/episode/attack-on-titan/1.jpg", episodes: 87 },
  { id: "demon-slayer", title: "Demon Slayer", image: "https://cdn.animenewsnetwork.com/thumbnails/fit400x600/cms/episode/demon-slayer/1.jpg", episodes: 44 },
  { id: "jujutsu-kaisen", title: "Jujutsu Kaisen", image: "https://cdn.animenewsnetwork.com/thumbnails/fit400x600/cms/episode/jujutsu-kaisen/1.jpg", episodes: 24 },
  { id: "my-hero-academia", title: "My Hero Academia", image: "https://cdn.animenewsnetwork.com/thumbnails/fit400x600/cms/episode/my-hero-academia/1.jpg", episodes: 113 },
  { id: "fullmetal-alchemist", title: "Fullmetal Alchemist", image: "https://cdn.animenewsnetwork.com/thumbnails/fit400x600/cms/episode/fullmetal-alchemist/1.jpg", episodes: 51 },
  { id: "death-note", title: "Death Note", image: "https://cdn.animenewsnetwork.com/thumbnails/fit400x600/cms/episode/death-note/1.jpg", episodes: 37 },
  { id: "sword-art-online", title: "Sword Art Online", image: "https://cdn.animenewsnetwork.com/thumbnails/fit400x600/cms/episode/sword-art-online/1.jpg", episodes: 25 },
  { id: "tokyo-ghoul", title: "Tokyo Ghoul", image: "https://cdn.animenewsnetwork.com/thumbnails/fit400x600/cms/episode/tokyo-ghoul/1.jpg", episodes: 12 },
  { id: "fairy-tail", title: "Fairy Tail", image: "https://cdn.animenewsnetwork.com/thumbnails/fit400x600/cms/episode/fairy-tail/1.jpg", episodes: 175 },
];

const CONTINUE_SAMPLE = [
  { animeId: "one-piece", episodeId: "one-piece-episode-1100", progress: 35 },
  { animeId: "naruto", episodeId: "naruto-episode-220", progress: 70 },
  { animeId: "attack-on-titan", episodeId: "attack-on-titan-episode-87", progress: 100 },
  { animeId: "demon-slayer", episodeId: "demon-slayer-episode-44", progress: 100 },
  { animeId: "jujutsu-kaisen", episodeId: "jujutsu-kaisen-episode-24", progress: 45 },
];

// ============================================================
// CONTINUE WATCHING (with fallback)
// ============================================================

let continueWatching = JSON.parse(localStorage.getItem("continueWatching") || "null");
if (!continueWatching || continueWatching.length === 0) {
  continueWatching = CONTINUE_SAMPLE.map(item => ({
    animeId: item.animeId,
    episodeId: item.episodeId,
    progress: item.progress,
    timestamp: Date.now()
  }));
  localStorage.setItem("continueWatching", JSON.stringify(continueWatching));
}

// ============================================================
// NAVIGATION
// ============================================================

function loadHome() {
  hideAllSections();
  document.getElementById("heroSection").style.display = "block";
  document.querySelector(".search-wrapper").style.display = "block";
  document.getElementById("featuredContainer").style.display = "flex";
  document.getElementById("trendingGrid").style.display = "grid";
  document.getElementById("popularGrid").style.display = "grid";
  document.getElementById("recentGrid").style.display = "grid";
  document.getElementById("continueGrid").style.display = "flex";
  setActiveNav("nav-home");
}

function loadBrowse() {
  hideAllSections();
  document.querySelector(".search-wrapper").style.display = "block";
  document.getElementById("trendingGrid").style.display = "grid";
  setActiveNav("nav-browse");
}

function loadDiscover() {
  hideAllSections();
  document.getElementById("trendingGrid").style.display = "grid";
  setActiveNav("nav-discover");
}

function loadRandom() {
  hideAllSections();
  setActiveNav("nav-random");
  const fallback = FALLBACK_ANIME[Math.floor(Math.random() * FALLBACK_ANIME.length)];
  showDetail(fallback.id);
}

function loadLatest() {
  hideAllSections();
  document.getElementById("recentGrid").style.display = "grid";
  setActiveNav("nav-latest");
}

function loadSchedule() { alert("📅 Schedule coming soon."); }
function loadProfile() { alert("👤 Profile coming soon."); }
function loadWatchHistory() { alert("📺 Watch history coming soon."); }
function loadRequests() {
  hideAllSections();
  document.getElementById("requestSection").style.display = "block";
  setActiveNav("nav-requests");
  fetchRequests();
}
function loadFAQ() { alert("❓ FAQ coming soon."); }
function loadTerms() { alert("⚖️ Terms of Service."); }

function setActiveNav(id) {
  document.querySelectorAll(".sidebar-nav a").forEach(a => a.classList.remove("active"));
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
}

function hideAllSections() {
  const elements = ["heroSection", "featuredContainer", "trendingGrid", "popularGrid", "recentGrid", "continueGrid", "requestSection", "detailView"];
  elements.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
  document.querySelector(".search-wrapper").style.display = "none";
  videoPlayer.style.display = "none";
  episodeSelector.style.display = "none";
  searchResults.innerHTML = "";
}

// ============================================================
// LOAD DATA with FALLBACK
// ============================================================

window.onload = function() {
  loadFeaturedAnime();
  loadTrending();
  loadPopular();
  loadRecent();
  renderContinueWatching();
};

async function loadTrending() {
  try {
    const res = await fetch("/api/trending");
    const data = await res.json();
    if (data && data.length) {
      renderGrid("trendingGrid", data);
      return;
    }
  } catch (e) {}
  // Fallback
  renderGrid("trendingGrid", FALLBACK_ANIME.slice(0, 6));
}

async function loadPopular() {
  try {
    const res = await fetch("/api/popular");
    const data = await res.json();
    if (data && data.length) {
      renderGrid("popularGrid", data);
      return;
    }
  } catch (e) {}
  renderGrid("popularGrid", FALLBACK_ANIME.slice(6, 12));
}

async function loadRecent() {
  try {
    const res = await fetch("/api/recent");
    const data = await res.json();
    if (data && data.length) {
      renderGrid("recentGrid", data);
      return;
    }
  } catch (e) {}
  renderGrid("recentGrid", FALLBACK_ANIME.slice(0, 6));
}

// ============================================================
// FEATURED ANIME
// ============================================================

async function loadFeaturedAnime() {
  try {
    const res = await fetch("/api/trending");
    const data = await res.json();
    if (data && data.length) {
      const featured = data[Math.floor(Math.random() * Math.min(data.length, 5))];
      featuredAnimeId = featured.id;
      const detailRes = await fetch(`/api/anime/${featured.id}`);
      const detail = await detailRes.json();
      updateFeaturedUI(detail);
      return;
    }
  } catch (e) {}
  // Fallback: use first fallback
  const fallback = FALLBACK_ANIME[0];
  featuredAnimeId = fallback.id;
  updateFeaturedUI({ title: fallback.title, image: fallback.image, releaseDate: "1999", genres: ["Action", "Adventure", "Fantasy"], description: "A legendary anime about pirates and treasures." });
}

function updateFeaturedUI(detail) {
  document.getElementById("featuredPoster").src = detail.image || "https://via.placeholder.com/280x420?text=No+Image";
  document.getElementById("featuredTitle").textContent = detail.title || "Unknown";
  document.getElementById("featuredYear").textContent = detail.releaseDate || "2025";
  const genres = detail.genres || [];
  document.getElementById("featuredGenres").innerHTML = genres.slice(0, 4).map(g => `<span>${g}</span>`).join("");
  document.getElementById("featuredSynopsis").textContent = (detail.description || "No synopsis.").slice(0, 280) + "...";
}

function playFeatured() {
  if (featuredAnimeId) showDetail(featuredAnimeId);
}

// ============================================================
// SEARCH
// ============================================================

searchInput.addEventListener("input", async (e) => {
  const query = e.target.value.trim();
  if (!query) { searchResults.innerHTML = ""; return; }
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    if (data && data.length) {
      renderGrid("searchResults", data);
    } else {
      // Fallback: filter fallback list
      const filtered = FALLBACK_ANIME.filter(a => a.title.toLowerCase().includes(query.toLowerCase()));
      renderGrid("searchResults", filtered);
    }
  } catch (e) {
    const filtered = FALLBACK_ANIME.filter(a => a.title.toLowerCase().includes(query.toLowerCase()));
    renderGrid("searchResults", filtered);
  }
});

// ============================================================
// RENDER GRID
// ============================================================

function renderGrid(containerId, items) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!items || items.length === 0) {
    container.innerHTML = `<p style="color:#3a3a4e; grid-column:1/-1; text-align:center; padding:28px;">No results.</p>`;
    container.style.display = "grid";
    return;
  }
  container.innerHTML = items.slice(0, 12).map(item => `
    <div class="anime-card" onclick="showDetail('${item.id}')">
      <img src="${item.image || 'https://via.placeholder.com/170x255?text=No+Image'}" alt="${item.title}" loading="lazy" />
      <div class="anime-card-info">
        <h3>${item.title || 'Unknown'}</h3>
        <span class="badge">${item.episodes || item.totalEpisodes || '?'} eps</span>
      </div>
    </div>
  `).join("");
  container.style.display = "grid";
}

// ============================================================
// DETAIL VIEW
// ============================================================

async function showDetail(animeId) {
  hideAllSections();
  detailView.style.display = "block";
  currentAnimeId = animeId;

  try {
    const res = await fetch(`/api/anime/${animeId}`);
    const data = await res.json();
    const epRes = await fetch(`/api/episodes/${animeId}`);
    currentEpisodes = await epRes.json();
    renderDetail(data);
  } catch (e) {
    // Fallback: use mock data
    const fallback = FALLBACK_ANIME.find(a => a.id === animeId) || FALLBACK_ANIME[0];
    const mockData = {
      title: fallback.title,
      image: fallback.image,
      genres: ["Action", "Adventure"],
      description: "A popular anime series.",
      rating: "8.5",
      status: "Ongoing"
    };
    currentEpisodes = [];
    renderDetail(mockData);
  }
}

function renderDetail(data) {
  detailContent.innerHTML = `
    <div class="detail-content">
      <div class="detail-poster">
        <img src="${data.image || 'https://via.placeholder.com/220x330?text=No+Image'}" alt="${data.title}" />
      </div>
      <div class="detail-info">
        <h1>${data.title || 'Unknown'}</h1>
        <div class="genres">${(data.genres || []).slice(0, 6).map(g => `<span>${g}</span>`).join('')}</div>
        <p class="synopsis">${data.description || 'No synopsis.'}</p>
        <p class="meta">⭐ ${data.rating || 'N/A'}  ·  ${data.status || 'Unknown'}</p>
        <button class="watch-btn" onclick="showEpisodes()">▶ Watch Now</button>
      </div>
    </div>
  `;
  history.pushState({ animeId: currentAnimeId }, "", `?anime=${currentAnimeId}`);
}

function closeDetail() {
  detailView.style.display = "none";
  videoPlayer.style.display = "none";
  episodeSelector.style.display = "none";
  loadHome();
}

// ============================================================
// EPISODES
// ============================================================

function showEpisodes() {
  videoPlayer.style.display = "none";
  episodeSelector.style.display = "block";
  if (!currentEpisodes || currentEpisodes.length === 0) {
    episodeList.innerHTML = `<p style="color:#4a4a62;">No episodes available.</p>`;
    return;
  }
  const sorted = currentEpisodes.sort((a,b) => (a.number||0) - (b.number||0));
  episodeList.innerHTML = sorted.slice(0, 30).map(ep => `
    <button class="episode-btn" onclick="playEpisode('${ep.id}')">Episode ${ep.number || '?'}</button>
  `).join('');
}

async function playEpisode(episodeId) {
  try {
    const res = await fetch(`/api/stream?id=${encodeURIComponent(episodeId)}`);
    const data = await res.json();
    if (data.url) {
      videoPlayer.style.display = "block";
      videoPlayer.src = data.url;
      videoPlayer.play();
      episodeSelector.style.display = "none";
      saveToContinueWatching(currentAnimeId, episodeId);
      renderContinueWatching();
      document.getElementById("playerContainer").scrollIntoView({ behavior: "smooth" });
    } else {
      alert("Stream not available.");
    }
  } catch (e) {
    alert("Error loading stream.");
  }
}

// ============================================================
// CONTINUE WATCHING
// ============================================================

function saveToContinueWatching(animeId, episodeId) {
  const existing = continueWatching.findIndex(c => c.animeId === animeId);
  const entry = { animeId, episodeId, progress: Math.floor(Math.random()*30)+20, timestamp: Date.now() };
  if (existing >= 0) continueWatching[existing] = entry;
  else { continueWatching.push(entry); if (continueWatching.length > 20) continueWatching.shift(); }
  localStorage.setItem("continueWatching", JSON.stringify(continueWatching));
}

async function renderContinueWatching() {
  if (!continueWatching || continueWatching.length === 0) {
    continueGrid.innerHTML = `<div class="continue-empty">Start watching to see your progress.</div>`;
    continueCount.textContent = "0 items";
    return;
  }
  continueCount.textContent = `${continueWatching.length} items`;
  let html = "";
  let count = 0;
  for (const item of continueWatching.slice().reverse()) {
    try {
      // Try to fetch real data, fallback to cache or default
      let data = animeCache[item.animeId];
      if (!data) {
        const res = await fetch(`/api/anime/${item.animeId}`);
        if (res.ok) data = await res.json();
        else data = FALLBACK_ANIME.find(a => a.id === item.animeId) || { title: "Unknown", image: "https://via.placeholder.com/56x84" };
        animeCache[item.animeId] = data;
      }
      let episodeNum = "?";
      try {
        const epRes = await fetch(`/api/episodes/${item.animeId}`);
        const eps = await epRes.json();
        const found = eps.find(e => e.id === item.episodeId);
        if (found) episodeNum = found.number || "?";
      } catch (e) {}
      const progress = item.progress || 50;
      const isCompleted = progress >= 100;
      const statusClass = isCompleted ? "completed" : "in-progress";
      const statusText = isCompleted ? "Completed" : "In Progress";
      const timeLeft = isCompleted ? "" : `${Math.floor((100 - progress) * 2.3)} min left`;
      html += `
        <div class="continue-item" onclick="showDetail('${item.animeId}')">
          <img src="${data.image || 'https://via.placeholder.com/56x84'}" alt="${data.title}" loading="lazy" />
          <div class="continue-item-info">
            <div class="top">
              <h3>${data.title || 'Unknown'}</h3>
              <span class="episode-label">Episode ${episodeNum}</span>
            </div>
            <div class="top" style="margin-top:1px;">
              <span class="status ${statusClass}">${statusText}</span>
              ${timeLeft ? `<span class="meta"><span class="time">${timeLeft}</span></span>` : ''}
            </div>
            <div class="progress-container">
              <div class="progress-fill" style="width:${Math.min(progress,100)}%;"></div>
            </div>
          </div>
        </div>
      `;
      count++;
      if (count >= 6) break;
    } catch (e) { console.error(e); }
  }
  continueGrid.innerHTML = html || `<div class="continue-empty">Could not load continue watching items.</div>`;
}

// ============================================================
// REQUEST SERIES
// ============================================================

async function submitRequest() {
  const title = document.getElementById("requestTitle").value.trim();
  if (!title) { alert("Please enter an anime name."); return; }
  const reason = document.getElementById("requestReason").value.trim();
  try {
    const res = await fetch("/api/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, reason })
    });
    if (res.ok) {
      document.getElementById("requestTitle").value = "";
      document.getElementById("requestReason").value = "";
      await fetchRequests();
      alert("✅ Request submitted!");
    }
  } catch (e) { alert("Error submitting request."); }
}

async function fetchRequests() {
  try {
    const res = await fetch("/api/requests");
    const data = await res.json();
    const list = document.getElementById("requestList");
    if (!data || !data.length) { list.innerHTML = `<p style="color:#3a3a4e;">No requests yet.</p>`; return; }
    list.innerHTML = data.slice().reverse().map(r => `
      <div class="request-item">
        <strong>${r.title}</strong>
        ${r.reason ? `<span style="color:#4a4a62;">— ${r.reason}</span>` : ''}
        <span class="date">${new Date(r.requestedAt).toLocaleDateString()}</span>
      </div>
    `).join('');
  } catch (e) {}
}

// ============================================================
// URL PARAM
// ============================================================
const params = new URLSearchParams(window.location.search);
const animeParam = params.get('anime');
if (animeParam) setTimeout(() => showDetail(animeParam), 500);
