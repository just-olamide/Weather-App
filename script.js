const apiKey = "29d6b77e2749f8ff8620d2f6b1a10515";
const searchInput = document.getElementById("searchInput");
let debounceTimer;

window.onload = () => {
  if (navigator.geolocation) {
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoords(latitude, longitude);
      },
      // Error callback
      (error) => {
        console.error("Geolocation error:", error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert("Please enable location access to see your local weather.");
            break;
          case error.POSITION_UNAVAILABLE:
            alert(
              "Location information unavailable. Please search for your city."
            );
            break;
          case error.TIMEOUT:
            alert("Location request timed out. Please search for your city.");
            break;
          default:
            alert(
              "An error occurred getting your location. Please search for your city."
            );
        }
      },
      options
    );
  } else {
    alert(
      "Geolocation is not supported by your browser. Please search for your city."
    );
  }
};

searchInput.addEventListener("input", function () {
  clearTimeout(debounceTimer);
  const query = searchInput.value.trim();
  if (query.length < 2) return clearSuggestions();

  debounceTimer = setTimeout(() => fetchCitySuggestions(query), 300);
});

searchInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    const city = searchInput.value.trim();
    if (city !== "") {
      clearSuggestions();
      fetchWeatherData(city);
    }
  }
});

function toggleLoader(show) {
  let loader = document.getElementById("loader");
  if (!loader) {
    loader = document.createElement("div");
    loader.id = "loader";
    loader.innerHTML = `
      <div class="text-center py-4">
        <div class="spinner-border text-light" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    `;
    document.querySelector(".container").prepend(loader);
  }
  loader.style.display = show ? "block" : "none";
}

function clearSuggestions() {
  const box = document.getElementById("suggestions");
  if (box) box.remove();
}

async function fetchCitySuggestions(query) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`
    );
    const cities = await res.json();

    clearSuggestions();
    const box = document.createElement("div");
    box.id = "suggestions";
    box.className = "dropdown-menu show position-absolute w-100";

    cities.forEach((city) => {
      const option = document.createElement("button");
      option.className = "dropdown-item";
      option.type = "button";
      option.textContent = `${city.name}, ${city.country}`;
      option.onclick = () => {
        searchInput.value = city.name;
        clearSuggestions();
        fetchWeatherData(city.name);
      };
      box.appendChild(option);
    });

    searchInput.parentNode.appendChild(box);
  } catch (error) {
    console.error("Suggestion error:", error);
  }
}

async function fetchWeatherData(city) {
  toggleLoader(true);
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
    );
    if (!response.ok) throw new Error("City not found");

    const data = await response.json();
    renderCurrentWeather(data);
    renderForecast(data);
  } catch (error) {
    alert(error.message);
  } finally {
    toggleLoader(false);
  }
}

async function fetchWeatherByCoords(lat, lon) {
  toggleLoader(true);
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    const data = await response.json();
    renderCurrentWeather(data);
    renderForecast(data);
  } catch (error) {
    alert("Failed to get weather from location");
  } finally {
    toggleLoader(false);
  }
}

function renderCurrentWeather(data) {
  const location = document.getElementById("location");
  const temperature = document.getElementById("temperature");
  const condition = document.getElementById("condition");
  const highLow = document.getElementById("high-low");

  const current = data.list[0];
  location.textContent = data.city.name;
  temperature.innerHTML = `${Math.round(current.main.temp)}&deg;`;
  condition.textContent = current.weather[0].main;
  highLow.textContent = `L:${Math.round(current.main.temp_min)}° H:${Math.round(
    current.main.temp_max
  )}°`;
}

function renderForecast(data) {
  const hourlyContainer = document.getElementById("hourlyForecast");
  const dailyContainer = document.getElementById("dailyForecast");
  const weatherDescription = document.getElementById("weatherDescription");
  hourlyContainer.innerHTML = "";
  dailyContainer.innerHTML = "";

  // Weather description
  let summarySet = new Set();
  for (let i = 0; i < 6; i++) {
    const desc = data.list[i].weather[0].description;
    summarySet.add(desc);
  }
  const summary = Array.from(summarySet).join(", ");
  const summaryText =
    summary.length > 120 ? summary.slice(0, 120) + "..." : summary;
  weatherDescription.textContent =
    summaryText.charAt(0).toUpperCase() +
    summaryText.slice(1) +
    " expected over the next few hours.";

  // Hourly forecast blocks
  for (let i = 0; i < 6; i++) {
    const hour = data.list[i];
    const time = new Date(hour.dt * 1000).getHours();
    const temp = Math.round(hour.main.temp);
    const icon = hour.weather[0].icon;

    hourlyContainer.innerHTML += `
      <div class="hour-block mx-2 text-center">
        <p class="mb-1">${time}:00</p>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" width="40">
        <p>${temp}&deg;</p>
      </div>
    `;
  }

  // Daily forecast
  const days = {};
  data.list.forEach((item) => {
    const date = new Date(item.dt_txt).toLocaleDateString();
    if (!days[date]) days[date] = [];
    days[date].push(item);
  });

  const dailyKeys = Object.keys(days).slice(0, 7);
  dailyKeys.forEach((date) => {
    const dayData = days[date];
    const temps = dayData.map((d) => d.main.temp);
    const min = Math.round(Math.min(...temps));
    const max = Math.round(Math.max(...temps));
    const icon = dayData[0].weather[0].icon;
    const day = new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
    });

    dailyContainer.innerHTML += `
      <div class="col-12 d-flex justify-content-between py-2 border-bottom">
        <span>${day}</span>
        <span><img src="https://openweathermap.org/img/wn/${icon}.png" width="30"> ${min}&deg; / ${max}&deg;</span>
      </div>
    `;
  });
}
