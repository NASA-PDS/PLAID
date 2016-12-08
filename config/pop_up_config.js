/**
 * Copyright 2017 California Institute of Technology, developed with support from NASA.
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
 *
 * @file An isolated location to store configurations for the pop-up windows used throughout the LDT. The main intent
 * of this file is to interact closely with the generatePopUp method found in pop_up.js, supplying it with
 * the content and functions it requires to dynamically construct unique pop-ups for any given situation.
 *
 * Note: Many yesFunctions will redirect the window upon click in order to navigate the user to the next process.
 * Note: The generatePopUp method does not need to use objects from this file to create pop-ups, the Objects can be
 *       constructed anywhere. This comes in handy when a pop-up calls for content or functions that cannot be
 *       defined statically.
 *
 * Creation Date: 7/25/16.
 *
 * @author Michael Kim
 * @author Trevor Morse
 * @author Stirling Algermissen
 */
var popUpData = {
    // These variables, currentStep and newStep, are used to store the initial step change attempt made by the user,
    // which is referenced again later in the pop-up's yesFunctions that have intent to mimic the same step change
    currentStep : 0,
    newStep : 0,
    // When a user is leaving in the middle of constructing a single attribute, this pop-up warns the user that
    // the progress made for this particular single attribute will not be saved
    addAttr : {
        id : "addAttr",
        title : "Warning",
        content : "<div>Leaving at this step will delete any unsaved progress for this single attribute.</div><br>" +
        "<div>Click 'Continue' to leave anyway.</div>",
        noText : "Cancel",
        yesText : "Continue",
        /**
         * When a user confirms to leave out of this phase of the mission specifics builder, use jQuery to click the
         * step on the left toolbar representing the desired new location. To leave the page without triggering
         * the same pop-up once again, a leaving class is added to the HTML. This flag is processed in updatePopUp of
         * the pop_up.js file.
         */
        yesFunction : function() {
            $('#addAttr').modal('hide');
            var section = $("#wizard-p-" + popUpData.currentStep.toString());
            $(section).find("[pop-up]").each(function() {
                $(this).addClass(" leaving");
            });
            // Turn on the HTML class that skips the check for pop-ups, allowing the wizard to step
            var section = $("#wizard-p-" + popUpData.currentStep.toString());
            $(section).addClass("leaving");
            var newStep = "#wizard-t-" + popUpData.newStep.toString();
            $(newStep).click();
        }
    },
    // When a user is leaving in the middle of constructing a group of attributes, this pop-up warns the user that
    // the progress made for this particular group will not be saved
    addGroup : {
        id : "addGroup",
        title : "Warning",
        content : "<div>Leaving at this step will delete any unsaved progress for this attribute group.</div><br>" +
        "<div>Click 'Continue' to leave anyway.</div>",
        noText : "Cancel",
        yesText : "Continue",
        /**
         * See doc for yesFunction in addAttr object
         */
        yesFunction : function() {
            $('#addGroup').modal('hide');
            var section = $("#wizard-p-" + popUpData.currentStep.toString());
            $(section).find("[pop-up]").each(function() {
                $(this).addClass(" leaving");
            });
            // Turn on the HTML class that skips the check for pop-ups, allowing the wizard to step
            var section = $("#wizard-p-" + popUpData.currentStep.toString());
            $(section).addClass("leaving");
            var newStep = "#wizard-t-" + popUpData.newStep.toString();
            $(newStep).click();
        }
    },
    // When a user incorrectly fills out a choice section of optional PDS4-attributes, disallow the step change
    // and force the user to complete the form correctly
    invalidChoice : {
        id : "invalidChoice",
        title : "Invalid Choice",
        content : "Please properly select the elements in the choice section.",
        noText: "",
        yesText: "OK",
        /**
         * Hides the pop-up once the user confirms that an error exists
         */
        yesFunction : function() {
            $('#invalidChoice').modal('hide');
        }
    },
    // When a user navigates backwards, this pop-up gives a warning that progress will be lost upon changes
    backwardsTraversal : {
        id : "backwardsTraversal",
        title : "Warning",
        content : "<div>Making a change to a previous step will delete <b>all</b> progress beyond that point.</div><br>" +
        "<div>You are safe to navigate through the different steps without making any changes, however.</div>",
        noText : "",
        yesText : "OK",
        /**
         * Hides the pop-up once the user agrees to the warning of backwards traversal in the LDT wizard
         */
        yesFunction : function() {
            var wrapper = $("#wizard-p-" + popUpData.currentStep.toString());
            $(wrapper).removeAttr("pop-up");
            $('#backwardsTraversal').modal('hide');
            $('#backwardsTraversal').on('hidden.bs.modal', function () {
                $("body .modal.fade.hide").remove();
                $("body .modal-backdrop.fade.in").remove();
            })
        }
    },
    // When a user attempts to create a new label from the dashboard, this pop-up forces the user to give the label
    // a name before proceeding
    createNewLabel : {
        id : "createNewLabel",
        title : "Create New Label",
        content : "<div>Please enter a name for your new label:</div>" +
        "<input id='labelNameInput' class='form-control' type='text' placeholder='Ex. Mars 2020 Label' id='example-text-input'>",
        noText: "Cancel",
        yesText: "Submit",
        /**
         * Captures user's input for label name and sends it to the backend to be processed
         */
        yesFunction : function() {
            if (isValidLabelNameInput($('#labelNameInput'))) {
                $('#createNewLabel').modal('hide');
                $.ajax({
                    type: "post",
                    url: "php/interact_db.php",
                    data: {
                        function: "storeNewLabel",
                        labelName: $("#labelNameInput").val()
                    }
                });
                window.location = "wizard.php";
            }
        }
    },
    // When a user attempts to change the label from a previously visited step, give the user the option to save
    // the change and lose the proceeding progress or to revert the changes made
    deleteProgress : {
        id : "deleteProgress",
        title : "Warning",
        content : "<div>You have made a change. Would you like to keep the change or revert it?</div>"+
            "<br/><div><i>Note: If you keep the change, all progress will be lost after this point."+
            " If you revert, then the changes will be reverted and you will advance to the next step.</i></div>",
        noText : "Revert Changes",
        yesText : "Continue",
        /**
         * Removes the progressData proceeding this step and stores the new changes
         * After, a backend call is made to remove root attributes
         * Finally, the window is reloaded for a proper load of the newly formed progress
         */
        yesFunction : function(){
            var type = progressData[wizardData.currentStep]['step'];
            progressData = progressData.slice(0, wizardData.currentStep);
            storeProgress(wizardData.currentStep, type);
            backendCall("php/xml_mutator.php",
                "removeRootAttrs",
                {namespaces: g_jsonData.namespaces},
                function(data){});
            location.reload(true);
        },
        /**
         * Returns the user to the same step using the unchanged progressData
         */
        noFunction : function(){
            loadProgress(progressData[wizardData.currentStep]);
        }
    },
    // When a user wants to preview the
    // Note: The content for this pop-up is set dynamically from where it calls the generate method
    preview: {
        id : "preview",
        title : "Label Template Preview",
        content : "",
        noText : "",
        yesText : "Dismiss",
        /**
         * Hides the pop-up
         */
        yesFunction : function(){
            $('#preview').modal('hide');
        }
    }
};
