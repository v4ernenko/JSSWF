/*
    JSSWF 1.0.0

    Yet another tool for embedding Flash application

    Released under the MIT License (http://www.opensource.org/licenses/mit-license.php)

    Usage:

    if (JSSWF.version && JSSWF.version[0] >= 9) {
        var options = {
                vars: {
                    someVar: 'someValue'
                },

                attrs: {
                    width: 250,
                    height: 100
                },

                params: {
                    allowScriptAccess: 'always'
                }
            };

        var flashObject = JSSWF.embedFlash('containerId', 'http://example.com/example.swf', options);
    }
*/

var JSSWF = (function (win, doc, nav, undefined) {
    'use strict';

    var util = {
            isObject: function (value) {
                return !!value && typeof value === 'object';
            },

            isValidId: function (id) {
                return !(/[-.+*\/\\]/).test(id);
            },

            getVersion: function (description) {
                var matches = String(description).match(/[\d]+/g) || [];

                matches.length = 3;

                return matches;
            },

            buildParam: function (name, value) {
                return '<param name="' + name + '" value="' + value + '">';
            }
        },

        type,

        player,

        version = null,

        nullFunc = function () {
            return null;
        },

        FLASH_MIME = 'application/x-shockwave-flash',

        embedFlash = function (id, path, options) {
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
                for (var name in vars) if (vars.hasOwnProperty(name)) {
                    _vars.push(name + '=' + win.encodeURIComponent(vars[name]));
                }
            }

            if (util.isObject(attrs)) {
                for (var name in attrs) if (attrs.hasOwnProperty(name)) {
                    _attrs.push(name + '="' + attrs[name] + '"');
                }
            }

            if (util.isObject(params)) {
                for (var name in params) if (params.hasOwnProperty(name)) {
                    _params.push(util.buildParam(name, params[name]));
                }
            }

            _vars.length && _params.push(util.buildParam('FlashVars', _vars.join('&')));

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
        };

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
        type = undefined;
    }

    return {
        version: version,

        getType: function () {
            return type;
        },

        embedFlash: type ? embedFlash : nullFunc
    };
})(window, window.document, window.navigator);
