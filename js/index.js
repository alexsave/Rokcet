var map;
var marker;

var heatmap;
var coolmap;

let geocoder;

var addrData;

var cur = "";
var status = 0;

var lastId;
var lastDescTime;

var mymap;

//initMap();
window.onload = initMap;

function initMap()
{
    var durham = {lat: 43.136, lng: -70.926};
    mymap = L.map('mapid').setView(durham, 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        minZoom: 14,
        //attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
    }).addTo(mymap);

    heatmap = L.heatLayer([], {radius: 10, maxZoom: 16, blur: 15, gradient: { 0.3: 'green', 0.5: 'yellow', 0.8: 'orange', 1: 'red' }}).addTo(mymap);
    coolmap = L.heatLayer([], {radius: 10, maxZoom: 16, blur: 15, gradient: {0.3: 'cyan', 0.5: 'blue', 0.8: 'purple', 1: 'red'}}).addTo(mymap);
    addrData = new Object();

    marker = L.circleMarker([0,0], {
        radius: 2,
        color: 'red',
        strokeWeight: 1,
        fillColor: 'red',
        fillOpacity: 0.5
    });

    downloadUrl('php/phpsqlinfo_getxml.php', function(event) {
        var res = JSON.parse(event.responseText);

        for(var i = 0; i < res.length; i++)
        {
            res[i];

            var weight = parseInt(res[i]["weight"]);

            var address = res[i]["addr"].split(',')[0];

            if (!addrData[address])
                addrData[address] = {up: 0, down: 0, info: "Add description"};

            if (weight > 0) {
                addrData[address].up++;
                heatmap.addLatLng([res[i]["lat"], res[i]["lng"]]);
            }
            else {
                addrData[address].down++;
                coolmap.addLatLng([res[i]["lat"], res[i]["lng"]]);
            }

            lastId = res[i]["id"];
        }

    });

    downloadUrl('php/getdesc.php', function(event)
    {
        //alert(event.responseText);
        var res = JSON.parse(event.responseText);
        //alert(res[0]['addr']);

        for(var i = 0; i < res.length; i++)
        {
            if (!addrData[res[i]['addr']])
                addrData[res[i]['addr']] = {up: 0, down: 0, info: "Add description"};
            addrData[res[i]['addr']]['info'] = res[i]['desc'];
        }

        if(res.length !== 0)
            lastDescTime = res[0]['time'];
    });

    mymap.on('click', function(e)
    {
        if(e.latlng.lat < 43.1 || e.latlng.lat > 43.2 || e.latlng.lng < -71 || e.latlng.lng > -70.9)
            return;

        if(marker)
            mymap.removeLayer(marker);

        //scrolling away will close the menu
        marker.setLatLng(e.latlng);
        marker.addTo(mymap);
        mymap.setView(e.latlng, 18);

        codeCoor(e.latlng, openMenu);
    });

    var source = new EventSource("php/phpsqlinfo_lastrow.php");

    source.onmessage = function(event) {
        checkLast(event);
    };
}

function openSearch()
{
    document.getElementById("search").style.display = "none";
    document.getElementById("searchfield").style.display = "block";
    document.getElementById("text").setAttribute("contenteditable", "true");

    document.getElementById("text").onkeypress = function(e)
    {
        if(e.key === "Enter") {
            document.getElementById("search").style.display = "block";
            document.getElementById("searchfield").style.display = "none";

            if (marker && marker.setMap) {
                marker.setMap(null);
            }

            downloadUrl("https://maps.googleapis.com/maps/api/geocode/json?address=" + document.getElementById("text").innerText+",+Durham,+NH", function(results)
            {
                results = JSON.parse(results.responseText)['results'];
                if (results[0])
                {
                    cur = results[0]["formatted_address"].split(',')[0];
                    var latlng = results[0]['geometry']['location'];

                    if(latlng.lat < 43.1 || latlng.lat > 43.2 || latlng.lng < -71 || latlng.lng > -70.9)
                        return;

                    if(marker)
                        mymap.removeLayer(marker);

                    marker.setLatLng(latlng);
                    marker.addTo(mymap);
                    mymap.setView(latlng, 18);

                    openMenu();
                }
            });
            document.getElementById("text").innerText = "";

            //jesus fuck theres gotta be a better way
            /*geocoder.geocode({'address': document.getElementById("text").innerText + " Durham NH"}, function (results, status) {
                if (status === 'OK') {
                    if (results[0]) {
                        cur = results[0]["formatted_address"].split(',')[0];
                        marker = new google.maps.Marker({
                            position: results[0].geometry.location,
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

                        document.getElementById("text").innerText = "";
                        map.panTo(results[0].geometry.location);
                        map.setZoom(18);
                        openMenu();
                    }
                    else
                        window.alert('No nearby addresses found');
                }
            });*/
        }
    };

    document.getElementById("text").focus();
}

function checkLast(event)
{
    var two = JSON.parse(event.data);
    var res = two["vote"];
    var desc = two["desc"];

    if(lastId && res['id'] !== lastId)
    {
        lastId = res['id'];

        var a = res['addr'].split(",")[0];
        if(!addrData[a])
            addrData[a] = {up: 0, down: 0, info: "Add description"};

        if(parseFloat(res['weight']) > 0) {
            addrData[a].up++;
            heatmap.addLatLng([res["lat"], res["lng"]]);
        }
        else {
            addrData[a].down++;
            coolmap.addLatLng([res["lat"], res["lng"]]);
        }

        //currently open
        if(a === cur)
        {
            setElemText("upvalue", addrData[a].up);
            setElemText("downvalue", addrData[a].down);
        }
    }

    if(lastDescTime && desc['time'] !== lastDescTime)
    {
        lastDescTime = desc['time'];

        var a = desc['addr'].split(",")[0];
        if(!addrData[a])
            addrData[a] = {up: 0, down: 0, info: "Add description"};

        addrData[a].info = desc['info'];

        if(a === cur)
            document.getElementById("desc").innerText = desc['info'];
    }
}


function openMenu()
{
    status = 0;
    var menu = document.getElementById("menu");

    var title = document.getElementById("title");
    var desc = document.getElementById("desc");

    title.innerText = cur;
    title.setAttribute("href", "https://m.uber.com/ul/?action=setPickup&client_id=G_iICjf80han-aBqCiHR0jF9LIKxmtG-&pickup=my_location&dropoff[formatted_address]=" + cur + "&dropoff[latitude]=" + marker.getLatLng().lat + "&dropoff[longitude]=" + marker.getLatLng().lng);
    desc.innerText = addrData[cur] ? addrData[cur]['info'] : "Add description";
    desc.setAttribute("contenteditable", "true");

    desc.onclick = function()
    {
        document.getElementById("desc").innerText = "";
    };

    desc.onkeypress = function(e)
    {
        if(e.key === "Enter")
        {
            desc.setAttribute("contenteditable", "false");
            desc.onclick = function(){};
            //add savign code here
            updateDesc();
        }
    };

    desc.onfocusout = function(e)
    {
        desc.setAttribute("contenteditable", "false");
        desc.onclick = function(){};
        //add savign code here
        updateDesc();
    }

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

function updateDesc()
{
    var a = cur;
    var d = document.getElementById("desc").innerText;

    if (!addrData[cur])
        addrData[cur] = {up: 0, down: 0, info: "Add description"};
    addrData[cur].info = document.getElementById("desc").innerText;

    var url = 'php/updatedesc.php?addr=' + a + '&desc=' + d;

    downloadUrl(url, function(data, responseCode) { });
}

function checkCookie()
{
    var idk = document.cookie.indexOf('submits=');
    if(idk === -1)
        return 0;
    else
        return parseInt(document.cookie.substring(idk + 'submits='.length, document.cookie.length));
}

function up() {
    //update the button color
    //update the value in text
    //make new heatpoint
    //save to mysql
    //update the value in addrData (savedata will take care of that, because we have to wait for address)
    //update status

    if(checkCookie() > 10)
        return;

    if(status === "0")
    {
        document.getElementById("up").style.backgroundColor = 'green';

        setElemText("upvalue", parseInt(document.getElementById('upvalue').innerText) + 1);
        saveData(1);
        status = 1;
    }
}

function down()
{
    if(checkCookie() > 10)
        return;
    if(status === "0")
    {
        document.getElementById("down").style.backgroundColor = "#800000";

        setElemText("downvalue", parseInt(document.getElementById('downvalue').innerText) + 1);

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


function codeCoor(latLng, callback)
{
    downloadUrl("http://maps.googleapis.com/maps/api/geocode/json?sensor=false&language=en&latlng=" + latLng.lat + "," +latLng.lng , function(results)
    {
        results = JSON.parse(results.responseText)['results'];
        if (results[0])
        {
            cur = results[0]["formatted_address"].split(',')[0];
            callback();
        }
        else
            window.alert('No nearby addresses found');
    });

    /*downloadUrl(" https://nominatim.openstreetmap.org/reverse?format=json&lat=" + latLng.lat + "&lon=" + latLng.lng + "&zoom=18&addressdetails=1", function(results)
    {
        //there might be a better way but idk
        var addr = JSON.parse(results.responseText).display_name;
        cur = addr.split(',')[0] + addr.split(',')[1];
        callback();
    });*/
}

function saveData(weight)
{
    var latLng = marker.getLatLng();

    downloadUrl("http://maps.googleapis.com/maps/api/geocode/json?sensor=false&language=en&latlng=" + latLng.lat + "," +latLng.lng , function(results)
    {
        results = JSON.parse(results.responseText)['results'];
        if (results[0])
            writeEntry(latLng, weight, results, status);
        else
            window.alert('No nearby addresses found');
    });
}

function writeEntry(latlng, weight, results, status)
{
    var a = "-1";
    if (results[0])
        a = results[0]["formatted_address"];
    else
        window.alert('No results found');

    //-----------------------
    var url = 'php/phpsqlinfo_addrow.php?lat=' + latlng.lat + '&lng=' + latlng.lng + '&addr=' + a + '&up=' + weight;

    downloadUrl(url, function(data, responseCode) {
        if (responseCode === 200 && data.responseText.length <= 1) {
            /*[a].down += weight;*/
            updateCookie();
        }
    });
}

function updateCookie()
{
    var idk = document.cookie.indexOf('submits=');

    var c = 1;
    if(idk !== -1)
    {
        c = parseInt(document.cookie.substring(idk + 'submits='.length, document.cookie.length));
        c++;
    }

    var t = new Date();
    t.setTime(t.getTime() + (8*60*60*1000));
    document.cookie = 'submits=' + c + ";expires=" + t.toUTCString();
}

function downloadUrl(url, callback)
{
    var request = new XMLHttpRequest;

    request.onreadystatechange = function()
    {
        if(request.readyState === 4)
        {
            request.onreadystatechange = doNothing;
            callback(request, request.status);//this line needs to be changed to response xml
        }
    };
    request.open('GET', url, true);
    request.send(null);
}

function doNothing() {}

