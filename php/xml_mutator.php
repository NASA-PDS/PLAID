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
require_once("function_validation.php");
if(isset($_POST['Function'])){
    validateFunction($_POST['Function']);
    $DOC = readInXML(getLabelXML());
    call_user_func($_POST['Function'], $_POST['Data']);
}
/**
 * Load the specified file into a new DOMDocument.
 * @param {string} $xml string containing XML document
 * @return DOMDocument
 */
function readInXML($xml){

    # Set $xml with selected Product Type strings
    if (strpos($xml, '<File_Area_Observational>')) {
        $product_tag = '/Product_Context/i';
        $xml = preg_replace($product_tag, 'Product_Observational', $xml);

    } else if (strpos($xml, '<Document>')) {
        $product_tag = '/Product_Context/i';
        $xml = preg_replace($product_tag, 'Product_Document', $xml);
    } else if (strpos($xml, '<Collection>')) {
        $product_tag = '/Product_Context/i';
        $xml = preg_replace($product_tag, 'Product_Collection', $xml);

    } else if (strpos($xml, '<Bundle>')) {
        $product_tag = '/Product_Context/i';
        $xml = preg_replace($product_tag, 'Product_Bundle', $xml);

    } else {
        $product_tag = '/<Discipline_Area>.*<\/Discipline_Area>/s';
        $xml = preg_replace($product_tag, ' ', $xml);
    }
  

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
 * Use an XPath query to find a particular node or nodes in a specified DOM Doc. Todo: should alter getNode to take in a specified Dom doc instead of the global XML doc
 * @param {string} $path path to the node
 * @param {string} $ns either the current namespace to search with or an empty string
 * @return NodeList list of query results
 */
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


    // Only change the node(s) value below
    if(isset($args["value_only"])) {
        foreach($nodes as $parent_node) {
            if ($parent_node->hasChildNodes()) {
                //  The updated value will now be set even if there is only 1 attribute w/ a non-zero quantity on the page
                ///if ($parent_node->childNodes->length > 1) {
                if ($parent_node->childNodes->length >= 1) {
                    foreach ($parent_node->childNodes as $child_node) {
                        if ($child_node->nodeName == $nodeName) {
                            //  Update the text value of this node
                            //  Setting the nodeValue attribute wipes out the child nodes of this node
                            ///$child_node->nodeValue = $args["value"];
                            updateNodeValue($child_node, $args["value"]);
                            //  IF a Unit is specified
                            if (isset($args["unit"]) && (!empty($args["unit"]))) {
                                //  Set the Unit attribute of the node
                                $child_node->setAttribute("unit", $args["unit"]);
                            } else {
                                //  Remove the Unit attribute of the node
                                $child_node->removeAttribute("unit");
                            }

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

                    if($child_node->nodeName == $nodeName) {
                        $total_instances_of_node++;
                        $node_to_insert_before = $child_node;
                        $node_has_children = $node_to_insert_before->hasChildNodes();
                        //  Update the text value of this node
                        //  Setting the nodeValue attribute wipes out the child nodes of this node
                        ///$child_node->nodeValue = $args["value"];
                        updateNodeValue($child_node, $args["value"]);
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

            //  IF a Unit is specified
            if (isset($args["unit"]) && (!empty($args["unit"]))) {
                //  Add a Unit attribute to the node
                $newNode->setAttribute("unit", $args["unit"]);
            }

            addNodeValue($newNode, $args["value"]);

           if(is_null($node_to_insert_before)) {
                $parent_node->appendChild($newNode);

                // SOMETHING WRONG WITH CODE BELOW - used to clone an already added class when more are added later

           } else {
                if($node_has_children) {
                    $node_cloned = $node_to_insert_before->cloneNode(true);
                    $parent_node->insertBefore($node_cloned, $node_to_insert_before);
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
 * If a value is included, add it to the specified node of the target XML document.
 * @param {DOMNode} $node to add the value to
 * @param {string} $value to insert into the node
 */
function addNodeValueLocal($node, $value, $doc){
    if ($value !== ""){
        $valNode = $doc->createTextNode($value);
        $node->appendChild($valNode);
    }
}

/**
 * Update the given node's text value.
 * If a value is included, add it to the specified node.
 * @param {DOMNode} $node to add the value to
 * @param {string} $value to set into the node
 */
function updateNodeValue($node, $value){
    global $DOC;
    $found = false;
    foreach ($node->childNodes as $child_node) {
        //  IF child node is a Text node
        if ($child_node->nodeName === "#text") {
            $child_node->nodeValue = $value;
            $found = true;
            break;
        }
    }
    //  IF No Text node found
    if (! $found) {
        addNodeValue($node, $value);
    }
}

/**
 * Update the given node's text value of the target XML document.
 * If a value is included, add it to the specified node.
 * @param {DOMNode} $node to add the value to
 * @param {string} $value to set into the node
 */
function updateNodeValueLocal($node, $value, $doc){

    $found = false;
    foreach ($node->childNodes as $child_node) {
        //  IF child node is a Text node
        if ($child_node->nodeName === "#text") {
            $child_node->nodeValue = $value;
            $found = true;
            break;
        }
    }
    //  IF No Text node found
    if (! $found) {
        addNodeValueLocal($node, $value, $doc);
    }
}

/**
 * Add custom nodes from the mission specifics JSON passed in from the front-end.
 * Note: only handles adding custom nodes within the Mission_Area node of the document.
 * @param {object} $args object containing the string-ified mission-specific JSON,
 *  the mission-specific header, and the schema version
 */
function addCustomNodes($args){
    global $DOC;
    $data = $args["json"];
    $missionSpecificsHeader = $args['missionSpecificsHeader'];
    $version = $args['schemaVersion'];
    $missionName = $missionSpecificsHeader['missionName'];
    $stewardId = $missionSpecificsHeader['stewardId'];
    $nsId = $missionSpecificsHeader['namespaceId'];
    $cmt = $missionSpecificsHeader['comment'];
    $path = "Observation_Area/Mission_Area";
    $parentNode = getNode($path, "")->item(0);

    //  Create the ingestLDD XML Document
    $DOC_LDD = new DOMDocument('1.0', 'utf-8');
    $DOC_LDD->preserveWhiteSpace = false;
    $DOC_LDD->formatOutput = true;
    //  Create a root element for the ingestLDD XML Document
    $rootLDD = $DOC_LDD->createElement('Ingest_LDD');
    $DOC_LDD->appendChild($rootLDD);

    //  Add the Mission Name under the root element 'Ingest_LDD'
    addIngestLDDNode($DOC_LDD, $rootLDD, "name", $missionName);
    //  Add the version under the root element 'Ingest_LDD'
    //  Add dots to the version
    $version_dotted = "";
    for ($i=0; $i < strlen($version); $i++) {
        $version_dotted .= $version[$i];
        if ($i < strlen($version)-1) {
            $version_dotted .= ".";
        }
    }
    addIngestLDDNode($DOC_LDD, $rootLDD, "ldd_version_id", $version_dotted);

    //  Add the user's full name under the root element 'Ingest_LDD'
    $userId = $_SESSION['user_id'];
    //  Get the user's full name from the user table
    $userFullName = getUserName($userId);
    if ($userFullName != null) {
        addIngestLDDNode($DOC_LDD, $rootLDD, "full_name", $userFullName);
    }
    //  Add the Steward Id under the root element 'Ingest_LDD'
    addIngestLDDNode($DOC_LDD, $rootLDD, "steward_id", $stewardId);
    //  Add the Namespace Id under the root element 'Ingest_LDD'
    addIngestLDDNode($DOC_LDD, $rootLDD, "namespace_id", $nsId);
    //  Add the Comment under the root element 'Ingest_LDD'
    addIngestLDDNode($DOC_LDD, $rootLDD, "comment", $cmt);
    //  Add the Last Modification Date under the root element 'Ingest_LDD'
    //  Get the current date time in GMT time
    $curDateTime = gmdate("Y-m-d\TH:i:s\Z");
    addIngestLDDNode($DOC_LDD, $rootLDD, "last_modification_date_time", $curDateTime);

    //  Remove all of the child nodes that are already in the parent node
    while ($parentNode->firstChild) {
        $parentNode->removeChild($parentNode->firstChild);
    }

    //  Create a DD_Attribute tag for each Attribute node
    foreach ($data as $node){
        addNodeWithComment($parentNode, $node["name"], $node["description"]);

        //  Recurse on the node to add all of its attributes & sub-attributes
        recursivelyAddDDAttributeNode($DOC_LDD, $rootLDD, $userFullName, $node);

        //  The isGroup boolean has been JSON stringified
        if ($node["isGroup"] === "true"){
            foreach ($node["children"] as $child){
                $groupNode = getNode($path."/".$node["name"], "")->item(0);
                addNodeWithComment($groupNode, $child["name"], $child["description"]);
            }
        }
    }

    //  Create the DD_Class & DD_Association tags for each Group node
    foreach ($data as $node){

        //  Recurse on the node to add all of its Classes & sub-Classes
        recursivelyAddDDClassNode($DOC_LDD, $rootLDD, $userFullName, $node);

    }

    $ingestLddXML = $DOC_LDD->saveXML();
    updateIngestLddXML($ingestLddXML);
    $args = array("xml"=>$DOC->saveXML(NULL, LIBXML_NOEMPTYTAG));
    updateLabelXML($args);
}
/**
 * Recurse on the given node to add all of its attributes.
 * @param {DOMNode} DOMDocument for ingestLDD XML document
 * @param {$rootLDD} top-level element for ingestLDD XML document
 * @param {string} $userFullName current user name
 * @param {object} $node node to write a tag out for
 */
function recursivelyAddDDAttributeNode($DOC_LDD, $rootLDD, $userFullName, $node) {
    //  IF the node is a Group
    //  The isGroup boolean has been JSON stringified
        if ($node["isGroup"] === "true"){
            //  For each child in the group
            foreach ($node["children"] as $child) {
                ///addDDAttributeNode($DOC_LDD, $rootLDD, $userFullName, $child);
                //  Recurse on the group's child to add any of its attributes
                recursivelyAddDDAttributeNode($DOC_LDD, $rootLDD, $userFullName, $child);
            }
        } else {
            addDDAttributeNode($DOC_LDD, $rootLDD, $userFullName, $node);
        }

}
/**
 * Recurse on the given node to add all of its Classes.
 * @param {DOMNode} DOMDocument for ingestLDD XML document
 * @param {$rootLDD} top-level element for ingestLDD XML document
 * @param {string} $userFullName current user name
 * @param {object} $node node to write a tag out for
 */
function recursivelyAddDDClassNode($DOC_LDD, $rootLDD, $userFullName, $node) {
    //  IF the node is a Group
    //  The isGroup boolean has been JSON stringified
    if ($node["isGroup"] === "true"){
        //  Write a DD_Class tag
        addDDClassNode($DOC_LDD, $rootLDD, $userFullName, $node);

        //  For each child in the group
        foreach ($node["children"] as $child) {
            //  Recurse on the group's child to add any of its Classes
            recursivelyAddDDClassNode($DOC_LDD, $rootLDD, $userFullName, $child);
        }
    }
}
/**
 * Add a DD_Attribute tag for the given node to the specified root element.
 * @param {DOMNode} DOMDocument for ingestLDD XML document
 * @param {$rootLDD} top-level element for ingestLDD XML document
 * @param {string} $userFullName current user name
 * @param {object} $node node to write a tag out for
 */
function addDDAttributeNode($DOC_LDD, $rootLDD, $userFullName, $node){
    //  Create a DD_Attribute node
    $ddAttributeNode = $DOC_LDD->createElement("DD_Attribute");
    //  Put DD_Attribute under the root
    $rootLDD->appendChild($ddAttributeNode);

    //  Add a node for the DD_Attribute's name attribute
    addIngestLDDNode($DOC_LDD, $ddAttributeNode, "name", $node["name"]);
    //  Add a node for the DD_Attribute's Version Id attribute
    addIngestLDDNode($DOC_LDD, $ddAttributeNode, "version_id", "1.0");
    //  Add a node for the DD_Attribute's Local Identifier attribute
    addIngestLDDNode($DOC_LDD, $ddAttributeNode, "local_identifier", $node["name"]);
    //  Add a node for the DD_Attribute's nillable attribute
    addIngestLDDNode($DOC_LDD, $ddAttributeNode, "nillable_flag", $node["nullable"]);
    //  Add a node for the DD_Attribute's Submitter Name attribute
    if ($userFullName != null) {
        addIngestLDDNode($DOC_LDD, $ddAttributeNode, "submitter_name", $userFullName);
    }
    //  Add a node for the DD_Attribute's definition attribute
    addIngestLDDNode($DOC_LDD, $ddAttributeNode, "definition", $node["description"]);

    //  Create a DD_Value_Domain node
    $ddValueDomainNode = $DOC_LDD->createElement("DD_Value_Domain");
    //  Put DD_Value_Domain under DD_Attribute
    $ddAttributeNode->appendChild($ddValueDomainNode);

    //  Add a node for the DD_Value_Domain's Enumeration Flag attribute
    addIngestLDDNode($DOC_LDD, $ddValueDomainNode, "enumeration_flag", $node["enumFlag"]);
    //  Add a node for the DD_Value_Domain's Data Type attribute
    addIngestLDDNode($DOC_LDD, $ddValueDomainNode, "value_data_type", $node["dataType"]);
    //  TODO:  Add a node for the DD_Value_Domain's Minimum Characters attribute???

    //  Add a node for the DD_Value_Domain's Unit of Measure attribute
    addIngestLDDNode($DOC_LDD, $ddValueDomainNode, "unit_of_measure_type", $node["unitType"]);

    //  IF the Enumeration Flag is "true" string
    if ($node["enumFlag"] === "true") {
        //  Parse the Permissible Values as a comma-separated list
        $permissibleValueArray = explode(",", $node["permissibleValues"]);
        //  For each Permissible Value in the array
        foreach ($permissibleValueArray as $permissibleValue) {
            $permissibleValue = trim($permissibleValue);

            //  Create a DD_Permissible_Value node
            $ddPermissibleValueNode = $DOC_LDD->createElement("DD_Permissible_Value");
            //  Put DD_Permissible_Value under DD_Value_Domain
            $ddValueDomainNode->appendChild($ddPermissibleValueNode);

            //  Add a node for the DD_Permissible_Value's Value attribute
            addIngestLDDNode($DOC_LDD, $ddPermissibleValueNode, "value", $permissibleValue);
        }
    }

}
/**
 * Add a DD_Class tag for the given node to the specified root element.
 * @param {DOMNode} DOMDocument for ingestLDD XML document
 * @param {$rootLDD} top-level element for ingestLDD XML document
 * @param {string} $userFullName current user name
 * @param {string} $node node to write a tag out for
 */
function addDDClassNode($DOC_LDD, $rootLDD, $userFullName, $node){
    //  Create a DD_Class node
    $ddClassNode = $DOC_LDD->createElement("DD_Class");
    //  Put DD_Class under the root
    $rootLDD->appendChild($ddClassNode);

    //  Add a node for the DD_Class's name attribute
    addIngestLDDNode($DOC_LDD, $ddClassNode, "name", $node["name"]);
    //  Add a node for the DD_Class's Version Id attribute
    addIngestLDDNode($DOC_LDD, $ddClassNode, "version_id", "1.0");
    //  Add a node for the DD_Class's Local Identifier attribute
    addIngestLDDNode($DOC_LDD, $ddClassNode, "local_identifier", $node["name"]);
    //  Add a node for the DD_Class's Submitter Name attribute
    if ($userFullName != null) {
        addIngestLDDNode($DOC_LDD, $ddClassNode, "submitter_name", $userFullName);
    }
    //  Add a node for the DD_Class's definition attribute
    addIngestLDDNode($DOC_LDD, $ddClassNode, "definition", $node["description"]);

    //  For each child in the group
    foreach ($node["children"] as $child) {
        //  Write a DD_Association tag

        //  Create a DD_Association node
        $ddAssociationNode = $DOC_LDD->createElement("DD_Association");
        //  Put DD_Association under DD_Class
        $ddClassNode->appendChild($ddAssociationNode);

        //  Add a node for the DD_Association's Local Identifier attribute
        addIngestLDDNode($DOC_LDD, $ddAssociationNode, "local_identifier", $child["name"]);
        //  Add a node for the DD_Association's Reference Type attribute
        $referenceType = "attribute_of";
        //  IF the child is a Group
        if ($child["isGroup"] === "true") {
            $referenceType = "component_of";
        }
        addIngestLDDNode($DOC_LDD, $ddAssociationNode, "reference_type", $referenceType);
        //  Add a node for the DD_Association's Minimum Occurrences attribute
        addIngestLDDNode($DOC_LDD, $ddAssociationNode, "minimum_occurrences", $child["minOccurrences"]);
        //  Add a node for the DD_Association's Maximum Occurrences attribute
        addIngestLDDNode($DOC_LDD, $ddAssociationNode, "maximum_occurrences", $child["maxOccurrences"]);

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
/**
 * Add nodes with associated values to the specified parent element.
 * @param {DOMNode} $parent node to add the new node to
 * @param {string} $nodeName name of the new node
 * @param {string} $value value of the new node
 */
function addIngestLDDNode($docLDD, $parent, $nodeName, $value){
    ///global $DOC;
    $newNode = $docLDD->createElement($nodeName);
    ///addNodeValue($newNode, $value);
    $valNode = $docLDD->createTextNode($value);
    $newNode->appendChild($valNode);
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
            //  Update the text value of this node
            updateNodeValue($node, $args["value"]);
            //  IF a Unit is specified
            if (isset($args["unit"]) && (!empty($args["unit"]))) {
                //  Update the Unit attribute of the node
                $node->setAttribute("unit", $args["unit"]);
            }
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
        case "nucspec":
            array_unshift($filtArr, "nucspec:GRNS_Observation_Properties");
            break;
        case "msn":
            array_unshift($filtArr, "msn:Mission_Information");
            break;
        case "msn_surface":
            array_unshift($filtArr, "msn_surface:Surface_Mission_Parameters");
            break;
        case "img_surface":
            array_unshift($filtArr, "img_surface:Surface_Imaging");
            break;
        case "sp":
            array_unshift($filtArr, "sp:Spectral_Characteristics");
            break;
        case "msss_cam_mh":
            array_unshift($filtArr, "msss_cam_mh:MSSS_Camera_Mini_Header");
            break;
        case "survey":
            array_unshift($filtArr, "survey:Survey");
            break;
        case "speclib":
            array_unshift($filtArr, "speclib:Spectral_Library_Product");
            break;
        case "proc":
            array_unshift($filtArr, "proc:Processing_Information");
            break;
        default:
            return $filtArr;
    }
    return $filtArr;
}

/**
 * Add node(s) to the specified XML document.
 * @param {object} $args object containing the node path, number of nodes to add,
 * the namespace of the node, and the value (if any) to insert in the node.
 */
function addNodeLocal($args){
//    global $DOC;
    $nodePath = $args["path"];
    $quantity = $args["quantity"];
    $ns = $args["ns"];
    $doc = $args["xmlDoc"];
    list($nodeName, $nodePath) = handlePath($nodePath, $ns, isset($args["root_discipline_node"]), false);


    if (isNonDefaultNamespace($ns)){
        // make sure discipline root node exists
        $nodeName = $ns.":".$nodeName;
    }
    $nodes = getNodeLocal($nodePath, $ns, $doc);

    // Only change the node(s) value below
    if(isset($args["value_only"])) {
        foreach($nodes as $parent_node) {
            if ($parent_node->hasChildNodes()) {
                //  The updated value will now be set even if there is only 1 attribute w/ a non-zero quantity on the page
                ///if ($parent_node->childNodes->length > 1) {
                if ($parent_node->childNodes->length >= 1) {
                    foreach ($parent_node->childNodes as $child_node) {
                        if ($child_node->nodeName == $nodeName) {
                            //  Update the text value of this node
                            //  Setting the nodeValue attribute wipes out the child nodes of this node
                            ///$child_node->nodeValue = $args["value"];
                            updateNodeValueLocal($child_node, $args["value"], $doc);
                            //  IF a Unit is specified
                            if (isset($args["unit"]) && (!empty($args["unit"]))) {
                                //  Set the Unit attribute of the node
                                $child_node->setAttribute("unit", $args["unit"]);
                            } else {
                                //  Remove the Unit attribute of the node
                                $child_node->removeAttribute("unit");
                            }

                        }
                    }
                }
            }
        }
        $args = array("xml"=>$doc->saveXML(NULL, LIBXML_NOEMPTYTAG));
//        updateNodeValue();
//        updateLabelXML($args);
        return $doc;
    }


    if($nodes->length == 0 && isNonDefaultNamespace($ns)) {
        // Create ns root node
        $root_discipline_node = prependDisciplineRootNode(array(), $ns);
        if(count($root_discipline_node) == 1) {
            $newNode = $doc->createElementNS("http://pds.nasa.gov/pds4/$ns/v1", $root_discipline_node[0]);
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


                    if($child_node->nodeName == $nodeName) {
                        $total_instances_of_node++;
                        $node_to_insert_before = $child_node;
                        $node_has_children = $node_to_insert_before->hasChildNodes();
                        //  Update the text value of this node
                        //  Setting the nodeValue attribute wipes out the child nodes of this node
                        ///$child_node->nodeValue = $args["value"];
                        updateNodeValue($child_node, $args["value"]);
                    }
                }
            }
        }
        print "\ntotal instances of node $total_instances_of_node\n";
        for ($x = $total_instances_of_node; $x < $quantity; $x++){
            if (isNonDefaultNamespace($ns)) {
                $newNode = $doc->createElementNS("http://pds.nasa.gov/pds4/$ns/v1", $nodeName);
            } else {
                $newNode = $doc->createElement($nodeName);
            }

            //  IF a Unit is specified
            if (isset($args["unit"]) && (!empty($args["unit"]))) {
                //  Add a Unit attribute to the node
                $newNode->setAttribute("unit", $args["unit"]);
            }

            addNodeValueLocal($newNode, $args["value"], $doc);


            if(is_null($node_to_insert_before)) {
                $parent_node->appendChild($newNode);

                // SOMETHING WRONG WITH CODE BELOW - used to clone an already added class when more are added later

            } else {
                if($node_has_children) {
                    $node_cloned = $node_to_insert_before->cloneNode(true);
                    $parent_node->insertBefore($node_cloned, $node_to_insert_before);
                } else {
                    $parent_node->insertBefore($newNode, $node_to_insert_before);
                }
            }
        }
    }
    $args = array("xml"=>$doc->saveXML(NULL, LIBXML_NOEMPTYTAG));
//    updateLabelXML($args);
    return $doc;
}