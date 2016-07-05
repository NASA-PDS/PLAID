/**
 * Created by morse on 7/5/16.
 */

$(document).ready(function(){
    JSONOBJ = getJSON("config/PDS4DD_JSON_140204.JSON");
    console.log(JSONOBJ);
    //getProductType(JSONOBJ, "Observational");
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
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

function getJSON(file){
    var obj = {};
    loadJSON(file, function(data){
        obj = JSON.parse(data);
    });
    return (obj.length === 1 ? obj[0] : obj);
}

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
                    getAssociations(object, assocList, "");
                }
            }
        }
    }
}

function getAssociations(object, associationList, tabbing){
    tabbing += "-";
    for (var key in associationList){
        var child = associationList[key]["association"];
        var title = child["title"];
        console.log(tabbing + title);
        var isAttr = (child["isAttribute"] === "true");
        if (isAttr){
            var attr = getAttribute(object, title);
        }
        else{
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
            var classObj = getClass(object, title);
            if (classObj["associationList"]){
                getAssociations(object, classObj["associationList"], tabbing);
            }
        }
    }
}

function getClass(object, className){
    if ("dataDictionary" in object){
        var dataDict = object["dataDictionary"];
        if ("classDictionary" in dataDict){
            var classDict = dataDict["classDictionary"];
            for (var key in classDict){
                var classObj = classDict[key]["class"];
                if (classObj["title"].toLowerCase() === className.toLowerCase()){
                    //console.log(classObj);
                    return (classObj);
                }
            }
        }
    }
}

function getAttribute(object, attribute){
    if ("dataDictionary" in object){
        var dataDict = object["dataDictionary"];
        if ("attributeDictionary" in dataDict){
            var attrDict = dataDict["attributeDictionary"];
            for (var key in attrDict){
                var attrObj = attrDict[key]["attribute"];
                if (attrObj["title"].toLowerCase() === attribute.toLowerCase()){
                    //console.log(attrObj);
                    return (attrObj);
                }
            }
        }
    }
}