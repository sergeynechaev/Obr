<?php

/**
 * Reads the specified file. This function is needed to read big size files, cause of
 * built-in readfile() function may be stopped while reading big file due to memory limit. 
 *
 * @param string $filename The absolute path to the file.
 * @return bool True if reading succeed, false otherwise.
 */
function readfile_chunked($filename)
{
    $chunksize = 1*(1024*1024);
    $buffer = '';
    $handle = fopen($filename, 'rb');
    
    if ($handle === FALSE) {
        return FALSE;
    }
    
    while (!feof($handle)) {
        $buffer = fread($handle, $chunksize);
        print $buffer;
    }
    
    return fclose($handle);
}

$entry_filename = 'obr-bobr.rar';

// get the path to the file
$entry_file = $entry_filename;

if (!is_file($entry_file)) {
	//echo 'false';
    exit;
}

//echo 'get='.filesize($entry_file);
//exit;

// increase file views counter
$counter_file = 'counter.txt';
$counter = file_get_contents($counter_file);
file_put_contents($counter_file, ++$counter);

//echo $counter;
//exit;

// send file to the user
header('Content-type: application/octet-stream');
header('Content-Disposition: attachment; filename="obr.rar";');
header('Content-Length: '.filesize($entry_file));
readfile_chunked($entry_file);
exit;


// delete file or folder
//unlink($entry_dir);

?>