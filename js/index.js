var map;
var marker;
var infowindow;
var messagewindow;

var customLabel = {
    restaurant:{
        label: 'R'
    },
    bar: {
        label: 'B'
    }
};

var heatmap;

function initMap() {
    var durham = {lat: 43.136, lng: -70.926};

    var mOptions =
    {
        zoom: 15,
        center: durham,
        disableDefaultUI: true,
        gestureHandling: 'greedy',
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

    var heatmapData = [
        new google.maps.LatLng(43.1263,-70.9338),
        new google.maps.LatLng(43.1264,-70.9339),
        new google.maps.LatLng(43.1265,-70.9337),
        new google.maps.LatLng(43.1266,-70.9330)
    ];

    downloadUrl('php/phpsqlinfo_getxml.php', function(data) {
        var xml = data;//.responseText;
        debugger;
        var markers = xml.documentElement.getElementsByTagName('events');
        Array.prototype.forEach.call(markers, function(markerElem) {
            //var id = markerElem.getAttribute('id');
            var name = markerElem.getAttribute('name');
            var address = markerElem.getAttribute('address');
            var weight = markerElem.getAttribute('weight');
            var point = new google.maps.LatLng(
                parseFloat(markerElem.getAttribute('lat')),
                parseFloat(markerElem.getAttribute('lng')));
            heatmapData.push({location: point, weight: weight});
        });

            /*var infowincontent = document.createElement('div');
            var strong = document.createElement('strong');
            strong.textContent = name
            infowincontent.appendChild(strong);
            infowincontent.appendChild(document.createElement('br'));

            var text = document.createElement('text');
            text.textContent = address
            infowincontent.appendChild(text);
            var icon = customLabel[type] || {};
            var marker = new google.maps.Marker({
                map: map,
                position: point,
                label: icon.label*/
            //});
        });

    heatmap = new google.maps.visualization.HeatmapLayer({ data: heatmapData });
    heatmap.setMap(map);

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
    var request = new XMLHttpRequest;
    //request.overrideMimeType("text/xml");

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

