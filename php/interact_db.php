<?php
/**
 * Created by PhpStorm.
 * User: morse
 * Date: 8/9/16
 * Time: 11:07 AM
 */
require_once('../thirdparty/php/PasswordHash.php');
$HASHER = new PasswordHash(8, false);
try{
    $LINK = new \PDO('mysql:host=miplapps2.jpl.nasa.gov;dbname=apps;charset=utf8mb4;port=4306',
        'dev',
        '!miplDev8',
        array(
            \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
            \PDO::ATTR_PERSISTENT => false
        )
    );

    if(isset($_POST['function'])){
        call_user_func($_POST['function'], $_POST);
    }
}
catch(\PDOException $ex){
    print($ex->getMessage());
}
/**
 * When a new user creates an account, store the form data in the user table.
 * @param {Object} $args
 */
function insertUser($args){
    global $LINK;
    global $HASHER;
    $handle = $LINK->prepare('INSERT INTO user SET email=?,password=?,full_name=?,organization=?');
    $index = 1;
    foreach($args as $key=>$value){
        if ($key === "password"){
            $handle->bindValue($index++, $HASHER->HashPassword($value));
        }
        else if ($key !== "function"){
            $handle->bindValue($index++, $value);
        }
    }
    $handle->execute();
    header("Location: ../dashboard.php");
}
/**
 * Verify that the user exists in the database and entered the correct password.
 * @param {Object} $args
 */
function verifyUser($args){
    global $LINK;
    global $HASHER;
    $handle = $LINK->prepare('select id,password from user where email=?');
    $handle->bindValue(1, $args['email']);

    $handle->execute();
    $result = $handle->fetchAll(\PDO::FETCH_OBJ);

    session_start();
    if (count($result) === 1 &&
        $HASHER->CheckPassword($args['password'], $result[0]->password)){
        header("Location: ../dashboard.php");
        $_SESSION['login'] = true;
        $_SESSION['user_id'] = $result[0]->id;
    }
    else{
        header("Location: ../login.html");
        $_SESSION['login'] = true;
    }

}

/**
 * Use the user_id stored in a session variable to look up the info for all labels
 * associated with that user.
 */
function getLabelInfo(){
    global $LINK;
    session_start();
    if(isset($_SESSION['user_id'])){
        $handle = $LINK->prepare('select label_id from link where user_id=?');
        $handle->bindValue(1, $_SESSION['user_id'], PDO::PARAM_INT);

        $handle->execute();
        $result = $handle->fetchAll(\PDO::FETCH_OBJ);
        $return = array();
        foreach ($result as $row){
            $labelId = $row->label_id;
            $handle = $LINK->prepare('select id,creation,last_modified,name from label where id=?');
            $handle->bindValue(1, $labelId, PDO::PARAM_INT);

            $handle->execute();
            $result = $handle->fetch(\PDO::FETCH_OBJ);
            array_push($return, $result);
        }
        header('Content-type: application/json');
        echo json_encode($return);
    }
}

/**
 * When a user creates a new label, create an entry for it in the label table and link
 * it to the user in the link table.
 * @param {Object} $args
 */
function storeNewLabel($args){
    global $LINK;
    $data = '<Product_Observational>
    <Identification_Area>
        <logical_identifier></logical_identifier>
        <version_id></version_id>
        <title></title>
        <information_model_version></information_model_version>
        <product_class></product_class>
        <Alias_List>
            <Alias>
                <alternate_id></alternate_id>
                <alternate_title></alternate_title>
                <comment></comment>
            </Alias>
        </Alias_List>
        <Citation_Information>
            <author_list></author_list>
            <editor_list></editor_list>
            <publication_year></publication_year>
            <keyword></keyword>
            <description></description>
        </Citation_Information>
        <Modification_History>
            <Modification_Detail>
                <modification_date></modification_date>
                <version_id></version_id>
                <description></description>
            </Modification_Detail>
        </Modification_History>
    </Identification_Area>
    <Observation_Area>
        <comment></comment>
        <Time_Coordinates>
            <start_date_time></start_date_time>
            <stop_date_time></stop_date_time>
            <local_mean_solar_time></local_mean_solar_time>
            <local_true_solar_time></local_true_solar_time>
            <solar_longitude></solar_longitude>
        </Time_Coordinates>
        <Primary_Result_Summary>
            <type></type>
            <purpose></purpose>
            <data_regime></data_regime>
            <processing_level></processing_level>
            <processing_level_id></processing_level_id>
            <description></description>
            <Science_Facets>
                <wavelength_range></wavelength_range>
                <domain></domain>
                <discipline_name></discipline_name>
                <facet1></facet1>
                <subfacet1></subfacet1>
                <facet2></facet2>
                <subfacet2></subfacet2>
            </Science_Facets>
        </Primary_Result_Summary>
        <Investigation_Area>
            <name></name>
            <type></type>
            <Internal_Reference>
                <lid_reference></lid_reference>
                <reference_type></reference_type>
                <comment></comment>
            </Internal_Reference>
        </Investigation_Area>
        <Observing_System>
            <name></name>
            <description></description>
            <Observing_System_Component>
                <name></name>
                <type></type>
                <description></description>
                <Internal_Reference>
                    <lid_reference></lid_reference>
                    <reference_type></reference_type>
                    <comment></comment>
                </Internal_Reference>
                <External_Reference>
                    <doi></doi>
                    <reference_text></reference_text>
                    <description></description>
                </External_Reference>
            </Observing_System_Component>
        </Observing_System>
        <Target_Identification>
            <name></name>
            <alternate_designation></alternate_designation>
            <type></type>
            <description></description>
            <Internal_Reference>
                <lid_reference></lid_reference>
                <reference_type></reference_type>
                <comment></comment>
            </Internal_Reference>
        </Target_Identification>
        <Mission_Area>
            <ins:InsightClass></ins:InsightClass>
        </Mission_Area>
        <Discipline_Area></Discipline_Area>
    </Observation_Area>
    <Reference_List>
        <Internal_Reference>
            <lid_reference></lid_reference>
            <reference_type></reference_type>
            <comment></comment>
        </Internal_Reference>
        <External_Reference>
            <doi></doi>
            <reference_text></reference_text>
            <description></description>
        </External_Reference>
    </Reference_List>
    <File_Area_Observational>
        <File>
            <file_name></file_name>
            <local_identifier></local_identifier>
            <creation_date_time></creation_date_time>
            <file_size></file_size>
            <records></records>
            <md5_checksum></md5_checksum>
            <comment></comment>
        </File>
        <Array_1D>
            <name></name>
            <local_identifier></local_identifier>
            <offset></offset>
            <axes></axes>
            <axis_index_order></axis_index_order>
            <description></description>
            <Element_Array>
                <data_type></data_type>
                <unit></unit>
                <scaling_factor></scaling_factor>
                <value_offset></value_offset>
            </Element_Array>
            <Axis_Array>
                <axis_name></axis_name>
                <local_identifier></local_identifier>
                <elements></elements>
                <unit></unit>
                <sequence_number></sequence_number>
                <Band_Bin_Set>
                    <Band_Bin>
                        <band_number></band_number>
                        <band_width></band_width>
                        <center_wavelength></center_wavelength>
                        <detector_number></detector_number>
                        <filter_number></filter_number>
                        <grating_position></grating_position>
                        <original_band></original_band>
                        <standard_deviation></standard_deviation>
                        <scaling_factor></scaling_factor>
                        <value_offset></value_offset>
                    </Band_Bin>
                </Band_Bin_Set>
            </Axis_Array>
            <Special_Constants>
                <saturated_constant></saturated_constant>
                <missing_constant></missing_constant>
                <error_constant></error_constant>
                <invalid_constant></invalid_constant>
                <unknown_constant></unknown_constant>
                <not_applicable_constant></not_applicable_constant>
                <valid_maximum></valid_maximum>
                <high_instrument_saturation></high_instrument_saturation>
                <high_representation_saturation></high_representation_saturation>
                <valid_minimum></valid_minimum>
                <low_instrument_saturation></low_instrument_saturation>
                <low_representation_saturation></low_representation_saturation>
            </Special_Constants>
            <Object_Statistics>
                <local_identifier></local_identifier>
                <maximum></maximum>
                <minimum></minimum>
                <mean></mean>
                <standard_deviation></standard_deviation>
                <bit_mask></bit_mask>
                <median></median>
                <md5_checksum></md5_checksum>
                <maximum_scaled_value></maximum_scaled_value>
                <minimum_scaled_value></minimum_scaled_value>
                <description></description>
            </Object_Statistics>
        </Array_1D>
    </File_Area_Observational>
    <File_Area_Observational_Supplemental>
        <File>
            <file_name></file_name>
            <local_identifier></local_identifier>
            <creation_date_time></creation_date_time>
            <file_size></file_size>
            <records></records>
            <md5_checksum></md5_checksum>
            <comment></comment>
        </File>
        <Array_1D>
            <name></name>
            <local_identifier></local_identifier>
            <offset></offset>
            <axes></axes>
            <axis_index_order></axis_index_order>
            <description></description>
            <Element_Array>
                <data_type></data_type>
                <unit></unit>
                <scaling_factor></scaling_factor>
                <value_offset></value_offset>
            </Element_Array>
            <Axis_Array>
                <axis_name></axis_name>
                <local_identifier></local_identifier>
                <elements></elements>
                <unit></unit>
                <sequence_number></sequence_number>
                <Band_Bin_Set>
                    <Band_Bin>
                        <band_number></band_number>
                        <band_width></band_width>
                        <center_wavelength></center_wavelength>
                        <detector_number></detector_number>
                        <filter_number></filter_number>
                        <grating_position></grating_position>
                        <original_band></original_band>
                        <standard_deviation></standard_deviation>
                        <scaling_factor></scaling_factor>
                        <value_offset></value_offset>
                    </Band_Bin>
                </Band_Bin_Set>
            </Axis_Array>
            <Special_Constants>
                <saturated_constant></saturated_constant>
                <missing_constant></missing_constant>
                <error_constant></error_constant>
                <invalid_constant></invalid_constant>
                <unknown_constant></unknown_constant>
                <not_applicable_constant></not_applicable_constant>
                <valid_maximum></valid_maximum>
                <high_instrument_saturation></high_instrument_saturation>
                <high_representation_saturation></high_representation_saturation>
                <valid_minimum></valid_minimum>
                <low_instrument_saturation></low_instrument_saturation>
                <low_representation_saturation></low_representation_saturation>
            </Special_Constants>
            <Object_Statistics>
                <local_identifier></local_identifier>
                <maximum></maximum>
                <minimum></minimum>
                <mean></mean>
                <standard_deviation></standard_deviation>
                <bit_mask></bit_mask>
                <median></median>
                <md5_checksum></md5_checksum>
                <maximum_scaled_value></maximum_scaled_value>
                <minimum_scaled_value></minimum_scaled_value>
                <description></description>
            </Object_Statistics>
        </Array_1D>
    </File_Area_Observational_Supplemental>
</Product_Observational>';
    session_start();
    $handle = $LINK->prepare('INSERT INTO label SET creation=now(),last_modified=now(),name=?,label_xml=?');
    $handle->bindValue(1, $args['labelName']);
    $handle->bindValue(2, $data);
    $handle->execute();

    $handle = $LINK->prepare('select id from label where name=?');
    $handle->bindValue(1, $args['labelName']);
    $handle->execute();
    $result = $handle->fetch(\PDO::FETCH_OBJ);

    $handle = $LINK->prepare('INSERT INTO link SET user_id=?,label_id=?');
    $handle->bindValue(1, $_SESSION['user_id']);
    $handle->bindValue(2, $result->id);
    $handle->execute();

    $_SESSION['label_id'] = $result->id;
}

/**
 * Read out the XML from the database
 * @return mixed
 */
function getLabelXML(){
    global $LINK;
    session_start();
    $handle = $LINK->prepare('select label_xml from label where id=?');
    $handle->bindValue(1, $_SESSION['label_id']);
    $handle->execute();

    $result = $handle->fetch(\PDO::FETCH_OBJ);
    return $result->label_xml;
}

/**
 * Update the XML stored in the database with the most recent changes.
 * @param {Object} $args
 */
function updateLabelXML($args){
    global $LINK;
    session_start();
    $handle = $LINK->prepare('update label set last_modified=now(),label_xml=? where id=?');
    $handle->bindValue(1, $args['xml']);
    $handle->bindValue(2, $_SESSION['label_id']);
    $handle->execute();
}

/**
 * Remove the link and label entries for the specifed label id.
 * Note: the link entry must be removed before the label entry because it is
 * a foreign key to the label entry.
 * @param {Object} $args
 */
function deleteLabel($args){
    global $LINK;
    session_start();
    $handle = $LINK->prepare('delete from link where user_id=? and label_id=?');
    $handle->bindValue(1, $_SESSION['user_id']);
    $handle->bindValue(2, $args['label_id']);
    $handle->execute();

    $handle = $LINK->prepare('delete from label where id=?');
    $handle->bindValue(1, $args['label_id']);
    $handle->execute();
}

/**
 * Store the JSON with the user's progress in the database.
 * @param {Object} $args
 */
function storeProgressData($args){
    global $LINK;
    session_start();
    $handle = $LINK->prepare('update label set progress_data=? where id=?');
    $handle->bindValue(1, $args['progressJson']);
    $handle->bindValue(2, $_SESSION['label_id']);
    $handle->execute();
}
