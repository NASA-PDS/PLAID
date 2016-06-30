/**
 * Created by morse on 6/29/16.
 */
$(document).ready(initPopovers);

var dict = {
    identification_area: "The identification area consists of attributes that identify and name an object.<br/><i>Contains: <br/>- logical identifier<br/>- version id<br/>- title<br/>- information model version<br/>- Alias List<br/>- Citation Information<br/>- Modification History</i>",
    observation_area: "The observation area consists of attributes that provide information about the circumstances under which the data were collected.<br/><i>Contains: <br/>- Comment<br/>- Time Coordinates<br/>- Primary Result Summary<br/>- Investigation Area<br/>- Observing System<br/>- Target Identification<br/>- Mission Area<br/>- Discipline Area</i>",
    reference_list: "<b>Min Allowed: 0<br/>Max Allowed: 1</b><br/>The Reference_List class provides lists general references and cross-references for the product. References cited elsewhere in the label need not be repeated here.<br/><i>Contains: <br/>- Internal Reference<br/>- External Reference<br/></i>",
    file_area_observational: "<b>Min Allowed: 1<br/>Max Allowed: &#x221e;</b><br/>The File Area Observational class describes, for an observational product, a file and one or more tagged_data_objects contained within the file.",
    file_area_observational_supplemental: "<b>Min Allowed: 0<br/>Max Allowed: &#x221e;</b><br/>The File Area Observational Supplemental class describes, for an observational product, additional files and tagged_data_objects contained within the file.",
    comment: "<b>Min Allowed: 0<br/>Max Allowed: 1</b><br/>The comment attribute is a character string expressing one or more remarks or thoughts relevant to the object.",
    time_coordinates: "The Time_Coordinates class provides a list of time coordinates.<br/><i>Contains: <br/>- start date time<br/>- stop date time<br/>- local mean solar time<br/>- local true solar time<br/>- solar longitude</i>",
    primary_result_summary: "<b>Min Allowed: 0<br/>Max Allowed: 1</b><br/>The Primary_Result_Summary class provides a high-level description of the types of products included in the collection or bundle.<br/><i>Contains: <br/>- type<br/>- purpose<br/>- data regime<br/>- processing level<br/>- processing level id<br/>- description<br/>- Science Facets</i>",
    investigation_area: "<b>Min Allowed: 1<br/>Max Allowed: &#x221e;</b><br/>The Investigation_Area class provides information about an investigation (mission, observing campaign or other coordinated, large-scale data collection effort).<br/><i>Contains: <br/>- name<br/>- type<br/>- Internal Reference</i>",
    observing_system: "<b>Min Allowed: 1<br/>Max Allowed: &#x221e;</b><br/>The Observing System class describes the entire suite used to collect the data.<br/><i>Contains: <br/>- name<br/>- description<br/>- Observing System Component</i>",
    target_identification: "<b>Min Allowed: 1<br/>Max Allowed: &#x221e;</b><br/>The Target_Identification class provides detailed target identification information.<br/><i>Contains: <br/>- name<br/>- alternate designation<br/>- type<br/>- description<br/>- Internal Reference</i>",
    mission_area: "<b>Min Allowed: 0<br/>Max Allowed: 1</b><br/>The mission area allows the insertion of mission specific metadata.",
    discipline_area: "<b>Min Allowed: 0<br/>Max Allowed: 1</b><br/>The Discipline area allows the insertion of discipline specific metadata.",
    start_date_time: "The start_date_time attribute provides the date and time at the beginning of the data set.",
    stop_date_time: "The stop_date_time attribute provides the date and time at the end of the data set.",
    local_mean_solar_time: "<b>Min Allowed: 0<br/>Max Allowed: 1</b><br/>The local_mean_solar_time attribute provides the hour angle of the fictitious mean Sun at a fixed point on a rotating solar system body.",
    local_true_solar_time: "<b>Min Allowed: 0<br/>Max Allowed: 1</b><br/>The local_true_solar_time (LTST) attribute provides the local time on a rotating solar system body where LTST is 12 h at the sub-solar point (SSP) and increases 1 h for each 15 degree increase in east longitude away from the SSP for prograde rotation.",
    solar_longitude: "<b>Min Allowed: 0<br/>Max Allowed: 1</b><br/>The solar_longitude attribute provides the angle between the body-Sun line at the time of interest and the body-Sun line at its vernal equinox.",
    name: "The name attribute provides a word or combination of words by which the Agency is known.",
    type: "The type attribute classifies the attribute definition according to origin.",
    internal_reference: "<b>Min Allowed: 1<br/>Max Allowed: &#x221e;</b><br/>The Internal_Reference class is used to cross-reference other products in the PDS registry system.",
    context: "A basic product identifying the physical and conceptual objects related to an observational product provenance.",
    document: "A basic product identifying a single logical document, such as a description of an instrument or even a user’s manual.",
    file_text: "A basic product with a single digital file with ASCII character encoding.",
    observational: "A basic product comprising one or more images, tables, and/or other fundamental data structures that are the result of a science or engineering observation.",
    thumbnail: "A basic product consisting of a highly reduced version of an image, typically used in displaying the results from search interfaces."
};
/*
* For each element with the class name "label-item", initialize a popover.
* The title for the popover is formed from the element's inner HTML, while
* the content for the popover is parsed out of the dict object.
*/
function initPopovers(){
    $('.label-item').each(function(){
        var includeSpecifier = true;
        var title = $(this).find(".node").html();
        if (title === undefined){
            title = $(this).find(".productType").html();
            includeSpecifier = false;
        }
        var key = title.trim().replace(/\b\s\b/g, "_").toLowerCase();
        if (includeSpecifier){
            if ($(this).children(".node").hasClass("required")){
                title += " (Required)";
            }
            else {
                title += " (Optional)";
            }
        }
        $(this).popover({
            container: "body",
            html: true,
            title: title,
            content: dict[key],
            trigger: "hover"
        });
    });
}