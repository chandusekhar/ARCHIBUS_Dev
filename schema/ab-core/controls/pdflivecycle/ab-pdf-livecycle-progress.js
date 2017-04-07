var controller = View.createController('pdfLiveCycleProgress', {

	jobId: '',
	
	progressControl: null,
	
	ruleId: 'AbCommonResources-pdfLiveCycle-exportPdfForm',
	
	afterViewLoad: function() {
		
		// use all default configObj parameters
		var configObj = new Ab.view.ConfigObject();
		
		//show the result file
		configObj.setConfigParameter("showResultFile", true);
		
		// do not show the partial results
		configObj.setConfigParameter("showResults", false);

		configObj.setConfigParameter("showReportViewName", false);
		configObj.setConfigParameter("showRecordsOfTotal", true);
		configObj.setConfigParameter("showElapsed", true);
		configObj.setConfigParameter("showEstimatedRemainingTime", false);

		this.progressControl = new Ab.progress.ProgressReport('pdfLiveCycleProgressPanel', configObj);
		this.progressControl.build();
		this.progressControl.setButtonText(Ab.view.View.getLocalizedString(this.PROGRESS_STOP_PDF_EXPORT) );
	    this.startPdfExport();
	},

	startPdfExport: function(){

		this.jobId = Workflow.startJob(this.ruleId, 
										View.getView("parent").progressReportParameters.viewName, 
										View.getView("parent").progressReportParameters.dataSourceId, 
										View.getView("parent").progressReportParameters.restrictions, 
										View.getView("parent").progressReportParameters.fieldNames, 
										View.getView("parent").progressReportParameters.pdfFieldNames, 
										View.getView("parent").progressReportParameters.pdfControlTypes, 
										View.getView("parent").progressReportParameters.pdfTemplate,
										View.getView("parent").progressReportParameters.recordLimit);

		this.progressControl.setProgressAndRunTask(this.jobId);
	},
	

    // ----------------------- constants -----------------------------------------------------------
	   
	// @begin_translatable
	PROGRESS_STOP_PDF_EXPORT: 'Stop PDF Export'
	// @end_translatable
	
	
});



