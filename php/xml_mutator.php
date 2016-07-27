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
            $newNode = $DOC->createElement($nodeName);
            $node->appendChild($newNode);
            echo "Created: ".$nodeName;
        }
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
    return array($nodeName, implode("/", $arr));
}
function isNaN($val){
    return !(is_numeric($val));
}