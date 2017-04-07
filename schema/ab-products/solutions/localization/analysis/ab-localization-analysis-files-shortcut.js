View.createController('abLocalizationAnalysisFilesShortcut', {
    
    afterInitialDataFetch: function() {
    	getRecordsMismatchedFileShortcuts();
    }    	           
});

function getRecordsMismatchedFileShortcuts() {
	var grid = View.panels.get('abLocalizationAnalysisFilesShortcut_grid');
	var restriction = "string_english LIKE '%&[A-Za-z]%' AND substring( string_trans, patindex('%&%', string_trans), 2) <> substring( string_english, patindex('%&%', string_english), 2)";
	grid.refresh(restriction);
}