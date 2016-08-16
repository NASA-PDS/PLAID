/**
 * Created by morse on 8/10/16.
 */
/**
 * Make a call to the backend to load the progress data from the database
 * and then determine if there is progress to be loaded into the page.
 */
function loadProgressData(){
    $.ajax({
        method: "post",
        url: "php/interact_db.php",
        data: {
            function: "getProgressData"
        },
        datatype: "text",
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
        }
    });
}
/**
 * For each type of step completed, form an object to store the progress data,
 * push it onto the overall array, and send that to the database.
 * @param {Number} priorIndex index of the step that was just completed
 * @param {String} stepType
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
 * @param {Object} progressObj
 */
function storeProductType(priorIndex, progressObj){
    progressObj['step'] = "product_type";
    progressObj['type'] = "button";
    progressObj['selection'] = $("#wizard-p-" + priorIndex + " button.active span").attr("data-id");
}
/**
 * Store the user's selection of Discipline Nodes.
 * @param priorIndex
 * @param progressObj
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
 * the user's progress.
 * @param {string} priorIndex index of the step that was just completed
 * @param {Object} progressObj
 */
function storeOptionalNodes(priorIndex, progressObj){
    progressObj['step'] = "optional_nodes";
    progressObj['type'] = "element-bar";
    progressObj['selection'] = {};


    var stepContent = $("#wizard-p-" + priorIndex);
    progressObj['containsChoice'] = ($(".choice-field", stepContent).length > 0);
    $(".element-bar", stepContent).each(function(){
        var id = $(this).attr('id');
        var value = $(".element-bar-counter", this).val();
        progressObj['selection'][id] = value;
    });
}
/**
 * Store whether the user chose to add or remove the Mission Specifics.
 * @param priorIndex
 * @param progressObj
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
 * Store the user's new groups/attributes created in the Builder.
 * @param progressObj
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
 * @param {Object} stepObj
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
 * @param dataObj
 */
function loadProductType(dataObj){
    var select = $("section.current button span[data-id='" + dataObj['selection'] + "']");
    $(select).addClass("active");
    $(select).click();
}
/**
 * Using the data stored in the progress object, load the user's prior selections
 * for the optional node step.
 * @param dataObj
 */
function loadOptionalNode(dataObj){
    var stepContent = $("section.current");
    for (var key in dataObj['selection']){
        var elementBar = $(jq(key), stepContent);
        var value = dataObj['selection'][key];
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
        setOneElementBarStyle($(".element-bar-counter", elementBar));
    }
    if (dataObj['containsChoice'])
        setChoiceFieldStyle($(".choice-field", stepContent));
    $("#wizard").steps("next");
}
/**
 * Helper function to escape characters in a jQuery id selector string.
 * @param myid
 * @returns {string}
 */
function jq( myid ) {
    return "#" + myid.replace( /(:|\.|\[|\]|,|\/)/g, "\\$1" );
}
/**
 * Using the data stored in the progress object, check the boxes that the user
 * selected on the Discipline Nodes step.
 * @param dataObj
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
 * step.
 * @param dataObj
 */
function loadMissionSpecifics(dataObj) {
    var stepContent = $("section.current");
    $("." + dataObj["selection"], stepContent).click();
}

/**
 * Mimic the user's progression through the Builder step.
 */
function loadBuilder() {
    $("table.missionSpecificsActionBar button.save").click();
}
/**
 * Check to see if the user has made a change. If so, display a popup and react accordingly
 * to the user's selection. If they choose to keep the changes, the progress after that point will
 * be cleared and the page will be reloaded.
 * @param currIndex
 * @returns {boolean}
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
        generatePopup(popUpData["deleteProgress"]);
        return false;
    }
    else
        return true;
}
/**
 * Loop through the checkboxes to check if:
 * - There is a different number of ones checked than before
 * - There are different selections than before
 * @param {object} dataObj - The progressData at the current step
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
 * @param {object} dataObj - The progressData at the current step
 * @returns {boolean}
 */
function areDifferentOptionalNodes(dataObj){
    var stepContent = $("section.current");
    for (var key in dataObj['selection']){
        var currValue = $(jq(key) + " .element-bar-counter", stepContent).val();
        var initValue = dataObj['selection'][key];
        if (currValue !== initValue)
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