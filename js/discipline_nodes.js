/**
 * @file This file contains the functions for handling the selection of discipline nodes
 * within the LDT wizard.
 *
 * Note: Currently, the Geometry node is the only one supported. This is because the JSONs
 * for the other nodes are not yet available at this time. Once they are, their corresponding
 * JSON files will need to be included in the config directory and pointed at in the {@link filePaths}
 * object. The data-id attributes of the discipline node elements in wizard.php will also need to
 * be updated to contain the identifier for the node within the JSON. After that the code will need
 * to be modified to update the {@link jsonData.currNS} to the namespace of the current discipline node
 * as the user progresses through them in the wizard.
 *
 * @author Trevor Morse
 * @author Michael Kim
 * Creation Date: 7/15/16.
 */
/**
* Capture the user's selections of discipline nodes through the checkbox interface.
* @param {number} currentIndex indicates the current step in the wizard
 */
function discNodesSelection(currentIndex){
    var currSection = $("#wizard-p-" + currentIndex.toString());
    if ($(".checkbox-group", currSection).length > 0){
        wizardData.mainSteps = [];
        $("input:not(.stepAdded)", currSection).each(function(){
            if ($(this).is(":checked")){
                var span = $(this).siblings("span.discNode");
                var nodeName = span.html();
                nodeName = nodeName.replace(/\b\s\b/, "_").toLowerCase();
                var nodeId = span.attr("data-id");
                jsonData.nodes[nodeName] = getJSON(getNodeJsonFilename(nodeName));
                jsonData.searchObj = jsonData.nodes[nodeName];
                wizardData.mainSteps.push(nodeName);
                getElement(jsonData.nodes[nodeName], nodeName, "classDictionary", nodeId);
                $(this).addClass("stepAdded");
            }
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