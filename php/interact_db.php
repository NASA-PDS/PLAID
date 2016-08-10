<?php
/**
 * Created by PhpStorm.
 * User: morse
 * Date: 8/9/16
 * Time: 11:07 AM
 */
require_once('../thirdparty/php/PasswordHash.php');
$HASHER = new PasswordHash(8, false);
try{
    $LINK = new \PDO('mysql:host=miplapps2.jpl.nasa.gov;dbname=apps;charset=utf8mb4;port=4306',
        'dev',
        '!miplDev8',
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
 * @param {Object} $args
 */
function insertUser($args){
    global $LINK;
    global $HASHER;
    $handle = $LINK->prepare('INSERT INTO user SET email=?,password=?,full_name=?,organization=?');
    $index = 1;
    foreach($args as $key=>$value){
        if ($key === "password"){
            $handle->bindValue($index++, $HASHER->HashPassword($value));
        }
        else if ($key !== "function"){
            $handle->bindValue($index++, $value);
        }
    }
    $handle->execute();
    header("Location: ../dashboard.php");
}
/**
 * Verify that the user exists in the database and entered the correct password.
 * @param {Object} $args
 */
function verifyUser($args){
    global $LINK;
    global $HASHER;
    $handle = $LINK->prepare('select id,password from user where email=?');
    $handle->bindValue(1, $args['email']);

    $handle->execute();
    $result = $handle->fetchAll(\PDO::FETCH_OBJ);

    session_start();
    if (count($result) === 1 &&
        $HASHER->CheckPassword($args['password'], $result[0]->password)){
        header("Location: ../dashboard.php");
        $_SESSION['login'] = true;
        $_SESSION['user_id'] = $result[0]->id;
    }
    else{
        header("Location: ../login.html");
        $_SESSION['login'] = true;
    }

}

/**
 * Use the user_id stored in a session variable to look up the info for all labels
 * associated with that user.
 */
function getLabelInfo(){
    global $LINK;
    session_start();
    if(isset($_SESSION['user_id'])){
        $handle = $LINK->prepare('select label_id from link where user_id=?');
        $handle->bindValue(1, $_SESSION['user_id'], PDO::PARAM_INT);

        $handle->execute();
        $result = $handle->fetchAll(\PDO::FETCH_OBJ);
        $return = array();
        foreach ($result as $row){
            $labelId = $row->label_id;
            $handle = $LINK->prepare('select id,creation,last_modified,name from label where id=?');
            $handle->bindValue(1, $labelId, PDO::PARAM_INT);

            $handle->execute();
            $result = $handle->fetch(\PDO::FETCH_OBJ);
            array_push($return, $result);
        }
        header('Content-type: application/json');
        echo json_encode($return);
    }
}

/**
 * When a user creates a new label, create an entry for it in the label table and link
 * it to the user in the link table.
 * @param {Object} $args
 */
function storeNewLabel($args){
    global $LINK;
    session_start();
    $handle = $LINK->prepare('INSERT INTO label SET creation=now(),last_modified=now(),name=?');
    $handle->bindValue(1, $args['labelName']);
    $handle->execute();

    $handle = $LINK->prepare('select id from label where name=?');
    $handle->bindValue(1, $args['labelName']);
    $handle->execute();
    $result = $handle->fetch(\PDO::FETCH_OBJ);

    $handle = $LINK->prepare('INSERT INTO link SET user_id=?,label_id=?');
    $handle->bindValue(1, $_SESSION['user_id']);
    $handle->bindValue(2, $result->id);
    $handle->execute();
}
