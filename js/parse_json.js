/**
 * Created by morse on 7/5/16.
 */
$(document).ready(function(){
    jsonData.pds4Obj = getJSON(filePaths.PDS4_JSON);
});
/*
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
/*
* Get the text contents from the specified JSON file and store them in
* a JavaScript Object.
* @param {string} file path to the JSON file
*/
function getJSON(file){
    var obj = {};
    loadJSON(file, function(data){
        obj = JSON.parse(data);
    });
    return (obj.length === 1 ? obj[0] : obj);
}
/*
 * Search the specified object for an element of a specified type.
 * @param {Object} object object to search through
 * @param {string} type ["class" | "attribute" | "product" | nodeName]
 * @param {string} dictName name of the dictionary to search in
 * @param {string} elementName id/name of the element to search for
 * @return {Object} object corresponding to the specified class name
 */
function getElement(outerObj, type, dictName, elementName){
    if ("dataDictionary" in outerObj){
        var dataDict = outerObj["dataDictionary"];
        if (dictName in dataDict){
            var dict = dataDict[dictName];
            for (var key in dict){
                var specifier = dictName.replace("Dictionary", "");
                var innerObj = dict[key][specifier];
                if (innerObj["identifier"] === elementName){
                    if (type === "class" || type === "attribute"){
                        return innerObj;
                    }
                    else {
                        handleProductOrNode(outerObj, innerObj);
                        return;
                    }
                }
            }
        }
    }
}
/*
 * Once the product or discipline node object has been found in the overall JSON object, get the
 * associations and start creating corresponding steps in the wizard.
 * @param {Object} object JSON object to search
 * @param {Object} element object containing the overall info for the product or node
 */
function handleProductOrNode(overallObj, element){
    var assocList = element["associationList"];
    var elementObj = {};
    getAssociations(overallObj, assocList, elementObj, 0);
    jsonData.refObj = elementObj;
    insertLevelOfSteps(wizardData.currentStep+1, jsonData.refObj);

}
/*
* Recursively search for associations to a class.
* @param {Object} object JSON object to search through
* @param {array} associationList list of association objects to search for
* @param {Object} currObj object to store each child of the overall product type, maintaining relations
* @param {Number} orderNum integer to track the ordering of child elements
* Note: orderNum is necessary to preserve the order of child elements in the object. Otherwise,
* the order would be determined alphabetically in the "next" object. This order is important to
* maintain as it reflects the definitions in the PDS4 XML schema.
*/
function getAssociations(object, associationList, currObj, orderNum){
    for (var index in associationList){
        var child = associationList[index]["association"];
        var isAttr = (child["isAttribute"] === "true");
        var identifier = "", title = "";
        if (isAttr){
            try {
                identifier = child["attributeIdentifier"][0];
            }
            catch (e){
                identifier = child["attributeId"][0];
            }
            title = identifier.split(".").pop();
            var attr = getElement(object, "attribute", "attributeDictionary", identifier);
            currObj[orderNum + title] = attr;
            determineRequirements(child, currObj[orderNum + title]);
        }
        else{
            try {
                identifier = child["classIdentifier"][0];
            }
            catch (e){
                identifier = child["classId"][0];
            }
            title = identifier.split(".").pop();
            var classObj = getElement(object, "class", "classDictionary", identifier);
            var modTitle = orderNum + title;
            //use Object.assign to make a copy of the object
            //this prevents overwriting the original object in future modifications
            currObj[modTitle] = Object.assign(classObj);
            currObj[modTitle]["next"] = {};
            determineRequirements(child, currObj[modTitle]);
            if (classObj["associationList"]){
                getAssociations(object, classObj["associationList"], currObj[modTitle]["next"], 0);
                assignObjectPath(currObj[modTitle], currObj[modTitle]["next"]);
            }
        }
        orderNum += 1;
    }
}
/*
* Recursively add an attribute to each element in the overall object that specifies
* the path (in terms of the hierarchy) from the root of the object to that element.
* This function is recursive to revert incorrect ordering from original call.
* Note: Since this function goes through all the children of an object, it also checks
* to see if any of the children are optional and sets the "allChildrenRequired" attribute
* accordingly.
* @param {Object} currentObject to get preceding path from
* @param {Object} children to add full path to
 */
function assignObjectPath(currObject, children){
    if (currObject["path"] === undefined){
        currObject["path"] = currObject["title"];
    }
    var path = currObject["path"];
    currObject["allChildrenRequired"] = true;
    for (var key in children){
        if (!children[key]["isRequired"]) { currObject["allChildrenRequired"] = false; }
        children[key]["path"] = path + "/" + children[key]["title"];
        if (children[key]["next"]){
            assignObjectPath(children[key], children[key]["next"]);
        }
    }
}
/*
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