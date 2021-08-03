# Update PLAID IM

#### This procedure will show you how to update the PLAID Information Model by correctly uploading a specified Data Dictionary version from NASA PDS PDS4 Data Standards 

https://pds.nasa.gov/datastandards/dictionaries/index-versions.shtml

## Prerequisites before moving forward with the procedure

* First, make sure you have the PLAID repository cloned to your local machine
* Next, have the JSON file for the new IM data dictionary inside `/config` directory of PLAID project
* Lastly, make a list of the PDS4 Dictionaries that should be included as part of the PDS Common Discipline


List the dictionaries use this format with the namespaceID and title `namespaceId:title`

Example:

```
msn:Mission_Information
img:Imaging
geom:Geometry
cart:Cartography
proc:Processing_Information
sp:Spectral_Characteristics
img_surface:Surface_Imaging
nucspec:NucSpec_Observation_Properties
speclib:Spectral_Library_Product
msss_cam_mh:MSSS_Camera_Mini_Header
disp:Display_Settings
msn_surface:Surface_Mission_Information
rings:Ring_Moon_Systems
survey:Survey
```


## Add Data Dictionaries to PLAID

Open file 'config.js' in directory `PLAID/config/` and add new dictInfo and filepath variables to the existing code

Start by adding a dictionary information variable `var g_dictInfo_<version>`

Fill in the code using your created list of dictionaries, PDS4 JSON file, and 'config.js'

#### Example:

Dictionary List:

```
img:Imaging
geom:Geometry
```

PDS4_ALL_1F00.JSON file:
* Use the `"namespaceId"` and `"title"` labels, locate the dictionary in the JSON
* After locating the dict, use the three labels `"title"` , `"namespaceId"` , `"identifier"` to populate the `var g_dictInfo_<> =` variable in 'config.js'

```
"class": {
            "identifier": "0001_NASA_PDS_1.geom.Geometry" ,
            "title": "Geometry" ,
            "registrationAuthorityId": "0001_NASA_PDS_1" ,
            "nameSpaceId": "geom" ,
            "steward": "geo" ,
            "versionId": "1.0.0.0" ,

```

config.js code:
* The pds 'Label Root' node should always be included at the top of the g_dictInfo variable
```
var g_dictInfo_1F00 = {
  pds: {
    ns: 'pds',
    name: 'Label Root',
    path: filePaths_1F00["PDS_JSON"]
  },
  img: {
    ns: 'img',
    name: 'Imaging',
    base_class: '0001_NASA_PDS_1.img.Imaging',
    path: filePaths_1F00["IMG_JSON"]
  },
  geom: {
    ns: 'geom',
    name: 'Geometry',
    base_class: '0001_NASA_PDS_1.geom.Geometry',
    path: filePaths_1F00["GEOM_JSON"]
  }
    
};

```

### Add File Paths for New DDs in 'config.js'

Each respective dictionary needs file paths to the PDS4 JSON file

Create a variable `var filePaths_<version>` for the DDS

#### Code Example:

```
var filePaths_1F00 = {
  PDS_JSON: "config/PDS4_ALL_1F00.JSON",
  CART_JSON: "config/PDS4_ALL_1F00.JSON",
  DISP_JSON: "config/PDS4_ALL_1F00.JSON",
  GEOM_JSON: "config/PDS4_ALL_1F00.JSON",
  IMG_JSON: "config/PDS4_ALL_1F00.JSON"
  
};

```

Use the file paths in the `g_dictInfo` dictionary 'path: filePaths_'

`IMG_JSON: "config/PDS4_ALL_1F00.JSON"`

```
var g_dictInfo_1F00 = {
  ...
  
  img: {
    ns: 'img',
    name: 'Imaging',
    base_class: '0001_NASA_PDS_1.img.Imaging',
    path: filePaths_1F00["IMG_JSON"]
  }
  
  ...

};

```

Complete this step for all DDs in the g_dictInfo variable

### Complete the IM update by adding Dictionary to the Schema Versions List

Add the version number to `var schema_list_order` and `var core_schema_versions`

```
// ordering for core_schema_versions below is from last to first
// These values are now represented as Strings, rather than Integers
var schema_list_order = ["<new version>", "1A00", "1800", "1700", "1600"];

// The keys are now represented as Strings, rather than Integers
var core_schema_versions = {
    "<new version>": {
      name: "Version v1 (1.F.0.0) - December 23, 2020",
      filePaths: filePaths_1F00,
      g_dictInfo: g_dictInfo_1F00
    },
    "1A00": {
      name: "Version v1 (1.A.0.0) - February 20, 2018",
      filePaths: filePaths_1A00,
      g_dictInfo: g_dictInfo_1A00
    }
    
    ...
    
}

```


### Render the Updated Disciplines on Dictionary Nodes

First, update the Label Wizard `wizard.php` according to the default schema version, in this case: 1.F.0.0

Within the Discipline Dictionaries tag `<h3>Discipline Dictionaries</h3>`

Append disciplines listed in the default schema version

#### Code Example:

```
<tr class="label-item">
    <td>
         <div class="checkbox-item">
              <input type="checkbox" >
              <span class="spacer"></span>
              <i class="fa fa-sun-o fa-fw" aria-hidden="true"></i>
              <span class="discNode" ns="sp" data-id="0001_NASA_PDS_1.sp.Spectral_Characteristics" step_path="plaid_discipline_node:spectral_characteristics">Spectral Characterisitics</span>
         </div>
    </td>
</tr>


```

Also configure the JSON file path and data-id variable for each discipline


```
ns="sp" data-id="0001_NASA_PDS_1.sp.Spectral_Characteristics" step_path="plaid_discipline_node:spectral_characteristics"
```



```
function getNodeJsonFilename(nodeName){
    switch (nodeName){
        case "spectral_characterisitics":
            return filePaths.SP_JSON;
        case "msss_camera mini header":
            return filePaths.MSSS_CAM_MH_JSON;
        case "survey":
            return filePaths.SURVEY_JSON;


```