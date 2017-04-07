View.createController('deleteBosmedData', {
	
	/**
	 * Start the job and display the progress bar. 
	 * The user will have to close the progress bar dialog after the job is complete.
	 */
	jobPanel_onStartJob: function() {
	    // start the job
		var result = Workflow.callMethod("AbBldgOpsBackgroundData-BldgopsExpressService-deleteSampleDataOfBOSMED");
		if (valueExists(result.jsonExpression) && result.jsonExpression != '') {
			result.data = eval('(' + result.jsonExpression + ')');
			var jobId = result.data.jobId;
			// open the progress bar dialog
			var message = getMessage('messageWorking');
			View.openJobProgressBar(message, jobId);
		}
    }
});