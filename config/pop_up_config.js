/**
 * Created by mikim on 7/25/16.
 */
var popUpData = {
    currentStep : 0,
    newStep : 0,
    addAttr : {
        id : "addAttr",
        title : "Warning",
        content : "<div>Leaving at this step will delete any unsaved progress for this single attribute.</div><br>" +
        "<div>Click 'Continue' to leave anyway.</div>",
        noText : "Cancel",
        yesText : "Continue",
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
    addGroup : {
        id : "addGroup",
        title : "Warning",
        content : "<div>Leaving at this step will delete any unsaved progress for this attribute group.</div><br>" +
        "<div>Click 'Continue' to leave anyway.</div>",
        noText : "Cancel",
        yesText : "Continue",
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
    invalidChoice : {
        id : "invalidChoice",
        title : "Invalid Choice",
        content : "Please properly select the elements in the choice section.",
        noText: "",
        yesText: "Ok",
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
        yesText : "Ok",
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
    createNewLabel : {
        id : "createNewLabel",
        title : "Create New Label",
        content : "<div>Please enter a name for your new label:</div>" +
        "<input id='labelNameInput' class='form-control' type='text' placeholder='Ex. Mars 2020 Label' id='example-text-input'>",
        noText: "Cancel",
        yesText: "Submit",
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
    deleteProgress : {
        id : "deleteProgress",
        title : "Warning",
        content : "You have made a change. If you continue, all progress will be lost after this point. Do you want to continue?",
        noText : "No",
        yesText : "Yes",
        yesFunction : function(){
            var type = progressData[wizardData.currentStep]['step'];
            progressData = progressData.slice(0, wizardData.currentStep);
            storeProgress(wizardData.currentStep, type);
            location.reload(true);
        }
    }
};