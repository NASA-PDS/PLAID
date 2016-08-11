/**
 * Created by morse on 8/10/16.
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