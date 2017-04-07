View.createController('abLocalizationAnalysisGlosParam', {
    
    afterInitialDataFetch: function() {
    	getRecordsParams();
    }
               
});

function getRecordsParams() {
	var report = View.panels.get('abLocalizationAnalysisGlosParam_grid'); 
	try {
		var result = Workflow.callMethod(
    		'AbSystemAdministration-LocalizationRead-findMistranslatedParamsGlos', '', 'ab-localization-analysis-glos-param.axvw', 'abLocalizationAnalysisGlosParam_ds');
    report.setRecords(result.dataSet.records);
    report.show(true);     
  } catch (e) {
  	Workflow.handleError(e);
  }
}  

