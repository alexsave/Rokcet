<?php
require("phpsqlinfo_dbinfo.php");

$lat = $_GET['lat'];
$lng = $_GET['lng'];
$weight = $_GET['up'];
$addr = 'test';//$_GET['addr'];

$connection=mysqli_connect("localhost", $username, $password);
if(!$connection)
{
    die('Not connected : ' . mysqli_error($connection));
}

$db_selected = mysqli_select_db($connection, $database);
if(!$db_selected)
{
    die('Can\'t use db : ' . mysqli_error($connection));
}

$query = sprintf("INSERT INTO events " .
        " (id, lat, lng, addr, weight) " .
        " VALUES (NULL, '%s', '%s', '%s', '%s');",
        mysqli_real_escape_string($connection, $lat),
        mysqli_real_escape_string($connection, $lng),
        mysqli_real_escape_string($connection, $addr),
        mysqli_real_escape_string($connection, $weight));

/*$query = "INSERT INTO events " .
        " (id, lat, lng, weight) " .
        " VALUES (NULL, 123.123, 123.123, 1);*/

$result = mysqli_query($connection, $query);

if(!$result)
{
    die('Invalid query: ' . mysqli_error($connection));
}

?>

