View.createController('abLocalizationAnalysisGlosShortcut', {
    
    afterInitialDataFetch: function() {
    	getRecordsMismatchedGlosShortcuts();
    }   	
              
});

function getRecordsMismatchedGlosShortcuts() {
	var grid = View.panels.get('abLocalizationAnalysisGlosShortcut_grid');
	var restriction = "string_english LIKE '%&[A-Za-z]%' AND substring( string_trans, patindex('%&%', string_trans), 2) <> substring( string_english, patindex('%&%', string_english), 2)";
	grid.refresh(restriction);
}

