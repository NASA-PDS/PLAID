<?php
require('DbSessionHandler.php');
require("configuration.php");



class PlaidSessionHandler extends DbSessionHandler {

    protected $pdo_data_source_name;
    protected $pdo_username;
    protected $pdo_password;
    protected $session_db_table;

    public function __construct() {
        $this->pdo_data_source_name = 'mysql:host=' . DB_HOST . ';dbname='. DB_DATABASE . ';charset=utf8mb4;port=' . DB_PORT;
        $this->pdo_username = DB_USER;
        $this->pdo_password = DB_PASSWORD;
        $this->session_db_table = "sessions";
        parent::__construct();
    }
}

?>