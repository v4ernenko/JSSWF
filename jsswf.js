/**
 * @overview Yet another tool for embedding Flash application.
 * @license MIT
 * @version 1.1.1
 * @author Vadim Chernenko
 * @see {@link https://github.com/v4ernenko/JSSWF|JSSWF source code repository}
 */

/**
 * @namespace JSSWF
 */

var JSSWF = (function (win, doc, nav, undefined) {
    'use strict';

    // Internal helper methods and variables

    var has = 'hasOwnProperty',

        util = {
            toInt: function (value) {
                return win.parseInt(value, 10) || 0;
            },

            isObject: function (value) {
                return !!value && typeof value === 'object';
            },

            isValidId: function (id) {
                return !(/[-.+*\/\\]/).test(id);
            },

            getVersion: function (description) {
                var matches = String(description).match(/[\d]+/g) || [],

                    matchesLength = 3;

                matches.length = matchesLength;

                for (var i = 0; i < matchesLength; i++) {
                    matches[i] = this.toInt(matches[i]);
                }

                return matches;
            },

            buildParam: function (name, value) {
                return '<param name="' + name + '" value="' + value + '">';
            }
        },

        type = null,

        player,

        version = null,

        autoAttrs = {
            id: true,
            name: true,
            data: true,
            type: true,
            classid: true    
        },

        autoParams = {
            movie: true,
            flashvars: true
        },

        FLASH_MIME = 'application/x-shockwave-flash';

    if (
        nav.plugins
        &&
        nav.plugins['Shockwave Flash']
    ) {
        player = nav.plugins['Shockwave Flash'];
    } else if (
        nav.mimeTypes
        &&
        nav.mimeTypes[FLASH_MIME]
    ) {
        player = nav.mimeTypes[FLASH_MIME].enabledPlugin;
    }

    if (player) {
        type = 'PlugIn';

        version = util.getVersion(player.description);
    } else try {
        type = 'ActiveX';

        player = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');

        version = util.getVersion(player.GetVariable('$version'));
    } catch (error) {
        type = null;
    }

    return {
        /**
         * The version of the installed Flash player ([major, minor, revision]).
         *
         * @type {?Array.<number>}
         * @memberof JSSWF
         */

        version: version,

        /**
         * Returns a string that indicates the type of player.
         *
         * @return {?string} Flash player type.
         * @memberof JSSWF
         */

        getType: function () {
            return type;
        },

        /**
         * Embeds the Flash content in an HTML page.
         *
         * @param {string} id
         * @param {string} path
         * @param {Object} [options]
         * @return {?Object} Player DOM element.
         * @memberof JSSWF
         */

        embedFlash: function (id, path, options) {
            if (!type) {
                return null;
            }

            id = String(id);

            path = String(path);

            options = Object(options);

            if (!util.isValidId(id)) {
                throw new Error('JSSWF: id contains invalid characters!');
            }

            var container = doc.getElementById(id);

            if (!container) {
                throw new Error('JSSWF: container not found!');
            }

            var _vars = [],

                _attrs = ['id="' + id + '"', 'name="' + id + '"'],

                _params = [],

                vars = options.vars,

                attrs = options.attrs,

                params = options.params;

            switch (type) {
                case 'PlugIn':
                    _attrs.push('data="' + path + '"');
                
                    _attrs.push('type="' + FLASH_MIME + '"');

                    break;

                case 'ActiveX':
                    _attrs.push('classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"');
                
                    _params.push(util.buildParam('movie', path));

                    break;
            }

            if (util.isObject(vars)) {
                for (var name in vars) {
                    if (vars[has](name)) {
                        _vars.push(name + '=' + win.encodeURIComponent(vars[name]));
                    }
                }
            }

            if (util.isObject(attrs)) {
                for (var name in attrs) {
                    if (attrs[has](name) && !autoAttrs[has](name.toLowerCase())) {
                        _attrs.push(name + '="' + attrs[name] + '"');
                    }
                }
            }

            if (util.isObject(params)) {
                for (var name in params) {
                    if (params[has](name) && !autoParams[has](name.toLowerCase())) {
                        _params.push(util.buildParam(name, params[name]));
                    }
                }
            }

            if (_vars.length) {
                _params.push(util.buildParam('FlashVars', _vars.join('&')));
            }

            var html = [
                '<object ' + _attrs.join(' ') + '>',
                    _params.join(''),
                '</object>'
            ].join('');

            if (container.outerHTML) {
                container.outerHTML = html;
            } else {
                var wrapper = doc.createElement('div');

                wrapper.innerHTML = html;

                container.parentNode.replaceChild(
                    wrapper.firstChild,
                    container
                );
            }

            return doc.getElementById(id);
        }
    };
})(window, window.document, window.navigator);
