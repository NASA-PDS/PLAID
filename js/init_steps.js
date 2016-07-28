/**
 * Created by morse on 6/16/16.
 */
var settings = {
    /* Appearance */
    headerTag: "h3",
    bodyTag: "section",
    contentContainerTag: "div",
    actionContainerTag: "div",
    stepsContainerTag: "div",
    cssClass: "wizard",
    stepsOrientation: $.fn.steps.stepsOrientation.vertical,

    /* Templates */
    titleTemplate: '<span class="number">#index#.</span> #title#',
    loadingTemplate: '<span class="spinner"></span> #text#',

    /* Behaviour */
    autoFocus: false,
    enableAllSteps: false,
    enableKeyNavigation: true,
    enablePagination: true,
    suppressPaginationOnFocus: true,
    enableContentCache: true,
    enableCancelButton: false,
    enableFinishButton: true,
    preloadContent: false,
    showFinishButtonAlways: false,
    forceMoveForward: false,
    saveState: false,
    startIndex: 0,

    /* Transition Effects */
    transitionEffect: $.fn.steps.transitionEffect.none,
    transitionEffectSpeed: 0,

    /* Events */
    onStepChanging: function (event, currentIndex, newIndex) {
        if (updatePopup(currentIndex)) {
            showPopup(currentIndex, newIndex);
            return false;
        }
        $("#help").hide();
        if (currentIndex < newIndex){
            handleStepAddition(currentIndex, newIndex);
            handleMissionSpecificsStep(currentIndex, newIndex);
            discNodesSelection(currentIndex);
        }
        else if (newIndex === 0 && currentIndex > newIndex){
            return false;
        }
        updateActionBar(newIndex);
        removePopovers();
        return true;
    },
    onStepChanged: function (event, currentIndex, priorIndex) {
        wizardData.currentStep = currentIndex;
        if (currentIndex > priorIndex){
            var priorStepHeading = $("#wizard-t-" + priorIndex.toString());
            var number = $(".number", priorStepHeading)[0];
            number.innerHTML = "<i class=\"fa fa-check fa-fw\" aria-hidden=\"true\"></i>";
        }
        handleBackwardsTraversalPopup(currentIndex);
        updateMissionSpecificsBuilder(priorIndex);
        $("#help").empty();
        previewDescription();
        $("#help").fadeIn(400);
    },
    onCanceled: function (event) { },
    onFinishing: function (event, currentIndex) { return true; },
    onFinished: function (event, currentIndex) { },

    /* Labels */
    labels: {
        cancel: "Cancel",
        current: "-> ",
        pagination: "Pagination",
        finish: "Finish",
        next: "Next",
        previous: "Previous",
        loading: "Loading ..."
    }
};
/*
 * Initialize the wizard using jQuery-Steps built-in method
 */
function init_steps_object(wizard) {
    wizard.steps(settings);
}
/*
 * Since the wizard object is controlled by the jQuery-Steps, it is
 * set to a specific height based on its content. We want to match this
 * height for the sidebar on the right and for the steps bar on the left.
 * @param {object} content portion of the wizard
 * @param {object} action bar portion of the wizard
 * @param {object} sidebar
 * @param {object} steps bar
 */
function match_wizard_height(wizardContent, wizardActions, sidebar, stepsBar){
    $(sidebar).css("height", $(wizardContent).height() + $(wizardActions).height());
    $(stepsBar).css("height", $(wizardContent).height() + $(wizardActions).height());
}



/*
* Handles the dynamic creation of new steps populated with data from the product
* object created from the PDS4 JSON. This function looks up the corresponding object
* for each element bar in a step, checks if the user opted to add that object and that
* the object has options underneath it, and adds a new step accordingly.
* @param {number} currentIndex for the current step in the wizard
* @param {number} newIndex for the next step in the wizard
 */
function handleStepAddition(currentIndex, newIndex){
    var insertionIndex = newIndex;
    var currSection = $("#wizard-p-" + currentIndex.toString());
    if ($(".optional-section", currSection).length > 0){
        $(".element-bar:not(.stepAdded)", currSection).each(function(){
            var val = $(".element-bar-counter", this).val();
            if (val !== "0"){
                var id = $(this).attr("id");
                var elementKeys = id.split("/");
                var currObj = jsonData.refObj;
                for (var index in elementKeys){
                    try {
                        currObj = currObj[elementKeys[index]];
                    }
                    catch(e){
                        return;
                    }
                    if (index < elementKeys.length-1 && isNaN(elementKeys[index])) {
                        currObj = currObj["next"];
                    }
                }
                //the following handles two checks:
                //- if the "allChildrenRequired" property is not undefined, then it is a class with children (not an attribute)
                //- if the "allChildrenRequired" property is false, then there are optional children
                // if all of these checks are true, then insert a step for the current object/element
                if (currObj["allChildrenRequired"] !== undefined &&
                    !currObj["allChildrenRequired"]){
                    insertStep($("#wizard"), insertionIndex, currObj);
                    insertionIndex +=1;
                }
                $(this).addClass("stepAdded");
            }
        });
    }
}
/*
* Insert a batch of steps corresponding to the same level in the object hierarchy.
* @param {Number} currentIndex zero-based index corresponding to step position in wizard
* @param {Object} dataObj object containing the PDS data to generate content from
 */
function insertLevelOfSteps(currIndex, dataObj){
    for (var index in dataObj){
        for (var key in dataObj[index]){
            insertStep($("#wizard"), currIndex, dataObj[index][key]);
            currIndex +=1;
        }
    }
}
/*
* Insert a step into the wizard at the specified index with content
* generated from the specified data object.
* @param {Object} wizard
* @param {Number} index zero-based position to insert step into wizard at
* @param {Object} dataObj object containing the PDS data to generate content from
 */
function insertStep(wizard, index, dataObj){
    revertStepClass(index);
    var title = dataObj["title"].replace(/_/g, " ");
    wizard.steps("insert", index, {
        title: title,
        content: generateContent(title, dataObj["next"])
    });
}
/*
* Generate the content section for a new step in the wizard.
* @param {string} sectionTitle title of the current section from object data
* @param {Object} dataObj object containing the PDS data to generate content from
* @return {HTML element} section
 */
function generateContent(sectionTitle, dataObj){
    var section = document.createElement("div");
    section.className = "optional-section";
    var question = document.createElement("p");
    question.className = "question";
    question.innerHTML = "What elements do you want to keep in '" + sectionTitle + "'?";
    section.appendChild(question);
    var subsection = document.createElement("div");
    subsection.className = "data-section";
    for (var index in dataObj){
        var counter = 0, flag = false;
        var choicegroup;
        for (var key in dataObj[index]){
            counter += 1;
        }
        dataObj[index].length = counter;
        key = "";
        for (key in dataObj[index]){
            var currObj = dataObj[index][key];
            //get immediate associations for creating next steps/element-bars
            getAssociations(jsonData.searchObj, currObj["associationList"], currObj["next"]);
            assignObjectPath(null, currObj, currObj["next"]);
            //need to get one more level of associations for displaying sub-elements in the popovers
            getLevelOfAssociations(jsonData.searchObj, currObj["next"], false);
            if (dataObj[index].length === 1){
                if (currObj["title"] !== "Mission_Area" &&
                    currObj["title"] !== "Discipline_Area"){
                    subsection.appendChild(createElementBar(currObj, createLabel, false));
                }
            }
            else {
                var range = currObj["range"].split("-");
                if (!flag){
                    choicegroup = createChoiceGroup(range[0], range[1]);
                }
                range[0] = (range[0] === "0" ? range[0] : (parseInt(range[0], 10) - 1).toString());
                currObj["range"] =  range[0] + "-" + range[1];
                choicegroup.appendChild(createElementBar(currObj, createLabel, true));
                flag = true;
            }
        }
        if (flag){ subsection.appendChild(choicegroup); }
    }
    section.appendChild(subsection);
    return section;
}
/*
* Create an element-bar populated with data from the specified object.
* @param {object} dataObj object containing the information for the element-bar
* @param {function} genLabel function to create the label portion of the element-bar
* @return {HTML element} elementBar
 */
function createElementBar(dataObj, genLabel, isChoice){
    var elementBar = document.createElement("div");
    elementBar.className = "input-group element-bar";
    elementBar.id = dataObj["path"];

    var label = genLabel(dataObj["title"], isChoice);
    elementBar.appendChild(label);

    var minusBtn = createControlButton("minus");
    elementBar.appendChild(minusBtn);
    var plusBtn = createControlButton("plus");

    var counter = createCounterInput(dataObj);
    if ($(counter).prop("value") === $(counter).prop("max")){
        $("button", plusBtn).prop("disabled", true);
    }
    if ($(counter).prop("min") === "0") {
        label.className += " zero-instances";
    }
    if (isChoice){
        $(counter).prop("disabled", true);
        $(counter).css("opacity", 1);
    }
    $("button", minusBtn).prop("disabled", true);
    elementBar.appendChild(counter);

    elementBar.appendChild(plusBtn);

    addPopover(elementBar, dataObj, $(counter).prop("min"), $(counter).prop("max"));

    return elementBar;
}
/*
 * Create a span to act as a label with the specified text.
 * @param {string} text
 * @return {HTML Element} label
 */
function createLabel(text, isChoice){
    var label = document.createElement("span");
    label.className = "input-group-addon element-bar-label";
    if (isChoice) {
        label.innerHTML = "<i>" + text.replace(/_/g, " ") + "</i>";
        label.className += " option";
    }
    else {
        label.innerHTML = text.replace(/_/g, " ");
    }
    return label;
}
/*
* Create a plus/minus button for controlling the form in an element-bar.
* @param {string} type ["plus" | "minus"]
* @return {HTML element} wrapper
 */
function createControlButton(type){
    var btnClass, iconClass, handler;
    if (type === "plus"){
        btnClass = "element-bar-plus";
        iconClass = "fa fa-plus fa-fw";
        handler = increaseCounter;
    }
    else{
        btnClass = "element-bar-minus";
        iconClass = "fa fa-minus fa-fw";
        handler = decreaseCounter;
    }
    var wrapper = document.createElement("span");
    wrapper.className = "input-group-btn element-bar-button";

    var btn = document.createElement("button");
    btn.className = "btn btn-secondary " + btnClass;
    $(btn).attr("type", "button");
    $(btn).click(handler);

    var icon = document.createElement("i");
    icon.className = iconClass;
    $(icon).attr("aria-hidden", "true");

    btn.appendChild(icon);
    wrapper.appendChild(btn);

    return wrapper;
}
/*
 * Create a counter input (populated with data from the specified object) for
 * tracking how many elements the user wants of a specific type.
 * @param {Object} dataObj object containing the PDS data to generate content from
 * @return {HTML element} counter
 */
function createCounterInput(dataObj) {
    var counter = document.createElement("input");
    counter.className = "form-control element-bar-counter";

    var min = parseInt(dataObj["range"].split("-")[0], 10);
    var max = dataObj["range"].split("-")[1];
    max = (max === "*" ? 9999999999 : parseInt(max, 10));
    if (min === max) {
        $(counter).prop("disabled", true);
    }

    $(counter).attr("min", min);
    $(counter).attr("max", max);
    $(counter).attr("value", min);
    $(counter).attr("type", "number");

    $(counter).focus(captureValue);
    $(counter).keypress(preventInput);
    $(counter).keyup(validateInput);
    $(counter).focusout(releaseValue);

    return counter;
}

/*
 * Create a wrapper div with a label for denoting a group of element choices.
 * @param {string} min minimum total value for the choice group
 * @param {string} max maximum total value for the choice group
 * @return {HTML Element}
 */
function createChoiceGroup(min, max) {
    var cg = document.createElement("div");
    cg.className = "choice-field";
    var label = document.createElement("div");
    label.className = "choice-prompt";
    max = (max === "*" ? "9999999999" : max);
    if (min === max && min === "1") {
        label.innerHTML = "You must keep <b>one</b> of these options:";
    }
    else if (min < max && min === "0") {
        label.innerHTML = "You may <b>keep or remove</b> these options:";
    }
    else {
        label.innerHTML = "You must keep <b>at least</b> one of these options:";
    }

    $(cg).attr("min", min);
    $(cg).attr("max", max);
    $(cg).attr("total", parseInt(min, 10) - 1);

    cg.appendChild(label);
    return cg;
}

/**
 * Show a pop-up warning the user traversing backwards and making a change will cause a loss of all progress
 * NOTE: Pop-up should only show once whenever a user visits a previous step after making forward progress
 * @param currentIndex - A number representing the current step of the wizard
 */
function handleBackwardsTraversalPopup(currentIndex) {
    // If the current index is past the previously recorded max, update the max to match the current
    if (currentIndex >= wizardData.maxStep) {
        wizardData.maxStep = currentIndex;
        wizardData.numWarnings = 0;
    }
    // If the current index is behind the max and there has yet to be a warning pop-up, show the pop-up
    else if (currentIndex < wizardData.maxStep && wizardData.numWarnings === 0) {
        showDeleteProgressPopup(currentIndex);
        wizardData.numWarnings = 1;
    }
}
/**
 * When steps are added to the wizard, the step that was originally going to be
 * navigated to next loses the disabled class. That class controls the styling
 * and functionality of the step element. This function adds that class back in as
 * necessary.
 * @param {number} index of the original next step
 */
function revertStepClass(index){
    var origNextStep = $("#wizard-t-" + index.toString()).parent();
    if (!$(origNextStep).hasClass("disabled")){
        $(origNextStep).addClass("disabled");
    }
}