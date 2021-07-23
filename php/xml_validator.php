<?php
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
 * @file Holds the functions for validating the label being generated in the PLAID against its respective PDS4
 * schema. It achieves this using the schemaValidate method found in the DOMDocument object from PHP.
 *
 * Creation Date: 8/1/16
 *
 * @author Michael Kim
 * @author Trevor Morse
 * @author Stirling Algermissen
 */

require_once("interact_db.php");
// Load the XSD schema from the PSA NASA site
$schema = "https://pds.jpl.nasa.gov/pds4/schema/develop/pds/PDS4_PDS_1700.xsd";

if(isset($_POST['Function'])){
    $doc = new DOMDocument();
    $doc->loadXML(getLabelXML());
    #***
    file_put_contents('logstest4.txt', 'RUNNING VALIDATOR');

    call_user_func($_POST['Function'], $_POST['Data']);
}

/**
 * Validator function for the generating XML, prints the errors of the XML against the XSD if invalid
 */
function validate() {
    global $doc;
    global $schema;
    libxml_use_internal_errors(true);
    if ($doc->schemaValidate($schema)) {
        print "Label is valid.\n";
    } else {
        print "Label is invalid.\n";
        $errors = libxml_get_errors();
        foreach ($errors as $error) {
            printf('XML error "%s" [%d] (Code %d) in %s on line %d column %d' . "\n",
                $error->message, $error->level, $error->code, $error->file,
                $error->line, $error->column);
        }
        libxml_clear_errors();
    }
    libxml_use_internal_errors(false);
}
