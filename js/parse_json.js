/**
 * @file Contains the primary functions for searching the PDS4 and discipline node JSONS
 * and storing the necessary data for the wizard in a new JSON for easier/quicker reference.
 *
 * Creation Date: 7/5/16.
 *
 * @author Trevor Morse
 * @author Michael Kim
 */
$(document).ready(function(){
    g_jsonData.searchObj = getJSON(filePaths.PDS_JSON);
    g_jsonData.nodes['pds'] = getJSON(filePaths.PDS_JSON);
    g_jsonData.namespaces[0] = 'pds';
});
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
    return (obj.length === 1 ? obj[0] : obj);
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

    var childObj = {};
    for (var key in intermObj) {
        // Looking for the child class for this specific node
        childObj = intermObj[key]['class'];

        // If the dictionary is the namespace we are looking for
        if (childObj["identifier"] === nodeId) {

            // If this new discipline dictionary NS has not already been added
            // to the state
            currNS = g_jsonData.namespaces[g_state.nsIndex];
            newNS = childObj["nameSpaceId"];
            if ($.inArray(newNS, g_jsonData.namespaces) !== true) {
            // if ( !== currNS) {
                g_state.nsIndex = 1;
                g_jsonData.namespaces.splice(g_state.nsIndex, 0, newNS);
            }

            // g_state.currNode = g_jsonData.namespaces[g_state.nsIndex];
            // g_state.currNS
            // handleProductOrNode(outerObj, innerObj, type);

            var assocList = childObj["associationList"];
            g_jsonData.refObj = {};
            //get initial associations for creating main steps
            getAssociations(parentObj, assocList, g_jsonData.refObj);
            //get next two levels of associations for creating element-bars and
            //displaying subelement information in the popovers
            getLevelOfAssociations(parentObj, g_jsonData.refObj, true);
            // insertStep($("#wizard"), wizardData.currentStep+1, g_jsonData.refObj);

            break;
        }
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
function getAssociations(object, associationList, currObj){
    for (var index in associationList){
        var child = associationList[index]["association"];
        var isAttr = (child["isAttribute"] === "true");
        var identifiers = [], title = "";
        currObj[index] = [];
        if (isAttr){
            identifiers = child["attributeIdentifier"];
            if (identifiers === undefined) { identifiers = child["attributeId"]; }
            for (var attIndex in identifiers){
                title = identifiers[attIndex].split(".").pop();
                currObj[index][title] = getElementFromDict(object, "attribute", "attributeDictionary", identifiers[attIndex]);
                determineRequirements(child, currObj[index][title]);
            }
        }
        else{
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
            getAssociations(searchObj, currObj["associationList"], currObj["next"]);
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
                children[index][key]["path"] = path + "/" + index.toString() + "/" + children[index][key]["title"];
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

        // If currObj is undefined, we can assume there is more to traverse through, but we are not in the write
        // dictionary. Need to switch to another node dictionary.
        if ( currObj === undefined ) {
            g_state.nsIndex++;

            // nextDiscDict = g_jsonData.namespaces[g_state.nsIndex];
            nextDictInfo = g_dictInfo[g_jsonData.namespaces[g_state.nsIndex]];

            setDisciplineDict(nextDictInfo['name'], nextDictInfo['base_class']);
            getObjectFromPath(path, g_jsonData.refObj);
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
    }
}
