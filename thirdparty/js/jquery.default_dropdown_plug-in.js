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
 * @file Contains a stub of a user-defined plug-in function for defaulting dropdown list values.
 * This stub function gets called when a dropdown list is created.
 * Users can add their code into it to set the default value of dropdown lists
 *
 * Creation Date: 7/24/2017.
 *
 * @author Michael Munn
 */
const INVESTIGATION_AREA_TYPE_DROPDOWN_ID = "0001_NASA_PDS_1.pds.Investigation_Area.pds.type";
const INVESTIGATION_AREA_MISSION_TYPE = "Mission";
const OBSERVING_SYSTEM_COMPONENT_TYPE_DROPDOWN_ID = "0001_NASA_PDS_1.pds.Observing_System_Component.pds.type";
const OBSERVING_SYSTEM_COMPONENT_BALLOON_TYPE = "Balloon";
const TARGET_IDENTIFICATION_TYPE_DROPDOWN_ID = "0001_NASA_PDS_1.pds.Target_Identification.pds.type";
const TARGET_IDENTIFICATION_CALIBRATION_TYPE = "Calibration";

jQuery.fn.defaultDropdownValues = function(dropdownId) {

    /*
     *  Examples of functions that set the default value of a dropdown list
     */
    //  Default the Investigation Area step's Type dropdown list
    ///defaultInvestigationAreaTypeDropdownValue(this, dropdownId);

    //  Default the Observing System Component step's Type dropdown list
    ///defaultObservingSystemComponentTypeDropdownValue(this, dropdownId);

    //  Default the Target Identification step's Type dropdown list
    ///defaultTargetIdentificationTypeDropdownValue(this, dropdownId);

    /*
     * Users can add their code here, to default dropdown lists to their desired value
     */


    return this;
};

/**
 * Default the Investigation Area step's Type dropdown list
 * @param {object} selectElement - the dropdown list element
 * @param {string} dropdownId - the ID of the dropdown list element
 */
function defaultInvestigationAreaTypeDropdownValue(selectElement, dropdownId) {
    //  IF this dropdown is the Investigation Area step's Type dropdown list
    if (dropdownId === INVESTIGATION_AREA_TYPE_DROPDOWN_ID) {
        console.log('In defaultInvestigationAreaTypeDropdownValue(), Dropdown Id = "' + dropdownId + '".');
        //  Need to wait until the DOM is loaded before trying to set the selected item
        setTimeout(function(){
            $(selectElement).val(INVESTIGATION_AREA_MISSION_TYPE);
            $(selectElement).trigger("change");
        }, 0);
    }
}
/**
 * Default the Observing System Component step's Type dropdown list
 * @param {object} selectElement - the dropdown list element
 * @param {string} dropdownId - the ID of the dropdown list element
 */
function defaultObservingSystemComponentTypeDropdownValue(selectElement, dropdownId) {
    //  IF this dropdown is the Observing System Component step's Type dropdown list
    if (dropdownId === OBSERVING_SYSTEM_COMPONENT_TYPE_DROPDOWN_ID) {
        console.log('In defaultObservingSystemComponentTypeDropdownValue(), Dropdown Id = "' + dropdownId + '".');
        //  Need to wait until the DOM is loaded before trying to set the selected item
        setTimeout(function(){
            $(selectElement).val(OBSERVING_SYSTEM_COMPONENT_BALLOON_TYPE);
            $(selectElement).trigger("change");
        }, 0);
    }
}
/**
 * Default the Target Identification step's Type dropdown list
 * @param {object} selectElement - the dropdown list element
 * @param {string} dropdownId - the ID of the dropdown list element
 */
function defaultTargetIdentificationTypeDropdownValue(selectElement, dropdownId) {
    //  IF this dropdown is the Target Identification step's Type dropdown list
    if (dropdownId === TARGET_IDENTIFICATION_TYPE_DROPDOWN_ID) {
        console.log('In defaultTargetIdentificationTypeDropdownValue(), Dropdown Id = "' + dropdownId + '".');
        //  Need to wait until the DOM is loaded before trying to set the selected item
        setTimeout(function(){
            $(selectElement).val(TARGET_IDENTIFICATION_CALIBRATION_TYPE);
            $(selectElement).trigger("change");
        }, 0);
    }
}
