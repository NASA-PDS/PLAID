/**
 * Created by morse on 7/5/16.
 */

$(document).ready(function(){
    JSONOBJ = getJSON("config/PDS4DD_JSON_140204.JSON");
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
* Once the user has selected a product type, loop through the JSON
* to find the entry for that type. Then find the associations with that
* product type.
* @param {Object} object JSON object to search
* @param {string} productType product type string chosen by user
*/
function getProductType(object, productType){
    if ("dataDictionary" in object){
        var dataDict = object["dataDictionary"];
        if ("classDictionary" in dataDict){
            var classDict = dataDict["classDictionary"];
            for (var key in classDict){
                var classObj = classDict[key]["class"];
                var product = "Product_" + productType;
                if (classObj["title"] === product){
                    var assocList = classObj["associationList"];
                    var productObj = {};
                    getAssociations(object, assocList, productObj, 0);
                    console.log(productObj);
                }
            }
        }
    }
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
    for (var key in associationList){
        var child = associationList[key]["association"];
        var title = child["title"];
        var isAttr = (child["isAttribute"] === "true");
        if (isAttr){
            var attr = getAttribute(object, title);
            currObj[orderNum + title] = attr;
            determineRequirements(child, currObj[orderNum + title]);
        }
        else{
            title = handleSpecialCases(title);
            var classObj = getClass(object, title);
            var modTitle = orderNum + title;
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
* Due to the structure and labelling within the PDS JSON, there are
* some special cases that need to be handled accordingly (in order
* to properly match associations to other objects).
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
* Search the specified object for a given class entry.
* @param {Object} object object to search through
* @param {string} className name of the class to search for
* @return {Object} object corresponding to the specified class name
*/
function getClass(object, className){
    if ("dataDictionary" in object){
        var dataDict = object["dataDictionary"];
        if ("classDictionary" in dataDict){
            var classDict = dataDict["classDictionary"];
            for (var key in classDict){
                var classObj = classDict[key]["class"];
                if (classObj["title"].toLowerCase() === className.toLowerCase()){
                    return (classObj);
                }
            }
        }
    }
}
/*
 * Search the specified object for a given attribute entry.
 * @param {Object} object object to search through
 * @param {string} attribute name of the attribute to search for
 * @return {Object} object corresponding to the specified attribute name
 */
function getAttribute(object, attribute){
    if ("dataDictionary" in object){
        var dataDict = object["dataDictionary"];
        if ("attributeDictionary" in dataDict){
            var attrDict = dataDict["attributeDictionary"];
            for (var key in attrDict){
                var attrObj = attrDict[key]["attribute"];
                if (attrObj["title"].toLowerCase() === attribute.toLowerCase()){
                    return (attrObj);
                }
            }
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
        var range = (min === max ? "required" : min+"-"+max);
        assocDetails["range"] = range;
    }
}