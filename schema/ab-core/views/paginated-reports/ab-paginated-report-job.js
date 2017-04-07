/**
 * My Paginated Report Controller 
 *  
 * Author: 	Ying Qin
 * Date:	Feb 2009
 *
 */
var controller = View.createController('myPaginatedReportController', {	
	progressReport: null,	
	resultsReport: null,		
	result: null,	
	autoRefreshInterval: 2,
	reportTask: null,
	reportTaskRunner: null,	
	viewName: '',
	ruleId: 'AbSystemAdministration-generatePaginatedReport-buildDocxFromView',
	showResult: false,
	resultView: '',
	jobId: '',
	
	/**
	 * After view loads set up the top panel's localized labels and profile values
	 * Set up the listener -- and localize the values -- for the locale select control in the form
	 */
	afterViewLoad: function() {
 		this.reportProgressPanel.sortEnabled = false;
		this.reportResultsPanel.sortEnabled = false;	
		this.restriction = new Ab.view.Restriction();
		this.getURLParams();	
	},
	
	afterInitialDataFetch: function() {
        this.view.getLayoutManager('mainLayout').collapseRegion('south');
        if(this.jobId == ''){
    		var dialogParentObj =  View.getView('parent');
    		if(valueExists(dialogParentObj) && valueExistsNotEmpty(dialogParentObj.dialogRestriction)){
    			//XXX: {dataSourceId1: Ab.view.Restriction, dataSourceId2: Ab.view.Restriction}
    			this.restriction = dialogParentObj.dialogRestriction;
        	}else{
        		//XXX: since there is no way to know it, wrap it as followings:
        		this.restriction = {'': this.restriction};
        	}
    		var parameters = null;
    		if(valueExists(dialogParentObj) && valueExistsNotEmpty(dialogParentObj.dialogParameters)){
    			//XXX: {parameterName1: value, parameterName1: value ...}
    			parameters = dialogParentObj.dialogParameters;
        	}
    		//XXX: don't change parameters' order (last one is the specified docx file name)
        	this.jobId = Workflow.startJob(this.ruleId, this.viewName, this.restriction, parameters, null);
        }
				
		this.result = Workflow.getJobStatus(this.jobId);		
		this.progressReport = new Ab.paginate.ProgressReport(this.reportProgressPanel, this.result, "8");
		this.resultsReport = new Ab.paginate.ResultsReport(this.reportResultsPanel, this.result);
		this.updateResultPanelWindow(this.result);
		this.startReportTask(this);
	},

	updateResultPanelWindow: function(result){		
		var layout = this.view.getLayoutManager('mainLayout');
        if(result.jobPartialResults.length > 0) {
	         layout.expandRegion('south');
	         //KB# 3046871
	         layout.setRegionSize("south", 100 * (result.jobPartialResults.length+1));
		} else {
	         layout.collapseRegion('south');
		}
	},

	// start auto-refresh background task using Ext.util.TaskRunner
	startReportTask: function(controller){
		this.reportTask = {
				run: function(){
					if(typeof controller.result != 'undefined'){
						controller.result = Workflow.getJobStatus(controller.result.jobId);
						controller.updateResultPanelWindow(controller.result);
						controller.progressReport.refresh(controller.result);
						controller.resultsReport.refresh(controller.result);	
						//if job failed
						if(controller.result.jobStatusCode == 8){
							// stop the task runner
							controller.reportTaskRunner.stop(controller.reportTask);
							View.showMessage('error', View.getLocalizedString(controller.result.jobMessage));
						} else if(controller.result.jobStatusCode == 6 || controller.result.jobStatusCode == 7){
							// if job stopped or terminated, stop the task runner
							controller.reportTaskRunner.stop(controller.reportTask);
						} else if(controller.result.jobFinished == true){
								// if job completed, stop the task runner
								controller.reportTaskRunner.stop(controller.reportTask);								
								controller.progressReport.setResultViewLink()
								var progressButton = document.getElementById(controller.reportProgressPanel.id + "_row0_progressButton");
								progressButton.disabled = true;								
								//display the view
								controller.resultView = controller.result.jobFile.url;								
								//display the view
								if (controller.showResult && valueExistsNotEmpty(controller.resultView)) {
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
		var parameters = window.location.parameters;
	    if (valueExists(parameters)) {
	        for (var name in parameters) {
	        	 var value = parameters[name];
	        	 if(name.toLowerCase() == 'viewname'){
	 				this.viewName = value;
	 			} else if(name.toLowerCase() == 'ruleid'){
	 				this.ruleId = value;
	 			} else if(name.toLowerCase() == 'jobid'){
	 				this.jobId = value;
	 			} else if(name.toLowerCase() == 'showresult'){
	 				this.showResult = value;
	 			} else{
	 				this.restriction.addClause(name, value, '=');
	 			}
	        }
	    }
	}
});

function onProgressButtonClick(e){	
	var controller = View.controllers.get('myPaginatedReportController');	
	var progressButton = document.getElementById(e.grid.getParentElementId() + "_row0_progressButton");
	// if job is running, we can only stop it
	if( typeof(controller.reportTask) != 'undefined' && controller.reportTask!=null){			
		controller.result = Workflow.stopJob(controller.result.jobId);		
		// stop the task runner
		controller.reportTaskRunner.stop(controller.reportTask);		
		controller.progressReport.updateButtonValue(0, controller.result);
	}
}
	



