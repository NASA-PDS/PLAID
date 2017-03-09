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
 * @file Contains the core of the wizard controls. The primary function is
 * initWizard, which contains the settings object controlling the wizard. The other functions
 * control the dynamic creation of steps in the wizard from JSON data as well as controlling
 * the flow of the wizard.
 *
 * Creation Date: 6/16/16.
 *
 * @author Trevor Morse
 * @author Michael Kim
 * @author Stirling Algermissen
 */
/**
 * Initialize the wizard using jQuery-Steps built-in method.
 *
 * Note: Several aspects of the wizard are controlled within functions called in the
 * onStepChanging and onStepChanged methods of the wizard's settings object.
 */
function initWizard(wizard) {
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
            removePopovers();
            if (newIndex === 0 && currentIndex > newIndex){
                return false;
            }
            if (updatePopUp(currentIndex)) {
                return showPopUp(currentIndex, newIndex);
            }
            if (progressData === null)
                progressData = [];
            if (!isLoading && currentIndex < progressData.length){
                return handleBackwardsProgress(currentIndex);
            }
            if (currentIndex < newIndex){
                // TODO - we should do a check here to figure out what
                // page we are on and determine where to go from there
                handleStepAddition(currentIndex, newIndex);
                handleMissionSpecificsStep(currentIndex, newIndex);
                handleExportStep(newIndex);
                discNodesSelection(currentIndex);
            }
            $("ul[role='menu']").show();
            updateActionBar(newIndex);
            return true;
        },
        onStepChanged: function (event, currentIndex, priorIndex) {
            wizardData.currentStep = currentIndex;
            if (currentIndex > priorIndex){
                var priorStepHeading = $("#wizard-t-" + priorIndex.toString());
                var priorStepTitle = (/[A-Za-z].+/.exec(priorStepHeading.text())[0].replace(/ /g, "_"));
                insertCheckmark(priorStepHeading);

                var currStepHeading = $("#wizard-t-" + currentIndex.toString());
                //parse the step title from the overall step element (in the left sidebar)
                var currStepTitle = (/[A-Za-z].+/.exec(currStepHeading.text())[0].replace(/ /g, "_"));
                prepXML(currStepTitle, true); // XML validation disabled until integrated into tool

                if((typeof progressData != "undefined" || progressData != null) &&
                    priorIndex+1 > progressData.length)
                    storeProgress(priorIndex, priorStepTitle);
            }
            handleBackwardsTraversalPopup(currentIndex);
            resetMissionSpecificsBuilder(priorIndex);
            $("#help").empty();
            previewDescription();
            $("#help").fadeIn(400);
        },
        onCanceled: function (event) { },
        onFinishing: function (event, currentIndex) { return true; },
        onFinished: function (event, currentIndex) {
            insertCheckmark($("#wizard-t-" + currentIndex.toString()));

            window.location = "dashboard.php";
        },

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
    wizard.steps(settings);
}
/**
 * Since the wizard object is controlled by jQuery-Steps, it is
 * set to a specific height based on its content. We want to match this
 * height for the sidebar on the right and for the steps bar on the left.
 * @param {object} wizardContent portion of the wizard
 * @param {object} wizardActions bar portion of the wizard
 * @param {object} sidebar
 * @param {object} stepsBar
 */
function matchWizardHeight(wizardContent, wizardActions, sidebar, stepsBar){
    $(sidebar).css("height", $(wizardContent).height() + $(wizardActions).height());
    $(stepsBar).css("height", $(wizardContent).height() + $(wizardActions).height());
}
/**
* Handles the dynamic creation of new steps populated with data from the product
* object created from the PDS4 JSON. This function looks up the corresponding object
* for each element bar in a step, checks if the user opted to add that object,
* and adds a new step accordingly.
* @param {number} currentIndex for the current step in the wizard
* @param {number} newIndex for the next step in the wizard
 */
function handleStepAddition(currentIndex, newIndex){
    var insertionIndex = newIndex;
    var currSection = $("#wizard-p-" + currentIndex.toString());
    var hasRun = false;
    if ($(".optional-section", currSection).length > 0){
        $(".element-bar:not(.stepAdded)", currSection).each(function(){
            var val = $(".element-bar-counter", this).val();
            var metadata = $(".element-bar-input", this).val();
            var path = $(this).attr("data-path");
            var currObj = getObjectFromPath(path, g_jsonData.refObj);
            // TODO -   this val check doesn't seem good enough.
            //          the else if is intended to handle the initial
            //          IM ingestion. everything else should fall under here
            if (val !== "0"){
                if (currentIndex === 1){
                    wizardData.mainSteps.push(currObj['title']);
                    if (!hasRun){
                        prepXML(currObj['title'], false); // XML validation disabled until integrated into tool
                        hasRun = true;
                    }
                }
                //- if the "next" property is defined, then it is a class with children (not an attribute) so
                //  a step should be added
                //- if the "title" property equals "Mission_Area" or
                //- if the "title" property equals "Discipline_Area, then it is a special section handled later in the
                //  tool and a step should not be added
                if (currObj['next'] !== undefined &&
                    currObj['title'] !== "Mission_Area" &&
                    currObj['title'] !== "Discipline_Area"){
                    insertStep($("#wizard"), insertionIndex, currObj);
                    insertionIndex +=1;
                }
                $(this).addClass("stepAdded");
                backendCall("php/xml_mutator.php",
                            "addNode",
                            {path: path, quantity: val, value: metadata, ns: g_jsonData.namespaces[g_state.nsIndex]},
                            function(data){});
            }
            //PLAID currently utilizes a starter label as the base of the XML. This starter label
            //contains one instance of all required and optional elements according to the PDS4 standard.
            //Since not all elements on the top level of the XML (corresponding to the 'Product' step with
            //currentIndex = 1, if the user does not choose to include these elements, they need to be removed
            //from the XML.
            else if (currentIndex === 1 && val === "0"){
                backendCall("php/xml_mutator.php",
                    "removeNode",
                    {path: currObj['path'], ns: ""},
                    function(data){});
            }
        });
    }
}
/*
* Insert a step into the wizard at the specified index with content
* generated from the specified data object.
* @param {Object} wizard
* @param {Number} index zero-based position indicating where in the wizard to insert the step
* @param {Object} dataObj object containing the PDS data to generate content from
 */
function insertStep(wizard, index, dataObj){
    revertStepClass(index);

    // Get the node name from the g_dictInfo global
    var nodeName = g_dictInfo[g_jsonData.namespaces[g_state.nsIndex]].name;
    var title = (dataObj["title"] ? dataObj["title"].replace(/_/g, " ") : nodeName);
    var data = (dataObj["next"] ? dataObj["next"] : dataObj);
    wizard.steps("insert", index, {
        title: title,
        content: generateContent(title, data)
    });
}
/**
* Generate the content section for a new step in the wizard. This function also gets the
* next level of associations for future reference in the data object. This data storing
* is sequential because the JSON is too large to parse all at once.
* @param {string} sectionTitle title of the current section from object data
* @param {Object} dataObj object containing the PDS data to generate content from
* @return {Element} section
 */
function generateContent(sectionTitle, dataObj){
    var section = document.createElement("div");
    section.className = "optional-section";
    var question = document.createElement("p");
    question.className = "question";
    question.innerHTML = "What elements do you want to keep in '" + sectionTitle.charAt(0).toUpperCase() + sectionTitle.slice(1) + "'?";
    section.appendChild(question);
    var subsection = document.createElement("div");
    subsection.className = "data-section";
    // need to sort before iterating through - TODO - clean this up
    var indexArray = [];
    var indexLookup = $.map(dataObj, function(value, index) {
	    return [value];
	});
    var dataArray = $.map(dataObj, function(value, index) {
	    return [value];
	});
    dataArray.sort(function(a, b) {
	    return a[Object.keys(a)[0]].classOrder - b[Object.keys(b)[0]].classOrder;
	});

    $.each(dataArray, function(key, value) {
	    indexArray.push(indexLookup.indexOf(value));
	});

    for (var curIndex in indexArray){
        var index = indexArray[curIndex];
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
            getAssociations(g_jsonData.searchObj, currObj["associationList"], currObj["next"]);

            // TODO: I think this is where we will need to add the node top-level path
            assignObjectPath(index, currObj, currObj["next"]);

            //need to get one more level of associations for displaying sub-elements in the popovers
            getLevelOfAssociations(g_jsonData.searchObj, currObj["next"], false);
            if ($.inArray(currObj["title"], invalidElementsInJSON) !== -1){
                continue;
            }
            else if (dataObj[index].length === 1){
                if (currObj["title"] === "Mission_Area" ||
                    currObj["title"] === "Discipline_Area"){
                    currObj["range"] = "1-1";
                }
                subsection.appendChild(createElementBar(currObj, createLabel, false));
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
/**
* Create an element-bar populated with data from the specified object.
* @param {object} dataObj object containing the information for the element-bar
* @param {function} genLabel function to create the label portion of the element-bar
* @param {bool} isChoice denotes whether this element-bar is in a choice group or not
* @return {Element} elementBar
 */
function createElementBar(dataObj, genLabel, isChoice){
    var elementBar = document.createElement("div");
    elementBar.className = "input-group element-bar";

    // In order to ensure the elementBar ID is unique, we need to append
    // a counter to the identifier based on the number of elements
    // that already exist with this identifier prefix
    // elCounter = $("[id^="+dataObj["identifier"]+"]").length;
    var elements = "[id^=" + dataObj["identifier"].replace(/\./g,'\\.') + "]";
    elCounter = $(elements).length;
    elementBar.id = dataObj["identifier"] + "." + elCounter;

    // Set the data path. This is the traversal path through the JSON
    elementBar.setAttribute('data-path', dataObj["path"]);

    var label = genLabel(dataObj["title"], isChoice);
    elementBar.appendChild(label);

    if (dataObj['next'] === undefined){
        $(elementBar).addClass("valueElementBar");
        $(label).addClass("hasInput");
        var input = createValueInput();
        elementBar.appendChild(input);
    }
    var minusBtn = createControlButton("minus");
    elementBar.appendChild(minusBtn);
    var plusBtn = createControlButton("plus");

    var counter = createCounterInput(dataObj);
    if ($(counter).prop("value") === $(counter).prop("max")){
        $("button", plusBtn).prop("disabled", true);
    }
    if ($(counter).prop("min") === "0") {
        label.className += " zero-instances";
        $(input).prop('disabled', true);
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
/**
 * Create a span to act as a label with the specified text. If it is inside
 * of a choice group, then there is slightly different formatting.
 * @param {string} text
 * @param {bool} isChoice denotes whether this element-bar is in a choice group or not
 * @return {Element} label
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
/**
 * Create an input form for metadata within the label elements.
 * @returns {Element}
 */
function createValueInput(){
    var input = document.createElement("input");
    input.className = "form-control element-bar-input";
    input.type = "text";
    input.placeholder = "Enter value (optional)";
    return input;
}
/**
* Create a plus or minus button for controlling the form in an element-bar.
* @param {string} type ["plus" | "minus"]
* @return {Element} wrapper
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
/**
 * Create a counter input (populated with data from the specified object) for
 * tracking how many elements the user wants of a specific type.
 * Note: if the max is infinite, then it is set as 9999999999.
 * @param {Object} dataObj object containing the PDS data to generate content from
 * @return {Element} counter
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
    $(counter).prop("value", min);
    $(counter).attr("type", "number");

    $(counter).focus(captureValue);
    $(counter).keypress(preventInput);
    $(counter).keyup(validateInput);
    $(counter).focusout(releaseValue);

    return counter;
}
/**
 * Create a wrapper div with a label for denoting a group of element choices.
 * @param {string} min minimum total value for the choice group
 * @param {string} max maximum total value for the choice group
 * @return {Element}
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
    $(cg).attr("total", (min === "0" ? parseInt(min) : parseInt(min, 10) - 1));

    cg.appendChild(label);
    return cg;
}
/**
 * Show a pop-up warning the user traversing backwards and making a change will cause a loss of all progress
 * NOTE: Pop-up should only show once whenever a user visits a previous step after making forward progress
 * @param {number} currentIndex number representing the current step of the wizard
 */
function handleBackwardsTraversalPopup(currentIndex) {
    // If the current index is past the previously recorded max, update the max to match the current
    if (currentIndex >= wizardData.maxStep) {
        wizardData.maxStep = currentIndex;
        wizardData.numWarnings = 0;
    }
    // If the current index is behind the max and there has yet to be a warning pop-up, show the pop-up
    else if (currentIndex < wizardData.maxStep && wizardData.numWarnings === 0) {
        showBackwardsTraversalPopUp(currentIndex);
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
function revertStepClass(index) {
    var origNextStep = $("#wizard-t-" + index.toString()).parent();
    if (!$(origNextStep).hasClass("disabled")) {
        $(origNextStep).addClass("disabled");
    }
}
/*
 * If this is a main section (that was dynamically added), remove all of its
 * child nodes from the XML file.
 * Before it removes the nodes, check if the XML is valid.
 * TODO: Once the PDS4 JSON is bug-free and directly matches the schema, complete validation functionality.
 * @param {string} sectionHeading title of the section
 * @param {bool} isValidating controls call of XML validator
 * Note: since the main sections are always on the first level of the XML, the
 * section's heading is also the section's path.
 */
function prepXML(sectionHeading, isValidating){
    if ($.inArray(sectionHeading, wizardData.mainSteps) !== -1){
        if (isValidating) {
            backendCall("php/xml_mutator.php",
                "addRootAttrs",
                {namespaces: g_jsonData.namespaces},
                function(data){});
           backendCall("php/xml_validator.php",
                        "validate",
                        {},
                        function(data){});


            backendCall("php/xml_mutator.php",
                "removeRootAttrs",
                {namespaces: g_jsonData.namespaces},
                function(data){});
        }
        backendCall("php/xml_mutator.php",
            "removeAllChildNodes",
            {path: sectionHeading, ns: ""},
            function(data){});
    }
}
/**
 * After a user has completed a step, replace the step number with a check mark.
 * @param {Object} stepHeading
 */
function insertCheckmark(stepHeading){
    var number = $(".number", stepHeading)[0];
    number.innerHTML = "<i class=\"fa fa-check fa-fw\" aria-hidden=\"true\"></i>";
}
