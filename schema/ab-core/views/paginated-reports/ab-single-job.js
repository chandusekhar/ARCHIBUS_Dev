/**
 * Single Job Report Controller 
 *  
 * Author: 	Ying Qin
 * Date:	March 2009
 *
 */
var controller = View.createController('mySingleJobReportController', {
	
	progressReport: null,
	
	result: null,
	
	autoRefreshInterval: 5,
	reportTask: null,
	reportTaskRunner: null,
	
	ruleId: '',
	jobId: '',
	
	//viewName: '',
	
	params: null,
	paramNum: 0,
	
	/**
	 * After view loads set up the top panel's localized labels and profile values
	 * Set up the listener -- and localize the values -- for the locale select control in the form
	 */
	afterViewLoad: function() {
 		
 		this.reportProgressPanel.sortEnabled = false;
		
		this.params = new Array();
		
		this.getURLParams();
	},
	
	afterInitialDataFetch: function() {
		if(this.jobId != ''){
			this.result = Workflow.getJobStatus(this.jobId);
			this.progressReport = new Ab.paginate.ProgressReport(this.reportProgressPanel, this.result, "6");
			this.progressReport.setFooterMsgForSingleJob();
			this.progressReport.updateButtonValue(0, this.result);
        }

        this.reportProgressPanel.gridRows.each(function(row) {
            row.actions.get(0).button.addClass('mainAction');
        });
	},
	
	startTaskJob: function() {
		
		var jobId = '';
		
		switch(this.paramNum){
			case 0:
				jobId = Workflow.startJob(this.ruleId);
				break;
			case 1:
				jobId = Workflow.startJob(this.ruleId, this.params[0]);
				break;
			case 2:
				jobId = Workflow.startJob(this.ruleId, this.params[0], this.params[1]);
				break;
			case 3:
				jobId = Workflow.startJob(this.ruleId, this.params[0], this.params[1], this.params[2]);
				break;
			case 4:
				jobId = Workflow.startJob(this.ruleId, this.params[0], this.params[1], this.params[2], this.params[3]);
				break;
			case 5:
				jobId = Workflow.startJob(this.ruleId, this.params[0], this.params[1], this.params[2], this.params[3], this.params[4]);
				break;
			case 6:
				jobId = Workflow.startJob(this.ruleId, this.params[0], this.params[1], this.params[2], this.params[3], this.params[4], this.params[5]);
				break;
			case 7:
				jobId = Workflow.startJob(this.ruleId, this.params[0], this.params[1], this.params[2], this.params[3], this.params[4], this.params[5], this.params[6]);
				break;
			case 8:
				jobId = Workflow.startJob(this.ruleId, this.params[0], this.params[1], this.params[2], this.params[3], this.params[4], this.params[5], this.params[6], this.params[7]);
				break;
			case 9:
				jobId = Workflow.startJob(this.ruleId, this.params[0], this.params[1], this.params[2], this.params[3], this.params[4], this.params[5], this.params[6], this.params[7], this.params[8]);
				break;
			case 10:
				jobId = Workflow.startJob(this.ruleId, this.params[0], this.params[1], this.params[2], this.params[3], this.params[4], this.params[5], this.params[6], this.params[7], this.params[8], this.params[9]);
				break;
		}
										
		this.result = Workflow.getJobStatus(jobId);
		
		this.progressReport = new Ab.paginate.ProgressReport(this.reportProgressPanel, this.result, "6");
		this.progressReport.setFooterMsgForSingleJob();
			
		var controller = this;
		this.startReportTask(controller);
		
	},
	
	// start auto-refresh background task using Ext.util.TaskRunner
	startReportTask: function(controller){
		this.reportTask = {
				run: function(){
				
					if(typeof controller.result != 'undefined'){
						controller.result = Workflow.getJobStatus(controller.result.jobId);
						controller.progressReport.refresh(controller.result);
						
						// if job completed, stop the task
						if(controller.result.jobFinished == true){
							// stop the task runner
							controller.reportTaskRunner.stop(controller.reportTask);
							
							//display the view
							if (valueExistsNotEmpty(controller.resultView)) {
								View.loadView(controller.resultView);
							}
						}
					}
				},
				interval: 1000 * controller.autoRefreshInterval
			}
		this.reportTaskRunner = new Ext.util.TaskRunner();
		this.reportTaskRunner.start(this.reportTask);
	},
	
	getURLParams: function(){
	
		var strHref = window.location.href;
  		
  		//find out if there are any 
  		if ( strHref.indexOf("?") > -1 ){
    		var strQueryString = strHref.substr(strHref.indexOf("?")+1);
    		var aQueryString = strQueryString.split("&");
    		for ( var iParam = 0; iParam < aQueryString.length; iParam++ ){
     			if (aQueryString[iParam].indexOf("=") > -1 ){
        			var aParam = aQueryString[iParam].split("=");
        			
        			if(aParam[0].toLowerCase() == String('ruleId').toLowerCase()){
        				this.ruleId = unescape(aParam[1]);
        			} else if(aParam[0].toLowerCase() == String('viewName').toLowerCase()){
        				//single job should not contain any view name
        				//this.viewName = unescape(aParam[1]);
        			} else if(aParam[0].toLowerCase() == String('jobId').toLowerCase()){
        				this.jobId = unescape(aParam[1]);
        			} else {
        				this.params.push(unescape(aParam[1]));
        				this.paramNum ++;
					}
        		}
      		}
    	}
	}
	
});


function onProgressButtonClick(e){
	
	var controller = View.controllers.get('mySingleJobReportController');

	var progressButton = document.getElementById(e.grid.getParentElementId() + "_row0_progressButton");
	
	// if job is running, we can only stop it
	if( typeof(controller.reportTask) != 'undefined' && controller.reportTask!=null){
			
		// if the job has not yet complete, then user want to stop the job
		if(controller.result.jobFinished == false){
			controller.result = Workflow.stopJob(controller.result.jobId);
		} else {
			// get the result and update progress bar
			controller.result = Workflow.getJobStatus(controller.result.jobId);
		}

		controller.progressReport.updateButtonValue(0, controller.result);

		// stop the task runner
		controller.reportTaskRunner.stop(controller.reportTask);

	} else {
		// if job has not run, start job
		controller.startTaskJob();
		progressButton.value = controller.progressReport.PROGRESS_STOP_JOB;
	}
}
	



