<?php
session_start();
if (!isset($_SESSION['login']) && !$_SESSION['login'])
    header("Location: login.html");
$_SESSION['login'] = false;
?>
<!DOCTYPE html>
<html>
<head>
    <title>LDT Test UI</title>
    <meta charset="utf-8">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.2/jquery.min.js"></script>
    <script src="config/pop_up_config.js"></script>
    <script src="config/infobar_config.js"></script>
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
        <a class="navbar-brand">Label Design Tool</a>
    </div>
</nav>
<div id="wrapper">
    <div id="labelManagerWrapper">
        <div id="dashboard" class="card">
            <div class="card-header">
                <span id="dashboardTitle">Label Dashboard</span>
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