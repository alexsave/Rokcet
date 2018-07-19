<?php
require("phpsqlinfo_dbinfo.php");

$doc = docxml_new_doc("1.0");
$node = $doc->create_element("events");
$parnode = $doc->append_child($node);

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

header("Content-type: text/xml");

while($row = @mysqli_fetch_assoc($result))
{
    $node = $doc->create_element("events");
    $newnode = $parnode->append_child($node);

    $newnode->set_attribute("lat", $row['lat']);
    $newnode->set_attribute("lng", $row['lng']);
    $newnode->set_attribute("weight", $row['weight']);
}

$xmlfile = $doc->dump_mem();
echo $xmlfile;

?>
