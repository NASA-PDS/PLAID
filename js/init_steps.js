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
            if (!g_state.loading && currentIndex < progressData.length){

                // when a class from a previous page is removed, handle recursive removal
                // of that page and skip the addition steps below
                var classRemoved = false;
                switch (progressData[currentIndex]['step']){
                    case 'discipline_dictionaries':
                        classRemoved = areDifferentDisciplineNodes(progressData[currentIndex]);
                        break;
                    case 'optional_nodes':
                        classRemoved = areDifferentOptionalNodes(progressData[currentIndex]);
                        break;
                }
                if(classRemoved) {
                    console.log("skipping step addition");
                    // Something was removed, skip addition steps
                    return;
                }
            }
            if (newIndex > currentIndex){

                var indentLevel = 0;
                if(typeof(progressData[currentIndex]) != "undefined" && progressData[currentIndex]['step']=='optional_nodes'){
                    pathParts = progressData[currentIndex]['step_path'].split('/');
                    indentLevel = pathParts.length>2?pathParts.length:0;
                }else if(typeof(progressData[currentIndex]) != "undefined" && progressData[currentIndex]['step']=='builder'){
                    indentlevel = 1;
                }

                // TODO - we should do a check here to figure out what
                // page we are on and determine where to go from there
                handleStepAddition(currentIndex, newIndex, indentLevel, progressData[currentIndex]);
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

            var stepContent = $("#wizard-p-" + priorIndex);
            //progressObj['step_path'] = $(".optional-section", stepContent).attr("step_path");
            if(g_state.loading && typeof $(".optional-section", stepContent).attr("no_save_data") != 'undefined') {

            } else {
                if (currentIndex > priorIndex) {
                    var priorStepHeading = $("#wizard-t-" + priorIndex.toString());
                    var priorStepTitle = (/[A-Za-z].+/.exec(priorStepHeading.text())[0].replace(/ /g, "_"));
                    insertCheckmark(priorStepHeading);

                    var currStepHeading = $("#wizard-t-" + currentIndex.toString());
                    //parse the step title from the overall step element (in the left sidebar)
                    var currStepTitle = (/[A-Za-z].+/.exec(currStepHeading.text())[0].replace(/ /g, "_"));
                    prepXML(currStepTitle, false); // XML validation disabled until integrated into tool

                    if ((typeof progressData != "undefined" || progressData != null) && !g_state.loading) {
                        // need to only call storeprogress when appropriate
                        storeProgress(priorIndex, priorStepTitle, (priorIndex + 1 > progressData.length));
                        if (currentIndex > priorIndex){

                            var indentLevel = 0;
                            if(typeof(progressData[priorIndex]) != "undefined" && progressData[priorIndex]['step']=='optional_nodes'){
                                pathParts = progressData[priorIndex]['step_path'].split('/');
                                indentLevel = pathParts.length>2?pathParts.length:0;
                            }else if(typeof(progressData[priorIndex]) != "undefined" && progressData[priorIndex]['step']=='builder'){
                                indentlevel = 1;
                            }
                            handleStepAddition(priorIndex, currentIndex, indentLevel, progressData[priorIndex]);
                        }
                    }
                }
            }
            if (currentIndex >= wizardData.maxStep) {
                wizardData.maxStep = currentIndex;
            }
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
    // window.location.replace(location)
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
function handleStepAddition(currentIndex, newIndex, indentation, stepObj){
    var insertionIndex = newIndex;


    // Indent step-link-list-items to show step hierarchy
    if(typeof(stepObj) != "undefined" && stepObj['step']=='optional_nodes') {
        // $('#wizard-t-' + currentIndex).parent().css('padding-left', stepObj['step_path'].split('/').length * 10 );
        $('#wizard-t-' + currentIndex).parent().css('padding-left', stepObj['step_path'].split('/').length * 10 );
    }

    var currSection = $("#wizard-p-" + currentIndex.toString());
    var hasRun = false;
    if ($(".optional-section", currSection).length > 0){
        var parentObj = $(".optional-section", currSection);
        $(".element-bar", currSection).each(function(barIndex, value){
            if(!$(this).hasClass("stepAdded")) {
                var val = $(".element-bar-counter", this).val();
                var metadata = $(".element-bar-input", this).val();
                if($(".selectpicker", this).length != 0) {
                    metadata = $(".selectpicker", this).val();
                }

                var path = $(this).attr("data-path");

                var currObj = getObjectFromPath(path, g_jsonData.refObj);

                if (typeof $(this).attr("data-path-corrected") != 'undefined') {
                    currObj["path"] = $(this).attr("data-path-corrected");
                }


                // TODO -   this val check doesn't seem good enough.
                //          the else if is intended to handle the initial
                //          IM ingestion. everything else should fall under here
                if (val !== "0") {

                    if (currentIndex === 1) {
                        wizardData.mainSteps.push(currObj['title']);

                        if (!hasRun) {
                            prepXML(currObj['title'], false); // XML validation disabled until integrated into tool
                            hasRun = true;
                        }
                    }


                    //- if the "next" property is defined, then it is a class with children (not an attribute) so
                    //  a step should be added
                    //- if the "title" property equals "Mission_Area" or
                    //- if the "title" property equals "Discipline_Area, then it is a special section handled later in the
                    //  tool and a step should not be added
                    if (currObj['next'] !== undefined && currObj['title'] !== "Mission_Area" && currObj['title'] !== "Discipline_Area") {

                        insertStep($("#wizard"), insertionIndex, currObj, g_jsonData.namespaces[g_state.nsIndex], val);

                        for(var i = 1; i <= val; i++) {
                            wizardData.stepPaths.splice(insertionIndex - getStepOffset(insertionIndex), 0, currObj['path'] + "[" + i + "]");
                            insertionIndex += 1;
                            wizardData.allSteps.push(currObj['title']);
                        }

                    }
                    $(this).addClass("stepAdded");
                    if (typeof $(this).attr("data-path-corrected") != 'undefined') {
                        path = $(this).attr("data-path-corrected"); // some attributes/classes are generic and need to apply to the current class
                    }
                    backendCall("php/xml_mutator.php",
                        "addNode",
                        {path: path, quantity: val, value: metadata, ns: g_jsonData.namespaces[g_state.nsIndex]},
                        function (data) {
                        });
                }
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
function insertStep(wizard, index, dataObj, ns, quantity){

    if(index > wizardData.maxStep) {
        revertStepClass(index);
    }
    // Get the node name from the g_dictInfo global
    var nodeName = g_dictInfo[g_jsonData.namespaces[g_state.nsIndex]].name;
    var title = (dataObj["title"] ? dataObj["title"].replace(/_/g, " ") : nodeName);
    var data = (dataObj["next"] ? dataObj["next"] : dataObj);

    if(quantity > 1) {
        for(var i = quantity; i > 0; i--) {
            wizard.steps("insert", index, {
                title: title + " #" + i,
                content: generateContent(title, data, dataObj, ns, i, quantity)
            });
        }
    } else {
        wizard.steps("insert", index, {
            title: title,
            content: generateContent(title, data, dataObj, ns, 1, quantity)
        });
    }

    $(".selectpicker").selectpicker("render"); // select pickers need to rendered after being appended;
}
/**
 * Generate the content section for a new step in the wizard. This function also gets the
 * next level of associations for future reference in the data object. This data storing
 * is sequential because the JSON is too large to parse all at once.
 * @param {string} sectionTitle title of the current section from object data
 * @param {Object} dataObj object containing the PDS data to generate content from
 *@param {Object} parentObj parent class of the dataObj
 *@param {String} namespace of dataObj
 *@param {number} iteration of this object - if a users adds 3 of the same class this indicates which the current is
 *@param {number} total iterations of this object
 * @return {Element} section
 */
function generateContent(sectionTitle, dataObj, parentObj,ns, iteration, quantity){

    var parentPath = parentObj["path"];
    if(sectionTitle == g_dictInfo["pds"]["name"]) { // TODO - FIX WHEN LABEL ROOT has a [1] prepended - this is just looking for "LABEL ROOT"
        parentPath = g_dictInfo["pds"]["name"];
    }
    var section = document.createElement("div");
    $(section).attr("namespace", ns);
    $(section).attr("step_path", parentPath);
    section.className = "optional-section";
    var question = document.createElement("p");
    question.className = "question";
    question.innerHTML = "What elements do you want to keep in '" + sectionTitle.charAt(0).toUpperCase() + sectionTitle.slice(1) + "'?";
    if(quantity > 1) {
        // This is one of many appended classes. Label each one with a number
        question.innerHTML = "What elements do you want to keep in '" + sectionTitle.charAt(0).toUpperCase() + sectionTitle.slice(1) + "' #" + iteration + "?";
        $(section).attr("iteration", iteration);
        if(sectionTitle != g_dictInfo["pds"]["name"]) {
            parentPath = parentPath + "[" + iteration + "]";
        }

    } else {
        if(sectionTitle != g_dictInfo["pds"]["name"]) {
            parentPath = parentPath + "[1]";
        }
        $(section).attr("iteration", 1);
    }


    section.appendChild(question);
    var subsection = document.createElement("div");
    subsection.className = "data-section";
    // need to sort before iterating through
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
            if(typeof currObj["associationList"] != 'undefined') {
                for (var k = 0; k < currObj["associationList"].length; k++) {
                    if (currObj["associationList"][k]["association"]["assocType"] == "parent_of") {
                        currObj.generalization = currObj["associationList"].splice(k, 1)[0];
                    }
                }
            }

            //get immediate associations for creating next steps/element-bars
            getAssociations(g_jsonData.searchObj, currObj, currObj["next"]);

            // TODO: I think this is where we will need to add the node top-level path
            assignObjectPath(index, currObj, currObj["next"]);

            //need to get one more level of associations for displaying sub-elements in the popovers
            getLevelOfAssociations(g_jsonData.searchObj, currObj["next"], false);
            if ($.inArray(currObj["title"], invalidElementsInJSON) !== -1){

            }
            else if (dataObj[index].length === 1){
                if (currObj["title"] === "Mission_Area" ||
                    currObj["title"] === "Discipline_Area"){
                    currObj["range"] = "1-1";
                }
                subsection.appendChild(createElementBar(currObj, createLabel, false, parentPath));
            }
            else {
                var range = currObj["range"].split("-");
                if (!flag){
                    choicegroup = createChoiceGroup(range[0], range[1]);
                }
                range[0] = (range[0] === "0" ? range[0] : (parseInt(range[0], 10) - 1).toString());
                currObj["range"] =  range[0] + "-" + range[1];
                choicegroup.appendChild(createElementBar(currObj, createLabel, true, parentPath));
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
function createElementBar(dataObj, genLabel, isChoice, parentPath){
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
    if(!dataObj["path"].startsWith(parentPath) && typeof parentPath != 'undefined' && parentPath != g_dictInfo["pds"]["name"]) {
        // console.log("Need to correct " + dataObj["path"] + " with parent " + parentPath);
        var arrayPath = dataObj["path"].split("/");
        parentPath = parentPath + "/" + arrayPath[arrayPath.length-2] + "/" + arrayPath[arrayPath.length-1];
        // console.log("Corrected path: " + parentPath);
        elementBar.setAttribute('data-path-corrected', parentPath);

    }
    var label = genLabel(dataObj["title"], isChoice);
    elementBar.appendChild(label);

    if (dataObj['next'] === undefined){
        $(elementBar).addClass("valueElementBar");
        $(label).addClass("hasInput");
        var input = createValueInput(dataObj);
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

    // Highlight the element bar if this item is in the list of recommendedElementDataPaths
    var isRecommended = false;
    recommendedElementDataPaths.forEach(function(path) {
        if(dataObj["path"].match(path)){
            elementBar.style.cssText = 'box-shadow: 0 0 15px #00F5FF;';
            isRecommended = true;
        }
    });

    addPopover(elementBar, dataObj, $(counter).prop("min"), $(counter).prop("max"), isRecommended);

    //  IF in Basic Mode
    if (g_isBasicMode) {
        //  IF this element has a data path that is contained in the advancedModeElementDataPaths config array
        if (advancedModeElementDataPaths.includes(dataObj["path"])) {
            //  Hide the element completely when in Basic mode
            ///elementBar.style.display = "none";
            //  Hide the element when in Basic mode, but leave an empty row where it should be
            elementBar.style.visibility = "hidden";
        }
    }

    //  IF this element has a data path that is contained in the deprecatedElementDataPaths config array
    if (deprecatedElementDataPaths.includes(dataObj["path"])) {
        //  Hide the element completely when it's deprecated
        ///elementBar.style.display = "none";
        //  Hide the element when it's deprecated, but leave an empty line where it should be
        elementBar.style.visibility = "hidden";
    }

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
function createValueInput(dataObj){
    if(typeof(dataObj.PermissibleValueList) != 'undefined') {
        // Make dropdown with permissible values
        var permissibleSelect = document.createElement("select");
        $(permissibleSelect).attr("data-width", "36.5%");
        $(permissibleSelect).attr("data-container", "body");
        $(permissibleSelect).attr("title", "Choose a value");
        $(permissibleSelect).addClass("selectpicker");


        for(var i = 0; i< dataObj.PermissibleValueList.length; i++) {
            var current_value = dataObj.PermissibleValueList[i].PermissibleValue;
            var permissibleOption = document.createElement("option");
            $(permissibleOption).text(current_value.value);
            //$(permissibleOption).attr("data-subtext", current_value.valueMeaning); -disabled until bootstrap is stable
            $(permissibleSelect).append(permissibleOption);
            $(permissibleOption).attr("name", current_value.text);
            $(permissibleOption).popover({
                container: "body",
                title: "Definition",
                content: current_value.valueMeaning,
                trigger: "hover",
                selector: true
            });
        }
        return permissibleSelect;
    } else {
        var input = document.createElement("input");
        input.className = "form-control element-bar-input";
        input.type = "text";
        input.placeholder = "Enter value (optional)";
        return input;
    }
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

        }
        backendCall("php/xml_mutator.php",
            "removeRootAttrs",
            {namespaces: g_jsonData.namespaces},
            function(data){});
        /*
         backendCall("php/xml_mutator.php",
         "removeAllChildNodes",
         {path: sectionHeading, ns: ""},
         function(data){});
         */
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

/**
 * Called when the user has toggled the Basic Mode toggle button.
 */
function basicModeToggled(isBasicMode){
    ///console.log("Basic Mode = " + isBasicMode);
    //  Store the value into a global
    g_isBasicMode = isBasicMode;
    //  Get all of the element bars
    var elementBarList = document.getElementsByClassName("input-group element-bar");
    for (var i=0; i < elementBarList.length; i++) {
        var dataPath = elementBarList[i].getAttribute("data-path");
        //  IF the dataPath is in the advanced list
        if (advancedModeElementDataPaths.includes(dataPath)) {
            //  IF in Basic Mode
            if (isBasicMode) {
                //  Hide the element completely
                ///elementBarList[i].style.display = "none";
                //  Hide the element, but leave an empty row where it should be
                elementBarList[i].style.visibility = "hidden";
            } else {
                //  Show the element
                ///elementBarList[i].style.display = "inline";         //  "block";
                elementBarList[i].style.visibility = "visible";
            }
        }
    }
}
