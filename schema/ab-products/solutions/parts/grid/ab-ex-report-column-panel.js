View.createController('reportExample', {
	//One example to illustrate how to get custom column docx report
	exWorkRequest_wrColumns_onReportAll: function() {
		View.openProgressBar(View.getLocalizedString(this.z_PROGRESS_MESSAGE));   
		var panel = this.exWorkRequest_wrColumns;
	
		var parameters =  {};
		
		//XXX: all records
		parameters.recordLimit = 0;
		
		//XXX: paenl's columns number setting
		parameters.columns = panel.columns;
		
		//call panel's callReportJob to get report job id
		var jobId = panel.callDOCXReportJob(panel.title, null, parameters);
		
		var jobStatus = Workflow.getJobStatus(jobId);
			
		while (jobStatus.jobFinished != true && jobStatus.jobStatusCode != 8) {
			jobStatus = Workflow.getJobStatus(jobId);
		}
		
		if (jobStatus.jobFinished) {
			var url = jobStatus.jobFile.url;
			if (valueExistsNotEmpty(url)) {
				window.location = url;
			}
		}
	
		View.closeProgressBar();
	}
});

