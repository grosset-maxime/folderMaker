<?php
/**
 * Extract files engine.
 *
 * PHP version 5
 *
 * @category Class
 * @package  No
 * @author   Maxime GROSSET <contact@mail.com>
 * @license  tag in file comment
 * @link     No
 */

/* global
*/

namespace FolderMaker;

require_once dirname(__FILE__) . '/../../globals.php';

require_once dirname(__FILE__) . '/../../vendors/PM/class/Root.class.php';
require_once dirname(__FILE__) . '/../../vendors/PM/class/ExceptionExtended.class.php';

// Utils
require_once dirname(__FILE__) . '/../Utils/Utils.class.php';


// PHP
use \DirectoryIterator;
use \Exception;

// DS
use PM\Root;
use PM\ExceptionExtended;

// Utils
use Utils\Utils;


/**
 * Class ExtractFiles.
 *
 * @category Class
 * @package  No
 * @author   Maxime GROSSET <contact@mail.com>
 * @license  tag in file comment
 * @link     No
 */
class ExtractFiles extends Root
{
    protected $Utils = null;

    protected $folder = '';                // (Mandatory) Folder path.
    protected $removeEmptyFolders = false; // (optional) Should remove empty folder.


    /**
     * ExtractFiles constructor.
     *
     * @param {array} $data : ExtractFiles data.
     * * param {String} data.folder : Folder to extract files.
     * * param {Boolean} data.removeEmptyFolders : Should remove empty folders.
     */
    public function __construct(array $data = array())
    {
        $this->Utils = new Utils();

        parent::__construct($data);
    }

    /**
     * Start extracting files.
     */
    public function start()
    {
        // Init vars.
        $i;
        $folder = $this->getFolder();
        $folders = $this->getFolders($folder);
        $nbFolders = count($folders);

        if (!$folder || $nbFolders === 0) {
            $errorMessage = 'No folder found in the folder "' . $folder . '".';
            throw new ExceptionExtended(
                array(
                    'publicMessage' => $errorMessage,
                    'message' => $errorMessage,
                    'severity' => ExceptionExtended::SEVERITY_INFO
                )
            );
        }

        // Extract files.
        for ($i = 0; $i < $nbFolders; $i++) {
            $this->moveFilesToFolder($folders[$i]);
        }
    }

    /**
     * Move folder files to parent folder.
     *
     * @param {Folder} $folder : Folder path name.
     *
     * @return null
     */
    protected function moveFilesToFolder($folder = '')
    {
        // Init vars
        $i; $a; $file; $fileName; $filePathName;
        $newFileName; $newPathFileName; $result;
        $errorMessage;

        $files = $this->getFiles($folder);
        $nbFiles = count($files);

        $folders = $this->getFolders($folder);
        $nbFolders = count($folders);

        // If current folder is empty, delete it and exit the function.
        if ($nbFiles === 0 && $nbFolders === 0) {
            if ($this->getRemoveEmptyFolders()) {
                $this->deleteFolder($folder);
            }
            return;
        }

        // Move files in current folder.
        for ($i = 0; $i < $nbFiles; $i++) {
            set_time_limit(30);

            $a = 1;
            $file = $files[$i];
            $fileName = $file['fileName'];
            $filePathName = $file['pathName'];
            $fileExtension = $file['extension'];

            $newFileName = $fileName;
            $newFilePathName = $this->getFolder() . $newFileName;

            while (file_exists($newFilePathName)) {
                $newFileName = substr($fileName, 0, -1 - strlen($fileExtension)) . ' (' . $a++ . ')'
                    . '.' . $fileExtension;
                $newFilePathName = $this->getFolder() . $newFileName;
            }

            $result = rename($filePathName, $newFilePathName);

            if (!$result) {
                $errorMessage = 'Error when trying to move file: "' . $filePathName . '" to "' . $newFilePathName . '".';
                throw new ExceptionExtended(
                    array(
                        'publicMessage' => $errorMessage,
                        'message' => $errorMessage,
                        'severity' => ExceptionExtended::SEVERITY_ERROR
                    )
                );
            }
        }

        // Move files in sub folders.
        for ($i = 0; $i < $nbFolders; $i++) {
            $this->moveFilesToFolder($folders[$i]);
        }

        if ($this->getRemoveEmptyFolders()) {
            // Do this to delete the current empty folder.
            $this->moveFilesToFolder($folder);
        }
    }

    /**
     * Get folders list.
     *
     * @param {String} $folder : Folder where to get folders list.
     *
     * @return {String[]} Folders list into the folder.
     */
    protected function getFolders($folder = '')
    {
        // Init vars
        $folders = array();
        $dir;
        $element;

        try {
            $dir = new DirectoryIterator($folder);
        } catch (Exception $e) {
            throw new ExceptionExtended(
                array(
                    'publicMessage' => 'Folder "' . $folder . '" is not accessible.',
                    'message' => $e->getMessage(),
                    'severity' => ExceptionExtended::SEVERITY_ERROR
                )
            );
        }

        foreach ($dir as $element) {
            set_time_limit(30);

            if (!$element->isDir()
                || $element->isDot()
                || $element->getFilename() === '@eaDir' // Synology DSM folder.
            ) {
                continue;
            }

            $folders[] = $element->getPathname();
        }

        return $folders;
    }

    /**
     * Get files list.
     *
     * @param {String} $folder : Folder where to get files list.
     *
     * @return {File[]} Files list into the folder.
     */
    protected function getFiles($folder = '')
    {
        // Init vars
        $files = array();
        $dir;
        $file;

        try {
            $dir = new DirectoryIterator($folder);
        } catch (Exception $e) {
            throw new ExceptionExtended(
                array(
                    'publicMessage' => 'Folder "' . $folder . '" is not accessible.',
                    'message' => $e->getMessage(),
                    'severity' => ExceptionExtended::SEVERITY_ERROR
                )
            );
        }

        foreach ($dir as $file) {
            set_time_limit(30);

            $fileName = $file->getFilename();

            if ($file->isDir()
                || $file->isDot()
                || preg_match('/^[\.].*/i', $fileName)
                || preg_match('/^(thumb)(s)?[\.](db)$/i', $fileName)
            ) {
                continue;
            }

            $files[] = array(
                'fileName' => $fileName,
                'pathName' => $file->getPathname(),
                'extension' => $file->getExtension()
            );
        }

        return $files;
    }

    /**
     * Delete a folder recursively (remove all files and folders).
     *
     * @param {String} $path : Path folder to remove (remove all files and folders).
     *
     * @return null.
     */
    protected function rrmdir($path)
    {
        $dir = opendir($path);

        while (false !== ($file = readdir($dir))) {
            if ($file !== '.' && $file !== '..') {
                $full = $path . '/' . $file;

                if (is_dir($full)) { $this->rrmdir($full); }
                else { unlink($full); }
            }
        }

        closedir($dir);
        rmdir($path);
    }

    /**
     * Delete a folder.
     *
     * @param {String} $path : Folder path to remove.
     *
     * @return {Object}.
     */
    protected function deleteFolder($path = '') {

        if (!file_exists($path)) {
            throw new ExceptionExtended(
                array(
                    'publicMessage' => 'Folder doesn\'t exist: ' . $path,
                    'message' => 'Folder doesn\'t exist: ' . $path,
                    'severity' => ExceptionExtended::SEVERITY_ERROR
                )
            );
        }

        try {

            $this->rrmdir($path);

        } catch (Exception $e) {
            throw new ExceptionExtended(
                array(
                    'publicMessage' => 'Fail to delete folder: ' . $path,
                    'message' => $e->getMessage(),
                    'severity' => ExceptionExtended::SEVERITY_ERROR
                )
            );
        }
    }

    /**
     * Getter Option remove empty folder.
     *
     * @return {Boolean} Should remove empty folders.
     */
    public function getRemoveEmptyFolders()
    {
        return $this->removeEmptyFolders;
    }

    /**
     * Setter Option remove empty folders.
     *
     * @param {Boolean} $removeEmptyFolders : Should remove empty folders.
     *
     * @return null
     */
    public function setRemoveEmptyFolders($removeEmptyFolders = false)
    {
        $this->removeEmptyFolders = $removeEmptyFolders;
    }

    /**
     * Getter folder path.
     *
     * @return {String} Folder path.
     */
    public function getFolder()
    {
        return $this->folder;
    }

    /**
     * Setter folder path.
     *
     * @param {String} $folder : Folder path.
     *
     * @return null
     */
    public function setFolder($folder = '')
    {
        // Init vars.
        $errorMessage = '';

        $folder = trim($folder);

        if ($folder === Utils::UNIX_SEP) {
            $errorMessage = 'Provided folder: "' . Utils::UNIX_SEP . '" is not a valid folder.';
            throw new ExceptionExtended(
                array(
                    'publicMessage' => $errorMessage,
                    'message' => $errorMessage,
                    'severity' => ExceptionExtended::SEVERITY_ERROR
                )
            );
        }

        $folder = $this->Utils->normalizePath($folder);

        try {
            if (!file_exists($folder)) {
                throw new Exception();
            }

            new DirectoryIterator($folder);

            $this->folder = $folder;

        } catch (Exception $e) {
            $errorMessage = 'Provided folder: "' . $folder . '" doesn\'t exist.';
            throw new ExceptionExtended(
                array(
                    'publicMessage' => $errorMessage,
                    'message' => $e->getMessage() ? $e->getMessage : $errorMessage,
                    'severity' => ExceptionExtended::SEVERITY_ERROR
                )
            );
        }
    }

}
