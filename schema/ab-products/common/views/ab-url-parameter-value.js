/*
 * Utility for selecting url parameters by name.
 * ab-url-parameter-value.js
 */
 
/**
 * Return the value of the named parameter from the URL string, 
 * or the empty string when the parameter is not founmd.
 */
function getUrlParameterValue(parameterName) {
	var parameterValue = '';

	if (location.search.indexOf('?') >= 0) {
		var parameters = location.search.substr(location.search.indexOf('?') + 1).split('&');
		var parameterCount = parameters.length;

		for (var i = 0; i < parameterCount; i++) {
			var nameAndValue = parameters[i].split('=');
			if (nameAndValue[0] === parameterName) { 
				parameterValue = nameAndValue[1]; 
				break;
			}
		}
	}

	return parameterValue;
}
