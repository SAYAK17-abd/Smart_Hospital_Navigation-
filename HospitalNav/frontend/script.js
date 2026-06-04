
// ========== MAP INITIALIZATION ==========
let map = L.map('map').setView([22.57, 88.36], 13);

let currentTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png').addTo(map);

let userLat = null;
let userLng = null;
let routeLine = null;
let hospitalMarkers = [];
let allHospitals = [];
let favorites = [];
let history = [];
let comparisonList = [];
let settings = {
    sound: true,
    traffic: true,
    voice: true
};

// ========== API CONFIGURATION ==========
const API_ROUTES = {
    search: 'http://127.0.0.1:5000/hospitals'
};

// ========== LOAD DATA FROM STORAGE ==========
function loadData() {
    const savedFavorites = localStorage.getItem('smartnav_favorites');
    const savedHistory = localStorage.getItem('smartnav_history');
    const savedSettings = localStorage.getItem('smartnav_settings');
    
    if (savedFavorites) favorites = JSON.parse(savedFavorites);
    if (savedHistory) history = JSON.parse(savedHistory);
    if (savedSettings) settings = { ...settings, ...JSON.parse(savedSettings) };
    
    // Apply settings
    document.getElementById('soundToggle').checked = settings.sound;
    document.getElementById('trafficToggle').checked = settings.traffic;
    document.getElementById('voiceToggle').checked = settings.voice;
}

function saveSetting(key, value) {
    settings[key] = value;
    localStorage.setItem('smartnav_settings', JSON.stringify(settings));
}

// ========== PANEL MANAGEMENT ==========
function toggleFavoritesPanel() {
    const panel = document.getElementById('favoritesPanel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    if (panel.style.display === 'block') {
        updateFavoritesList();
    }
}

function toggleHistoryPanel() {
    const panel = document.getElementById('historyPanel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    if (panel.style.display === 'block') {
        updateHistoryList();
    }
}

function toggleSettingsPanel() {
    const panel = document.getElementById('settingsPanel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

// ========== FAVORITES SYSTEM ==========
function addToFavorites(hospital) {
    if (!favorites.find(h => h.id === hospital.id)) {
        favorites.push(hospital);
        localStorage.setItem('smartnav_favorites', JSON.stringify(favorites));
        showStatus(`⭐ Added "${hospital.name}" to favorites!`, 'success');
        updateFavoritesList();
    } else {
        showStatus('Already in favorites!', 'info');
    }
}

function removeFromFavorites(hospitalId) {
    favorites = favorites.filter(h => h.id !== hospitalId);
    localStorage.setItem('smartnav_favorites', JSON.stringify(favorites));
    updateFavoritesList();
}

function updateFavoritesList() {
    const list = document.getElementById('favoritesList');
    if (favorites.length === 0) {
        list.innerHTML = '<p style="color: #9db4d4;">No favorites yet.</p>';
        return;
    }
    
    list.innerHTML = favorites.map(h => `
        <div class="favorite-item" onclick="navigateToFavorite(${h.lat}, ${h.lon})">
            <b>${h.name}</b>
            ⭐ ${h.rating} | 📍 ${h.type}
            <span class="favorite-remove" onclick="event.stopPropagation(); removeFromFavorites('${h.id}')">✕</span>
        </div>
    `).join('');
}

function navigateToFavorite(lat, lon) {
    routeTo(lat, lon);
    toggleFavoritesPanel();
}

// ========== HISTORY SYSTEM ==========
function addToHistory(hospital) {
    // Remove if already exists
    history = history.filter(h => h.id !== hospital.id);
    // Add to beginning
    history.unshift({ ...hospital, timestamp: new Date().toLocaleTimeString() });
    // Keep only last 10
    history = history.slice(0, 10);
    localStorage.setItem('smartnav_history', JSON.stringify(history));
    updateHistoryList();
}

function updateHistoryList() {
    const list = document.getElementById('historyList');
    if (history.length === 0) {
        list.innerHTML = '<p style="color: #9db4d4;">No history yet.</p>';
        return;
    }
    
    list.innerHTML = history.map(h => `
        <div class="history-item" onclick="routeTo(${h.lat}, ${h.lon}); toggleHistoryPanel()">
            <b>${h.name}</b>
            ⏰ ${h.timestamp}
        </div>
    `).join('');
}

// ========== SEARCH BY NAME ==========
function searchHospitalByName(query) {
    if (!query) {
        hospitalMarkers.forEach(m => m.setOpacity(1));
        return;
    }
    
    const lowerQuery = query.toLowerCase();
    
    // Create a set of matching hospital names
    const matchingNames = new Set(
        allHospitals.filter(h => h.name.toLowerCase().includes(lowerQuery)).map(h => h.name)
    );
    
    // Filter markers based on hospital data
    hospitalMarkers.forEach((marker, idx) => {
        if (idx < allHospitals.length && matchingNames.has(allHospitals[idx].name)) {
            marker.setOpacity(1);
        } else {
            marker.setOpacity(0.3);
        }
    });
}

// ========== HOSPITAL DETAILS MODAL ==========
let currentHospitalModal = null;

function showHospitalDetails(hospital) {
    const modal = document.getElementById('hospitalModal');
    const body = document.getElementById('hospitalModalBody');
    currentHospitalModal = hospital;
    
    const isFavorite = favorites.find(h => h.id === hospital.id);
    
    body.innerHTML = `
        <div class="hospital-details">
            <h3>${hospital.name}</h3>
            
            <div class="detail-row">
                <strong>Rating:</strong>
                <span>⭐ ${hospital.rating}/5.0</span>
            </div>
            
            <div class="detail-row">
                <strong>Type:</strong>
                <span>${hospital.type === 'govt' ? '🏛️ Government' : '💼 Private'}</span>
            </div>
            
            <div class="detail-row">
                <strong>Speciality:</strong>
                <span>${hospital.speciality || 'General'}</span>
            </div>
            
            <div class="detail-row">
                <strong>Distance:</strong>
                <span>${(hospital.dist * 111).toFixed(2)} km</span>
            </div>
            
            <div class="detail-row">
                <strong>Beds Available:</strong>
                <span>🛏️ ${Math.floor(Math.random() * 50 + 5)}</span>
            </div>
            
            <div class="detail-row">
                <strong>Avg Wait Time:</strong>
                <span>⏱️ ${Math.floor(Math.random() * 60 + 15)} min</span>
            </div>
            
            <div class="detail-row">
                <strong>Phone:</strong>
                <span>📞 +91 ${String(Math.floor(Math.random() * 10000000000)).padStart(10, '0')}</span>
            </div>
            
            <div class="detail-actions">
                <button onclick="routeTo(${hospital.lat}, ${hospital.lon}); closeHospitalModal();">🚗 Navigate</button>
                <button onclick="callHospital('${hospital.name}')">📞 Call</button>
                <button onclick="toggleFavoriteFromModal()">${isFavorite ? '✕ Remove' : '⭐ Add'} Favorite</button>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

function toggleFavoriteFromModal() {
    if (!currentHospitalModal) return;
    const isFavorite = favorites.find(h => h.id === currentHospitalModal.id);
    if (isFavorite) {
        removeFromFavorites(currentHospitalModal.id);
    } else {
        addToFavorites(currentHospitalModal);
    }
    showHospitalDetails(currentHospitalModal);
}

function closeHospitalModal() {
    document.getElementById('hospitalModal').style.display = 'none';
}

// ========== COMPARISON SYSTEM ==========
function addToComparison(hospital) {
    if (!comparisonList.find(h => h.id === hospital.id)) {
        comparisonList.push(hospital);
        updateComparisonBox();
    }
}

function updateComparisonBox() {
    const box = document.getElementById('comparisonBox');
    const list = document.getElementById('comparisonList');
    
    if (comparisonList.length === 0) {
        box.classList.remove('active');
        return;
    }
    
    box.classList.add('active');
    list.innerHTML = comparisonList.map(h => `
        <div style="padding: 4px 0; font-size: 11px;">
            • ${h.name.substring(0, 20)}... 
            <span onclick="comparisonList = comparisonList.filter(x => x.id !== '${h.id}'); updateComparisonBox();" style="cursor: pointer; color: var(--danger);">✕</span>
        </div>
    `).join('');
}

function compareHospitals() {
    if (comparisonList.length < 2) {
        showStatus('❌ Select at least 2 hospitals to compare', 'error');
        return;
    }
    
    const modal = document.getElementById('comparisonModal');
    const table = document.getElementById('comparisonTable');
    
    let html = '<table class="comparison-table"><tr><th>Property</th>';
    comparisonList.forEach(h => {
        html += `<th>${h.name.substring(0, 15)}...</th>`;
    });
    html += '</tr>';
    
    const properties = ['Rating', 'Type', 'Distance', 'Beds', 'Wait Time'];
    properties.forEach(prop => {
        html += '<tr><td><strong>' + prop + '</strong></td>';
        comparisonList.forEach(h => {
            let value = '';
            switch(prop) {
                case 'Rating': value = `⭐ ${h.rating}`; break;
                case 'Type': value = h.type === 'govt' ? '🏛️ Govt' : '💼 Private'; break;
                case 'Distance': value = (h.dist * 111).toFixed(1) + ' km'; break;
                case 'Beds': value = Math.floor(Math.random() * 50 + 5); break;
                case 'Wait Time': value = Math.floor(Math.random() * 60 + 15) + ' min'; break;
            }
            html += `<td>${value}</td>`;
        });
        html += '</tr>';
    });
    
    html += '</table>';
    table.innerHTML = html;
    modal.style.display = 'flex';
}

function clearComparison() {
    comparisonList = [];
    updateComparisonBox();
}

function closeComparisonModal() {
    document.getElementById('comparisonModal').style.display = 'none';
}

// ========== CALL HOSPITAL ==========
function callHospital(hospitalName) {
    const phone = '+91' + String(Math.floor(Math.random() * 10000000000)).padStart(10, '0');
    showStatus(`📞 Calling ${hospitalName}...<br>Phone: ${phone}`, 'success');
    
    if (settings.voice) {
        speak(`Calling ${hospitalName}`);
    }
}

// ========== SATELLITE VIEW ==========
function toggleSatelliteView(enabled) {
    map.removeLayer(currentTileLayer);
    
    if (enabled) {
        currentTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}').addTo(map);
    } else {
        currentTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png').addTo(map);
    }
}

// ========== CLEAR ALL DATA ==========
function clearAllData() {
    if (confirm('⚠️ This will clear all your data (favorites, history). Are you sure?')) {
        favorites = [];
        history = [];
        comparisonList = [];
        localStorage.removeItem('smartnav_favorites');
        localStorage.removeItem('smartnav_history');
        updateFavoritesList();
        updateHistoryList();
        updateComparisonBox();
        showStatus('✅ All data cleared!', 'success');
    }
}

// ========== HELPER: Show status message ==========
function showStatus(message, type = 'info') {
    const infoPanel = document.getElementById('info');
    infoPanel.innerHTML = message;
    infoPanel.style.borderLeftColor = 
        type === 'error' ? 'var(--danger)' : 
        type === 'success' ? 'var(--success)' : 
        'var(--accent)';
}

// ========== HELPER: Loading button state ==========
function setButtonLoading(buttonText, isLoading) {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
        if (btn.textContent.includes(buttonText.split(' ')[0])) {
            btn.disabled = isLoading;
            btn.style.opacity = isLoading ? '0.6' : '1';
            btn.style.cursor = isLoading ? 'not-allowed' : 'pointer';
        }
    });
}

// ========== EXISTING FUNCTIONALITY (UPDATED) ==========

// 📍 GPS
function useGPS() {
    showStatus('🔄 Getting location...');
    navigator.geolocation.getCurrentPosition(pos => {

        userLat = pos.coords.latitude;
        userLng = pos.coords.longitude;

        map.setView([userLat, userLng], 14);

        L.marker([userLat, userLng], {
            icon: L.icon({
                iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxOCIgZmlsbD0iIzAwNjZmZiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSI2IiBmaWxsPSIjZmZmIi8+PC9zdmc+',
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            })
        })
            .addTo(map)
            .bindPopup("📍 You are here");

        showStatus('✅ Location found! Ready to search hospitals.', 'success');
        loadHospitals(userLat, userLng);

    }, () => {
        showStatus('❌ Location access denied. Please enable GPS.', 'error');
    });
}

// 🏥 Load hospitals
async function loadFilteredHospitals() {
    if (!userLat) {
        showStatus('❌ Please use GPS first to get your location.', 'error');
        return;
    }

    showStatus('🔄 Searching hospitals...');
    setButtonLoading('Search', true);

    try {
        const typeFilter = document.getElementById('type')?.value || 'all';
        const specialityFilter = document.getElementById('speciality')?.value || 'all';
        
        await loadHospitals(userLat, userLng, typeFilter, specialityFilter);
        setButtonLoading('Search', false);
    } catch (e) {
        console.error('Search error:', e);
        showStatus('❌ Search failed. Please try again.', 'error');
        setButtonLoading('Search', false);
    }
}

async function loadHospitals(lat, lng, typeFilter = 'all', specialityFilter = 'all') {

    // clear old markers
    hospitalMarkers.forEach(m => map.removeLayer(m));
    hospitalMarkers = [];

    try {
        let res = await fetch(API_ROUTES.search, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ lat, lng })
        });

        if (!res.ok) {
            showStatus('❌ Backend error. Make sure server is running.', 'error');
            return;
        }

        let hospitals = await res.json();

        if (!hospitals || !hospitals.length) {
            showStatus('❌ No hospitals found in this area.', 'error');
            return;
        }

        // ✅ APPLY FILTERS BEFORE RANKING
        if (typeFilter !== 'all') {
            hospitals = hospitals.filter(h => h.type === typeFilter);
        }
        
        if (specialityFilter !== 'all') {
            hospitals = hospitals.filter(h => h.speciality === specialityFilter);
        }

        if (!hospitals.length) {
            showStatus('❌ No hospitals found matching your filters.', 'error');
            return;
        }

        hospitals = rankHospitals(hospitals);
        allHospitals = hospitals;
        saveHospitals(hospitals);

        hospitals.forEach((h, idx) => {
            let marker = L.marker([h.lat, h.lon], {
                icon: L.icon({
                    iconUrl: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48cGF0aCBkPSJNMjAgMUMxMS43IDE1IDE5IDMwIDIwIDQwYzEtMTAgOC4zLTI1IDAtMzl6IiBmaWxsPSIjZmY2NjY2Ii8+PGNpcmNsZSBjeD0iMjAiIGN5PSIxNCIgcj0iNyIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==`,
                    iconSize: [32, 40],
                    iconAnchor: [16, 40]
                })
            }).addTo(map)
                .bindPopup(`
                    <div style="font-size: 13px;">
                        <b style="color: var(--accent-light); font-size: 15px;">${h.name}</b><br>
                        ⭐ ${h.rating}/5 Rating<br>
                        📍 #${idx + 1} Nearest<br>
                        <button onclick="showHospitalDetails(allHospitals[${idx}])" style="margin-top: 8px; padding: 8px 12px; font-size: 11px;">📋 Details</button>
                        <button onclick="routeTo(${h.lat}, ${h.lon})" style="margin-top: 8px; padding: 8px 12px; font-size: 11px;">🚗 Navigate</button>
                    </div>
                `);

            marker.on('click', () => {
                addToHistory(h);
            });

            hospitalMarkers.push(marker);
        });

        showStatus(`✅ Found ${hospitals.length} hospitals! Click markers to navigate.`, 'success');
        if (settings.sound) speak(`${hospitals.length} hospitals found`);
    } catch (error) {
        console.error('Hospital loading error:', error);
        showStatus('❌ Error loading hospitals. Check network and backend.', 'error');
    }
}

// 🚨 Emergency
async function emergencyRoute() {

    if (!userLat) {
        showStatus('❌ Please use GPS first in an emergency!', 'error');
        return;
    }

    showStatus('🚨 EMERGENCY MODE - Finding nearest hospital...', 'error');

    // 🔥 AUTO LOAD hospitals if empty
    if (!hospitalMarkers.length) {
        await loadHospitals(userLat, userLng);
    }

    if (!hospitalMarkers.length) {
        showStatus('❌ No hospitals available! Call 911.', 'error');
        return;
    }

    // nearest hospital (already sorted)
    let nearest = hospitalMarkers[0].getLatLng();
    showStatus('🚨 Emergency route activated! Navigating to nearest hospital...', 'error');

    routeTo(nearest.lat, nearest.lng);
}

// 🚗 Route
async function routeTo(destLat, destLng) {

    if (!userLat) {
        showStatus('❌ Location required to create route.', 'error');
        return;
    }

    showStatus('🔄 Calculating route...');

    try {
        let url = `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${destLng},${destLat}?overview=full&geometries=geojson`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        let res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) {
            showStatus('❌ Routing service error. Try again.', 'error');
            return;
        }

        let data = await res.json();

        if (!data.routes || !data.routes.length) {
            showStatus('❌ Unable to calculate route. Try again.', 'error');
            return;
        }

        let route = data.routes[0];

        let coords = route.geometry.coordinates;
        let latlngs = coords.map(c => [c[1], c[0]]);

        // remove old route
        if (routeLine) map.removeLayer(routeLine);

        routeLine = L.polyline(latlngs, {
            color: "#ff6b6b",
            weight: 5,
            opacity: 0.8,
            dashArray: '5, 5',
            lineCap: 'round'
        }).addTo(map);

        map.fitBounds(routeLine.getBounds());

        // distance + time
        let distance = (route.distance / 1000).toFixed(2);
        let time = (route.duration / 60).toFixed(1);

        showStatus(`✅ Route Ready<br>📍 Distance: ${distance} km<br>⏱️ Time: ${time} min`, 'success');

        // 🔊 voice
        if (settings.voice) announceRoute(distance, time);

        // 🚦 traffic simulation
        if (settings.traffic) simulateTraffic(routeLine);
    } catch (error) {
        if (error.name === 'AbortError') {
            showStatus('❌ Route calculation timed out. Try again.', 'error');
        } else {
            console.error('Routing error:', error);
            showStatus('❌ Network error. Check your connection.', 'error');
        }
    }
}

// 🔊 Voice
function speak(text) {
    if (!settings.sound) return;
    window.speechSynthesis.cancel();
    let speech = new SpeechSynthesisUtterance(text);
    speech.rate = 0.9;
    window.speechSynthesis.speak(speech);
}

function announceRoute(distance, time) {
    speak(`Route ready. Distance ${distance} kilometers. Estimated time ${time} minutes.`);
}

// 🧠 Ranking
function rankHospitals(hospitals) {
    return hospitals.map((h, idx) => {
        let dist = Math.sqrt(
            Math.pow(h.lat - userLat, 2) +
            Math.pow(h.lon - userLng, 2)
        );

        let rating = (Math.random() * 2 + 3).toFixed(1);

        return { ...h, dist, rating, id: idx };
    }).sort((a, b) => a.dist - b.dist);
}

// 💾 Save
function saveHospitals(hospitals) {
    localStorage.setItem("hospitals", JSON.stringify(hospitals));
}

function loadSavedHospitals() {
    let data = localStorage.getItem("hospitals");
    if (!data) return;

    let hospitals = JSON.parse(data);

    hospitals.forEach(h => {
        let marker = L.marker([h.lat, h.lon]).addTo(map)
            .bindPopup(`
                <div style="text-align:center; font-size: 13px;">
                    <b style="color: var(--accent-light);">${h.name}</b><br>
                    ⭐ ${h.rating}<br>
                    <button onclick="showHospitalDetails(allHospitals.find(x => x.name === '${h.name}'))" style="margin-top: 8px; padding: 6px 8px; font-size: 11px;">📋 Details</button>
                    <button onclick="routeTo(${h.lat}, ${h.lon})" style="margin-top: 8px; padding: 6px 8px; font-size: 11px;">🚗 Navigate</button>
                </div>
            `);
        
        hospitalMarkers.push(marker);
    });
}

// 🚦 Traffic
function simulateTraffic(routeLine) {
    if (!routeLine) return;

    routeLine.setStyle({
        color: Math.random() > 0.5 ? "#4ade80" : "#fb923c",
        dashArray: '10, 5'
    });
}

// ========== INITIALIZATION ==========
window.onload = () => {
    loadData();
    loadSavedHospitals();
    showStatus('👋 Welcome to SmartNav+<br>Click "Use GPS" to start', 'info');
};
