<?php
/**
 * @file Stores the label id (passed in from the front-end) in a session variable
 * to be referenced as the user navigates into the wizard.
 *
 * Creation Date: 8/11/16
 *
 * @author Michael Kim
 * @author Trevor Morse
 */
session_start();
$_SESSION['label_id'] = $_POST['label_id'];
echo $_SESSION['label_id'];
