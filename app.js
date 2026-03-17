// Your OpenWeatherMap API Key
const API_KEY = '8486cb9b2c1ac6800f7befd1ab97a300';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Get elements
const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');

// Event listeners
searchBtn.addEventListener('click', handleSearch);

cityInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        handleSearch();
    }
});

// Handle search with validation
function handleSearch() {
    const city = cityInput.value.trim();

    if (!city) {
        showError('Please enter a city name.');
        return;
    }

    if (city.length < 2) {
        showError('City name too short.');
        return;
    }

    getWeather(city);
    cityInput.value = '';
}

// Fetch weather data
async function getWeather(city) {
    showLoading();

    const url = `${API_URL}?q=${city}&appid=${API_KEY}&units=metric`;

    // Disable button
    searchBtn.disabled = true;
    searchBtn.textContent = 'Searching...';

    try {
        const response = await axios.get(url);
        displayWeather(response.data);

    } catch (error) {
        console.error('Error:', error);

        if (error.response && error.response.status === 404) {
            showError('City not found. Please check the spelling and try again.');
        } else {
            showError('Something went wrong. Please try again later.');
        }

    } finally {
        // Re-enable button
        searchBtn.disabled = false;
        searchBtn.textContent = '🔍 Search';
    }
}

// Display weather data
function displayWeather(data) {
    const cityName = data.name;
    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

    const weatherHTML = `
        <div class="weather-info">
            <h2 class="city-name">${cityName}</h2>
            <img src="${iconUrl}" alt="${description}" class="weather-icon">
            <div class="temperature">${temperature}°C</div>
            <p class="description">${description}</p>
        </div>
    `;

    document.getElementById('weather-display').innerHTML = weatherHTML;

    // Focus back to input
    cityInput.focus();
}

// Show error
function showError(message) {
    const errorHTML = `
        <div class="error-message">
            <div class="error-icon">❌</div>
            <h3>Error</h3>
            <p>${message}</p>
        </div>
    `;

    document.getElementById('weather-display').innerHTML = errorHTML;
}

// Show loading
function showLoading() {
    const loadingHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading weather...</p>
        </div>
    `;

    document.getElementById('weather-display').innerHTML = loadingHTML;
}

// Initial message
document.getElementById('weather-display').innerHTML = `
    <div class="welcome-message">
        <h2>🌤️ Weather App</h2>
        <p>Enter a city name to get started!</p>
    </div>
`;