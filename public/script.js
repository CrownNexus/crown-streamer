const searchInput = document.getElementById('searchInput');
const resultsDiv = document.getElementById('results');
const videoPlayer = document.getElementById('videoPlayer');

searchInput.addEventListener('input', async (e) => {
    const query = e.target.value.trim();
    if (!query) { resultsDiv.innerHTML = ''; return; }
    try {
        const res = await fetch(/api/search?q=);
        const data = await res.json();
        resultsDiv.innerHTML = data.map(anime => 
            <div onclick="playAnime('')">
                <img src="" alt="" onerror="this.src='https://via.placeholder.com/150'">
                <p></p>
            </div>
        ).join('');
    } catch (err) { console.error(err); }
});

async function playAnime(animeId) {
    try {
        const res = await fetch(/api/stream?id=);
        const data = await res.json();
        if (data.url) {
            videoPlayer.style.display = 'block';
            videoPlayer.src = data.url;
            videoPlayer.play();
        } else {
            alert('No stream found for this anime.');
        }
    } catch (err) {
        alert('Error loading stream.');
        console.error(err);
    }
}
