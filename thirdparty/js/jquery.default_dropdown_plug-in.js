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
const IDENTIFICATION_AREA_INFO_MODEL_VERSION_DROPDOWN_ID_PI = "0001_NASA_PDS_1.pds.Identification_Area.pds.information_model_version";
const SCHEMA_VERSION_1800_PI = "1800",
    SCHEMA_VERSION_1700_PI = "1700",
    SCHEMA_VERSION_1600_PI = "1600";
const SCHEMA_VERSION_DOTTED_1800_PI = "1.8.0.0",
    SCHEMA_VERSION_DOTTED_1700_PI = "1.7.0.0",
    SCHEMA_VERSION_DOTTED_1600_PI = "1.6.0.0";
const AGENCY_NAME_DROPDOWN_ID = "0001_NASA_PDS_1.pds.Agency.pds.name";
const JAPAN_AGENCY_NAME = "Japan Aerospace Exploration Agency";

jQuery.fn.defaultDropdownValues = function(dropdownId) {
    ///return this.each(function() {
    //  IF this dropdown is the Agency step's Name dropdown list
    if (dropdownId === AGENCY_NAME_DROPDOWN_ID) {
        console.log('In defaultDropdownValues() plug-in, Dropdown Id = "' + dropdownId + '".');
        $(this).val(JAPAN_AGENCY_NAME);
    }

    /**********************************************************************************************/
    //  IF this dropdown is the Identification Area step's Information Model Version dropdown list
    if (dropdownId === IDENTIFICATION_AREA_INFO_MODEL_VERSION_DROPDOWN_ID_PI) {
        console.log('In defaultDropdownValues() plug-in, Dropdown Id = "' + dropdownId + '".');
        //  Switch based on the Version that was selected in the Creation dialog, and placed in the URL
        var schemaVersion = getParameterByName("version");

        switch (schemaVersion) {
            //  IF the selected Schema version is '1.8.0.0'
            case SCHEMA_VERSION_1800_PI:
                //  Default the Information Model Version dropdown's value to "1.8.0.0"
                $(this).val(SCHEMA_VERSION_DOTTED_1800_PI);
                break;
            case SCHEMA_VERSION_1700_PI:
                //  Default the Information Model Version dropdown's value to "1.7.0.0"
                $(this).val(SCHEMA_VERSION_DOTTED_1700_PI);
                break;
            case SCHEMA_VERSION_1600_PI:
                //  Default the Information Model Version dropdown's value to "1.6.0.0"
                $(this).val(SCHEMA_VERSION_DOTTED_1600_PI);
                break;
        }
    }           //  end IF the Identification Area step's Information Model Version dropdown list

    /**********************************************************************************************/

    /*
     * Users can add their code here, to default dropdown lists to their desired value
     */
    

    ///});
    return this;
};
