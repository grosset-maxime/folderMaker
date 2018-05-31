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

    var DEFAULT_NB_FOLDERS = 6,
        DEFAULT_NB_FILES_PER_FOLDER = 50,
        MIN_NB_FILES_PER_FOLDER = 1,
        MIN_NB_FOLDERS = 1,
        NOTIFY_TYPE_ERROR = Notify.TYPE_ERROR,
        NOTIFY_TYPE_INFO = Notify.TYPE_INFO,
        NOTIFY_TYPE_WARNING = Notify.TYPE_WARNING,
        _defaultOptions = {
            root: null
        },
        _options = {},
        _els = {},
        _notify,
        _hasFocus = false,
        _isBuilt = false,
        _imageTypes = ['jpg', 'jpeg', 'gif', 'png', 'bmp'],
        _videoTypes = ['webm', 'mp4', 'mkv'],
        _types = _imageTypes.concat(_videoTypes);


    function _dispNotify (options) {
        options = options || {};

        if (!_notify) {
            _notify = new Notify({
                className: 'optionsView_notify',
                container: $(document.body),
                autoHide: options.autoHide !== false,
                duration: options.duration || 3
            });
        }

        _notify.setMessage(
            options.message || '',
            options.type || NOTIFY_TYPE_ERROR,
            true
        );
    }


    function _start () {

        var folder = _els.inputCustomFolder.val();

        if (!$.trim(folder)) {
            _dispNotify({
                message: 'Folder path is empty.',
                type: NOTIFY_TYPE_WARNING,
                autoHide: true
            });
            return;
        }

        if (_isChecked(_els.radioExtractFiles)) {
            _extractFiles({ folder: folder });
        } else {
            _createFolders({ folder: folder });
        }
    }

    function _checkInput (input, check) {
        check = check !== false;
        input.prop('checked', check);
    }

    function _toggleImageTypesCheckbox () {
        var check = _els.checkImagesCategory.prop('checked');

        _els.typesList.find('input').each(function (index, input) {
            input = $(input);
            if (_imageTypes.indexOf(input.val()) >= 0) {
                _checkInput(input, check);
            }
        });
    }

    function _toggleVideoTypesCheckbox () {
        var check = _els.checkVideosCategory.prop('checked');

        _els.typesList.find('input').each(function (index, input) {
            input = $(input);
            if (_videoTypes.indexOf(input.val()) >= 0) {
                _checkInput(input, check);
            }
        });
    }

    function _buildSkeleton () {
        var mainCtn, customFolderCtn, radioNbFilesPerFolder, radioNbFolders,
            footerCtn, btnStart, inputNbFilesPerFolder, inputCustomFolder,
            nbFilesPerFolderCtn, nbFoldersCtn, extractFilesCtn, radioExtractFiles,
            inputNbFolders, removeEmptyFoldersCheckbox, checkImagesCategory, checkVideosCategory,
            checkCustomizeCategory, fileCategoriesCtn;

        /**
         * @private
         */
        function keyUpInput (e) {
            var keyPressed = e.which,
                doPreventDefault = false;
            // PM.log(keyPressed);
            switch (keyPressed) {
            case 13: // Enter
                doPreventDefault = true;
                break;
            }

            if (doPreventDefault) {
                e.preventDefault();
            }
        }

        /**
         * @private
         */
        function checkInteger (e) {
            var keyPressed = e.which;

            // PM.log(keyPressed);

            // Prevent if key is not
            if (
                keyPressed !== 8     // backspace.
                && keyPressed !== 9  // tab.
                && keyPressed !== 13 // enter.
                && (keyPressed < 48 || keyPressed > 57) // a number.
            ) {
                e.preventDefault();
            }
        }

        function separator () {
            return $('<div>', { 'class': 'separator' });
        }

        // =================================
        // Start of function buildSkeleton()
        // =================================

        mainCtn = _els.mainCtn = $('<div>', {
            'class': 'window fm_options_view flex',
            html: $('<div>', {
                'class': 'title_view',
                'text': 'Options'
            }),
            on: {
                click: function (e) {
                    inputCustomFolder.focus();
                    e.stopPropagation();
                }
            }
        });

        footerCtn = _els.footerCtn = $('<div>', {
            'class': 'footer_ctn flex'
        });

        inputCustomFolder = _els.inputCustomFolder = $('<input>', {
            id: 'pathFolderOpts',
            'class': 'input_folder',
            placeholder: 'Enter your path folder.',
            type: 'text',
            on: {
                keyup: function (e) {
                    var keyPressed = e.which,
                        doPreventDefault = false;

                    // PM.log(keyPressed);

                    switch (keyPressed) {
                    case 27: // ESC
                        doPreventDefault = true;
                        _els.inputCustomFolder.val('');
                        break;
                    }

                    if (doPreventDefault) {
                        e.preventDefault();
                    }
                }
            }
        });

        customFolderCtn = $('<div>', {
            'class': 'el_ctn flex first last',
            on: {
                click: function () {
                    _checkInput(_els.inputCustomFolder);
                }
            }
        }).append(
            $('<label>', {
                'class': 'title label',
                text: 'Folder :',
                for: 'pathFolderOpts'
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
            maxlength: 4,
            numberFormat: 'n',
            on: {
                focus: function () {
                    _hasFocus = true;
                    _checkInput(radioNbFilesPerFolder);
                },
                blur: function () {
                    _hasFocus = false;
                },
                keyup: keyUpInput,
                keydown: checkInteger,
                click: function (e) {
                    e.stopPropagation();
                }
            }
        });

        // Ctn nb files per folder.
        nbFilesPerFolderCtn = $('<div>', {
            'class': 'el_ctn first selectable',
            on: {
                click: function () {
                    _checkInput(radioNbFilesPerFolder);
                }
            }
        }).append(
            radioNbFilesPerFolder,
            $('<label>', {
                'class': 'title label',
                text: 'Nb files / folder :',
                for: 'nbFilesPerFolderOpts',
                on: {
                    click: function () {
                        _checkInput(radioNbFilesPerFolder);
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
            maxlength: 3,
            numberFormat: 'n',
            on: {
                focus: function () {
                    _hasFocus = true;
                    _checkInput(radioNbFolders);
                },
                blur: function () {
                    _hasFocus = false;
                },
                keyup: keyUpInput,
                keydown: checkInteger,
                click: function (e) {
                    e.stopPropagation();
                }
            }
        });

        // Ctn nb folders.
        nbFoldersCtn = $('<div>', {
            'class': 'el_ctn selectable',
            on: {
                click: function () {
                    _checkInput(radioNbFolders);
                }
            }
        }).append(
            radioNbFolders,
            $('<label>', {
                'class': 'title label',
                text: 'Nb folders :',
                for: 'nbFoldersOpts',
                on: {
                    click: function () {
                        _checkInput(radioNbFolders);
                    }
                }
            }),
            inputNbFolders
        );

        fileCategoriesCtn = $('<div>', {
            'class': 'el_ctn filter_by_categories last',
        }).append(
            checkImagesCategory = _els.checkImagesCategory = $('<input>', {
                id: 'imagesCategoryRadio',
                'class': 'input_check input_check_categories',
                type: 'checkbox',
                on: {
                    click: _toggleImageTypesCheckbox
                }
            }),
            $('<label>', {
                'class': 'title label',
                text: 'Images',
                on: {
                    click: function () {
                        _checkInput(
                            checkImagesCategory,
                            !checkImagesCategory.prop('checked')
                        );
                        _toggleImageTypesCheckbox();
                    }
                }
            }),
            checkVideosCategory = _els.checkVideosCategory = $('<input>', {
                id: 'videosCategoryRadio',
                'class': 'input_check input_check_categories',
                type: 'checkbox',
                on: {
                    click: _toggleVideoTypesCheckbox
                }
            }),
            $('<label>', {
                'class': 'title label',
                text: 'Videos',
                on: {
                    click: function () {
                        _checkInput(
                            checkVideosCategory,
                            !checkVideosCategory.prop('checked')
                        );
                        _toggleVideoTypesCheckbox();
                    }
                }
            }),
            checkCustomizeCategory = _els.checkCustomizeCategory = $('<input>', {
                id: 'customizeCategoryRadio',
                'class': 'input_check input_check_categories',
                type: 'checkbox',
                on: {
                    click: function () {
                        _els.typesList.toggle();
                    }
                }
            }),
            $('<label>', {
                'class': 'title label',
                text: 'Customize',
                on: {
                    click: function () {
                        _checkInput(
                            checkCustomizeCategory,
                            !checkCustomizeCategory.prop('checked')
                        );
                        _els.typesList.toggle();
                    }
                }
            }),
            _els.typesList = $('<div>', {
                'class': 'types_list',
                html: _buildCustomsTypes()
            })
        );

        // Radio extract files.
        radioExtractFiles = _els.radioExtractFiles = $('<input>', {
            id: 'extractFilesRadio',
            name: 'makerOpts',
            'class': 'input_radio input_radio_extractFiles',
            type: 'radio'
        });

        removeEmptyFoldersCheckbox = _els.removeEmptyFoldersCheckbox = $('<input>', {
            'class': 'input_check_removeEmptyFloder',
            type: 'checkbox',
            checked: true
        });

        extractFilesCtn = $('<div>', {
            'class': 'el_ctn first last selectable',
            on: {
                click: function () {
                    _checkInput(_els.radioExtractFiles);
                }
            }
        }).append(
            radioExtractFiles,
            $('<label>', {
                'class': 'title label',
                text: 'Extract files to folder',
                for: 'extractFilesRadio',
                on: {
                    click: function () {
                        _checkInput(radioExtractFiles);
                    }
                }
            }),
            removeEmptyFoldersCheckbox,
            $('<label>', {
                'class': 'title label',
                text: 'Remove empty sub folders',
                on: {
                    click: function () {
                        _checkInput(
                            removeEmptyFoldersCheckbox,
                            !removeEmptyFoldersCheckbox.prop('checked')
                        );
                        _checkInput(radioExtractFiles);
                    }
                }
            })
        );

        footerCtn.append(
            btnStart
        );

        mainCtn.append(
            customFolderCtn,
            separator(),
            nbFilesPerFolderCtn,
            nbFoldersCtn,
            fileCategoriesCtn,
            separator(),
            extractFilesCtn,
            separator(),
            footerCtn
        );

        _options.root.append(mainCtn);

        inputNbFilesPerFolder.spinner({
            min: MIN_NB_FILES_PER_FOLDER,
            max: 9999
        });

        inputNbFolders.spinner({
            min: MIN_NB_FOLDERS,
            max: 999
        });

        inputCustomFolder.focus();
    }

    function _isChecked (input) {
        return input.is(':checked');
    }

    function _onStart () {
        _els.btnStart.button('disable');
        $(document.body).addClass('show_loading');
    }

    function _onEnd () {
        _els.inputCustomFolder.focus();
        _els.btnStart.button('enable');
        $(document.body).removeClass('show_loading');
    }

    function _onFailure (error) {
        var unknownErrorMessage = 'Unknown error.';

        _dispNotify({
            message: error.publicMessage || unknownErrorMessage,
            type: error.severity || Notify.TYPE_ERROR,
            autoHide: false
        });
    }

    function _onSuccess (message) {
        _dispNotify({
            message: message,
            type: NOTIFY_TYPE_INFO,
            autoHide: true
        });
    }

    function _extractFiles (options) {
        options = options || {};

        FolderMakerAction.extractFiles({
            folder: options.folder,
            removeEmptyFolders: _isChecked(_els.removeEmptyFoldersCheckbox),
            success: function () {
                _onSuccess('File extraction success.');
            },
            failure: _onFailure,
            events: {
                onStart: _onStart,
                onEnd: _onEnd
            }
        });
    }

    function _createFolders (options) {
        options = options || {};

        var nbFilesPerFolder = 0,
            nbFolders = 0,
            inputNbFilesPerFolder = _els.inputNbFilesPerFolder,
            inputNbFolders = _els.inputNbFolders,
            types = [];

        if (_isChecked(_els.radioNbFilesPerFolder)) {

            nbFilesPerFolder = Math.max(MIN_NB_FILES_PER_FOLDER, inputNbFilesPerFolder.val());
            inputNbFilesPerFolder.val(nbFilesPerFolder);

        } else if (_isChecked(_els.radioNbFolders)) {

            nbFolders = Math.max(MIN_NB_FOLDERS, inputNbFolders.val());
            inputNbFolders.val(nbFolders);

        }

        _els.typesList.find('input').each(function (index, input) {
            input = $(input);
            if (input.prop('checked')) {
                types.push(input.val());
            }
        });

        FolderMakerAction.createFolders({
            folder: options.folder,
            nbFilesPerFolder: nbFilesPerFolder,
            nbFolders: nbFolders,
            filters: {
                types: types
            },
            success: function (json) {
                _onSuccess(
                    'Folders: ' + json.nbFolders + '<br/>'
                        + 'Files per folder: ' + json.nbFilesPerFolder
                );

            },
            failure: _onFailure,
            events: {
                onStart: _onStart,
                onEnd: _onEnd
            }
        });
    }

    function _buildCustomsTypes () {
        var typesEls = [];

        _types.forEach(function (type) {
            var typeEl = $('<input>', {
                'class': 'input_check input_check_type',
                value: type,
                type: 'checkbox'
            });
            var labelEl = $('<label>', {
                'class': 'title label',
                text: type,
                on: {
                    click: function () {
                        _checkInput(
                            typeEl,
                            !typeEl.prop('checked')
                        );
                    }
                }
            });

            typesEls.push(typeEl, labelEl);
        });

        return typesEls;
    }

    var View = {

        init: function (opts) {
            $.extend(true, _options, _defaultOptions, opts || {});

            if (!_options.root) {
                _options.root = $(document.body);
            }

            _buildSkeleton();

            _isBuilt = true;
        },

        hasFocus: function () {
            return _hasFocus;
        },

        setFocusCustomFolder: function () {
            if (_isBuilt) {
                _els.inputCustomFolder.focus();
            }
        },

        start: function () {
            _start();
        }
    };

    return View;
});
