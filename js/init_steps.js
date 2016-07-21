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
    transitionEffect: $.fn.steps.transitionEffect.fade,
    transitionEffectSpeed: 200,

    /* Events */
    onStepChanging: function (event, currentIndex, newIndex) {
        $("#help").fadeOut(200);
        if (currentIndex < newIndex){
            handleStepAddition(currentIndex, newIndex);
            discNodesSelection(currentIndex);
        }
        removePopovers();
        return true;
    },
    onStepChanged: function (event, currentIndex, priorIndex) {
        if (currentIndex > priorIndex){
            var priorStepHeading = $("#wizard-t-" + priorIndex.toString());
            var number = $(".number", priorStepHeading)[0];
            number.innerHTML = "<i class=\"fa fa-check fa-fw\" aria-hidden=\"true\"></i>";
        }
        $("#help").empty();
        previewDescription();
        $("#help").fadeIn(200);
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
 * height for the sidebar on the right.
 * @param {object} wizard
 * @param {object} sidebar
 */
function match_wizard_height(wizard, sidebar){
    $(sidebar).css("height", $(wizard).height());
    $("div.steps").css("height", $(wizard).height());
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
    if ($(".optional-section", currSection)){
        $(".element-bar:not(.stepAdded)", currSection).each(function(){
            var id = $(this).attr("id");
            var elementKeys = id.split("/");
            var currObj = PRODUCTOBJ;
            for (var index in elementKeys){
                currObj = currObj[elementKeys[index]];
                if (index < elementKeys.length-1 && isNaN(elementKeys[index])) { currObj = currObj["next"]; }
            }
            var val = $(".element-bar-counter", this).val();
            //the following handles three checks:
            //- if the counter value (val) is not 0, then the user added an instance of the element
            //- if the "allChildrenRequired" property is not undefined, then it is a class with children (not an attribute)
            //- if the "allChildrenRequired" property is false, then there are optional children
            // if all of these checks are true, then insert a step for the current object/element
            if (val !== "0" &&
                currObj["allChildrenRequired"] !== undefined &&
                !currObj["allChildrenRequired"]){
                insertStep($("#wizard"), insertionIndex, currObj);
                insertionIndex +=1;
            }
            $(this).addClass("stepAdded");
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
            if (dataObj[index].length === 1){
                if (currObj["title"] !== "Mission_Area" &&
                    currObj["title"] !== "Discipline_Area"){
                    subsection.appendChild(createElementBar(currObj, createLabel, false));
                }
            }
            else {
                if (!flag){
                    choicegroup = createChoiceGroup();
                }
                var range = currObj["range"].split("-");
                currObj["range"] = (parseInt(range[0], 10) - 1).toString() + "-" + range[1];
                choicegroup.appendChild(createElementBar(currObj, createLabel, true));
                flag = true;
            }
            getAssociations(JSONOBJ, currObj["associationList"], currObj["next"]);
            assignObjectPath(null, currObj, currObj["next"]);
        }
        if (flag){ subsection.appendChild(choicegroup); }
    }
    section.appendChild(subsection);
    return section;
}
/*
* Create an element-bar populated with data from the specified object.
* @param {list|object} data either a list of data objects or single data object
* @param {function} genLabel function to create the label portion of the element-bar
* @return {HTML element} elementBar
 */
function createElementBar(data, genLabel, isChoice){
    var defaultObj, param;
    if (Array.isArray(data)){
        defaultObj = data[Object.keys(data)[0]];
        param = data;
    }
    else {
        defaultObj = data;
        param = defaultObj["title"];
    }
    var elementBar = document.createElement("div");
    elementBar.className = "input-group element-bar";
    elementBar.id = defaultObj["path"];

    var label = genLabel(param, isChoice);
    elementBar.appendChild(label);

    var minusBtn = createControlButton("minus");
    elementBar.appendChild(minusBtn);
    var plusBtn = createControlButton("plus");

    var counter = createCounterInput(defaultObj);
    if ($(counter).prop("value") === $(counter).prop("max")){
        $("button", plusBtn).prop("disabled", true);
    }
    if ($(counter).prop("min") === "0") {
        label.className += " zero-instances";
    }
    $("button", minusBtn).prop("disabled", true);
    elementBar.appendChild(counter);

    elementBar.appendChild(plusBtn);

    addPopover(elementBar, defaultObj, $(counter).prop("min"), $(counter).prop("max"));

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
 * @return {HTML Element}
 */
function createChoiceGroup(){
    var cg = document.createElement("div");
    cg.className = "choice-field";
    var label = document.createElement("div");
    label.className = "choice-prompt";
    label.innerHTML = "Choose between these options:";
    cg.appendChild(label);
    return cg;
}