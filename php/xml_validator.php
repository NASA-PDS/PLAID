<?php
/**
 * Created by PhpStorm.
 * User: mikim
 * Date: 8/1/16
 * Time: 9:48 AM
 */

// Load the XML from the /tmp/ directory in the server
$filepath = '/tmp/test.xml';
$doc = new DOMDocument();
$doc->load($filepath);

// Load the XSD schema from the PSA NASA site
$schema = "https://pds.nasa.gov/pds4/pds/v1/PDS4_PDS_1600.xsd";

if(isset($_POST['Function'])){
    call_user_func($_POST['Function'], $_POST['Data']);
}
$doc->save($filepath, LIBXML_NOEMPTYTAG);

/**
 * Validator function for the generating XML, prints the errors of the XML against the XSD if invalid
 */
function validate() {
    global $doc;
    global $schema;
    global $filepath;
    libxml_use_internal_errors(true);
    if ($doc->schemaValidate($schema)) {
        print "$filepath is valid.\n";
    } else {
        print "$filepath is invalid.\n";
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