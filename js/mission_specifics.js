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
 * @file Contains the functions for loading and displaying mission specifics data as well as generating the UI
 * within the wizard that allow users to interact with this data. For the builder step, it should be noted that
 *
 * Note: For the builder step, the HTML for this step is being reset and set as the user progresses. This is different
 * from the traditional flow of the wizard for all previous steps where a UI change meant a step change.
 * 
 * Creation Date: 7/15/16.
 * 
 * @author Michael Kim
 * @author Trevor Morse
 * @author Stirling Algermissen
 */

var selectedNode = null;  //  the currently selected Node in the Preview Tree

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
 * @param {string} buttonClass A class added to the button for easier identification
 * @param {string} iconClass The class name indicating which FontAwesome icon is used
 * @param {string} spanHTML The text inside the button
 * @return {Element} The generated HTML element
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
 * @param {string} builderState A String key for determining which handlers to give to the action bar buttons
 *                 during the Mission Specifics step
 * @param {string} goBackSelector The jQuery selector corresponding to the Go Back button
 * @param {string} saveSelector The jQuery selector corresponding to the Save button
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

        //  On main Builder page's Save button click
        $(saveSelector).click(function() {
            handleSaveButton(builderState);
        });
    } else if (builderState === "addAttr" || builderState === "addGroup" || builderState === "remove" ||
        builderState === "editAttr" || builderState === "editGroup") {
        $(goBackSelector).click(function() {mutatePage("home", wizardData.currentStep.toString())});
        $(saveSelector).click(function() {
            handleSaveButton(builderState);
            storeBuilder({});
        });
    }
}

/**
 * Adjusts the missionSpecifics preview array in the config based on which state of the builder is being
 * completed and what is being inputted into the forms
 *
 * @param {string} builderState A String representing the state of the builder out of the following
 *                 accepted values:
 * - "home"     : Make the save button store attributes and groups from the main Mission Specifics page
 * - "addAttr"  : Make the save button add a single attribute to the array
 * - "addGroup" : Make the save button add a group of attributes to the array
 * - "remove"   : Make the save button remove attributes and groups from the array
 */
function handleSaveButton(builderState) {
    if (builderState === "addAttr" || builderState == "addGroup" || builderState == "editAttr" || builderState == "editGroup"){
        var name = $("fieldset.title").find("input");
        if(!isValidMSInput(name))
            return false;
        if (builderState === "addAttr") {
            createAttribute();
        } else if (builderState === "editAttr") {
            modifyAttribute();
        } else if (builderState === "addGroup") {
            createAttributeGroup();
        } else if (builderState === "editGroup") {
            modifyAttributeGroup();
        }
        mutatePage("home", wizardData.currentStep.toString());
    } else if (builderState === "remove") {
        removeFromMissionSpecifics();
        mutatePage("home", wizardData.currentStep.toString());
    } else if (builderState === "home") {
        //  Get the schema version
        var schemaVersion = getParameterByName("version");

        //  Get the value entered in the Mission Name textbox
        var missionName = $("fieldset.missionName").find("input").val();
        //  Get the value entered in the Steward Id textbox
        var stewardId = $("fieldset.stewardId").find("input").val();
        //  Get the value entered in the Namespace Id textbox
        var namespaceId = $("fieldset.namespaceId").find("input").val();
        //  Get the value entered in the Comment textbox
        var comment = $("fieldset.comment").find("input").val();
        //  Collect the textbox values into a global data structure
        missionSpecificsHeader.missionName = missionName;
        missionSpecificsHeader.stewardId = stewardId;
        missionSpecificsHeader.namespaceId = namespaceId;
        missionSpecificsHeader.comment = comment;

        backendCall("php/xml_mutator.php",
            "addCustomNodes",
            {json: missionSpecifics, missionSpecificsHeader: missionSpecificsHeader, schemaVersion: schemaVersion},
            function(data){ console.log(data);});
        $("#wizard").steps("next");
    }
}

/**
 * Gets the values of a Mission-specific attribute
 */
function getAttributeInfo() {
    var element = {};
    //  Get the Name
    element.name = $("fieldset.title").find("input").val();
    element.nullable = "false";
    element.enumFlag = "false";
    //  For each checked checkbox
    $('input.form-check-input:checked').each(function() {
        var checkedText = $(this).parent().find(".check-span").text();
        //  IF the Nullable checkbox
        if (checkedText === "Nullable") {
            element.nullable = "true";
        } else if (checkedText === "Enumeration Flag") {
            element.enumFlag = "true";
        }
    });

    //  Get the list of enumerated values
    element.permissibleValues = $("fieldset.permissibleValues").find("input").val();
    var dataTypeSelect = $(".form-group.dataTypeSelect").find("select.form-control").val();
    //  Require a Data Type to be selected
    ///if (dataTypeSelect !== NO_DATA_TYPE_SELECTED) {
       element.dataType =dataTypeSelect;
    ///}
    var unitTypeSelect = $(".form-group.unitTypeSelect").find("select.form-control").val();
    //  TODO:  Require a Unit Type to be selected???
    ///if (unitTypeSelect !== NO_UNIT_TYPE_SELECTED) {
       element.unitType =unitTypeSelect;
    ///}
    element.description = $("fieldset.description").find("input").val();
    element.isGroup = false;
    ///groupSelect = $(".form-group.groupSelect").find("select.form-control").val();
    return element;
}

/**
 * Adds a single attribute to the missionSpecific data array
 */
function createAttribute() {
    var element = getAttributeInfo();
    var groupSelect;

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
 * Changes a single attribute in the missionSpecific data array
 */
function modifyAttribute() {
    var groupSelect;
    var nodeInMSTree = null;

    //  Get the selected Group from the dropdown list
    groupSelect = $(".form-group.groupSelect").find("select.form-control").val();

    //  Get the selected node's parent
    var parentOfSelectedNode = selectedNode.parent;
    var prevGroupNameOfSelectedNode = "No Group";
    //  IF the parent node is a Group
    if (parentOfSelectedNode.isGroup) {
        prevGroupNameOfSelectedNode = parentOfSelectedNode.name;
    }
    //  IF the selected node's Group has been changed,
    if (prevGroupNameOfSelectedNode !== groupSelect) {
        //  Find the selected node in the tree that's on this page
        //  The selected node is in the tree that is on the previous page
        var node = $('#editTree').tree(
            'getNodeByCallback',
            function(node) {
                return node.name === selectedNode.name;
            }
        );

        //  IF the node was found in the tree
        if (node) {
            //  Need to remove the node (from the old group), and add it as a child of the new group
            //  Remove the node (from the old group) in the jqTree
            $('#editTree').tree('removeNode', node);
            //  Update the missionSpecifics array to reflect the change in the jqTree
            missionSpecifics = JSON.parse($('#editTree').tree('toJson'));
            refreshGroupChildren();

            //  Add a new node as a child of the new group
            createAttribute();
        }

    } else {
        //  Find the selected node in the tree that's on this page
        //  The selected node is in the tree that is on the previous page
        var node = $('#editTree').tree(
            'getNodeByCallback',
            function(node) {
                return node.name === selectedNode.name;
            }
        );

        //  IF the node was found in the tree
        if (node) {
            //  Update the values in the existing tree node
            var element = getAttributeInfo();
            //  Update the selected node in the jqTree
            $('#editTree').tree('updateNode', node, element);
            //  Update the missionSpecifics array to reflect the change in the jqTree
            missionSpecifics = JSON.parse($('#editTree').tree('toJson'));
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
 * Modifies an attribute group in the missionSpecific data array
 */
function modifyAttributeGroup() {
    //  Find the selected node in the tree that's on this page
    //  The selected node is in the tree that is on the previous page
    var node = $('#editTree').tree(
        'getNodeByCallback',
        function(node) {
            return node.name === selectedNode.name;
        }
    );

    //  IF the node was found in the tree
    if (node) {
        //  Update the values in the existing tree node
        var element = {};
        element.name = $("fieldset.title").find("input").val();
        element.description = $("fieldset.description").find("input").val();
        node.name = element.name;
        node.description = element.description;
        //  Update the selected node in the jqTree
        ///$('#editTree').tree('updateNode', node, element);
        //  Update the missionSpecifics array to reflect the change in the jqTree
        missionSpecifics = JSON.parse($('#editTree').tree('toJson'));
    }
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
 * Check if the field is empty or contains any spaces.
 * @param {Object} jQuery selected field input to check
 * @returns {boolean}
 */
function isValidMSInput(field){
    if ($(field).val().search(/\s/g) !== -1 || $(field).val() === ""){
        $(field).addClass("error");
        return false;
    }
    else {
        $(field).removeClass("error");
        return true;
    }
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
 * @param {number} newIndex The next index that the user is changing to in the jQuery Steps process
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
 * @param {number} currentIndex Current index of the jQuery Steps process
 * @param {number} newIndex The next index that the user is changing to
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
 * @param {string} nextPage A String variable representing what slide is being navigated to
 * @param {string} step A String representing which step is being mutated,
 *                 derived from the wizardData obj in config.js
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
        $(section).append(generateEditAttributePage("mission_specifics_builder", null));
        updateActionBarHandlers("addAttr", ".list-group-item.goBack", ".list-group-item.save");
    } else if (nextPage === "editAttr") {
        $(section).append(generateEditAttributePage("mission_specifics_builder", selectedNode));
        updateActionBarHandlers("editAttr", ".list-group-item.goBack", ".list-group-item.save");
    } else if (nextPage === "addGroup") {
        $(section).append(generateEditGroupPage("mission_specifics_builder", null));
        updateActionBarHandlers("addGroup", ".list-group-item.goBack", ".list-group-item.save");
    } else if (nextPage === "editGroup") {
        $(section).append(generateEditGroupPage("mission_specifics_builder", selectedNode));
        updateActionBarHandlers("editGroup", ".list-group-item.goBack", ".list-group-item.save");
    } else if (nextPage === "remove") {
        $(section).append(generateRemovePage("mission_specifics_builder"));
        updateActionBarHandlers("remove", ".list-group-item.goBack", ".list-group-item.save");
    }
}

/**
 * Dynamically generates the Mission Specific Dictionary Builder homepage in a
 * wrapper div
 *
 * @param {string} wrapperClass The class name assigned to the div that will wrap this HTML
 * @return {Element} The generated HTML representing the homepage
 */
function generateHomepage(wrapperClass) {
    var wrapper = document.createElement("div");
    wrapper.className = wrapperClass;

    var question = document.createElement("p");
    question.className = "question";
    question.innerHTML = "Please define your Mission Data Dictionary.";
    wrapper.appendChild(question);

    var dataSection = document.createElement("div");
    dataSection.className = "data-section";

    //  Add some textbox controls for the Mission-specific header info.
    //  Set the initial values w/ the value in the global Mission-specific header data,
    //  into which the values have been loaded from the DB
    var form = document.createElement("form");
    var missionNameFieldset = generateFieldset("missionName", "Mission Name", "Ex. Display");
    if ((missionSpecificsHeader.missionName !== undefined) && (missionSpecificsHeader.missionName !== "")) {
        //  Set the value in the Mission Name textbox
        $('input', missionNameFieldset).val(missionSpecificsHeader.missionName);
    }
    form.appendChild(missionNameFieldset);
    var stewardIdFieldset = generateFieldset("stewardId", "With which PDS node are you working to build this mission dictionary?", "Ex. img");
    if ((missionSpecificsHeader.stewardId !== undefined) && (missionSpecificsHeader.stewardId !== "")) {
        //  Set the value in the Steward Id textbox
        $('input', stewardIdFieldset).val(missionSpecificsHeader.stewardId);
    }
    form.appendChild(stewardIdFieldset);
    var namespaceIdFieldset = generateFieldset("namespaceId", "Namespace", "Ex. msl");
    if ((missionSpecificsHeader.namespaceId !== undefined) && (missionSpecificsHeader.namespaceId !== "")) {
        //  Set the value in the Namespace Id textbox
        $('input', namespaceIdFieldset).val(missionSpecificsHeader.namespaceId);
    }
    form.appendChild(namespaceIdFieldset);
    var commentFieldset = generateFieldset("comment", "Comment", "Enter a comment");
    if ((missionSpecificsHeader.comment !== undefined) && (missionSpecificsHeader.comment !== "")) {
        //  Set the value in the Comment textbox
        $('input', commentFieldset).val(missionSpecificsHeader.comment);
    }
    form.appendChild(commentFieldset);

    dataSection.appendChild(form);

    var labelAboveButtons = document.createElement("label");
    labelAboveButtons.innerHTML = "Please choose one of the following actions for your Mission Data Dictionary:";
    dataSection.appendChild(labelAboveButtons);

    var table = document.createElement("table");
    table.setAttribute("class", "list-group");
    table.appendChild(generateButtonRow("singleAttribute", "fa-tag", "Add an attribute",
        function() {mutatePage("addAttr", wizardData.currentStep.toString())}));
    table.appendChild(generateButtonRow("groupAttribute", "fa-tags", "Add a grouping of attributes",
        function() {mutatePage("addGroup", wizardData.currentStep.toString())}));
    table.appendChild(generateButtonRow("remove", "fa-eraser", "Remove",
        function() {mutatePage("remove", wizardData.currentStep.toString())}));
    table.appendChild(generateButtonRow("edit", "fa-tag-edit", "Edit",
        function() {checkIfTreeSelection()}));
    dataSection.appendChild(table);

    dataSection.appendChild(generatePreview());

    wrapper.appendChild(dataSection);

    return wrapper;
}

/**
 * Dynamically generates the Mission Specific Dictionary preview container
 * that displays on the homepage
 *
 * @return {Element} The HTML element representing the preview container
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
 * @param {Element} cardBlock - An Element to add the jqTree into
 */
function generateTree(cardBlock) {
    $(cardBlock).tree({
        data: missionSpecifics
        ,
        dragAndDrop: true,
        selectable: true,
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
            storeBuilder({});
        }
    );
    // bind 'tree.select' event
    $(cardBlock).bind(
        'tree.select',
        function(event) {
            if (event.node) {
               // The selected node is 'event.node'
                selectedNode = event.node;
                console.log(selectedNode.name + " was selected.");
            } else {
                //  the node was de-selected
                var prevNode = event.previous_node;
                console.log(prevNode.name + " was de-selected.");
                selectedNode = null;
            }
        }
    );
    // bind 'tree.dblclick' event
    $(cardBlock).bind(
        'tree.dblclick',
        function(event) {
            // The double-clicked node is 'event.node'
            selectedNode = event.node;
            console.log(selectedNode.name + " was double-clicked.");
            //  IF a Group node
            if (selectedNode.isGroup) {
                //  Call the Edit Group routine
                mutatePage("editGroup", wizardData.currentStep.toString());
            } else {
                //  Call the Edit Attribute routine
                mutatePage("editAttr", wizardData.currentStep.toString());
            }
        }
    );
}

/**
 * Helper method for checking if an item is currently selected in the Preview Tree
 */
function checkIfTreeSelection() {
    if (selectedNode === null) {
        alert("Need to select an item in the Preview Tree.");
        console.log("Need to select an item in the Preview Tree.");
    } else {
        //  IF a Group node
        if (selectedNode.isGroup) {
            //  Call the Edit Group routine
            mutatePage("editGroup", wizardData.currentStep.toString());
        } else {
            //  Call the Edit Attribute routine
            mutatePage("editAttr", wizardData.currentStep.toString());
        }
    }
}

/**
 * Helper method for adding button bars to list-group tables
 *
 * @param {string} buttonClass A class added to the button for easier identification
 * @param {string} iconClass The class name indicating which FontAwesome icon is used
 * @param {string} spanHTML The text inside the button
 * @param {Function} onClickHandler The function to be called when this button is pressed
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
 * Dynamically generates inside a wrapper div the Add/Edit Single Attribute page for the Mission Specific
 * Dictionary Builder step
 *
 * @param {string} wrapperClass The class name assigned to the div that will wrap this HTML
 * @param {object} nodeToEdit The Preview Tree node to be modified by this form
 * @return {Element} The generated HTML element representing the Add/Edit Single Attribute page
 */
function generateEditAttributePage(wrapperClass, nodeToEdit) {
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
    //  DD_Attribute section
    var titleFieldset = generateFieldset("title", "Title", "Ex. photo_id");
    if ((nodeToEdit != null) && (nodeToEdit.name !== undefined) && (nodeToEdit.name !== "")) {
        //  Set the node's name in the Title textbox
        $('input', titleFieldset).val(nodeToEdit.name);
    }
    form.appendChild(titleFieldset);

    var nullableCheckbox = generateCheckbox("Nullable", false);
    //  IF the node's Nullable flag is True
    if ((nodeToEdit != null) && (nodeToEdit.nullable === "true")) {
        //  Set the Nullable checkbox as checked
        $('input', nullableCheckbox).prop('checked', true);
    } else {
        //  The checkbox defaults to un-checked???
        //  Set the Nullable checkbox as un-checked initially
        $('input', nullableCheckbox).prop('checked', false);
    }
    form.appendChild(nullableCheckbox);

    var descFieldset = generateFieldset("description", "Description", "Ex. Id of a photograph taken on Mars");
    if ((nodeToEdit != null) && (nodeToEdit.description !== undefined) && (nodeToEdit.description !== "")) {
        //  Set the node's description into the Description textbox
        $('input', descFieldset).val(nodeToEdit.description);
    }
    form.appendChild(descFieldset);

    //  DD_Value_Domain section
    var enumFlagCheckbox = generateCheckbox("Enumeration Flag", false);

    //  Add an event handler for when the 'Enumeration Flag' checkbox is toggled
    //  Get the checkbox's input element
    $('input', enumFlagCheckbox).click(function() {
        //  IF the checkbox is checked
        if ($(this).is(':checked')) {
            //  Show the 'Permissible Values' textbox
            var permValueTextbox = $("fieldset.permissibleValues");
            permValueTextbox.prop('disabled', false);
        } else {
            //  Hide the 'Permissible Values' textbox
            var permValueTextbox = $("fieldset.permissibleValues");
            permValueTextbox.prop('disabled', true);
        }
    });

    form.appendChild(enumFlagCheckbox);

    var permissibleValuesFieldset = generateFieldset("permissibleValues", "Permissible Values", "Enter a comma-separated list of options");
    if ((nodeToEdit != null) && (nodeToEdit.permissibleValues !== undefined) && (nodeToEdit.permissibleValues !== "")) {
        //  Set the node's permissible values into the Permissible Values textbox
        $('input', permissibleValuesFieldset).val(nodeToEdit.permissibleValues);
    }

    //  IF the node's Enum flag is True
    if ((nodeToEdit != null) && (nodeToEdit.enumFlag === "true")) {
        //  Set the Enum flag checkbox as checked initially
        $('input', enumFlagCheckbox).prop('checked', true);
        //  Enable the Permissible Values Textbox
        permissibleValuesFieldset.disabled = false;
    } else {
        //  The checkbox defaults to un-checked???
        //  Set the Enum flag checkbox as un-checked initially
        $('input', enumFlagCheckbox).prop('checked', false);
        //  Disable the Permissible Values Textbox
        permissibleValuesFieldset.disabled = true;
    }
    form.appendChild(permissibleValuesFieldset);

    //  TODO:  Get this dropdown list to be a selectpicker???
    var dataTypeDropdown = generateDropdown("dataTypeSelect", "Select a Value Data Type:");
    if ((nodeToEdit != null) && (nodeToEdit.dataType !== undefined) && (nodeToEdit.dataType !== "")) {
        //  Set the node's Data Type into the Data Type dropdown
        $('select', dataTypeDropdown).val(nodeToEdit.dataType);
    }
    form.appendChild(dataTypeDropdown);

    var unitTypeDropdown = generateDropdown("unitTypeSelect", "Select a Unit of Measure Type:");
    if ((nodeToEdit != null) && (nodeToEdit.unitType !== undefined) && (nodeToEdit.unitType !== "")) {
        //  Set the node's Unit Type into the Unit Type dropdown
        $('select', unitTypeDropdown).val(nodeToEdit.unitType);
    }
    form.appendChild(unitTypeDropdown);

    var groupDropdown = generateDropdown("groupSelect", "Select a group to add this attribute to:");
    //  IF the node's parent is a Group
    if ((nodeToEdit != null) && (nodeToEdit.parent !== undefined) && (nodeToEdit.parent.isGroup === true)) {
        //  Set the node's Group into the Group dropdown
        $('select', groupDropdown).val(nodeToEdit.parent.name);
    }
    form.appendChild(groupDropdown);

    dataSection.appendChild(form);

    wrapper.appendChild(dataSection);

    //  Have a hidden tree w/ missionSpecifics data, so you can modify the tree on this page
    var tree = document.createElement("div");
    tree.id = "editTree";
    $(tree).tree({
        data: missionSpecifics
    });
    tree.style.display = "none";
    wrapper.appendChild(tree);

    return wrapper;
}

/**
 * Dynamically generates inside a wrapper div the Add/Edit Group Attribute page for the Mission Specific
 * Dictionary Builder step
 *
 * @param {string} wrapperClass The class name assigned to the div that will wrap this HTML
 * @param {object} nodeToEdit The Preview Tree node to be modified by this form
 * @return {Element} The generated HTML element representing the Add/Edit Group Attribute page
 */
function generateEditGroupPage(wrapperClass, nodeToEdit) {
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
    var titleFieldset = generateFieldset("title", "Title", "Ex. Photos");
    if ((nodeToEdit != null) && (nodeToEdit.name !== undefined) && (nodeToEdit.name !== "")) {
        //  Set the node's name in the Title textbox
        $('input', titleFieldset).val(nodeToEdit.name);
    }
    form.appendChild(titleFieldset);

    var descFieldset = generateFieldset("description", "Description", "Ex. Group of photo attributes");
    if ((nodeToEdit != null) && (nodeToEdit.description !== undefined) && (nodeToEdit.description !== "")) {
        //  Set the node's description into the Description textbox
        $('input', descFieldset).val(nodeToEdit.description);
    }
    form.appendChild(descFieldset);

    dataSection.appendChild(form);

    wrapper.appendChild(dataSection);

    //  Have a hidden tree w/ missionSpecifics data, so you can modify the tree on this page
    var tree = document.createElement("div");
    tree.id = "editTree";
    $(tree).tree({
        data: missionSpecifics
    });
    tree.style.display = "none";
    wrapper.appendChild(tree);

    return wrapper;
}

/**
 * Dynamically generates inside a wrapper div the Remove Attributes/Groups page for the Mission Specific
 * Dictionary Builder step
 *
 * @param {string} wrapperClass The class name for the wrapper div
 * @return {Element} The generated HTML element representing the remove page
 */
function generateRemovePage(wrapperClass) {
    var wrapper = document.createElement("div");
    wrapper.className = wrapperClass;

    var question = document.createElement("p");
    question.className = "question";
    question.innerHTML = "Please select which group(s) or attribute(s) you would like to remove.";
    wrapper.appendChild(question);

    wrapper.appendChild(generateCheckboxForm());

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
 */
function generateCheckboxForm() {
    var wrapper = document.createElement("div");
    wrapper.className = "checkbox-section";

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

    return wrapper;
}

/**
 * Generate a checkbox and label input
 *
 * @param {string} labelName A String for the name of the checkbox input
 * @param {boolean} isChild Determines whether or not the checkbox is a child of a parent checkbox
 * @returns {Element} The label and checkbox input
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
 * @param {Element} checkInput The checkbox input element
 * @param {boolean} isChild Boolean stating if checkbox is a child
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
 * @param {string} fieldsetClass Class name for the fieldset
 * @param {string} labelHTML The main text instructions to go with this field in the form
 *                 Ex. "Name", "Version Number", "Password"
 * @param {string} placeholderText Text to be placed as a watermark inside the field
 * @return {Element} The HTML element representing the fieldset
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
 * @param {string} wrapperClass The name for the element encasing the label and dropdown
 * @param {string} labelHTML The text of the label preceding the dropdown
 * @returns {Element} The dropdown bar filled with group elements from the config
 */
function generateDropdown(wrapperClass, labelHTML) {
    var wrapper = document.createElement("div");
    wrapper.className = "form-group " + wrapperClass;

    var label = document.createElement("label");
    label.innerHTML = labelHTML;
    wrapper.appendChild(label);
    var dropdownSelect;
    switch (wrapperClass) {
        case "groupSelect":
            dropdownSelect = generateGroupDropdownSelect();
            break;
        case "dataTypeSelect":
            dropdownSelect = generateDataTypeDropdownSelect();
            break;
        case "unitTypeSelect":
            dropdownSelect = generateUnitTypeDropdownSelect();
            break;
    }
    wrapper.appendChild(dropdownSelect);

    return wrapper;
}

/**
 * Generates the dropdown bar and the options associated with it, in this case it is used to
 * load the attribute groups into the dropdown select
 *
 * @returns {Element} - Dropdown bar with all attribute groups found in missionSpecifics in config.js
 */
function generateGroupDropdownSelect() {
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
 * @param {string} optionName A String representing the name of the option
 * @returns {Element} The dropdown option
 */
function generateOption(optionName) {
    var option = document.createElement("option");
    option.innerHTML = optionName;
    return option;
}

/**
 * Generates the dropdown bar and the options associated with it, in this case it is used to
 * load the Data Types into the dropdown select
 *
 * @returns {Element} - Dropdown bar with all Data Types found in the Schema file
 */
function generateDataTypeDropdownSelect() {
    var wrapper = document.createElement("select");
    wrapper.className = "form-control";

    //  Get all of the Data Type Dictionary entries
    var dataTypeDict = g_jsonData.nodes.pds.dataDictionary.dataTypeDictionary;
    for (var d=0; d < dataTypeDict.length; d++) {
        var dataTypeDictId = dataTypeDict[d].DataType.identifier;
        wrapper.appendChild(generateOption(dataTypeDictId));
    }
    return wrapper;
}

/**
 * Generates the dropdown bar and the options associated with it, in this case it is used to
 * load the Unit Types into the dropdown select
 *
 * @returns {Element} - Dropdown bar with all Unit Types found in the Schema file
 */
function generateUnitTypeDropdownSelect() {
    var wrapper = document.createElement("select");
    wrapper.className = "form-control";

    //  Get all of the Unit Type Dictionary entries
    var unitTypeDict = g_jsonData.nodes.pds.dataDictionary.unitDictionary;
    for (var u=0; u < unitTypeDict.length; u++) {
        var unitTypeDictId = unitTypeDict[u].Unit.identifier;
        wrapper.appendChild(generateOption(unitTypeDictId));
    }
    return wrapper;
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
