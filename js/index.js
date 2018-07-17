function initMap() {
    var durham = {lat: 43.136, lng: -70.926};

    var mOptions =
    {
        zoom: 15,
        center: durham,
        disableDefaultUI: true
    }

    var map = new google.maps.Map( document.getElementById('map'), mOptions);

    //var marker = new google.maps.Marker({position: durham, map: map});
}