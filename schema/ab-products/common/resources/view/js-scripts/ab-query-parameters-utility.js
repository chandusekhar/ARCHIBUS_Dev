/**
 * read query parameters from window.location
 * @param parameters array with parameter names
 * @return {name, value} object 
 */
function readQueryParameters(names){
	var queryParameters = {};
	for (var i = 0; i < names.length; i++ ) {
		var name = names[i];
		if(valueExists(window.location.parameters) 
				&& valueExists(window.location.parameters[name])) {
			queryParameters[name] = window.location.parameters[name];
		}
	}
	return queryParameters;
}

/**
 * Check if application is started in demo mode or not. 
 * @returns {Boolean}
 */
function isInDemoMode(){
	return View.activityParameters["AbSystemAdministration-DemoMode"] == "1";
}

/**
 * Check if object is empty.
 * @param inputObj
 * @returns {Boolean}
 */
function isEmptyObject(inputObj){
	for (var key in inputObj) {
		if (inputObj.hasOwnProperty(key)) {
			return false;
		}
	}
	return true;
}
