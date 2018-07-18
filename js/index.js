var map;
var marker;
var infowindow;
var messagewindow;

function initMap() {
    var durham = {lat: 43.136, lng: -70.926};

    var mOptions =
    {
        zoom: 15,
        center: durham,
        disableDefaultUI: true,
        styles:
        [
            {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
            {
                featureType: 'administrative.locality',
                elementType: 'labels.text.fill',
                stylers: [{color: '#d59563'}]
            },
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{visibility: "off"}]
            },
            {
                featureType: 'poi.park',
                elementType: 'geometry',
                stylers: [{color: '#263c3f'}]
            },
            {
                featureType: 'poi.park',
                elementType: 'labels.text.fill',
                stylers: [{color: '#6b9a76'}]
            },
            {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [{color: '#38414e'}]
            },
            {
                featureType: 'road',
                elementType: 'geometry.stroke',
                stylers: [{color: '#212a37'}]
            },
            {
                featureType: 'road',
                elementType: 'labels.text.fill',
                stylers: [{color: '#9ca5b3'}]
            },
            {
                featureType: 'road.highway',
                elementType: 'geometry',
                stylers: [{color: '#746855'}]
            },
            {
                featureType: 'road.highway',
                elementType: 'geometry.stroke',
                stylers: [{color: '#1f2835'}]
            },
            {
                featureType: 'road.highway',
                elementType: 'labels.text.fill',
                stylers: [{color: '#f3d19c'}]
            },
            {
                featureType: 'transit',
                elementType: 'geometry',
                stylers: [{color: '#2f3948'}]
            },
            {
                featureType: 'transit.station',
                elementType: 'labels.text.fill',
                stylers: [{color: '#d59563'}]
            },
            {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{color: '#17263c'}]
            },
            {
                featureType: 'water',
                elementType: 'labels.text.fill',
                stylers: [{color: '#515c6d'}]
            },
            {
                featureType: 'water',
                elementType: 'labels.text.stroke',
                stylers: [{color: '#17263c'}]
            }
        ]

    }

    map = new google.maps.Map( document.getElementById('map'), mOptions);

    infowindow = new google.maps.InfoWindow({content: document.getElementById('form')});
    messagewindow = new google.maps.InfoWindow({content: document.getElementById('message')});

    google.maps.event.addListener(map, "click", function(event)
    {
        marker = new google.maps.Marker({
            position: event.latLng,
            map: map,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 2,
                strokeColor: 'red',
                strokeWeight: 1,
                fillColor: 'red',
                fillOpacity: 0.5
            }
        })

        infowindow.open(map, marker);
    });
}

function saveData()
{
    var latlng = marker.getPosition();
    var url = 'php/phpsqlinfo_addrow.php?lat=' + latlng.lat() + '&lng=' + latlng.lng() + '&up=1';

    downloadUrl(url, function(data, responseCode)
    {
        if(responseCode ==  200 && data.length <= 1)
        {
            infowindow.close();
            messagewindow.open(map, marker);
        }
    });
}

function downloadUrl(url, callback)
{
    /*var request = window.ActiveXObject ? new ActiveXObject('Microsoft.XMLHTTP') :
        new XMLHttpRequest;*/
    var request = new XMLHttpRequest;

    request.onreadystatechange = function()
    {
        if(request.readyState == 4)
        {
            request.onreadystatechange = doNothing;
            callback(request.responseText, request.status);
        }
    };
    request.open('GET', url, true);
    request.send(null);
}

function doNothing() {}