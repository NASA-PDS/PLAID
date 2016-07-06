/**
 * Created by morse on 6/17/16.
 */
$(document).ready(function(){
    $(".list-group-item").each(function(){
        $(this).click(captureSelection);
    });
    $(".element-bar-plus").each(function(){
        $(this).click(increaseCounter);
    });
    $(".element-bar-minus").each(function(){
        $(this).click(decreaseCounter);
    });
    $(".element-bar-counter").each(function(){
        //$(this).focusin(captureValue);
        $(this).keydown(preventInput);
        $(this).keyup({arg1: captureValue(this)}, validateInput);
        //$(this).focusout({arg1: val}, checkForValidCounter);
    });
    previewDescription();
    setElementBarStyle();
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
/*
* Loop through each counter element and determine whether
* to show the corresponding label and counter as disabled or not.
*/
function setElementBarStyle(){
    $(".element-bar-counter").each(function(){
        var label = $(this).siblings(".element-bar-label");
        var val = parseInt($(this).val(), 10);
        var minAndMax = getMinMax(this);
        var min = minAndMax[0], max = minAndMax[1];
        if (val === 0
            //&& $(node).hasClass("optional")
        ){
            //$(node).prop('disabled', true);
            $(label).addClass("zero-instances");
        }
        if (val === min){
            $(this).siblings(".element-bar-button").children(".element-bar-minus").prop('disabled', true);
        }
        if (val === max) {
            $(this).siblings(".element-bar-button").children(".element-bar-plus").prop('disabled', true);
        }
        if (min === max) {
            $(this).prop('disabled', true);
        }
    });
}
/*
* When the user clicks on a plus button, increment the corresponding counter.
*/
function increaseCounter(){
    var counter = $(this).parent().siblings(".element-bar-counter");
    var minAndMax = getMinMax(counter);
    var counterMin = minAndMax[0], counterMax = minAndMax[1];
    var currVal = parseInt(counter.val(), 10);
    var newVal = (currVal + 1);
    if (newVal >= counterMin && newVal <= counterMax){
        counter.val(newVal.toString());
        //$(this).siblings(".node").prop('disabled', false);
        $(this).parent().siblings(".element-bar-label").removeClass("zero-instances");
        $(this).parent().siblings(".element-bar-button").children(".element-bar-minus").prop('disabled', false);
    }
    if (newVal === counterMax){
        $(this).prop('disabled', true);
    }
}
/*
* When the user clicks on a minus button, decrement the corresponding counter.
*/
function decreaseCounter(){
    var counter = $(this).parent().siblings(".element-bar-counter");
    var minAndMax = getMinMax(counter);
    var counterMin = minAndMax[0], counterMax = minAndMax[1];
    var currVal = parseInt(counter.val(), 10);
    var newVal = (currVal - 1);
    if (newVal >= counterMin && newVal <= counterMax){
        counter.val(newVal.toString());
        $(this).parent().siblings(".element-bar-button").children(".element-bar-plus").prop('disabled', false);
    }
    if (newVal === counterMin){
        $(this).prop('disabled', true);
    }
    if (newVal === 0){
        //$(this).siblings(".node").prop('disabled', true);
        $(this).parent().siblings(".element-bar-label").addClass("zero-instances");
    }
}
/*
* Helper function to return min/max values from the element's attributes.
*/
function getMinMax(counter){
    var counterMin = parseInt($(counter).attr("min"), 10);
    var counterMax = $(counter).attr("max");
    if (counterMax === "inf"){
        counterMax = 999999999999;
    }
    else{
        counterMax = parseInt(counterMax);
    }
    return Array(counterMin, counterMax);
}

/*
 * When the user clicks into the counter, keep track of what number was in there initially
 */
function captureValue(counter) {
    console.log(parseInt($(counter).val(), 10));
    return parseInt($(counter).val(), 10);
}

/*
 *
 */
function preventInput(event) {
    var regex = new RegExp("^[0-9]+$");
    var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
    if (!regex.test(key) && (event.keyCode !== 8)) {
        event.preventDefault();
    }
}

/*
 *
 */
function validateInput(event) {
    var val = event.data.arg1;
    if (parseInt($(this).val()) > 8) {
        $(this).val(val);
    } else {
        console.log($(this).val());
    }
}