<?php
/**
 * Description :
 * Return : JSON
 *
 * PHP version 5
 *
 * @category Script_-_Json
 * @package  No
 * @author   Maxime GROSSET <contact@mail.com>
 * @license  tag in file comment
 * @link     No
 */

/*global
    ROOT_DIR,
*/

require_once ROOT_DIR . '/api/vendors/PM/class/ExceptionExtended.class.php';

require_once ROOT_DIR . '/api/class/FolderMaker/ExtractFiles.class.php';


// PM
use PM\ExceptionExtended;

// FolderMaker
use FolderMaker\ExtractFiles;


// Init vars.
$folder;
$removeEmptyFolders;
$logError;
$jsonResult;
$result;
$ExtractFiles; // Instance of ExtractFiles class.


$folder = !empty($_POST['folder']) ? $_POST['folder'] : '';
$removeEmptyFolders = !empty($_POST['removeEmptyFolders']) && $_POST['removeEmptyFolders'] === 'true' ? true : false;

$logError = array(
    'mandatory_fields' => array(
        'folder' => '= ' . $folder
    ),
    'optional_fields' => array(
        'removeEmptyFolders' => '= ' . ($removeEmptyFolders ? 'true' : 'false')
    ),
);

$jsonResult = array(
    'success' => false
);

try {

    $ExtractFiles = new ExtractFiles(
        array(
            'folder' => $folder,
            'removeEmptyFolders' => $removeEmptyFolders
        )
    );

    $ExtractFiles->start();

} catch (ExceptionExtended $e) {
    $jsonResult['error'] = $logError;
    $jsonResult['error']['message'] = $e->getMessage();
    $jsonResult['error']['publicMessage'] = $e->getPublicMessage();
    $jsonResult['error']['severity'] = $e->getSeverity();
    print json_encode($jsonResult);
    die;
} catch (Exception $e) {
    $jsonResult['error'] = $logError;
    $jsonResult['error']['message'] = $e->getMessage();
    $jsonResult['error']['publicMessage'] = 'Unexpected error.';
    $jsonResult['error']['severity'] = ExceptionExtended::SEVERITY_ERROR;
    print json_encode($jsonResult);
    die;
}

$jsonResult['success'] = true;
print json_encode($jsonResult);
exit;
