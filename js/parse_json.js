/**
 * Created by morse on 7/5/16.
 */
$(document).ready(function(){
    JSONOBJ = getJSON(filePaths.PDS4_JSON);
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
 * @param {string} type ["class" | "attribute" | "product"]
 * @param {string} dictName name of the dictionary to search in
 * @param {string} elementName name of the element to search for
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
                //must convert to lower case to accurately compare across inconsistencies in PDS
                if (innerObj["title"].toLowerCase() === elementName.toLowerCase()){
                    if (type === "class" || type === "attribute"){
                        return innerObj;
                    }
                    else if (type === "product"){
                        handleProduct(outerObj, innerObj);
                        return;
                    }
                }
            }
        }
    }
}
/*
 * Once the product object has been found in the overall JSON object, get the associations
 * and start creating corresponding steps in the wizard.
 * @param {Object} object JSON object to search
 * @param {Object} product object containing the overall info for the product
 */
function handleProduct(overallObj, product){
    var assocList = product["associationList"];
    var productObj = {};
    getAssociations(overallObj, assocList, productObj, 0);
    //this adds the first level of steps to the wizard
    //TODO: determine when/how to insert the next level of steps
    //TODO(cont): will need to track current level in the object
    //TODO(cont): also, be able to back out to previous level(s) once the user finishes a level
    insertLevelOfSteps(1, productObj);
}
/*
* Recursively search for associations to a class. Has to handle
* some special cases due to the structure of the PDS XML/JSON.
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
        var title = child["title"];
        var isAttr = (child["isAttribute"] === "true");
        if (isAttr){
            var attr = getElement(object, "attribute", "attributeDictionary", title);
            currObj[orderNum + title] = attr;
            determineRequirements(child, currObj[orderNum + title]);
        }
        else{
            title = handleSpecialCases(title);
            var classObj = getElement(object, "class", "classDictionary", title);
            var modTitle = orderNum + title;
            //use Object.assign to make a copy of the object
            //this prevents overwriting the original object in future modifications
            currObj[modTitle] = Object.assign(classObj);
            currObj[modTitle]["next"] = {};
            determineRequirements(child, currObj[modTitle]);
            if (classObj["associationList"]){
                getAssociations(object, classObj["associationList"], currObj[modTitle]["next"], 0);
            }
        }
        orderNum += 1;
    }
}
/*
* Due to some inconsistencies in the structure and labelling within the PDS JSON, there are
* some special cases that need to be handled accordingly (in order to properly match
* associations to other objects).
* @param {string} title title of an object to search for
* @return {string} adjusted title for the special case
 */
function handleSpecialCases(title){
    var regex = new RegExp("has_");
    if (title.match(regex)){
        title = title.replace("has_", "");
    }
    if (title === "primary_result_description"){
        title = title.replace("description", "summary");
    }
    else if (title === "Science_Facet"){
        title += "s";
    }
    else if (title === "file_area_supplemental"){
        title = title.replace("_supplemental", "");
    }
    return title;
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