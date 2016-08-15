<?php
/**
 * Created by PhpStorm.
 * User: mikim
 * Date: 8/1/16
 * Time: 9:48 AM
 */


require_once("interact_db.php");
// Load the XSD schema from the PSA NASA site
$schema = "https://pds.jpl.nasa.gov/pds4/schema/develop/pds/PDS4_PDS_1700.xsd";

if(isset($_POST['Function'])){
    $doc = new DOMDocument();
    $doc->loadXML(getLabelXML());
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

/**
 * Prints the current XML in the console
 */
function printXML() {
    global $doc;
    echo $doc->saveXML();
}