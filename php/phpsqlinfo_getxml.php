<?php
require("phpsqlinfo_dbinfo.php");

$doc = new DOMDocument("1.0", 'UTF-8');
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

//get records from within 8 hours
//$query = "SELECT * FROM events WHERE DATE(time) = CURDATE() OR DATE(time) = DATE(NOW() - INTERVAL 1 Day)";
//$query = "SELECT * FROM events WHERE DATE(time) BETWEEN UTC_TIMESTAMP() AND UTC_TIMESTAMP() - INTERVAL 8 HOUR";
$query = "SELECT * FROM events WHERE time < NOW() and time > NOW() - INTERVAL 8 HOUR";
$result = mysqli_query($connection, $query);
if(!$result)
{
    die('Invalid query: ' . mysqli_error($connection));
}

header('Content-type: text/xml; charset=utf-8');

header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");

$data = array();

while($row = @mysqli_fetch_assoc($result))
{
    $data[] = array("lat" => $row['lat'],
                    "lng" => $row['lng'],
                    "weight" => $row['weight'],
                    "time" => $row['time'],
                    "addr" => $row['addr'],
                    "id" => $row['id']);
    /*$node = $doc->createElement("event");
    $newnode = $parnode->appendChild($node);

    $newnode->setAttribute("lat", $row['lat']);
    $newnode->setAttribute("lng", $row['lng']);
    $newnode->setAttribute("weight", $row['weight']);
    $newnode->setAttribute("time", $row['time']);
    $newnode->setAttribute("addr", $row['addr']);
    $newnode->setAttribute("id", $row['id']);*/
}
echo json_encode($data);
ob_flush();
flush();

//echo $doc->saveXML();

?>
