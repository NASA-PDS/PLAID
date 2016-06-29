/**
 * Created by morse on 6/29/16.
 */
$(document).ready(function(){
    $('[data-toggle="popover"]').each(function(){
        var title = $(this).html();
        var key = title.trim().replace(/\b\s\b/, "_").toLowerCase();
        $(this).popover({
            title: title,
            content: dict[key],
            trigger: "hover"
        });
    });
});

var dict = {
    observation_area: "The observation area consists of attributes that provide information about the circumstances under which the data were collected.",
    reference_list: "The Reference_List class provides lists general references and cross-references for the product. References cited elsewhere in the label need not be repeated here.",
    file_area_observational: "The File Area Observational class describes, for an observational product, a file and one or more tagged_data_objects contained within the file.",
    file_area_observational_supplemental: "The File Area Observational Supplemental class describes, for an observational product, additional files and tagged_data_objects contained within the file.",
    comment: "The comment attribute is a character string expressing one or more remarks or thoughts relevant to the object.",
    time_coordinates: "The Time_Coordinates class provides a list of time coordinates.",
    primary_result_summary: "The Primary_Result_Summary class provides a high-level description of the types of products included in the collection or bundle.",
    investigation_area: "The Investigation_Area class provides information about an investigation (mission, observing campaign or other coordinated, large-scale data collection effort).",
    observing_system: "The Observing System class describes the entire suite used to collect the data.",
    target_identification: "The Target_Identification class provides detailed target identification information.",
    mission_area: "The mission area allows the insertion of mission specific metadata.",
    discipline_area: "The Discipline area allows the insertion of discipline specific metadata.",
    start_date_time: "The start_date_time attribute provides the date and time at the beginning of the data set.",
    stop_date_time: "The stop_date_time attribute provides the date and time at the end of the data set.",
    local_mean_solar_time: "The local_mean_solar_time attribute provides the hour angle of the fictitious mean Sun at a fixed point on a rotating solar system body.",
    local_true_solar_time: "The local_true_solar_time (LTST) attribute provides the local time on a rotating solar system body where LTST is 12 h at the sub-solar point (SSP) and increases 1 h for each 15 degree increase in east longitude away from the SSP for prograde rotation.",
    solar_longitude: "The solar_longitude attribute provides the angle between the body-Sun line at the time of interest and the body-Sun line at its vernal equinox.",
    name: "The name attribute provides a word or combination of words by which the Agency is known.",
    type: "The type attribute classifies the attribute definition according to origin.",
    internal_reference: "The Internal_Reference class is used to cross-reference other products in the PDS registry system."
};