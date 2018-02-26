
function initMap() {

    $('#map').hide();
    $('#event-results').hide();

    var config = {
        apiKey: "AIzaSyCr6Ru_IzhXDR-YLe3FhvoOMuM0RjN5x-w",
        authDomain: "meetmethere-d27e8.firebaseapp.com",
        databaseURL: "https://meetmethere-d27e8.firebaseio.com",
        projectId: "meetmethere-d27e8",
        storageBucket: "meetmethere-d27e8.appspot.com",
        messagingSenderId: "480152178553"
    };
    firebase.initializeApp(config);
    $("#login").on("click", function(login) {
        event.preventDefault();
        githubLogin();
        $('#map').show();
        $('#event-results').show();

    })



    function githubLogin() {
      var provider = new firebase.auth.GithubAuthProvider();
      firebase.auth().signInWithPopup(provider).then(function(result) {
        // This gives you a GitHub Access Token. You can use it to access the GitHub API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        $('#login').hide();
        googleMaps([]);
        meetUp();
        window.user = result.user;
      }).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        var email = error.email;
        var credential = error.credential;
      });
    }

    function googleMaps(events) {
      
        var school = { lat: 42.351, lng: -71.071 };
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 14,
            center: school
        });

        var marker = new google.maps.Marker({
            map: map,
            position: school
        });

        for(var i=0; i < events.length; i++) {
             function createMarker() {
                 return new google.maps.Marker({
                    position: {lat: events[i].group.lat, lng: events[i].group.lon },//school,
                    map: map
                });
             }
             function createInfoWindow(marker) {
                   var newDate = new Date(events[i].time);
                   var infowindow = new google.maps.InfoWindow({
                    content: events[i].name  + '<br>' + events[i].group.name  + '<br>' + events[i].group.localized_location + '<br>' + newDate.toString() + '<br><a href="' + events[i].link +'" target="_blank">Click For Event Details!</a>' //name, group.name, venue.address_1, venue_city link
                  });
                   marker.addListener('click', function() {
                        infowindow.open(map, marker);
                    });
                   
                   $("#" + events[i].group.id).hover(function(){
                        // Open Infowindow
                         infowindow.open(map, marker);
                    }, function(){
                        // Close Info Window
                        infowindow.close();
                    });


             }
             console.log(i)
             var marker = createMarker();
             createInfoWindow(marker);
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                
                var pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                marker.setPosition(pos);
                map.setCenter(pos);
            }, function() {
                handleLocationError(true, marker, map.getCenter());
            });
        } else {
            handleLocationError(false, marker, map.getCenter());
        }
    }

    function meetUp() {
    // Define Our Tags
    var tags = {
        "tech": {
            "sig": "102b642ba66966c051bc24aa097611010dc64c9b",
            "sig_id": "233611572",
            "term": "tech"
        },
        "javascript": {
            "sig": "767f3576ec4b350bf7483caf24d3292d723a8a4c",
            "sig_id": "233611572",
            "term": "javascript"
        }
    }


    // Create A Factory for Buttons
    function buttonFactory(id) {
        var listItem = document.createElement('li');
        var button = document.createElement('button');
        button.id = id;
        button.innerHTML = tags[id].term
        button.className += "tech-tag";
        listItem.append(button);
        document.getElementById('tags').append(listItem);
    }

    for (key in tags) {
        buttonFactory(key);
    }

    $('.tech-tag').click(function(e) {
        $('h3').hide();

        var base = "https://api.meetup.com/";
        var path = "find/events?";
        var query = {
            lat: 42.36, // lat for Boston area
            lon: -71.07, // Long for Boston area
            radius: "smart", // Alow meetup.com to infer the radius
            text: tags[this.id].term,
            sig: tags[this.id].sig,
            sig_id: tags[this.id].sig_id
        }
        $.ajax({
            dataType: 'jsonp',
            method: 'get',
            url: base + path + $.param(query),
            success: function(data) {
                displayResults(data.data);
                googleMaps(data.data);
            }

        });
    });

    function displayResults(data) {
        console.log(data)

        for (var i = 0; i < data.length; i++) {
            var newDate = new Date(data[i].time);
            var event = "<li id='" + data[i].group.id + "'>" + data[i].name + " / " + newDate.toString() + " / " + data[i].group.localized_location + "</li>" + "<hr>";
            $("#result").append(event);

        }
    }
    }
}
