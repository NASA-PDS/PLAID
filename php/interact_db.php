<?php
/**
 * Created by PhpStorm.
 * User: morse
 * Date: 8/9/16
 * Time: 11:07 AM
 */

try{
    $LINK = new \PDO('mysql:host=miplapps2.jpl.nasa.gov;dbname=apps;charset=utf8mb4;port=4306',
        'dev',
        '!miplDev8',
        array(
            \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
            \PDO::ATTR_PERSISTENT => false
        )
    );

    if(isset($_POST['Function'])){
        call_user_func($_POST['Function'], $_POST['Data']);
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
    $handle = $LINK->prepare('INSERT INTO user SET email=?,password=?,full_name=?,organization=?');
    $index = 1;
    foreach($args as $key=>$value){
        if ($key === "password")
            $handle->bindValue($index++, password_hash($value, PASSWORD_DEFAULT));
        else
            $handle->bindValue($index++, $value);
    }
    $handle->execute();
}
/**
 * Verify that the user exists in the database and entered the correct password.
 * @param {Object} $args
 * @return bool
 */
function verifyUser($args){
    global $LINK;
    $handle = $LINK->prepare('select email,password from user where email=?');
    $handle->bindValue(1, $args['email']);

    $handle->execute();
    $result = $handle->fetchAll(\PDO::FETCH_OBJ);

    return password_verify($args["password"], $result["password"]);
}
