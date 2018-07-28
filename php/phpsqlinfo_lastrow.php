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

echo 'data: ' . json_encode($data) . "\n\n";
//echo 'data: ' . json_encode($_GET) . "\n\n";
ob_flush();
flush();

?>
