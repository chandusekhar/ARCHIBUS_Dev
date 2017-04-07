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

// from common.js
/**
 * Checks whether specified value is defined.
 */
function valueExists(value) {
    return (typeof(value) != 'undefined' && value != null);
}

/**
 * If specified value is defined and is not null, returns it.
 * Otherwise returns specified default value.
 */
function getValueIfExists(value, defaultValue) {
    return valueExists(value) ? value : defaultValue;
}

/**
 * Checks whether specified value is defined and not an empty string.
 */
function valueExistsNotEmpty(value) {
    return (valueExists(value) && (typeof value != 'string' || $.trim(value) != ''));
}

/**
 * String's endsWith function.
 */
function endsWith(str, suffix){
	return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

/**
 * Localize control display strings
 *  read from Ab.localization.Localization object's localizedString array
 * getLocalizedMessage: function(key1, key3)
 */
function getLocalizedString(key3) {
	var localString = key3;
	if (typeof(Ab.localization) != 'undefined') {
		for (var i=0, msg; msg = Ab.localization.Localization.localizedStrings[i]; i++) {
			if (msg.key3 == key3) {
				(msg.value == '') ? localString = '*' + msg.key3 : localString = msg.value;
				return localString;
			}
		}
	}
		
	if (valueExistsNotEmpty(localString)){
		localString = convertFromXMLValue(localString);
	}
		
	return localString;
}

 /**
  * performs the conversion opposite to convert2validXMLValue()
  */
 function convertFromXMLValue(fieldValue){
 	if(typeof fieldValue != "undefined" && fieldValue != null){
		fieldValue = fieldValue.replace(/&amp;/g, '&')
		fieldValue = fieldValue.replace(/&gt;/g, '>');
		fieldValue = fieldValue.replace(/&lt;/g, '<');
		fieldValue = fieldValue.replace(/&apos;/g, '\'');
		fieldValue = fieldValue.replace(/&quot;/g, '\"');
		return fieldValue;
	}
	return "";
 }


/**
 * Define jQuery extend() r.t. Ext.apply() for functions' extension
 */
$.extend(Function.prototype, {
     
    createCallback : function(){
        // make args available, in function below
        var args = arguments;
        var method = this;
        return function() {
            return method.apply(window, args);
        };
    },
    
    createDelegate : function(obj, args, appendArgs){
        var method = this;
        return function() {
            var callArgs = args || arguments;
            if(appendArgs === true){
                callArgs = Array.prototype.slice.call(arguments, 0);
                callArgs = callArgs.concat(args);
            }else if(typeof appendArgs == "number"){
                callArgs = Array.prototype.slice.call(arguments, 0); // copy arguments first
                var applyArgs = [appendArgs, 0].concat(args); // create method call params
                Array.prototype.splice.apply(callArgs, applyArgs); // splice them in
            }
            return method.apply(obj || window, callArgs);
        };
    },

    
    defer : function(millis, obj, args, appendArgs){
        var fn = this.createDelegate(obj, args, appendArgs);
        if(millis){
            return setTimeout(fn, millis);
        }
        fn();
        return 0;
    }
});
