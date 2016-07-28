/**
 * Created by morse on 6/29/16.
 */
$(document).ready(initPopovers);

var dict = {
    context: "A basic product identifying the physical and conceptual objects related to an observational product provenance.",
    document: "A basic product identifying a single logical document, such as a description of an instrument or even a user’s manual.",
    file_text: "A basic product with a single digital file with ASCII character encoding.",
    observational: "A basic product comprising one or more images, tables, and/or other fundamental data structures that are the result of a science or engineering observation.",
    thumbnail: "A basic product consisting of a highly reduced version of an image, typically used in displaying the results from search interfaces.",
    geometry: "Contains meta-data relating to flight paths of spacecrafts and the paths of rovers. If your mission involves the movement of any kind of vehicle, you need the geometry discipline!",
    imaging: "Contains meta-data relating to any images. This includes filters, bands, angles of cameras, temperature of cameras, etc. If your data involves any pictures at all, odds are you need the imaging discipine!",
    cartography: "Contains metadata on mapping systems. If your mission is mapping celestial information or even terrestrial, you need the Cartography node!",
    small_bodies: "Contains metadata on objects that qualify as small bodies. Asteroides, comets, dust, or anything that isn't in solar orbit",
    plasma_particle: "Contains information on the interaction between the solar wind and planetary winds with planetary magnetospheres, ionospheres and surfaces.",
    display: "Contains the details about how to display data on a device. For example, if you have movie data, then you need the Display node to explain how to use software to view the movie.",
    spectra: "Contains detail about presenting data in any kind of spectrum",
    wave: "Contains classes that describe the composition of multidimensional wave data consisting of Array (and Array subclass) data objects"
};
/**
* For each element with the class name "label-item", initialize a popover.
* The title for the popover is formed from the element's inner HTML, while
* the content for the popover is parsed out of the dict object.
*/
function initPopovers(){
    $('.label-item').each(function(){
        var title = $(this).find(".productType").html();
        if (title === undefined) { title = $(this).find(".discNode").html(); }
        var key = title.trim().replace(/\b\s\b/g, "_").toLowerCase();
        $(this).popover({
            container: "body",
            html: true,
            title: title,
            content: dict[key],
            trigger: "hover"
        });
    });
}
/**
* Called to dynamically add popovers as elements are added to the wizard.
* Uses data from the corresponding objects.
* @param {HTML element} element to add the popover to
* @param {Object} data object containing info for the popover
* @param {string} min info from element denoting minimum occurrences of the object
* @param {string} max info from element denoting maximum occurrences of the object
 */
function addPopover(element, data, min, max){
    if (max === "9999999999"){ max = "unbounded"; }
    var title = data["title"].replace(/_/g, " ");
    var description = "";
    if (data["isRequired"]){
        title += " (Required)";
        description = data["description"];
    }
    else {
        title += " (Optional)";
        min = "<b>Min Occurrences: " + min + "</b><br/>";
        max = "<b>Max Occurrences: " + max + "</b><br/>";
        description = min + max + data["description"];
    }
    if(data["next"] && !$.isEmptyObject(data["next"])){
        description += "<br/><b>Sub-elements: </b><br/>";
    }
    for (var index in data["next"]){
        for (var key in data["next"][index]){
            description += "<i>- " + data["next"][index][key]["title"] + "</i><br/>";
        }
    }
    $(element).popover({
        container: "body",
        html: true,
        title: title,
        content: description,
        trigger: "hover"
    });
}
/**
* Sometimes popovers remain on the page after the user has stopped hovering
* over the corresponding element. This will hide all remaining popovers.
 */
function removePopovers(){
    $(".label-item").popover('hide');
    $(".element-bar").popover('hide');
}