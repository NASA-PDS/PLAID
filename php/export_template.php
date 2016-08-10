<?php
/**
 * Created by PhpStorm.
 * User: morse
 * Date: 8/1/16
 * Time: 10:05 AM
 */

require_once("interact_db.php");
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $filename = handleData($_POST["filename"]);
    header('Content-Type: text/xml');
    header("Content-Disposition: attachment; filename=\"$filename\"");
    echo getLabelXML();
}

function handleData($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}