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
 *  - "home"     : The indicator for giving action bar buttons the Previous and Next functionality
 *  - "addAttr"  : The indicator for adding a single attribute and having buttons navigate to home
 *  - "addGroup" : The indicator for adding an empty group of attributes and having buttons navigate to home
 *  - "remove"   : The indicator for removing attributes and groups and having buttons navigate to home
 */
function updateActionBarHandlers(builderState, goBackSelector, saveSelector) {
    $(goBackSelector).off("click");
    $(saveSelector).off("click");
    if (builderState === "home") {
        $(goBackSelector).click(function() {
            $("#wizard").steps("previous");
        });
        $(saveSelector).click(function() {
            backendCall("php/xml_mutator.php",
                "addCustomNodes",
                {json: missionSpecifics},
                function(data){ console.log(data);});
            $("#wizard").steps("next");
        });
    } else if (builderState === "addAttr" || builderState === "addGroup" || builderState === "remove") {
        $(goBackSelector).click(function() {mutatePage("home", wizardData.currentStep.toString())});
        $(saveSelector).click(function() {handleSaveButton(builderState)});
    }
}

/**
 * Adjusts the missionSpecifics preview array in the config based on which state of the builder is being
 * completed and what is being inputted into the forms
 *
 * @param builderState - A String representing the state of the builder out of the following
 *                       accepted values:
 * - "addAttr"  : Make the save button add a single attribute to the array
 * - "addGroup" : Make the save button add a group of attributes to the array
 * - "remove"   : Make the save button remove attributes and groups from the array
 */
function handleSaveButton(builderState) {
    if (builderState === "addAttr") {
        createAttribute();
    } else if (builderState === "addGroup") {
        createAttributeGroup();
    } else if (builderState === "remove") {
        removeFromMissionSpecifics();
    }
    mutatePage("home", wizardData.currentStep.toString());
}

/**
 * Adds a single attribute to the missionSpecific data array
 */
function createAttribute() {
    var element = {};
    var groupSelect;
    // TODO XSS
    element.name = $("fieldset.title").find("input").val();
    element.description = $("fieldset.description").find("input").val();
    element.isGroup = false;
    groupSelect = $(".form-group.groupSelect").find("select.form-control").val();
    if (groupSelect === "No Group") {
        missionSpecifics.push(element);
    } else {
        var node;
        for (var i = 0; i < missionSpecifics.length; i++) {
            node = missionSpecifics[i];
            if (node.name === groupSelect) {
                node.children.push(element);
                break;
            }
        }
    }
}

/**
 * Adds an attribute group to the missionSpecific data array
 */
function createAttributeGroup() {
    var element = {};
    element.name = $("fieldset.title").find("input").val();
    element.description = $("fieldset.description").find("input").val();
    element.children = [];
    element.isGroup = true;
    missionSpecifics.push(element);
}

/**
 * Remove attributes/groups from the missionSpecific data array
 */
function removeFromMissionSpecifics() {
    $('input.form-check-input:checked').each(function() {
        var checkedText = $(this).parent().find(".check-span").text();
        var node = $('#removeTree').tree(
            'getNodeByCallback',
            function(node) {
                return node.name === checkedText;
            }
        );
        if (node) {
            $('#removeTree').tree('removeNode', node);
            missionSpecifics = JSON.parse($('#removeTree').tree('toJson'));
            refreshGroupChildren();
        }
    });
    mutatePage("home", wizardData.currentStep.toString());
}

/**
 * For all groups in the mission specifics array, make sure that they have a children array field
 */
function refreshGroupChildren() {
    for (var i = 0; i < missionSpecifics.length; i++) {
        var node = missionSpecifics[i];
        if (node.isGroup && !node.children) {
            node.children = [];
        }
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
 */
function mutatePage(nextPage, step) {
    var section = $("#wizard-p-" + step);
    $(section).empty();

    if (nextPage === "home") {
        $(section).append(generateHomepage("mission_specifics_builder"));
        updateActionBarHandlers("home", ".list-group-item.goBack", ".list-group-item.save");
    } else if (nextPage === "addAttr") {
        $(section).append(generateAddAttributePage("mission_specifics_builder"));
        updateActionBarHandlers("addAttr", ".list-group-item.goBack", ".list-group-item.save");
    } else if (nextPage === "addGroup") {
        $(section).append(generateAddGroupPage("mission_specifics_builder"));
        updateActionBarHandlers("addGroup", ".list-group-item.goBack", ".list-group-item.save");
    } else if (nextPage === "remove") {
        $(section).append(generateRemovePage("mission_specifics_builder"));
        updateActionBarHandlers("remove", ".list-group-item.goBack", ".list-group-item.save");
    }
}

/**
 * Dynamically generates the Mission Specific Dictionary Builder homepage in a
 * wrapper div
 *
 * @param wrapperClass - The class name assigned to the div that will wrap this HTML
 * @return The generated HTML representing the homepage
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
        function() {mutatePage("remove", wizardData.currentStep.toString())}));
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

    generateTree(cardBlock);

    card.appendChild(cardBlock);

    previewContainer.appendChild(card);

    return previewContainer;
}

/**
 * Helper method for generatePreview to populate the preview with the jqTree
 *
 * @param cardBlock - An Element to add the jqTree into
 */

function generateTree(cardBlock) {
    $(cardBlock).tree({
        data: missionSpecifics
        ,
        dragAndDrop: true,
        onCanMove: function(node) {
            return !node.isGroup;
        },
        onCanMoveTo: function(moved_node, target_node, position) {
            return target_node.getLevel() !== 2 && target_node.isGroup;
        }
    });
    // Handles any drag-and-drop action, saving any changes made into the missionSpecifics data in config.js
    $(cardBlock).bind(
        'tree.move',
        function(event) {
            event.move_info.do_move();
            missionSpecifics = JSON.parse($(cardBlock).tree('toJson'));
            refreshGroupChildren();
        }
    );
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
    wrapper.setAttribute("pop-up-id", "addAttr");

    var question = document.createElement("p");
    question.className = "question";
    question.innerHTML = "Please fill out the following information for your attribute.";
    wrapper.appendChild(question);

    var dataSection = document.createElement("div");
    dataSection.className = "data-section";

    var form = document.createElement("form");
    form.appendChild(generateFieldset("title", "Title", "Ex. photo_id"));
    form.appendChild(generateFieldset("description", "Description", "Ex. Id of a photograph taken on Mars"));
    form.appendChild(generateDropdown("groupSelect", "Select a group to add this attribute to:"));
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
    wrapper.setAttribute("pop-up-id", "addGroup");

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
 * Dynamically generates inside a wrapper div the Remove Attributes/Groups page for the Mission Specific
 * Dictionary Builder step
 *
 * @param wrapperClass - The class name for the wrapper div
 * @return The generated HTML element representing the remove page
 */
function generateRemovePage(wrapperClass) {
    var wrapper = document.createElement("div");
    wrapper.className = wrapperClass;

    var question = document.createElement("p");
    question.className = "question";
    question.innerHTML = "Please select which group(s) or attribute(s) you would like to remove.";
    wrapper.appendChild(question);

    generateCheckboxForm(wrapper);

    var tree = document.createElement("div");
    tree.id = "removeTree";
    $(tree).tree({
        data: missionSpecifics
    });
    tree.style.display = "none";
    wrapper.appendChild(tree);

    return wrapper;
}

/**
 * Generates and appends each of the checkbox and label pairs into the given wrapper
 *
 * @param wrapper - The Element to add the checkbox inputs and labels into
 */
function generateCheckboxForm(wrapper) {
    for (var i = 0; i < missionSpecifics.length; i++) {
        var node = missionSpecifics[i];

        var checkWrapper = document.createElement("div");
        checkWrapper.className = "form-check";
        checkWrapper.appendChild(generateCheckbox(node.name, false));

        if (node.isGroup) {
            var children = document.createElement("div");
            children.className = "node-children";
            for (var j = 0; j < node.children.length; j++) {
                var child = node.children[j];
                var childCheckWrapper = document.createElement("div");
                childCheckWrapper.className = "form-check nested";
                childCheckWrapper.appendChild(generateCheckbox(child.name, true));
                children.appendChild(childCheckWrapper);
            }
            checkWrapper.appendChild(children);
        }
        wrapper.appendChild(checkWrapper);
    }
}

/**
 * Generate a checkbox and label input
 *
 * @param node - A String for the name of the checkbox input
 * @returns {Element} - The label and checkbox input
 */
function generateCheckbox(labelName, isChild) {
    var checkLabel = document.createElement("label");
    checkLabel.className = "form-check-label";

    var checkInput = document.createElement("input");
    checkInput.className = "form-check-input";
    checkInput.setAttribute("type", "checkbox");
    checkInput.setAttribute("value", "");
    checkLabel.appendChild(checkInput);

    handleCheckbox(checkInput, isChild);

    var labelSpan = document.createElement("span");
    labelSpan.className = "check-span";
    labelSpan.innerHTML = labelName;
    checkLabel.appendChild(labelSpan);

    return checkLabel;
}

/**
 * Give checkboxes the following two behaviors:
 * 1. If checkbox selected is a group, select all children checkboxes
 * 2. If checkbox deselected is a child, deselect its parent checkbox if checked
 *
 * @param checkInput - The checkbox input element
 * @param isChild - Boolean stating if checkbox is a child
 *
 * TODO optimize jquery selectors
 */
function handleCheckbox(checkInput, isChild) {
    $(checkInput).click(function() {
        if (isChild && !$(checkInput).is(':checked')) {
            $(this).parents(".node-children").siblings(".form-check-label").find(".form-check-input").prop("checked", false);
        } else if ($(checkInput).is(':checked')) {
            $(this).parents(".form-check-label").siblings(".node-children").find(".form-check.nested").each(function() {
                $(this).find(".form-check-input").prop("checked", true);
            });
        }
    });
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
 * Dynamically generate the dropdown bar and label for selecting which group to add a single attribute to
 *
 * @param wrapperClass - The name for the element encasing the label and dropdown
 * @param labelHTML - The text of the label preceding the dropdown
 * @returns {Element} - The dropdown bar filled with group elements from the config
 */
function generateDropdown(wrapperClass, labelHTML) {
    var wrapper = document.createElement("div");
    wrapper.className = "form-group " + wrapperClass;

    var label = document.createElement("label");
    label.innerHTML = labelHTML;
    wrapper.appendChild(label);
    wrapper.appendChild(generateDropdownSelect());

    return wrapper;
}

/**
 * Generates the dropdown bar and the options associated with it, in this case it is used to
 * load the attribute groups into the dropdown select
 *
 * @returns {Element} - Dropdown bar with all attribute groups found in missionSpecifics in config.js
 */
function generateDropdownSelect() {
    var wrapper = document.createElement("select");
    wrapper.className = "form-control";

    wrapper.appendChild(generateOption("No Group"));
    for (var i = 0; i < missionSpecifics.length; i++) {
        var node = missionSpecifics[i];
        if (node.isGroup) {
            wrapper.appendChild(generateOption(node.name));
        }
    }

    return wrapper;
}

/**
 * Generate an option for the dropdown select in the addSingleAttribute page
 *
 * @param optionName -  A String representing the name of the option
 * @returns {Element} - The dropdown option
 */
function generateOption(optionName) {
    var option = document.createElement("option");
    option.innerHTML = optionName;
    return option;
}

/**
 * Resets the builder to the homepage when step is changed
 */
function resetMissionSpecificsBuilder(priorIndex) {
    var priorSection = $("#wizard-p-" + priorIndex.toString());
    if ($(".mission_specifics_builder", priorSection).length > 0) {
        mutatePage("home", priorIndex.toString());
    }
}