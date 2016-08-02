<?php
/**
 * Created by PhpStorm.
 * User: morse
 * Date: 8/2/16
 * Time: 10:53 AM
 */
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    header('Content-Type: text/plain');
    readfile('/tmp/test.xml');
}