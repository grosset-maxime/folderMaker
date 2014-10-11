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
    var defaultOptions = {
            root: null
        },
        options = {},
        els = {};

    /**
     *
     */
    function buildSkeleton () {
        var mainCtn, loadingCtn;

        mainCtn = els.mainCtn = $('<div>', {
            'class': 'folder_maker flex'
        });

        els.headerCtn = $('<div>', {
            'class': 'fm_header_ctn flex'
        }).appendTo(mainCtn);

        els.middleCtn = $('<div>', {
            'class': 'fm_middle_ctn flex'
        }).appendTo(mainCtn);

        els.footerCtn = $('<div>', {
            'class': 'fm_footer_ctn flex'
        }).appendTo(mainCtn);

        // Loading
        // -------
        loadingCtn = els.loadingCtn = $('<div>', {
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

        options.root.append(mainCtn);
    } // End function buildSkeleton()

    /**
     *
     */
    function attachKeyboardShorcuts () {
        $(document).on('keydown', function (e) {
            var keyPressed = e.which,
                doPreventDefault = false;

            // console.log(keyPressed);

            switch (keyPressed) {
            case 13: // Enter
            case 32: // SPACE
                OptionsView.start();
                doPreventDefault = true;
                break;
            }

            if (doPreventDefault) {
                e.preventDefault();
            }
        });
    } // End function attachKeyboardShorcuts()

    // /**
    //  *
    //  */
    // function showLoading () {
    //     els.loadingCtn.show();
    // } // End function showLoading()

    // /**
    //  *
    //  */
    // function hideLoading () {
    //     els.loadingCtn.hide();
    // } // End function hideLoading()

    var View = {
        /**
         *
         */
        init: function (opts) {
            var mainCtn;

            $.extend(true, options, defaultOptions, opts || {});

            if (!options.root) {
                options.root = $(document.body);
            }

            buildSkeleton();
            mainCtn = els.mainCtn;

            HeaderView.init({
                root: els.headerCtn
            });

            FooterView.init({
                root: els.footerCtn
            });

            OptionsView.init({
                root: els.middleCtn
            });

            attachKeyboardShorcuts();
        }
    };

    return View;
});
