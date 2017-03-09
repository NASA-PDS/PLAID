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
 * @file Contains the functions for handling and controlling style of the element bars throughout the PLAID wizard. Element
 * bars are created from the Bootstrap v4 Input Groups and are used to determine the quantity of optional attributes
 * desired in the label.
 *
 * Creation Date: 7/15/16.
 *
 * @author Michael Kim
 * @author Trevor Morse
 * @author Stirling Algermissen
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
 *
 * @param {Object} event Object that stores the information behind the user triggered event
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
 * Helper method to update the element label based on its allowed range and current counter value
 * Cases:
 *  - If the value in the counter is equal to zero and non-blank, update the label to display as disabled
 *  - If the element's min is equal to its max, the element is therefore required with disabled input components
 *  - If the value in the counter is equal to the minimum, the decrement button should be disabled
 *  - If the value in the counter is equal to the maximum, the increment button should be disabled
 *  - If the value in the counter is above the minimum, the decrement button should be enabled
 *  - If the value in the counter is below the maximum, the increment button should be enabled
 *
 *  @param {Object} counter A jQuery selected object to have its style modified based on the rules above
 */
function setOneElementBarStyle(counter) {
    var label = $(counter).siblings(".element-bar-label");
    var metadata = $(counter).siblings(".element-bar-input");
    var val = parseInt($(counter).val(), 10);
    var minAndMax = getMinMax(counter);
    var min = minAndMax[0], max = minAndMax[1];
    if ($(counter).val() !== "") {
        if (val === 0) {
            $(label).addClass("zero-instances");
            $(metadata).prop('disabled', true);
        } else {
            $(label).removeClass("zero-instances");
            $(metadata).prop('disabled', false);
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
 * Set the properties/styling within the choice field according to the overall
 * control values.
 *
 * @param {Object} choiceField The jQuery selected choice field object to be modified
 */
function setChoiceFieldStyle(choiceField){
    var min = $(choiceField).attr("min");
    var max = $(choiceField).attr("max");
    var total = $(choiceField).attr("total");

    if (total === max){
        $(".element-bar-plus", choiceField).each(function(){
            $(this).prop('disabled', true);
        })
    }
    $(".element-bar-counter", choiceField).each(function(){
        if ($(this).val() !== "0")
            $(this).siblings(".element-bar-button").find(".element-bar-minus").prop('disabled', false);
        else
            $(this).siblings(".element-bar-button").find(".element-bar-minus").prop('disabled', true);
    });
}
