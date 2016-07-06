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
    stepsOrientation: $.fn.steps.stepsOrientation.vertical,

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
    transitionEffect: $.fn.steps.transitionEffect.fade,
    transitionEffectSpeed: 200,

    /* Events */
    onStepChanging: function (event, currentIndex, newIndex) {
        $("#help").fadeOut(200);
        return true;
    },
    onStepChanged: function (event, currentIndex, priorIndex) {
        if (currentIndex > priorIndex){
            var priorStepHeading = $("#wizard-t-" + priorIndex.toString());
            var number = $(".number", priorStepHeading)[0];
            number.innerHTML = "<i class=\"fa fa-check fa-fw\" aria-hidden=\"true\"></i>";
        }
        $("#help").empty();
        previewDescription();
        $("#help").fadeIn(200);
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
function init_steps_object(wizard) {
    wizard.steps(settings);
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

function insertStep(wizard, dataObj){
    wizard.steps("insert", index, {
        title: "",
        content: generateContent(dataObj)
    });
}

function generateContent(dataObj){
    var section = document.createElement("section");
    var question = document.createElement("p");
    question.addClass("question");
    question.innerText = "What elements do you want to keep?";
    section.appendChild(question);
}

function createElementBar(dataObj){
    var elementBar = document.createElement("div");
    elementBar.addClass("input-group element-bar");

    var label = document.createElement("span");
    label.addClass("input-group-addon element-bar-label");
    label.innerText = dataObj["title"];
    elementBar.appendChild(label);

    var minusBtn = createControlButton("minus");
    elementBar.appendChild(minusBtn);

    var counter = document.createElement("input");
    counter.addClass("form-control element-bar-counter");
    $(counter).attr("value", 0);
    var min, max;
    if (dataObj["range"] === "required"){
        min = 1;
        max = 1;
    }
    else{
        min = dataObj["range"].split("-")[0];
        max = dataObj["range"].split("-")[1];
    }
    $(counter).attr("min", min);
    $(counter).attr("max", max);
    $(counter).attr("type", "text");
    elementBar.appendChild(counter);

    var plusBtn = createControlButton("plus");
    elementBar.appendChild(plusBtn);

    return elementBar;
}
function createControlButton(type){
    var btnClass, iconClass;
    if (type === "plus"){
        btnClass = "element-bar-plus";
        iconClass = "fa fa-plus fa-fw";
    }
    else{
        btnClass = "element-bar-minus";
        iconClass = "fa fa-minus fa-fw";
    }
    var wrapper = document.createElement("span");
    wrapper.addClass("input-group-btn element-bar-button");

    var btn = document.createElement("button");
    btn.addClass("btn btn-secondary " + btnClass);
    $(btn).attr("type", "button");

    var icon = document.createElement("i");
    icon.addClass(iconClass)
    $(icon).attr("aria-hidden", "true");

    btn.appendChild(icon);
    wrapper.appendChild(btn);

    return wrapper;
}