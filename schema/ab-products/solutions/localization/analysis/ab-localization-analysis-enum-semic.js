View.createController('abLocalizationAnalysisEnumSemic', {
    
    afterInitialDataFetch: function() {
    	getRecordsEnumsSemic();
    }
               
});

function getRecordsEnumsSemic() {
	var report = View.panels.get('abLocalizationAnalysisEnumSemiColons_grid'); 
	try {
		var result = Workflow.callMethod(
    		'AbSystemAdministration-LocalizationRead-findMistranslatedEnums', '', 'ab-localization-analysis-enum-semic.axvw', 'abLocalizationAnalysisEnumSemiColons_ds');
    report.setRecords(result.dataSet.records);
    report.show(true);     
  } catch (e) {
  	Workflow.handleError(e);
  }
}  

