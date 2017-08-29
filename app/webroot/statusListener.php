<?php

// receives a POST or GET request from the TD and writes out the included variables
// it's up to the viewer page to interpret those; we do no validation here

$kFileOutput = "tdstatus.txt";

$handle = fopen($kFileOutput, "w");

foreach($_GET as $key => $val)
  fputs($handle, "$key=" . $val . "\n");

foreach($_POST as $key => $val)
  fputs($handle, "$key=" . $val . "\n");

fclose($handle);

?>
