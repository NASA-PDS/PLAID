# Update PLAID IM

#### This procedure will show you an automated way to how to update the PLAID Information Model by correctly uploading a specified Data Dictionary version from NASA PDS PDS4 Data Standards 

https://pds.nasa.gov/datastandards/dictionaries/index-versions.shtml

## Prerequisites before moving forward with the procedure

* First, make sure you have the PLAID (current branch: upgrade_plaidPDD) repository cloned to your local machine
* Next, have the JSON file for the new IM data dictionary inside `/configs` directory of PLAID project
* Lastly, make a list of the PDS4 Dictionaries that should be included as part of the PDS Common Discipline
  * The list should be make in a text file in the `/configs` directory
  * The text file should start with the full name of the JSON file of a respective Data Dictionary version from NASA PDS4 site

In the next line, start listing the dictionaries use this format with the namespaceID and title `namespaceID:title`

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

Now run the python script that creates and appends the DDs to config.js

Move into `/configs` directory of PLAID repository in your local machine, then run command:

`python addDicts.py`

This will add the listed DDs of the PDS4 JSON to config.js file



