// --- DOM Elements ---
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const videoPlayer = document.getElementById("videoPlayer");

// --- Load Data on Page Load ---
window.onload = function () {
  loadTrending();
  loadPopular();
  loadRecent();
};

// --- TRENDING ---
async function loadTrending() {
  const res = await fetch("/api/trending");
  const data = await res.json();
  renderGrid("trendingGrid", data);
}

// --- POPULAR ---
async function loadPopular() {
  const res = await fetch("/api/popular");
  const data = await res.json();
  renderGrid("popularGrid", data);
}

// --- RECENT ---
async function loadRecent() {
  const res = await fetch("/api/recent");
  const data = await res.json();
  renderGrid("recentGrid", data);
}

// --- SEARCH (Live) ---
searchInput.addEventListener("input", async (e) => {
  const query = e.target.value.trim();
  if (!query) {
    searchResults.innerHTML = "";
    return;
  }
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    renderGrid("searchResults", data, true);
  } catch (err) {
    console.error(err);
  }
});

// --- RENDER GRID (Shared function) ---
function renderGrid(containerId, items, isSearch = false) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!items || items.length === 0) {
    container.innerHTML = `<p style="color:#666; grid-column:1/-1; text-align:center; padding:40px;">No results found.</p>`;
    return;
  }

  container.innerHTML = items
    .map(
      (item) => `
        <div class="anime-card" onclick="playAnime('${item.id}')">
          <img src="${item.image || "https://via.placeholder.com/200x300?text=No+Image"}" alt="${item.title}" loading="lazy" />
          <div class="anime-card-info">
            <h3>${item.title || "Unknown"}</h3>
            <span class="episode-badge">${item.episodes || item.totalEpisodes || "?"} eps</span>
          </div>
        </div>
      `
    )
    .join("");
}

// --- PLAY ANIME (Stream) ---
async function playAnime(animeId) {
  try {
    // Note: For Gogoanime, the ID is usually like "naruto-1". We'll request episode 1.
    // In a perfect world, we'd let users pick, but this gets it working.
    const episodeId = animeId + "-episode-1"; // Fallback
    const res = await fetch(`/api/stream?id=${encodeURIComponent(episodeId)}`);
    const data = await res.json();
    if (data.url) {
      videoPlayer.style.display = "block";
      videoPlayer.src = data.url;
      videoPlayer.play();
      // Scroll to player
      document.getElementById("playerContainer").scrollIntoView({ behavior: "smooth" });
    } else {
      alert("No stream found. Try a different anime.");
    }
  } catch (err) {
    alert("Error loading stream.");
    console.error(err);
  }
}
