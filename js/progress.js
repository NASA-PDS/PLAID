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
 * @file Contains functions for storing and loading progress as well as handling when the
 * user traverses backwards in the PLAID wizard. This file references the progress data from
 * the database when storing, loading, and comparing the user's progress.
 *
 * Creation Date: 8/10/16.
 * @author Stirling Algermissen
 * @author Trevor Morse
 * @author Michael Kim
 */

/**
 * For each type of step completed, form an object to store the progress data,
 * push it onto the overall array, and send that to the database.
 * @param {number} priorIndex index of the step that was just completed
 * @param {string} stepType often corresponds to the title of the step
 */
function storeProgress(priorIndex, stepType, splice) {
    priorIndex = priorIndex.toString();
    var currObj = {};
    var saveToProgressData = false;
    //form an object with data for the step that was just completed
    switch (stepType.toLowerCase()) {
        case "product_type":
            storeProductType(priorIndex, currObj);
            var found = 0;
            for (var i = 0; i < progressData.length && found == 0; i++) {
                var currentStep = progressData[i];
                if (currentStep['step'] == 'product_type') {
                    // overwrite existing product_type always
                    progressData.splice(i, 1, currObj);
                    found = 1;
                }
            }
            if (found == 0) {
                progressData.push(currObj);
            }
            break;
        case "discipline_dictionaries":
            storeDisciplineNodes(priorIndex, currObj);
            var found = 0;
            for (var i = 0; i < progressData.length && found == 0; i++) {
                var currentStep = progressData[i];
                if (currentStep['step'] == 'discipline_dictionaries') {
                    // overwrite existing discipline_node always
                    progressData.splice(i, 1, currObj);
                    found = 1;
                }
            }
            if (found == 0) {
                progressData.push(currObj);
            }
            break;
        case "mission_specifics":
            storeMissionSpecifics(priorIndex, currObj);
            progressData.push(currObj); //FIXME
            break;
        case "builder":
            storeBuilder(currObj);
            progressData.push(currObj); //FIXME
            break;
        default:
            storeOptionalNodes(priorIndex, currObj);
            var found = 0;
            if (typeof currObj['step_path'] != 'undefined') {
                for (var i = 0; i < progressData.length && found == 0; i++) {
                    var currentStep = progressData[i];
                    if (currentStep['step_path'] == currObj['step_path'] && currentStep['iteration'] == currObj['iteration']) {
                        // overwrite optional node when it already exists
                        progressData.splice(i, 1, currObj);
                        found = 1;
                    }
                }
            }
            if (found == 0) {
                progressData.push(currObj);
            }
            break;
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
}
/**
 * After the user completes the product type step, store the data necessary for recreating
 * the user's progress.
 * @param {string} priorIndex index of the step that was just completed
 * @param {Object} progressObj object containing the user's progress data
 */
function storeProductType(priorIndex, progressObj) {
    progressObj['step'] = "product_type";
    progressObj['type'] = "button";
    progressObj['selection'] = $("#wizard-p-" + priorIndex + " button.active span").attr("data-id");
}
/**
 * Store the user's selection in the Discipline Nodes step.
 * @param {string} priorIndex index of the step that was just completed
 * @param {Object} progressObj object containing the user's progress data
 */
function storeDisciplineNodes(priorIndex, progressObj) {
    progressObj['step'] = "discipline_dictionaries";
    progressObj['type'] = "checkbox";
    progressObj['selection'] = [];

    var stepContent = $("#wizard-p-" + priorIndex);
    $("input:checked", stepContent).each(function () {
        var dataId = $(this).siblings("span.discNode").attr("data-id");
        progressObj['selection'].push(dataId);
    });
}
/**
 * After the user completes an optional node step, store the data necessary for recreating
 * the user's progress. This function loops through the element-bars on a step and stores
 * the key data points: id (object path), num (number of occurrences), and val (text value, if any).
 * @param {string} priorIndex index of the step that was just completed
 * @param {Object} progressObj object containing the user's progress data
 */
function storeOptionalNodes(priorIndex, progressObj) {
    progressObj['step'] = "optional_nodes";
    progressObj['type'] = "element-bar";
    progressObj['selection'] = [];
    var stepContent = $("#wizard-p-" + priorIndex);
    progressObj['iteration'] = $(".optional-section", stepContent).attr("iteration");
    progressObj['step_path'] = $(".optional-section", stepContent).attr("step_path");
    progressObj['namespace'] = $(".optional-section", stepContent).attr("namespace");
    progressObj['containsChoice'] = ($(".choice-field", stepContent).length > 0);
    $(".element-bar", stepContent).each(function () {
        var element = {
            id: $(this).attr('data-path'),
            num: $(".element-bar-counter", this).val(),
            val: ""
        };
        if ($(".element-bar-input", this).length != 0) {
            element["val"] = $(".element-bar-input", this).val();
        } else if ($(".selectpicker", this).length != 0) {
            element["val"] = $(".selectpicker", this).val();
        }
        progressObj['selection'].push(element);
    });
}
/**
 * Store whether the user chose to add or remove the Mission Specifics.
 * @param {string} priorIndex index of the step that was just completed
 * @param {Object} progressObj object containing the user's progress data
 */
function storeMissionSpecifics(priorIndex, progressObj) {
    progressObj['step'] = "mission_specifics";
    progressObj['type'] = "button";

    var activeButton = $("#wizard-p-" + priorIndex + " button.active");
    if ($(activeButton).hasClass("yesButton")) {
        progressObj['selection'] = "yesButton";
    } else {
        progressObj['selection'] = "noButton";
    }
}
/**
 * Store the user's new groups/attributes created in the Builder for Mission Specifics.
 * Note: since there is a separate field in the database for storing the mission specifics
 * data, this function just writes that data out as a string-ified JSON to the db.
 * @param {Object} progressObj object containing the user's progress data
 */
function storeBuilder(progressObj) {
    progressObj['step'] = "builder";
    progressObj['type'] = "builder";
    progressObj['completed'] = true;

    $.ajax({
        type: "post",
        url: "php/interact_db.php",
        data: {
            function: "storeMissionSpecificsData",
            missionSpecificsJson: JSON.stringify(missionSpecifics)
        }
    });
}
/**
 * Traverse the progress data array and load the data for each step accordingly.
 */
function loadAllProgress() {
    ///progressData.map(loadProgress);
    //  Allow steps that were entered out of order to be re-loaded successfully
    // Loop until all the items in the progressData array have been loaded into a step
    //  The data is actually loaded in order by step, not by the order in the progressData array
    //  So if the step is not found in the progressData array, do not increment the load count
    var loadedCount = 0;
    while (loadedCount < progressData.length) {
        isLoaded = loadProgress(progressData[loadedCount]);
        //  IF data was successfully loaded into the current step
        if (isLoaded) {
            loadedCount++;
        }
    }
}
/**
 * Load the progress for the current step using the specified object data.
 * @param {Object} stepObj progress data object for the given step
 */
function loadProgress(stepObj) {
    switch (stepObj['step']) {
        case 'product_type':
            isLoaded = loadProductType(stepObj);
            break;
        case 'discipline_dictionaries':
            isLoaded = loadDisciplineNodes(stepObj);
            break;
        case 'optional_nodes':
            isLoaded = loadOptionalNode(stepObj);
            break;
        case 'mission_specifics':
            isLoaded = loadMissionSpecifics(stepObj);
            break;
        case 'builder':
            isLoaded = loadBuilder();
            break;
    }
    return isLoaded;
}
/**
 * Using the data stored in the progress object, load the user's prior selection
 * of the product type.
 * @param {Object} dataObj progress data object for the given step
 */
function loadProductType(dataObj) {
    var select = $("section.current button span[data-id='" + dataObj['selection'] + "']");
    $(select).addClass("active");
    $(select).click();
    return true;
}
/**
 * Using the data stored in the progress object, load the user's prior selections
 * for the optional node step. Since some optional node steps involve choice-fields,
 * this function has to have the ability to handle those separately from the others.
 * Note: since the element-bar-counters are disabled in a choice-field, it is necessary
 * to load the progress by clicking the plus/minus buttons rather than directly inserting the value.
 * @param {Object} dataObj progress data object for the given step
 */
function loadOptionalNode(dataObj) {
    var stepContent = $("section.current");
    var noSaveData = false;
    var isLoaded = false;
    var current_step_path = $(".optional-section", stepContent).attr("step_path");
    if (typeof dataObj['step_path'] != 'undefined' && typeof current_step_path != 'undefined') {
        if (current_step_path != dataObj['step_path']) {
            var found = 0;
            // The current dataObj is not for the current step. Find the actual dataObj in progressData.
            // TODO - consider namespace collisions
            for (var i = 0; i < progressData.length && found == 0; i++) {
                if (typeof progressData[i]["step_path"] != 'undefined') {
                    if (progressData[i]["step_path"] == current_step_path) {
                        dataObj = progressData[i];
                        found = 1;
                    }
                }
            }
            if (found == 0) {
                noSaveData = true;
                $(".optional-section", stepContent).attr("no_save_data", "true");
            }
        }
    }
    if (!noSaveData) {
        isLoaded = true;
        for (var index in dataObj['selection']) {
            var currObj = dataObj['selection'][index];
            var elementBar = $(prepJqId(currObj['id']), stepContent);
            var value = currObj['num'];
            //since choice-fields have disabled counter forms, we must mimic the user
            //pressing the plus button instead of inserting the value directly
            if (dataObj['containsChoice']) {
                var counter = $(".element-bar-counter", elementBar);
                var initVal = parseInt($(counter).val(), 10);
                //this conditional handles a bug when the user wants to revert changes within
                //a choice field. It resets the values to 0 before proceeding.
                if ($(counter).parents(".choice-field").length > 0 && initVal !== 0) {
                    while ($(counter).val() !== "0")
                        $(".element-bar-minus", elementBar).click();
                }
                for (var x = initVal; x < value; x++)
                    $(".element-bar-plus", elementBar).click();
            }
            //if there is no choice-field though, go ahead and insert the value
            else
                $(".element-bar-counter", elementBar).val(value);
            if (currObj['val'] !== undefined && currObj['val'] !== "") {
                $(".selectpicker", elementBar).selectpicker("val", currObj['val']);
                $(".element-bar-input", elementBar).val(currObj['val']);
            }
            //need to call this function to reset the properties of the element bar
            //after the adjustments have been made to load the progress
            setOneElementBarStyle($(".element-bar-counter", elementBar));
        }
        if (dataObj['containsChoice'])
            setChoiceFieldStyle($(".choice-field", stepContent));
    }
    $("#wizard").steps("next");
    return isLoaded;
}
/**
 * Helper function to escape characters in a jQuery id selector string.
 * @param {string} id jQuery selector string to modify
 * @returns {string} modified jQuery selector
 */
function prepJqId(id) {
    return "[data-path='" + id.replace(/(:|\.|\[|\]|,|\/)/g, "\\$1") + "']";
}
/**
 * Using the data stored in the progress object, check the boxes that the user
 * selected on the Discipline Nodes step.
 * @param {Object} dataObj progress data object for the given step
 */
function loadDisciplineNodes(dataObj) {
    var stepContent = $("section.current");
    dataObj['selection'].map(function (element) {
        var node = $("span.discNode[data-id='" + element + "']", stepContent);
        $(node).siblings("input").prop('checked', true);
    });
    $("#wizard").steps("next");
    return true;
}
/**
 * Make the same decision stored from the user's progress on the Mission Specifics
 * step. In other words, click either the yes or no button.
 * @param {Object} dataObj progress data object for the given step
 */
function loadMissionSpecifics(dataObj) {
    var stepContent = $("section.current");
    $("." + dataObj["selection"], stepContent).click();
    return true;
}
/**
 * Mimic the user's progression through the Builder step.
 * Note: mission specifics data is loaded on document.ready so there is no
 * need to load it specifically here. Just click save to progress through.
 */
function loadBuilder() {
    $("table.missionSpecificsActionBar button.save").click();
    return true;
}

/**
 * Loop through the checkboxes to check if:
 * - The total number checked is different than before
 * - There are different selections than before
 * @param {object} dataObj the progressData at the current step
 * @returns {boolean}
 */
function areDifferentDisciplineNodes(dataObj) {
    var stepContent = $("section.current");
    //  if ($('input:checked', stepContent).length !== dataObj['selection'].length) {
    //    areDifferent = true;
    //} else
    var nodesToRemove = [];
    var namespacesToRemove = [];
    dataObj['selection'].map(function (element) {
        var node = $("span.discNode[data-id='" + element + "']", stepContent);
        if (!$(node).siblings("input").prop('checked')) {
            // a Discipline dictionary was removed. Need to remove all children of that dictionary
            namespacesToRemove.push($(node).attr("ns"));
            $.each(progressData, function (key, value) {
                if (typeof value.namespace != 'undefined') {
                    if (value.namespace == $(node).attr("ns")) {
                        nodesToRemove.push(value);
                    }
                }
            });
        }
    });

    nodesToRemove.reverse();

    $.each(nodesToRemove, function (key, value) {
        // Lookup location in wizardData
        var found = 0;
        // check if it's a discipline node starting page
        if (typeof value.step_path == 'undefined' && typeof value.namespace != 'undefined') {
            // determine wizardData step path
            var dictKeys = Object.keys(g_dictInfo);
            for (var i = 0; i < dictKeys.length; i++) {
                var key = dictKeys[i];
                var dict = g_dictInfo[key];
                if (key == value.namespace) {
                    // The code below removes inital step of the namespace being removed
                    var searchPath = "plaid_discipline_node:" + dict.name;
                    $.each(wizardData.stepPaths, function (wizkey, wizvalue) {
                        if (wizvalue == searchPath) {
                            found = 1;
                            var offset = getStepOffset(wizkey); // there is an offset between the steps in the wizard and stepPaths
                            $("#wizard").steps('remove', Number(wizkey) + offset);
                            wizardData.stepPaths.splice(wizkey, 1);         // aren't tracked in wizardData
                            wizardData.mainSteps.splice(wizkey, 1);
                            progressData.splice(wizkey + offset, 1);
                        }
                    })
                }
            }
        }
        if (found == 0) {
            // the code below removes all children steps of the root of that namepsace
            $.each(wizardData.stepPaths, function (wizkey, wizvalue) {
                if (wizvalue == value.step_path) {
                    found = 1;
                    var offset = getStepOffset(wizkey); // there is an offset between the steps in the wizard and stepPaths
                    $("#wizard").steps('remove', Number(wizkey) + offset);
                    wizardData.stepPaths.splice(wizkey, 1);         // aren't tracked in wizardData
                    wizardData.mainSteps.splice(wizkey, 1);
                    progressData.splice(wizkey + offset, 1);

                    backendCall("php/xml_mutator.php",
                        "removeAllChildNodes",
                        {path: value.step_path, ns: value.namespace},
                        function (data) {
                        });
                    backendCall("php/xml_mutator.php",
                        "removeClass",
                        {path: value.step_path, ns: value.namespace},
                        function (data) {
                        });

                }
            });
        }
        if (found == 0) {
            console.log("could not find wizardSteps removal index for:");
            console.log(value);
        } else {
            // last step - remove the root discipline node
            for (var i = 0; i < namespacesToRemove.length; i++) {
                backendCall("php/xml_mutator.php",
                    "removeClass",
                    {path: "0", ns: namespacesToRemove[i]},
                    function (data) {
                    });
            }
        }
    });
    $.ajax({
        type: "post",
        url: "php/interact_db.php",
        data: {
            function: "storeProgressData",
            progressJson: JSON.stringify(progressData)
        }
    });
    return false;
}
/**
 * Loop through the element-bar values and check for differences.
 * @param {object} dataObj the progressData at the current step
 * @returns {boolean}
 */
function areDifferentOptionalNodes(dataObj) {
    var stepContent = $("section.current");
    var parentIteration = $(".optional-section", stepContent).attr("iteration");
    // verify current dataObj is correct
    if ($(".optional-section", stepContent).attr("step_path") != dataObj["step_path"]) {
        // find the right dataObj
        var found = false;
        for (var i = 0; i < progressData.length && !found; i++) {
            //  IF the progressData path = the current step's path
            ///if(progressData[i]["step_path"] == dataObj["step_path"] && typeof progressData[i]["step_path"] != 'undefined') {
            if (progressData[i]["step_path"] == $(".optional-section", stepContent).attr("step_path") && typeof progressData[i]["step_path"] != 'undefined' && progressData[i]["iteration"] == parentIteration) {
                dataObj = progressData[i];
                found = true;
            }
        }
        if (!found) {
            // this element hasn't been set in the first place.
            return;
        }
    }
    for (var index in dataObj['selection']) {
        var currObj = dataObj['selection'][index];
        var elementBar = $(prepJqId(currObj['id']), stepContent);
        if (elementBar.length == 0) {
            console.log("Current progressData Obj does not match current step");
            console.log($(".optional-section", stepContent).attr("step_path"));
            console.log(dataObj["step_path"]);
        }
        var newNum = $(".element-bar-counter", elementBar).val();
        var newVal = "";


        if ($(".element-bar-input", elementBar).length != 0) {
            newVal = $(".element-bar-input", elementBar).val();
        } else if ($(".selectpicker", elementBar).length != 0) {
            newVal = $(".selectpicker", elementBar).val();
        }
        var pathToUse = currObj['id'];
        if (typeof $(elementBar).attr("data-path-corrected") != 'undefined') { // if we have a path that needs correcting, use that
            pathToUse = $(elementBar).attr("data-path-corrected");
        }

        if (newNum < currObj['num']) {
           console.log("something was removed from " + currObj.id);

            var stepIndexesToRemove = [];
            var numberToRemove = currObj['num'] - newNum;
            var isStepFound = false;
            for(var i = 0; i < wizardData.stepPaths.length; i++) {
                if(wizardData.stepPaths[i].replace(/\[.*?\]/g, "").startsWith(currObj.id))  { // strip brackets, compare saves steps to current
                    // There's a match - need to gather all children elements of this.
                    isStepFound = true;
                    if(stepIndexesToRemove.length < numberToRemove) {
                        stepIndexesToRemove.push(i);
                        //  Remove the 'stepAdded' attribute from the elementBar, so the step will be re-added if they increment the count later
                        $(elementBar).removeClass("stepAdded");
                        backendCall("php/xml_mutator.php",
                            "removeAllChildNodes",
                            {path: wizardData.stepPaths[i], ns: g_jsonData.namespaces[g_state.nsIndex]},
                            function (data) {
                            });
                        backendCall("php/xml_mutator.php",
                            "removeClass",
                            {path: wizardData.stepPaths[i], ns: g_jsonData.namespaces[g_state.nsIndex]},
                            function (data) {
                            });
                        for(var k = i+1; k < wizardData.stepPaths.length; k++) {
                            // note the check below does not strip brackets - we only want to remove children
                            // that are specific to this parent element, which is specified by the brackets in currObj.id
                            if(wizardData.stepPaths[k].startsWith(wizardData.stepPaths[i])) {
                                stepIndexesToRemove.push(k);
                            }
                        }
                    }
                }

            }

            //  IF NO Step was found
            if (! isStepFound) {
                //  It must be a simple attribute rather than a step
                // Remove the given number of instances from the label, and update the value of the remaining instances
                backendCall("php/xml_mutator.php",
                    "removeClass",
                    {path: pathToUse, ns: "", number_to_remove: numberToRemove, value: newVal},
                    function (data) {
                    });
                currObj['num'] = newNum;
                //  IF ALL of the element instances were removed
                if (newNum == 0) {
                    // An element has been removed entirely
                    // Remove the stepAdded from the elementBar's classList
                    // That way init_steps.js:handleStepAddition() will add it in the future
                    $(elementBar).removeClass("stepAdded");
                }
            }

            stepIndexesToRemove.reverse();

            console.log("step indexes to remove:");
            console.log(stepIndexesToRemove);
            console.log("from");
            console.log(wizardData.stepPaths);

            $.each(stepIndexesToRemove, function (key, value) {
                var offset = getStepOffset(value); // there is an offset between the steps in the wizard and stepPaths
                $("#wizard").steps('remove', Number(value) + offset);
                wizardData.stepPaths.splice(value, 1);         // aren't tracked in wizardData
                wizardData.mainSteps.splice(value, 1);
                progressData.splice(value + offset, 1);
            });


            currObj['num'] = newNum;

            $.ajax({
                type: "post",
                url: "php/interact_db.php",
                data: {
                    function: "storeProgressData",
                    progressJson: JSON.stringify(progressData)
                }
            });



        } else if (newNum > currObj['num'] && currObj['num'] != 0) {
            // Some amount of element was added. Usually this would trigger a new step, but in this case, that step
            // has already been added, so we just want to add aditional elements. We check to make sure
            // that the previous number of elements is non zero - if it's zero, that's a new step.
            var num_to_add = newNum - currObj['num'];
            currObj['num'] = newNum;
            $.ajax({
                type: "post",
                url: "php/interact_db.php",
                data: {
                    function: "storeProgressData",
                    progressJson: JSON.stringify(progressData)
                }
            });

            backendCall("php/xml_mutator.php",
                "addNode",
                {
                    path: pathToUse,
                    quantity: newNum,
                    value: newVal,
                    ns: g_jsonData.namespaces[g_state.nsIndex],
                },
                function (data) {
                });

        } else {
            // No elements were added or removed... but did any of the actual values change?
            if (currObj['val'] != newVal) {
                // Update value
                backendCall("php/xml_mutator.php",
                    "addNode",
                    {
                        path: pathToUse,
                        quantity: newNum,
                        value: newVal,
                        ns: g_jsonData.namespaces[g_state.nsIndex],
                        value_only: "true",
                    },
                    function (data) {
                    });
            }
        }
    }
    return false;
}
/**
 * Check if the user made the same decision for adding/removing Mission Specifics.
 * If not, reset the Mission Specifics JSON, store it to the db, and return true.
 * @param {object} dataObj - The progressData at the current step
 * @returns {boolean}
 */
function areDifferentMissionSpecifics(dataObj) {
    var stepContent = $("section.current");
    var selection = $("button.active", stepContent);
    if (!$(selection).hasClass(dataObj['selection'])) {
        missionSpecifics = [];
        storeBuilder({});
        return true;
    }
    return false;
}