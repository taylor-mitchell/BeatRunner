const clientId = 'YOUR_SPOTIFY_CLIENT_ID'; // Replace with your Spotify client ID
const redirectUri = 'YOUR_REDIRECT_URI'; // Replace with your redirect URI
const scopes = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative';

function loginToSpotify() {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&response_type=token`;
    window.location.href = authUrl;
}

function handleRedirect() {
    const hash = window.location.hash;
    if (hash) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');

        if (accessToken) {
            // Store the access token for future API calls
            localStorage.setItem('spotifyAccessToken', accessToken);
            document.getElementById('playlist-section').classList.remove('hidden');
            document.getElementById('login').classList.add('hidden');
            fetchPlaylists(accessToken);
        }
    }
}

async function fetchPlaylists(accessToken) {
    const response = await fetch('https://api.spotify.com/v1/me/playlists', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (response.ok) {
        const data = await response.json();
        const playlistDropdown = document.getElementById('playlist-dropdown');
        playlistDropdown.innerHTML = '';

        data.items.forEach(playlist => {
            const option = document.createElement('option');
            option.value = playlist.id;
            option.textContent = playlist.name;
            playlistDropdown.appendChild(option);
        });
    } else {
        console.error('Failed to fetch playlists:', response.status, response.statusText);
    }
}

// Event listener for login button
document.getElementById('login').addEventListener('click', loginToSpotify);

// Handle the redirect to extract the access token
window.addEventListener('load', handleRedirect);

document.getElementById('filter-btn').addEventListener('click', () => {
    const bpm = document.getElementById('bpm-input').value;
    const playlistId = document.getElementById('playlist-dropdown').value;

    // Implement filtering logic here
});

// Function to show/hide sections based on state
function toggleSection(sectionId, show) {
    const section = document.getElementById(sectionId);
    section.classList.toggle('hidden', !show);
}
