<?php
/**
 * Copyright 2017 California Institute of Technology
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @file Contains the various functions for interacting with the database. Most of these
 * functions execute a particular query to insert, update, or select data related to the
 * PLAID wizard in the database.
 *
 * Note: This is setup to interact with a MySQL database with three tables: user, label, and link.
 *
 * Creation Date: 8/9/16.
 *
 * @author Trevor Morse
 * @author Michael Kim
 * @author Stirling Algermissen
 */
require_once('../thirdparty/php/PasswordHash.php');
require("configuration.php");
$HASHER = new PasswordHash(8, false);
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

    if(isset($_POST['function'])){
        call_user_func($_POST['function'], $_POST);
    }
}
catch(\PDOException $ex){
    print($ex->getMessage());
}
/**
 * When a new user creates an account, store the form data in the user table.
 * @param {Object} $args object containing the user's email, password, full name, and organization
 */
function insertUser($args){
    global $LINK;
    global $HASHER;
    //  TODO:  Validate the form entries:  e-mail address in correct format xxx@xxx.xxx
    $duplicateEmailAddr = checkForDuplicateUser($args['email']);
    if($duplicateEmailAddr){
        return;
     }


    $password = $args['password'];
    $verifyPassword = $args['verifyPassword'];
    //  Check that the two passwords are the same
    if ($password === $verifyPassword) {

        //  Create a hash value to be associated with this user, for validation
        $hash = md5( rand(0,1000) ); // Generate random 32 character hash and assign it to a local variable.
        // Example output: f4552671f8909587cf485ea990207f3b

        $handle = $LINK->prepare("INSERT INTO user SET email=?,password=?,full_name=?,organization=?,activation_hash=?, active=0");
        ///$index = 1;
        ///foreach($args as $key=>$value){
        ///    if ($key === "password"){
        ///        $handle->bindValue($index++, $HASHER->HashPassword($value));
        ///    }
        ///    else if ($key !== "function"){
        ///        $handle->bindValue($index++, $value);
        ///    }
        ///}
        $handle->bindValue(1, $args['email']);
        //  Encrypt the password
        $hashedPassword = $HASHER->HashPassword($password);
        $handle->bindValue(2, $hashedPassword);
        $handle->bindValue(3, $args['full_name']);
        $handle->bindValue(4, $args['organization']);
        $handle->bindValue(5, $hash);

        $handle->execute();

        //  Send an e-mail message to the given e-mail address with a link to validate the account
        $email_addr = $args['email'];
        $to = $email_addr; // Send the email to the given e-mail address
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
        $activation_link = $http. '://' .$host . $uri_sans_filename . 'verify_email_address.php?email='.$email_addr.'&hash='.$hash;
        ///echo 'activation_link = '.$activation_link.'<br>';

        ///$short_test_message = 'Message Line 1';
        $message = '
     
    Thanks for signing up!
    Your account has been created.  You can login with the following credentials after you have activated your account by pressing the url below.
     
    ------------------------
    Username: '.$email_addr.'
    Password: the password that you specified when you signed up
    ------------------------
     
    Please click this link to activate your account:  ' . $activation_link . '
     
    '; // Our message above including the link

        ///$headers = 'From:PLAID_Admin@jpl.nasa.gov' . '\r\n'; // Set from headers
        $headers = "From: Michael.L.Munn@jpl.nasa.gov"; // Set from headers
        $mail_return_value = mail($to, $subject, $message, $headers); // Send our email
        ///echo "mail return value = " $mail_return_value
        //  IF the mail call had an error
        if ($mail_return_value == FALSE) {
            //  Go to the User Creation Failure page
            header("Location: ../user_creation_failure.html");
        }
        else {
            //  Go to the User Creation Success page
           header("Location: ../user_creation_success.html");
        }
    } else {        //  Else the two passwords are NOT the same
        //  Enable the use of Session variables
        session_start();
        //  Return to the Sign Up page with an error
        $_SESSION['error_code'] = 20;
        header("Location: ../signup.php");
    }
}
/**
 * Verify that the user exists in the database and entered the correct password.
 * @param {Object} $args object containing the user's email and password
 */
function verifyUser($args){
    global $LINK;
    global $HASHER;
    $handle = $LINK->prepare('select id,password,full_name,organization, active, activation_hash from user where email=?');
    $handle->bindValue(1, $args['email']);

    $handle->execute();
    $result = $handle->fetchAll(\PDO::FETCH_OBJ);

    session_start();
    if (count($result) === 1 &&
        $HASHER->CheckPassword($args['password'], $result[0]->password)){
        //  IF the account is active
        if ($result[0]->active == 1) {
            header("Location: ../dashboard.php");
            $_SESSION['login'] = true;
            $_SESSION['user_id'] = $result[0]->id;
            $_SESSION['email'] = $args['email'];
            $_SESSION['full_name'] = $result[0]->full_name;
            $_SESSION['organization'] = $result[0]->organization;
        } else {    //  Else the account is inactive
            $_SESSION['login'] = true;
            $_SESSION['error_code'] = 2;
            $_SESSION['inactive_email'] = $args['email'];
            $_SESSION['hash'] = $result[0]->activation_hash;
            //  Return to the Login page with an error message
            header("Location: ../index.php");

        }
    }
    else{
        //  Invalid username/password combination, so return to the Login page w/ an error message
        header("Location: ../index.php");
        $_SESSION['login'] = true;
        $_SESSION['error_code'] = 1;
    }

}

/**
 * Fetch the User's full name, given the User Id.
 * @param {Object} $userId the User's Id
 * @return user's full name
 */
function getUserName($userId){
    global $LINK;
    $handle = $LINK->prepare('select full_name from user where id=? and active=1');
    $handle->bindValue(1, $userId);

    $handle->execute();
    $result = $handle->fetch(\PDO::FETCH_OBJ);

    if ($result !== false){
        return($result->full_name);
    } else {
        return null;
    }

}

/**
 * Send an e-mail to the user with a link to Reset Password.
 * @param {Object} $args object containing the user's email address
 */
function sendLinkToResetPassword($args){
    global $LINK;
    global $HASHER;
    $handle = $LINK->prepare('select id from user where email=?');
    $handle->bindValue(1, $args['email']);

    $handle->execute();
    $result = $handle->fetchAll(\PDO::FETCH_OBJ);

    //  Enable the use of Session variables
    session_start();
    if (count($result) === 1){
        //  Create a hash value to be associated with this user, for validation
        $hash = md5( rand(0,1000) ); // Generate random 32 character hash and assign it to a local variable.
        // Example output: f4552671f8909587cf485ea990207f3b

        ///$handle = $LINK->prepare("UPDATE user SET activation_hash='".$hash."' where email=?");
        $handle = $LINK->prepare("UPDATE user SET activation_hash=? where email=?");
        $handle->bindValue(1, $hash);
        $handle->bindValue(2, $args['email']);
        $handle->execute();

        //  Send an e-mail message to the given e-mail address with a link to reset the account password
        $email_addr = $args['email'];
        $to = $email_addr; // Send the email to the given e-mail address
        $subject = "PLAID Password Reset"; // Give the e-mail message a subject

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
        ///http://localhost/myapp/php/reset_password.php?email='.$inactive_email.'&hash='.$hash.'
        $activation_link = $http. '://' .$host . $uri_sans_filename . 'reset_password.php?email='.$email_addr.'&hash='.$hash;
        ///echo 'activation_link = '.$activation_link.'<br>';

        ///$short_test_message = 'Message Line 1';
        $message = '
 
You can login with the following credentials after you have reset your PLAID password by pressing the url below.
 
------------------------
Username: '.$email_addr.'
------------------------
 
Please click this link to reset your PLAID password:  ' . $activation_link . '
 
'; // Our message above including the link

        ///$headers = 'From:PLAID_admin@jpl.nasa.gov' . '\r\n'; // Set from headers
        $headers = "From: Michael.L.Munn@jpl.nasa.gov"; // Set from headers
        $mail_return_value = mail($to, $subject, $message, $headers); // Send our email
        ///echo "mail return value = " $mail_return_value
        //  IF the mail call had an error
        if ($mail_return_value == FALSE) {
            //  Go to the Send Link to Reset Password Failure page
            header("Location: ../send_link_to_reset_password_failure.html");
        }
        else {
            //  Go to the Send Link to Reset Password Success page
            header("Location: ../send_link_to_reset_password_success.html");
        }

    } else {
        //  Invalid email address, so return to the Send Link to Reset Password page w/ an error message
        header("Location: send_link_to_reset_password.php");
        $_SESSION['login'] = true;
        $_SESSION['error_code'] = 10;
        $_SESSION['invalid_email'] = $args['email'];
    }

}

/**
 * Reset the Password.
 * @param {Object} $args object containing the user's password and verified password
 */
function resetPassword($args){
    global $LINK;
    global $HASHER;
    //  Enable the use of Session variables
    session_start();
    //  Get the email address from the Session variable
    $email = $_SESSION['email'];
    //  Get the passwords from the form arguments
    $password = $args[password];
    $verified_password = $args[verifyPassword];
    //  Check that the password and verified password are the same
    if ($password === $verified_password) {
        //  Encrypt the password
        $hashed_password = $HASHER->HashPassword($password);
        //  Store the password into the User table
        $handle = $LINK->prepare("UPDATE user SET password=? where email=?");
        $handle->bindValue(1, $hashed_password);
        $handle->bindValue(2, $email);
        $handle->execute();

        //  Go to the Reset Password Success page
        header("Location: ../reset_password_success.html");

    } else {
        //  Return to the Reset Password page with an error; need to re-pass the parameters in the URL
        $_SESSION['error_code'] = 20;
        //  Get the hash from the Session variable
        $hash = $_SESSION['hash'];
        header("Location: reset_password.php?email=".$email."&hash=".$hash);

    }

}

/**
 * Use the user_id stored in a session variable to look up the info for all labels
 * associated with that user. Do not return labels whose is_deleted flag is set
 * and order them by last_modified time.
 */
function getLabelInfo(){
    global $LINK;
    session_start();
    if(isset($_SESSION['user_id'])){
        $handle = $LINK->prepare('select link.user_id, label.id, label.creation, label.last_modified, label.name, label.schema_version from link inner JOIN label ON link.label_id=label.id where link.user_id=? and label.is_deleted=0 order by label.last_modified desc;');
        $handle->bindValue(1, $_SESSION['user_id'], PDO::PARAM_INT);
        $handle->execute();

        $result = $handle->fetchAll(\PDO::FETCH_OBJ);
        header('Content-type: application/json');
        echo json_encode($result);
    }
}

/**
 * When a user creates a new label, create an entry for it in the label table and link
 * it to the user in the link table.
 *
 * Note: $data will need to be updated in future once multiple product types are supported
 * in PLAID. Currently, observational is the only supported product type.
 *
 * @param {Object} $args object containing the name of the label inputted by the user
 */
function storeNewLabel($args){

    global $LINK;

    $filename = "../workspace/observational.xml";
    // $filename = "../workspace/c000m5232t493378259edr_f0000_0134m1.xml";
    $myfile = fopen($filename, "r") or die("Unable to open file!");
    $data = fread($myfile,filesize($filename));
    fclose($myfile);
    var_dump($data);
    /** JPADAMS - load a file here **/

//     $data = '<Product_Observational>
//     <Identification_Area>
//         <logical_identifier></logical_identifier>
//         <version_id></version_id>
//         <title></title>
//         <information_model_version></information_model_version>
//         <product_class></product_class>
//         <Alias_List>
//             <Alias>
//                 <alternate_id></alternate_id>
//                 <alternate_title></alternate_title>
//                 <comment></comment>
//             </Alias>
//         </Alias_List>
//         <Citation_Information>
//             <author_list></author_list>
//             <editor_list></editor_list>
//             <publication_year></publication_year>
//             <keyword></keyword>
//             <description></description>
//         </Citation_Information>
//         <Modification_History>
//             <Modification_Detail>
//                 <modification_date></modification_date>
//                 <version_id></version_id>
//                 <description></description>
//             </Modification_Detail>
//         </Modification_History>
//     </Identification_Area>
//     <Observation_Area>
//         <comment></comment>
//         <Time_Coordinates>
//             <start_date_time></start_date_time>
//             <stop_date_time></stop_date_time>
//             <local_mean_solar_time></local_mean_solar_time>
//             <local_true_solar_time></local_true_solar_time>
//             <solar_longitude></solar_longitude>
//         </Time_Coordinates>
//         <Primary_Result_Summary>
//             <type></type>
//             <purpose></purpose>
//             <data_regime></data_regime>
//             <processing_level></processing_level>
//             <processing_level_id></processing_level_id>
//             <description></description>
//             <Science_Facets>
//                 <wavelength_range></wavelength_range>
//                 <domain></domain>
//                 <discipline_name></discipline_name>
//                 <facet1></facet1>
//                 <subfacet1></subfacet1>
//                 <facet2></facet2>
//                 <subfacet2></subfacet2>
//             </Science_Facets>
//         </Primary_Result_Summary>
//         <Investigation_Area>
//             <name></name>
//             <type></type>
//             <Internal_Reference>
//                 <lid_reference></lid_reference>
//                 <reference_type></reference_type>
//                 <comment></comment>
//             </Internal_Reference>
//         </Investigation_Area>
//         <Observing_System>
//             <name></name>
//             <description></description>
//             <Observing_System_Component>
//                 <name></name>
//                 <type></type>
//                 <description></description>
//                 <Internal_Reference>
//                     <lid_reference></lid_reference>
//                     <reference_type></reference_type>
//                     <comment></comment>
//                 </Internal_Reference>
//                 <External_Reference>
//                     <doi></doi>
//                     <reference_text></reference_text>
//                     <description></description>
//                 </External_Reference>
//             </Observing_System_Component>
//         </Observing_System>
//         <Target_Identification>
//             <name></name>
//             <alternate_designation></alternate_designation>
//             <type></type>
//             <description></description>
//             <Internal_Reference>
//                 <lid_reference></lid_reference>
//                 <reference_type></reference_type>
//                 <comment></comment>
//             </Internal_Reference>
//         </Target_Identification>
//         <Mission_Area>
//             <ins:InsightClass></ins:InsightClass>
//         </Mission_Area>
//         <Discipline_Area></Discipline_Area>
//     </Observation_Area>
//     <Reference_List>
//         <Internal_Reference>
//             <lid_reference></lid_reference>
//             <reference_type></reference_type>
//             <comment></comment>
//         </Internal_Reference>
//         <External_Reference>
//             <doi></doi>
//             <reference_text></reference_text>
//             <description></description>
//         </External_Reference>
//     </Reference_List>
//     <File_Area_Observational>
//         <File>
//             <file_name></file_name>
//             <local_identifier></local_identifier>
//             <creation_date_time></creation_date_time>
//             <file_size></file_size>
//             <records></records>
//             <md5_checksum></md5_checksum>
//             <comment></comment>
//         </File>
//         <Array_1D>
//             <name></name>
//             <local_identifier></local_identifier>
//             <offset></offset>
//             <axes></axes>
//             <axis_index_order></axis_index_order>
//             <description></description>
//             <Element_Array>
//                 <data_type></data_type>
//                 <unit></unit>
//                 <scaling_factor></scaling_factor>
//                 <value_offset></value_offset>
//             </Element_Array>
//             <Axis_Array>
//                 <axis_name></axis_name>
//                 <local_identifier></local_identifier>
//                 <elements></elements>
//                 <unit></unit>
//                 <sequence_number></sequence_number>
//                 <Band_Bin_Set>
//                     <Band_Bin>
//                         <band_number></band_number>
//                         <band_width></band_width>
//                         <center_wavelength></center_wavelength>
//                         <detector_number></detector_number>
//                         <filter_number></filter_number>
//                         <grating_position></grating_position>
//                         <original_band></original_band>
//                         <standard_deviation></standard_deviation>
//                         <scaling_factor></scaling_factor>
//                         <value_offset></value_offset>
//                     </Band_Bin>
//                 </Band_Bin_Set>
//             </Axis_Array>
//             <Special_Constants>
//                 <saturated_constant></saturated_constant>
//                 <missing_constant></missing_constant>
//                 <error_constant></error_constant>
//                 <invalid_constant></invalid_constant>
//                 <unknown_constant></unknown_constant>
//                 <not_applicable_constant></not_applicable_constant>
//                 <valid_maximum></valid_maximum>
//                 <high_instrument_saturation></high_instrument_saturation>
//                 <high_representation_saturation></high_representation_saturation>
//                 <valid_minimum></valid_minimum>
//                 <low_instrument_saturation></low_instrument_saturation>
//                 <low_representation_saturation></low_representation_saturation>
//             </Special_Constants>
//             <Object_Statistics>
//                 <local_identifier></local_identifier>
//                 <maximum></maximum>
//                 <minimum></minimum>
//                 <mean></mean>
//                 <standard_deviation></standard_deviation>
//                 <bit_mask></bit_mask>
//                 <median></median>
//                 <md5_checksum></md5_checksum>
//                 <maximum_scaled_value></maximum_scaled_value>
//                 <minimum_scaled_value></minimum_scaled_value>
//                 <description></description>
//             </Object_Statistics>
//         </Array_1D>
//     </File_Area_Observational>
//     <File_Area_Observational_Supplemental>
//         <File>
//             <file_name></file_name>
//             <local_identifier></local_identifier>
//             <creation_date_time></creation_date_time>
//             <file_size></file_size>
//             <records></records>
//             <md5_checksum></md5_checksum>
//             <comment></comment>
//         </File>
//         <Array_1D>
//             <name></name>
//             <local_identifier></local_identifier>
//             <offset></offset>
//             <axes></axes>
//             <axis_index_order></axis_index_order>
//             <description></description>
//             <Element_Array>
//                 <data_type></data_type>
//                 <unit></unit>
//                 <scaling_factor></scaling_factor>
//                 <value_offset></value_offset>
//             </Element_Array>
//             <Axis_Array>
//                 <axis_name></axis_name>
//                 <local_identifier></local_identifier>
//                 <elements></elements>
//                 <unit></unit>
//                 <sequence_number></sequence_number>
//                 <Band_Bin_Set>
//                     <Band_Bin>
//                         <band_number></band_number>
//                         <band_width></band_width>
//                         <center_wavelength></center_wavelength>
//                         <detector_number></detector_number>
//                         <filter_number></filter_number>
//                         <grating_position></grating_position>
//                         <original_band></original_band>
//                         <standard_deviation></standard_deviation>
//                         <scaling_factor></scaling_factor>
//                         <value_offset></value_offset>
//                     </Band_Bin>
//                 </Band_Bin_Set>
//             </Axis_Array>
//             <Special_Constants>
//                 <saturated_constant></saturated_constant>
//                 <missing_constant></missing_constant>
//                 <error_constant></error_constant>
//                 <invalid_constant></invalid_constant>
//                 <unknown_constant></unknown_constant>
//                 <not_applicable_constant></not_applicable_constant>
//                 <valid_maximum></valid_maximum>
//                 <high_instrument_saturation></high_instrument_saturation>
//                 <high_representation_saturation></high_representation_saturation>
//                 <valid_minimum></valid_minimum>
//                 <low_instrument_saturation></low_instrument_saturation>
//                 <low_representation_saturation></low_representation_saturation>
//             </Special_Constants>
//             <Object_Statistics>
//                 <local_identifier></local_identifier>
//                 <maximum></maximum>
//                 <minimum></minimum>
//                 <mean></mean>
//                 <standard_deviation></standard_deviation>
//                 <bit_mask></bit_mask>
//                 <median></median>
//                 <md5_checksum></md5_checksum>
//                 <maximum_scaled_value></maximum_scaled_value>
//                 <minimum_scaled_value></minimum_scaled_value>
//                 <description></description>
//             </Object_Statistics>
//         </Array_1D>
//     </File_Area_Observational_Supplemental>
// </Product_Observational>';
    session_start();
    $handle = $LINK->prepare('INSERT INTO label SET creation=now(),last_modified=now(),name=?,label_xml=?,schema_version=?');
    $handle->bindValue(1, $args['labelName']);
    $handle->bindValue(2, $data);
    $handle->bindValue(3, $args['version']);
    $handle->execute();

    $handle = $LINK->prepare('INSERT INTO link SET user_id=?,label_id=?');
    $newLabelId = $LINK->lastInsertId();
    $handle->bindValue(1, $_SESSION['user_id']);
    $handle->bindValue(2, $newLabelId);
    $handle->execute();

    $_SESSION['label_id'] = intval($newLabelId);
    return $_SESSION['label_id'];
}


/**
 * When a user creates a new label via table upload, create an entry for it in the label table, link
 * it to the user in the link table, and store the modified label XML as a new label.
 *
 * Note: $data will need to be updated in future once multiple product types are supported
 * in PLAID. Currently, observational is the only supported product type.
 *
 * @param {Object} $args object containing the name of the label inputted by the user
 */
function storeXMLToANewLabel($args){
    global $LINK;
    session_start();
    $handle = $LINK->prepare('INSERT INTO label SET creation=now(),last_modified=now(),name=?,label_xml=?,schema_version=?');
    $handle->bindValue(1, $args['labelName']);
    $handle->bindValue(2, $args['xmlDoc']->saveXML());
    $handle->bindValue(3, $args['version']);
    $handle->execute();

    $handle = $LINK->prepare('INSERT INTO link SET user_id=?,label_id=?');
    $newLabelId = $LINK->lastInsertId();
    $handle->bindValue(1, $_SESSION['user_id']);
    $handle->bindValue(2, $newLabelId);
    $handle->execute();

    $_SESSION['label_id'] = intval($newLabelId);
    return $_SESSION['label_id'];
}

/**
 * Use the label id stored in the session to determine which label to output
 * the XML from the database.
 * @return {string}
 */
function getLabelXML(){
    global $LINK;
    session_start();
    $handle = $LINK->prepare('select label_xml from label where id=?');
    $handle->bindValue(1, $_SESSION['label_id']);
    $handle->execute();

    $result = $handle->fetch(\PDO::FETCH_OBJ);
    return $result->label_xml;
}

/**
 * Use the label id in the argument to determine which label to output
 * the XML from the database.
 * @return {string}
 */
function getSpecifiedLabelXML($arg){
    global $LINK;
    session_start();
    $handle = $LINK->prepare('select label_xml from label where id=?');
    $handle->bindValue(1, $arg['label_id']);
    $handle->execute();

    $result = $handle->fetch(\PDO::FETCH_OBJ);
    return $result->label_xml;
}

/**
 * Use the label id stored in the session to determine which Ingest LDDTool XML to output
 * from the database.
 * @return {string}
 */
function getIngestLDDToolXML(){
    global $LINK;
    session_start();
    $handle = $LINK->prepare('select ingest_ldd_xml from label where id=?');
    $handle->bindValue(1, $_SESSION['label_id']);
    $handle->execute();

    $result = $handle->fetch(\PDO::FETCH_OBJ);
    return $result->ingest_ldd_xml;
}

/**
 * Update the Label XML stored in the database with the most recent changes.
 * @param {Object} $args object containing the updated Label XML string
 */
function updateLabelXML($args){
    global $LINK;
    session_start();
    $handle = $LINK->prepare('update label set last_modified=now(),label_xml=? where id=?');
    $handle->bindValue(1, $args['xml']);
    $handle->bindValue(2, $_SESSION['label_id']);
    $handle->execute();
}

function testUpdateLabelXML($args){
    global $LINK;
    session_start();
    $handle = $LINK->prepare('update label set last_modified=now(),label_xml=? where id=?');
    $handle->bindValue(1, $args['xml']);
    $handle->bindValue(2, 313);
    $handle->execute();
}

/**
 * Update the Ingest LDD XML stored in the database with the most recent changes.
 * @param {Object} $ingestLddXML string containing the updated Ingest LDD XML string
 */
function updateIngestLddXML($ingestLddXML){
    global $LINK;
    session_start();
    $handle = $LINK->prepare('update label set last_modified=now(),ingest_ldd_xml=? where id=?');
    $handle->bindValue(1, $ingestLddXML);
    $handle->bindValue(2, $_SESSION['label_id']);
    $handle->execute();
}

/**
 * Set a flag on the label entry to denote that the user has deleted it.
 * Note: this does not actually remove the label from the database so that it can
 * be recovered later if necessary.
 * @param {Object} $args object containing the id of the label to flag
 */
function deleteLabel($args){
    global $LINK;
    session_start();

    $handle = $LINK->prepare('update label set is_deleted=? where id=?');
    $handle->bindValue(1, 1, PDO::PARAM_INT);
    $handle->bindValue(2, $args['label_id'], PDO::PARAM_INT);
    $handle->execute();
}

/**
 * Store the JSON with the user's progress in the database.
 * @param {Object} $args object containing a string-ified JSON of the user's progress
 */
function storeProgressData($args){
    global $LINK;
    session_start();
    $handle = $LINK->prepare('update label set progress_data=? where id=?');
    $handle->bindValue(1, $args['progressJson']);
    $handle->bindValue(2, $_SESSION['label_id']);
    $handle->execute();
}

/**
 * Store the progressData JSON with the user's modifications to the label in the database associated with the label ID given in the argument.
 * @param {Object} $args object containing a string-ified JSON of the user's progress
 */
function storeProgressDataLocal($args){
    global $LINK;
    session_start();
    $handle = $LINK->prepare('update label set progress_data=? where id=?');
    $handle->bindValue(1, $args['progressJson']);
    $handle->bindValue(2, $args['label_id']);
    $handle->execute();
}

/**
 * Get the progress data for the active label and send it to the front-end
 * as a JSON.
 */
function getProgressData(){
    global $LINK;
    session_start();
    $handle = $LINK->prepare('select progress_data from label where id=?');
    $handle->bindValue(1, $_SESSION['label_id']);
    $handle->execute();

    $result = $handle->fetch(\PDO::FETCH_OBJ);
    header('Content-type: application/json');
    echo json_encode($result->progress_data);
    return json_encode($result->progress_data);
}

/**
 * Get the progress data for the active label and send it to the front-end
 * as a JSON.
 */
function getRawProgressData($arg){
    global $LINK;
    session_start();
    $handle = $LINK->prepare('select progress_data from label where id=?');
    $handle->bindValue(1, $arg['label_id']);
    $handle->execute();

    $result = $handle->fetch(\PDO::FETCH_OBJ);
//    header('Content-type: application/json');
//    echo json_encode($result->progress_data);
//    return json_encode($result->progress_data);
    return utf8_encode($result->progress_data);
}

/**
 * Store the JSON with the user's progress in the database.
 * @param {Object} $args object containing a string-ified JSON of the user's mission specifics content
 */
function storeMissionSpecificsData($args){
    global $LINK;
    $missionSpecificsHeader = $args['missionSpecificsHeader'];
    $missionName = $missionSpecificsHeader['missionName'];
    $stewardId = $missionSpecificsHeader['stewardId'];
    $namespaceId = $missionSpecificsHeader['namespaceId'];
    $comment = $missionSpecificsHeader['comment'];
    session_start();
    $handle = $LINK->prepare('update label set mission_specifics=?, ms_mission_name=?, ms_steward_id=?, ms_namespace_id=?, ms_comment=?  where id=?');
    $handle->bindValue(1, $args['missionSpecificsJson']);
    $handle->bindValue(2, $missionName);
    $handle->bindValue(3, $stewardId);
    $handle->bindValue(4, $namespaceId);
    $handle->bindValue(5, $comment);
    $handle->bindValue(6, $_SESSION['label_id']);
    $handle->execute();
}

/**
 * Get the mission-specific data for the active label and send it to the front-end
 * as a JSON.
 */
function getMissionSpecificsData(){
    global $LINK;
    session_start();
    $handle = $LINK->prepare('select mission_specifics from label where id=?');
    $handle->bindValue(1, $_SESSION['label_id']);
    $handle->execute();

    $result = $handle->fetch(\PDO::FETCH_OBJ);
    header('Content-type: application/json');
    echo json_encode($result->mission_specifics);
}

/**
 * Get the mission-specific header data for the active label and send it to the front-end
 * as an object.
 */
function getMissionSpecificsHeaderData(){
    global $LINK;
    session_start();
    $handle = $LINK->prepare('select ms_mission_name, ms_steward_id, ms_namespace_id, ms_comment from label where id=?');
    $handle->bindValue(1, $_SESSION['label_id']);
    $handle->execute();

    $result = $handle->fetch(\PDO::FETCH_OBJ);
    $missionSpecificsHeader['missionName'] = $result->ms_mission_name;
    $missionSpecificsHeader['stewardId'] = $result->ms_steward_id;
    $missionSpecificsHeader['namespaceId'] = $result->ms_namespace_id;
    $missionSpecificsHeader['comment'] = $result->ms_comment;

    header('Content-type: application/json');
    $missionSpecificsHeaderJson = json_encode($missionSpecificsHeader);
    echo $missionSpecificsHeaderJson;
}

/**
 * Get the name of the label corresponding to the id stored in the session.
 */
function getLabelName(){
    global $LINK;
    session_start();
    $handle = $LINK->prepare('select name from label where id=?');
    $handle->bindValue(1, $_SESSION['label_id']);
    $handle->execute();

    $result = $handle->fetch(\PDO::FETCH_OBJ);
    echo $result->name;
    return $result->name;
}

/**
 * Get the name and ID of the label currently stored in the session.
 */
function getCurrLabelIdName(){
    global $LINK;
    session_start();

    // Execute a query to get the name of the label associated with the id in current session.
    $handle = $LINK->prepare('select name from label where id=?');
    $handle->bindValue(1, $_SESSION['label_id']);
    $handle->execute();
    $result = $handle->fetch(\PDO::FETCH_OBJ);

    // Variable to return
    $retVal = array("id" => $_SESSION['label_id'], "name" => $result->name );

    // attach a hedder to indicate that this is JSON.
    header('Content-type: application/json');
    echo json_encode($retVal);
    return json_encode($retVal);   // <-- debug
}


/**
 * Check for the duplicate email address already exists in the db.
 * @param {Object} $args object containing the user's email and password
 */
function checkForDuplicateUser($args){
    global $LINK;
    global $HASHER;
    $handle = $LINK->prepare('select id,password,full_name,organization, active, activation_hash from user where email=?');
    $handle->bindValue(1, $args);

    $handle->execute();
    $result = $handle->fetchAll(\PDO::FETCH_OBJ);

    session_start();
    $count = count($result);
    if (count($result) >= 1) {
                //  Duplicate email address exists in the db. Return to the Login page w/ an error message
                $_SESSION['login'] = true;
                $_SESSION['error_code'] = 3;
                //  Return to the Login page with an error message
                header("Location: ../index.php");

                return true;
    }
    return false;
}

/**
 * Use the label id stored in the session to pass label XML string to the front-end.
 */
function fetchLabelXML(){
    global $LINK;
    session_start();
    $handle = $LINK->prepare('select label_xml from label where id=?');
    $handle->bindValue(1, $_SESSION['label_id']);
    $handle->execute();

    $result = $handle->fetch(\PDO::FETCH_OBJ);
    header('Content-type: application/xml');

    echo $result->label_xml;
    return $result->label_xml;
}

/**
 * Imports the label CSV file, uploaded by the user.
 */
function importCSV(){

    /**
     * Imports the label CSV file, uploaded by the user.
     */
    function importCSV(){

        print $_FILES['upload'];

        if (file_exists($_FILES)) {
            chmod($_FILES, 0777);
            print_r($_FILES);
            echo "The file $_FILES exists";
        } else {
            echo "The file $_FILES does not exist";
        }
    }
}

/**
 * Pass current label ID to the front-end.
 */
function getSessionLabelID(){
    session_start();
    $labelID = $_SESSION['label_id'];
    echo $labelID;
}