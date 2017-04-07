function user_form_onload() {
	Ext.get('duplicate_result_div').dom.innerHTML= "";
}

function runFileSearch() {
	Ext.get('duplicate_result_div').dom.innerHTML= getMessage('searching');;
	
	var search_directory = Ext.get('search_directory').dom.value;
	search_directory = search_directory.trim();
	var searchDirectory = search_directory.replace(/\\/g, "\\\\");
	
	var directories_to_ignore = Ext.get('directories_to_ignore').dom.value;
	directories_to_ignore = directories_to_ignore.trim();
	
    var parameters = {
      	searchDirectory: searchDirectory,
      	directoriesToIgnore: directories_to_ignore
    };
    try {
        var result = Workflow.call('AbSystemAdministration-runFileSearch', parameters);
        var resultString = "";
        if (result.data) {
            var duplicateArray = result.data;
	        for (i = 0; i < duplicateArray.length; i++) {
	        	resultString += duplicateArray[i].file1 + "<br/>" + duplicateArray[i].file2 + "<br/><br/>";			
	        }
        }
        resultString += result.message + " " + getMessage('axvwFilesFound');
        resultString += "<br/>" + duplicateArray.length + " " + getMessage('duplicatesFound');
        Ext.get('duplicate_result_div').dom.innerHTML= resultString;
    } catch (e) {
        Workflow.handleError(e);
        Ext.get('duplicate_result_div').dom.innerHTML= "Error";
    }
}

function refreshDirectoryPanel() {
	Ext.get('search_directory').dom.value = "C:\\Program Files\\Afm17\\tools\\tomcat\\webapps\\archibus\\schema";
	Ext.get('directories_to_ignore').dom.value = "build\\classes;solutions\\conversion";
}