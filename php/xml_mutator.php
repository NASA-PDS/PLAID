<?php
/**
 * Created by PhpStorm.
 * User: morse
 * Date: 7/13/16
 * Time: 1:17 PM
 */
$XML = readInXML("/tmp/sample_label.xml");
if(isset($_POST['Function'])){
    call_user_func($_POST['Function'], $_POST['Data']);
}
echo $XML->asXML();
function readInXML($file){
    return simplexml_load_file($file);
}
/*
 * Traverse the overall XML to the specified node.
 * @param SimpleXMLElement $xml structure to traverse
 * @param string $path path to node from root
 * @return $endNode
 */
function getNode($xml, $path){
    $nodes = explode("-", $path);
    $endNode = $xml;
    foreach ($nodes as $node){
        $endNode = $endNode->$node;
    }
    return $endNode;
}
/*
 * Add a node as the child of the specified parent.
 * @param string $nodePath path to node from root
 * @param string $nodeName
 */
function addNode($nodePath){
    global $XML;
    $nodeName = end(explode("-", $nodePath));
    $parentNode = getNode($XML, $nodePath);
    $parentNode->addChild($nodeName);
}
/*
 * Remove a specified node from the overall XML Document.
 * @param string $nodePath path to node from root
 */
function removeNode($nodePath){
    global $XML;
    $node = getNode($XML, $nodePath);
    unset($node[0]->{0});
}