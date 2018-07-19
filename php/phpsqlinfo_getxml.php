<?php
require("phpsqlinfo_dbinfo.php");

$doc = new DOMDocument("1.0");
$node = $doc->createElement("events");
$parnode = $doc->appendChild($node);

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

$query = "SELECT * FROM events WHERE 1";
$result = mysqli_query($connection, $query);
if(!$result)
{
    die('Invalid query: ' . mysqli_error($connection));
}

header('Content-type: text/xml; charset=utf-8');

while($row = @mysqli_fetch_assoc($result))
{
    $node = $doc->createElement("events");
    $newnode = $parnode->appendChild($node);

    $newnode->setAttribute("lat", $row['lat']);
    $newnode->setAttribute("lng", $row['lng']);
    $newnode->setAttribute("weight", $row['weight']);
}

echo $doc->saveXML();

?>
