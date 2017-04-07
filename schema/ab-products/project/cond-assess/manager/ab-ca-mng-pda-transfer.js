var controller = View.createController('pdaTransferProgress', {

	jobId: '',
	
	transferOutRuleId: 'AbSystemAdministration-dataTransfer-transferOut',
	transferInRuleId: 'AbSystemAdministration-dataTransfer-transferIn',
	
	progressControl: null,
	
	progressReportParameters: null,
	
	reportTask: null,
    reportTaskRunner: null,
	
	afterViewLoad: function() {
		// use all default configObj parameters
		var configObj = new Ab.view.ConfigObject();
		this.progressReportParameters = View.parameters.progressReportParameters;
		if(this.progressReportParameters.transferAction == "OUT"
		 || this.progressReportParameters.isCompare == false){
			configObj.setConfigParameter("showResults", false);
		}
		
		this.progressControl = new Ab.progress.ProgressReport('reportProgressPanel', configObj);
		this.progressControl.build();
		this.progressControl.setButtonText(Ab.view.View.getLocalizedString(this.PROGRESS_STOP_TRANSFER) );
		
		if(this.progressReportParameters.transferAction == "OUT"){
			this.selectFilePanel.enableAction('import', false);
			$('inLocalFileBrow').disabled = true;
			this.startTransfer();
		}else{
			this.selectFilePanel.enableAction('import', true);
			$('inLocalFileBrow').disabled = false;
		}
	},
	
	startTransfer: function(){
		var panel = View.getOpenerView().getControl('', this.progressReportParameters.panelId);
		
		if( this.progressReportParameters.transferAction == "OUT" ) {
			this.jobId = Workflow.startJob(this.transferOutRuleId, this.progressReportParameters.viewName, this.progressReportParameters.dataSourceId, this.progressReportParameters.panelTitle,  this.getPanelSchemaFields(panel), this.progressReportParameters.panelRestriction, this.progressReportParameters.transferFormat);
			this.progressControl.setProgressAndRunTask(this.jobId);
		}else if( this.progressReportParameters.transferAction == "IN" || this.progressReportParameters.transferAction == "COMPARE") {
			var filePath =  this.progressReportParameters.importLocalFile.value.toLowerCase();
			var fileExt = filePath.substr(filePath.lastIndexOf('.') + 1);

			Workflow.startJobWithUpload(this.transferInRuleId, this.progressReportParameters.importLocalFile, this.afterDataTransferStarted, this, this.progressReportParameters.isCompare,null, this.progressReportParameters.transferAction, fileExt, true);
			
		}
	},
	
	selectFilePanel_onImport: function(){
		var fileObj = $('inLocalFileBrow');
		if(!valueExistsNotEmpty(fileObj.value)){
			View.showMessage(getMessage("err_no_import_file"));
			return;
		}
		var filePath = fileObj.value.toLowerCase();
		if(filePath.substr(filePath.lastIndexOf('.') + 1) != "csv"){
			View.showMessage(getMessage("err_incorrect_file_type"));
			return;
		}
		this.progressReportParameters.importLocalFile = fileObj;
		this.startTransfer();
		
		var controller = this;
        this.startReportTask(controller);
	},
	
	// start auto-refresh background task using Ext.util.TaskRunner
    startReportTask: function(controller){
        this.reportTask = {
            run: function(){
            var status = Workflow.getJobStatus(controller.jobId);
            if(status.jobFinished){
				controller.progressReportParameters.gridPanel.refresh();
				controller.reportTaskRunner.stop(controller.reportTask);
			}  
            },
            interval: 1000
        }
        this.reportTaskRunner = new Ext.util.TaskRunner();
        this.reportTaskRunner.start(this.reportTask);
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
		// 03/24/2010 IOAN KB - 3024301
		this.afterViewLoad();
		if(this.progressReportParameters.transferAction != "OUT"){
			this.selectFilePanel_onImport();
		}
    },
    // ----------------------- constants -----------------------------------------------------------
	   
	// @begin_translatable
	PROGRESS_STOP_TRANSFER: 'Stop Transfer'
	// @end_translatable
	

});



