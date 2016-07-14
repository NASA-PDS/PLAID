<?php
/**
 * Created by PhpStorm.
 * User: morse
 * Date: 7/13/16
 * Time: 1:17 PM
 */
$DOC = readInXML("/tmp/sample_label.xml");
if(isset($_POST['Function'])){
    call_user_func($_POST['Function'], $_POST['Data']);
}
$DOC->save("/tmp/sample_label.xml");
echo $DOC->saveXML();
function readInXML($file){
    $doc = new DOMDocument();
    $doc->load($file);
    return $doc;
}
function getNode($path){
    global $DOC;
    $xpath = new DOMXPath($DOC);
    $query = "//" . $path;
    return $xpath->query($query);
}
function addNode($args){
    global $DOC;
    $nodePath = $args[0]["path"];
    $quantity = $args[0]["quantity"];
    $arr = explode("/", $nodePath);
    $nodeName = array_pop($arr);
    $nodePath = implode("/", $arr);
    //handle case where getNode returns multiple
    $nodes = getNode($nodePath);
    foreach($nodes as $node){
        $newNode = $DOC->createElement($nodeName);
        $node->appendChild($newNode);
    }
}
function removeNode($doc, $nodePath){
    //handle case where getNode returns multiple
    $node = getNode($doc, $nodePath);
    $parentNode = getNode($doc, $nodePath);
    $parentNode->removeChild($node);
}