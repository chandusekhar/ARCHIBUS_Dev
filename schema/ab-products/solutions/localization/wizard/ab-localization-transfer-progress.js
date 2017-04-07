var controller = View.createController('localizationTransferProgress', {

	jobId: '',
	
	transferInRuleId: 'AbSystemAdministration-dataTransfer-transferIn',
	
	progressControl: null,
	
	buildProgressReport: function() {
	
		// use all default configObj parameters
		var configObj = new Ab.view.ConfigObject();

		//hide the result view column for trnasfer in/comparison
		if(View.getView("parent").progressReportParameters.transferAction != "OUT"){
			configObj.setConfigParameter("showResultFile", false);
		}
				
		// do not show the partial results
		if(View.getView("parent").progressReportParameters.transferAction == "OUT"
			|| View.getView("parent").progressReportParameters.isCompare == false){
			configObj.setConfigParameter("showResults", false);
		}
		
		this.progressControl = new Ab.progress.ProgressReport('reportProgressPanel', configObj);
		this.progressControl.build();
		this.progressControl.setButtonText(Ab.view.View.getLocalizedString(this.PROGRESS_STOP_TRANSFER) );
	    this.startTransfer();
	},
	
	startTransfer: function(){
	
    if( View.getView("parent").progressReportParameters.transferAction == "IN" || View.getView("parent").progressReportParameters.transferAction == "COMPARE") {
			var filePath =  "";
			if(View.getView("parent").progressReportParameters.importLocalFile.value==""){
				filePath = View.getView("parent").progressReportParameters.serverFileName.toLowerCase();
			} else {
				filePath = View.getView("parent").progressReportParameters.importLocalFile.value.toLowerCase();
			}
			var	fileExt = filePath.substr(filePath.lastIndexOf('.') + 1);
			View.getView("parent").progressReportParameters.panelTitle = filePath.substr(filePath.lastIndexOf('\\') + 1);			
			Workflow.startJobWithUpload(this.transferInRuleId, View.getView("parent").progressReportParameters.importLocalFile, this.afterDataTransferStarted, this, View.getView("parent").progressReportParameters.isCompare, View.getView("parent").progressReportParameters.serverFileName, View.getView("parent").progressReportParameters.transferAction, fileExt, false);
		}
	},
	
	afterDataTransferStarted: function(result) {
     this.jobId = result.message;
     this.showProgress.defer(1000, this);  
	},

	showProgress: function() {
		this.progressControl.setProgressAndRunTask(this.jobId);
	},
		   
    reportProgressPanel_onStartOver: function(){
    	View.getView("parent").reload();
    },
    
    // ----------------------- constants -----------------------------------------------------------	   
	PROGRESS_STOP_TRANSFER: 'Stop Transfer'
	
	
});



