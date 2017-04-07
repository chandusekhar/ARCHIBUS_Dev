<?php

require_once("JSON.php");

//make a new json parser
$json = new Services_JSON;

//decode incoming JSON string
$inputSocket = fopen('php://input','rb');
$contents = stream_get_contents($inputSocket);
fclose($inputSocket);
$contents = str_replace("=", "", $contents);
$jsonRequest = $json->decode($contents);

$today = date('Y-m-d G:i:s');

$sql = "INSERT INTO uc-auditlog (userid, date, page, auditxml) VALUES ";
$sql .= "(\"".$jsonRequest->userid."\", \"$today\", \"".$jsonRequest->page."\", \"".$jsonRequest->audit."\");";


print("<hr>$sql<hr>");


?>