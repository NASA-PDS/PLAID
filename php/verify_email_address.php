<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>PLAID E-mail Address Confirmation</title>
    <link href="../css/style.css" type="text/css" rel="stylesheet" />
</head>
<body>
<!-- start header div -->
<div id="header">
    <h3>PLAID E-mail Address Confirmation</h3>
</div>
<!-- end header div -->

<!-- start wrap div -->
<div id="wrap">
    <!-- start PHP code -->
    <?php
    /**
     * Created by PhpStorm.
     * User: munn
     * Date: 5/4/2017
     * Time: 4:20 PM
     */
    require("configuration.php");
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

        //  IF the email and hash parameters are in the URL
        if(isset($_GET['email']) && !empty($_GET['email']) AND isset($_GET['hash']) && !empty($_GET['hash'])){
            // Verify data
            $email =$_GET['email']; // Set email variable
            $hash = $_GET['hash']; // Set hash variable

            //  Check that the given e-mail address and hash are in the User table
            $handle = $LINK->prepare('select id, active from user where email=? and activation_hash=?');
            $handle->bindValue(1, $email);
            $handle->bindValue(2, $hash);


            $handle->execute();
            $result = $handle->fetchAll(\PDO::FETCH_OBJ);

            ///session_start();

            if(count($result) > 0){
                // We have a user with the given email address and hash
                //  IF user account is NOT already active
                if ($result[0]->active == 0) {
                    $handle = $LINK->prepare("UPDATE user SET active=1 WHERE email=? AND activation_hash=?");
                    $handle->bindValue(1, $email);
                    $handle->bindValue(2, $hash);
                    $handle->execute();

                    echo '<div class="statusmsg">Your PLAID account has been activated, you can now login.</div>';
                    echo '<div class="statusmsg">&nbsp;</div>';
                    echo '<div class="statusmsg"><a href="../index.php">Link to Login Page</a></div>';
                } else {
                    echo '<div class="statusmsg">You already have activated your PLAID account.</div>';
                }
            }else{
                // No match -> invalid url.
                echo '<div class="statusmsg">The given url is invalid.</div>';
            }

        }else{
            // Invalid approach
            echo '<div class="statusmsg">Invalid approach, please use the link that PLAID has sent to your email.</div>';
        }
    }
    catch(\PDOException $ex){
        print($ex->getMessage());
    }




    ?>
    <!-- stop PHP Code -->


</div>
<!-- end wrap div -->
</body>
</html>
