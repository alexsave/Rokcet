<?php
require("phpsqlinfo_dbinfo.php");

$lat = $_GET['lat'];
$lng = $_GET['lng'];
$weight = $_GET['up'];

$connection=mysqli_connect("localhost", $username, $password);
if(!$connection)
{
    die('Not connected : ' . mysqli_error());
}

$db_selected = mysqli_select_db($database, $connection);
if($db_selected)
{
    die('Can\'t use db : ' . mysqli_error());
}

$query = sprinf("INSERT INTO events " .
        " (id, lat, lng, weight) " .
        " VALUES (NULL, '%s', '%s', '%s');",
        mysqli_real_escape_string($lat),
        mysqli_real_escape_string($lng),
        mysqli_real_escape_string($weight));

/*$query = "INSERT INTO events " .
        " (id, lat, lng, weight) " .
        " VALUES (NULL, 123.123, 123.123, 1);*/

$result = mysqli_query($query);

if(!$result)
{
    die('Invalid query: ' . mysqli_error());
}

?>

