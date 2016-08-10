/**
 * Created by morse on 6/17/16.
 */
$(document).ready(function(){
    $(".list-group-item").each(function(){
        $(this).click(captureSelection);
    });
    addMissionSpecificsActionBar();
    previewDescription();
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
    var data;
    if (infoBarData[currentStep])
        data = infoBarData[currentStep];
    else
        data = infoBarData["optional_nodes"];
    $("#help").append(data);
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
/**
 * Before the user submits the filename form (on the Export step),
 * ensure that the filename is valid. Show there is an error otherwise.
 * @returns {boolean}
 */
function checkFilename(){
    var input = $("#exportInput");
    var regex = new RegExp("^[a-zA-Z][a-zA-Z0-9_-]+.xml$");
    if ($(input).val().match(regex)){
        $(input).removeClass("error");
        if (!$(input).hasClass("submitted")){
            $(input).addClass("submitted");
            addOutputFileData();
            $("#exportForm").submit();
        }
        else
            return false;
    }
    else{
        $(input).addClass("error");
        return false;
    }
}
/**
 * The output filename is not accessible from the backend so it must
 * be added as a hidden input field to be submitted with the POST.
 */
function addOutputFileData(){
    var input = $("<input>")
        .attr("type", "hidden")
        .attr("name", "outputFile").val(filePaths.OUTPUT);
    $('#exportForm').append($(input));
}
/**
 * Determine whether or not the user is transitioning to the final step in the wizard.
 * If so, show a preview of the label template.
 * @param newIndex of the step the user is transitioning to
 */
function handleExportStep(newIndex){
    var nextSection = $("#wizard-p-" + newIndex.toString());
    var isExportStep = $(nextSection).find("form#exportForm").length > 0;
    var hasNoPreview = !$(nextSection).find(".finalPreview").length > 0;
    if (isExportStep && hasNoPreview){
        backendCall("php/xml_mutator.php",
            "addRootAttrs",
            {namespaces: jsonData.namespaces},
            function(data){ console.log(data); });
        backendCall("php/xml_mutator.php",
            "formatDoc",
            {},
            function(data){ console.log(data); });
        var preview = generateFinalPreview();
        $("#finalPreview", nextSection).append(preview);
    }
}
/**
 * Generate a preview of the completed label template. This makes a call
 * to the backend to read the contents of the label template file.
 * @returns {Element}
 */
function generateFinalPreview() {
    var previewContainer = document.createElement("div");
    previewContainer.className = "finalPreview previewContainer";

    var card = document.createElement("div");
    card.className = "finalPreview card";

    var cardHeader = document.createElement("div");
    cardHeader.className = "finalPreview card-header";
    cardHeader.innerHTML = "Label Template Preview";
    card.appendChild(cardHeader);

    var cardBlock = document.createElement("div");
    cardBlock.className = "finalPreview card-block";
    card.appendChild(cardBlock);

    backendCall("php/preview_template.php", null, {}, function(data){
        cardBlock.textContent = data;
    });

    previewContainer.appendChild(card);

    return previewContainer;
}
/**
 * Make a call to a function in the specified file on the backend.
 * @param {string} file name of the PHP file
 * @param {string} funcName name of the function to execute in the PHP
 * @param {Object} args object containing any arguments for the function
 * @param {Function} callback function to execute upon return
 */
function backendCall(file, funcName, args, callback){
    args.outputFile = filePaths.OUTPUT;
    $.ajax({
        async: false,
        type: "POST",
        url: file,
        data: {
            Function: funcName,
            Data: args
        },
        success: callback
    });
}
