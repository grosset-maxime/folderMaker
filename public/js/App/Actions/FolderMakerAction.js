/* global
    define
*/

define(
[
    'jquery',

    // PM
    'PM/Core',
    'PM/Cmp/Notify',
],
function ($, PM, Notify) {
    'use strict';

    var NOTIFY_TYPE_ERROR = Notify.TYPE_ERROR;

    var _errorNotify,
        _isDisabled = false;

    /**
     *
     */
    function _createFolders (opts) {
        var xhr, events, onStart, onEnd,
            defaultOptions = {
                folder: '',
                nbFolders: '',
                nbFilesPerFolder: '',
                events: {
                    onStart: null,
                    onEnd: null
                }
            };

        /**
         * @private
         */
        function displayErrorNotify (message, type) {
            if (!_errorNotify) {
                _errorNotify = new Notify({
                    className: 'getRandomPicAction_notify',
                    container: $(document.body),
                    autoHide: true,
                    duration: 3
                });
            }

            _errorNotify.setMessage(message, type, true);
        } // End function displayErrorNotify()


        // =================================
        // Start of function createFolders()
        // =================================

        opts = $.extend(true, {}, defaultOptions, opts || {});

        events = opts.events;
        onStart = events.onStart;
        onEnd = events.onEnd;

        if ($.isFunction(onStart)) {
            onStart();
        }

        xhr = $.ajax({
            url: '/?r=createFolder_s',
            type: 'POST',
            dataType: 'json',
            async: true,
            data: {
                folder: opts.folder,
                nbFilesPerFolder: opts.nbFilesPerFolder,
                nbFolders: opts.nbFolders
            }
        });

        xhr.done(function (json) {
            var error,
                unknownErrorMessage = 'Unknown error.';

            if (json.error || !json.success) {
                error = json.error || {};

                displayErrorNotify(
                    error.publicMessage || unknownErrorMessage,
                    error.severity || Notify.TYPE_ERROR
                );

                PM.log('Error : ' + error.message || unknownErrorMessage);
                PM.log(error);

                return;
            }

            PM.log('nb created folders = ' + json.nbFolders);
            PM.log('nb files per folder = ' + json.nbFilesPerFolder);

            if ($.isFunction(onEnd)) {
                onEnd(json);
            }
        });

        xhr.fail(function (jqXHR, textStatus, errorThrown) {
            var message = 'FolderMakerAction.createFolders()';

            displayErrorNotify('Server error.', NOTIFY_TYPE_ERROR);

            PM.logAjaxFail(jqXHR, textStatus, errorThrown, message);
        });

        xhr.always(function () {
            _isDisabled = false;
        });
    } // End function _createFolders()

    var Action = {
        /**
         *
         */
        start: function (opts) {
            if (_isDisabled) {
                return;
            }
            _isDisabled = true;
            _createFolders(opts);
        }, // End function start()

        /**
         *
         */
        disable: function () {
            _isDisabled = true;
        }, // End function disable()

        /**
         *
         */
        enable: function () {
            _isDisabled = false;
        }, // End function enable()

        /**
         *
         */
        isDisabled: function () {
            return _isDisabled;
        } // End function isDisabled()
    };

    return Action;
});
