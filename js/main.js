/**
 * Created by morse on 6/17/16.
 */
$(document).ready(function(){
    $(".list-group-item").each(function(){
        $(this).click(captureSelection);
    });
    addMissionSpecificsActionBar();
    previewDescription();
    $.post("php/file_out.php", function(data){
        console.log(data);
    });
});
/**
 * When the user selects an option in the wizard pane, add
 * the active class to that element and store the result.
 */
function captureSelection(){
    var element = $(this)[0];
    clearActiveElements();
    $(element).addClass("active");
    var selection = $(".productType", element).attr("data-id");
    jsonData.searchObj = jsonData.pds4Obj;
    getElement(jsonData.pds4Obj, "product", "classDictionary", selection);
    //auto-advance to the next step after capturing the user's product selection
    $("#wizard").steps("next");
}
/**
 * Helper function to remove the active class from all elements.
 */
function clearActiveElements(){
    $(".active").removeClass("active");
}
/**
 * Parse out the title of the current step and use that to determine
 * which attribute to access from the infoBarData object.
 */
function previewDescription(){
    var currentStep = $(".title.current")[0].innerHTML
                        .trim()
                        .replace(/\b\s\b/, "_")
                        .toLowerCase();
    $("#help").append(infoBarData[currentStep]);
}

/**
 * When the user clicks on a plus button, increment the corresponding counter.
 * If it is a choice group (in other words, the user can choose between multiple elements),
 * then ensure that the values are okay within the context of the group.
 */
function increaseCounter(){
    var counter = $(this).parent().siblings(".element-bar-counter");
    var minAndMax = getMinMax(counter);
    var counterMin = minAndMax[0], counterMax = minAndMax[1];
    var currVal = parseInt(counter.val(), 10);
    var newVal = (currVal + 1);
    var choiceGroup = $(this).parents(".choice-field");
    var cgMin, currTotal, isCG = false;
    if (choiceGroup.length > 0){
        cgMin = parseInt($(choiceGroup).attr("min"), 10);
        currTotal = parseInt($(choiceGroup).attr("total"), 10);
        isCG = true;
    }
    if (newVal >= counterMin && newVal <= counterMax){
        counter.prop("value", newVal);
        if (isCG){
            currTotal += 1;
            $(choiceGroup).attr("total", currTotal);
            if (currTotal > cgMin){
                $(".btn.element-bar-minus", choiceGroup).each(function(){
                    var val = $(this).parent().siblings(".element-bar-counter").prop("value");
                    if (val !== "0") { $(this).prop("disabled", false); }
                });
            }
        }
        $(this).parent().siblings(".element-bar-label").removeClass("zero-instances");
        $(this).parent().siblings(".element-bar-button").children(".element-bar-minus").prop('disabled', false);
    }
    if (newVal === counterMax){
        $(this).prop('disabled', true);
        if (isCG){
            $(".btn.element-bar-plus", choiceGroup).each(function(){
                $(this).prop("disabled", true);
            });
        }
    }
}
/**
 * When the user clicks on a minus button, decrement the corresponding counter.
 * If it is a choice group (in other words, the user can choose between multiple elements),
 * then ensure that the values are okay within the context of the group.
 */
function decreaseCounter(){
    var counter = $(this).parent().siblings(".element-bar-counter");
    var minAndMax = getMinMax(counter);
    var counterMin = minAndMax[0], counterMax = minAndMax[1];
    var currVal = parseInt(counter.val(), 10);
    var newVal = (currVal - 1);
    var choiceGroup = $(this).parents(".choice-field");
    var cgMin, currTotal, isCG = false;
    if (choiceGroup.length > 0){
        cgMin = parseInt($(choiceGroup).attr("min"), 10);
        currTotal = parseInt($(choiceGroup).attr("total"), 10);
        isCG = true;
    }
    if (newVal >= counterMin && newVal <= counterMax){
        counter.prop("value", newVal);
        if (isCG){
            currTotal -= 1;
            $(choiceGroup).attr("total", currTotal);
            if (currTotal <= cgMin){
                $(".btn.element-bar-plus", choiceGroup).each(function(){
                    $(this).prop("disabled", false);
                });
            }
        }
        $(this).parent().siblings(".element-bar-button").children(".element-bar-plus").prop('disabled', false);
    }
    if (newVal === counterMin){
        $(this).prop('disabled', true);
        if (isCG && cgMin !== 0 && currTotal <= cgMin){
            $(".btn.element-bar-minus", choiceGroup).each(function(){
                $(this).prop("disabled", true);
            });
        }
    }
    if (newVal === 0){
        $(this).parent().siblings(".element-bar-label").addClass("zero-instances");
    }
}
/**
 * Helper function to return min/max values from the element's attributes.
 */
function getMinMax(counter){
    var counterMin = parseInt($(counter).attr("min"), 10);
    var counterMax = $(counter).attr("max");
    if (counterMax === "inf"){
        counterMax = 999999999999;
    }
    else{
        counterMax = parseInt(counterMax);
    }
    return Array(counterMin, counterMax);
}

function updateLabel(funcName, args) {
    $.ajax({
        async: false,
        type: "POST",
        url: "php/xml_mutator.php",
        data: {
            Function: funcName,
            Data: args
        }
    }).done(function(data){
        console.log(data);
    });
}