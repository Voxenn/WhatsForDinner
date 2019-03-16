'use strict';
const food_url = 'https://www.themealdb.com/api/json/v1/1/search.php';
const api_key = 'AIzaSyAdyGYuJv2VURydSgj5bj-Dhi3QQrA3fDo';
let i = 0;
let questionText = "What's cookin'?";
let speed = 150;
var map;
var service;
var infowindow;

//Function to display label text as if it were being typed
function typeWriter() {
  if (i < questionText.length) {
    document.getElementById('cooking-title').innerHTML += questionText.charAt(i);
    i++;
    setTimeout(typeWriter, speed);
  }
}

//Function to initialize the map. This will be hidden initially
function initMap(query) {
  $('.map').fadeIn();
  //Set location
  var houston = new google.maps.LatLng(29.773823, -95.422);

  //Create a new map
  map = new google.maps.Map(
    document.getElementById('map'), {center: houston, zoom: 15});
  infowindow = new google.maps.InfoWindow();
  var request = {
    location: houston,
    radius: '500',
    query: query
  };
  function initMap() {
          map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: -34.397, lng: 150.644},
            zoom: 6
          });
          infoWindow = new google.maps.InfoWindow;

          // Try HTML5 geolocation.
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
              var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };

              infoWindow.setPosition(pos);
              infoWindow.setContent('Location found.');
              infoWindow.open(map);
              map.setCenter(pos);
            }, function() {
              handleLocationError(true, infoWindow, map.getCenter());
            });
          } else {
            // Browser doesn't support Geolocation
            handleLocationError(false, infoWindow, map.getCenter());
          }
        }

        function handleLocationError(browserHasGeolocation, infoWindow, pos) {
          infoWindow.setPosition(pos);
          infoWindow.setContent(browserHasGeolocation ?
                                'Error: The Geolocation service failed.' :
                                'Error: Your browser doesn\'t support geolocation.');
          infoWindow.open(map);
        }
  //Perform a text search to locate places by the user's text
  service = new google.maps.places.PlacesService(map);
  service.textSearch(request, function(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      for (var i = 0; i < results.length; i++) {
        createMarker(results[i]);
      }
      map.setCenter(results[0].geometry.location);
    }
  });
}

//Create markers on the map relevant to the user's text search
function createMarker(place) {
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });
  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });
}
//Function to format parameters to API call
function formatQueryParams(params){
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    return queryItems.join('&');
};

//Display results dynamically in this function.
function displayResults(responseJson){
  $("#meal-error-message").empty();
  $("#meal-error-message").hide()
  $("#results-list").empty();
  $(".map").hide();
  if(responseJson.meals === null){
      $("#meal-error-message").text(`Oops! Try refining your search.`);
      $("#meal-error-message").fadeToggle();
  } else {
    for(let i = 0; i < responseJson.meals.length; i++) {
      //We hide the dynamically built HTML originally
      $(`<li><h3>${responseJson.meals[i].strMeal}</h3>
        <button type="button" class="button instruction-toggle">${responseJson.meals[i].strMeal} Instructions</button>
        <button type="button" class="button ingredients-toggle">Ingredient List</button>
        <section class="meal-prep">
          <p class="instruction">${responseJson.meals[i].strInstructions}</p>
          <p class="ingredients">
            <ul id="ingredients${i + 1}" class="ingredients-list">
            </ul>
            </p>
        </section>
        </li>
        `)
        //Since we built the HTML first and then appended it, the fadeIn will now target the HTML
        .hide().appendTo("#results-list").fadeIn();
        let jsonData = responseJson.meals[i];
        for(let j = 1; j <= 20; j++){
          let key = "strIngredient" + j;
          let key2 = "strMeasure" + j;
          if(jsonData.hasOwnProperty(key)){
            if (jsonData[key] !== ""){
            $(`#ingredients${i + 1}`).append
            (`<li class="ingredient"><h4>${jsonData[key2]} - ${jsonData[key]}</h4></li>`
            )}
          }
        }
      };
      $('p').hide();
      $('.ingredients-list').hide();
  }
  $("#dinner-results").removeClass('hidden');
};

//Function to toggle instructions paragraph
$(function() {
  $('ul').on('click', '.instruction-toggle', function(event) {
    $(this).closest("li").find(".instruction").fadeToggle();
  })
});

//Function to toggle ingredients list
$(function() {
  $('ul').on('click', '.ingredients-toggle', function(event) {
    $(this).closest("li").find(".ingredients").fadeToggle();
    $(this).closest("li").find(".ingredients-list").fadeToggle();
  })
});

function getMeals(query){
  const params = {
    s: query
  };
  const queryString = formatQueryParams(params);
  const url = `${food_url}?${queryString}`;
  fetch(url)
  .then( response => {
    if(response.ok) {
      return response.json();
    }
    throw new Error(response.statusText);
  })
  .then(responseJson => displayResults(responseJson))
  .catch(err => {
    $('#error-message').text(`Oops! Looks like something went wrong.`)
  });
}
function watchForm() {
  typeWriter();
  $("#search-form button").click(function(event) {
    event.preventDefault()
    const query = $("#dinner-item").val();
    if($(this).attr("value")=="recipe-search"){
      getMeals(query);
    }
    if($(this).attr("value")=="restaurant-search"){
      initMap(query);
    }
  });
};

$(document).ready(watchForm);
