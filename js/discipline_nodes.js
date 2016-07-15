/**
 * Created by morse on 7/15/16.
 */
/*
* Capture the user's selections of discipline nodes throught the checkbox interface.
* @param {number} currentIndex indicates current step in the wizard
 */
function discNodesSelection(currentIndex){
    var currSection = $("#wizard-p-" + currentIndex.toString());
    if ($(".checkbox-group", currSection)){
        $("input", currSection).each(function(){
            if ($(this).is(":checked")){
                var nodeName = $(this).siblings("span.discNode").html();
                nodeName = nodeName.replace(/\b\s\b/, "_").toLowerCase();
                console.log(nodeName);
            }
        });
    }
}