<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Send Link to Reset Password</title>
    <link href="../thirdparty/css/bootstrap.css" rel="stylesheet">
    <link href="../css/user_management.css" rel="stylesheet">
</head>
<body>
<div class="container">
<form class="form-signup" action="interact_db.php" method="post">
    <h5 class="form-signup-heading">Send Link to Reset Password</h5>

    <?php
    /**
     * Created by PhpStorm.
     * User: munn
     * Date: 5/8/2017
     * Time: 10:57 AM
     */
    //  Enable the use of Session variables
    include_once("PlaidSessionHandler.php");
    $session_handler = new PlaidSessionHandler();
    session_start();
    //  IF the error code is not empty
    if(isset($_SESSION['error_code']) && !empty($_SESSION['error_code'])) {
        //  Clear the Session error code, so no error message next time
        unset($_SESSION['error_code']);
        // Removed message of invalid email message, per SPL ticket
    }
    ?>

    <label for="inputEmail" class="sr-only">Email address</label>
    <input type="email" id="inputEmail" class="form-control" name="email" placeholder="Email address" required autofocus><br>
    <input id="submit" class="btn btn-lg btn-primary btn-block" type="submit" value="Send Link to Reset Password"><br>
    <input name="function" value="sendLinkToResetPassword" style="display: none;">
</form>
<div class="signUpWrapper">
    <button id="signUp" class="btn btn-lg btn-primary btn-block" onclick="location.href='../index.php';">Cancel</button>
</div>
</div>
</body>
</html>
