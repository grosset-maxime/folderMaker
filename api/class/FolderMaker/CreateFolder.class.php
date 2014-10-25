<?php
/**
 * Create Folder engine.
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

require_once dirname(__FILE__) . '/../Root.class.php';
require_once dirname(__FILE__) . '/../ExceptionExtended.class.php';


// PHP
use \DirectoryIterator;
use \Exception;

// DS
use DS\Root;
use DS\ExceptionExtended;


/**
 * Class CreateFolder.
 *
 * @category Class
 * @package  No
 * @author   Maxime GROSSET <contact@mail.com>
 * @license  tag in file comment
 * @link     No
 */
class CreateFolder extends Root
{
    protected $WIN_SEP = '\\';
    protected $UNIX_SEP = '/';

    protected $folder = '';          // (Mandatory) Folder path.
    protected $nbFilesPerFolder = 0; // (optional) Nb files per folder.
    protected $nbFolders = 0;        // (Optional) Nb folders.

    protected $files = array();


    /**
     * CreateFolder constructor.
     *
     * @param {array} $data : CreateFolder data.
     * * param {String[]} data.customFolders : List of custom folder.
     */
    public function __construct(array $data = array())
    {
        parent::__construct($data);
    }

    /**
     * replaceWinSlaches
     *
     * @param {String} $s : String to replace antislashes by slashes.
     *
     * @return {String} String with win antislashes replaced by slashes.
     */
    protected function replaceWinSlaches($s)
    {
        return str_replace($this->WIN_SEP, $this->UNIX_SEP, $s);
    }

    /**
     * Normalize the folder path.
     *
     * @param {String} $folder : Folder path.
     *
     * @return {String} Normalized folder path.
     */
    protected function normalizeFolder($folder = '')
    {
        // Init vars.
        $UNIX_SEP = $this->UNIX_SEP;
        $errorMessage = '';
        $lenghtFolder = 0;
        $firstCharCustomFolder = '';

        $folder = trim($folder);
        $folder = $this->replaceWinSlaches($folder);
        $lenghtFolder = strlen($folder);

        if ($folder === $UNIX_SEP) {
            $errorMessage = 'Provided folder: "' . $UNIX_SEP . '" is not a valid folder.';
            throw new ExceptionExtended(
                array(
                    'publicMessage' => $errorMessage,
                    'message' => $errorMessage,
                    'severity' => ExceptionExtended::SEVERITY_ERROR
                )
            );
        }

        // Manage '/' for the end of the folder.
        if ($lenghtFolder) {
            // End of folder
            if ($folder[$lenghtFolder - 1] !== $UNIX_SEP) {
                $folder .= $UNIX_SEP;
            }
        }

        return $folder;
    } // End function normalizeFolder()

    /**
     * Start creating folders.
     *
     * @return {Integer} $folder : Nb created folders.
     */
    public function start()
    {
        // Init vars.
        $folder = $this->getFolder();
        $files = $this->getFiles($folder);
        $nbFiles = count($files);
        $nbFolders = 0;
        $nbFilesPerFolder = 0;
        $folders;


        if ($this->nbFolders) {

            $nbFolders = $this->nbFolders;
            $nbFilesPerFolder = ceil($nbFiles / $nbFolders);

        } else if ($this->nbFilesPerFolder) {

            $nbFilesPerFolder = $this->nbFilesPerFolder;
            $nbFolders = ceil($nbFiles / $nbFilesPerFolder);

        }

        // Create folders.
        $folders = $this->createFolders($nbFolders);

        // Move files into folders.
        $this->moveFilesToFolders($files, $folders, $nbFilesPerFolder);

        return array(
            'nbFolders' => $nbFolders,
            'nbFilesPerFolder' => $nbFilesPerFolder
        );
    }

    /**
     * Move files into folders.
     *
     * @param {File[]}   $files            : Files list to move into folder.
     * @param {String[]} $folders          : Folders list where to move files.
     * @param {Integer}  $nbFilesPerFolder : Nb files to move per folder.
     *
     * @return null
     */
    protected function moveFilesToFolders($files = array(), $folders = array(), $nbFilesPerFolder = 0)
    {
        // Init vars
        $i; $u; $a;
        $file;
        $nbFiles = count($files);
        $nbFolders = count($files);
        $result;
        $errorMessage;
        $oldPathFileName;
        $newPathFileName;

        for ($i = 0, $u = 0, $a = 1; $i < $nbFiles; $i++, $a++) {
            set_time_limit(30);

            $file = $files[$i];
            $folder = $folders[$u];

            $oldPathFileName = $file['pathName'];
            $newPathFileName = $file['path'] . '/' . $folder . '/' . $file['fileName'];

            $result = rename($oldPathFileName, $newPathFileName);

            if (!$result) {
                $errorMessage = 'Error when trying to move file: "' . $oldPathFileName . '" to "' . $newPathFileName . '".';
                throw new ExceptionExtended(
                    array(
                        'publicMessage' => $errorMessage,
                        'message' => $errorMessage,
                        'severity' => ExceptionExtended::SEVERITY_ERROR
                    )
                );
            }

            if ($a >= $nbFilesPerFolder) {
                $a = 0;
                $u++; // Select the next folder
            }
        }
    }

    /**
     * Create folders into destination folder.
     *
     * @param {Integer} $nbFolders : Nb folders to create.
     *
     * @return {String[]} Created folders name.
     */
    protected function createFolders($nbFolders = 0)
    {
        // Init vars
        $i;
        $folder = $this->getFolder();
        $indiceFolder = 1;
        $folderName = '';
        $folders = array();
        $folderPathName;
        $errorMessage;


        for ($i = 0; $i < $nbFolders; $i++, $indiceFolder++) {
            set_time_limit(30);

            $folderName = 'new folder ' . $indiceFolder;

            try {

                $folderPathName = $folder . '/' . $folderName;

                if (!file_exists($folderPathName) && mkdir($folderPathName)) {
                    $folders[] = $folderName;
                } else {
                    $i--;
                }

            } catch (Exception $e) {
                $errorMessage = 'Error when trying to create folder: "' . $folderPathName . '".';
                throw new ExceptionExtended(
                    array(
                        'publicMessage' => $errorMessage,
                        'message' => $e->getMessage() ? $e->getMessage : $errorMessage,
                        'severity' => ExceptionExtended::SEVERITY_ERROR
                    )
                );
            }
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

            if ($file->isDot()
                || preg_match('/^[\.].*/i', $fileName)
                || preg_match('/^(thumb)(s)?[\.](db)$/i', $fileName)
            ) {
                continue;
            }

            $isDir = $file->isDir();

            if ($isDir || !preg_match('/(.jpeg|.jpg|.gif|.png|.bmp)$/i', $fileName)) {
                continue;
            }

            $files[] = array(
                'fileName' => $file->getFilename(),
                'pathName' => $file->getPathname(),
                'path' => $file->getPath()
            );
        }

        return $files;
    }

    /**
     * Getter Nb files per folder.
     *
     * @return {Integer} Nb files per folder.
     */
    public function getNbFilesPerFolder()
    {
        return $this->nbFilesPerFolder;
    }

    /**
     * Setter Nb files per folder.
     *
     * @param {Integer} $nbFilesPerFolder : Nb files per folder.
     *
     * @return null
     */
    public function setNbFilesPerFolder($nbFilesPerFolder = 0)
    {
        $this->nbFilesPerFolder = $nbFilesPerFolder;
    }

    /**
     * Getter Nb folders.
     *
     * @return {Integer} .
     */
    public function getNbFolders()
    {
        return $this->nbFolders;
    }

    /**
     * Setter Nb folders.
     *
     * @param {Integer} $nbFolders : Nb folders.
     *
     * @return null
     */
    public function setNbFolders($nbFolders = 0)
    {
        $this->nbFolders = $nbFolders;
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

        $folder = $this->normalizeFolder($folder);

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
    } // End function setFolder()

} // End Class CreateFolder
