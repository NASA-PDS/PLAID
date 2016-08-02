/**
 * Created by mikim on 7/15/16.
 */

/**
 * Upon initialization of the app, creates the Go Back and Save buttons
 * in the same area as the Previous and Next buttons and proceeds to hide them
 */
function addMissionSpecificsActionBar() {
    var bottomArea = $(".actions.clearfix");
    var missionSpecificsActionBar = document.createElement("table");
    missionSpecificsActionBar.className = "missionSpecificsActionBar";
    $(bottomArea).append(missionSpecificsActionBar);

    var row = document.createElement("tr");
    $(".missionSpecificsActionBar").append(row);


    $(".missionSpecificsActionBar tr").append(generateButtonColumn("goBack", "fa-undo", "Go Back"));
    $(".missionSpecificsActionBar tr").append(generateButtonColumn("save", "fa-check", "Save"));

    updateActionBarHandlers("home", ".list-group-item.goBack", ".list-group-item.save");

    $(".missionSpecificsActionBar").hide();
}

/**
 * Helper method for adding button bars to list-group tables
 *
 * @param buttonClass - A class added to the button for easier identification
 * @param iconClass - The class name indicating which FontAwesome icon is used
 * @param spanHTML - The text inside the button
 * @return The generated HTML element
 */
function generateButtonColumn(buttonClass, iconClass, spanHTML) {
    var col = document.createElement("td");
    var button = document.createElement("button");
    button.className = "list-group-item " + buttonClass;
    var icon = document.createElement("i");
    icon.className = "fa fa-fw " + iconClass;
    icon.setAttribute("aria-hidden", "true");
    button.appendChild(icon);
    var span = document.createElement("span");
    span.innerHTML = spanHTML;
    button.appendChild(span);
    col.appendChild(button);

    return col;
}

/**
 * Assigns handlers to the Go Back and Save buttons based on what state the Builder is in
 * when constructing a Mission Specific Dictionary
 *
 * @param builderState - A String key for determining which handlers to give to the action bar buttons
 *                       during the Mission Specifics step
 * @param goBackSelector - The jQuery selector corresponding to the Go Back button
 * @param saveSelector - The jQuery selector corresponding to the Save button
 *
 * CURRENTLY ACCEPTED VALUES FOR builderState:
 *  - "home"   : The indicator for giving action bar buttons the Previous and Next functionality
 *  - "modify" : The indicator for having action bar buttons not leave the jQuery step, but
 *               and instead navigate back to the homepage and updating the Mission Specific
 *               Dictionary JSON accordingly
 *  TODO MAKE HANDLER METHODS UPDATE THE PREVIEW JSON
 */
function updateActionBarHandlers(builderState, goBackSelector, saveSelector) {
    $(goBackSelector).off("click");
    $(saveSelector).off("click");
    if (builderState === "home") {
        $(goBackSelector).click(function() {
            $("#wizard").steps("previous");
        });
        $(saveSelector).click(function() {
            $("#wizard").steps("next");
        });
    } else if (builderState === "modify") {
        $(goBackSelector).click(function() {mutatePage("home", wizardData.currentStep.toString())});
        $(saveSelector).click(function() {mutatePage("home", wizardData.currentStep.toString())});
    }
}

/**
 * Called during the onStepChanging event for jQuery Steps, this function toggles
 * the display between the Previous/Next buttons and Go Back/Save buttons used
 * in either the Mission Specifics or Builder steps
 *
 * @param newIndex - The next index that the user is changing to in the jQuery Steps process
 */
function updateActionBar(newIndex) {
    var actionBar = $(".actions.clearfix");

    var newSection = $("#wizard-p-" + newIndex.toString());
    if ($(".mission_specifics_builder", newSection).length > 0) {
        $(actionBar).children("ul").fadeOut(0, function() {
            $(actionBar).children("table").show();
        });
    } else {
        $(actionBar).children("table").fadeOut(0, function() {
            $(actionBar).children("ul").show();
        });
    }
}

/**
 * Called during the onStepChanging event for jQuery Steps, this function dynamically
 * adds the Mission Specific Dictionary Builder Step based on if the user has selected
 * Yes in the previous step
 *
 * @param currentIndex - Current index of the jQuery Steps process
 * @param newIndex - The next index that the user is changing to
 */
function handleMissionSpecificsStep(currentIndex, newIndex) {
    var insertionIndex = newIndex;
    var currSection = $("#wizard-p-" + currentIndex.toString());
    var isMissionSpecificsStep = $(currSection).find(".mission_specifics").length > 0;
    if (isMissionSpecificsStep && $(".yesButton.active:not(.stepAdded)").length > 0){
        revertStepClass(insertionIndex);
        $(".yesButton").addClass("stepAdded");
        $("#wizard").steps("insert", insertionIndex, {
            title: "Builder",
            content: generateHomepage("mission_specifics_builder")
        });
    }
}

/**
 * Refreshes the content inside the main pane according to what step in the builder
 * the user traverses to
 *
 * @param nextPage - A String variable representing what slide is being navigated to
 * @param step - A String representing which step is being mutated,
 *               derived from the wizardData obj in config.js
 *
 * CURRENTLY ACCEPTED VALUES FOR nextPage:
 *  - "home"       : The homepage for the builder
 *  - "addAttr"    : The page for adding a single attribute
 *  - "addGroup"   : The page for adding a group of attributes
 *
 *  TODO USE GLOBAL CURRENT INDEX VAR AFTER CODE MERGE
 */
function mutatePage(nextPage, step) {
    var section = $("#wizard-p-" + step);
    $(section).empty();

    if (nextPage === "home") {
        $(section).append(generateHomepage("mission_specifics_builder"));
        updateActionBarHandlers("home", ".list-group-item.goBack", ".list-group-item.save");
    } else if (nextPage === "addAttr") {
        $(section).append(generateAddAttributePage("mission_specifics_builder"));
        updateActionBarHandlers("modify", ".list-group-item.goBack", ".list-group-item.save");
    } else if (nextPage === "addGroup") {
        $(section).append(generateAddGroupPage("mission_specifics_builder"));
        updateActionBarHandlers("modify", ".list-group-item.goBack", ".list-group-item.save");
    }
}

/**
 * Dynamically generates the Mission Specific Dictionary Builder homepage in a
 * wrapper div
 *
 * @param wrapperClass - The class name assigned to the div that will wrap this HTML
 * @return The generated HTML representing the homepage
 *
 * TODO MAKE A GENERATE-FUNCTION FOR THE "REMOVE BUTTON" CLICK
 */
function generateHomepage(wrapperClass) {
    var wrapper = document.createElement("div");
    wrapper.className = wrapperClass;

    var question = document.createElement("p");
    question.className = "question";
    question.innerHTML = "Please choose one of the following actions for your Mission Data Dictionary.";
    wrapper.appendChild(question);

    var dataSection = document.createElement("div");
    dataSection.className = "data-section";

    var table = document.createElement("table");
    table.setAttribute("class", "list-group");
    table.appendChild(generateButtonRow("singleAttribute", "fa-tag", "Add an attribute",
        function() {mutatePage("addAttr", wizardData.currentStep.toString())}));
    table.appendChild(generateButtonRow("groupAttribute", "fa-tags", "Add a grouping of attributes",
        function() {mutatePage("addGroup", wizardData.currentStep.toString())}));
    table.appendChild(generateButtonRow("remove", "fa-eraser", "Remove",
        function() {} ));
    dataSection.appendChild(table);

    dataSection.appendChild(generatePreview());

    wrapper.appendChild(dataSection);

    return wrapper;
}

/**
 * Dynamically generates the Mission Specific Dictionary preview container
 * that displays on the homepage
 *
 * @return The HTML element representing the preview container
 */
function generatePreview() {
    var previewContainer = document.createElement("div");
    previewContainer.className = "previewContainer";

    var card = document.createElement("div");
    card.className = "card";

    var cardHeader = document.createElement("div");
    cardHeader.className = "card-header";
    cardHeader.innerHTML = "Mission Specific Dictionary Preview";
    card.appendChild(cardHeader);

    var cardBlock = document.createElement("div");
    cardBlock.className = "card-block";
    cardBlock.id = "previewContent";
    $(cardBlock).tree({
        data: missionSpecifics
        //TODO ALLOW DRAG AND DROP FUNCTIONALITY, IF DESIRED
        /*,
        dragAndDrop: true,
        onCanMove: function(node) {
            if (! node.parent.parent) {
                // Example: Cannot move root node
                return false;
            }
            else {
                return true;
            }
        },
        onCanMoveTo: function(moved_node, target_node, position) {
            if (target_node.getLevel() === 2) {
                // Example: can move inside menu, not before or after
                return false;
            }
            else {
                return true;
            }
        }*/
    });
    card.appendChild(cardBlock);

    previewContainer.appendChild(card);

    return previewContainer;
}

/**
 * Helper method for adding button bars to list-group tables
 *
 * @param buttonClass - A class added to the button for easier identification
 * @param iconClass - The class name indicating which FontAwesome icon is used
 * @param spanHTML - The text inside the button
 * @param onClickHandler - The function to be called when this button is pressed
 * @return The generated HTML table row containing buttons
 */
function generateButtonRow(buttonClass, iconClass, spanHTML, onClickHandler) {
    var row = document.createElement("tr");
    row.className = "label-item-temp";
    var td = document.createElement("td");
    var button = document.createElement("button");
    button.className = "list-group-item " + buttonClass;
    $(button).click(onClickHandler);
    var icon = document.createElement("i");
    icon.className = "fa fa-fw " + iconClass;
    icon.setAttribute("aria-hidden", "true");
    button.appendChild(icon);
    var span = document.createElement("span");
    span.innerHTML = spanHTML;
    button.appendChild(span);
    td.appendChild(button);
    row.appendChild(td);

    return row;
}

/**
 * Dynamically generates inside a wrapper div the Add Single Attribute page for the Mission Specific
 * Dictionary Builder step
 *
 * @param wrapperClass - The class name assigned to the div that will wrap this HTML
 * @return The generated HTML element representing the Add Single Attribute page
 */
function generateAddAttributePage(wrapperClass) {
    var wrapper = document.createElement("div");
    wrapper.className = wrapperClass;
    wrapper.setAttribute("pop-up-id", "addSingleAttribute");

    var question = document.createElement("p");
    question.className = "question";
    question.innerHTML = "Please fill out the following information for your attribute.";
    wrapper.appendChild(question);

    var dataSection = document.createElement("div");
    dataSection.className = "data-section";

    var form = document.createElement("form");
    form.appendChild(generateFieldset("title", "Title", "Ex. photo_id"));
    form.appendChild(generateFieldset("description", "Description", "Ex. Id of a photograph taken on Mars"));
    dataSection.appendChild(form);

    wrapper.appendChild(dataSection);

    return wrapper;
}

/**
 * Dynamically generates inside a wrapper div the Add Group Attribute page for the Mission Specific
 * Dictionary Builder step
 *
 * @param wrapperClass - The class name assigned to the div that will wrap this HTML
 * @return The generated HTML element representing the Add Group Attribute page
 */
function generateAddGroupPage(wrapperClass) {
    var wrapper = document.createElement("div");
    wrapper.className = wrapperClass;
    wrapper.setAttribute("pop-up-id", "addGroupAttribute");

    var question = document.createElement("p");
    question.className = "question";
    question.innerHTML = "Please fill out the following information for your attribute group.";
    wrapper.appendChild(question);

    var dataSection = document.createElement("div");
    dataSection.className = "data-section";

    var form = document.createElement("form");
    form.appendChild(generateFieldset("title", "Title", "Ex. Photos"));
    form.appendChild(generateFieldset("description", "Description", "Ex. Group of photo attributes"));



    dataSection.appendChild(form);

    wrapper.appendChild(dataSection);

    return wrapper;
}

/**
 * Generates a fieldset to be placed into a form
 *
 * @param fieldsetClass - Class name for the fieldset
 * @param labelHTML - The main text instructions to go with this field in the form
 *                    Ex. "Name", "Version Number", "Password"
 * @param placeholderText - Text to be placed as a watermark inside the field
 * @return The HTML element representing the fieldset
 */
function generateFieldset(fieldsetClass, labelHTML, placeholderText) {
    var fieldset = document.createElement("fieldset");
    fieldset.className = "form-group " + fieldsetClass;

    var fieldsetLabel = document.createElement("label");
    fieldsetLabel.innerHTML = labelHTML;
    fieldset.appendChild(fieldsetLabel);

    var fieldsetInput = document.createElement("input");
    fieldsetInput.setAttribute("type", "text");
    fieldsetInput.setAttribute("placeholder", placeholderText);
    fieldsetInput.className = "form-control";
    fieldset.appendChild(fieldsetInput);

    return fieldset;
}

/**
 * Updates the builder to the homepage when step is changed
 */
function updateMissionSpecificsBuilder(priorIndex) {
    var priorSection = $("#wizard-p-" + priorIndex.toString());
    if ($(".mission_specifics_builder", priorSection).length > 0) {
        mutatePage("home", priorIndex.toString());
    }
}