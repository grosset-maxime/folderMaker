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
        return 10;
    }

    /**
     * Getter folder path.
     *
     * @return {String} $folder : Folder path.
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
