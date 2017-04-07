/**
 * Drawing global namespace.
 */
var Drawing = window.Drawing || {};

/**
 * Returns the namespace specified and creates it if it doesn't exist.
 *
 * Drawing.namespace("component");
 * Drawing.namespace("Drawing.component");
 */
Drawing.namespace = function( sNameSpace ) {

    if (!sNameSpace || !sNameSpace.length) {
        return null;
    }

    var levels = sNameSpace.split(".");

    var currentNS = Drawing;

    // Drawing is implied, so it is ignored if it is included
    for (var i=(levels[0] == "Drawing") ? 1 : 0; i<levels.length; ++i) {
        currentNS[levels[i]] = currentNS[levels[i]] || {};
        currentNS = currentNS[levels[i]];
    }

    return currentNS;
};

