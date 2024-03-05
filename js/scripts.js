/*!
 * Start Bootstrap - SB Admin v7.0.7 (https://startbootstrap.com/template/sb-admin)
 * Copyright 2013-2023 Start Bootstrap
 * Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-sb-admin/blob/master/LICENSE)
 */

window.addEventListener('DOMContentLoaded', event => {
    const sidebarToggle = document.body.querySelector('#sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', event => {
            event.preventDefault();
            document.body.classList.toggle('sb-sidenav-toggled');
            localStorage.setItem('sb|sidebar-toggle', document.body.classList.contains('sb-sidenav-toggled'));
        });
    }
});

$(document).ready(function () {
    let allCitiesWeather = [];
    let currentPage = 1;
    const citiesPerPage = 9;
    const jsonBlobApiUrl = 'https://jsonblob.com/api/jsonBlob/1214496250878877696';

    function displayCities(page) {
        const weatherGrid = $('#weatherCards');
        weatherGrid.empty();
        const startIndex = (page - 1) * citiesPerPage;
        const endIndex = startIndex + citiesPerPage;
        const citiesToShow = allCitiesWeather.slice(startIndex, endIndex);

        citiesToShow.forEach(city => {
            const cardHtml = `
                <div class="col" data-city-name="${city.name}">
                    <div class="card mb-4">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <span>Weather in <span class="weather-city-name">${city.name}</span></span>
                            <div class="dropdown">
                                <a class="nav-link dropdown-toggle" id="navbarDropdownMenuLink${city.name.replace(/\s+/g, '')}" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i class="fas fa-cloud-sun fa-fw"></i> Options
                                </a>
                                <ul class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink${city.name.replace(/\s+/g, '')}">
                                    <li><a class="dropdown-item update-card" data-city-name="${city.name}">Update</a></li>
                                    <li><a class="dropdown-item delete-card" data-city-name="${city.name}">Delete</a></li>
                                    <li><a class="dropdown-item toggle-temp" data-city-name="${city.name}" data-unit="C">Switch to Fahrenheit</a></li>
                                </ul>
                            </div>
                        </div>
                        <div class="card-body">
                            <p>Temperature: <span class="weather-temp">${city.main.temp}°C</span></p>
                            <p>Feels like: <span class="weather-feels-like">${city.main.feels_like}°C</span></p>
                            <p>Weather: <span class="weather-main">${city.weather[0].main}</span></p>
                            <p>Description: <span class="weather-description">${city.weather[0].description}</span></p>
                            <p>Humidity: <span class="weather-humidity">${city.main.humidity}%</span></p>
                            <p>Wind Speed: <span class="weather-wind">${city.wind.speed} m/s</span></p>
                        </div>
                        <div class="card-footer d-flex justify-content-between align-items-center">
                            <button class="btn btn-primary view-details" data-city-name="${city.name}" data-lat="${city.lat}" data-lon="${city.lon}">View Details</button>
                            <!-- Empty span for spacing if needed -->
                        </div>
                    </div>
                </div>`;
            $(weatherGrid).append(cardHtml);
        });
        updatePagination(allCitiesWeather.length, page);
    }

    $('#weatherCards').on('click', '.view-details', function (event) {
        event.stopPropagation();
        const cityName = $(this).data('city-name');
        const lat = $(this).data('lat');
        const lon = $(this).data('lon');
        if (cityName && lat && lon) {
            displayWeatherDetail(cityName, lat, lon);
        } else {
            console.error('Details missing for ' + cityName);
        }
    });

    $('#updateAllCities').click(function () {
        allCitiesWeather.forEach(city => {
            updateWeatherData(city.name);
        });
    });

    function updatePagination(totalCities, currentPage) {
        const pagination = $('#pagination');
        pagination.empty();
        const totalPages = Math.ceil(totalCities / citiesPerPage);

        for (let i = 1; i <= totalPages; i++) {
            const pageItem = `<li class="page-item ${i === currentPage ? 'active' : ''}">
                                <a class="page-link" href="#" data-page="${i}">${i}</a>
                              </li>`;
            pagination.append(pageItem);
        }

        $('.page-link').click(function (e) {
            e.preventDefault();
            const newPage = $(this).data('page');
            currentPage = newPage;
            displayCities(newPage);
        });
    }

    function displayWeatherDetail(cityName, lat, lon) {
        const apiKey = 'e9f19410a9d3b5bba7ab342b852d3d04';
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                const dailyAverages = [];
                const labels = [];
                const detailedForecasts = [];

                for (let i = 0; i < data.list.length; i += 8) {
                    const temp = data.list[i].main.temp;
                    const date = new Date(data.list[i].dt * 1000).toLocaleDateString();
                    const description = data.list[i].weather[0].description;
                    const wind = data.list[i].wind.speed;
                    const humidity = data.list[i].main.humidity;

                    dailyAverages.push(temp);
                    labels.push(date);
                    detailedForecasts.push(`<strong>Date:</strong> ${date}, <strong>Temp:</strong> ${temp}°C, <strong>Desc:</strong> ${description}, <strong>Wind:</strong> ${wind} m/s, <strong>Humidity:</strong> ${humidity}%`);
                }

                const ctx = document.getElementById('weatherForecastChart').getContext('2d');
                if (window.weatherForecastChart instanceof Chart) {
                    window.weatherForecastChart.destroy();
                }
                window.weatherForecastChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Daily Average Temperature (°C)',
                            data: dailyAverages,
                            fill: false,
                            borderColor: 'rgb(75, 192, 192)',
                            tension: 0.1
                        }]
                    },
                    options: {
                        onClick: function (evt, element) {
                            if (element.length > 0) {
                                const index = element[0].index;
                                const forecastDetails = detailedForecasts[index];
                                document.getElementById('forecastDetails').innerHTML = forecastDetails;
                            }
                        }
                    }
                });
                $('#weatherDetailModal').modal('show');
            },
            error: function () {
                alert('Failed to retrieve weather details for ' + cityName + '. Please try again.');
            }
        });
    }

    function updateWeatherData(cityName) {
        const apiKey = 'e9f19410a9d3b5bba7ab342b852d3d04';
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;

        $.ajax({
            url: weatherUrl,
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                const newCityData = {
                    name: cityName,
                    lat: data.coord.lat,
                    lon: data.coord.lon,
                    main: data.main,
                    weather: data.weather,
                    wind: data.wind
                };
                const cityIndex = allCitiesWeather.findIndex(city => city.name === cityName);
                if (cityIndex !== -1) {
                    allCitiesWeather[cityIndex] = newCityData;
                } else {
                    allCitiesWeather.push(newCityData);
                }
                saveCitiesToRemote();
                displayCities(currentPage);
            },
            error: function () {
                alert('Failed to update weather data for ' + cityName + '. Please try again.');
            }
        });
    }

    function loadCitiesFromRemote() {
        $.ajax({
            url: jsonBlobApiUrl,
            type: 'GET',
            contentType: 'application/json',
            success: function (response) {
                allCitiesWeather = response.cities || [];
                displayCities(currentPage);
            },
            error: function () {
                console.error('Failed to load cities from remote storage.');
            }
        });
    }

    function saveCitiesToRemote() {
        $.ajax({
            url: jsonBlobApiUrl,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ cities: allCitiesWeather }),
            success: function (response) {
                console.log('Cities saved to remote storage.');
            },
            error: function () {
                console.error('Failed to save cities to remote storage.');
            }
        });
    }

    $('#addCityForm').on('submit', function (event) {
        event.preventDefault();
        let cityName = $('#cityName').val().trim();
        if (cityName) {
            updateWeatherData(cityName);
            $('#cityName').val('');
        }
    });

    $(document).on('click', '.delete-card', function (event) {
        event.preventDefault();
        const cityNameToDelete = $(this).data('city-name');
        allCitiesWeather = allCitiesWeather.filter(city => city.name !== cityNameToDelete);
        saveCitiesToRemote();
        displayCities(currentPage);
    });

    $(document).on('click', '.update-card', function (event) {
        event.preventDefault();
        const cityNameToUpdate = $(this).data('city-name');
        updateWeatherData(cityNameToUpdate);
    });

    $(document).on('click', '.toggle-temp', function (event) {
        event.preventDefault();
        const cityName = $(this).data('city-name');
        const city = allCitiesWeather.find(c => c.name === cityName);
        if (!city) return;

        if ($(this).data('unit') === 'C') {
            city.main.temp = (city.main.temp * 9 / 5) + 32;
            city.main.feels_like = (city.main.feels_like * 9 / 5) + 32;
            $(this).data('unit', 'F');
            $(this).text('Switch to Celsius');
        } else {
            city.main.temp = (city.main.temp - 32) * 5 / 9;
            city.main.feels_like = (city.main.feels_like - 32) * 5 / 9;
            $(this).data('unit', 'C');
            $(this).text('Switch to Fahrenheit');
        }

        const card = $(this).closest('.card');
        card.find('.weather-temp').text(`${city.main.temp.toFixed(1)}°${$(this).data('unit')}`);
        card.find('.weather-feels-like').text(`${city.main.feels_like.toFixed(1)}°${$(this).data('unit')}`);
    });

    loadCitiesFromRemote();
});
