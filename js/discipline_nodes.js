/**
 * Created by morse on 7/15/16.
 */
/**
* Capture the user's selections of discipline nodes through the checkbox interface.
* @param {number} currentIndex indicates current step in the wizard
 */
function discNodesSelection(currentIndex){
    var currSection = $("#wizard-p-" + currentIndex.toString());
    if ($(".checkbox-group", currSection).length > 0){
        $("input:not(.stepAdded)", currSection).each(function(){
            if ($(this).is(":checked")){
                var span = $(this).siblings("span.discNode");
                var nodeName = span.html();
                nodeName = nodeName.replace(/\b\s\b/, "_").toLowerCase();
                var nodeId = span.attr("data-id");
                jsonData.nodes[nodeName] = getJSON(getNodeJsonFilename(nodeName));
                jsonData.searchObj = jsonData.nodes[nodeName];
                getElement(jsonData.nodes[nodeName], nodeName, "classDictionary", nodeId);
                $(this).addClass("stepAdded");
            }
        });
    }
}
/**
 * Return the file path to the JSON of data for the specified discipline node.
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