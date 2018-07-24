var map;
var marker;
var infowindow;
var messagewindow;

var heatmap;

var geocoder;

/*var addresses;
var heat;*/

var addrData;

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
                elementType: 'labels',
                stylers: [{visibility: "off"}]
            },
            {
                featureType: 'water',
                elementType: 'labels',
                stylers: [{visibility: "off"}]
            },
            {
                featureType: 'transit',
                elementType: 'geometry',
                stylers: [{color: '#2f3948'}]
            },
            {
                featureType: 'transit.station',
                elementType: 'labels',
                stylers: [{visibility: 'off'}]
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

    var heatmapData = [];
    addresses = [];
    heat = [];

    addrData = new Object();

    downloadUrl('php/phpsqlinfo_getxml.php', function(data) {
        var xml = data.responseXML;
        var markers = xml.documentElement.getElementsByTagName('event');
        Array.prototype.forEach.call(markers, function(markerElem)
        {
            var point = new google.maps.LatLng(
                parseFloat(markerElem.getAttribute('lat')),
                parseFloat(markerElem.getAttribute('lng')));
            //heatmapData.push({location: point, weight: weight});
            heatmapData.push(point);

            var address =  markerElem.getAttribute('addr').split(',')[0];
            var weight = parseInt(markerElem.getAttribute('weight'));
            //one way to do it
            if(!addrData[address])
                addrData[address] =  {up: 0, down: 0};

            if(weight > 0)
                addrData[address].up += weight;
            else
                addrData[address].down += weight;

            //other way to do it
            /*if(addresses.indexOf(address) !== -1)
                heat[addresses.indexOf(address)] += weight;
            else
            {
                addresses.push(address);
                heat.push(weight);
            }*/

        });
    });

    /*alert(addresses);
    alert(heat);*/

    heatmap = new google.maps.visualization.HeatmapLayer({ data: heatmapData });
    heatmap.setMap(map);

    geocoder = new google.maps.Geocoder;

    infowindow = new google.maps.InfoWindow({content: document.getElementById('form')});
    messagewindow = new google.maps.InfoWindow({content: document.getElementById('message')});

    google.maps.event.addListener(map, "click", function(event)
    {
        if (marker && marker.setMap) {
            marker.setMap(null);
        }

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
        });
        //make it scroll to the event, zoom in, and
        //scrolling away will close the menu
        map.setCenter(event.latLng);
        map.setZoom(18);

        //chagne this to somethign cool
        //infowindow.open(map, marker);
        openMenu(event.latLng);
    });
}

function openMenu(latLng)
{
    var addr = "";
    geocoder.geocode({'location': latLng}, function(results, status)
    {
        if(status === 'OK')
        {
            if(results[0])
                addr = results[0]["formatted_address"].split(',')[0];
            else
                window.alert('No nearby addresses found');
        }
        else
            window.alert('Search failed due to: ' + status);
    });

    document.getElementById("menu").style.display = 'block';
    var name = document.createElement("p");
    name.appendChild(document.createTextNode(addr));
    document.getElementById("menu").appendChild(name);

}

function saveData()
{
    var latlng = marker.getPosition();
    geocoder.geocode({'location': latlng}, function(results, status)
    {
        writeEntry(latlng,results,status);
    });
}

function writeEntry(latlng, results, status)
{
    var a = "-1";
    if(status === 'OK') {
        if (results[0])
            a = results[0]["formatted_address"];
        else
            window.alert('No results found');
    }
    else
        window.alert('Geocoder failed due to: ' + status);

    //-----------------------
    var url = 'php/phpsqlinfo_addrow.php?lat=' + latlng.lat() + '&lng=' + latlng.lng() + '&addr=' + a + '&up=1';

    downloadUrl(url, function(data, responseCode) {
        if (responseCode == 200 && data.responseText.length <= 1) {
            infowindow.close();
            messagewindow.open(map, marker);
        }
    });
}

function downloadUrl(url, callback)
{
    var request = new XMLHttpRequest;

    request.onreadystatechange = function()
    {
        if(request.readyState == 4)
        {
            request.onreadystatechange = doNothing;
            callback(request, request.status);//this line needs to be changed to response xml
        }
    };
    request.open('GET', url, true);
    request.send(null);
}

function doNothing() {}

