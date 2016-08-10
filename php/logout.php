<?php
/**
 * Created by PhpStorm.
 * User: mikim
 * Date: 8/10/16
 * Time: 2:09 PM
 */
session_start();
$_SESSION['login'] = false;
header("Location: ../login.html");