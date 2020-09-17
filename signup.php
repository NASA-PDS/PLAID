<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>PLAID Sign Up</title>
    <link href="thirdparty/css/bootstrap.css" rel="stylesheet">
    <link href="css/user_management.css" rel="stylesheet">
</head>
<body>
<div class="container">

    <form class="form-signup" action="php/interact_db.php" method="post">
        <h2 class="form-signup-heading">Create an account</h2>
        <?php
        //  Enable the use of Session variables
        session_start();
        // TODO: Figure out why the $_SESSION[] array variable is empty
        //echo session_id();
        //  IF the error code is not empty
        if(isset($_SESSION['error_code']) && !empty($_SESSION['error_code'])) {
            $error_code = $_SESSION['error_code'];
            //  Clear the Session error code, so no error message next time
            unset($_SESSION['error_code']);
            $error_msg = "unknown";
            if ($error_code == 20) {
                $error_msg = "'Password' and 'Verify Password' must be the same.";
            }
            // Do not show tell-tale error messages, for Security reasons
            //if ($error_code == 21) {
            //    $error_msg = "The given e-mail address is NOT in the correct format 'xxx@xxx.xxx'.";
            //}
            echo '<div class="statusmsg">Error:  '.$error_msg.'</div>'; // Display our error message and wrap it with a div with the class "statusmsg".

        }
        ?>
        <label for="inputEmail" class="sr-only">Email address</label>
        <input type="email" id="inputEmail" class="form-control" name="email" placeholder="Email address" required autofocus>
        <label for="inputPassword" class="sr-only">Password</label>
        <input type="password" id="inputPassword" class="form-control" name="password" placeholder="Password" required>
        <label for="verifyPassword" class="sr-only">Verify Password</label>
        <input type="password" id="verifyPassword" class="form-control" name="verifyPassword" placeholder="Verify password" required>
        <label for="inputFullName" class="sr-only">Full name</label>
        <input type="text" id="inputFullName" class="form-control" name="full_name" placeholder="Full name" required>
        <label for="inputOrganization" class="sr-only">Organization</label>
        <input type="text" id="inputOrganization" class="form-control" name="organization" placeholder="Organization" required>
        <input id="submit" class="btn btn-lg btn-primary btn-block" type="submit" value="Sign Up">
        <input name="function" value="insertUser" style="display: none;">
    </form>
    <div class="signUpWrapper">
        <button id="signUp" class="btn btn-lg btn-primary btn-block" onclick="location.href='index.php';">Cancel</button>
    </div>
</div>
</body>
</html>
