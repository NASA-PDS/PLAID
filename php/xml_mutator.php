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
function getNode($path, $ns){
    global $DOC;
    $xpath = new DOMXPath($DOC);
    if (isNonDefaultNamespace($ns))
        $xpath->registerNamespace($ns, "http://pds.nasa.gov/pds4/$ns/v1");
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
    $ns = $args["ns"];
    list($nodeName, $nodePath) = handlePath($nodePath, $ns);
    if (isNonDefaultNamespace($ns)){ $nodeName = $ns.":".$nodeName; }
    $nodes = getNode($nodePath, $ns);
    foreach($nodes as $node){
        for ($x = 0; $x < $quantity; $x++){
            if (isNonDefaultNamespace($ns))
                $newNode = $DOC->createElementNS("http://pds.nasa.gov/pds4/$ns/v1", $nodeName);
            else
                $newNode = $DOC->createElement($nodeName);
            $node->appendChild($newNode);
            echo "Created: ".$nodeName;
        }
    }
}

/**
 * Add custom nodes from the mission specifics json passed in from the front-end.
 * @param {object} $args object containing argument values
 */
function addCustomNodes($args){
    $data = $args["json"];
    $path = "Observation_Area/Mission_Area";
    $parentNode = getNode($path, "")->item(0);
    foreach ($data as $node){
        addNodeWithComment($parentNode, $node["name"], $node["description"]);
        if ($node["isGroup"]){
            foreach ($node["children"] as $child){
                $groupNode = getNode($path."/".$node["name"], "")->item(0);
                addNodeWithComment($groupNode, $child["name"], $child["description"]);
                echo "-> Added: ".$child["name"].": ".$child["description"];
            }
        }
        echo "Added: ".$node["name"].": ".$node["description"];
    }
}
/**
 * Add nodes with associated comments to the specified parent element.
 * @param {DOMNode} $parent node to add the new node to
 * @param {string} $nodeName name of the new node
 * @param {string} $comment comment describing the new node
 */
function addNodeWithComment($parent, $nodeName, $comment){
    global $DOC;
    $newNode = $DOC->createElement($nodeName);
    $newComment = $DOC->createComment($comment);
    $newNode->appendChild($newComment);
    $parent->appendChild($newNode);
}
/*
 * Remove node(s) from the overall document.
 * @param {object} $args object containing argument values
 */
function removeNode($args){
    $ns = $args["ns"];
    list($nodeName, $parentPath) = handlePath($args["path"], $ns);
    $nodes = getNode($parentPath . "/" . $nodeName, $ns);
    $parentNode = getNode($parentPath, $ns)->item(0);
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
    $ns = $args["ns"];
    list($nodeName, $parentPath) = handlePath($args["path"], $ns);
    $nodes = getNode($parentPath."/".$nodeName, $ns);
    foreach ($nodes as $node){
        while ($node->hasChildNodes()){
            $childNode = $node->childNodes->item(0);
            $cnName = $childNode->nodeName;
            echo "Removed: ".$cnName."\n";
            $node->removeChild($childNode);
        }
    }
}
/**
 * Helper function to work on the path passed from the front-end and
 * put it in the format expected by the backend.
 * @param {string} $path path to the node (in front-end structure)
 * @param {string} $ns namespace for the node (or empty if default namespace)
 * @return {array} name of the node and the path to its parent (in backend structure)
 */
function handlePath($path, $ns){
    $arr = explode("/", $path);
    //have to call array_values to reset indices of the array after filtering
    $filtArr = array_values(array_filter($arr, isNaN));
    $nodeName = array_pop($filtArr);
    if (isNonDefaultNamespace($ns)){
        for ($i = 0; $i < count($filtArr); $i++){
            if (!empty($filtArr[$i]))
                $filtArr[$i] = $ns.":".$filtArr[$i];
        }
        $subpath = implode("/", $filtArr);
        if (!empty($subpath))
            $path = "Observation_Area/Discipline_Area/".$subpath;
        else
            $path = "Observation_Area/Discipline_Area";
    }
    else {
        $path = implode("/", $filtArr);
    }
    return array($nodeName, $path);
}
function addRootAttrs($args){
    $namespaces = $args["namespaces"];
    global $DOC;
    $root = $DOC->documentElement;
    foreach ($namespaces as $ns){
        if ($ns === "pds")
            $root->setAttribute("xmlns", "http://pds.nasa.gov/pds4/$ns/v1");
        else
            $root->setAttribute("xmlns:$ns", "http://pds.nasa.gov/pds4/$ns/v1");
    }
}
function removeRootAttrs($args){
    $namespaces = $args["namespaces"];
    global $DOC;
    $root = $DOC->documentElement;
    foreach ($namespaces as $ns){
        if ($ns === "pds")
            $root->removeAttributeNS("http://pds.nasa.gov/pds4/$ns/v1", "");
        /*else
            $root->removeAttributeNS("http://pds.nasa.gov/pds4/$ns/v1", $ns);*/
    }
}
function formatDoc($args){
    global $DOC;
    $discAreaDom = getNode("Observation_Area/Discipline_Area", "")->item(0);
    $discAreaStr = $DOC->saveXML($discAreaDom);
    echo $discAreaStr;
    $discAreaStr = preg_replace("xmlns:[a-z]{4}=\"http:\/\/pds.nasa.gov\/pds4\/[a-z]{4}\/v1\"", "", $discAreaStr);
    echo $discAreaStr;
}
function isNaN($val){
    return !(is_numeric($val));
}
function isNonDefaultNamespace($ns){
    return !empty($ns) && $ns !== "pds";
}
