/**
 * Created by morse on 6/17/16.
 */
$(document).ready(function(){
    match_wizard_height($("#wizard")[0], $("#sidebar")[0]);
});
$(window).resize(function(){
    match_wizard_height($("#wizard")[0], $("#sidebar")[0]);
});
init_steps_object($("#wizard"));