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
 * @file Contains the functions for controlling the content on dashboard.php.
 *
 * Creation Date: 8/10/16.
 *
 * @author Trevor Morse
 * @author Michael Kim
 * @author Stirling Algermissen
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
        $("#core_schema_versions_select").empty();

        generatePopUp(popUpData['createNewLabel']);

        //  Invoke the Bootstrap Toggle programmatically,
        //  because it doesn't work the regular way when specified in a config file string
        $('#basic_mode_create_toggle').bootstrapToggle();

        for (var i = 0; i < schema_list_order.length; i++) {
            var schema = schema_list_order[i];
            if (core_schema_versions.hasOwnProperty(schema)) {
                var schema_info = core_schema_versions[schema];
                var schema_option = document.createElement("option");
                $(schema_option).text(schema_info["name"]);
                $(schema_option).attr("value", schema);
                $("#core_schema_versions_select").append(schema_option);
            }
        }
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
    $(labelCard).attr("version", labelData["schema_version"]);
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

    var schemaVersion = document.createElement("div");
    var versionLabel = document.createElement("span");
    versionLabel.innerHTML = "<b>PDS4 Version: </b>";
    schemaVersion.appendChild(versionLabel);
    var versionNumber = document.createElement("span");
    versionNumber.className = "version";
    versionNumber.textContent = core_schema_versions[parseInt(labelData["schema_version"])]["name"];
    schemaVersion.appendChild(versionNumber);

    content.appendChild(time1);
    content.appendChild(time2);
    content.appendChild(schemaVersion);
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
    generatePopUp(deleteLabelPopUp);
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
            window.location = "wizard.php?version=" + labelCard.attr("version");
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
