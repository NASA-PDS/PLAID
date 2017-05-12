<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Re-send Verification E-mail</title>
</head>
<body>
<?php
/**
 * Created by PhpStorm.
 * User: munn
 * Date: 5/5/2017
 * Time: 12:47 PM
 */
require "../thirdparty/php/PHPMailerAutoload.php";
//  Enable the use of Session variables
session_start();
//  Get the Inactive E-mail Address from the Session variable
$inactive_email = $_SESSION['inactive_email'];
//  Get the hash from the Session variable
$hash = $_SESSION['hash'];

//  Send an e-mail message to the given e-mail address with a link to validate the account
$to = $inactive_email; // Send the email to the given e-mail address
$subject = "PLAID Signup Verification"; // Give the e-mail message a subject

//  Build the URL for the Link
$http = (isset($_SERVER['HTTPS']) ? "https" : "http");
$host = $_SERVER[HTTP_HOST];
$uri = $_SERVER['REQUEST_URI'];
///echo 'http = '.$http.'<br>';
///echo 'host = '.$host.'<br>';
///echo 'uri = '.$uri.'<br>';
//  Remove the filename from the URI
//  Find the last slash in the URI
$last_slash_pos = strrpos($uri, '/');
//  Get everything up to and including the last slash
$uri_sans_filename = substr($uri, 0, $last_slash_pos+1);
//  Build the Link to Activate the account
///http://localhost/myapp/php/verify_email_address.php?email='.$inactive_email.'&hash='.$hash.'
$activation_link = $http. '://' .$host . $uri_sans_filename . 'verify_email_address.php?email='.$inactive_email.'&hash='.$hash;
///echo 'activation_link = '.$activation_link.'<br>';

///$short_test_message = 'Message Line 1';
$message = '
 
Thanks for signing up!
Your account has been created.  You can login with the following credentials after you have activated your account by pressing the url below.
 
------------------------
Username: '.$inactive_email.'
Password: the password that you specified when you signed up
------------------------
 
Please click this link to activate your account:  ' . $activation_link . '
 
'; // Our message above including the activation link

/***********************************************************************************************/
///$headers = 'From:PLAID_admin@jpl.nasa.gov' . '\r\n'; // Set from headers
$headers = "From: Michael.L.Munn@jpl.nasa.gov"; // Set from headers
$mail_return_value = mail($to, $subject, $message, $headers); // Send our email
///echo "mail return value = " $mail_return_value;
//  IF the mail call had an error
if ($mail_return_value == FALSE) {
    echo 'Error sending the verification E-mail.';
}
else {
    echo '<h3 class="form-signup-heading">Verification E-mail Re-sent</h3>';
    echo "Please verify your e-mail address by clicking on the activation link in the e-mail message that has been sent to your e-mail account.";
}
/***********************************************************************************************/

//  TODO:  Re-send the Verification E-mail using PHPMailer???
/***********************************************************************************************
$mail = new PHPMailer;
///$mail->isSendmail();
$mail->isSMTP();
$mail->Host = 'smtp.jpl.nasa.gov';          //  SMTP server
$mail->SMTPAuth = true;                     // Enable SMTP authentication
$mail->setFrom("Michael.L.Munn@jpl.nasa.gov", "PLAID System Administrator");
$mail->Subject = $subject;
$mail->addAddress($to);
$mail->addCC("Michael.L.Munn@jpl.nasa.gov");
$mail->Body = $short_test_message;          //  $message
if ($mail->send()) {
    echo "The Verification E-mail has been re-sent. &nbsp;Please verify your e-mail account by clicking the activation link that has been sent to your email.";
} else {
    echo 'Error sending the verification E-mail.';
}
***********************************************************************************************/

?>
</body>
</html>

