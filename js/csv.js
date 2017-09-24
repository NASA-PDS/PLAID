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
 * Simply iterate through progressData... (experiment)
 *
 * CSV: path, value, permissibleList, units, isNillable, description
 *
 * @returns {Object} Label CSV
 */
function getLabelCSV(callback){
    var obj = progressData, i = 0, gJsonObj = {}, permissibleList = "", units = [], isLeaf = true, val = "",
        isNillable = "", steps = [], currPath = "", wizardIdx = 0, attr = {}, dataPath = "", dataPathCorrected = "";
    var csv = "", attributes = [];

    $.ajax({
        method: "post",
        url: "php/interact_db.php",
        data: {
            function: "getCurrLabelIdName"
        },
        datatype: "text",
        success: function(labelInfo){
            csv = labelInfo['id'] + ", Label Name: " + labelInfo['name'];
            csv += '\nClass/Attribute ID, Value, Permitted Value, Permitted Units, Is this nullable?,  Description\n';

            steps = $(".lhs-nav-bars");

            for (var i = 1; i < steps.length; i++) {
                // Internal node
                currPath = steps[i].attributes['path'].value;
                obj = getProgressDataObjFromPath(currPath);
                gJsonObj = getObjectFromPath(currPath, g_jsonData.refObj);
                if (parseInt(obj['num']) >= 1) {
                    csv += currPath + ',-,-,-,-,' + gJsonObj['description'].replace(/,/g, "/ ") + '\n';

                    // Attributes
                    wizardIdx = steps[i].id.replace(/wizard-t-/g, "");
                    var attributes = $(".element-bar", "#wizard-p-" + wizardIdx);

                    for (var j = 0; j < attributes.length; j++) {

                        dataPath = attributes[j].attributes["data-path"].value;
                        if(attributes[j].attributes["data-path-corrected"] !== undefined){
                            dataPathCorrected = attributes[j].attributes["data-path-corrected"].value;
                        }
                        if (dataPathCorrected > 0) {
                            attr = getProgressDataObjFromPath(dataPathCorrected);
                        } else if (dataPath) {
                            attr = getProgressDataObjFromPath(dataPath);
                        }

                        // Ignores deselected attributes
                        if (parseInt(attr['num']) > 0) {
                            if (attr['id'] !== null && attr['id'] !== undefined && typeof attr['id'] !== "undefined") {
                                gJsonObj = getObjectFromPath(attr['id'], g_jsonData.refObj);

                                isLeaf = gJsonObj['next'] != null ? false : true;

                                val = gJsonObj['next'] != null ? "-" : attr['val'];


                                val = attr['val'] == "null" ? "" : val;
                                isNillable = gJsonObj['isNillable'] === "false" ? "no" : "yes";

                                // Unit options
                                if (gJsonObj['unitId'] && gJsonObj['unitId'] !== undefined && typeof gJsonObj['unitId'] !== "undefined") {
                                    units = gJsonObj['unitId'] === "null" ? "-" : gJsonObj['unitId'].replace(/,/g, "/ ");
                                }

                                // PermissibleList
                                if (Object.keys(gJsonObj).includes("PermissibleValueList")) {
                                    if (gJsonObj !== null && gJsonObj !== undefined && typeof gJsonObj !== "undefined" && gJsonObj['PermissibleValueList'] !== undefined && gJsonObj['PermissibleValueList'] !== null && typeof gJsonObj['PermissibleValueList'] !== "undefined" && gJsonObj['PermissibleValueList'].length > 0) {
                                        for (var idx in gJsonObj['PermissibleValueList']) {
                                            permissibleList += gJsonObj['PermissibleValueList'][idx]['PermissibleValue']['value'] + "/ ";
                                        }
                                    }
                                }
                                // csv += attr['id']; // data-path
                                csv += dataPathCorrected; // data-path
                                csv += ',' + val;
                                csv += ',' + permissibleList;
                                csv += ',' + units;
                                csv += ',' + isNillable;
                                csv += ',' + gJsonObj['description'].replace(/,/g, "/ ") + '\n';
                            }
                        }
                    }// ends inner for loop
                } // ends if clause
            } // ends outer for loop
            // console.log('csv:', csv);
            callback(csv, "my_label.csv");
            return csv;
        }, // ends success clause
        error: function (textStatus, errorThrown) {
            console.log("Failed to fetch CSV",textStatus,errorThrown);
        }
    }); // Ends ajax
}

/*
 * Allows a CSV file download.
 *
 * @param {string} CSV string.
 * @param {string} name of the file to store the CSV file as.
 */
function downloadCSV(csvContentIn, filename){
    // console.log('from downloadCSV:\n', csvContentIn);
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
    // downloadCSV(getLabelCSV(), "my_label_datasheet.csv"); <-- ORIGINAL
    // var csv = getLabelCSV();
    getLabelCSV(downloadCSV);
}

/*
 * Parse label CSV that is uploaded, and modifies the progressData accordingly.
 */
function parseLabelCSV() {

    $.ajax({
        method: "post",
        url: "php/interact_db.php",
        data: {
            function: "importCSV"
        },
        datatype: "text",
        success: function (csv) {

            console.log('in parseLabelCSV()',csv);
            var lines = csv.split(/\r\n|\n/);
            var entries = [];
            var entriesOld = [];

            var i = 1;
            while (i < lines.length) {
                if(!isNaN(parseInt(lines[i].substring(0,1)))){
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
                        currProgressDataObj['val'] = entries[1];
                    }
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
    });
}

/*
 * Upload a label table for which a user populated the values.
 */
function tableUpload(){

    // Sync progressData with what is stored in the database before processing the imported CSV
    backendCall('php/interact_db.php','getProgressData',function(data){
        parseLabelCSV();
    });
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
 * Call the backend function to read CSV file that has been uploaded
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


function testFileUpload(){
    $.ajax({
        method: "post",
        url: "php/interact_db.php",
        data: {
            function: "importCSV"
        },
        datatype: "text",
        success: function (data) {

            console.log('in testFileUpload()', data);

        },
        error: function (textStatus, errorThrown) {
            // Success = false;//doesnt goes here
            console.log('File upload failed.');
        }

    })
}

function hi(){
    console.log('hi!');
    $.ajax({
        method: "post",
        url: "php/interact_db.php",
        data: {
            function: "getCurrLabelIdName"
        },
        datatype: "text",
        success: function(labelInfo){
            console.log('labelInfo:', labelInfo);
        }
    })

}

function submitCSV(){
    $('#submitCSV').click();
}

function textMirror(e){
    $('#mirrorFileInputField').val('');
    var filename = $('#file').val();
    var parts = filename.split('\\');
    filename = parts[parts.length-1];
    $('#mirrorFileInputField').attr("placeholder",filename);
}

function setOverWrite(isOverwrite) {

    $.ajax({
        method: "post",
        url: "php/interact_db.php",
        data: {
            function: "setTableUploadOption",
            table_upload_overwrite: isOverwrite
        },
        datatype: "text",
        success: function (data) {
            console.log("$_SESSION['table_upload_overwrite'] is set to", data);
            submitCSV();
        }
    });
}

function triggerTableUploadModal(){
    $('#tableUploadModal').click();
}