<?php
/**
 * Created by PhpStorm.
 * User: morse
 * Date: 8/1/16
 * Time: 10:05 AM
 */


if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $filename = handleData($_POST["filename"]);
    header('Content-Type: text/xml');
    header("Content-Disposition: attachment; filename=\"$filename\"");
    readfile('/tmp/test.xml');
}

function handleData($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}