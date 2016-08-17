/**
 * Created by morse on 6/17/16.
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