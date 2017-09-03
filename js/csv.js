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
 * @file Contains the functions utilized in excel spreadsheet import/export.
 *
 * Creation Date: 8/14/2017.
 *
 *
 *
 */

/*
 * Returns a label data that is converted to CSV.
 * Flattening of progressData is done to render attributes and class objects in the desired order.
 *
 * @returns {Object}
 */
function getCSV(){

    var csv = "Class/Attribute ID, Value, Description\n", ordered = [];

    // Reorder progressData objects to list attributes in the way the label XML lists them
    var flattened = flattenProgressData();
    addTreeRelations(flattened);
    sortProgressDataObj(flattened['root']['node'], ordered);

    // console.log('*** flattened:', flattened);
    // console.log('*** ordered:', ordered);


    // convert flattened progressData to CSV
    var index = "";
    ordered.forEach(function(node){
        index = node.getValue();
        if(index !== "root"){
            console.log(flattened[index],' not Leaf? ',!flattened[index]['isLeaf']);
            if(!flattened[index]['isLeaf']){
                val = ' -';
            }else{
                val = flattened[index]['val'];
            }
            csv += index;
            csv += ',' + val;
            csv += ',' + flattened[index]['desc'] +'\n';
        }
    });
    return csv;
}

/*
 * Allows a CSV file download.
 *
 * @param {string} CSV string.
 * @param {string} name of the file to store the CSV file as.
 */
function downloadCSV(csvContentIn, filename){
    csv = 'data:text/csv;charset=utf-8,' + csvContentIn;
    var encodedUri = encodeURI(csv);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
}

/*
 * Allows a label download as a CSV file.
 *
 * @param {string} CSV string.
 * @param {string} name of the file to store the CSV file as.
 */
function tableDownload(){
    downloadCSV(getCSV(), "my_label_datasheet.csv");
}

function flattenProgressData(){
    var flattened = {}, path = "", val = "", i = 0, description = "", currGJsonObj={};
    var desc='', isLeaf=false, csv = "Attribuute ID, Value, Description\n";

    // Iterate through the first level children
    while(i < progressData.length){
        // console.log('i=', i);

        // If this is a Product Type object...
        if(progressData[i].step === 'product_type') {

            // console.log(progressData[i].selection, " is a product type.");
            path = progressData[i].selection;
            currGJsonObj = getObjectFromPath(path, g_jsonData.refObj);
            desc = (currGJsonObj !== null && currGJsonObj !== undefined && typeof currGJsonObj !== "undefined") ? currGJsonObj['description'] : "-";
            flattened["root"] =
                {
                    path: progressData[i].selection,
                    desc: "-",
                    node: new Node("root")
                }
        }

        // If this is a Leaf Node object...
        else if( progressData[i]['step'] === 'optional_nodes' && progressData[i].selection.length > 0 ){
            for(index in progressData[i]['selection']){
                if( progressData[i]['selection'][index]['num'] > 0){
                    // console.log(progressData[i]['selection'][index]);
                    path = progressData[i]['selection'][index]['id'];
                    currGJsonObj = getObjectFromPath(path, g_jsonData.refObj);

                    flattened[progressData[i]['selection'][index]['id']] =
                        {
                            path: path,
                            val: progressData[i]['selection'][index]['val'],
                            currGJsonObj: currGJsonObj,
                            desc: currGJsonObj['description'].replace(/,/g," "),
                            isLeaf: currGJsonObj['next'] === undefined,
                            node: new Node(path)
                        }
                    flattened[path]['node'].setItr(progressData[i]['iteration']);
                }
            }

            // If this is a Mission Specifics object, Discipline Dictionary object, etc FixMe
        } else{
            console.log('skip ', progressData[i]);
        }
        i++;
    }
    return flattened;
}

/*
 * Add parent-child relationships to nodes that correspond to progressData objects.
 *
 * @param {object} key value pairs: { data-pah : progressData }
 */
function addTreeRelations(flattened){
    var node, pathSegments=[], parentPath = "";
    // iterate through flatted progressData
    for(index in flattened){
        node = flattened[index]['node'];

        parentPath = getParentPath(node);
        if(parentPath !== "" && parentPath !== null && parentPath !== undefined){

            if(flattened[parentPath] === null || flattened[parentPath] === undefined || typeof flattened[parentPath] === "undefined"){
                graftMissingNode(flattened, parentPath);
            }
            parent = flattened[parentPath]['node'];
            parent.addChild(node);
        }
    }
}

/*
 * Add missing ancestor node when progressDataObject's parent node is missing. Fixme
 *
 * @param {object} key value pairs: { data-path : progressData }
 * @param {string} data-path of the missing node object
 */
function graftMissingNode(flattened, missingNodeName){

    var parentPath = missingNodeName, currPath=parentPath;

    // Given an orphan node, generate ancestor nodes based on its data-path (e.g. Given "2/Reference_List/0/Internal_Reference", generate)
    while(parentPath !== "root"){

        if(flattened[parentPath] === null || flattened[parentPath] === undefined || typeof flattened[parentPath] === "undefined") {
            flattened[parentPath] = {
                path: parentPath,
                val: "",
                currGJsonObj: {},
                desc: "",
                isLeaf: false,
                node: new Node(parentPath)
            };
        }
        if(parentPath !== currPath){
            flattened[parentPath]['node'].addChild(flattened[currPath]['node']);
        }
        currPath = parentPath;
        parentPath = getParentPath( flattened[parentPath]['node']);

        if(parentPath == "root"){
            flattened[parentPath]['node'].addChild(flattened[currPath]['node']);
        }

    }

}

/*
 * Given a node with a data-path as the value of the corresponding progressData object, it return's the data-path of its parent.
 * i.e.  given "1/Observation_Area/2/Investigation_Area", it returns "1/Observation_Area"
 *
 * @param {object} key value pairs: { data-path : progressData }
 * @param {string} data-path of the missing node object
 */
function getParentPath(node){
    var pathSegments = node.getValue().split('/'), parentPath="";

    // Assign the node's parent's data-path
    if(!pathSegments.includes("root")) {
        parentPath = "";
        for (var i = 0; i < pathSegments.length - 2; i++) {
            if (i < pathSegments.length - 3) {
                parentPath += pathSegments[i] + "/";
            }
            else {
                parentPath += pathSegments[i];
            }
        }
        if (parentPath === "") {
            parentPath = "root";
        }
    }
    return parentPath;
}

/*
 * Parse label CSV that is uploaded and modifies the progressData accordingly.
 */
function processCSVUploaded() {

    $.ajax({
        method: "post",
        url: "php/interact_db.php",
        data: {
            function: "importCSV"
        },
        datatype: "text",
        success: function (csv) {

            console.log('in processCSVUploaded()',csv);
            var lines = csv.split(/\r\n|\n/);
            var entries = [];
            var entriesOld = [];

            var i = 1;
            while (i < lines.length) {
                entries = [];
                entriesOld = [];
                entries = lines[i].split(',');

                if((typeof entries[0] )!== 'undefined'){
                    var pathIdx = entries[0].replace(/(\[.+\])/g, '');
                }

                // compare the input value with the old progressData
                var storedVal, currProgressDataObj = getProgressDataObjFromPath(pathIdx);
                if (currProgressDataObj && typeof currProgressDataObj['val'] !== 'undefined'){
                    var storedVal = currProgressDataObj['val'];
                }

                currProgressDataObj['val'] = entries[1];
                if(storedVal && typeof storedVal ==='string' && entries[1] !== storedVal){
                    console.log('compare new & old:', entries[1], 'v.s.', currProgressDataObj['val']);
                    currProgressDataObj['val'] = entries[1];
                }
                i++;
            }

            //determine whether this is a new step or updating an existing step.
            //  Look at the stringified progress data first
            var stringifiedProgressData = JSON.stringify(progressData);
            //update the progress field in the database
            $.ajax({
                type: "post",
                url: "php/interact_db.php",
                data: {
                    function: "storeProgressData",
                    progressJson: stringifiedProgressData
                }
            });

            window.location.reload();
        }
    })
}

/*
 * Upload a label table for which a user populated the values.
 */
function tableUpload(){

    // Sync progressData with what is stored in the database before processing the imported CSV
    backendCall('php/interact_db.php','getProgressData',function(data){
        processCSVUploaded();
    });
    console.log('fail?', csvtext);
}

function noArgBackendCall(file, funcName, callback){
    $.ajax({
        method: "post",
        url: file,
        data: {
            function: funcName,
        },
        datatype: "text",
        success: callback
    });
}

/*
 * A class used to sort progressData that aligns with the order of the label classes and attribute in XML
 *
 * @param {string} data-path of an object
 */
function Node(v) {

    this.value = v; // data-path
    this.children = [];
    this.parent = null;
    this.itr = 1;

    // set numeric path
    var tempStr = this.value.replace(/\[.*?\]/g, "").replace(/\D/g,'/').replace(/\/+/g,'/');
    if(tempStr.substring(tempStr.length-1) === '/'){
        tempStr = tempStr.substring(0,tempStr.length-1);
    }
    this.numericPath = tempStr.split('/');

    this.setParent = function(node) {
        this.parent = node;
    }

    this.getParent = function() {
        return this.parent;
    }

    this.addChild = function(node) {
        node.setParent(this);
        this.children[this.children.length] = node;
    }

    this.getChildren = function() {
        return this.children;
    }

    this.removeChildren = function(children) {
        this.children = [];
        // unset children's parent
        children.forEach(function(child){
            child.parent = null;
        });
    }

    this.getValue = function(){
        return this.value;
    }

    this.getNextSib = function(){
        var sibs = this.parent.getChildren();
        var numSibs = sibs.length;
        if(numSibs > 1){
            var i = sibs.indexOf(this);
            console.log('index of this guy in the sib list', i);
            return (numSibs > i+1) ? sibs[i+1]: null;
        }else{
            return null;
        }
    }

    this.getNumericPath = function(){
        return this.numericPath;
    }

    this.setItr = function(itrIn){
        this.itr = itrIn;
    }

    this.getItr = function(){
        return this.itr;
    }
}


/*
 * Sorts progressData in such a way that aligns with the order of the label classes and attribute listing in XML
 *
 * @param {string} data-path of an object
 */
function sortProgressDataObj(root, ordered ){
    ordered.push(root);

    if(typeof root !== 'function'){
        var children = root.getChildren();
        var node = children[0];
    }
    if(node){
        console.log('v: ', root.getValue());
    }
    while (node) {
        sortProgressDataObj(node, ordered);
        if(node!==null &&  typeof node !== 'undefined' && typeof nodde !== 'function'){
            node = node.getNextSib();
            if(typeof node === 'function'){
                node = null;
            }
        }
    }
}

/*
 * Reads DSV file that has been uploaded
 */
function importCSV() {
    $.ajax({
        method: "post",
        url: "php/interact_db.php",
        data: {
            function: "importCSV"
        },
        datatype: "text",
        success: function (data) {
        }
    })
}