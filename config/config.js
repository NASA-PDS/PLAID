/**
 * Created by morse on 7/7/16.
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
var jsonData = {
    refObj: {},
    pds4Obj: {},
    nodes: []
};
var wizardData = {
    currentStep: 0,
    priorStep : 0,
    newStep: 0,
    maxStep: 0,
    numWarnings: 0
};