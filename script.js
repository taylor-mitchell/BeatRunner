const clientId = '8faed0544bc14684a6e31ba2c8ad8685'; // Replace with your Spotify client ID
const redirectUri = 'https://taylor-mitchell.github.io/BeatRunner/'; // Replace with your redirect URI
const scopes = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative';

function loginToSpotify() {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&response_type=token`;
    window.location.href = authUrl;
    localStorage.setItem('spotifyToken', 'your-token-here'); // Example token
    document.getElementById('playlist-section').classList.remove('hidden');
    document.getElementById('logoutButton').classList.remove('hidden'); // Show logout button
    this.classList.add('hidden'); // Hide login button
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

document.getElementById('filter-btn').addEventListener('click', async () => {
    const bpm = parseFloat(document.getElementById('bpm-input').value);
    const playlistId = document.getElementById('playlist-dropdown').value;
    const accessToken = localStorage.getItem('spotifyAccessToken');

    if (isNaN(bpm) || bpm <= 0) {
        alert('Please enter a valid BPM.');
        return;
    }

    const filteredTracks = await getFilteredTracks(playlistId, bpm, accessToken);
    displayFilteredTracks(filteredTracks);
});

async function getFilteredTracks(playlistId, targetBPM, accessToken) {
    const trackIds = await fetchTrackIds(playlistId, accessToken);
    const audioFeatures = await fetchAudioFeatures(trackIds, accessToken);

    // Define the acceptable range for BPM (e.g., ±5 BPM)
    const bpmRange = 10;
    const lowerBound = targetBPM - bpmRange;
    const upperBound = targetBPM + bpmRange;

    // Filter tracks based on BPM range
    const filteredTrackIds = audioFeatures
        .filter(feature => feature.tempo >= lowerBound && feature.tempo <= upperBound)
        .map(feature => feature.id); // Store the track IDs that match

    // Fetch track details for filtered track IDs
    const filteredTrackDetails = await fetchTrackDetails(filteredTrackIds, accessToken);
    console.log(filteredTrackDetails.length);
    return filteredTrackDetails;
}

async function fetchTrackIds(playlistId, accessToken) {
    console.log("fetching track IDs");
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (response.ok) {
        const data = await response.json();
        console.log("Track IDs fetched");
        return data.items.map(item => item.track.id);
    } else {
        console.error('Failed to fetch tracks:', response.status, response.statusText);
        return [];
    }
}

async function fetchAudioFeatures(trackIds, accessToken) {
    console.log("fetching Audio Features");
    const response = await fetch(`https://api.spotify.com/v1/audio-features?ids=${trackIds.join(',')}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (response.ok) {
        console.log("Audio Features fetched");
        const data = await response.json();
        return data.audio_features;
    } else {
        console.error('Failed to fetch audio features:', response.status, response.statusText);
        return [];
    }
}

async function fetchTrackDetails(trackIds, accessToken) {
    const response = await fetch(`https://api.spotify.com/v1/tracks?ids=${trackIds.join(',')}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (response.ok) {
        const data = await response.json();
        return data.tracks; // This contains track details including name and artists
    } else {
        console.error('Failed to fetch track details:', response.status, response.statusText);
        return [];
    }
}

function displayFilteredTracks(tracks) {
    const songList = document.getElementById('song-list');
    songList.innerHTML = ''; // Clear previous results

    if (tracks.length === 0) {
        songList.innerHTML = '<li>No tracks found in this BPM range.</li>';
        return;
    }

    tracks.forEach(track => {
        const li = document.createElement('li');
        li.textContent = `${track.name} by ${track.artists.map(artist => artist.name).join(', ')}`;
        songList.appendChild(li);
    });

    document.getElementById('results').classList.remove('hidden');
}

// Function to show/hide sections based on state
function toggleSection(sectionId, show) {
    const section = document.getElementById(sectionId);
    section.classList.toggle('hidden', !show);
}

function logout() {
    // Clear user session data
    localStorage.removeItem('spotifyToken');
    // Redirect to the login page or refresh
    window.location.reload(); // Refreshing the page for demonstration
}

// Event listener for the logout button
document.getElementById('logoutButton').addEventListener('click', logout);


