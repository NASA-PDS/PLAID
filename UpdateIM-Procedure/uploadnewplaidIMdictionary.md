# Update PLAID IM

#### This procedure will show you an automated way to how to update the PLAID Information Model by correctly uploading a specified Data Dictionary version from NASA PDS PDS4 Data Standards ( https://pds.nasa.gov/datastandards/dictionaries/index-versions.shtml )

## Prerequisites before moving forward with the procedure

#### First, make sure you have the PLAID (current branch: upgrade_plaidPDD) repository cloned to your local machine

#### Next, have the JSON file for the new IM data dictionary inside /configs directory of PLAID project

#### Lastly, make a list of the PDS4 Dictionaries that should be included as part of the PDS Common Discipline

The list should be make in a text file in the /configs directory

The text file should start with the full name of the JSON file of a respective Data Dictionary version from NASA PDS4 site

In the next line, start listing the dictionaries use this format with the namespaceID and title ‘namespaceID:title’
