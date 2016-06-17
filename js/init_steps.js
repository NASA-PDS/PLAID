/**
 * Created by morse on 6/16/16.
 */
var settings = {
    /* Appearance */
    headerTag: "h3",
    bodyTag: "section",
    contentContainerTag: "div",
    actionContainerTag: "div",
    stepsContainerTag: "div",
    cssClass: "wizard",
    stepsOrientation: $.fn.steps.stepsOrientation.horizontal,

    /* Templates */
    titleTemplate: '<span class="number">#index#.</span> #title#',
    loadingTemplate: '<span class="spinner"></span> #text#',

    /* Behaviour */
    autoFocus: false,
    enableAllSteps: false,
    enableKeyNavigation: true,
    enablePagination: true,
    suppressPaginationOnFocus: true,
    enableContentCache: true,
    enableCancelButton: false,
    enableFinishButton: true,
    preloadContent: false,
    showFinishButtonAlways: false,
    forceMoveForward: false,
    saveState: false,
    startIndex: 0,

    /* Transition Effects */
    transitionEffect: $.fn.steps.transitionEffect.none,
    transitionEffectSpeed: 200,

    /* Events */
    onStepChanging: function (event, currentIndex, newIndex) {
        return true;
    },
    onStepChanged: function (event, currentIndex, priorIndex) {
    },
    onCanceled: function (event) { },
    onFinishing: function (event, currentIndex) { return true; },
    onFinished: function (event, currentIndex) { },

    /* Labels */
    labels: {
        cancel: "Cancel",
        current: "-> ",
        pagination: "Pagination",
        finish: "Finish",
        next: "Next",
        previous: "Previous",
        loading: "Loading ..."
    }
};
/*
* Initialize the wizard using jQuery-Steps built-in method
*/
function init_steps_object(wiz_object) {
    wiz_object.steps(settings);
}
/*
* Since the wizard object is controlled by the jQuery-Steps, it is
* set to a specific height based on its content. We want to match this
* height for the sidebar on the right.
* @param {object} wizard
* @param {object} sidebar
*/
function match_wizard_height(wizard, sidebar){
    $(document).ready(function() {
        $(sidebar).css("height", $(wizard).height());
    });
}
