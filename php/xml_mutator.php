<?php
/**
 * Created by PhpStorm.
 * User: morse
 * Date: 7/26/16
 * Time: 1:50 PM
 */
$DOC = readInXML("/tmp/sample_label.xml");
if(isset($_POST['Function'])){
    call_user_func($_POST['Function'], $_POST['Data']);
}
//$DOC->save("/tmp/sample_label.xml", LIBXML_NOEMPTYTAG);
//echo $DOC->saveXML();
/*
 * Load the specified file into a new DOMDocument.
 * @param {string} $file path to the file
 * @return {DOMDocument}
 */
function readInXML($file){
    $doc = new DOMDocument();
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
 * @param {list} $args list of objects containing argument values
 */
function addNode($args){
    global $DOC;
    $nodePath = $args[0]["path"];
    $quantity = $args[0]["quantity"];
    list($nodeName, $nodePath) = handlePath($nodePath);
    $nodes = getNode($nodePath);
    foreach($nodes as $node){
        for ($x = 0; $x < $quantity; $x++){
            $newNode = $DOC->createElement($nodeName);
            $node->appendChild($newNode);
        }
    }
}
/*
 * Remove node(s) from the overall document.
 * @param {list} $args list of objects containing argument values
 */
function removeNode($args){
    global $DOC;
    list($nodeName, $parentPath) = handlePath($args[0]["path"]);
    $nodes = getNode($parentPath . "/" . $nodeName);
    $parentNode = getNode($parentPath)->item(0);
    foreach($nodes as $node){
        $parentNode->removeChild($node);
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