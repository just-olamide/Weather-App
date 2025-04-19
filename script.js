// async function getWeather() {
//     const city = document.getElementById("cityInput").value;
//     const apiKey = "29d6b77e2749f8ff8620d2f6b1a10515";
//     const weatherCard = document.getElementById("weatherCard");
//     const loader = document.getElementById("loader");
  
//     if (!city) {
//       weatherCard.innerHTML = `<p class="text-warning">Please enter a city name.</p>`;
//       return;
//     }
  
//     loader.classList.remove("d-none");
//     weatherCard.innerHTML = "";
  
//     const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  
//     try {
//       const res = await fetch(url);
//       const data = await res.json();
  
//       loader.classList.add("d-none");
  
//       if (data.cod === "404") {
//         weatherCard.innerHTML = `<p class="text-danger">City not found.</p>`;
//         return;
//       }
  
//       const { name } = data;
//       const { country } = data.sys;
//       const { temp, humidity } = data.main;
//       const { speed } = data.wind;
//       const { main, icon } = data.weather[0];
  
//       document.body.style.background = getWeatherBackground(main);
  
//       weatherCard.innerHTML = `
//         <h2>${name}, ${country}</h2>
//         <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${main}" />
//         <p><i class="fas fa-temperature-low"></i> ${temp}°C</p>
//         <p><i class="fas fa-cloud"></i> ${main}</p>
//         <p><i class="fas fa-wind"></i> Wind: ${speed} m/s</p>
//         <p><i class="fas fa-tint"></i> Humidity: ${humidity}%</p>
//       `;
//     } catch (err) {
//       loader.classList.add("d-none");
//       weatherCard.innerHTML = `<p class="text-danger">Error fetching weather data.</p>`;
//     }
//   }
  
//   function getWeatherBackground(condition) {
//     switch (condition.toLowerCase()) {
//       case "clear":
//         return "linear-gradient(to right, #56ccf2, #2f80ed)";
//       case "clouds":
//         return "linear-gradient(to right, #bdc3c7, #2c3e50)";
//       case "rain":
//         return "linear-gradient(to right, #667db6, #0082c8, #0082c8, #667db6)";
//       case "snow":
//         return "linear-gradient(to right, #83a4d4, #b6fbff)";
//       case "thunderstorm":
//         return "linear-gradient(to right, #373b44, #4286f4)";
//       default:
//         return "linear-gradient(to right, #74ebd5, #acb6e5)";
//     }
//   }
  
<lord-icon id="weatherIcon"
    src="https://cdn.lordicon.com/dnmvmpfk.json"
    trigger="loop"
    style="width:60px;height:60px">
</lord-icon>



let currentUnit = "metric"; // or 'imperial'
let lastCity = null;

// Save and load user name
function promptUserName() {
  const name = prompt("Enter your name:");
  if (name) {
    localStorage.setItem("weatherUsername", name);
    document.getElementById("username").textContent = name;
  }
}

function loadUserName() {
  const savedName = localStorage.getItem("weatherUsername");
  if (savedName) {
    document.getElementById("username").textContent = savedName;
  }
}

window.onload = loadUserName;

// Get weather data (API integration to be added next)
function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) return alert("Please enter a city name");

  // TODO: Call weather API here
  console.log("Fetch weather for:", city);
}

const apiKey = "29d6b77e2749f8ff8620d2f6b1a10515";

// Get weather data from OpenWeatherMap
async function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) return alert("Please enter a city name");
  
  try {
    const geoRes = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`
    );
    const geoData = await geoRes.json();
    if (!geoData.length) return alert("City not found");

    const { lat, lon, name } = geoData[0];
const weatherRes = await fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=${currentUnit}&appid=${apiKey}`
    
    );
    const data = await weatherRes.json();

    updateCurrentWeather(data.current, name);
    updateHourlyForecast(data.hourly);
    updateWeeklyForecast(data.daily);

    document.getElementById("weatherCard").classList.remove("d-none");
  } catch (error) {
    console.error("Weather fetch error:", error);
    alert("Failed to fetch weather data.");
  }
}

// Update main weather card
function updateCurrentWeather(current, cityName) {
  document.getElementById("temperature").textContent = Math.round(current.temp);
  document.getElementById("feelsLike").textContent = Math.round(current.feels_like);
  document.getElementById("humidity").textContent = current.humidity;
  document.getElementById("windSpeed").textContent = current.wind_speed;
  document.getElementById("cityName").textContent = cityName;
  document.getElementById("description").textContent = current.weather[0].main;

  const icon = current.weather[0].icon;
  // document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
  const iconMap = {
    "01d": "https://cdn.lordicon.com/dnmvmpfk.json", // sunny
    "01n": "https://cdn.lordicon.com/dnmvmpfk.json", // moon
    "02d": "https://cdn.lordicon.com/osuxyevn.json", // partly cloudy
    "03d": "https://cdn.lordicon.com/osuxyevn.json", // cloudy
    "04d": "https://cdn.lordicon.com/osuxyevn.json",
    "09d": "https://cdn.lordicon.com/kndkiwmf.json", // rain
    "10d": "https://cdn.lordicon.com/kndkiwmf.json",
    "11d": "https://cdn.lordicon.com/nlzvfzjg.json", // thunder
    "13d": "https://cdn.lordicon.com/tyounuzx.json", // snow
    "50d": "https://cdn.lordicon.com/wzrwaorf.json"  // fog
  };
  
  document.getElementById("weatherIcon").setAttribute("src", iconMap[icon] || iconMap["01d"]);
  
}

// Update hourly forecast (next 6 hours)
function updateHourlyForecast(hourly) {
  const container = document.getElementById("hourlyForecast");
  container.innerHTML = "";

  for (let i = 0; i < 6; i++) {
    const hour = hourly[i];
    const date = new Date(hour.dt * 1000);
    const time = i === 0 ? "Now" : date.getHours() + ":00";

    const card = `
      <div class="col-4 col-md-2">
        <div class="card p-2 text-center">
          <img src="https://openweathermap.org/img/wn/${hour.weather[0].icon}.png" style="width: 40px;" />
          <div class="fw-bold">${time}</div>
          <div>${Math.round(hour.temp)}°C</div>
        </div>
      </div>`;
    container.innerHTML += card;
  }
}

// Update weekly forecast (next 6 days)
function updateWeeklyForecast(daily) {
  const container = document.getElementById("weeklyForecast");
  container.innerHTML = "";

  for (let i = 1; i <= 6; i++) {
    const day = daily[i];
    const date = new Date(day.dt * 1000);
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" });

    const card = `
      <div class="col-6 col-md-2">
        <div class="card p-2 text-center">
          <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" style="width: 40px;" />
          <div class="fw-bold">${weekday}</div>
          <div>${Math.round(day.temp.day)}°C</div>
        </div>
      </div>`;
    container.innerHTML += card;
  }
}
function toggleUnits() {
  const toggle = document.getElementById("unitToggle");
  currentUnit = toggle.checked ? "imperial" : "metric";
  document.querySelector(".form-check-label").textContent = toggle.checked ? "Show °C" : "Show °F";
  
  if (lastCity) {
    document.getElementById("cityInput").value = lastCity;
    getWeather();
  }
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
}

function loadDarkMode() {
  const isDark = localStorage.getItem("darkMode") === "true";
  if (isDark) document.body.classList.add("dark-mode");
}

window.onload = () => {
  loadUserName();
  loadDarkMode();
};
