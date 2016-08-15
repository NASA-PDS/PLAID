<?php
/**
 * Created by PhpStorm.
 * User: mikim
 * Date: 8/11/16
 * Time: 10:33 AM
 */
/*if(isset($_POST['function'])){
    call_user_func($_POST['function'], $_POST);
}

function editLabel($args) {
    session_start();
    $_SESSION['label_id'] = $args['label_id'];
    header("Location: ../wizard.php");
}*/
session_start();
$_SESSION['label_id'] = $_POST['label_id'];
echo $_SESSION['label_id'];
/*header("Location: ../wizard.php");*/