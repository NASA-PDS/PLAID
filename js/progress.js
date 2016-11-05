/**
 * @file Contains functions for storing and loading progress as well as handling when the
 * user traverses backwards in the LDT wizard. This file references the progress data from
 * the database when storing, loading, and comparing the user's progress.
 *
 * Creation Date: 8/10/16.
 *
 * @author Trevor Morse
 * @author Michael Kim
 */
/**
 * Make a call to the backend to load the progress data from the database
 * and then determine if there is progress to be loaded into the LDT wizard.
 */
function loadProgressData(){
    $.ajax({
        method: "post",
        url: "php/interact_db.php",
        data: {
            function: "getProgressData"
        },
        datatype: "text",
        beforeSend: function() {
            $('.modal-backdrop.loadingBackdrop').show();
        },
        success: function (data) {
            progressData = $.parseJSON(data);
            //- If the progressData IS set AND IS NOT empty
            if (typeof progressData != "undefined" &&
                progressData != null &&
                progressData.length > 0) {
                isLoading = true;
                //    - Call load
                loadAllProgress();
                isLoading = false;
            }
        },
        complete: function() {
            $(".modal-backdrop").hide();
        }
    });
}
/**
 * For each type of step completed, form an object to store the progress data,
 * push it onto the overall array, and send that to the database.
 * @param {number} priorIndex index of the step that was just completed
 * @param {string} stepType often corresponds to the title of the step
 */
function storeProgress(priorIndex, stepType){
    priorIndex = priorIndex.toString();
    var currObj = {};
    //form an object with data for the step that was just completed
    switch (stepType.toLowerCase()){
        case "product_type":
            storeProductType(priorIndex, currObj);
            break;
        case "discipline_nodes":
            storeDisciplineNodes(priorIndex, currObj);
            break;
        case "mission_specifics":
            storeMissionSpecifics(priorIndex, currObj);
            break;
        case "builder":
            storeBuilder(currObj);
            break;
        default:
            storeOptionalNodes(priorIndex, currObj);
            break;
    }
    //store values that were adjusted by the user
    //push the object onto the progress array
    progressData.push(currObj);
    //update the progress field in the database
    $.ajax({
        type: "post",
        url: "php/interact_db.php",
        data: {
            function: "storeProgressData",
            progressJson: JSON.stringify(progressData)
        }
    });
}
/**
 * After the user completes the product type step, store the data necessary for recreating
 * the user's progress.
 * @param {string} priorIndex index of the step that was just completed
 * @param {Object} progressObj object containing the user's progress data
 */
function storeProductType(priorIndex, progressObj){
    progressObj['step'] = "product_type";
    progressObj['type'] = "button";
    progressObj['selection'] = $("#wizard-p-" + priorIndex + " button.active span").attr("data-id");
}
/**
 * Store the user's selection in the Discipline Nodes step.
 * @param {string} priorIndex index of the step that was just completed
 * @param {Object} progressObj object containing the user's progress data
 */
function storeDisciplineNodes(priorIndex, progressObj){
    progressObj['step'] = "discipline_nodes";
    progressObj['type'] = "checkbox";
    progressObj['selection'] = [];

    var stepContent = $("#wizard-p-" + priorIndex);
    $("input:checked", stepContent).each(function(){
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
function storeOptionalNodes(priorIndex, progressObj){
    progressObj['step'] = "optional_nodes";
    progressObj['type'] = "element-bar";
    progressObj['selection'] = [];

    var stepContent = $("#wizard-p-" + priorIndex);
    progressObj['containsChoice'] = ($(".choice-field", stepContent).length > 0);
    $(".element-bar", stepContent).each(function(){
        var element = {
            id: $(this).attr('data-path'),
            num: $(".element-bar-counter", this).val(),
            val: $(".element-bar-input", this).val()
        };
        progressObj['selection'].push(element);
    });
}
/**
 * Store whether the user chose to add or remove the Mission Specifics.
 * @param {string} priorIndex index of the step that was just completed
 * @param {Object} progressObj object containing the user's progress data
 */
function storeMissionSpecifics(priorIndex, progressObj){
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
function storeBuilder(progressObj){
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
function loadAllProgress(){
    progressData.map(loadProgress);
}
/**
 * Load the progress for the current step using the specified object data.
 * @param {Object} stepObj progress data object for the given step
 */
function loadProgress(stepObj){
    switch(stepObj['step']){
        case 'product_type':
            loadProductType(stepObj);
            break;
        case 'discipline_nodes':
            loadDisciplineNodes(stepObj);
            break;
        case 'optional_nodes':
            loadOptionalNode(stepObj);
            break;
        case 'mission_specifics':
            loadMissionSpecifics(stepObj);
            break;
        case 'builder':
            loadBuilder();
            break;
    }
}
/**
 * Using the data stored in the progress object, load the user's prior selection
 * of the product type.
 * @param {Object} dataObj progress data object for the given step
 */
function loadProductType(dataObj){
    var select = $("section.current button span[data-id='" + dataObj['selection'] + "']");
    $(select).addClass("active");
    $(select).click();
}
/**
 * Using the data stored in the progress object, load the user's prior selections
 * for the optional node step. Since some optional node steps involve choice-fields,
 * this function has to have the ability to handle those separately from the others.
 * Note: since the element-bar-counters are disabled in a choice-field, it is necessary
 * to load the progress by clicking the plus/minus buttons rather than directly inserting the value.
 * @param {Object} dataObj progress data object for the given step
 */
function loadOptionalNode(dataObj){
    var stepContent = $("section.current");
    for (var index in dataObj['selection']){
        var currObj = dataObj['selection'][index];
        var elementBar = $(prepJqId(currObj['id']), stepContent);
        var value = currObj['num'];
        //since choice-fields have disabled counter forms, we must mimic the user
        //pressing the plus button instead of inserting the value directly
        if (dataObj['containsChoice']){
            var counter = $(".element-bar-counter", elementBar);
            var initVal = parseInt($(counter).val(), 10);
            //this conditional handles a bug when the user wants to revert changes within
            //a choice field. It resets the values to 0 before proceeding.
            if ($(counter).parents(".choice-field").length > 0 && initVal !== 0){
                while ($(counter).val() !== "0")
                    $(".element-bar-minus", elementBar).click();
            }
            for (var x = initVal; x < value; x++)
                $(".element-bar-plus", elementBar).click();
        }
        //if there is no choice-field though, go ahead and insert the value
        else
            $(".element-bar-counter", elementBar).val(value);
        if (currObj['val'] !== undefined && currObj['val'] !== "")
            $(".element-bar-input", elementBar).val(currObj['val']);
        //need to call this function to reset the properties of the element bar
        //after the adjustments have been made to load the progress
        setOneElementBarStyle($(".element-bar-counter", elementBar));
    }
    if (dataObj['containsChoice'])
        setChoiceFieldStyle($(".choice-field", stepContent));
    $("#wizard").steps("next");
}
/**
 * Helper function to escape characters in a jQuery id selector string.
 * @param {string} id jQuery selector string to modify
 * @returns {string} modified jQuery selector
 */
function prepJqId(id) {
    return "[data-path='" + id.replace( /(:|\.|\[|\]|,|\/)/g, "\\$1" ) + "']";
}
/**
 * Using the data stored in the progress object, check the boxes that the user
 * selected on the Discipline Nodes step.
 * @param {Object} dataObj progress data object for the given step
 */
function loadDisciplineNodes(dataObj){
    var stepContent = $("section.current");
    dataObj['selection'].map(function(element){
       var node = $("span.discNode[data-id='" + element + "']", stepContent);
       $(node).siblings("input").prop('checked', true);
    });
    $("#wizard").steps("next");
}
/**
 * Make the same decision stored from the user's progress on the Mission Specifics
 * step. In other words, click either the yes or no button.
 * @param {Object} dataObj progress data object for the given step
 */
function loadMissionSpecifics(dataObj) {
    var stepContent = $("section.current");
    $("." + dataObj["selection"], stepContent).click();
}
/**
 * Mimic the user's progression through the Builder step.
 * Note: mission specifics data is loaded on document.ready so there is no
 * need to load it specifically here. Just click save to progress through.
 */
function loadBuilder() {
    $("table.missionSpecificsActionBar button.save").click();
}
/**
 * Check to see if the user has made a change. If so, display a popup and react accordingly
 * to the user's selection. If they choose to keep the changes, the progress after that point will
 * be cleared and the page will be reloaded. If they choose to revert, then their changes will
 * be reverted, and they will be taken to the next step.
 * @param {number} currIndex index of the current step
 * @returns {boolean} indicates whether to continue to the next step or not
 */
function handleBackwardsProgress(currIndex){
    var isChanged = false;
    //compare against the progress data for the current index
    switch (progressData[currIndex]['step']){
        case 'discipline_nodes':
            isChanged = areDifferentDisciplineNodes(progressData[currIndex]);
            break;
        case 'optional_nodes':
            isChanged = areDifferentOptionalNodes(progressData[currIndex]);
            break;
        case 'mission_specifics':
            isChanged = areDifferentMissionSpecifics(progressData[currIndex]);
            break;
    }
    //if there is a difference in selections between what is stored in the progress data and what
    //is currently in the content of the step
    if (isChanged) {
        generatePopUp(popUpData["deleteProgress"]);
        return false;
    }
    else
        return true;
}
/**
 * Loop through the checkboxes to check if:
 * - The total number checked is different than before
 * - There are different selections than before
 * @param {object} dataObj the progressData at the current step
 * @returns {boolean}
 */
function areDifferentDisciplineNodes(dataObj){
    var stepContent = $("section.current");
    var areDifferent = false;
    if ($('input:checked', stepContent).length !== dataObj['selection'].length) {
        areDifferent = true;
    } else {
        dataObj['selection'].map(function(element) {
            var node = $("span.discNode[data-id='" + element + "']", stepContent);
            if (!$(node).siblings("input").prop('checked')) {
                areDifferent = true;
            }

        });
    }
    return areDifferent;
}
/**
 * Loop through the element-bar values and check for differences.
 * @param {object} dataObj the progressData at the current step
 * @returns {boolean}
 */
function areDifferentOptionalNodes(dataObj){
    var stepContent = $("section.current");
    for (var index in dataObj['selection']){
        var currObj = dataObj['selection'][index];
        var elementBar = $(prepJqId(currObj['id']), stepContent);
        var newNum = $(".element-bar-counter", elementBar).val();
        var newVal = $(".element-bar-input", elementBar).val();
        if (newNum !== currObj['num'] || newVal !== currObj['val'])
            return true;
    }
    return false;
}
/**
 * Check if the user made the same decision for adding/removing Mission Specifics.
 * If not, reset the Mission Specifics JSON, store it to the db, and return true.
 * @param {object} dataObj - The progressData at the current step
 * @returns {boolean}
 */
function areDifferentMissionSpecifics(dataObj){
    var stepContent = $("section.current");
    var selection = $("button.active", stepContent);
    if (!$(selection).hasClass(dataObj['selection'])){
        missionSpecifics = [];
        storeBuilder({});
        return true;
    }
    return false;
}