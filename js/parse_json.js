/**
 * Created by morse on 7/5/16.
 */

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

function parseJSON(file, productType){
    loadJSON(file, function(data){
        var obj = JSON.parse(data);
        obj = (obj.length === 1 ? obj[0] : obj);
        console.log(obj);
        if ("dataDictionary" in obj){
            var dataDict = obj["dataDictionary"];
            if ("classDictionary" in dataDict){
                var classDict = dataDict["classDictionary"];
                for (var key in classDict){
                    var classObj = classDict[key]["class"];
                    var product = "Product_" + productType;
                    if (classObj["title"] === product){
                        var assocList = classObj["associationList"];
                        for (var key in assocList){
                            var child = assocList[key]["association"];
                            console.log(child["identifier"]);
                        }
                    }
                }
            }
        }
    });
}