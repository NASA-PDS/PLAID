/**
 * Created by morse on 8/10/16.
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
        generatePopup("createNewLabel", popUpData["createNewLabel"]["title"], popUpData["createNewLabel"]["content"],
            popUpData["createNewLabel"]["noText"], popUpData["createNewLabel"]["yesText"], popUpData["createNewLabel"]["yesFunction"]);
    });
});
/**
 * Create a card to display a label entry using data from the database.
 * @param {Object} labelData data from database about the label
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
 * Make a backend call to remove the label and link entry from the database
 * and remove the label card from the page.
 */
function deleteLabel(){
    var labelCard = $(this).parents(".labelCard");
    var labelID = labelCard.attr("id").split("-")[1];
    $.ajax({
        type: "post",
        url: "php/interact_db.php",
        data: {
            function: "deleteLabel",
            label_id: labelID
        },
        success: function(data){console.log(data);}
    });
    $(labelCard).remove();
}
/**
 * Check if the field is empty.
 * @param field input to check
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
