
function startJob() {
	try {
	    var jobId = Workflow.startJob("AbSolutionsLogicAddIns-JobExamples-runCounter");
        this.row.setFieldValue('bl.job_id', jobId);

        var displayStatus = function() {
	        var status = Workflow.getJobStatus(jobId);
		    this.row.setFieldValue('bl.job_status', status.jobStatus);
        };
        displayStatus.defer(500, this);
		
	} catch (e) {
	    Workflow.handleError(e);
	}
}

function stopJob() {
    var jobId = this.row.getFieldValue('bl.job_id');
    if (valueExistsNotEmpty(jobId)) {
        var status = Workflow.stopJob(jobId);
        this.row.setFieldValue('bl.job_status', status.jobStatus);
    }
}

function terminateJob() {
    var jobId = this.row.getFieldValue('bl.job_id');
    if (valueExistsNotEmpty(jobId)) {
        var status = Workflow.terminateJob(jobId);
        this.row.setFieldValue('bl.job_status', status.jobStatus);
    }
}

function showJobStatus() {
    var jobId = this.row.getFieldValue('bl.job_id');
    if (valueExistsNotEmpty(jobId)) {
	    var status = Workflow.getJobStatus(jobId);
	    
	    // the following code is for testing only; 
	    // production code should use either the View.openJobStatusDialog() or the My Jobs view  
	    
	    var message = 'Job ID: ' + status.jobId + '<br/>' +
	                  'Result: ' + status.jobFile.title + '</br>' +
	                  'Status: ' + status.jobStatus + '<br/>' +
	                  'Is finished? ' + status.jobFinished + '<br/>' +
	                  'Message: ' + status.jobMessage + '</br>' +
	                  'Current number: ' + status.jobCurrentNumber + '<br/>' +
	                  'Total number: ' + status.jobTotalNumber + '<br/>' +
	                  'Percent complete: ' + status.jobPercentComplete + '<br/>' +
	                  'Elapsed time: ' + status.jobElapsedTime + '<br/>' +
	                  'Estimated time remaining: ' + status.jobEstimatedTimeRemaining + '<br/>' +
	                  'Partial results:<br/>';
	    for (var i = 0; i < status.jobPartialResults.length; i++) {
	        message = message + '&nbsp;&nbsp;&nbsp;&nbsp;' + status.jobPartialResults[i].title + '<br/>';
	    }
	    
	    View.showMessage(message);
    }
}