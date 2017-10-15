/* global
    define
*/

define(
[
    'jquery',

    // App Views
    'App/Views/HeaderView',
    'App/Views/FooterView',
    'App/Views/OptionsView'
],
function ($, HeaderView, FooterView, OptionsView) {
    'use strict';

    /**
     *
     */
    var _defaultOptions = {
            root: null
        },
        _options = {},
        _els = {};

    /**
     *
     */
    function _buildSkeleton () {
        var mainCtn, loadingCtn;

        mainCtn = _els.mainCtn = $('<div>', {
            'class': 'folder_maker flex'
        });

        _els.headerCtn = $('<div>', {
            'class': 'fm_header_ctn flex',
            on: {
                click: OptionsView.setFocusCustomFolder
            }
        }).appendTo(mainCtn);

        _els.middleCtn = $('<div>', {
            'class': 'fm_middle_ctn flex',
            on: {
                click: OptionsView.setFocusCustomFolder
            }
        }).appendTo(mainCtn);

        _els.footerCtn = $('<div>', {
            'class': 'fm_footer_ctn flex',
            on: {
                click: OptionsView.setFocusCustomFolder
            }
        }).appendTo(mainCtn);

        // Loading
        // -------
        loadingCtn = _els.loadingCtn = $('<div>', {
            'class': 'ctn_loading'
        }).append(
            $('<span>', {
                'class': 'el_loading_1 el_loading'
            }),
            $('<span>', {
                'class': 'el_loading_2 el_loading'
            }),
            $('<span>', {
                    'class': 'el_loading_3 el_loading'
                })
        );

        mainCtn.append(
            loadingCtn
        );

        _options.root.append(mainCtn);
    }

    /**
     *
     */
    function _attachKeyboardShorcuts () {
        $(document).on('keydown', function (e) {
            var keyPressed = e.which,
                doPreventDefault = false;

            // console.log(keyPressed);

            switch (keyPressed) {
            case 13: // Enter
                OptionsView.start();
                doPreventDefault = true;
                break;
            }

            if (doPreventDefault) {
                e.preventDefault();
            }
        });
    }


    var View = {
        /**
         *
         */
        init: function (opts) {
            var mainCtn;

            $.extend(true, _options, _defaultOptions, opts || {});

            if (!_options.root) {
                _options.root = $(document.body);
            }

            _buildSkeleton();
            mainCtn = _els.mainCtn;

            HeaderView.init({
                root: _els.headerCtn
            });

            FooterView.init({
                root: _els.footerCtn
            });

            OptionsView.init({
                root: _els.middleCtn
            });

            _attachKeyboardShorcuts();
        }
    };

    return View;
});
