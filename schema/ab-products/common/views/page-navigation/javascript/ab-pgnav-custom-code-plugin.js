/**
 * Load and execute custom JavaScript or CSS files
 *
 * Add or remove plug-in files to the loadCustomCodeFiles() function below.
 *
 */

/**
 * The directory from which to load all script or style files.
 */
var CUSTOM_CODE_DIRECTORY = "/archibus/schema/ab-products/common/views/page-navigation/javascript/"

/**
 * Load a JavaScript or CSS file into the document
 *
 * @param fileName
 */
function loadCustomCodeFile(fileName) {
	if (fileName.substr(fileName.length - 3) === '.js') {
		var customCodeFile = CUSTOM_CODE_DIRECTORY + fileName;
		$.ajax({
			type: "GET",
			url: customCodeFile,
			dataType: "script",
			crossDomain: true,
			statusCode: { 404: function() { alert("page not found"); }}
			})
			.done(function() {console.log('Load of ' + fileName + ' was successful.');})
			.fail(function() {console.log( "Error loading " + fileName);});
	}
	else if (fileName.substr(fileName.length - 4) === '.css') {
		var cssLink = $("<link rel='stylesheet' type='text/css' href='"+ CUSTOM_CODE_DIRECTORY + fileName +"'>");
		$("head").append(cssLink);
		console.log('Load of ' + fileName + ' was successful.');
	}
	else {
		console.log( "Error loading " + fileName + ". It must be a js or css file.");
	}
}


/**
 * The loading of custom code files follows the pattern of the first (commented-out) line.
 * The single argument to loadCustomCodeFile(file) may be a .js or .css file located in CUSTOM_CODE_DIRECTORY.
 *
 */
function loadCustomCodeFiles() {
//	loadCustomCodeFile("helloWorld.js");
//	loadCustomCodeFile("stackedBars.js");
//	loadCustomCodeFile("stackedBars.css");
}	

