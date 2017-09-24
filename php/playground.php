<!DOCTYPE html>
<html><html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="cache-control" content="max-age=0" />
    <meta http-equiv="cache-control" content="no-cache" />
    <meta http-equiv="expires" content="0" />
    <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT" />
    <meta http-equiv="pragma" content="no-cache" />
    <title>PLAID: Created New Label</title>
    <link href="../thirdparty/css/bootstrap.css" rel="stylesheet">
    <link href="../css/user_management.css" rel="stylesheet">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.2/jquery.min.js"></script>
    <script src="../thirdparty/js/jquery.steps.min.js"></script>
<!--    <script src="../js/redirect.js"></script>-->

</head>
<body>

<?php

require("configuration.php");
require("interact_db.php");
require("xml_mutator.php");

// File upload
    if ($_FILES["file"]["error"] > 0) {
        echo "Error: " . $_FILES["file"]["error"] . "<br>";
    } else {
        $contents = file_get_contents($_FILES['file']['tmp_name']);
        $csv = array_map('str_getcsv', file($_FILES["file"]["tmp_name"]));
        $csvArray = array_values($csv);
//    echo $csv;
    }


// Get the original XML Data
    $DOC =  readInXML(getSpecifiedLabelXML(array(label_id=>$csvArray[0][0])));
    $labelXml = readInXML(getLabelXML(array(label_id=>$csvArray[0][0]))); // <-- this IS a copy of current xml, not just a reference
    if($_SESSION['table_upload_overwrite']==1 || $_SESSION['table_upload_overwrite']=="1") {
        $dummyXml = $DOC;
    }else{
        $dummyXml = readInXML(getLabelXML(array(label_id => $csvArray[0][0]))); // <-- this IS a copy of current xml, not just a reference
    }
    $dataArray = array(); // a flattened array of $csvArray

// Iterate through rows in CSV, if the values are modified, modify the value of the newly generated label XML ($labelXml)
    $counter = 0;
    $movdelVersion = "1800";
    $objOld = array();
    $objNew = array();
    $newVal = array();
    foreach ($csvArray as $row) {

        $stripped = preg_replace('/\[.*\]/', '', $row[0]);
        $newVal = $row[1];
        if ($counter > 1) {
            if ($row[1] == "-") {
                $newVal = "";
            }

            $stripped = preg_replace('/\[.*\]/', '', $row[0]);

            $dataArray[$row[0]] = $newVal;
            $dataArray[$stripped] = $newVal;

            // Compare corresponding values on the spreadsheet against the old values
            $objOld = getNode(handlePath($row[0], "pds", false, false), "pds", $xml)->item(0);

            if($row[1] == "information_model_version"){
                // Store Information_model_version
                $modelVersionCheck = strpos("information_model_version", "", $row[1]);
            }
            if ($modelVersionCheck) { // incomplete code
                $movdelVersion = str_replace(".", "", $row[1]);
            }
            if ($objOld->nodeValue != $newVal) {
                $dummyXml = addNodeLocal(array('path' => $row[0], 'quantity' => 1, 'value' => $newVal, 'ns' => "pds", 'xmlDoc' => $dummyXml, 'value_only' => true));
            }
        }
        $counter++;
    }

//        echo "</p>";
    date_default_timezone_set('America/Los_Angeles');
    $datetime = date("m.d.Y") . "_" . date("h:i");
    $newName = "my_label" . "_" . $datetime;

// get the original progressData
$progressData = getRawProgressData(array(label_id=>$csvArray[0][0]));
$progressData2 = getRawProgressData(array(label_id=>$csvArray[0][0]));
$decPD = json_decode($progressData, true);
$decPD2 = json_decode($progressData, true);

// Loop through progressData, to modify the values +++++++++++++++
$ptr=0;
foreach ($decPD2 as $key => &$step) {
    if ($step['step'] == "optional_nodes" && $step['step_path']!="Label Root") {

        $stepPath = $step['step_path'];

        if (getType($step['selection']) == "array") {
            foreach ($step['selection'] as $key => &$attr) {

                $id = $attr['id'];
                // strip off indices
                $stripped2 = preg_replace('/\[.*\]/', '', $attr['id']);
                $modifiedValue = $dataArray[$id] == null ? $dataArray[$stripped2] : $dataArray[$id];
                $modifiedValue = $modifiedValue == "-"? "": $modifiedValue;
                $attr['val'] = $modifiedValue;
            }
        }
    }
}
unset($value);
unset($val);

$currLabelId = $_SESSION['label_id'];

// Store updated  XML and progressData
$displayMsg = "";
if($_SESSION['table_upload_overwrite']==1 || $_SESSION['table_upload_overwrite']=="1"){
    $currLabelId = $_SESSION['label_id'];
    storeXML(array(labelName=>$newName, xmlDoc=>$dummyXml, version=>$modelVersion));
    storeProgressData(array(progressJson=>json_encode($decPD2)));
    $displayMsg = 'Your label has been updated';
//    echo 'label overwritten: ' . $currLabelId;
}else{
    $newLabelId = storeXMLToANewLabel(array(labelName=>$newName, xmlDoc=>$dummyXml, version=>$movdelVersion));
    storeProgressDataLocal(array(progressJson=>json_encode($decPD2), label_id=>$newLabelId));
    $displayMsg = 'Your label has been stored as ' . $newName;

    // Store the Mission Specific, and Ingest LDD data
    $missionSpecificsJson = json_decode( getMissionSpecificsData(array(isReturn=>1, target_label_id=>$currLabelId)),true);
    $missionSpecificsHeader = getMissionSpecificsHeaderData(array(isReturn=>1, target_label_id=>$currLabelId));
    $ingestLDDToolXML = getIngestLDDToolXML(array(target_label_id=>$currLabelId));
    storeMissionSpecificsData(array(missionSpecificsHeader=>$missionSpecificsHeader, missionSpecificsJson=>json_encode($missionSpecificsJson), store_location=>$newLabelId));
}

echo '<div class="container" style="padding-top:20%; ">';
echo '<p><h3 class="form-login-heading" style="text-align: center;">' . $displayMsg . '</h3></p>';

echo '<div class="newLabelWrapper" style="display: flex; justify-content: center;">';
echo '<p sylte=""><button id="signUp" class="btn btn-lg btn-primary btn-block" onclick="location.href=\'../dashboard.php\';" >Go To Dashboard</button>';
echo '<button id="signUp" class="btn btn-lg btn-primary btn-block" onclick="location.href=\'../wizard.php\';" >Go To Your Label</button></p>';

//echo '<small class="form-text text-muted">Don\'t have an account? Click below.</small>';
echo '</div>';
echo '</div>';
?>

</body>
</html>
