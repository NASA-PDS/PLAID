/**
 * @file This file contains the functions for controlling the content on dashboard.php.
 *
 * @author Trevor Morse
 * @author Michael Kim
 * Creation Date: 8/10/16.
 */
$(document).ready(function(){
    $.ajax({
       type: "post",
       url: "php/interact_db.php",
       data: {
           function: "getLabelInfo"
       },
       dataType: "text",
       success: function(data){
           var labels = $.parseJSON(data);
           labels.map(function(label){
               $("#dashboardContent").append(createLabelEntry(label));
           });
       }
    });

    $("#help").append(infoBarData['dashboard']);

    $("#createNewLabelButton").click(function() {
        $('#labelNameInput').removeClass('error');
        generatePopup(popUpData['createNewLabel']);
    });
});
/**
 * Create a card to display a label entry using data from the database.
 * @param {Object} labelData data from the database about the label
 * @returns {Element}
 */
function createLabelEntry(labelData){
    var labelCard = document.createElement("div");
    labelCard.className = "card card-block labelCard";
    labelCard.id = "label-" + labelData["id"];

    var title = document.createElement("h4");
    title.className = "card-title";
    title.textContent = labelData["name"];
    labelCard.appendChild(title);

    var content = document.createElement("div");
    content.className = "labelText";

    var time1 = document.createElement("div");
    var creationLabel = document.createElement("span");
    creationLabel.innerHTML = "<b>Creation Time: </b>";
    time1.appendChild(creationLabel);
    var creationTime = document.createElement("span");
    creationTime.className = "creation";
    creationTime.textContent = labelData["creation"];
    time1.appendChild(creationTime);

    var time2 = document.createElement("div");
    var updatedLabel = document.createElement("span");
    updatedLabel.innerHTML = "<b>Last Updated: </b>";
    time2.appendChild(updatedLabel);
    var updateTime = document.createElement("span");
    updateTime.className = "updated";
    updateTime.textContent = labelData["last_modified"];
    time2.appendChild(updateTime);

    content.appendChild(time1);
    content.appendChild(time2);
    labelCard.appendChild(content);

    var btnGrp = document.createElement("div");
    btnGrp.className = "btn-group labelButtonGroup";
    btnGrp.role = "group";

    var editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "btn btn-secondary labelButton edit";
    editButton.textContent = "Edit";
    editButton.onclick = editLabel;

    var delButton = document.createElement("button");
    delButton.type = "button";
    delButton.className = "btn btn-secondary labelButton delete";
    delButton.textContent = "Delete";
    delButton.onclick = deleteLabel;

    btnGrp.appendChild(editButton);
    btnGrp.appendChild(delButton);
    labelCard.appendChild(btnGrp);

    return labelCard;
}
/**
 * Calls a pop-up that verifies if the user wants to delete the selected label.
 * If the user agrees, a backend call is made to flag the label as deleted
 * in the database and the label card is removed from the page.
 *
 * Note: Since the deleteLabelPopup contains dynamic content, its content is created
 * in this function instead of being stored statically in pop_up_config.js.
 */
function deleteLabel(){
    var labelCard = $(this).parents(".labelCard");
    var deleteLabelPopUp = {};
    deleteLabelPopUp['id'] = 'deleteLabel';
    deleteLabelPopUp['title'] = 'Warning';
    deleteLabelPopUp['content'] = "You are attempting to remove the label: <b>"+$(labelCard).find('h4.card-title').text()+"</b>. Do you want to continue?";
    deleteLabelPopUp['noText'] = 'No';
    deleteLabelPopUp['yesText'] = 'Yes';
    deleteLabelPopUp['yesFunction'] = function () {
        var labelID = labelCard.attr("id").split("-")[1];
        $.ajax({
            type: "post",
            url: "php/interact_db.php",
            data: {
                function: "deleteLabel",
                label_id: labelID
            }
        });
        $(labelCard).remove();
        $('#deleteLabel').modal('hide');
        $('#deleteLabel').on('hidden.bs.modal', function () {
            $("body .modal.fade.hide").remove();
            $("body .modal-backdrop.fade.in").remove();
        });
    };
    generatePopup(deleteLabelPopUp);
}

/**
 * Make a backend call to store the label id as a session variable. Then navigate
 * to wizard.php.
 */
function editLabel(){
    var labelCard = $(this).parents(".labelCard");
    var labelID = labelCard.attr("id").split("-")[1];
    $.ajax({
        type: "post",
        url: "php/navigate.php",
        data: {
            label_id: labelID
        },
        success: function(data) {
            window.location = "wizard.php";
        }
    });
}

/**
 * Check if the field is empty. Add the error class if it is. Remove
 * the error class if it is not.
 * @param field input form to check
 * @returns {boolean}
 */
function isValidLabelNameInput(field){
    if ($(field).val() === ""){
        $(field).addClass("error");
        return false;
    }
    else {
        $(field).removeClass("error");
        return true;
    }
}
