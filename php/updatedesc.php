<?php
require("phpsqlinfo_dbinfo.php");

$addr = $_GET['addr'];
$desc = $_GET['desc'];

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


$query = sprintf("REPLACE INTO descs " .
        " (addr, info) " .
        " VALUES ('%s', '%s');",
        mysqli_real_escape_string($connection, $addr),
        mysqli_real_escape_string($connection, $desc));

$result = mysqli_query($connection, $query);

if(!$result)
{
    die('Invalid query: ' . mysqli_error($connection));
}

?>
