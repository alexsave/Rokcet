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

$query = "SELECT * FROM descs ORDER BY time DESC";
$result = mysqli_query($connection, $query);
if(!$result)
{
    die('Invalid query: ' . mysqli_error($connection));
}

header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");

$data = array();

while($row = @mysqli_fetch_assoc($result))
{
    $data[] = array('addr' => $row['addr'], 'desc' => $row['info'], 'time' => $row['time']);
}

echo json_encode($data);
ob_flush();
flush();

?>
