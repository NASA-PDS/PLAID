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
 * @file Contains the primary functions for searching the PDS4 and discipline node JSONS
 * and storing the necessary data for the wizard in a new JSON for easier/quicker reference.
 *
 * Creation Date: 7/5/16.
 *
 * @author Trevor Morse
 * @author Michael Kim
 * @author Stirling Algermissen
 */

/**
* Read in the text from a file as a JSON.
* Modified from: https://codepen.io/KryptoniteDove/post/load-json-file-locally-using-pure-javascript
* @param {string} file path to the file for reading
* @param {function} callback
*/
function loadJSON(file, callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', file, false);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a
            // value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}
/**
* Get the text contents from the specified JSON file and store them in
* a JS Object.
* @param {string} file path to the JSON file
*/
function getJSON(file){
    var obj = {};
    loadJSON(file, function(data){
        obj = JSON.parse(data);
    });
    return obj.length === 1 ? obj[0] : obj;
}
/**
 * Search the specified object for an element of a specified type.
 * @param {Object} outerObj object to search through
 * @param {string} type ["class" | "attribute" | "product" | nodeName]
 * @param {string} dictName name of the dictionary to search in
 * @param {string} elementName PDS4 identifier of the element to search for
 * @return {Object} object corresponding to the specified class name
 */
function getElementFromDict(outerObj, type, dictName, elementName){
    if ("dataDictionary" in outerObj){
        var dataDict = outerObj["dataDictionary"];
        if (dictName in dataDict){
            var dict = dataDict[dictName];
            for (var key in dict){
                var specifier = dictName.replace("Dictionary", "");
                var innerObj = dict[key][specifier];
                if (innerObj["identifier"] === elementName){
                    // if a class or attribute is what you are looking for,
                    // return the object you already have
                    if (type === "class" || type === "attribute"){
                        return innerObj;
                    } else { // otherwise you are trying to extract the node dictionary data
                        console.log('Unknown type: ' + type);
                        return;
                    }
                    // else {
                    //     if (innerObj["nameSpaceId"] !== jsonData.currNS){
                    //         jsonData.currNS = innerObj["nameSpaceId"];
                    //         jsonData.namespaces.push(innerObj["nameSpaceId"]);
                    //     }
                    //     jsonData.currNode = type;
                    //     handleProductOrNode(outerObj, innerObj, type);
                    // }
                }
            }
        }
    }
}

// getElement(g_jsonData.nodes[nodeName], nodeName, "classDictionary", nodeId);
function setDisciplineDict(nodeName, nodeId) {
    // Set the parent node-specific data dictionary object
    // TODO - this should probably be changed to use one central IM unless a specific
    // updated node dictionary is specified. This currently reads in dictionaries for
    // each node separately, when they may be the 'same'
    g_jsonData.searchObj = g_jsonData.nodes[nodeName];
    var parentObj = g_jsonData.nodes[nodeName];

    // Set the class dictionary intermediate object to loop through
    var intermObj = parentObj['dataDictionary']['classDictionary'];

    var found = 0;
    var childObj = {};
    for (var key in intermObj) {
        // Looking for the child class for this specific node
        childObj = intermObj[key]['class'];

        // If the dictionary is the namespace we are looking for
        if (childObj["identifier"] === nodeId) {
            found = 1;
            // If this new discipline dictionary NS has not already been added
            // to the state
            currNS = g_jsonData.namespaces[g_state.nsIndex];
            newNS = childObj["nameSpaceId"];
            if (g_jsonData.namespaces.indexOf(newNS) == -1) {
            // if ( !== currNS) {
                g_state.nsIndex = 1;
                g_jsonData.namespaces.splice(g_state.nsIndex, 0, newNS);
            }

            // g_state.currNode = g_jsonData.namespaces[g_state.nsIndex];
            // g_state.currNS
            // handleProductOrNode(outerObj, innerObj, type);

            var assocList = childObj["associationList"];


            g_jsonData.refObj = {};

            // Grab the generalization
            for(var k = 0; k < assocList.length; k++) {
                if(assocList[k]["association"]["assocType"] == "parent_of") {
                    var generalization = assocList.splice(k, 1)[0];//["association"]["attributeId"][0];
                    // first see if the parent exists
                  //  var findParent = g_jsonData.generalization.first(function(node) {
                    //    return node.model.id == generalization;
                    //});
                    //if(findParent) {

                    //}

                }
            }

            //get initial associations for creating main steps
            getAssociations(parentObj, childObj, g_jsonData.refObj);
            //get next two levels of associations for creating element-bars and
            //displaying subelement information in the popovers
            getLevelOfAssociations(parentObj, g_jsonData.refObj, true);
            // insertStep($("#wizard"), wizardData.currentStep+1, g_jsonData.refObj);

            break;
        }
    }
    if(!found && nodeName != "pds") {
        // Couldn't find the specified element... need to determine by looking at json
        var objectToReturn = {};
        var splitOutNamespace = nodeId.substr(0, nodeId.lastIndexOf("."));
        var nodeNS = splitOutNamespace.substr(splitOutNamespace.lastIndexOf(".")+1, splitOutNamespace.length);
        objectToReturn["associationList"] = [];
        var specifier = nodeName.replace("Dictionary", "");
        // collect objects from namespace
        for (var key in intermObj){
            var innerObj = intermObj[key]["class"];
            if(innerObj["identifier"].indexOf(splitOutNamespace) != -1 && (innerObj["identifier"].match(/\./g)||[]).length == 2) {
                // Upper level node that matches namespace
                console.log(innerObj["identifier"]);
                console.log(innerObj);
                var associationToInsert = {};
                associationToInsert["association"] = {};
                associationToInsert["association"]["isAttribute"] = "false";
                associationToInsert["association"]["classId"] = [];
                associationToInsert["association"]["classId"].push(innerObj["identifier"]);
                associationToInsert["association"]["minimumCardinality"] = "0";
                associationToInsert["association"]["maximumCardinality"] = "1";
                objectToReturn["associationList"].push(associationToInsert);

            }
        }
        if(objectToReturn["associationList"].length > 0) {
            if (g_jsonData.namespaces.indexOf(nodeNS) == -1) {
                g_state.nsIndex = 1;
                g_jsonData.namespaces.splice(g_state.nsIndex, 0, nodeNS);
            }
        }


        var assocList = objectToReturn["associationList"];
        g_jsonData.refObj = {};

        // Grab the generalization
        for(var k = 0; k < assocList.length; k++) {
            if(assocList[k]["association"]["assocType"] == "parent_of") {
                objectToReturn.generalization = assocList.splice(k, 1)[0];
            }
        }

        //get initial associations for creating main steps
        getAssociations(parentObj, objectToReturn, g_jsonData.refObj);
        //get next two levels of associations for creating element-bars and
        //displaying subelement information in the popovers
        getLevelOfAssociations(parentObj, g_jsonData.refObj, true);
        // insertStep($("#wizard"), wizardData.currentStep+1, g_jsonData.refObj);

       // handleProductOrNode(outerObj, objectToReturn, type);
    }
}

/**
 * Once the product or discipline node object has been found in the overall JSON object, get the
 * associations and start creating corresponding steps in the wizard.
 * Note: g_jsonData.refObj is the newly formed object that is used for storing the necessary
 * data for the wizard and quicker searching.
 * @param {Object} overallObj JSON object to search
 * @param {Object} element object containing the overall info for the product or node
 * @param {string} type
 */
// function handleProductOrNode(overallObj, element, type){
//     var assocList = element["associationList"];
//     g_jsonData.refObj = {};
//     //get initial associations for creating main steps
//     getAssociations(overallObj, assocList, g_jsonData.refObj);
//     //get next two levels of associations for creating element-bars and
//     //displaying subelement information in the popovers
//     getLevelOfAssociations(overallObj, g_jsonData.refObj, true);
//     insertStep($("#wizard"), wizardData.currentStep+1, g_jsonData.refObj);
// }
/**
* Search for and form associations in the new object from the overall object.
* @param {Object} object JSON object to search through
* @param {Array} associationList list of association objects to search for
* @param {Object} currObj object to store each child element in, maintaining relations
*/
function getAssociations(object, nodeObj, currObj){
    var associationList = nodeObj["associationList"];
    for (var index in associationList){
        var child = associationList[index]["association"];
        var isAttr = (child["isAttribute"] === "true");
        var identifiers = [], title = "";
        currObj[index] = [];


      //  if(child["identifier"].startsWith())

        if (isAttr){
            identifiers = child["attributeIdentifier"];
            if (identifiers === undefined) { identifiers = child["attributeId"]; }
            for (var attIndex in identifiers){
                title = identifiers[attIndex].split(".").pop();
                currObj[index][title] = getElementFromDict(object, "attribute", "attributeDictionary", identifiers[attIndex]);
                determineRequirements(child, currObj[index][title]);
            }
        } else {
            identifiers = child["classIdentifier"];
            if (identifiers === undefined) { identifiers = child["classId"]; }
            for (var clIndex in identifiers){
                title = identifiers[clIndex].split(".").pop();
                var classObj = getElementFromDict(object, "class", "classDictionary", identifiers[clIndex]);
                //use Object.assign to make a copy of the object
                //this prevents overwriting the original object in future modifications
                currObj[index][title] = Object.assign({}, classObj);
                currObj[index][title]["next"] = {};
                determineRequirements(child, currObj[index][title]);
            }
        }
    }
}
/**
 * Loop through a layer of associations to get their subsequent associations.
 * This has the option of being recursive, but only for one execution. Due to the size
 * and hierarchy of the JSONs this works with, it needs to be mostly iterative to maintain
 * performance and not blow the call stack.
 * @param {Object} searchObj object to search through for association objects
 * @param {Array} nextObjs list of objects to find associations for
 * @param {bool} exeTwice specifies whether to recurse once or not
 */
function getLevelOfAssociations(searchObj, nextObjs, exeTwice){
    for (var index in nextObjs){
        for (var key in nextObjs[index]){
            var currObj = nextObjs[index][key];
            if(typeof currObj["associationList"] != 'undefined') {
                for (var k = 0; k < currObj["associationList"].length; k++) {
                    if (currObj["associationList"][k]["association"]["assocType"] == "parent_of") {
                        currObj.generalization = currObj["associationList"].splice(k, 1)[0];
                    }
                }
            }

            getAssociations(searchObj, currObj, currObj["next"]);
            assignObjectPath(index, currObj, currObj["next"]);
            if (exeTwice) {
                getLevelOfAssociations(searchObj, currObj["next"], false);
            }
        }
    }
}
/**
* Loop through all of the children of an object and add their respective paths (formed
* from the parent path).
* Note: Since this function goes through all the children of an object, it also checks
* to see if any of the children are optional and sets the "allChildrenRequired" attribute
* accordingly.
* Also, this path will be used as the ID of the corresponding HTML element for the object.
* @param {number} startingIndex index for the first level of children in the refObject
* @param {Object} currObject to get preceding path from
* @param {Object} children to add full path to
 */
function assignObjectPath(startingIndex, currObject, children){
    if (currObject["path"] === undefined){
        currObject["path"] = startingIndex.toString() + "/" + currObject["title"];
    }
    var path = currObject["path"];
    currObject["allChildrenRequired"] = true;
    for (var index in children){
        for (var key in children[index]){
            if (children[index][key]){
                if (!children[index][key]["isRequired"]) { currObject["allChildrenRequired"] = false; }
                if(typeof children[index][key]["path"] == 'undefined') { // is there a better check here? seems like we only want to update when the base of the path matches.
                    children[index][key]["path"] = path + "/" + index.toString() + "/" + children[index][key]["title"];
                }
            }
        }
    }
}
/**
 * Use the specified path to traverse to the object reference and return it.
 * @param path
 * @returns {g_jsonData.refObj|{}}
 */
function getObjectFromPath(path, refObj){
    var elementKeys = path.split("/");
    var currObj = refObj;
    var nextDictInfo = {};
    for (var index in elementKeys){
        try {
            currObj = currObj[elementKeys[index]];
        } catch(e){
            return;
        }

        // If currObj is undefined, we can assume there is more to traverse through, but we are not in the right
        // dictionary. Need to switch to another node dictionary.
        if ( currObj === undefined ) {
            g_state.nsIndex++;

            // nextDiscDict = g_jsonData.namespaces[g_state.nsIndex];
            // g_dictInfo is an associative array...
            nextDictInfo = g_dictInfo[g_jsonData.namespaces[g_state.nsIndex]];

            setDisciplineDict(nextDictInfo['name'], nextDictInfo['base_class']);
            return getObjectFromPath(path, g_jsonData.refObj);
        }
        if (index < elementKeys.length-1 && isNaN(elementKeys[index])) {
            currObj = currObj["next"];
        }
    }
    return currObj;
}

/**
* Using the values stored in the association list objects (assocMention), determine
* whether the association is required, set the range, and store the info in the
* detailed object for that association (assocDetails).
* @param {Object} assocMention
* @param {Object} assocDetails
 */
function determineRequirements(assocMention, assocDetails){
    if (assocMention && assocDetails){
        var min = assocMention["minimumCardinality"];
        var max = assocMention["maximumCardinality"];
        assocDetails["range"] = min + "-" + max;
        assocDetails["isRequired"] = (min === max);
        assocDetails["classOrder"] = assocMention["classOrder"];
    }
}
