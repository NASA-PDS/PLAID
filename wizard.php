<?php
session_start();
if (!isset($_SESSION['login']) || $_SESSION['login'] == false)
    header("Location: login.html");

?>
<!DOCTYPE html>
<html>
<head>
    <title>Label Design Tool</title>
    <meta charset="utf-8">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.2/jquery.min.js"></script>
    <script src="thirdparty/js/jquery.steps.min.js"></script>
    <script src="thirdparty/js/tree.jquery.js"></script>
    <script src="config/config.js"></script>
    <script src="config/infobar_config.js"></script>
    <script src="js/main.js"></script>
    <script src="config/pop_up_config.js"></script>
    <script src="js/element_bar.js"></script>
    <script src="js/init_steps.js"></script>
    <script src="js/popover.js"></script>
    <script src="js/parse_json.js"></script>
    <script src="js/mission_specifics.js"></script>
    <script src="js/discipline_nodes.js"></script>
    <script src="js/pop_up.js"></script>
    <script src="js/progress.js"></script>
    <link href="thirdparty/css/jquery.steps.css" rel="stylesheet">
    <link href="thirdparty/css/jqtree.css" rel="stylesheet">
    <link href="thirdparty/css/bootstrap.css" rel="stylesheet">
    <link href="css/general.css" rel="stylesheet">
    <link href="css/mission_specifics.css" rel="stylesheet">
    <link href="css/pop_up.css" rel="stylesheet">
    <link href="thirdparty/css/tether.min.css" rel="stylesheet">
    <link href="thirdparty/font-awesome-4.6.3/css/font-awesome.min.css" rel="stylesheet">
</head>
<body>
    <nav class="navbar navbar-dark no-border-radius" style="background-color: #2184be;">
        <div class="nav navbar-nav">
            <a class="navbar-brand">Label Design Tool</a>
            <li class="nav-item pull-xs-right">
                <a class="wizardExitButton nav-link" href="dashboard.php">Exit</a>
            </li>
            <li class="nav-item pull-xs-right">
                <a class="labelPreviewButton nav-link" href="#">Preview</a>
            </li>
            <li class="nav-item pull-xs-right">
                <p class="labelNameNav navbar-brand m-b-0"></p>
            </li>
        </div>
    </nav>
    <div id="wrapper">
        <div id="wizard">

            <h3>Product Type</h3>
            <section id="product_selection">
                <p class="question">What type of product would you like to create a label for?</p>
                <table class="list-group">
                    <tr class="label-item">
                        <td>
                            <button class="list-group-item disabled" disabled>
                                <i class="fa fa-list fa-fw" aria-hidden="true"></i>
                                <span class="productType" data-id="0001_NASA_PDS_1.pds.Product_Context">Context</span>
                            </button>
                        </td>
                    </tr>
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
                            <button class="list-group-item disabled" disabled>
                                <i class="fa fa-file-text-o fa-fw" aria-hidden="true"></i>
                                <span class="productType" data-id="0001_NASA_PDS_1.pds.Product_File_Text">File Text</span>
                            </button>
                        </td>
                    </tr>
                    <tr class="label-item">
                        <td>
                            <button class="list-group-item">
                                <i class="fa fa-binoculars fa-fw" aria-hidden="true"></i>
                                <span class="productType" data-id="0001_NASA_PDS_1.pds.Product_Observational">Observational</span>
                            </button>
                        </td>
                    </tr>
                    <tr class="label-item">
                        <td>
                            <button class="list-group-item disabled" disabled>
                                <i class="fa fa-picture-o fa-fw" aria-hidden="true"></i>
                                <span class="productType" data-id="0001_NASA_PDS_1.pds.Product_Thumbnail">Thumbnail</span>
                            </button>
                        </td>
                    </tr>
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
                                    <input type="checkbox" disabled>
                                    <span class="spacer"></span>
                                    <i class="fa fa-map fa-fw" aria-hidden="true"></i>
                                    <span class="discNode" data-id="">Cartography</span>
                                </div>
                            </td>
                        </tr>
                        <tr class="label-item">
                            <td>
                                <div class="checkbox-item">
                                    <input type="checkbox" disabled>
                                    <span class="spacer"></span>
                                    <i class="fa fa-desktop fa-fw" aria-hidden="true"></i>
                                    <span class="discNode" data-id="">Display</span>
                                </div>
                            </td>
                        </tr>
                        <tr class="label-item">
                            <td>
                                <div class="checkbox-item">
                                    <input type="checkbox">
                                    <span class="spacer"></span>
                                    <i class="fa fa-space-shuttle fa-fw" aria-hidden="true"></i>
                                    <span class="discNode" data-id="0001_NASA_PDS_1.geom.Geometry">Geometry</span>
                                </div>
                            </td>
                        </tr>
                        <tr class="label-item">
                            <td>
                                <div class="checkbox-item">
                                    <input type="checkbox">
                                    <span class="spacer"></span>
                                    <i class="fa fa-image fa-fw" aria-hidden="true"></i>
                                    <span class="discNode" data-id="0001_NASA_PDS_1.img.Imaging">Imaging</span>
                                </div>
                            </td>
                        </tr>
                        <tr class="label-item">
                            <td>
                                <div class="checkbox-item">
                                    <input type="checkbox" disabled>
                                    <span class="spacer"></span>
                                    <i class="fa fa-sun-o fa-fw" aria-hidden="true"></i>
                                    <span class="discNode" data-id="">Plasma Particle</span>
                                </div>
                            </td>
                        </tr>
                        <tr class="label-item">
                            <td>
                                <div class="checkbox-item">
                                    <input type="checkbox" disabled>
                                    <span class="spacer"></span>
                                    <i class="fa fa-circle fa-fw" aria-hidden="true"></i>
                                    <span class="discNode" data-id="">Ring-Moon Systems</span>
                                </div>
                            </td>
                        </tr>
                        <tr class="label-item">
                            <td>
                                <div class="checkbox-item">
                                    <input type="checkbox" disabled>
                                    <span class="spacer"></span>
                                    <i class="fa fa-spinner fa-fw" aria-hidden="true"></i>
                                    <span class="discNode" data-id="">Small Bodies</span>
                                </div>
                            </td>
                        </tr>
                        <tr class="label-item">
                            <td>
                                <div class="checkbox-item">
                                    <input type="checkbox" disabled>
                                    <span class="spacer"></span>
                                    <i class="fa fa-rss fa-fw" aria-hidden="true"></i>
                                    <span class="discNode" data-id="">Spectra</span>
                                </div>
                            </td>
                        </tr>
                        <tr class="label-item">
                            <td>
                                <div class="checkbox-item">
                                    <input type="checkbox" disabled>
                                    <span class="spacer"></span>
                                    <i class="fa fa-google-wallet fa-fw" aria-hidden="true"></i>
                                    <span class="discNode" data-id="">Wave</span>
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
                <form id="exportForm" onsubmit="return checkFilename();" action="php/export_template.php" method="post">
                    <fieldset>
                        <span class="spacer"></span>
                        <p style="display: inline;">Filename:</p>
                        <input id="exportInput" name="filename" type="text" placeholder="label_template.xml" style="display: inline;">
                        <span class="spacer"></span>
                        <input id="exportButton" class="btn" type="submit" value="Export">
                    </fieldset>
                </form>
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
