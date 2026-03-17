// WeatherApp Constructor Function
function WeatherApp(apiKey) {
    // Store API key
    this.apiKey = apiKey;

    // Store API URLs
    this.apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
    this.forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

    // Store DOM element references
    this.searchBtn = document.getElementById('search-btn');
    this.cityInput = document.getElementById('city-input');
    this.weatherDisplay = document.getElementById('weather-display');

    // Initialize app
    this.init();
}
// Init method
WeatherApp.prototype.init = function() {
    // Click event (with bind)
    this.searchBtn.addEventListener(
        'click',
        this.handleSearch.bind(this)
    );

    // Enter key event
    this.cityInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            this.handleSearch();
        }
    });

    // Show welcome message
    this.showWelcome();
};
WeatherApp.prototype.showWelcome = function() {
    const welcomeHTML = `
        <div class="welcome-message">
            <h2>🌤️ Weather App</h2>
            <p>Enter a city name to get started!</p>
        </div>
    `;

    this.weatherDisplay.innerHTML = welcomeHTML;
};
// Handle search
WeatherApp.prototype.handleSearch = function() {
    // Get city from input
    const city = this.cityInput.value.trim();

    // Validate input
    if (!city) {
        this.showError('Please enter a city name.');
        return;
    }

    if (city.length < 2) {
        this.showError('City name too short.');
        return;
    }

    // Fetch weather
    this.getWeather(city);

    // Clear input (optional UX)
    this.cityInput.value = '';
};
WeatherApp.prototype.getWeather = async function(city) {
    this.showLoading();
    this.searchBtn.disabled = true;
    this.searchBtn.textContent = 'Searching...';

    const currentWeatherUrl = `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    try {
        const [currentWeather, forecastData] = await Promise.all([
            axios.get(currentWeatherUrl),
            this.getForecast(city)
        ]);

        this.displayWeather(currentWeather.data);
        this.displayForecast(forecastData);

    } catch (error) {
        console.error('Error:', error);

        if (error.response && error.response.status === 404) {
            this.showError('City not found. Please check spelling.');
        } else {
            this.showError('Something went wrong. Please try again.');
        }

    } finally {
        this.searchBtn.disabled = false;
        this.searchBtn.textContent = '🔍 Search';
    }
};

// ===============================
// DISPLAY WEATHER
// ===============================
WeatherApp.prototype.displayWeather = function(data) {
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

    this.weatherDisplay.innerHTML = weatherHTML;

    this.cityInput.focus();
};

// ===============================
// LOADING
// ===============================
WeatherApp.prototype.showLoading = function() {
    const loadingHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading weather...</p>
        </div>
    `;

    this.weatherDisplay.innerHTML = loadingHTML;
};

// ===============================
// ERROR
// ===============================
WeatherApp.prototype.showError = function(message) {
    const errorHTML = `
        <div class="error-message">
            <div class="error-icon">❌</div>
            <h3>Error</h3>
            <p>${message}</p>
        </div>
    `;

    this.weatherDisplay.innerHTML = errorHTML;
};
WeatherApp.prototype.getForecast = async function(city) {
    const url = `${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    try {
        const response = await axios.get(url);
        return response.data;

    } catch (error) {
        console.error('Error fetching forecast:', error);
        throw error;
    }
};
WeatherApp.prototype.processForecastData = function(data) {
    const dailyForecasts = data.list.filter(function(item) {
        return item.dt_txt.includes('12:00:00');
    });

    return dailyForecasts.slice(0, 5);
};
WeatherApp.prototype.displayForecast = function(data) {
    const dailyForecasts = this.processForecastData(data);

    const forecastHTML = dailyForecasts.map(function(day) {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const temp = Math.round(day.main.temp);
        const description = day.weather[0].description;
        const icon = day.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

        return `
            <div class="forecast-card">
                <h4>${dayName}</h4>
                <img src="${iconUrl}" alt="${description}">
                <p>${temp}°C</p>
                <p>${description}</p>
            </div>
        `;
    }).join('');

    const forecastSection = `
        <div class="forecast-section">
            <h3 class="forecast-title">5-Day Forecast</h3>
            <div class="forecast-container">
                ${forecastHTML}
            </div>
        </div>
    `;

    // Append (not replace)
    this.weatherDisplay.innerHTML += forecastSection;
};
// ===============================
// INITIALIZE APP
// ===============================
const app = new WeatherApp('8486cb9b2c1ac6800f7befd1ab97a300');