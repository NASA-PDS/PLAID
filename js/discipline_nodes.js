/**
 * Copyright 2017 California Institute of Technology, developed with support from NASA.
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
 * @file Contains the functions for handling the selection of discipline nodes
 * within the LDT wizard.
 *
 * Note: Currently, the Geometry node is the only one supported. This is because the JSONs
 * for the other nodes are not yet available at this time. Once they are, their corresponding
 * JSON files will need to be included in the config directory and pointed at in the {@link filePaths}
 * object. The data-id attributes of the discipline node elements in wizard.php will also need to
 * be updated to contain the identifier for the node within the JSON. After that the code will need
 * to be modified to update the {@link g_state.currNS} to the namespace of the current discipline node
 * as the user progresses through them in the wizard.
 *
 * Creation Date: 7/15/16.
 *
 * @author Trevor Morse
 * @author Michael Kim
 * @author Stirling Algermissen
 */
/**
* Capture the user's selections of discipline nodes through the checkbox interface.
* @param {number} currentIndex indicates the current step in the wizard
 */
function discNodesSelection(currentIndex){
    var currSection = $("#wizard-p-" + currentIndex.toString());
    if ($(".checkbox-group", currSection).length > 0){
        wizardData.mainSteps = [];

        // Let's loop through all of those discipline node steps that have not been
        // added as a step and have the box checked to be added
        $($("input:not(.stepAdded):checked", currSection).get().reverse()).each(function(){
            // Get the discNode section DOM object
            var span = $(this).siblings("span.discNode");

            // Get the nodeName from the HTML
            var nodeName = span.html().replace(/\b\s\b/, "_").toLowerCase();

            // Get the IM identifier from the data-id
            var nodeId = span.attr("data-id");

            // Maintain the node dictionary in its own object
            // TODO - do all of the node-specific processing in the getJSON method
            // not later on in the setDisciplineDict function.
            g_jsonData.nodes[nodeName] = getJSON(getNodeJsonFilename(nodeName));
            wizardData.mainSteps.push(nodeName);

            setDisciplineDict(nodeName, nodeId);

            // Add this discipline node as a step. We go in reverse order because we basically add
            // each node step right after the current step
            insertStep($("#wizard"), wizardData.currentStep+1, g_jsonData.refObj);

            $(this).addClass("stepAdded");
        });
    }
}
/**
 * Return the file path to the JSON of data for the specified discipline node. This JSON
 * will be read in as a variable and searched through for the necessary data.
 * @param {string} nodeName parsed from the HTML element content
 * @return {string} path to the JSON file
 */
function getNodeJsonFilename(nodeName){
    switch (nodeName){
        case "cartography":
            return filePaths.CART_JSON;
        case "display":
            return filePaths.DISP_JSON;
        case "geometry":
            return filePaths.GEOM_JSON;
        case "imaging":
            return filePaths.IMG_JSON;
        case "plasma_particle":
            return filePaths.PART_JSON;
        case "ring-moon_systems":
            return filePaths.RMS_JSON;
        case "small_bodies":
            return filePaths.BOD_JSON;
        case "spectra":
            return filePaths.SPECT_JSON;
        case "wave":
            return filePaths.WAV_JSON;
        default:
            return null;
    }
}
