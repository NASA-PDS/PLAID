/**
 * Created by morse on 6/17/16.
 */
$(document).ready(function(){
    $(".list-group-item").each(function(){
        //TODO: REPLACE WITH TOOLTIPS
        //$(this).mouseenter(previewDetails);
        $(this).click(captureSelection);
    });
    previewDescription();
});
/*
* When the user selects an option in the wizard pane, add
* the active class to that element and store the result.
*/
function captureSelection(){
    var element = $(this)[0];
    clearActiveElements();
    $(element).addClass("active");
    //this value will either be returned or stored for use later
    //temporarily being written out to the console
    var selection = $(".productType", element)[0].textContent;
    console.log(selection);
}
/*
* Helper function to remove the active class from all elements.
*/
function clearActiveElements(){
    $(".active").removeClass("active");
}
/*
 * When the user hovers over an option in the wizard pane,
 * display a description of that option in the details pane.
 */
function previewDetails(){
    var details = $("#details")[0];
    var selection = $(this)[0].textContent;
    details.innerHTML = "<h6>" + selection + ":</h6>";
    var filepath = formFilePath(selection, "descriptions/product_types/");
    loadDescriptionFromFile(filepath, "#details");
}
/*
* Parse out the title of the current step and use that to determine
* which text file to pull the description from for the help pane.
*/
function previewDescription(){
    var currentStep = $(".title.current")[0].innerHTML;
    var filepath = formFilePath(currentStep, "descriptions/");
    loadDescriptionFromFile(filepath, "#help");
}
/*
* Format a generic string into the corresponding filename.
* Replaces whitespace with _ and concatenates the extension and path.
* @param {string} contentStr string of non-formatted text
* @param {string} path relative path to the directory containing the file
* @return {string} path to the file
*/
function formFilePath(contentStr, path){
    var filename = contentStr.trim()
                             .replace(/\b\s\b/, "_")
                             + ".txt";
    filename = filename.toLowerCase();
    return (path + filename);
}
/*
* Use an ajax call to load the text from a specified file into
* the object found by the specified selector.
* @param {string} filepath path to the file to read
* @param {string} selector jQuery style selection string
*/
//TODO: load from JSON instead of text file
function loadDescriptionFromFile(filepath, selector){
    $.ajax({
        async:false,
        url: filepath,
        dataType: 'text',
        success: function(data)
        {
            $(selector).append(data);
        }
    });
}