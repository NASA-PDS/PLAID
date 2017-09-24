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
 * @file Stores the label id (passed in from the front-end) in a session variable
 * to be referenced as the user navigates into the wizard.
 *
 * Creation Date: 8/11/16
 *
 * @author Michael Kim
 * @author Trevor Morse
 * @author Stirling Algermissen
 */
include_once("PlaidSessionHandler.php");
include("interact_db.php");
$session_handler = new PlaidSessionHandler();
session_start();
$labelInUse = checkIfLabelInUse($_POST['label_id']);
if($labelInUse) {
    echo getUserName($labelInUse);
} else {
    $_SESSION['label_id'] = $_POST['label_id'];
}
