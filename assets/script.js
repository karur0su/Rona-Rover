$(document).ready(function () {
  // Materialize collapsible Initialization
  $(".collapsible").collapsible();

  //DEPENDECIES===============================================
  var userInput = $("#search");
  var weathCard = $("#weathInfo");
  var formEl = $("#form");
  var tempEl = $("#temp");
  var humEl = $("#hum");
  var iconEl = $("#iconel");
  var uvEl = $("#uv");
  var curDateEl = $("#curdate");
  var fahr = $("#fahr");
  var deathEl = $("#death");
  var localEl = $("#localcases");
  var usEl = $("#uscases");
  var riskEl = $("#risk");

  //GLOBAL VARIABLES

  var weathAPIKey = "ca5f43cc4601dca5509d6c78b604147e";
  var curDate = moment(new Date());
  var currentState;

  //FUNCTIONS=================================================

  //function rendering the weather infos using OpenWeatherMap API
  function renderWeather() {
    //   display current date
    curDateEl.text(curDate.format("dddd,MMMM DD"));
    // set up the weather API
    var queryURL =
      "https://api.openweathermap.org/data/2.5/weather?q=" +
      currentState +
      "&appid=" +
      weathAPIKey;
    $.ajax({
      url: queryURL,
      method: "GET",
    }).then(function (response) {
      //   console.log(response);
      var currentTemp = (((response.main.temp - 273.15) * 9) / 5 + 32).toFixed(
        1
      );
      tempEl.prepend("Temperature: " + currentTemp);
      tempEl.css("display", "block");
      // display humidity
      var hum;
      hum = response.main.humidity;
      humEl.text("Humidity: " + hum + "%");
      // get the uv index from its own api and display it
      var latitude = response.coord.lat;
      var longitude = response.coord.lon;
      var uvURL =
        "http://api.openweathermap.org/data/2.5/uvi?appid=" +
        weathAPIKey +
        "&lat=" +
        latitude +
        "&lon=" +
        longitude;
      //console.log("uvURL:", uvURL);
      $.ajax({
        url: uvURL,
        method: "GET",
      }).then(function (uvRes) {
        // WHEN I view the UV index

        var uvIndex = uvRes.value;
        // THEN I am presented with a color that indicates whether the conditions are
        // favorable, moderate, or severe
        if (uvIndex < 5) {
          uvEl.css("background-color", "green");
        } else if (uvIndex > 5 && uvIndex < 7.5) {
          uvEl.css("background-color", "orange");
        } else {
          uvEl.css("background-color", "red");
        }
        uvEl.text("UV Index: " + uvIndex);
      });
      // get the icon
      var iconcode = response.weather[0].icon;
      var iconImg = $("<img>");
      console.log(iconcode);
      var iconurl = "http://openweathermap.org/img/w/" + iconcode + ".png";
      iconImg.attr("src", iconurl);
      iconEl.append(iconImg);
    });
  }

  // Function rendering corona stats using
  function ronaRender() {
    var queryURL = "https://api.apify.com/v2/datasets/SNXrtb5TsbK4bKmtT/items";

    // We then created an AJAX call
    $.ajax({
      url: queryURL,
      method: "GET",
    }).then(function (response) {
      //   console.log(response);
      usEl.text("Cases Nationwide: " + response[0].totalCases);
      deathEl.text("Death toll NationWide: " + response[0].totalDeaths);
      var ronaResults = response[0].casesByState.map(function (state) {
        var obj = {
          stateName: state.name,
          cases: state.casesReported,
          risk: "",
        };
        if (state.casesReported < 10000) {
          obj.risk = "Low";
        } else if (state.casesReported > 30000) {
          obj.risk = "High";
        } else {
          obj.risk = "Medium";
        }
        return obj;
      });
      //   console.log(ronaResults);
      ronaResults.forEach((st) => {
        if (st.stateName.toLowerCase() === currentState.toLowerCase()) {
          $("#name").text("State: " + st.stateName);
          riskEl.text("Infection Risk: " + st.risk);
          localEl.text("Total cases: " + st.cases);
        }
      });
    });
  }
  function renderStatePics() {
    var APIKey = "563492ad6f91700001000001b2e60c4357b04a52adda21657c328fe6";
    $.ajax({
      method: "get",
      url:
        "https://api.pexels.com/v1/search?query=" +
        currentState +
        "&per_page=20",
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", APIKey);
      },
    }).then(function (res) {
      $("#weathpic").attr(
        "src",
        res.photos[Math.floor(Math.random() * res.photos.length)].src.medium
      );
      // console.log(res)
      // console.log(res.photos[0].src.medium)
    });
    $.ajax({
      method: "get",
      url: "https://api.pexels.com/v1/search?query=covid19&per_page=20",
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", APIKey);
      },
    }).then(function (res) {
      $("#covid").attr(
        "src",
        res.photos[Math.floor(Math.random() * res.photos.length)].src.medium
      );
      // console.log(res)
      // console.log(res.photos[0].src.medium)
    });
  }
  // Function to get the forecast
  function renderForecast() {
    var castURL =
      "http://api.openweathermap.org/data/2.5/forecast?q=" +
      currentState +
      "&appid=" +
      weathAPIKey;
    console.log("castURL:", castURL);
    $.ajax({
      url: castURL,
      method: "GET",
    }).then(function (castRes) {
      // WHEN I view the UV index
      console.log(castRes);
      var castArr = castRes.list;
      console.log(castArr);
      var index = 1;
      for (let i = 0; i < castArr.length; i = i + 8) {
        var listEl = castArr[i];
        var foreTemp = (((listEl.main.temp - 273.15) * 9) / 5 + 32).toFixed(1);
        var castDate = moment(listEl.dt_txt);
        $("#day" + index).append(castDate.format("dddd") + " " + foreTemp);
        var imgI=$("<img>")
        var iconcode = listEl.weather[0].icon;
        var iconurl = "http://openweathermap.org/img/w/" + iconcode + ".png";
        console.log(iconurl);
          imgI.attr("src", iconurl);
          $("#day" + index).preppend(imgI);

        index++;
      }
    });
  }

  //EVENTS HANDLERS=============================================
  formEl.submit(function mvp(e) {
    currentState = userInput.val();
    // console.log(currentState);
    e.preventDefault();
    if (!currentState) {
      console.log("no");
    } else {
      renderWeather();
      ronaRender();
      renderStatePics();
      renderForecast();
    }
  });
});
