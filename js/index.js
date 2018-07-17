function initMap() {
    // The location of Uluru
    var durham = {lat: 43.136, lng: -70.926};
    // The map, centered at Uluru
    var map = new google.maps.Map(
        document.getElementById('map'), {zoom: 15, center: durham});
    // The marker, positioned at Uluru
    var marker = new google.maps.Marker({position: durham, map: map});
}