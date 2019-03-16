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
        console.log(jsonData);
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
    console.log($(this).closest("li").find(".ingredients-list").fadeToggle());
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
  $('form').submit(event => {
    event.preventDefault();
    const query = $("#dinner-item").val();
    getMeals(query);
  })
};

$(document).ready(watchForm);
