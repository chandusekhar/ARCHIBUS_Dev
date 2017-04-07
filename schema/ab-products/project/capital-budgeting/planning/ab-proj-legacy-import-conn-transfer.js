var projLegacyImportTransferController = View.createController('projLegacyImportTransfer', {
	
	connectorExecuteJob: 'AbSystemAdministration-ConnectorJob-executeConnector',
	job_id: 0,
	
	progressReportParameters: null,
	
	afterViewLoad: function() {
		this.progressReportParameters = View.parameters.progressReportParameters;
		
		if(this.progressReportParameters.transferAction == "OUT"){
			this.projLegacyImportConn_selectFile.actions.get('import').show(false);
			this.projLegacyImportConn_selectFile.actions.get('export').show(true);
		}else{
			this.projLegacyImportConn_selectFile.actions.get('import').show(true);
			this.projLegacyImportConn_selectFile.actions.get('export').show(false);
		}
	},
	
	afterInitialDataFetch: function() {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('afm_connector.connector_id', this.progressReportParameters.connectorId);
		this.projLegacyImportConn_selectFile.refresh(restriction);
		
		restriction = new Ab.view.Restriction();
		restriction.addClause('afm_conn_log.connector_id', null);
		this.projLegacyImportConn_connectorLog.refresh(restriction);
		this.projLegacyImportConn_connectorLog.show(true);
	},
	
	projLegacyImportConn_selectFile_onImport: function(){
		if (!this.saveFilePath()) return;
		this.startTransfer(getMessage('progressMessageImport'));
	},
	
	projLegacyImportConn_selectFile_onExport: function(){
		if (!this.saveFilePath()) return;
		this.startTransfer(getMessage('progressMessageExport'));
	},
	
	saveFilePath: function() {
		var conn_string = this.projLegacyImportConn_selectFile.getFieldValue('afm_connector.conn_string');
		if(!valueExistsNotEmpty(conn_string)){
			View.showMessage(getMessage("err_no_import_file"));
			return false;
		}
		var filePath = conn_string.toLowerCase();
		if(filePath.substr(filePath.lastIndexOf('.') + 1, 3) != "xls"){
			View.showMessage(getMessage("err_incorrect_file_type"));
			return false;
		}
		return this.projLegacyImportConn_selectFile.save();
	},
	
	startTransfer: function(message){
		var controller = this;
		try {
			var jobId = Workflow.startJob(this.connectorExecuteJob, this.progressReportParameters.connectorId);
			View.openJobProgressBar(message, jobId, '', function(status) {
				var restriction = new Ab.view.Restriction();
				restriction.addClause('afm_connector.connector_id', controller.progressReportParameters.connectorId);
		 		controller.projLegacyImportConn_connectorLog.refresh(restriction);
			});
		} catch (e) {
		    Workflow.handleError(e);
		}
		/*
		try{
			this.job_id = Workflow.startJob(this.connectorExecuteJob, this.progressReportParameters.connectorId);			
			
		}catch(e){
	   		Workflow.handleError(e);
		}
		this.showProgress.defer(1000, this);*/
    },

 	showProgress: function() {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('afm_connector.connector_id', this.progressReportParameters.connectorId);
 		this.projLegacyImportConn_connectorLog.refresh(restriction);
    }
});



