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

const IDENTIFICATION_AREA_PRODUCT_CLASS_DROPDOWN_ID = "0001_NASA_PDS_1.pds.Identification_Area.pds.product_class";
const IDENTIFICATION_AREA_INFO_MODEL_VERSION_DROPDOWN_ID = "0001_NASA_PDS_1.pds.Identification_Area.pds.information_model_version";
const PRODUCT_TYPE_OBSERVATIONAL_ID = "0001_NASA_PDS_1.pds.Product_Observational",
    PRODUCT_TYPE_DOCUMENT_ID = "0001_NASA_PDS_1.pds.Product_Document",
    PRODUCT_TYPE_CONTEXT_ID = "0001_NASA_PDS_1.pds.Product_Context",
    PRODUCT_TYPE_FILE_TEXT_ID = "0001_NASA_PDS_1.pds.Product_File_Text",
    PRODUCT_TYPE_THUMBNAIL_ID = "0001_NASA_PDS_1.pds.Product_Thumbnail",
    PRODUCT_TYPE_COLLECTION_ID = "0001_NASA_PDS_1.pds.Product_Collection",
    PRODUCT_TYPE_BUNDLE_ID = "0001_NASA_PDS_1.pds.Product_Bundle";
const PRODUCT_CLASS_OBSERVATIONAL = "Product_Observational",
    PRODUCT_CLASS_DOCUMENT = "Product_Document",
    PRODUCT_CLASS_CONTEXT = "Product_Context",
    PRODUCT_CLASS_FILE_TEXT = "Product_File_Text",
    PRODUCT_CLASS_THUMBNAIL = "Product_Thumbnail",
    PRODUCT_CLASS_COLLECTION = "Product_Collection",
    PRODUCT_CLASS_BUNDLE = "Product_Bundle";
    
const SCHEMA_VERSION_1F00 = "1F00",
    SCHEMA_VERSION_1A00 = "1A00",
    SCHEMA_VERSION_1800 = "1800",
    SCHEMA_VERSION_1700 = "1700",
    SCHEMA_VERSION_1600 = "1600";
const SCHEMA_VERSION_DOTTED_1F00 = "1.F.0.0",
    SCHEMA_VERSION_DOTTED_1A00 = "1.A.0.0",
    SCHEMA_VERSION_DOTTED_1800 = "1.8.0.0",
    SCHEMA_VERSION_DOTTED_1700 = "1.7.0.0",
    SCHEMA_VERSION_DOTTED_1600 = "1.6.0.0";

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
     * Users can add their code into the plug-in function that is called below,
     * to default dropdown lists to their desired value
     * Call the JQuery Plug-in in 'thirdparty/js/jquery.default_dropdown_plug-in.js',
     * into which the user may add code.
     */
    $(selectElement).defaultDropdownValues(dropdownId);

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
        //  Need to wait until the DOM is loaded before trying to set the selected item
        setTimeout(function(){
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
                case PRODUCT_TYPE_COLLECTION_ID:
                    //  Default the Product Class dropdown's value to "Product_Collection"
                    $(selectElement).val(PRODUCT_CLASS_COLLECTION);
                    break;
                case PRODUCT_TYPE_BUNDLE_ID:
                    //  Default the Product Class dropdown's value to "Product_Bundle"
                    $(selectElement).val(PRODUCT_CLASS_BUNDLE);
                    break;
            }       //  end Switch
            //  Trigger the onChange event to update the selected item in the dropdown list
            $(selectElement).trigger("change");
        }, 0);
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

        //  Need to wait until the DOM is loaded before trying to set the selected item
        setTimeout(function(){
            switch (schemaVersion) {
                //  IF the selected Schema version is '1.8.0.0'
                case SCHEMA_VERSION_1F00:
                    //  Default the Information Model Version dropdown's value to "1.F.0.0"
                    $(selectElement).val(SCHEMA_VERSION_DOTTED_1F00);
                    break;
                case SCHEMA_VERSION_1A00:
                    //  Default the Information Model Version dropdown's value to "1.A.0.0"
                    $(selectElement).val(SCHEMA_VERSION_DOTTED_1A00);
                    break;
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
            }       //  end Switch
            $(selectElement).trigger("change");
        }, 0);
    }           //  end IF the Identification Area step's Information Model Version dropdown list
}
