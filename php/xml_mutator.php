<?php
/**
 * Created by PhpStorm.
 * User: morse
 * Date: 7/26/16
 * Time: 1:50 PM
 */
$filepath = "/tmp/test.xml";
$DOC = readInXML($filepath);
if(isset($_POST['Function'])){
    call_user_func($_POST['Function'], $_POST['Data']);
}
$DOC->save($filepath, LIBXML_NOEMPTYTAG);
/*
 * Load the specified file into a new DOMDocument.
 * @param {string} $file path to the file
 * @return {DOMDocument}
 */
function readInXML($file){
    $doc = new DOMDocument();
    $doc->preserveWhiteSpace = false;
    $doc->formatOutput = true;
    $doc->load($file);
    return $doc;
}
/*
 * Use an XPath query to find a particular node or nodes in the DOMDoc.
 * @param {string} $path path to the node
 * @return {NodeList} list of query results
 */
function getNode($path){
    global $DOC;
    $xpath = new DOMXPath($DOC);
    $query = "//" . $path;
    return $xpath->query($query);
}
/*
 * Add node(s) to the overall document.
 * @param {object} $args object containing argument values
 */
function addNode($args){
    global $DOC;
    $nodePath = $args["path"];
    $quantity = $args["quantity"];
    list($nodeName, $nodePath) = handlePath($nodePath);
    $nodes = getNode($nodePath);
    foreach($nodes as $node){
        for ($x = 0; $x < $quantity; $x++){
            if ($args["ns"]){
                $nsPath = "http://pds.nasa.gov/pds4/".$args["ns"];
                $nodeName = $args["ns"].":".$nodeName;
                $newNode = $DOC->createElementNS($nsPath, $nodeName);
            }
            else{
                $newNode = $DOC->createElement($nodeName);
            }
            $node->appendChild($newNode);
            echo "Created: ".$nodeName;
        }
    }
}

/**
 * Start of a function for adding an attribute to an XML node.
 * @param $args
 */
function addAttribute($args){
    global $DOC;
    $nodePath = $args["path"];
    $attr = $args["name"];
    $val = $args["value"];
    $nodes = getNode($nodePath);
    foreach($nodes as $node){
        $newAttr = $DOC->createAttribute($attr);
        $newAttr->value = $val;
        $node->appendChild($newAttr);
    }
}
/*
 * Remove node(s) from the overall document.
 * @param {object} $args object containing argument values
 */
function removeNode($args){
    list($nodeName, $parentPath) = handlePath($args["path"]);
    $nodes = getNode($parentPath . "/" . $nodeName);
    $parentNode = getNode($parentPath)->item(0);
    foreach($nodes as $node){
        $parentNode->removeChild($node);
        echo "Removed: ".$nodeName;
    }
}
/*
 * Clear out all child nodes of the target to prepare for adding in new children.
 * @param {object} $args object containing argument values
 */
function removeAllChildNodes($args){
    list($nodeName, $parentPath) = handlePath($args["path"]);
    $nodes = getNode($parentPath."/".$nodeName);
    foreach ($nodes as $node){
        while ($node->hasChildNodes()){
            $childNode = $node->childNodes->item(0);
            $cnName = $childNode->nodeName;
            echo "Removed: ".$cnName;
            $node->removeChild($childNode);
        }
    }
}
/*
 * Helper function to work on the path passed from the front-end and
 * put it in the format expected by the backend.
 * @param {string} $path path to the node (in front-end structure)
 * @return {array} name of the node and the path to its parent (in backend structure)
 */
function handlePath($path){
    $arr = explode("/", $path);
    $arr = array_filter($arr, isNaN);
    $nodeName = array_pop($arr);
    /*for ($i = 0; $i < count($arr); $i++){
        $arr[$i] = "pds:".$arr[$i];
    }*/
    return array($nodeName, implode("/", $arr));
}
function isNaN($val){
    return !(is_numeric($val));
}

/**
 * Validator function for the generating XML
 * Currently a work in progress
 */
function validateXML() {
    echo "Test";
    global $DOC;
    if (!$DOC->schemaValidate("https://pds.nasa.gov/pds4/pds/v1/PDS4_PDS_1600.xsd")) {
        // You have an error in the XML file
        //echo "schema invalid";
    } else {
        //echo "schema validated successfully";
    }
}
