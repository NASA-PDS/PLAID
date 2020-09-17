<?php
/**
 * This file keeps the session alive
 */
include_once("PlaidSessionHandler.php");
$session_handler = new PlaidSessionHandler();
session_start();
?>