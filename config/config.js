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
    searchObj: {},
    nodes: [],
    currNS: "",
    currNode: ""
};
var wizardData = {
    currentStep: 0,
    newStep: 0,
    maxStep: 0,
    numWarnings: 0,
    mainSteps: []
};
var missionSpecifics = [
    {
    name: 'Group 1',
    children: [
        { name: 'Attribute 1', isGroup: false},
        { name: 'Attribute 2', isGroup: false }
        ],
        isGroup: true
    },
    {
        name: 'Group 2',
        children: [
            { name: 'Attribute 3', isGroup: false }
        ],
        isGroup: true
    },
    {
        name: 'Attribute 4',
        isGroup: false
    }];