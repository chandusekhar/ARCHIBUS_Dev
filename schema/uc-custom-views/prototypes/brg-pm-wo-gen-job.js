/**
 * Based on Single Job Report Controller  from Ying Qin
 *  
 * By : 	Zhang Yi
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
	
	/**
	 * After view loads set up the top panel's localized labels and profile values
	 * Set up the listener -- and localize the values -- for the locale select control in the form
	 */
	afterViewLoad: function() {
 		
 		this.reportProgressPanel.sortEnabled = false;
		
		this.getURLParams();
		
	},
	
	afterInitialDataFetch: function() {
		if(this.jobId != ''){
			this.result = Workflow.getJobStatus(this.jobId);
			this.progressReport = new Ab.paginate.ProgressReport(this.reportProgressPanel, this.result, "6");

			var controller = this;
			this.startReportTask(controller);
		}
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
							var dataRows = Ext.query('.dataRow',  controller.reportProgressPanel.tableBodyElement);
							var row = dataRows[0];
							if(!mozillaFireFoxBrowser){
								row = dataRows[0];
							}
							// test column name & value to see if row should be set as a link
							for (var j = 0; j < controller.reportProgressPanel.columns.length ; j++) {
								if (controller.reportProgressPanel.columns[j].id == 'afm_tbls.result_view' && typeof(row) != 'undefined') {
										row.childNodes[j].innerHTML = '<a href="' + controller.result.jobFile.url + '" target="_blank"/>' + row.childNodes[j].innerHTML + '</a>';
								}
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

	} 
}
	



