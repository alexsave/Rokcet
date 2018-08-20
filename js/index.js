let mymap;
let marker;

let heatmap;
let coolmap;

let addrData;

let cur = "";
let status = 0;

let lastId;
let lastDescTime;

let maxScore = 1;

//initMap();
window.onload = initMap;

function initMap()
{
    document.addEventListener('touchstart', doNothing, {passive: true});
    let durham = {lat: 43.136, lng: -70.926};
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
        let res = JSON.parse(event.responseText);

        for(let i = 0; i < res.length; i++)
        {
            let weight = parseInt(res[i]["weight"]);

            let address = res[i]["addr"].split(',')[0];

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
        getMaxScore();
    });

    downloadUrl('php/getdesc.php', function(event)
    {
        //alert(event.responseText);
        let res = JSON.parse(event.responseText);
        //alert(res[0]['addr']);

        for(let i = 0; i < res.length; i++)
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

    let source = new EventSource("php/phpsqlinfo_lastrow.php");

    source.onmessage = function(event) {
        checkLast(event);
    };
}

function getMaxScore() {
    for (let o in addrData)
    {
        if(addrData[o].up > maxScore)
            maxScore = addrData[o].up;
    }
}

function openSearch()
{
    let textEl = document.getElementById("text");
    document.getElementById("search").style.display = "none";
    document.getElementById("searchfield").style.display = "block";
    textEl.setAttribute("contenteditable", "true");

    textEl.onkeypress = function(e)
    {
        if(e.key === "Enter") {
            document.getElementById("search").style.display = "block";
            document.getElementById("searchfield").style.display = "none";

            let res = textEl.innerText;
            let search = res;

            for(let o in addrData)
            {
                if(addrData[o].info.toLowerCase() === res.toLowerCase())
                {
                    search = o;
                    break;
                }
                else if(addrData[o].info.toLowerCase().indexOf(res.toLowerCase()) !== -1)
                {
                    if(addrData[search])
                    {
                        if (addrData[o]['up'] > addrData[search]['up'])
                            search = o;
                    }
                    else
                        search = o;
                }
            }

            downloadPost("https://maps.googleapis.com/maps/api/geocode/json?address=" + search + ",+Durham,+NH", "", function(results)
            {
                results = JSON.parse(results.responseText)['results'];
                if (results[0])
                {
                    cur = results[0]["formatted_address"].split(',')[0];
                    let latlng = results[0]['geometry']['location'];

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
            textEl.innerText = "";
        }
    };

    document.getElementById("text").focus();
}

function checkLast(event)
{
    let two = JSON.parse(event.data);
    let res = two["vote"];
    let desc = two["desc"];

    if(lastId && res['id'] !== lastId)
    {
        lastId = res['id'];

        let a = res['addr'].split(",")[0];
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

        getMaxScore();

        //currently open
        if(a === cur)
        {
            setElemText("upvalue", addrData[a].up);
            setElemText("downvalue", addrData[a].down);
            let heatscore = (addrData[cur].up-addrData[cur].down)/maxScore*100;
            document.getElementById("heatscore").innerText = heatscore + "🔥";
        }
    }

    if(lastDescTime && desc['time'] !== lastDescTime)
    {
        lastDescTime = desc['time'];

        let a = desc['addr'].split(",")[0];
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
    let menu = document.getElementById("menu");

    let title = document.getElementById("title");
    let desc = document.getElementById("desc");

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
    };

    let up, down, heatscore;
    if(addrData[cur])
    {
        up = addrData[cur].up;
        down = addrData[cur].down;
        heatscore = (addrData[cur].up-addrData[cur].down)/maxScore*100;
    }
    else
    {
        up = "0";
        down = "0";
        heatscore = 0;
    }

    document.getElementById("heatscore").innerText = heatscore + "🔥";

    setElemText("upvalue", up);
    setElemText("downvalue", down);

    document.getElementById("up").style.backgroundColor = 'inherit';
    document.getElementById("down").style.backgroundColor = 'inherit';
    menu.style.display = 'block';
}

function updateDesc()
{
    let a = cur;
    let d = document.getElementById("desc").innerText;

    if (!addrData[cur])
        addrData[cur] = {up: 0, down: 0, info: "Add description"};
    addrData[cur].info = document.getElementById("desc").innerText;

    let url = 'php/updatedesc.php?addr=' + a + '&desc=' + d;

    downloadUrl(url, function(data, responseCode) { });
}

function checkCookie()
{
    let idk = document.cookie.indexOf('submits=');
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

    getMaxScore();
    if(status === 0)
    {
        document.getElementById("up").style.backgroundColor = 'green';

        setElemText("upvalue", parseInt(document.getElementById('upvalue').innerText) + 1);
        let heatscore = (addrData[cur].up-addrData[cur].down)/maxScore*100;
        document.getElementById("heatscore").innerText = heatscore + "🔥";

        saveData(1);
        status = 1;
    }
}

function down()
{
    if(checkCookie() > 10)
        return;

    getMaxScore();
    if(status === 0)
    {
        document.getElementById("down").style.backgroundColor = "#800000";

        setElemText("downvalue", parseInt(document.getElementById('downvalue').innerText) + 1);
        let heatscore = (addrData[cur].up-addrData[cur].down)/maxScore*100;
        document.getElementById("heatscore").innerText = heatscore + "🔥";

        saveData(-1);
        status = -1;
    }
}

//clear all children and set inner textnode to some text
//literally use innerhtml
function setElemText(id, text)
{
    let elem = document.getElementById(id);

    while(elem.firstChild)
        elem.removeChild(elem.firstChild);

    elem.appendChild(document.createTextNode(text));
}


function codeCoor(latLng, callback)
{
    downloadUrl("https://maps.googleapis.com/maps/api/geocode/json?sensor=false&language=en&latlng=" + latLng.lat + "," +latLng.lng , function(results)
    {
        results = JSON.parse(results.responseText)['results'];
        if (results[0])
        {
            cur = results[0]["formatted_address"].split(',')[0];
            callback();
        }
            //window.alert('No nearby addresses found');
    });

    /*downloadUrl(" https://nominatim.openstreetmap.org/reverse?format=json&lat=" + latLng.lat + "&lon=" + latLng.lng + "&zoom=18&addressdetails=1", function(results)
    {
        //there might be a better way but idk
        let addr = JSON.parse(results.responseText).display_name;
        cur = addr.split(',')[0] + addr.split(',')[1];
        callback();
    });*/
}

function saveData(weight)
{
    let latLng = marker.getLatLng();

    downloadUrl("https://maps.googleapis.com/maps/api/geocode/json?sensor=false&language=en&latlng=" + latLng.lat + "," +latLng.lng , function(results)
    {
        results = JSON.parse(results.responseText)['results'];
        if (results[0])
            writeEntry(latLng, weight, results, status);
            //window.alert('No nearby addresses found');
    });
}

function writeEntry(latlng, weight, results, status)
{
    let a = "-1";
    if (results[0])
        a = results[0]["formatted_address"];
        //window.alert('No results found');

    //-----------------------
    let url = 'php/phpsqlinfo_addrow.php?lat=' + latlng.lat + '&lng=' + latlng.lng + '&addr=' + a + '&up=' + weight;

    downloadUrl(url, function(data, responseCode) {
        if (responseCode === 200 && data.responseText.length <= 1) {
            /*[a].down += weight;*/
            updateCookie();
        }
    });
}

function updateCookie()
{
    let idk = document.cookie.indexOf('submits=');

    let c = 1;
    if(idk !== -1)
    {
        c = parseInt(document.cookie.substring(idk + 'submits='.length, document.cookie.length));
        c++;
    }

    let t = new Date();
    t.setTime(t.getTime() + (8*60*60*1000));
    document.cookie = 'submits=' + c + ";expires=" + t.toUTCString();
}

function downloadUrl(url, callback)
{
    let request = new XMLHttpRequest;

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

function downloadPost(url, params, callback)
{
    let request = new XMLHttpRequest;
    request.onreadystatechange = function()
    {
        if(request.readyState === 4)
        {
            request.onreadystatechange = doNothing;
            callback(request, request.status);//this line needs to be changed to response xml
        }
    };
    request.open('POST', url, true);
    request.send(params);
}

function doNothing() {}

