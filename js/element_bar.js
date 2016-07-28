/**
 * Created by mikim on 7/7/16.
 */
/**
 * When the user clicks INTO the counter, keep track of what number was in there initially by giving the element
 * an attribute to store it in
 * If the counter is empty, do not override the most recent, valid, previous value
 */
function captureValue() {
    if ($(this).val() !== "") {
        $(this).attr('prevValue', parseInt($(this).val(), 10));
    }
}

/**
 * When the user clicks OUT OF the counter, clear the temporary value storing previous counter values
 * If the counter had nothing inside, reset value to minimum value
 */
function releaseValue() {
    if ($(this).val() === "") {
        $(this).val(parseInt($(this).attr('min'), 10));
        setOneElementBarStyle(this);
    }
    $(this).removeAttr('prevValue');
}

/**
 * When the user presses a key, check if it as a valid input (0-9, backspace, left/right keys)
 * If not, prevent the event from happening
 * Notes: Keycodes 8, 37, and 39 correspond to backspace, left, and right keys respectively
 */
function preventInput(event) {
    var regex = new RegExp("^[0-9]+$");
    var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
    var backspace = 8, leftArrow = 37, rightArrow = 39;
    var keyCode = event.keyCode;
    if (!regex.test(key) && (keyCode !== backspace) && (keyCode !== leftArrow) && (keyCode !== rightArrow) ) {
        event.preventDefault();
    }
}

/**
 * When the user presses a valid key, check if what the user entered is under the element's max number
 * If not, reset to the previous value saved in the element's attribute 'prevValue'
 * Otherwise, save the new value as this previous value and update the element label and buttons to match the new value
 * When the input is accepted, update styling for the rest of the components of the element bar accordingly
 */
function validateInput() {
    var prevVal = $(this).attr('prevValue');
    var currVal = $(this).val();
    if (parseInt(currVal) > $(this).attr('max') || parseInt(currVal) < $(this).attr('min')) {
        $(this).val(prevVal);
    } else if (prevVal !== currVal) {
        if (currVal !== "") {
            $(this).val(parseInt(currVal));
            $(this).attr('prevValue', parseInt(currVal, 10));
        }
        setOneElementBarStyle(this);
    }
}

/**
 * Loop through each counter element and determine whether
 * to show the corresponding label and counter as disabled or not.
 */
function setAllElementBarsStyle(){
    $(".element-bar-counter").each(function(){
        setOneElementBarStyle(this);
    });
}

/**
 * Helper method to update the element label based on its allowed range and current counter value
 * Cases:
 *  - If the value in the counter is equal to zero and non-blank, update the label to display as disabled
 *  - If the element's min is equal to its max, the element is therefore required with disabled input components
 *  - If the value in the counter is equal to the minimum, the decrement button should be disabled
 *  - If the value in the counter is equal to the maximum, the increment button should be disabled
 *  - If the value in the counter is above the minimum, the decrement button should be enabled
 *  - If the value in the counter is below the maximum, the increment button should be enabled
 */
function setOneElementBarStyle(counter) {
    var label = $(counter).siblings(".element-bar-label");
    var val = parseInt($(counter).val(), 10);
    var minAndMax = getMinMax(counter);
    var min = minAndMax[0], max = minAndMax[1];
    if ($(counter).val() !== "") {
        if (val === 0) {
            $(label).addClass("zero-instances");
        } else {
            $(label).removeClass("zero-instances");
        }
    }
    if (min === max) {
        $(counter).prop('disabled', true);
    }
    if (val === min){
        $(counter).siblings(".element-bar-button").children(".element-bar-minus").prop('disabled', true);
    } else if (val === max) {
        $(counter).siblings(".element-bar-button").children(".element-bar-plus").prop('disabled', true);
    }
    if (val > min) {
        $(counter).siblings(".element-bar-button").children(".element-bar-minus").prop('disabled', false);
    } else if (val < max) {
        $(counter).siblings(".element-bar-button").children(".element-bar-plus").prop('disabled', false);
    }
}

/**
 * Flashes a red background on the given counter for invalid inputs
 * TODO: Include jQueryUI for this to work
 */
/*
 function warningFlash(counter) {
 var currColor = $(counter).css('background-color');
 $(this).animate({backgroundColor: '#F2DEDF'}, 'slow');
 $(this).animate({backgroundColor: currColor}, 'slow');
 }
 */