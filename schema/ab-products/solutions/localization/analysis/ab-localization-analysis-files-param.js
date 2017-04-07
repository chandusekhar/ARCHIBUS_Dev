View.createController('abLocalizationAnalysisFilesParam', {
    
    afterInitialDataFetch: function() {
    	getRecordsParams();
    }
               
});

function getRecordsParams() {
	var report = View.panels.get('abLocalizationAnalysisFilesParam_grid'); 
	try {
		var result = Workflow.callMethod(
    		'AbSystemAdministration-LocalizationRead-findMistranslatedParams', '', 'ab-localization-analysis-files-param.axvw', 'abLocalizationAnalysisFilesParam_ds');
    report.setRecords(result.dataSet.records);
    report.show(true);     
  } catch (e) {
  	Workflow.handleError(e);
  }
}  

