/**
 * AFM global namespace.
 */
var AFM = window.AFM || {};

/**
 * Returns the namespace specified and creates it if it doesn't exist.
 *
 * AFM.namespace("component");
 * AFM.namespace("AFM.component");
 */
AFM.namespace = function( sNameSpace ) {

    if (!sNameSpace || !sNameSpace.length) {
        return null;
    }

    var levels = sNameSpace.split(".");

    var currentNS = AFM;

    // AFM is implied, so it is ignored if it is included
    for (var i=(levels[0] == "AFM") ? 1 : 0; i<levels.length; ++i) {
        currentNS[levels[i]] = currentNS[levels[i]] || {};
        currentNS = currentNS[levels[i]];
    }

    return currentNS;
};
