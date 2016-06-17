/**
 * Created by morse on 6/17/16.
 */
$(document).ready(function(){
    $(".list-group-item").each(function(){
        $(this).mouseenter(previewDetails);
        $(this).click(captureSelection);
    });
    loadDescriptionFromFile();
});
/*
* When the user hovers over an option in the wizard pane,
* display a description of that option in the details pane.
*/
function previewDetails(){
    var selection = $(this)[0].innerHTML;
    var detailsPane = $("#details")[0];
    detailsPane.innerHTML = selection;
}
/*
* When the user selects an option in the wizard pane, add
* the active class to that element and store the result.
*/
function captureSelection(){
    var element = $(this)[0];
    clearActiveElements();
    $(element).addClass("active");
    console.log(element.innerHTML);
}
/*
* Helper function to remove the active class from all elements.
*/
function clearActiveElements(){
    $(".active").removeClass("active");
}
/*
* Parse out the title of the current step and use that to determine
* which text file to pull the description from for the help pane.
*/
function loadDescriptionFromFile(){
    var currentStep = $(".title.current")[0].innerHTML;
    var filename = currentStep.split(" ").join("_") + ".txt";
    filename = filename.toLowerCase();
    var filepath = "descriptions/" + filename;
    $.ajax({
        async:false,
        url: filepath,
        dataType: 'text',
        success: function(data)
        {
            $("#help").append(data);
        }
    });
}