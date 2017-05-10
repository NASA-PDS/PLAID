<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="cache-control" content="max-age=0" />
    <meta http-equiv="cache-control" content="no-cache" />
    <meta http-equiv="expires" content="0" />
    <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT" />
    <meta http-equiv="pragma" content="no-cache" />
    <title>PLAID Log In</title>
    <link href="thirdparty/css/bootstrap.css" rel="stylesheet">
    <link href="css/user_management.css" rel="stylesheet">
</head>
<body>
<div class="container">

    <form class="form-login" action="php/interact_db.php" method="post">
        <h2 class="form-login-heading">PDS Label Assistant for Interactive Design (PLAID)</h2>
        <?php
        //  Enable the use of Session variables
        session_start();
        //  IF the error code is not empty
        if(isset($_SESSION['error_code']) && !empty($_SESSION['error_code'])) {
            $error_code = $_SESSION['error_code'];
            //  Clear the Session error code, so no error message next time
            unset($_SESSION['error_code']);
            $error_msg = "unknown";
            if ($error_code == 1) {
                $error_msg = "Invalid Username and Password.";
            } elseif ($error_code == 2) {
                //  Get the Inactive E-mail Address from the Session variable
                $inactive_email = $_SESSION['inactive_email'];
                $error_msg = "E-mail address '".$inactive_email."' has not been verified yet. Click on this link to <a href=\"php/resend_verification_email.php\">re-send the verification e-mail</a>.";
            }
            echo '<div class="statusmsg">Error:  '.$error_msg.'</div>'; // Display our error message and wrap it with a div with the class "statusmsg".

        }
        ?>
        <label for="inputEmail" class="sr-only">Email address</label>
        <input name="email" type="email" id="inputEmail" class="form-control" placeholder="Email address" required autofocus>
        <label for="inputPassword" class="sr-only">Password</label>
        <input name="password" type="password" id="inputPassword" class="form-control" placeholder="Password" required>
        <small class="form-text text-muted"><a href="php/send_link_to_reset_password.php">Forgot Password?</a></small>
        <input id="logIn" class="btn btn-lg btn-primary btn-block" type="submit" value="Log In">
        <input name="function" value="verifyUser" style="display: none;">
    </form>
    <div class="signUpWrapper">
        <small class="form-text text-muted">Don't have an account? Click below.</small>
        <button id="signUp" class="btn btn-lg btn-primary btn-block" onclick="location.href='signup.php';">Sign up</button>
    </div>
</div>
</body>
</html>
