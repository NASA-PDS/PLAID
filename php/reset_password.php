<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>PLAID Password Reset</title>
    <!-- <link href="css/style.css" type="text/css" rel="stylesheet" /> -->
    <link href="../thirdparty/css/bootstrap.css" rel="stylesheet">
    <link href="../css/user_management.css" rel="stylesheet">
</head>
<body>
<!-- start container div -->
<div class="container">

    <!-- start wrap div -->
    <!-- <div id="wrap"> -->
        <!-- start PHP code -->
        <?php
        /**
         * Created by PhpStorm.
         * User: munn
         * Date: 5/8/2017
         * Time: 12:25 PM
         */
        require("configuration.php");
        include_once("PlaidSessionHandler.php");
        $session_handler = new PlaidSessionHandler();
        try{
            $host = DB_HOST;
            $db   = DB_DATABASE;
            $port = DB_PORT;
            $user = DB_USER;
            $pass = DB_PASSWORD;

            $LINK = new \PDO('mysql:host=' . $host .
                ';dbname='. $db .
                ';charset=utf8mb4;port=' . $port,
                $user,
                $pass,
                array(
                    \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                    \PDO::ATTR_PERSISTENT => false
                )
            );

            //  Enable use of session variables
            session_start();

            //  Sanitize the input by replacing special characters with HTML representations
            $email = sanitizeInput($_GET['email']);
            $hash = sanitizeInput($_GET['hash']);
            //  IF the email and hash parameters are in the URL
            if(isset($email) && !empty($email) AND isset($hash) && !empty($hash)){
                // Validate that the given E-mail address is in the correct format xxx@xxx.xxx
                $isValidEmailAddrFormat = filter_var($email, FILTER_VALIDATE_EMAIL);
                // IF the given E-mail address is NOT in a valid format
                if (! $isValidEmailAddrFormat) {
                    echo '<div class="statusmsg">The given url is invalid.</div>';
                    return;
                }
                //  Using the prepare() stmt. eliminates the need to escape special characters
                ///$email = mysql_escape_string($_GET['email']); // Set email variable
                ///$hash = mysql_escape_string($_GET['hash']); // Set hash variable
                //  Check that the given e-mail address and hash are in the User table
                $handle = $LINK->prepare('select id, active from user where email=? and activation_hash=?');
                $handle->bindValue(1, $email);
                $handle->bindValue(2, $hash);

                $handle->execute();
                $result = $handle->fetchAll(\PDO::FETCH_OBJ);

                //  IF we have a user with the given email address and hash
                if(count($result) > 0){
                    //  Store the email address and hash into session variables
                    $_SESSION['email'] = $email;
                    $_SESSION['hash'] = $hash;

                    //  Display the Reset Password form
                    echo '<form class="form-signup" action="interact_db.php" method="post">';
                    echo '<h4 class="form-signup-heading">PLAID Password Reset</h4>';

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

                    echo 'Email address: '.$email.'<br>';
                    echo '<label for="inputPassword" class="sr-only">Password</label>';
                    echo '<input type="password" id="inputPassword" class="form-control" name="password" placeholder="Password" required><br>';
                    echo '<label for="verifyPassword" class="sr-only">Verify Password</label>';
                    echo '<input type="password" id="verifyPassword" class="form-control" name="verifyPassword" placeholder="Verify password" required><br>';
                    echo '<input id="submit" class="btn btn-lg btn-primary btn-block" type="submit" value="Reset Password">';
                    echo '<input name="function" value="resetPassword" style="display: none;">';
                    echo '</form>';
                    echo '<div class="signUpWrapper">';
                    echo '<button id="signUp" class="btn btn-lg btn-primary btn-block" onclick="location.href=\'../index.php\';">Cancel</button>';
                    echo '</div>';

                }else{
                    // No match -> invalid url.
                    echo '<div class="statusmsg">The given url is invalid.</div>';
                }

            }else{
                // Invalid approach
                echo '<div class="statusmsg">Invalid approach, please use the link that has been sent to your email.</div>';
            }
        }
        catch(\PDOException $ex){
            print($ex->getMessage());
        }

        /**
         * Replaces special chars. in input data w/ their HTML representations
         */
        function sanitizeInput($data) {
            $data = trim($data);
            $data = stripslashes($data);
            $data = htmlspecialchars($data);
            return $data;
        }

        ?>
        <!-- stop PHP Code -->

    <!-- </div> -->
    <!-- end wrap div -->

</div>
<!-- end container div -->

</body>
</html>
