/* global
    define
*/

define(
[
    'jquery',

    // PM
    'PM/Core',
    'PM/Cmp/Notify',

    'App/Actions/FolderMakerAction',

    // Non AMD
    'js!jquery-ui'
],
function ($, PM, Notify, FolderMakerAction) {
    'use strict';

    var DEFAULT_NB_FOLDERS = 10,
        DEFAULT_NB_FILES_PER_FOLDER = 10,
        NOTIFY_TYPE_ERROR = Notify.TYPE_ERROR,
        NOTIFY_TYPE_INFO = Notify.TYPE_INFO,
        _defaultOptions = {
            root: null
        },
        _options = {},
        _els = {},
        _notify,
        _hasFocus = false;

    /**
     *
     */
    function _buildSkeleton () {
        var mainCtn, customFolderCtn, radioNbFilesPerFolder, radioNbFolders,
            footerCtn, btnStart, inputNbFilesPerFolder, inputCustomFolder,
            nbFilesPerFolderCtn, nbFoldersCtn,
            inputNbFolders;

        /**
         * @private
         */
        function keyUpInput (e) {
            var keyPressed = e.which,
                doPreventDefault = false;
            // console.log(keyPressed);
            switch (keyPressed) {
            case 13: // Enter
                doPreventDefault = true;
                break;
            }

            if (doPreventDefault) {
                e.preventDefault();
            }
        } // End function keyUpInput()


        // =================================
        // Start of function buildSkeleton()
        // =================================

        mainCtn = _els.mainCtn = $('<div>', {
            'class': 'window fm_options_view flex',
            html: $('<div>', {
                'class': 'title_view',
                'text': 'Options'
            })
        });

        mainCtn.css('max-height', _options.root.height() - 160);

        footerCtn = _els.footerCtn = $('<div>', {
            'class': 'footer_ctn flex'
        });

        inputCustomFolder = _els.inputCustomFolder = $('<input>', {
            'class': 'input_folder',
            placeholder: 'Enter your path folder.',
            type: 'text',
        });

        customFolderCtn = $('<div>', {
            'class': 'el_ctn flex'
        }).append(
            $('<label>', {
                'class': 'title title_custom_folder',
                text: 'Folder :'
            }),
            inputCustomFolder
        );

        // Btn start
        btnStart = _els.btnStart = $('<input>', {
            'class': 'btn start_btn',
            type: 'button',
            value: 'Start',
            on: {
                click: function () {
                    _start();
                }
            }
        }).button();

        // Radio nb files per folder.
        radioNbFilesPerFolder = _els.radioNbFilesPerFolder = $('<input>', {
            id: 'nbFilesPerFolderRadio',
            name: 'makerOpts',
            'class': 'input_radio input_radio_nbFilesPerFolder',
            type: 'radio',
            checked: true
        });

        // Input nb files per folder.
        inputNbFilesPerFolder = _els.inputNbFilesPerFolder = $('<input>', {
            id: 'nbFilesPerFolderOpts',
            'class': 'input_nbFilesPerFolder input_spinner',
            value: DEFAULT_NB_FILES_PER_FOLDER,
            maxlength: 2,
            numberFormat: 'n',
            on: {
                focus: function () {
                    _hasFocus = true;
                    radioNbFilesPerFolder.prop('checked', true);
                },
                blur: function () {
                    _hasFocus = false;
                },
                keyup: keyUpInput
            }
        });

        // Ctn nb files per folder.
        nbFilesPerFolderCtn = $('<div>', {
            'class': 'el_ctn'
        }).append(
            radioNbFilesPerFolder,
            $('<label>', {
                'class': 'title label',
                text: 'Nb files / folder :',
                for: 'nbFilesPerFolderOpts',
                on: {
                    click: function () {
                        radioNbFilesPerFolder.prop('checked', true);
                    }
                }
            }),
            inputNbFilesPerFolder
        );

        // Radio nb folders.
        radioNbFolders = _els.radioNbFolders = $('<input>', {
            id: 'nbFoldersRadio',
            name: 'makerOpts',
            'class': 'input_radio input_radio_nbFolders',
            type: 'radio'
        });

        // Spinner nb folders.
        inputNbFolders = _els.inputNbFolders = $('<input>', {
            id: 'nbFoldersOpts',
            'class': 'input_nbFolders input_spinner',
            value: DEFAULT_NB_FOLDERS,
            maxlength: 2,
            numberFormat: 'n',
            on: {
                focus: function () {
                    _hasFocus = true;
                    radioNbFolders.prop('checked', true);
                },
                blur: function () {
                    _hasFocus = false;
                },
                keyup: keyUpInput
            }
        });

        // Ctn nb folders.
        nbFoldersCtn = $('<div>', {
            'class': 'el_ctn'
        }).append(
            radioNbFolders,
            $('<label>', {
                'class': 'title label',
                text: 'Nb folders :',
                for: 'nbFoldersOpts',
                on: {
                    click: function () {
                        radioNbFolders.prop('checked', true);
                    }
                }
            }),
            inputNbFolders
        );

        footerCtn.append(
            btnStart
        );

        mainCtn.append(
            customFolderCtn,
            nbFilesPerFolderCtn,
            nbFoldersCtn,
            footerCtn
        );

        _options.root.append(mainCtn);

        inputNbFilesPerFolder.spinner({
            min: 2,
            max: 99
        });

        inputNbFolders.spinner({
            min: 2,
            max: 99
        });
    } // End function _buildSkeleton()

    /**
     *
     */
    function _start () {
        var nbFilesPerFolder = 0,
            nbFolders = 0,
            folder = _els.inputCustomFolder.val();

        if (!$.trim(folder)) {
            // Display notif.
            return;
        }

        if (_els.radioNbFilesPerFolder.is(':checked')) {
            nbFilesPerFolder = _els.inputNbFilesPerFolder.val();
        } else {
            nbFolders = _els.inputNbFolders.val();
        }

        FolderMakerAction.start({
            folder: folder,
            nbFilesPerFolder: nbFilesPerFolder,
            nbFolders: nbFolders,
            success: function (json) {
                _dispNotify({
                    message: 'Folders: ' + json.nbFolders + '<br/>' +
                        'Files per folder: ' + json.nbFilesPerFolder,
                    type: NOTIFY_TYPE_INFO,
                    autoHide: true
                });
            },
            failure: function (error) {
                var unknownErrorMessage = 'Unknown error.';

                _dispNotify(
                    error.publicMessage || unknownErrorMessage,
                    error.severity || Notify.TYPE_ERROR
                );
            },
            events: {
                onEnd: function () {
                    _els.inputCustomFolder.val('');
                }
            }
        });
    } // End function _start()

    /**
     *
     */
    function _dispNotify (options) {
        options = options || {};

        if (!_notify) {
            _notify = new Notify({
                className: 'optionsView_notify',
                container: $(document.body),
                autoHide: !!options.autoHide,
                duration: options.duration || 3
            });
        }

        _notify.setMessage(
            options.message || '',
            options.type || NOTIFY_TYPE_ERROR,
            true
        );
    } // End function _dispNotify()


    var View = {
        /**
         *
         */
        init: function (opts) {
            $.extend(true, _options, _defaultOptions, opts || {});

            if (!_options.root) {
                _options.root = $(document.body);
            }

            _buildSkeleton();
        }, // End function init()

        /**
         *
         */
        hasFocus: function () {
            return _hasFocus;
        }, // End function hasFocus()

        /**
         *
         */
        start: function () {
            _start();
        }, // End function start()


    };

    return View;
});
