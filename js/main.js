/**
 * Copyright 2017 California Institute of Technology
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @file Contains the document.ready calls for wizard.php and helper functions used
 * throughout the project.
 *
 * Creation Date: 6/17/16.
 *
 * @author Trevor Morse
 * @author Michael Kim
 * @author Stirling Algermissen
 */
$(document).ready(function() {
    var refreshTime = 300000; // every 5 minutes in milliseconds - refresh the session
    window.setInterval( function() {
        $.ajax({
            cache: false,
            type: "GET",
            url: "php/refresh_session.php",
            success: function(data) {
            }
        });
    }, refreshTime );
    // Fix for bootstrap v4 popovers not coming back after a "hide" call
    $('body').on('hidden.bs.popover', function (e) {
        $(e.target).data("bs.popover")._activeTrigger.click = false;
        $(e.target).data("bs.popover")._activeTrigger.hover = false;
    });

    var schemaVersion = getParameterByName("version");
    if(schemaVersion === null) {
        schemaVersion = default_schema;
    }

    //  Get the Basic Mode from the URL parameter, which is passed if creating, but not if editing
    var basicModeToggle = getParameterByName("basicMode");
    if (basicModeToggle == "false") {
        g_isBasicMode = false;
    }
    else if (basicModeToggle == "true") {
        g_isBasicMode = true;
    }

    //  Set the Basic Mode Toggle's value
    if (g_isBasicMode) {
        $("#basic_mode_toggle").bootstrapToggle('on');
    } else {
        $("#basic_mode_toggle").bootstrapToggle('off');
    }

    // Set when label is created
    filePaths = core_schema_versions[schemaVersion]["filePaths"];
    g_dictInfo = core_schema_versions[schemaVersion]["g_dictInfo"];

    setupClickHandlers();


    $(".list-group-item:not(.yesButton):not(.noButton)").each(function(){
        $(this).click(captureSelection);
    });
    $(".yesButton, .noButton").click(function(){
        clearActiveElements();
        $(this).addClass("active");
        $("#wizard").steps("next");
    });
    $(".labelPreviewButton").click(function(){
        backendCall("php/preview_template.php", "previewLabelTemplate", {
            namespaces: g_jsonData.namespaces
        }, function(data){
            var wrapperDiv = document.createElement("textarea");
            wrapperDiv.className = "preview popup";
            wrapperDiv.textContent = data;
            $(wrapperDiv).css("height", "800px");

            popUpData['preview']['content'] = wrapperDiv;

            generatePopUp(popUpData['preview'], "xml", true);

            var preview_download_button = document.createElement("button");
            $(".preview-download").remove();
            $(preview_download_button).addClass("btn btn-primary preview-download");
            $(preview_download_button).on("click", function () {
                download($(".modal-body").find(".CodeMirror")[0].CodeMirror.getValue(), "label_preview.xml", "text/xml")
            });

            $(preview_download_button).text("Download Label");
            $(".modal-footer").prepend(preview_download_button);
        });

    });
    $("ul[role='menu']").hide();
    addMissionSpecificsActionBar();
    previewDescription();
    $('.modal-backdrop.loadingBackdrop').show();
    $.when(
        $.getJSON(filePaths.PDS_JSON, function(data) {
            if (data.length === 1) {
                g_jsonData.searchObj = data[0];
                g_jsonData.nodes['pds'] = data[0];
            } else {
                g_jsonData.searchObj = data;
                g_jsonData.nodes['pds'] = data;
            }
            g_jsonData.namespaces[0] = 'pds';
        }),
        $.ajax({
            method: "post",
            url: "php/interact_db.php",
            data: {
                function: "getMissionSpecificsData"
            },
            datatype: "text",
            success: function (data) {
                missionSpecifics = ($.parseJSON(data) === null ? [] : $.parseJSON(data));
            }
        }),
        $.ajax({
            method: "post",
            url: "php/interact_db.php",
            data: {
                function: "getMissionSpecificsHeaderData"
            },
            datatype: "text",
            success: function (data) {
                missionSpecificsHeader = (data === null ? {} : data);
            }
        }),
        $.ajax({
            method: "post",
            url: "php/interact_db.php",
            data: {
                function: "getLabelName"
            },
            datatype: "text",
            success: function(data){
                $(".labelNameNav").text(data);
            }
        })

    ).then(function() {
        $.ajax({
            method: "post",
            url: "php/interact_db.php",
            data: {
                function: "getProgressData"
            },
            datatype: "text",
            success: function (data) {
                progressData = $.parseJSON(data);
                //- If the progressData IS set AND IS NOT empty
                if (typeof progressData != "undefined" &&
                    progressData != null &&
                    progressData.length > 0) {
                    g_state.loading = true;
                    //    - Call load
                    loadAllProgress();
                    g_state.loading = false;

                }
            }
        }).always(function() {
            $(".modal-backdrop").hide();
        });
    });
});
/**
 * When the user selects a product type, add the active class to that element
 * and store the result.
 */
function captureSelection(){
    var element = $(this)[0];
    clearActiveElements();
    $(element).addClass("active");
    var selection = $(".productType", element).attr("data-id");

    // g_jsonData.searchObj = g_jsonData.pds4Obj;
    // getElementFromDict(g_jsonData.searchObj, "product", "classDictionary", selection);
    //  Store the selected Data Dictionary Node Name & Identifier
    //  You'll need them if the user goes to another data dictionary like cartography,
    //  and then comes back to a step that uses this one.
    //  Place the two pieces of info into a struct
    var dataDictNodeInfo = {nodeName: "pds", identifier: selection};
    g_jsonData.dataDictNodeInfo.splice(g_state.nsIndex, 0, dataDictNodeInfo);
    setDisciplineDict("pds", selection);
    g_dictInfo["pds"]["base_class"] = selection;
    insertStep($("#wizard"), wizardData.currentStep+1, g_jsonData.refObj);
    //auto-advance to the next step after capturing the user's product selection
    $("#wizard").steps("next");
}
/**
 * Helper function to remove the active class from all elements.
 */
function clearActiveElements(){
    $(".active").removeClass("active");
}
/**
 * Parse out the title of the current step and use that to determine
 * which attribute to access from the {@link infoBarData} object.
 */
function previewDescription(){
    var currentStep = $(".title.current")[0].innerHTML
                        .trim()
                        .replace(/\b\s\b/, "_")
                        .toLowerCase();
    var data;
    if (infoBarData[currentStep])
        data = infoBarData[currentStep];
    else
        data = infoBarData["optional_nodes"];
    $("#help").append(data);
}

/**
 * When the user clicks on a plus button, increment the corresponding counter.
 * If it is a choice group (in other words, the user can choose between multiple elements),
 * then ensure that the values are okay within the context of the group.
 */
function increaseCounter(){
    var counter = $(this).parent().siblings(".element-bar-counter");
    var minAndMax = getMinMax(counter);
    var counterMin = minAndMax[0], counterMax = minAndMax[1];
    var currVal = parseInt(counter.val(), 10);
    var newVal = (currVal + 1);
    var choiceGroup = $(this).parents(".choice-field");
    var cgMin, currTotal, isCG = false;
    if (choiceGroup.length > 0){
        cgMin = parseInt($(choiceGroup).attr("min"), 10);
        currTotal = parseInt($(choiceGroup).attr("total"), 10);
        isCG = true;
    }
    if (newVal >= counterMin && newVal <= counterMax){
        counter.prop("value", newVal);
        if (isCG){
            currTotal += 1;
            $(choiceGroup).attr("total", currTotal);
            if (currTotal > cgMin){
                $(".btn.element-bar-minus", choiceGroup).each(function(){
                    var val = $(this).parent().siblings(".element-bar-counter").prop("value");
                    if (val !== "0") { $(this).prop("disabled", false); }
                });
            }
        }
        $(this).parent().siblings(".element-bar-label").removeClass("zero-instances");
        $(this).parent().siblings(".element-bar-input").prop('disabled', false);
        $(this).parent().siblings(".selectpicker").prop('disabled', false);
        //  Enable the Unit dropdown list
        //  Get the sibling that is the unitchooser selectpicker's div tag, which contains the 'select' tag
        var unitchooserDivTagElement = $(this).parent().siblings(".unitchooser");
        //  Enable the div tag's child 'select' tag
        $('.unitchooser', unitchooserDivTagElement).prop('disabled', false);
        $('.unitchooser', unitchooserDivTagElement).selectpicker('refresh');

        $(this).parent().siblings(".element-bar-button").children(".element-bar-minus").prop('disabled', false);
    }
    if (newVal === counterMax){
        $(this).prop('disabled', true);
        if (isCG){
            $(".btn.element-bar-plus", choiceGroup).each(function(){
                $(this).prop("disabled", true);
            });
        }
    }
}
/**
 * When the user clicks on a minus button, decrement the corresponding counter.
 * If it is a choice group (in other words, the user can choose between multiple elements),
 * then ensure that the values are okay within the context of the group.
 */
function decreaseCounter(){
    var counter = $(this).parent().siblings(".element-bar-counter");
    var minAndMax = getMinMax(counter);
    var counterMin = minAndMax[0], counterMax = minAndMax[1];
    var currVal = parseInt(counter.val(), 10);
    var newVal = (currVal - 1);
    var choiceGroup = $(this).parents(".choice-field");
    var cgMin, currTotal, isCG = false;
    if (choiceGroup.length > 0){
        cgMin = parseInt($(choiceGroup).attr("min"), 10);
        currTotal = parseInt($(choiceGroup).attr("total"), 10);
        isCG = true;
    }
    if (newVal >= counterMin && newVal <= counterMax){
        counter.prop("value", newVal);
        if (isCG){
            currTotal -= 1;
            $(choiceGroup).attr("total", currTotal);
            if (currTotal <= cgMin){
                $(".btn.element-bar-plus", choiceGroup).each(function(){
                    $(this).prop("disabled", false);
                });
            }
        }
        $(this).parent().siblings(".element-bar-button").children(".element-bar-plus").prop('disabled', false);
    }
    if (newVal === counterMin){
        $(this).prop('disabled', true);
        if (isCG && cgMin !== 0 && currTotal <= cgMin){
            $(".btn.element-bar-minus", choiceGroup).each(function(){
                $(this).prop("disabled", true);
            });
        }
    }
    if (newVal === 0){
        $(this).parent().siblings(".element-bar-label").addClass("zero-instances");
        $(this).parent().siblings(".element-bar-input").prop('disabled', true);
        if($(this).parent().siblings(".selectpicker").length != 0) {
            $(this).parent().siblings(".selectpicker").prop('disabled', true);
            $(this).parent().siblings(".selectpicker").selectpicker('refresh');
        }
        //  Disable the Unit dropdown list
        //  Get the sibling that is the unitchooser selectpicker's div tag, which contains the 'select' tag
        var unitchooserDivTagElement = $(this).parent().siblings(".unitchooser");
        //  Disable the div tag's child 'select' tag
        $('.unitchooser', unitchooserDivTagElement).prop('disabled', true);
        $('.unitchooser', unitchooserDivTagElement).selectpicker('refresh');
    }
}
/**
 * Helper function to return min/max values from the element's attributes.
 * @returns {number[]}
 */
function getMinMax(counter){
    var counterMin = parseInt($(counter).attr("min"), 10);
    var counterMax = $(counter).attr("max");
    if (counterMax === "inf"){
        counterMax = 999999999999;
    }
    else{
        counterMax = parseInt(counterMax);
    }
    return Array(counterMin, counterMax);
}
/**
 * Before the user submits the filename form (on the Export step),
 * ensure that the filename is valid. Show there is an error otherwise.
 * @param filenameInputId the ID string of the Input tag for the filename
 * @returns {boolean}
 */
function checkFilename(filenameInputId){
    var input = $("#" + filenameInputId);
    var regex = new RegExp("^[a-zA-Z][a-zA-Z0-9_-]+.xml$");
    if ($(input).val().match(regex)){
        $(input).removeClass("error");
        $("#exportForm").submit();
    }
    else{
        $(input).addClass("error");
        alert("Please use .xml extension. For example: filename.xml");
        return false;
    }
    return true;
}
/**
 * Determine whether or not the user is transitioning to the final step in the wizard.
 * If so, show a preview of the label template.
 * @param newIndex of the step the user is transitioning to
 */
function handleExportStep(newIndex){
    var nextSection = $("#wizard-p-" + newIndex.toString());
    var isExportStep = $(nextSection).find(".exportForm").length > 0;
    var hasNoPreview = !$(nextSection).find(".finalPreview").length > 0;
    if (isExportStep){
        var isAnyBuilderStep = false;
        //  Look for a Builder step
        for (var s=0; s < progressData.length; s++) {
            if (progressData[s].step === "builder") {
                isAnyBuilderStep = true;
                break;
            }
        }
        if(hasNoPreview) {
            /*
             backendCall("php/xml_mutator.php",
             "addRootAttrs",
             {namespaces: g_jsonData.namespaces},
             function(data){});

             backendCall("php/xml_mutator.php",
             "formatDoc",
             {},
             function(data){}); */
            var preview = generateFinalPreview(g_jsonData.namespaces);
            $("#finalPreview", nextSection).append(preview[0]);
            var codemirror_editor = CodeMirror.fromTextArea(preview[1], {
                mode: "xml",
                lineNumbers: true,
                foldGutter: true,
                gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
            });
            $(".CodeMirror").css("height", "93%");
            setTimeout(function () {
                codemirror_editor.refresh();
            }, 100);

            //  IF there is any Builder step
            if (isAnyBuilderStep) {
                //  Show the Ingest LDDTool preview
                $(".exportIngestLDDForm").show();
                //  Generate preview of the Ingest LDDTool template
                var previewIngestLDDTool = generateIngestLDDToolPreview(g_jsonData.namespaces);
                $("#finalPreviewIngest", nextSection).append(previewIngestLDDTool[0]);
                var codemirror_editor_ingest = CodeMirror.fromTextArea(previewIngestLDDTool[1], {
                    mode: "xml",
                    lineNumbers: true,
                    foldGutter: true,
                    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
                });
                $(".CodeMirror").css("height", "93%");
                setTimeout(function () {
                    codemirror_editor_ingest.refresh();
                }, 100);
            } else {
                //  Hide the Ingest LDDTool preview
                $(".exportIngestLDDForm").hide();
            }
        } else {
            // regenerate preview
            backendCall("php/preview_template.php", "previewLabelTemplate", {
                namespaces: g_jsonData.namespaces
            }, function(data){
                $.each($(".CodeMirror", "#finalPreview"), function(key, mirror) {
                    mirror.CodeMirror.setValue(data);
                    setTimeout(function() {
                        mirror.CodeMirror.refresh();
                    },1);
                });
            });

            //  IF there is any Builder step
            if (isAnyBuilderStep) {
                backendCall("php/preview_template.php", "previewIngestLDDToolTemplate", {
                    namespaces: g_jsonData.namespaces
                }, function (data) {
                    $.each($(".CodeMirror", "#finalPreviewIngest"), function (key, mirror) {
                        mirror.CodeMirror.setValue(data);
                        setTimeout(function () {
                            mirror.CodeMirror.refresh();
                        }, 1);
                    });
                });
            }
        }
    }
}
/**
 * Generate a preview of the completed label template. This makes a call
 * to the backend to read the contents of the label template file.
 * @returns {Element}
 */
function generateFinalPreview(namespaces) {
    var previewContainer = document.createElement("div");
    previewContainer.className = "finalPreview previewContainer";

    var card = document.createElement("div");
    card.className = "finalPreview card";

    var cardHeader = document.createElement("div");
    cardHeader.className = "finalPreview card-header";
    cardHeader.innerHTML = "Label Template Preview";
    card.appendChild(cardHeader);

    var cardBlock = document.createElement("textarea");
    cardBlock.className = "";
    card.appendChild(cardBlock);

    backendCall("php/preview_template.php", "previewLabelTemplate", {
        namespaces: namespaces
    }, function(data){
        $(cardBlock).text(data);
    });

    previewContainer.appendChild(card);

    return [previewContainer, cardBlock];
}
/**
 * Generate a preview of the completed Ingest LDDTool template. This makes a call
 * to the backend to read the contents of the Ingest LDDTool XML file.
 * @returns {Element}
 */
function generateIngestLDDToolPreview(namespaces) {
    var previewContainer = document.createElement("div");
    previewContainer.className = "finalPreviewIngest previewIngestContainer";

    var card = document.createElement("div");
    card.className = "finalPreviewIngest cardIngest";

    var cardHeader = document.createElement("div");
    cardHeader.className = "finalPreviewIngest card-ingest-header";
    cardHeader.innerHTML = "Ingest LDDTool Template Preview";
    card.appendChild(cardHeader);

    var cardBlock = document.createElement("textarea");
    cardBlock.className = "";
    card.appendChild(cardBlock);

    backendCall("php/preview_template.php", "previewIngestLDDToolTemplate", {
        namespaces: namespaces
    }, function(data){
        $(cardBlock).text(data);
    });

    previewContainer.appendChild(card);

    return [previewContainer, cardBlock];
}
/**
 * Make a call to a function in the specified file on the backend.
 * @param {string} file name of the PHP file
 * @param {string} funcName name of the function to execute in the PHP
 * @param {Object} args object containing any arguments for the function
 * @param {Function} callback function to execute upon return
 */
function backendCall(file, funcName, args, callback){
    $.ajax({
        async: false,
        type: "POST",
        url: file,
        data: {
            Function: funcName,
            Data: args
        },
        success: callback
    });
}
/**
 * Generate a unique id for a class/attribute, for tracking removal
 */
function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}
/**
 * Given a step in the tool, determines the difference between the index in
 * wizardData.stepPaths and the wizard's actual steps
 * @param {string} file name of the PHP file
 * @param {string} funcName name of the function to execute in the PHP
 * @param {Object} args object containing any arguments for the function
 * @param {Function} callback function to execute upon return
 */
function getStepOffset(insertion_index) {
    // Need to determine if we're past discipline node section
    var offset = 2;
    var done = 0;
    for(var t = 0; t < wizardData.stepPaths.length && done == 0; t++) {
        var value = wizardData.stepPaths[t];
        if(value.indexOf("plaid_discipline_node:") != -1) {
            if(insertion_index >= t) { // inserting an element past the discipline node section..
                offset = offset + 1;
                done = 1;
            }
        }
    }
    return offset;
}

/**
 * This function parses URL parameters
 */
function getParameterByName(name, url) {
    if (!url) {
        url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

/*
 * Static click handlers are setup here.
 */
function setupClickHandlers() {
    $("#exportButton").on("click", function(event) {
        if(checkFilename("exportInput")) {
            var label = $(".CodeMirror", "#finalPreview")[0].CodeMirror.getValue();
            download(label, $("#exportInput").val(), "text/xml");
        }
    });

    $("#exportIngestLDDButton").on("click", function(event) {
        if(checkFilename("exportIngestLDDInput")) {
            var label = $(".CodeMirror", "#finalPreviewIngest")[0].CodeMirror.getValue();
            download(label, $("#exportIngestLDDInput").val(), "text/xml");
        }
    });

    $("#submitButton").on("click", function(event) {
        event.preventDefault();
        var label = $(".CodeMirror", "#finalPreview")[0].CodeMirror.getValue();
        var option_string = "";
        for(var pds_node in node_contact_info) {
            option_string += "<option value='" + pds_node + "'>" + node_contact_info[pds_node]["node_name"] + "</option>";
        }

        var sendLabelPopUp = {};
        sendLabelPopUp['id'] = 'exportLabelToPDS';
        sendLabelPopUp['title'] = 'Send PDS4 Label to PDS Node';
        sendLabelPopUp['content'] = '<form method="post">'+
            '<div class="form-group ">'+
            '<label class="control-label " for="pds_node_select">'+
            'Select a PDS Node to send label to:'+
            '</label>'+
            '<select class="select form-control" id="pds_node_select" name="pds_node_select">'+
            option_string +
            '</select>'+
            '</div>'+
            '<div class="form-group ">'+
            '<label class="control-label " for="comments">'+
            'Comments for PDS Node:'+
            '</label>'+
            '<textarea class="form-control" cols="40" id="comments" name="comments" rows="10"></textarea>'+
            '</div>'+
            '<div class="form-group">'+
            '</div>'+
            '</form>';
        sendLabelPopUp['noText'] = 'Cancel';
        sendLabelPopUp['noFunction'] = function () {
            $('#exportLabelToPDS').modal('hide');
        };
        sendLabelPopUp['yesText'] = 'Send to PDS';
        sendLabelPopUp['yesFunction'] = function () {
            $.ajax({
                type: "post",
                url: "php/send_template.php",
                data: {
                    pds_node: $("#pds_node_select").val(),
                    pds_node_rep_name: node_contact_info[$("#pds_node_select").val()]["name"],
                    pds_node_email: node_contact_info[$("#pds_node_select").val()]["email"],
                    comments: $("#comments").val(),
                    namespaces: g_jsonData.namespaces
                }
            }).done(function(data) {

                if(parseInt(data) == 0) {
                    alert("Label sent successfully!");
                } else {
                    alert("There was an error sending your label.")
                }
            }).fail(function() {
                alert("There was an error sending your label.")
            });

            $('#exportLabelToPDS').modal('hide');
            $('#exportLabelToPDS').on('hidden.bs.modal', function () {
                $("body .modal.fade.hide").remove();
                $("body .modal-backdrop.fade.in").remove();
            });
        };
        generatePopUp(sendLabelPopUp);
        return false;
    });
}