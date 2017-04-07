View.createController('jobExample', {
	
	/**
	 * Start the job and display the progress bar. 
	 * The user will have to close the progress bar dialog after the job is complete.
	 */
	testPanel_onStartJob: function() {
	    // start the job
	    var jobId = Workflow.startJob('AbSolutionsLogicAddIns-LogicExamples-getWorkRequestChartData2D');
	    
	    // open the progress bar dialog
	    var message = getMessage('messageWorking');
	    View.openJobProgressBar(message, jobId);
    },

	/**
	 * Start the job, display the progress bar, and wait for the job completion. 
	 * Then handle the job result data and close the progress bar dialog.
	 */
	testPanel_onStartJobAndHandleResult: function() {
        // start the job
        var jobId = Workflow.startJob('AbSolutionsLogicAddIns-LogicExamples-getWorkRequestChartData2D');
        
        // open the progress bar and wait until the job is complete
        var message = getMessage('messageWorking');
        var controller = this;
        View.openJobProgressBar(message, jobId, null, function(status) {
        	// this function is called when the job is complete
        	
            // display the data
    		View.showMessage('<b>Row values:</b> ' + toJSON(status.dataSet.rowValues) + 
    				         '<br\><b>Column values:</b> ' + toJSON(status.dataSet.columnValues));
        });
    }
});