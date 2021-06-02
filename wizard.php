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
include_once("php/PlaidSessionHandler.php");
$session_handler = new PlaidSessionHandler();
session_start();
if (!isset($_SESSION['login']) || $_SESSION['login'] == false) {
    header("HTTP/1.1 401 Unauthorized");
#    header("Location: index.php");
    die();
}
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
    <script src="thirdparty/js/jquery.steps.min.js"></script>
    <script src="thirdparty/js/tree.jquery.js"></script>
    <script src="thirdparty/js/codemirror.js"></script>
    <script src="thirdparty/js/foldcode.js"></script>
    <script src="thirdparty/js/foldgutter.js"></script>
    <script src="thirdparty/js/xml-fold.js"></script>
    <script src="thirdparty/js/xml.js"></script>
    <script src="config/config.js"></script>
    <script src="config/infobar_config.js"></script>
    <script src="thirdparty/js/download.min.js"></script>
    <script src="thirdparty/js/bootstrap-select.min.js"></script>
    <script src="thirdparty/js/bootstrap-toggle.min.js"></script>
    <!-- Plug in to allow the user to add code to set the default values for dropdown lists -->
    <script src="thirdparty/js/jquery.default_dropdown_plug-in.js"></script>
    <script src="js/main.js"></script>
    <script src="config/pop_up_config.js"></script>
    <script src="js/element_bar.js"></script>
    <script src="js/default_dropdowns.js"></script>
    <script src="js/init_steps.js"></script>
    <script src="js/popover.js"></script>
    <script src="js/parse_json.js"></script>
    <script src="js/mission_specifics.js"></script>
    <script src="js/discipline_nodes.js"></script>
    <script src="js/pop_up.js"></script>
    <script src="js/progress.js"></script>
    <link href="thirdparty/css/codemirror.css" rel="stylesheet">
    <link href="thirdparty/css/foldgutter.css" rel="stylesheet">

    <link href="thirdparty/css/jquery.steps.css" rel="stylesheet">
    <link href="thirdparty/css/jqtree.css" rel="stylesheet">
    <link href="thirdparty/css/bootstrap.css" rel="stylesheet">
    <link href="thirdparty/css/bootstrap-select.min.css" rel="stylesheet">
    <link href="thirdparty/css/bootstrap-toggle.min.css" rel="stylesheet">
    <link href="css/general.css" rel="stylesheet">
    <link href="css/mission_specifics.css" rel="stylesheet">
    <link href="css/pop_up.css" rel="stylesheet">
    <link href="thirdparty/css/tether.min.css" rel="stylesheet">
    <link href="thirdparty/font-awesome-4.6.3/css/font-awesome.min.css" rel="stylesheet">
</head>
<body>
    <nav class="navbar navbar-dark no-border-radius" style="background-color: #2184be;">
        <div class="nav navbar-nav">
            <a class="navbar-brand">PDS Label Assistant for Interactive Design (PLAID)</a>
            <li class="nav-item pull-xs-right">
                <a class="wizardExitButton nav-link" href="dashboard.php">Exit</a>
            </li>
            <li class="nav-item pull-xs-right">
                <a class="labelPreviewButton nav-link" href="#">Preview</a>
            </li>
            <li class="nav-item pull-xs-right">
                <p class="labelNameNav navbar-brand m-b-0"></p>
            </li>
            <li class="nav-item pull-xs-right">
                <!-- Basic/Advanced Mode Toggle button defaulted to Basic (On) -->
                <p><label>Mode: &nbsp;<input id="basic_mode_toggle" type="checkbox" checked data-toggle="toggle" data-on="Basic" data-off="Advanced"></label></p>
            </li>
        </div>
    </nav>
    <script>
        $(function() {
            //  Called when the basic mode toggle changes
            $('#basic_mode_toggle').change(function() {
                //  Get the toggle button's value
                var isBasicMode = $(this).prop('checked');
                //  Call an external JavaScript method, and pass the toggle button's value
                basicModeToggled(isBasicMode);
            })
        })
    </script>
    <div id="wrapper">
        <div id="wizard">

            <h3>Product Type</h3>
            <section id="product_selection">
                <p class="question">What type of product would you like to create a label for?</p>
                <table class="list-group">
                    <tr class="label-item">
                        <td>
                            <button class="list-group-item">
                                <i class="fa fa-binoculars fa-fw" aria-hidden="true"></i>
                                <span class="productType" data-id="0001_NASA_PDS_1.pds.Product_Observational">Observational</span>
                            </button>
                        </td>
                    </tr>
                    <!-- MLM:  un-commented the buttons below -->
                    <tr class="label-item">
                        <td>
                            <button class="list-group-item">
                                <i class="fa fa-file-o fa-fw" aria-hidden="true"></i>
                                <span class="productType" data-id="0001_NASA_PDS_1.pds.Product_Document">Document</span>
                            </button>
                        </td>
                    </tr>
                    <tr class="label-item">
                        <td>
                            <!-- <button class="list-group-item disabled" disabled> -->
                            <button class="list-group-item">
                                <i class="fa fa-list fa-fw" aria-hidden="true"></i>
                                <span class="productType" data-id="0001_NASA_PDS_1.pds.Product_Context">Context</span>
                            </button>
                        </td>
                    </tr>
                    <tr class="label-item">
                        <td>
                            <!-- <button class="list-group-item disabled" disabled> -->
                            <button class="list-group-item">
                                <i class="fa fa-file-text-o fa-fw" aria-hidden="true"></i>
                                <span class="productType" data-id="0001_NASA_PDS_1.pds.Product_File_Text">File Text</span>
                            </button>
                        </td>
                    </tr>

                    <tr class="label-item">
                        <td>
                            <!-- <button class="list-group-item disabled" disabled> -->
                            <button class="list-group-item">
                                <i class="fa fa-picture-o fa-fw" aria-hidden="true"></i>
                                <span class="productType" data-id="0001_NASA_PDS_1.pds.Product_Thumbnail">Thumbnail</span>
                            </button>
                        </td>
                    </tr>
                    <!-- MLM:  un-commented the buttons above -->
                </table>
            </section>

            <h3>Discipline Dictionaries</h3>
            <section id="disc_node_selection">
                <p class="question">Which of these are applicable to your product?</p>
                <div class="data-section">
                    <table class="checkbox-group">
                        <tr class="label-item">
                            <td>
                                <div class="checkbox-item">
                                    <input type="checkbox">
                                    <span class="spacer"></span>
                                    <i class="fa fa-map fa-fw" aria-hidden="true"></i>
                                    <span class="discNode" ns="cart" data-id="0001_NASA_PDS_1.cart.Cartography" step_path="plaid_discipline_node:cartography">Cartography</span>
                                </div>
                            </td>
                        </tr>
                        <tr class="label-item">
                            <td>
                                <div class="checkbox-item">
                                    <input type="checkbox">
                                    <span class="spacer"></span>
                                    <i class="fa fa-desktop fa-fw" aria-hidden="true"></i>
                                    <span class="discNode" ns="disp" data-id="0001_NASA_PDS_1.disp.Display" step_path="plaid_discipline_node:display">Display</span>
                                </div>
                            </td>
                        </tr>
                        <tr class="label-item">
                            <td>
                                <div class="checkbox-item">
                                    <input type="checkbox">
                                    <span class="spacer"></span>
                                    <i class="fa fa-space-shuttle fa-fw" aria-hidden="true"></i>
                                    <span class="discNode" ns="geom" data-id="0001_NASA_PDS_1.geom.Geometry" step_path="plaid_discipline_node:geometry">Geometry</span>
                                </div>
                            </td>
                        </tr>
                        <tr class="label-item">
                            <td>
                                <div class="checkbox-item">
                                    <input type="checkbox">
                                    <span class="spacer"></span>
                                    <i class="fa fa-image fa-fw" aria-hidden="true"></i>
                                    <span class="discNode" ns="img" data-id="0001_NASA_PDS_1.img.Imaging" step_path="plaid_discipline_node:imaging">Imaging</span>
                                </div>
                            </td>
                        </tr>

                        <tr class="label-item">
                            <td>
                                <div class="checkbox-item">
                                    <input type="checkbox">
                                    <span class="spacer"></span>
                                    <i class="fa fa-rocket fa-fw" aria-hidden="true"></i>
                                    <span class="discNode" ns="msn" data-id="0001_NASA_PDS_1.msn.Mission_Information" step_path="plaid_discipline_node:mission" >Mission</span>
                                </div>
                            </td>
                        </tr>
                        <tr class="label-item">
                            <td>
                                <div class="checkbox-item">
                                    <input type="checkbox" >
                                    <span class="spacer"></span>
                                    <i class="fa fa-sun-o fa-fw" aria-hidden="true"></i>
                                    <span class="discNode" ns="msn_surface" data-id="0001_NASA_PDS_1.msn_surface.Surface_Mission_Information" step_path="plaid_discipline_node:mission_surface">Mission Surface</span>
                                </div>
                            </td>
                        </tr>
                        <tr class="label-item">
                            <td>
                                <div class="checkbox-item">
                                    <input type="checkbox" >
                                    <span class="spacer"></span>
                                    <i class="fa fa-camera fa-fw" aria-hidden="true"></i>
                                    <span class="discNode" ns="img_surface" data-id="0001_NASA_PDS_1.img_surface.Surface_Imaging" step_path="plaid_discipline_node:imaging_surface">Imaging Surface</span>
                                </div>
                            </td>
                        </tr>

                        <tr class="label-item">
                            <td>
                                <div class="checkbox-item">
                                    <input type="checkbox" >
                                    <span class="spacer"></span>
                                    <i class="fa fa-sun-o fa-fw" aria-hidden="true"></i>
                                    <span class="discNode" ns="sp" data-id="0001_NASA_PDS_1.sp.Spectral_Characteristics" step_path="plaid_discipline_node:spectral_characteristics">Spectral Characterisitics</span>
                                </div>
                            </td>
                        </tr>
                        <tr class="label-item">
                            <td>
                                <div class="checkbox-item">
                                    <input type="checkbox" >
                                    <span class="spacer"></span>
                                    <i class="fa fa-camera fa-fw" aria-hidden="true"></i>
                                    <span class="discNode" ns="msss_cam_mh" data-id="0001_NASA_PDS_1.msss_cam_mh.MSSS_Camera_Mini_Header" step_path="plaid_discipline_node:msss_camera_mini_header">MSSS Camera Mini Header</span>
                                </div>
                            </td>
                        </tr>
                        <tr class="label-item">
                            <td>
                                <div class="checkbox-item">
                                    <input type="checkbox" >
                                    <span class="spacer"></span>
                                    <i class="fa fa-camera fa-fw" aria-hidden="true"></i>
                                    <span class="discNode" ns="nucspec" data-id="0001_NASA_PDS_1.nucspec.GRNS_Observation_Properties" step_path="plaid_discipline_node:nucspec">Nuclear Spectroscopy DRAFT</span>
                                </div>
                            </td>
                        </tr>

                        <tr class="label-item">
                            <td>
                                <div class="checkbox-item">
                                    <input type="checkbox" >
                                    <span class="spacer"></span>
                                    <i class="fa fa-camera fa-fw" aria-hidden="true"></i>
                                    <span class="discNode" ns="rings" data-id="0001_NASA_PDS_1.rings.Ring_Moon_Systems" step_path="plaid_discipline_node:rings">Ring Moon Systems</span>
                                </div>
                            </td>
                        </tr>

                        <tr class="label-item">
                            <td>
                                <div class="checkbox-item">
                                    <input type="checkbox" >
                                    <span class="spacer"></span>
                                    <i class="fa fa-camera fa-fw" aria-hidden="true"></i>
                                    <span class="discNode" ns="survey" data-id="0001_NASA_PDS_1.survey.Survey" step_path="plaid_discipline_node:survey">Survey</span>
                                </div>
                            </td>
                        </tr>

                        <tr class="label-item">
                            <td>
                                <div class="checkbox-item">
                                    <input type="checkbox" >
                                    <span class="spacer"></span>
                                    <i class="fa fa-camera fa-fw" aria-hidden="true"></i>
                                    <span class="discNode" ns="speclib" data-id="0001_NASA_PDS_1.speclib.Spectral_Library_Product" step_path="plaid_discipline_node:sp">Spectral Library Product</span>
                                </div>
                            </td>
                        </tr>

                        <tr class="label-item">
                            <td>
                                <div class="checkbox-item">
                                    <input type="checkbox" >
                                    <span class="spacer"></span>
                                    <i class="fa fa-camera fa-fw" aria-hidden="true"></i>
                                    <span class="discNode" ns="proc" data-id="0001_NASA_PDS_1.proc.Processing_Information" step_path="plaid_discipline_node:pro">Processing Information</span>
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>
            </section>

            <h3>Mission Specifics</h3>
            <section id="mission_specifics_selection">
                <div class="mission_specifics">
                    <p class="question">Does your mission call for additional information? If so, please complete the following form.</p>
                    <div class="data-section">
                        <table class="list-group">
                            <tr>
                                <td>
                                    <button class="list-group-item yesButton">
                                        <i class="fa fa-check fa-fw" aria-hidden="true"></i>
                                        <span>Yes</span>
                                    </button>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <button class="list-group-item noButton">
                                        <i class="fa fa-times fa-fw" aria-hidden="true"></i>
                                        <span>No</span>
                                    </button>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            </section>

            <h3>Export</h3>
            <section id="export">
                <div id="finalPreview"></div>
                <div class="exportForm">
                        <span class="spacer"></span>
                        <div class="input-group" role="group">
                            <span class="input-group-addon" style="width:auto !important;">Filename:</span>

                                <input id="exportInput" class="form-control" name="filename" type="text" placeholder="label_template.xml">
                            <span class="input-group-btn">
                                <button id="exportButton" class="btn btn-warning" type="submit">Export</button>
                            </span>
                            <span class="input-group-btn">
                            <button id="submitButton" class="btn btn-primary">Submit to PDS for review</button>
                            </span>
                        </div>

                        <span class="spacer"></span>
                </div>

                <div class="exportIngestLDDForm">
                    <div id="finalPreviewIngest"></div>
                    <span class="spacer"></span>
                    <div class="input-group" role="group">
                        <span class="input-group-addon" style="width:auto !important;">Filename:</span>

                        <input id="exportIngestLDDInput" class="form-control" name="filename" type="text" placeholder="IngestLDDTool.xml">
                        <span class="input-group-btn">
                                <button id="exportIngestLDDButton" class="btn btn-warning" type="submit">Export</button>
                            </span>
                        <!-- <span class="input-group-btn">
                            <button id="submitButton" class="btn btn-primary">Submit to PDS for review</button>
                            </span> -->
                    </div>

                    <span class="spacer"></span>

                </div>
            </section>
        </div>
        <div id="sidebar">
            <div class="infoBar" class="card">
                <i id="sidebarIcon" class="fa fa-info-circle" aria-hidden="true"></i>
                <div id="help"></div>
            </div>
        </div>
        <div class="modal-backdrop loadingBackdrop" style="display: none"></div>
    </div>
</body>
<script src="js/setup.js"></script>
<script src="thirdparty/js/tether.min.js"></script>
<script src="thirdparty/js/bootstrap.min.js"></script>
</html>
