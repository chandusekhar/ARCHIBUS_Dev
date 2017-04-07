var packagerController = View.createController('appUpdPackageJob',{
	jobId: '',
	progressPanelWrapper:null,
	progressReport: null,	
	resultsReport: null,		
	result: null,	
	autoRefreshInterval: 2,
	reportTaskRunner: null,	
	showResult: false,
	resultView: '',
	reportTask:null,
	jobName:null,
	
	afterInitialDataFetch:function(){
		this.reportProgressPanel.removeSorting();
	},
	
	afterStartJob: function(){
		this.progressReport = new Ab.paginate.ProgressReport(this.reportProgressPanel, this.result, "8");
		this.result = Workflow.getJobStatus(this.jobId);
		this.resultsReport = new Ab.paginate.ResultsReport(this.reportResultsPanel, this.result);
		this.updateResultPanelWindow(this.result);
		this.startReportTask(this);
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
								//var progressButton = document.getElementById(controller.reportProgressPanel.id + "_row0_progressButton");
								//progressButton.disabled = false;		
								controller.progressReport.updateButtonValue(0, controller.result)
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

	updateResultPanelWindow: function(result){		
		if(result.jobPartialResults.length > 0) {
	         this.view.getLayoutManager('mainLayout').expandRegion('south');
		} else {
             this.view.getLayoutManager('mainLayout').collapseRegion('south');
		}
	},
	
	reportProgressPanel_onProgressButton: function(){
		// if job is running, we can only stop it
		if( typeof(this.reportTask) != 'undefined' && this.reportTask!=null){
			this.result = Workflow.stopJob(this.result.jobId);		
			// stop the task runner
			this.reportTaskRunner.stop(this.reportTask);		
			this.progressReport.updateButtonValue(0, this.result);
		}else{
			View.confirm(getMessage('confirm_message'),function(button){
				if(button == 'yes'){
					startJob();
				}else{
					return;
				}
			});
		}
	}
});

function startJob(){
		switch(packagerController.jobName){
			case 'packageData':
				AppUpdateWizardService.packageData({
					callback: function(jobId) {
						packagerController.jobId=jobId;
						packagerController.afterStartJob();
					},
					errorHandler: function(m, e) {
						Ab.view.View.showException(e);
					}
				});break;
			case 'packageExtensions':
				AppUpdateWizardService.packageExtensions({
					callback: function(jobId) {
						packagerController.jobId=jobId;
						packagerController.afterStartJob();
					},
					errorHandler: function(m, e) {
						Ab.view.View.showException(e);
					}
				});break;
			case 'packageDeployment':
				if(checkExistance()){
					AppUpdateWizardService.packageDeployment(false, {
					        callback: function(jobId) {
								packagerController.jobId=jobId;
								packagerController.afterStartJob();
					        },
					        errorHandler: function(m, e) {
					            Ab.view.View.showException(e);
					        }
				    	});
					}
				break;
			default:break;
		}
}

/**
 * Sets the job to run as a global variable.
 * @param jobName name of the job
 */
function onProgressButtonClick(jobName){
	packagerController.jobName = jobName;
}

/**
 * Checks if archibus.war exists.
 */
function checkExistance(){
	var exists = false;
	AppUpdateWizardService.isFileExists('archibus.war', {
        callback: function(fileExists) {
        	if (!fileExists){
        		View.showMessage(getMessage('arch_file_missing_message'));
        		return;
        	}
    		exists = true;
        },
        errorHandler: function(m, e) {
            Ab.view.View.showException(e);
        }
    });
	return exists;
}
