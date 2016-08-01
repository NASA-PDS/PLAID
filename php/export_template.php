<?php
/**
 * Created by PhpStorm.
 * User: morse
 * Date: 8/1/16
 * Time: 10:05 AM
 */
header('Content-Type: text/xml');
header('Content-Disposition: attachment; filename="LDT_output.xml"');
readfile('/tmp/test.xml');