<?php

// show file views counter
$counter_file = 'counter.txt';
$counter = file_get_contents($counter_file);

echo $counter;

?>