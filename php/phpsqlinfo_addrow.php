<?php
require("phpsqlinfo_dbinfo.php");

$lat = $_GET['lat'];
$lng = $_GET['lng'];
$weight = $_GET['up'];

$connection=mysql_connect("localhost", $username, $password);
if(!$connection)
{
    die('Not connected : ' . mysql_error());
}

$db_selected = mysql_select_db($database, $connection);
if($db_selected)
{
    die('Can\'t use db : ' . mysql_error());
}

$query = sprinf("INSERT INTO events " .
        " (id, lat, lng, weight) " .
        " VALUES (NULL, '%s', '%s', '%s');",
        mysql_real_escape_string($lat),
        mysql_real_escape_string($lng),
        mysql_real_escape_string($weight));

$result = mysql_query($query);

if(!$result)
{
    die('Invalid query: ' . mysql_error());
}

?>

