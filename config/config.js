/**
 * @file This file contains global objects and lists that are referenced throughout
 * the project. This file provides a central place for tracking this data.
 *
 * @author Trevor Morse
 * @author Michael Kim
 * Creation Date: 7/7/16.
 */
/**
 * This object is for storing the paths to the various JSON files for PDS4 and
 * discipline nodes. These JSONs control the dynamic creation of content in the LDT.
 * @type {{PDS4_JSON: string, CART_JSON: string, DISP_JSON: string, GEOM_JSON: string, IMG_JSON: string, PART_JSON: string, RMS_JSON: string, BOD_JSON: string, SPECT_JSON: string, WAV_JSON: string}}
 */
var filePaths = {
    PDS4_JSON: "config/PDS4_PDS_JSON_1700.json",
    CART_JSON: "",
    DISP_JSON: "",
    GEOM_JSON: "config/input-PDS4_GEOM_1600_1300_GEOM_1300.JSON",
    IMG_JSON: "",
    PART_JSON: "",
    RMS_JSON: "",
    BOD_JSON: "",
    SPECT_JSON: "",
    WAV_JSON: ""
};
/**
 * This object stores data related to the JSONs being referenced. It helps with
 * searching and quick reference of the JSON data.
 * @type {{refObj: {}, pds4Obj: {}, searchObj: {}, nodes: Array, currNS: string, namespaces: Array, currNode: string}}
 */
var jsonData = {
    refObj: {},
    pds4Obj: {},
    searchObj: {},
    nodes: [],
    currNS: "",
    namespaces: [],
    currNode: ""
};
/**
 * This object contains information related to the LDT wizard. Referencing this object
 * helps with control of the wizard.
 * @type {{currentStep: number, newStep: number, maxStep: number, numWarnings: number, mainSteps: Array}}
 */
var wizardData = {
    currentStep: 0,
    newStep: 0,
    maxStep: 0,
    numWarnings: 0,
    mainSteps: []
};
/**
 * This list is for storing the user created Mission Specifics content. It will
 * be stored in a JSON format correlating to the jqTree framework.
 * @type {Array}
 */
var missionSpecifics = [];
/**
 * This is initialized as a list but is formed as a JSON. It is for storing
 * data related to the user's progress throughout the LDT wizard.
 * @type {Array}
 */
var progressData = [];
/**
 * This variable denotes whether the LDT is in a loading phase or not.
 * @type {boolean}
 */
var isLoading = false;
/**
 * This list is for storing the names of objects that incorrectly appear in the PDS4 JSON.
 * As the process of creating that JSON is solidified and the bugs are worked out, this list
 * will be deprecated.
 * @type {string[]}
 */
var invalidElementsInJSON = [
  "Conceptual_Object",
  "Physical_Object",
  "Digital_Object"
];
