var connectorController = View.createController('connectorController', {
	
	connectorJob: 'AbSystemAdministration-ConnectorJob-executeConnector',
	job_id: 0,

	connector_list_run_onClick : function(row, action){
		var controller = this;
		var connector_id = row.record['afm_connector.connector_id'];	
		
		try{
			this.jobId = Workflow.startJob(this.connectorJob, connector_id);
			
		}catch(e){
   			Workflow.handleError(e);
		}
		
		
	}
			
});

