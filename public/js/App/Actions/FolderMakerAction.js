/* global
    define
*/

define([
    'jquery',

    // PM
    'PM/Core'
],
function ($, PM) {
    'use strict';

    var _isDisabled = false,
        exports;


    exports = {

        extractFiles: function (opts) {
            var xhr, events, onStart, onEnd, success, failure,
                defaultOptions = {
                    folder: '',
                    removeEmptyFolder: false,
                    success: null,
                    failure: null,
                    events: {
                        onStart: null,
                        onEnd: null
                    }
                };

            if (_isDisabled) {
                return;
            }

            _isDisabled = true;

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
                url: '/?r=extractFiles_s',
                type: 'POST',
                dataType: 'json',
                async: true,
                data: {
                    folder: opts.folder,
                    removeEmptyFolders: opts.removeEmptyFolders
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
                var message = 'FolderMakerAction.extractFiles()',
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
        },

        createFolders: function (opts) {
            var xhr, events, onStart, onEnd, success, failure,
                defaultOptions = {
                    folder: '',
                    nbFolders: '',
                    nbFilesPerFolder: '',
                    filters: {
                        types: null
                    },
                    success: null,
                    failure: null,
                    events: {
                        onStart: null,
                        onEnd: null
                    }
                };

            if (_isDisabled) {
                return;
            }

            _isDisabled = true;

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
                    nbFolders: opts.nbFolders,
                    types: opts.filters.types
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
        },

        disable: function () {
            _isDisabled = true;
        },

        enable: function () {
            _isDisabled = false;
        },

        isDisabled: function () {
            return _isDisabled;
        }
    };

    return exports;
});
