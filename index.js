'use strict';
const food_url = 'https://www.themealdb.com/api/json/v1/1/search.php';

const api_key = 'AIzaSyAdyGYuJv2VURydSgj5bj-Dhi3QQrA3fDo';
let i = 0;
let map;
let questionText = "What's cookin'?";
let speed = 150;

//Function to display label text as if it were being typed
function typeWriter() {
  if (i < questionText.length) {
    document.getElementById('dinner-label').innerHTML += questionText.charAt(i);
    i++;
    setTimeout(typeWriter, speed);
  }
}

//Function to initialize the map. This will be hidden initially
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 29.773823, lng: -95.422},
    zoom: 15
  });
}

function formatQueryParams(params){
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    return queryItems.join('&');
};

function displayResults(responseJson){
  $("#meal-error-message").empty();
  $("#meal-error-message").addClass('hidden');
  $("#results-list").empty();
  if(responseJson.meals === null){
      $("#meal-error-message").text(`Oops! It looks like that meal was a little too exotic.`);
      $("#meal-error-message").removeClass('hidden');
  } else {
    console.log("Successful fetch, now building LI");
    for(let i = 0; i < responseJson.meals.length; i++) {
      $("#results-list").append(
        `<li><h3>${responseJson.meals[i].strMeal}</h3>
        <button type="button" class="instruction-toggle">${responseJson.meals[i].strMeal} Instructions</button>
        <p class="instruction">${responseJson.meals[i].strInstructions}<p>

        </li>
        `
      )};
      $('p').hide();
  }
  $("#dinner-results").removeClass('hidden');
};

$(function() {
  $('ul').on('click', '.instruction-toggle', function(event) {
    $(this).closest("li").find(".instruction").fadeToggle();
  })
});

function getMeals(query){
  const params = {
    s: query
  };
  const queryString = formatQueryParams(params);
  const url = `${food_url}?${queryString}`;
  console.log(url);

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
  $('form').submit(event => {
    event.preventDefault();
    const query = $("#dinner-item").val();
    getMeals(query);
  })
};

$(document).ready(watchForm);