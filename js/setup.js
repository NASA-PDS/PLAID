/**
 * Created by morse on 6/17/16.
 */
//setup the wizard and sidebar for the web application
var wizard = $("#wizard");
var sidebar = $("#sidebar");
init_steps_object(wizard);
match_wizard_height(wizard[0], sidebar[0]);