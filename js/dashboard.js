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

        generatePopUp(popUpData['createNewLabelMultiModalStep1']);

    });
});     // end $(document).ready(function(){

/**
 * Create a card to display a label entry using data from the database.
 * @param {Object} labelData data from the database about the label
 * @returns {Element}
 */
function createLabelEntry(labelData){
    var labelCard = document.createElement("div");
    labelCard.className = "card card-block labelCard";
    labelCard.id = "label-" + labelData["id"];
    $(labelCard).attr("label_num", labelData["id"]);
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
    // Schema version is now a String, rather than an Integer
    versionNumber.textContent = core_schema_versions[labelData["schema_version"]]["name"];
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


    // Only users that own a document can set sharing
    if(labelData["owner"] == labelData["user_id"]) {
        var shareButton = document.createElement("button");
        shareButton.type = "button";
        shareButton.className = "btn btn-secondary labelButton delete";
        shareButton.textContent = "Share";
        shareButton.onclick = shareLabel;

        var delButton = document.createElement("button");
        delButton.type = "button";
        delButton.className = "btn btn-secondary labelButton delete";
        delButton.textContent = "Delete";
        delButton.onclick = deleteLabel;

        btnGrp.appendChild(delButton);
        btnGrp.appendChild(shareButton);
    } else {
        var ownerEmail = document.createElement("div");
        var ownerLabel = document.createElement("span");
        ownerLabel.innerHTML = "<b>Shared by:</b> " + labelData['owner_name'] + " (<a href='mailto:" + labelData['owner_email'] + "'/>" + labelData['owner_email'] + "</a>)";
        ownerEmail.appendChild(ownerLabel);
        content.appendChild(ownerEmail);
    }
    btnGrp.appendChild(editButton);
    labelCard.appendChild(btnGrp);

    if(labelData['in_use']) {
        // Label is in use by another user, diable all buttons;
        var buttons = $(labelCard).find("button");
        for(var i = 0; i < buttons.length; i++) {
            $(buttons[i]).prop('disabled', true);
        }
        $(labelCard).tooltip({
            title: "Label currently being edited by user " + labelData['in_use_by']
        });
    }

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
        }).success(function(data) {
            if(data.length > 0) {
                alert("Shared label is currently being edited by user '" + data
                    + "'. Please try again later or try contacting that user");
            } else {
                $(labelCard).remove();
                $('#deleteLabel').modal('hide');
                $('#deleteLabel').on('hidden.bs.modal', function () {
                    $("body .modal.fade.hide").remove();
                    $("body .modal-backdrop.fade.in").remove();
                });
            }
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
            if(data.length > 0) {
                alert("Shared label is currently being edited by user '" + data
                    + "'. Please try again later or try contacting that user");
            } else {
                window.location = "wizard.php?version=" + labelCard.attr("version");
            }
        }
    });
}
/**
 * Show prompt where user can share label with other users;
 */
function shareLabel() {
    var labelCard = $(this).parents(".labelCard");
    var labelId = $(labelCard).attr("label_num");

    $("#share_modal").remove();

    var modal = document.createElement("div");
    modal.id = "share_modal";
    modal.className = "modal fade hide";

    var modalDialog = document.createElement("div");
    modalDialog.className = "modal-dialog modal-lg";
    modalDialog.setAttribute("role", "document");

    var modalContent = document.createElement("div");
    modalContent.className = "modal-content";

    var modalHeader = document.createElement("div");
    modalHeader.className = "modal-header";

    var modalTitle = document.createElement("h4");
    modalTitle.className = "modal-title";
    modalTitle.innerHTML = "Share label '" + $(labelCard).find('h4.card-title').text() + "' with:";
    modalHeader.appendChild(modalTitle);
    modalContent.appendChild(modalHeader);

    var modalBody = document.createElement("div");
    modalBody.className = "modal-body";

    modalBody.innerHTML = '<row>' +
        '<div class="form-group">' +
        '<label for="exampleInputEmail1">User lookup</label>' +
        '<input class="form-control" id="searchUser" placeholder="Name or Email" class="typeahead">' +
        '<small id="emailHelp" class="form-text text-muted">User must have a PLAID account.</small>' +
        '</div></row>' +
        '<div class="card">' +
        '<div class="card-header">' +
        'Label shared with:' +
        '</div>' +
        '<div class="card-block"><ul class="list-group" id="shareList"></ul>' +
        '</div>' +
        '</div>';

    var searchBar = $(modalBody).find("#searchUser");

    var shareList = $(modalBody).find("#shareList");

    $.post("php/interact_db.php", {
            "function": "getLabelShareSettings",
            "label_id": labelId
    }).done(function(data) {
        refreshLabelShareListing(JSON.parse(data), shareList, labelId);
    });



    var userLookup = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,

        remote: {
            url: 'php/interact_db.php',
            prepare: function (q, rq) {

                $(".typeahead-loader").show();

                rq.data = {
                    q: searchBar.val(),
                    function: "getUsersListing"

                };
                return rq;
            },
            transport: function (obj, onS, onE) {
                obj.type = "POST";
                $.ajax(obj).done(done).fail(fail).always(always);

                function done(data, textStatus, request) {
                    // Don't forget to fire the callback for Bloodhound
                    onS(data);
                }

                function fail(request, textStatus, errorThrown) {
                    // Don't forget the error callback for Bloodhound
                    onE(errorThrown);
                }

                function always() {
                    $(".typeahead-loader").hide();
                }
            }
        }
    });

    searchBar.typeahead(null, {
        name: 'user-search',
        display: 'full_name',
        source: userLookup,
        templates: {
            empty: [
                '<div class="empty-message">',
                '<strong>No users found</strong>',
                '</div>'
            ].join('\n'),
            suggestion: Handlebars.compile('<div><strong>{{full_name}}</strong> – {{email}}</div>')
        }

        })

    searchBar.bind('typeahead:select', function (ev, suggestion) {

        shareLabelWithUser(labelId, suggestion["id"]);
    });
    /*
    searchBar.on("keypress", function search(e) {
        console.log("got " + e.keyCode);
        if(e.keyCode == 13) {
            e.preventDefault();
            shareLabelWithUser(undefined, $("#targetQuery").val());
        }
    });*/


    var modalBodyContent = document.createElement("p");
    modalBody.appendChild(modalBodyContent);
    modalContent.appendChild(modalBody);

    var modalFooter = document.createElement("div");
    modalFooter.className = "modal-footer";

    var modalClose = document.createElement("button");
    $(modalClose).attr("type", "button");
    $(modalClose).addClass("btn btn-secondary");
    $(modalClose).attr("data-dismiss", "modal");
    $(modalClose).text("Close");


    modalFooter.appendChild(modalClose);
    modalContent.appendChild(modalFooter);
    modalDialog.appendChild(modalContent);
    modal.appendChild(modalDialog);
    $('body').append(modal);
    $("#share_modal .hide").show();
    $("#share_modal").modal({
        "backdrop" : "static"
    });
}

function shareLabelWithUser(labelId, user_id) {
    console.log("share label " + labelId + " with user " + user_id);
    $.post("php/interact_db.php", {
        "user_id": user_id,
        "label_id": labelId,
        "function": "shareLabelWithUser"
    }).done(function(data){
        refreshLabelShareListing(JSON.parse(data), $("#shareList"), labelId);
    });

}

function refreshLabelShareListing(data, shareList, labelId) {
    shareList.empty();
    for(var i = 0; i < data.length; i++) {
        var new_item = document.createElement("li");
        $(new_item).addClass("list-group-item justify-content-between");
        var new_header = document.createElement("h5");
        $(new_header).text(data[i]["full_name"]);
        var removeUser = document.createElement("button");
        $(removeUser).attr("type", "button");
        $(removeUser).addClass("btn btn-danger");
        $(removeUser).text("Remove");
        var itemUserId = data[i]["id"];

        $(removeUser).on("click", function() {

             $.post("php/interact_db.php", {
                 "function": "stopSharingLabelWithUser",
                 "label_id": labelId,
                 "user_id": itemUserId
             }).done(function(data) {
                 refreshLabelShareListing(JSON.parse(data), $("#shareList"), labelId);
            });
        });

        $(new_item).append(new_header);
        $(new_item).append(removeUser);

        shareList.append(new_item);

    }


}

/**
 * Check if the given field is Null or empty. Add the error class if it is. Remove
 * the error class if it is not.
 * @param field input form to check
 * @returns {boolean}
 */
function isValidLabelNameInput(field){
    if (($(field).val() === null) || ($(field).val() === "")){
        $(field).addClass("error");
        return false;
    }
    else {
        $(field).removeClass("error");
        return true;
    }
}

// Initialize the Schema Version and Basic/Advanced Mode in the Create New dialog
function initializeCreateNewDialogSchemaVersionAndMode() {
    // Clear the old items from the dropdown list
    $("#core_schema_versions_select").empty();
    // Populate the Schema Version listbox
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
    //  Invoke the Bootstrap Toggle programmatically,
    //  because it doesn't work the regular way when specified in a config file string
    $('#basic_mode_create_toggle').bootstrapToggle();
}

// Initialize the Sample Label dropdown list
function initializeCreateNewDialogSampleLabelDropdown() {
    // Clear the old items from the dropdown list
    $("#sample_label_select").empty();
    // Do a fetch from the APPS Label DB server
    // Get the latest version of all Sample Labels from the APPS Label DB Server
    // TODO: Set the route to the Production Server URL!!!
    const route = 'http://localhost:3000/allLabels';
    fetch(route)
    //.then(function(res) {
        .then(res => res.json())
        //    if (res.ok) {
        //        res.json().then(function (resJson) {
        .then(resJson => {
            //console.log('resJson.rows =', resJson.rows);
            // Create & Populate the Sample Label listbox
            // Add a 'no item selected' option
            let sampleLabelOption = document.createElement("option");
            $(sampleLabelOption).text("No selection");
            $(sampleLabelOption).attr("value", -1);
            $("#sample_label_select").append(sampleLabelOption);

            for (let i = 0; i < resJson.rows.length; i++) {
                const sampleLabelName = resJson.rows[i].name;
                const sampleLabelId = resJson.rows[i].id;
                sampleLabelOption = document.createElement("option");
                $(sampleLabelOption).text(sampleLabelName);
                $(sampleLabelOption).attr("value", sampleLabelId);
                $("#sample_label_select").append(sampleLabelOption);
            }

        });
}

// Call the PHP server to create the new label DB entry
// @param fileData - the selected XML file to upload for import
// @param sampleLabelId - the ID of the APPS Sample Label to import
function createNewLabelInDB(fileData, sampleLabelId) {
    // Get the standard new label data from the dialog
    const newLabelName = $("#labelNameInput").val();
    const schemaVersion = $("#core_schema_versions_select").val();
    const basicMode = $("#basic_mode_create_toggle").is(":checked");
    //console.log('New Label Name =', newLabelName);
    //console.log('Schema version =', schemaVersion);
    //console.log('Basic Mode =', basicMode);

    // Process the form as usual
    let formData = new FormData();
    // Append the data in the form into the formData object
    formData.append('function', "storeNewLabel");
    formData.append('labelName', newLabelName);
    formData.append('version', schemaVersion);

    // IF an XML file was given
    if ((fileData !== undefined) && (fileData != null)) {
        // Append the given XML file
        formData.append('xmlFileToImport', fileData);
    }

    // IF a Sample Label was given
    if (sampleLabelId !== undefined) {
        // Append the given Sample Label Id
        formData.append('selectedSampleLabelId', sampleLabelId);
    }

    $.ajax({
        type: "post",
        url: "php/interact_db.php",
        processData: false, // Don't process the files
        contentType: false, // Set content type to false as jQuery will tell the server it's a query string request
        data: formData,
    }).success(function () {
        //alert("Able to upload file");
        window.location = "wizard.php?version=" + $("#core_schema_versions_select").val() + "&basicMode=" + basicMode;
    }).fail(function () {
        alert("Unable to create label");
    });
}
