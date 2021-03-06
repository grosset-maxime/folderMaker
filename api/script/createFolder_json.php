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

require_once ROOT_DIR . '/api/class/FolderMaker/CreateFolder.class.php';
require_once ROOT_DIR . '/api/vendors/PM/class/ExceptionExtended.class.php';

// PM
use PM\ExceptionExtended;

// FolderMaker
use FolderMaker\CreateFolder;


// Init vars.
$folder;
$nbFilesPerFolder;
$nbFolders;
$logError;
$jsonResult;
$result;
$CreateFolder;  // Instance of CreateFolder class.
$typesToKeep;   // Types file filter. ('.jpg', '.png', '.mp4', ...)


$folder = !empty($_POST['folder']) ? $_POST['folder'] : '';
$nbFilesPerFolder = !empty($_POST['nbFilesPerFolder']) ? $_POST['nbFilesPerFolder'] : 0;
$nbFolders = !empty($_POST['nbFolders']) ? $_POST['nbFolders'] : 0;
$typesToKeep = !empty($_POST['types']) ? $_POST['types'] : array();

$logError = array(
    'mandatory_fields' => array(
        'folder' => '= ' . $folder
    ),
    'optional_fields' => array(
        'nbFilesPerFolder' => '= ' . $nbFilesPerFolder,
        'nbFolders' => '= ' . $nbFolders,
        'typesToKeep' => '= ' . print_r($typesToKeep, true)
    ),
);

$jsonResult = array(
    'success' => false,
    'nbCreatedFolders' => 0
);


try {

    $CreateFolder = new CreateFolder(
        array(
            'folder' => $folder,
            'nbFilesPerFolder' => $nbFilesPerFolder,
            'nbFolders' => $nbFolders,
            'typesToKeep' => $typesToKeep
        )
    );

    $result = $CreateFolder->start();
    $jsonResult['nbFolders'] = $result['nbFolders'];
    $jsonResult['nbFilesPerFolder'] = $result['nbFilesPerFolder'];

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
