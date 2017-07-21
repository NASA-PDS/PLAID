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
 * @file Contains the code to set the default values of some of the dropdown lists.
 *
 * Creation Date: 7/21/2017.
 *
 * @author Michael Munn
 */

/**
 * Default certain dropdown lists to a particular value.
 * @param {object} selectElement - the dropdown list element
 * @param {string} dropdownId - the ID of the dropdown list element
 */
function defaultDropdownValue(selectElement, dropdownId) {
    //  Default the Identification Area step's Product Class dropdown list,
    //  based on the Product Type selected in the 1st step.
    defaultProductClassDropdownValue(selectElement, dropdownId);

    //  Default the Identification Area step's Information Model Version dropdown list,
    //  based on the Version that was selected in the Creation dialog, and placed in the URL.
    defaultInfoModelVersionDropdownValue(selectElement, dropdownId);

    /**
     * Add your function calls here, to default a dropdown list to a particular value
     */

}
/**
 * Default the Identification Area step's Product Class dropdown list,
 * based on the Product Type selected in the 1st step.
 * @param {object} selectElement - the dropdown list element
 * @param {string} dropdownId - the ID of the dropdown list element
 */
function defaultProductClassDropdownValue(selectElement, dropdownId) {
    //  IF this dropdown is the Identification Area step's Product Class dropdown list
    if (dropdownId === IDENTIFICATION_AREA_PRODUCT_CLASS_DROPDOWN_ID) {
        //  Switch based on the Product Type that was selected in the 1st step
        switch (progressData[0].selection) {
            //  IF the selected Product Type is 'Observational'
            case PRODUCT_TYPE_OBSERVATIONAL_ID:
                //  Default the Product Class dropdown's value to "Product_Observational"
                $(selectElement).val(PRODUCT_CLASS_OBSERVATIONAL);
                break;
            case PRODUCT_TYPE_DOCUMENT_ID:
                //  Default the Product Class dropdown's value to "Product_Document"
                $(selectElement).val(PRODUCT_CLASS_DOCUMENT);
                break;
            case PRODUCT_TYPE_CONTEXT_ID:
                //  Default the Product Class dropdown's value to "Product_Context"
                $(selectElement).val(PRODUCT_CLASS_CONTEXT);
                break;
            case PRODUCT_TYPE_FILE_TEXT_ID:
                //  Default the Product Class dropdown's value to "Product_File_Text"
                $(selectElement).val(PRODUCT_CLASS_FILE_TEXT);
                break;
            case PRODUCT_TYPE_THUMBNAIL_ID:
                //  Default the Product Class dropdown's value to "Product_Thumbnail"
                $(selectElement).val(PRODUCT_CLASS_THUMBNAIL);
                break;
        }
    }           //  end IF the Identification Area step's Product Class dropdown list
}
/**
 * Default the Identification Area step's Information Model Version dropdown list,
 * based on the Version that was selected in the Creation dialog, and placed in the URL.
 * @param {object} selectElement - the dropdown list element
 * @param {string} dropdownId - the ID of the dropdown list element
 */
function defaultInfoModelVersionDropdownValue(selectElement, dropdownId) {
    //  IF this dropdown is the Identification Area step's Information Model Version dropdown list
    if (dropdownId === IDENTIFICATION_AREA_INFO_MODEL_VERSION_DROPDOWN_ID) {
        //  Switch based on the Version that was selected in the Creation dialog, and placed in the URL
        var schemaVersion = getParameterByName("version");

        switch (schemaVersion) {
            //  IF the selected Schema version is '1.8.0.0'
            case SCHEMA_VERSION_1800:
                //  Default the Information Model Version dropdown's value to "1.8.0.0"
                $(selectElement).val(SCHEMA_VERSION_DOTTED_1800);
                break;
            case SCHEMA_VERSION_1700:
                //  Default the Information Model Version dropdown's value to "1.7.0.0"
                $(selectElement).val(SCHEMA_VERSION_DOTTED_1700);
                break;
            case SCHEMA_VERSION_1600:
                //  Default the Information Model Version dropdown's value to "1.6.0.0"
                $(selectElement).val(SCHEMA_VERSION_DOTTED_1600);
                break;
        }
    }           //  end IF the Identification Area step's Information Model Version dropdown list
}
