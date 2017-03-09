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
 */
session_start();
if (!isset($_SESSION['login']) || $_SESSION['login'] == false)
    header("Location: index.html");

?>

<!DOCTYPE html>
<html>
<head>
    <title>PDS Label Assistant for Interactive Design (PLAID)</title>
    <meta charset="utf-8">
    <meta http-equiv="cache-control" content="max-age=0" />
    <meta http-equiv="cache-control" content="no-cache" />
    <meta http-equiv="expires" content="0" />
    <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT" />
    <meta http-equiv="pragma" content="no-cache" />
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.2/jquery.min.js"></script>
    <script src="config/pop_up_config.js"></script>
    <script src="config/infobar_config.js"></script>
    <script src="js/popover.js"></script>
    <script src="js/pop_up.js"></script>
    <script src="js/dashboard.js"></script>
    <link href="thirdparty/css/bootstrap.css" rel="stylesheet">
    <link href="css/general.css" rel="stylesheet">
    <link href="css/dashboard.css" rel="stylesheet">
    <link href="css/pop_up.css" rel="stylesheet">
    <link href="thirdparty/css/tether.min.css" rel="stylesheet">
    <link href="thirdparty/font-awesome-4.6.3/css/font-awesome.min.css" rel="stylesheet">
</head>
<body>
<nav class="navbar navbar-dark no-border-radius" style="background-color: #2184be;">
    <div class="nav navbar-nav">
        <a class="navbar-brand">PDS Label Assistant for Interactive Design (PLAID)</a>
        <li class="nav-item pull-xs-right">
            <a class="nav-link" href="php/logout.php">Logout</a>
        </li>
    </div>
</nav>
<div id="wrapper">
    <div id="labelManagerWrapper">
        <div id="dashboard" class="card">
            <div class="card-header">
                <span id="dashboardTitle">PLAID Dashboard</span>
                <a id="createNewLabelButton" href="#" class="btn btn-primary">Create new</a>
            </div>
            <div class="card-block" id="dashboardContent">
            </div>
        </div>
    </div>
    <div id="sidebar">
        <div class="infoBar" class="card">
            <i id="sidebarIcon" class="fa fa-info-circle" aria-hidden="true"></i>
            <div id="help"></div>
        </div>
    </div>
</div>
</body>
<script src="thirdparty/js/tether.min.js"></script>
<script src="thirdparty/js/bootstrap.min.js"></script>
</html>