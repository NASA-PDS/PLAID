/**
 * @file Contains the calls to initialize the LDT wizard and control its height.
 *
 * Creation Date: 6/17/16.
 *
 * @author Trevor Morse
 * @author Michael Kim
 */
$(document).ready(function(){
    matchWizardHeight($("#wizard .content.clearfix")[0], $("#wizard .actions.clearfix")[0],
        $(".infoBar")[0], $("div.steps")[0]);
});
$(window).resize(function(){
    matchWizardHeight($("#wizard .content.clearfix")[0], $("#wizard .actions.clearfix")[0],
        $(".infoBar")[0], $("div.steps")[0]);
});
initWizard($("#wizard"));