/* global
    define
*/

define(
[
    'jquery',

    // PM
    'PM/Core'
],
function ($, PM) {
    'use strict';

    var _isDisabled = false;

    /**
     *
     */
    function _createFolders (opts) {
        var xhr, events, onStart, onEnd, success, failure,
            defaultOptions = {
                folder: '',
                nbFolders: '',
                nbFilesPerFolder: '',
                success: null,
                failure: null,
                events: {
                    onStart: null,
                    onEnd: null
                }
            };


        // =================================
        // Start of function createFolders()
        // =================================

        opts = $.extend(true, {}, defaultOptions, opts || {});

        events = opts.events;
        onStart = events.onStart;
        onEnd = events.onEnd;
        success = opts.success;
        failure = opts.failure;

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

            if ($.isFunction(onEnd)) {
                onEnd(json);
            }

            if (json.error || !json.success) {
                error = json.error || {};

                PM.log('Error : ' + error.message || unknownErrorMessage);
                PM.log(error);

                if ($.isFunction(failure)) {
                    failure(error);
                }

                return;
            }

            if ($.isFunction(success)) {
                success(json);
            }
        });

        xhr.fail(function (jqXHR, textStatus, errorThrown) {
            var message = 'FolderMakerAction.createFolders()',
                error = {
                    publicMessage: 'Server error.'
                };

            PM.logAjaxFail(jqXHR, textStatus, errorThrown, message);

            if ($.isFunction(onEnd)) {
                onEnd(error);
            }

            if ($.isFunction(failure)) {
                failure(error);
            }
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
