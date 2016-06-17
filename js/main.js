/**
 * Created by morse on 6/17/16.
 */
$(document).ready(function(){
    $(".list-group-item").each(function(){
        $(this).mouseenter(previewDetails);
    });
});
function previewDetails(){
    var selection = $(this)[0].innerHTML;
    var detailsPane = $("#details")[0];
    detailsPane.innerHTML = selection;
}
