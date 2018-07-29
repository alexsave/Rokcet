var map;
var marker;

var heatmap;
var coolmap;

var heatmapData;
var coolmapData;

var geocoder;

var addrData;

var cur = "";
var status = 0;

var lastId;

function initMap()
{

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
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{visibility: "off"}]
            },
            {
                featureType: 'landscape.man_made',
                elementType: 'geometry',
                styles: [{color: "#99FF33"}]
            },
            {
                featureType: 'poi.park',
                elementType: 'geometry',
                stylers: [{color: '#263c3f'}]
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
                elementType: 'labels.icon',
                stylers: [{visibility: "off"}]
            },
            {
                featureType: 'road.arterial',
                elementType: 'labels.icon',
                stylers: [{visibility: "off"}]
            },
            {
                featureType: 'water',
                elementType: 'labels',
                stylers: [{visibility: "off"}]
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
            }
        ]

    }

    map = new google.maps.Map( document.getElementById('map'), mOptions);

    heatmapData = [];
    coolmapData = [];

    addrData = new Object();

    //SWITCH THIS TO USE JSON
    downloadUrl('php/phpsqlinfo_getxml.php', function(data) {
        var xml = data.responseXML;
        var markers = xml.documentElement.getElementsByTagName('event');
        Array.prototype.forEach.call(markers, function(markerElem) {
            var weight = parseInt(markerElem.getAttribute('weight'));
            var point = new google.maps.LatLng( parseFloat(markerElem.getAttribute('lat')), parseFloat(markerElem.getAttribute('lng')));

            var address = markerElem.getAttribute('addr').split(',')[0];
            //one way to do it
            if (!addrData[address])
                addrData[address] = {up: 0, down: 0};

            if (weight > 0) {
                addrData[address].up++;
                heatmapData.push(point);
            }
            else {
                addrData[address].down++;
                coolmapData.push(point);
            }

            lastId = markerElem.getAttribute('id');
        });


        heatmap = new google.maps.visualization.HeatmapLayer({ data: heatmapData});/*, gradient:
                ['rgba(255, 0, 0, 0)',
                'rgba(255, 255, 0, 0.9)',
                'rgba(0, 255, 0, 0.7)',
                'rgba(173, 255, 47, 0.5)',
                'rgba(152, 251, 152, 0)',
                'rgba(152, 251, 152, 0)',
                'rgba(0, 0, 238, 0.5)',
                'rgba(186, 85, 211, 0.7)',
                'rgba(255, 0, 255, 0.9)',
                'rgba(255, 0, 0, 1)'] });*/
        coolmap = new google.maps.visualization.HeatmapLayer({data: coolmapData, gradient:
        ['rgba(0, 255, 255, 0)',
            'rgba(0, 255, 255, 1)',
            'rgba(0, 191, 255, 1)',
            'rgba(0, 127, 255, 1)',
            'rgba(0, 63, 255, 1)',
            'rgba(0, 0, 255, 1)',
            'rgba(0, 0, 223, 1)',
            'rgba(0, 0, 191, 1)',
            'rgba(0, 0, 159, 1)',
            'rgba(0, 0, 127, 1)',
            'rgba(63, 0, 91, 1)',
            'rgba(127, 0, 63, 1)',
            'rgba(191, 0, 31, 1)',
            'rgba(255, 0, 0, 1)']});

        heatmap.setMap(map);
        coolmap.setMap(map);
    });

    geocoder = new google.maps.Geocoder;

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
        //map.setCenter(event.latLng);
        map.panTo(event.latLng);
        map.setZoom(18);

        codeCoor(event.latLng, openMenu);
    });

    var source = new EventSource("php/phpsqlinfo_lastrow.php");

    //very important function, make it its onw
    source.onmessage = function(event) {
        checkLast(event);
    };
}

function checkLast(event)
{
    var res = JSON.parse(event.data);

    if(lastId && res['id'] !== lastId)
    {
        lastId = res['id'];

        var point = new google.maps.LatLng( parseFloat(res['lat']), parseFloat(res['lng']));

        var a = res['addr'].split(",")[0];
        if(!addrData[a])
            addrData[a] =  {up: 0, down: 0};

        if(parseFloat(res['weight']) > 0) {
            addrData[a].up++;
            heatmapData.push(point);
            heatmap.setMap(map);
        }
        else {
            addrData[a].down++;
            coolmapData.push(point);
            coolmap.setMap(map);
        }

        //currently open
        if(a === cur)
        {
            setElemText("upvalue", addrData[a].up);
            setElemText("downvalue", addrData[a].down);
        }
    }
}


function openMenu()
{
    status = 0;
    var menu = document.getElementById("menu");

    setElemText("title", cur);
    document.getElementById("title").setAttribute("href", "https://m.uber.com/ul/?action=setPickup&client_id=G_iICjf80han-aBqCiHR0jF9LIKxmtG-&pickup=my_location&dropoff[formatted_address]=" + cur + "&dropoff[latitude]=" + marker.getPosition().lat() + "&dropoff[longitude]=" + marker.getPosition().lng());
    setElemText("desc", "description here");

    var up, down;
    if(addrData[cur])
    {
        up = addrData[cur].up;
        down = addrData[cur].down;
    }
    else {
        up = "0";
        down = "0";
    }

    setElemText("upvalue", up);
    setElemText("downvalue", down);

    document.getElementById("up").style.backgroundColor = 'inherit';
    document.getElementById("down").style.backgroundColor = 'inherit';
    menu.style.display = 'block';
}

function up() {
    //update the button color
    //update the value in text
    //make new heatpoint
    //save to mysql
    //update the value in addrData (savedata will take care of that, because we have to wait for address)
    //update status
    if(status === "0")
    {
        document.getElementById("up").style.backgroundColor = 'green';
        /*if(status === "-1")
            document.getElementById("down").style.backgroundColor = 'inherit';*/

        setElemText("upvalue", parseInt(document.getElementById('upvalue').innerText) + 1);
        /*heatmapData.push(marker.getPosition());
        heatmap.setMap(map);*/
        saveData(1);
        status = 1;
    }
}

function down()
{
    if(status === "0")
    {
        document.getElementById("down").style.backgroundColor = "#800000";
        /*if(status === "1")
            document.getElementById("up").style.backgroundColor = 'inherit';*/

        setElemText("downvalue", parseInt(document.getElementById('downvalue').innerText) - 1);
        /*heatmapData.push(marker.getPosition());
        heatmap.setMap(map);*/
        saveData(-1);
        status = -1;
    }
}

//clear all children and set inner textnode to some text
//literally use innerhtml
function setElemText(id, text)
{
    var elem = document.getElementById(id);

    while(elem.firstChild)
        elem.removeChild(elem.firstChild);

    elem.appendChild(document.createTextNode(text));
}


function codeCoor(latLng, callback) {
    var addr = "";
    geocoder.geocode({'location': latLng}, function (results, status) {
        if (status === 'OK') {
            if (results[0]) {
                cur = results[0]["formatted_address"].split(',')[0];
                callback();
            }
            else
                window.alert('No nearby addresses found');
        }
        else
            window.alert('Search failed due to: ' + status);
    });

    /*var name = document.createElement("p");
    name.appendChild(document.createTextNode(addr));*/
    //cur = "test";
    /*var name = document.createTextNode(cur);
    document.getElementById("menu").appendChild(name);
    document.getElementById("menu").style.display = 'block';*/
}

function saveData(weight)
{
    var latlng = marker.getPosition();
    geocoder.geocode({'location': latlng}, function(results, status)
    {
        writeEntry(latlng,weight, results,status);
    });
}

function writeEntry(latlng, weight, results, status)
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
    var url = 'php/phpsqlinfo_addrow.php?lat=' + latlng.lat() + '&lng=' + latlng.lng() + '&addr=' + a + '&up=' + weight;

    downloadUrl(url, function(data, responseCode) {
        if (responseCode == 200 && data.responseText.length <= 1) {
            /*[a].down += weight;*/
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

