<?php
require("phpsqlinfo_dbinfo.php");

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

//last one
$query = "SELECT * FROM events ORDER BY id DESC LIMIT 1";
$result = mysqli_query($connection, $query);
if(!$result)
{
    die('Invalid query: ' . mysqli_error($connection));
}


$query = "SELECT * FROM desc ORDER BY time DESC LIMIT 1";
$result2 = mysqli_query($connection, $query);
if(!$result2)
{
    die('Invalid query: ' . mysqli_error($connection));
}

header('Content-Type: text/event-stream');
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");

while($row = @mysqli_fetch_assoc($result))
{
    $data['lat'] = $row['lat'];
    $data['lng'] = $row['lng'];
    $data['weight'] = $row['weight'];
    $data['time'] = $row['time'];
    $data['addr'] = $row['addr'];
    $data['id'] = $row['id'];
}

while($row = @mysqli_fetch_assoc($result2))
{
    $data2['addr'] = $row['addr'];
    $data2['info'] = $row['info'];
    $data2['time'] = $row['time'];
}

$res['vote'] = $data;
$res['desc'] = $data2;

echo 'data: ' . json_encode($res) . "\n\n";
//echo 'data: ' . json_encode($_GET) . "\n\n";
ob_flush();
flush();

?>
