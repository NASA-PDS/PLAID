<?php
/**
 * Copyright 2022 California Institute of Technology
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
 * @file Validates function names passed from http clients
 *
 * Creation Date: 2022-01-05
 *
 */

// 🤔 TODO: This is a list of all functions defined in this application. It's still probably *too*
// permissive. Instead, we should check to see which are actually generated through HTML templates
// and JavaScript `backendCall` functions and narrow it down. Alas, as Morpheus once said, "Time is
// always against us."
$validFunctions = array(
    "addCustomNodes",
    "addDDAttributeNode",
    "addDDClassNode",
    "addIngestLDDNode",
    "addNode",
    "addNodeLocal",
    "addNodeValue",
    "addNodeValueLocal",
    "addNodeWithComment",
    "addRootAttrs",
    "checkForDuplicateUser",
    "checkIfLabelInUse",
    "deleteLabel",
    "fetchLabelXML",
    "formatDoc",
    "getIngestLDDToolXML",
    "getLabelInfo",
    "getLabelName",
    "getLabelShareSettings",
    "getLabelXML",
    "getMissionSpecificsData",
    "getMissionSpecificsHeaderData",
    "getNode",
    "getNodeLocal",
    "getProgressData",
    "getRawProgressData",
    "getSampleLabelXML",
    "getSessionLabelID",
    "getSpecifiedLabelXML",
    "getUserName",
    "getUsersListing",
    "getXMLStringToImport",
    "handleData",
    "handlePath",
    "insertUser",
    "isNaN",
    "isNonDefaultNamespace",
    "prependDisciplineRootNode",
    "previewIngestLDDToolTemplate",
    "previewLabelTemplate",
    "readInXML",
    "recursivelyAddDDAttributeNode",
    "recursivelyAddDDClassNode",
    "removeAllChildNodes",
    "removeClass",
    "removeNode",
    "removeRootAttrs",
    "resetPassword",
    "sanitizeInput",
    "sendLinkToResetPassword",
    "shareLabelWithUser",
    "stopSharingLabelWithUser",
    "storeMissionSpecificsData",
    "storeNewLabel",
    "storeProgressData",
    "storeProgressDataLocal",
    "storeXML",
    "storeXMLToANewLabel",
    "testUpdateLabelXML",
    "updateIngestLddXML",
    "updateLabelXML",
    "updateNodeValue",
    "updateNodeValueLocal",
    "validate",
    "verifyUser",
);

function validateFunction($name) {
    global $validFunctions;
    if (in_array($name, $validFunctions)) return;
    echo "🚨 Attempted call of function «" . $name . "»; not in valid list";
    // 🤔 TODO: For future bullet-proofing, we could go farther and check args too.
    exit(-1);
}
