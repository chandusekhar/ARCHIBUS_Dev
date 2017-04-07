/**
 * Ab global namespace.
 */
var Ab = window.Ab || {};

/**
 * Returns the namespace specified and creates it if it doesn't exist.
 *
 * Ab.namespace("component");
 * Ab.namespace("Ab.component");
 */
Ab.namespace = function( sNameSpace ) {

    if (!sNameSpace || !sNameSpace.length) {
        return null;
    }

    var levels = sNameSpace.split(".");

    var currentNS = Ab;

    // Ab is implied, so it is ignored if it is included
    for (var i=(levels[0] == "Ab") ? 1 : 0; i<levels.length; ++i) {
        currentNS[levels[i]] = currentNS[levels[i]] || {};
        currentNS = currentNS[levels[i]];
    }

    return currentNS;
};


/**
 * From edit-forms.js.
 */
var afm_form_values_changed = false;

/**
 * Default empty user_form_onload().
 */
function user_form_onload() {}

/**
 * Array of system initialization handlers to be called before user_form_onload().
 */
var system_form_onload_handlers = [];

/**
 * When the document and all scripts are ready.
 */
Ext.onReady(function() {
    if (Ext.isIE) {
        Ext.menu.Menu.prototype.minWidth = 250;
    }

    // KB 3031455: for Chrome and Safari override the CSS rule
    if (Ext.isSafari) {
        Ext.util.CSS.updateRule('.selectvalue_button', 'margin-bottom', '-6px');
    }

    if(typeof Range !== 'undefined'){ 
        if (typeof Range.prototype.createContextualFragment == "undefined") {
            Range.prototype.createContextualFragment = function (html) {
                var doc = window.document;
                var container = doc.createElement("div");
                container.innerHTML = html;
                var frag = doc.createDocumentFragment(), n;
                while ((n = container.firstChild)) {
                    frag.appendChild(n);
                }
                return frag;
            };
        }
    }

    var onLoad = function() {
        for (var i = 0; i < system_form_onload_handlers.length; i++) {
            system_form_onload_handlers[i].call();
        }
        user_form_onload();
    };

    if (system_form_onload_handlers.length == 0) {
        // in debug mode, on IE9, large dashboard views run this script before the handler is initialized
        onLoad.defer(1000);
    } else {
        onLoad();
    }
});
