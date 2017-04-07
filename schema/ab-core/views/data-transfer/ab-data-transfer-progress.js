var controller = View.createController('dataTransferProgress', {

	jobId: '',
	
	transferOutRuleId: 'AbSystemAdministration-dataTransfer-transferOut',
	transferInRuleId: 'AbSystemAdministration-dataTransfer-transferIn',
	transferOutWithDocumentRuleId: 'AbSystemAdministration-dataTransfer-transferOutWithDocuments',
	transferInWithDocumentRuleId: 'AbSystemAdministration-dataTransfer-transferInWithDocuments',
	
	progressControl: null,

	parentView: null,
	
	buildProgressReport: function() {
		var mainController = this.view.controllers.get('dataTransferMain');
		if (mainController != null) {
			this.parentView = this.view;
		}
		else {
			this.parentView = View.getView('parent');
		}

		// use all default configObj parameters
		var configObj = new Ab.view.ConfigObject();
		
		//hide the result view column for trnasfer in/comparison
		if(this.parentView.progressReportParameters.transferAction != "OUT"){
			configObj.setConfigParameter("showResultFile", false);
		}
		
		// do not show the partial results
		if(this.parentView.progressReportParameters.transferAction == "OUT" || this.parentView.progressReportParameters.isCompare == false){
			configObj.setConfigParameter("showResults", false);
		}

		if(this.parentView.progressReportParameters.transferAction == "OUT" && this.parentView.progressReportParameters.isExportDocument == true){
			this.transferOutRuleId = this.transferOutWithDocumentRuleId;
		}
		
		if(this.parentView.progressReportParameters.transferAction == "IN" && this.parentView.progressReportParameters.isImportDocument == true){
			this.transferInRuleId = this.transferInWithDocumentRuleId;
		}
		
		
		this.progressControl = new Ab.progress.ProgressReport('reportProgressPanel', configObj);
		this.progressControl.build();
		this.progressControl.setButtonText(Ab.view.View.getLocalizedString(this.PROGRESS_STOP_TRANSFER) );
	    this.startTransfer();
	},
	
	startTransfer: function(){

		var panel = View.getOpenerView().getControl('', this.parentView.progressReportParameters.panelId);
		
		try {
		if (this.parentView.progressReportParameters.transferAction == "OUT") {
			this.jobId = Workflow.startJob(
				this.transferOutRuleId, 
				this.parentView.progressReportParameters.viewName, 
				this.parentView.progressReportParameters.dataSourceId, 
				this.parentView.progressReportParameters.panelTitle, 
				this.getPanelSchemaFields(panel), 
				this.parentView.progressReportParameters.panelRestriction, 
				this.parentView.progressReportParameters.transferFormat
				);
			this.progressControl.setProgressAndRunTask(this.jobId);
		}
		else if (this.parentView.progressReportParameters.transferAction == "IN" || this.parentView.progressReportParameters.transferAction == "COMPARE") {
			var filePath = "";
			if (this.parentView.progressReportParameters.importLocalFile.value == "") {
				filePath = this.parentView.progressReportParameters.serverFileName.toLowerCase();
			} 
			else {
				filePath = this.parentView.progressReportParameters.importLocalFile.value.toLowerCase();
			}
			var	fileExt = filePath.substr(filePath.lastIndexOf('.') + 1);
			Workflow.startJobWithUpload(
				this.transferInRuleId, 
				this.parentView.progressReportParameters.importLocalFile, 
				this.afterDataTransferStarted, 
				this, 
				this.parentView.progressReportParameters.isCompare,
				this.parentView.progressReportParameters.serverFileName, 
				this.parentView.progressReportParameters.transferAction, 
				fileExt,
				this.parentView.progressReportParameters.checkValidation);
		}
		} catch (e) {
			View.showMessage('error', e.message);
		}
	},
	
	afterDataTransferStarted: function(result) {
	    this.jobId = result.message;

	    this.showProgress.defer(1000, this);
    },

 	showProgress: function() {
	    this.progressControl.setProgressAndRunTask(this.jobId);
    },

	getPanelSchemaFields: function(panel){
    	var panelFields = "[";				
		for (var i = 0, field; field = panel.fieldDefs[i]; i++) {
			if(field.controlType == ''){
				panelFields += "{name:'" + field.id + "'}";					
			
				if (panel.fieldDefs[i + 1]) {
					panelFields += "," 
				}
			}
		}
		panelFields += "]";
		return panelFields;
    },
    
    reportProgressPanel_onStartOver: function(){
		var tabPanel = this.parentView.panels.get('datatransfer_tabs');
		tabPanel.selectTab('datatransfer_action');
		
		tabPanel.enableTab('datatransfer_selection', false);
		tabPanel.enableTab('datatransfer_progress', false);
    },
    
    // ----------------------- constants -----------------------------------------------------------
	   
	// @begin_translatable
	PROGRESS_STOP_TRANSFER: 'Stop Transfer'
	// @end_translatable
	
	
});

