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
    <script src="../js/redirect.js"></script>

</head>
<body>

<?php

require("configuration.php");
require("interact_db.php");
require("xml_mutator.php");

//function hello()
//{
//    echo "hello.";
//}

$notDebug = true;
if($notDebug){
//++++ file upload ++++++++++++++++++
    if ($_FILES["file"]["error"] > 0) {
        echo "Error: " . $_FILES["file"]["error"] . "<br>";
    } else {
//    echo "Upload: " . $_FILES["file"]["name"] . "<br>";
//    echo "Type: " . $_FILES["file"]["type"] . "<br>";
//    echo "Size: " . ($_FILES["file"]["size"] / 1024) . " kB<br>";
//    echo "Stored in: " . $_FILES["file"]["tmp_name"] . "<br>";

        $contents = file_get_contents($_FILES['file']['tmp_name']);
        $csv = array_map('str_getcsv', file($_FILES["file"]["tmp_name"]));
        $csvArray = array_values($csv);
//    echo $csv;
    }


//++++ functions ++++++++++++++++++
    function getNodeLocal($path, $ns, $doc)
    {
        $xpath = new DOMXPath($doc);
        if (isNonDefaultNamespace($ns))
            $xpath->registerNamespace($ns, "http://pds.nasa.gov/pds4/$ns/v1");
        $query = "//" . $path;
        if ($path == "/") {
            $query = "/*"; // select root node
        }
        return $xpath->query($query);
    }

//function clearSessionLabelId(){
//    $_SESSION['label_id'] = "";
//    header('Location: ../wizard.php/');
//}
//+++++++ functions ends +++++++++++++++++++
// get the original XML Data
    $DOC =  readInXML(getSpecifiedLabelXML(array(label_id=>$csvArray[0][0])));
    $labelXml = readInXML(getLabelXML(array(label_id=>$csvArray[0][0]))); // <-- this IS a copy of current xml, not just a reference
    $dummyXml = readInXML(getLabelXML(array(label_id=>$csvArray[0][0]))); // <-- this IS a copy of current xml, not just a reference
    $dataArray = array(); // a flattened array of $csvArray

// Iterate through rows in CSV, if the values are modified, modify the value of the newly generated label XML ($labelXml)
//        echo "<p><h2>Iterate through rows in CSV</h2>";
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

            // Compare corresponding values on the spreadshee against the old values
            $objOld = getNode(handlePath($row[0], "pds", false, false), "pds", $xml)->item(0);

            if($row[1] == "information_model_version"){
                // Store Information_model_version
                $modelVersionCheck = strpos("information_model_version", "", $row[1]);
            }
            if ($modelVersionCheck) {
                // echo "<br>model_version=" . $row[1] . "</br>";
                $movdelVersion = str_replace(".", "", $row[1]);
                // echo "<br>Modified model_version=" . $modelVersion . "</br>";
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
}//debug ends

// get the original progressData
$progressData = getRawProgressData(array(label_id=>$csvArray[0][0]));
$progressData2 = getRawProgressData(array(label_id=>$csvArray[0][0]));
$decPD = json_decode($progressData, true);
$decPD2 = json_decode($progressData, true);

//+++++++ Loop through pd, to modify the values +++++++++++++++
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


// Store the new label XML and progressData
$currLabelId = $_SESSION['label_id'];
// Todo: Uncomment this line before checkin - Commented out for devel opment
$newLabelId = storeXMLToANewLabel(array(labelName=>$newName, xmlDoc=>$dummyXml, version=>$movdelVersion));
storeProgressDataLocal(array(progressJson=>json_encode($decPD2), label_id=>$newLabelId));

//echo $newLabelId;

echo '<div class="container" style="padding-top:20%; ">';
echo '<p><h3 class="form-login-heading" style="text-align: center;">Your label has been stored as ' . $newName .' </h3></p>';

echo '<div class="newLabelWrapper" style="display: flex; justify-content: center;">';
echo '<p sylte=""><button id="signUp" class="btn btn-lg btn-primary btn-block" onclick="location.href=\'../dashboard.php\';" >Go To Dashboard</button>';
echo '<button id="signUp" class="btn btn-lg btn-primary btn-block" onclick="location.href=\'../wizard.php\';" >Go To Your New Label</button></p>';


//echo '<small class="form-text text-muted">Don\'t have an account? Click below.</small>';
echo '</div>';
echo '</div>';
?>


</body>
</html>
