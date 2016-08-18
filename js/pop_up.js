/**
 * @file Contains the functions for checking, activating, and showing pop-ups throughout the LDT wizard.
 * The functions work closely with the flow set by the init_steps.js class because in order for pop-ups to disrupt and cancel
 * a step change in the wizard, it must return false within the onStepChanging event.
 *
 * Creation Date: 7/25/16.
 *
 * @author Michael Kim
 * @author Trevor Morse
 */

/**
 * This method is called frequently in init_steps.js and it does these things:
 * - Remove all lingering pop-ups and HTML attributes that are used for pop-ups
 * - Check if a pop-up should be shown and the wizard should be denied the ability to step
 * - Set which pop-up is going to be shown by saving the ID in an HTML attr
 *
 * @param {number} currentStep The index where the wizard is currently at
 * @returns {boolean} Whether or not a pop-up should show
 */
function updatePopUp(currentStep) {
    //Can add logic here to decide to clear the pop-up or not
    var wrapper = $("#wizard-p-" + currentStep.toString());
    $(wrapper).removeAttr("pop-up");
    $("body .modal.fade.hide").remove();
    $("body .modal-backdrop.fade.in").remove();

    // Allow the user to skip pop-ups if the step change is being called from a pop-up itself
    if ($(wrapper).hasClass("leaving")) {
        $(wrapper).removeClass("leaving");
        return false;
    }
    // Show a pop-up when the user is trying to proceed past a step with incorrectly configured choice fields
    else if ($(wrapper).find(".choice-field").length > 0 &&
        $(wrapper).find(".choice-field").attr("total") < $(wrapper).find(".choice-field").attr("min")) {
        $(wrapper).attr("pop-up", "invalidChoice");
        return true;
    }
    // Show a pop-up when the user is trying to leave the MSD builder at an invalid state (not the homepage)
    else if ($(wrapper).find("[pop-up-id]").length > 0) {
        $(wrapper).attr("pop-up", $(wrapper).find("[pop-up-id]").attr("pop-up-id"));
        return true;
    } else {
        return false;
    }
}

/**
 * Match the value of the HTML pop-up attribute to an object stored in pop_up_config.js
 * to retrieve the contents of the pop-up to be generated
 *
 * @param {number} currentStep A number representing the index of the wizard
 * @param {number} newStep A number representing the index where the wizard is going to next after the pop-up
 * @returns {boolean} indicates whether to block wizard progression or not
 */
function showPopUp(currentStep, newStep) {
    var wrapper = $("#wizard-p-" + currentStep.toString());
    popUpData.currentStep = currentStep;
    popUpData.newStep = newStep;

    var id = $(wrapper).attr("pop-up");
    if (id !== "invalidChoice" ||
        (id === "invalidChoice" && newStep > currentStep)){
        generatePopUp(popUpData[id]);
        return false;
    }
    return true;
}

/**
 * Sets the pop-up to be shown as the backwards traversal one, and then calls the display method
 *
 * @param {number} currentStep A number representing the index of the wizard
 */
function showBackwardsTraversalPopUp(currentStep) {
    var wrapper = $("#wizard-p-" + currentStep.toString());
    $(wrapper).attr("pop-up", "backwardsTraversal");
    showPopUp(currentStep, popUpData.newStep);
}

/**
 * Dynamically generate the Bootstrap (v4) modal given the information derived from the pop_up_config.js file
 *
 * Note: This function is closely tied to the pop_up_config.js file, where JS objects defined there are sent
 * through the arguments. Alternatively, objects can be defined anywhere and sent through the arguments the same way.
 * These objects are accessed to populate the generated pop-up with content and functionality.
 *
 * @param {Object} popUpObj An Object that holds all of the information and functions to be used in this pop-up
 */
function generatePopUp(popUpObj) {
    var modal = document.createElement("div");
    modal.id = popUpObj['id'];
    modal.className = "modal fade hide";

    var modalDialog = document.createElement("div");
    modalDialog.className = "modal-dialog";
    modalDialog.setAttribute("role", "document");

    var modalContent = document.createElement("div");
    modalContent.className = "modal-content";

    var modalHeader = document.createElement("div");
    modalHeader.className = "modal-header";

    var modalTitle = document.createElement("h4");
    modalTitle.className = "modal-title";
    modalTitle.innerHTML = popUpObj['title'];
    modalHeader.appendChild(modalTitle);
    modalContent.appendChild(modalHeader);

    var modalBody = document.createElement("div");
    modalBody.className = "modal-body";

    var modalBodyContent = document.createElement("p");
    if(typeof popUpObj['content'] === "object")
        modalBodyContent.appendChild(popUpObj['content'])
    else
        modalBodyContent.innerHTML = popUpObj['content'];
    modalBody.appendChild(modalBodyContent);
    modalContent.appendChild(modalBody);

    var modalFooter = document.createElement("div");
    modalFooter.className = "modal-footer";

    // If noText is set to empty, do not include a no button in the pop-up
    if (popUpObj['noText'] !== "") {
        var modalFooterNoButton = document.createElement("button");
        modalFooterNoButton.setAttribute("type", "button");
        modalFooterNoButton.className = "btn btn-secondary";
        modalFooterNoButton.setAttribute("data-dismiss", "modal");
        modalFooterNoButton.innerHTML = popUpObj['noText'];
        modalFooter.appendChild(modalFooterNoButton);
        // If a noFunction is defined, tie the function into the pop-up's no button
        if (popUpObj['noFunction']){
            $(modalFooterNoButton).click(popUpObj['noFunction']);
        }
    }

    var modalFooterYesButton = document.createElement("button");
    modalFooterYesButton.setAttribute("type", "button");
    modalFooterYesButton.className = "btn btn-primary";
    modalFooterYesButton.innerHTML = popUpObj['yesText'];

    $(modalFooterYesButton).click(popUpObj['yesFunction']);

    modalFooter.appendChild(modalFooterYesButton);
    modalContent.appendChild(modalFooter);
    modalDialog.appendChild(modalContent);
    modal.appendChild(modalDialog);

    $('body').append(modal);
    $("#" + popUpObj['id'] + ' .hide').show();
    $("#" + popUpObj['id']).modal({
        "backdrop" : "static"
    });
    removePopovers();
}
