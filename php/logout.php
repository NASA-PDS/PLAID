<?php
/**
 * @file Sets the login field in a session variable to false, signalizing a user logout.
 * This way, any other page that is navigated to within the LDT app will have the information of whether or not
 * a user has logged in successfully to get there.
 *
 * Creation Date: 8/10/16.
 *
 * @author Michael Kim
 * @author Trevor Morse
 */
session_start();
$_SESSION['login'] = false;
header("Location: ../login.html");
