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
 * @file Contains the functions for modifying the XML of the label according to the user's
 * progression through the PLAID wizard. These functions utilize the DOMDocument class from
 * PHP to interact with the XML.
 *
 * Creation Date: 7/26/16
 *
 * @author Trevor Morse
 * @author Michael Kim
 * @author Stirling Algermissen
 */
require_once("interact_db.php");
if(isset($_POST['Function'])){
    $DOC = readInXML(getLabelXML());
    call_user_func($_POST['Function'], $_POST['Data']);
}
/**
 * Load the specified file into a new DOMDocument.
 * @param {string} $xml string containing XML document
 * @return DOMDocument
 */
function readInXML($xml){
    $doc = new DOMDocument();
    $doc->preserveWhiteSpace = false;
    $doc->formatOutput = true;
    $doc->loadXML($xml);
    return $doc;
}
/**
 * Use an XPath query to find a particular node or nodes in the DOMDoc.
 * @param {string} $path path to the node
 * @param {string} $ns either the current namespace to search with or an empty string
 * @return NodeList list of query results
 */
function getNode($path, $ns){
    global $DOC;
    $xpath = new DOMXPath($DOC);
    if (isNonDefaultNamespace($ns))
        $xpath->registerNamespace($ns, "http://pds.nasa.gov/pds4/$ns/v1");
    $query = "//" . $path;
    if($path == "/") {
        print "resetting path";
        $query = "/*"; // select root node
    }

    return $xpath->query($query);
}
/**
 * Add node(s) to the overall document.
 * @param {object} $args object containing the node path, number of nodes to add,
 * the namespace of the node, and the value (if any) to insert in the node.
 */
function addNode($args){
    global $DOC;
    $nodePath = $args["path"];
    $quantity = $args["quantity"];
    $ns = $args["ns"];
    list($nodeName, $nodePath) = handlePath($nodePath, $ns, isset($args["root_discipline_node"]), false);


    if (isNonDefaultNamespace($ns)){
        // make sure discipline root node exists
        $nodeName = $ns.":".$nodeName;
    }
    $nodes = getNode($nodePath, $ns);
    print $nodePath;
    print $nodeName;
    print $nodes->length;

    // Only change the node(s) value below
    if(isset($args["value_only"])) {
        foreach($nodes as $parent_node) {
            if ($parent_node->hasChildNodes()) {
                //  The updated value will now be set even if there is only 1 attribute w/ a non-zero quantity on the page
                ///if ($parent_node->childNodes->length > 1) {
                if ($parent_node->childNodes->length >= 1) {
                    foreach ($parent_node->childNodes as $child_node) {
                        if ($child_node->nodeName == $nodeName) {
                            $child_node->nodeValue = $args["value"];

                        }
                    }
                }
            }
        }
        $args = array("xml"=>$DOC->saveXML(NULL, LIBXML_NOEMPTYTAG));
        updateLabelXML($args);
        return;
    }


    if($nodes->length == 0 && isNonDefaultNamespace($ns)) {
        // Create ns root node
        $root_discipline_node = prependDisciplineRootNode(array(), $ns);
        if(count($root_discipline_node) == 1) {
            $newNode = $DOC->createElementNS("http://pds.nasa.gov/pds4/$ns/v1", $root_discipline_node[0]);
            $discipline_area = getNode("Observation_Area/Discipline_Area", "");
            $discipline_area = $discipline_area->item(0);
            $discipline_area->appendChild($newNode);
            $nodes = getNode($nodePath, $ns);
        }
    }



    if($nodes->length == 0 && substr_count($nodePath, "/") > 1 && !isNonDefaultNamespace($ns)) {
        http_response_code(500); // Couldn't find parent node
    }

    foreach($nodes as $parent_node){
        if($parent_node == null) {
            echo "Parent node is null";
            return;
        }
        // Check parent node children to see if the node we're going to add is already there -
        // In this case we want to insert the new node before the node of the same name, to maintain
        // order. Also, we want to duplicate that node's children, if it has any.
        $node_to_insert_before = NULL;
        $node_has_children = false;
        $total_instances_of_node = 0;
        if($parent_node->hasChildNodes()) {
            if($parent_node->childNodes->length >= 1) {
                foreach ($parent_node->childNodes as $child_node)  {
                    var_dump($child_node->nodeName);
                    var_dump($nodeName);

                    if($child_node->nodeName == $nodeName) {
                        $total_instances_of_node++;
                        $node_to_insert_before = $child_node;
                        $node_has_children = $node_to_insert_before->hasChildNodes();
                        //  Update the value of this node
                        $child_node->nodeValue = $args["value"];
                    }
                }
            }
        }
        print "\ntotal instances of node $total_instances_of_node\n";
        for ($x = $total_instances_of_node; $x < $quantity; $x++){
            if (isNonDefaultNamespace($ns)) {
                $newNode = $DOC->createElementNS("http://pds.nasa.gov/pds4/$ns/v1", $nodeName);
            } else {
                $newNode = $DOC->createElement($nodeName);
            }

            addNodeValue($newNode, $args["value"]);
            var_dump($node_to_insert_before);

           if(is_null($node_to_insert_before)) {
                $parent_node->appendChild($newNode);

                // SOMETHING WRONG WITH CODE BELOW - used to clon an already added class when more are added later

           } else {
                if($node_has_children) {
                    $parent_node->insertBefore($node_to_insert_before->cloneNode(true), $node_to_insert_before);
                } else {
                    $parent_node->insertBefore($newNode, $node_to_insert_before);
                }
           }
        }
    }
    $args = array("xml"=>$DOC->saveXML(NULL, LIBXML_NOEMPTYTAG));
    updateLabelXML($args);
}

/**
 * If a value is included, add it to the specified node.
 * @param {DOMNode} $node to add the value to
 * @param {string} $value to insert into the node
 */
function addNodeValue($node, $value){
    global $DOC;
    if ($value !== ""){
        $valNode = $DOC->createTextNode($value);
        $node->appendChild($valNode);
    }
}
/**
 * Add custom nodes from the mission specifics JSON passed in from the front-end.
 * Note: only handles adding custom nodes within the Mission_Area node of the document.
 * @param {object} $args object containing the string-ified JSON
 */
function addCustomNodes($args){
    global $DOC;
    $data = $args["json"];
    $path = "Observation_Area/Mission_Area";
    $parentNode = getNode($path, "")->item(0);

    //  Remove all of the child nodes that are already in the parent node
    while ($parentNode->firstChild) {
        $parentNode->removeChild($parentNode->firstChild);
    }

    foreach ($data as $node){
        addNodeWithComment($parentNode, $node["name"], $node["description"]);
        //  The isGroup boolean has been JSON stringified
        ///if ($node["isGroup"]){
        if ($node["isGroup"] == "true"){
            foreach ($node["children"] as $child){
                $groupNode = getNode($path."/".$node["name"], "")->item(0);
                addNodeWithComment($groupNode, $child["name"], $child["description"]);
            }
        }
    }
    $args = array("xml"=>$DOC->saveXML(NULL, LIBXML_NOEMPTYTAG));
    updateLabelXML($args);
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
/**
 * Remove node(s) from the overall document.
 * Note: this function only supports removing children of the root element.
 * @param {object} $args object containing the path to the node and its namespace (if any)
 */
function removeNode($args){
    global $DOC;
    $ns = $args["ns"];
    list($nodeName, $parentPath) = handlePath($args["path"], $ns);
    $nodes = getNode($nodeName, $ns);
    foreach($nodes as $node){
        $DOC->documentElement->removeChild($node);
    }
    $args = array("xml"=>$DOC->saveXML(NULL, LIBXML_NOEMPTYTAG));
    updateLabelXML($args);
}
/**
 * Remove class from the overall document.
 * @param {object} $args object containing the path to the node and its namespace (if any)
 */
function removeClass($args){
    global $DOC;
    $ns = $args["ns"];

    list($nodeName, $parentPath) = handlePath($args["path"], $ns, false, true);
    $getNodePath = $parentPath;
    if($nodeName != null) {
        $getNodePath = $getNodePath."/".$nodeName;
    }
    $nodes = getNode($getNodePath, $ns);

    $n_to_remove = $args["number_to_remove"];
    if(!isset($args["number_to_remove"])) {
        foreach($nodes as $node){
            $node->parentNode->removeChild($node);
        }
    } else {
        //  For each node with the given node path
        for($i = 0; $i < $nodes->length; $i++) {
            $node = $nodes->item($i);
            //  Update the value of the node
            $node->nodeValue = $args["value"];
            //  IF the node should be removed
            if ($i < $n_to_remove) {
                //  Remove the node
                $node->parentNode->removeChild($node);
            }
        }
    }
    $args = array("xml"=>$DOC->saveXML(NULL, LIBXML_NOEMPTYTAG));
    updateLabelXML($args);
}

/**
 * Clear out all child nodes of the target to prepare for adding in new children.
 * @param {object} $args object containing the path to the node and its namespace (if any)
 */
function removeAllChildNodes($args){
    global $DOC;
    $ns = $args["ns"];
    list($nodeName, $parentPath) = handlePath($args["path"], $ns, false, true);
    $nodes = getNode($parentPath."/".$nodeName, $ns);
    foreach ($nodes as $node){
        while ($node->hasChildNodes()){
            $childNode = $node->childNodes->item(0);
            $cnName = $childNode->nodeName;
            $node->removeChild($childNode);
        }
    }
    $args = array("xml"=>$DOC->saveXML(NULL, LIBXML_NOEMPTYTAG));
    print_r($args);
    updateLabelXML($args);
}
/**
 * Helper function to work on the path passed from the front-end and
 * put it in the format expected by the backend.
 * Note: This is converting the path from following the structure of the reference JSON
 * used on the front-end to the structure of the XML document.
 * @param {string} $path path to the node (in front-end structure)
 * @param {string} $ns namespace for the node (or empty if default namespace)
 * @param {string} $is_discipline_root set to true when addding the root node of a discipline dictionary
 * @param {string} $removing_node set to true when the path will be used to remove node(s)
 * @return array name of the node and the path to its parent (in backend structure)
 */
function handlePath($path, $ns, $is_discpline_root, $removing_node){
    $arr = explode("/", $path);
    //have to call array_values to reset indices of the array after filtering
    $filtArr = array_values(array_filter($arr, isNaN));
    $nodeName = array_pop($filtArr);
    if (isNonDefaultNamespace($ns)){
        if($removing_node && $nodeName != "") {
            // need namepsace prepended when looking up node
            $nodeName = $ns . ":" . $nodeName;
        }
        for ($i = 0; $i < count($filtArr); $i++){
            if (!empty($filtArr[$i]))
                $filtArr[$i] = $ns.":".$filtArr[$i];
        }

        if(!$is_discpline_root) {
            $filtArr = prependDisciplineRootNode($filtArr, $ns);
        }

        $subpath = implode("/", $filtArr);
        if (!empty($subpath))
            $path = "Observation_Area/Discipline_Area/".$subpath;
        else
            $path = "Observation_Area/Discipline_Area";
    }
    else {
        $path = implode("/", $filtArr);
        if($path == "") {
            $path = "/"; // set root when appropriate
        }
    }
    return array($nodeName, $path);
}

/**
 * Adds the xmlns definitions to the root element.
 * @param $args object containing list of namespaces
 */
function addRootAttrs($args){
    $namespaces = $args["namespaces"];
    global $DOC;
    $root = $DOC->documentElement;
    foreach ($namespaces as $ns){
        if ($ns === "pds") {
            $root->setAttribute("xmlns", "http://pds.nasa.gov/pds4/$ns/v1");
        } else {
            $root->setAttribute("xmlns:$ns", "http://pds.nasa.gov/pds4/$ns/v1");
        }
    }
    $args = array("xml"=>$DOC->saveXML(NULL, LIBXML_NOEMPTYTAG));
    updateLabelXML($args);
}

/**
 * Removes the xmlns definitions from the root element.
 * Note: this function is necessary to ease the searching of the document using XPath queries.
 * If the namespaces were left in all the time, then these searches would break.
 * @param $args object containing list of namespaces
 */
function removeRootAttrs($args){
    $namespaces = $args["namespaces"];
    global $DOC;
    $root = $DOC->documentElement;
    foreach ($namespaces as $ns){
        if ($ns === "pds")
            $root->removeAttributeNS("http://pds.nasa.gov/pds4/$ns/v1", "");
        else
            $root->removeAttributeNS("http://pds.nasa.gov/pds4/$ns/v1", $ns);
    }
    $args = array("xml"=>$DOC->saveXML(NULL, LIBXML_NOEMPTYTAG));
    print_r($args);
    updateLabelXML($args);
}

/**
 * Remove namespace attributes from within the Discipline_Area element.
 * Note: all namespaces are defined in the root tag.
 */
function formatDoc(){
    global $DOC;
    $root = $DOC->documentElement;
    $root->removeAttributeNS("http://pds.nasa.gov/pds4/pds/v1", "");
    $discAreaDom = getNode("Observation_Area/Discipline_Area", "")->item(0);
    $discAreaStr = $DOC->saveXML($discAreaDom);
    $discAreaStr = preg_replace("/\sxmlns:.*=\"http:\/\/pds.nasa.gov\/pds4\/.*\/v1\"/", "", $discAreaStr);
    $fileContents = getLabelXML();
    $modFile = preg_replace("/<Discipline_Area>.*<\/Discipline_Area>/s", $discAreaStr, $fileContents);
    $args = array("xml"=>$modFile);
    updateLabelXML($args);
}

/**
 * Helper function to determine if a value is not a number.
 * @param {string} $val
 * @return bool
 */
function isNaN($val){
    return !(is_numeric($val));
}

/**
 * Helper function to determine if a namespace is not the default.
 * @param {string} $ns namespace
 * @return bool
 */
function isNonDefaultNamespace($ns){
    return !empty($ns) && $ns !== "pds";
}

/**
 * Helper function for prepending namespace root node for discipline nodes
 * @param {string} $filtArr Array of attribute/class to be added
 * @param {string} $ns namespace of attribute/class
 * @return array
 */
function prependDisciplineRootNode($filtArr, $ns) {
    switch($ns) {
        case "img":
            array_unshift($filtArr, "img:Imaging");
            break;
        case "cart":
            array_unshift($filtArr, "cart:Cartography");
            break;
        case "geom":
            array_unshift($filtArr, "geom:Geometry");
            break;
        case "disp":
            array_unshift($filtArr, "disp:Display");
            break;
        case "rings":
            array_unshift($filtArr, "rings:Rings");
            break;
        case "wave":
            array_unshift($filtArr, "wave:Wave");
            break;
        default:
            return $filtArr;
    }
    return $filtArr;


}