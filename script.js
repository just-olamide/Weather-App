async function getWeather() {
    const city = document.getElementById("cityInput").value;
    const apiKey = "29d6b77e2749f8ff8620d2f6b1a10515";
    const weatherCard = document.getElementById("weatherCard");
    const loader = document.getElementById("loader");
  
    if (!city) {
      weatherCard.innerHTML = `<p class="text-warning">Please enter a city name.</p>`;
      return;
    }
  
    loader.classList.remove("d-none");
    weatherCard.innerHTML = "";
  
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  
    try {
      const res = await fetch(url);
      const data = await res.json();
  
      loader.classList.add("d-none");
  
      if (data.cod === "404") {
        weatherCard.innerHTML = `<p class="text-danger">City not found.</p>`;
        return;
      }
  
      const { name } = data;
      const { country } = data.sys;
      const { temp, humidity } = data.main;
      const { speed } = data.wind;
      const { main, icon } = data.weather[0];
  
      document.body.style.background = getWeatherBackground(main);
  
      weatherCard.innerHTML = `
        <h2>${name}, ${country}</h2>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${main}" />
        <p><i class="fas fa-temperature-low"></i> ${temp}°C</p>
        <p><i class="fas fa-cloud"></i> ${main}</p>
        <p><i class="fas fa-wind"></i> Wind: ${speed} m/s</p>
        <p><i class="fas fa-tint"></i> Humidity: ${humidity}%</p>
      `;
    } catch (err) {
      loader.classList.add("d-none");
      weatherCard.innerHTML = `<p class="text-danger">Error fetching weather data.</p>`;
    }
  }
  
  function getWeatherBackground(condition) {
    switch (condition.toLowerCase()) {
      case "clear":
        return "linear-gradient(to right, #56ccf2, #2f80ed)";
      case "clouds":
        return "linear-gradient(to right, #bdc3c7, #2c3e50)";
      case "rain":
        return "linear-gradient(to right, #667db6, #0082c8, #0082c8, #667db6)";
      case "snow":
        return "linear-gradient(to right, #83a4d4, #b6fbff)";
      case "thunderstorm":
        return "linear-gradient(to right, #373b44, #4286f4)";
      default:
        return "linear-gradient(to right, #74ebd5, #acb6e5)";
    }
  }
  