/**
 * Created by morse on 8/10/16.
 */
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
    switch (stepType){
        case "Product_Type":
            storeProductType(priorIndex, currObj);
            break;
        case "Discipline_Nodes":
            storeDisciplineNodes(priorIndex, currObj);
            break;
        case "Mission_Specifics":
            storeMissionSpecifics(priorIndex, currObj);
            break;
        case "Builder":
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
 *
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

function storeBuilder(progressObj){
    progressObj['step'] = "builder";
    progressObj['type'] = "builder";
    progressObj['completed'] = true;
}
/**
 * Traverse the progress data array and load the data for each step accordingly.
 */
function loadProgress(){
    progressData.map(function(stepObj){
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
               break;
           case 'builder':
               break;
       }
    });
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
            var initVal = $(".element-bar-counter", elementBar).val();
            for (var counter = parseInt(initVal, 10); counter < value; counter++)
                $(".element-bar-plus", elementBar).click();
        }
        //if there is no choice-field though, go ahead and insert the value
        else
            $(".element-bar-counter", elementBar).val(value);
    }
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