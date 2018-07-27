<?php
require("phpsqlinfo_dbinfo.php");

$lat = $_GET['lat'];
$lng = $_GET['lng'];
$weight = $_GET['up'];
$addr = $_GET['addr'];

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

$result = mysqli_query($connection, $query);

if(!$result)
{
    die('Invalid query: ' . mysqli_error($connection));
}

header('Content-Type: text/event-stream');
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");

$data['lat'] = $lat;
$data['lng'] = $lng;
$data['weight'] = $weight;
$data['addr'] = $addr;

echo 'data: ' . json_encode($data) . "\n\n";
ob_flush();
flush();

?>
