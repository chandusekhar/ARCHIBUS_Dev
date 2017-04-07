var recreateStructuresController = View.createController('recreateStructures_ctrl', {
	refreshInterval: 1,
	intervalID: null,
	progressPanelWrapper:null,
	jobId:null,
	reportTask:null,
	reportTaskRunner:null,
	
	afterInitialDataFetch:function(){
		this.initializeButtons(true, true, false);
	},
	
	// start auto-refresh the table status grid using Ext.util.TaskRunner
    startRefreshGridTask: function(controller){
        this.reportTask = {
            run: function(){
            	var status = Workflow.getJobStatus(controller.jobId);
            	if(!status.jobFinished){
            		updatePartiaJobStatus(status);
            		controller.initializeButtons(false, false, true);

				} else{
					updatePartiaJobStatus(status);
					controller.reportTaskRunner.stop(controller.reportTask);
				} 
            },
            interval: 1000
        }
        controller.reportTaskRunner = new Ext.util.TaskRunner();
        controller.reportTaskRunner.start(controller.reportTask);
    },

    actionProgressPanel_onBack:function(){
		this.initializeButtons(true, true, false);
		goToFirstTab(View.getOpenerView().controllers.items[0].updSchWizTabs, true);
	},

	actionProgressPanel_onStop:function(){
    	this.reportTaskRunner.stop(this.reportTask);
    	this.progressPanelWrapper.stopJob();
		this.initializeButtons(true, true, false);
	},	

	/**
	 * Action button start.
	 */
	actionProgressPanel_onStart:function(){
    	View.confirm(getMessage('confirm_message'), function (button) {
    	    if (button == 'yes') {
    	    	recreateStructuresController.startJob();
            }
        });
    },
    
    /**
     * Starts the re-create structures job.
     */
	startJob: function(){
 		this.progressPanelWrapper = new Ab.paginate.ProgressPanel(this.reportProgressPanel, this.afterJobFinished.createDelegate(this));
		this.progressPanelWrapper.progressRefreshInterval = this.refreshInterval;
		
		if (!this.progressPanelWrapper.isJobStarted()) {
	
			try {
				SchemaUpdateWizardService.startRecreateStructuresJob(
						{
						callback: function(job_id) {
							recreateStructuresController.afterCallJob(job_id);
		    			},
		    	        errorHandler: function(m, e) {
		    	            View.showException(e);
		    	        }
			});
				
			}catch(e){
				Workflow.handleError(e);
			}
		}else if (!this.progressPanelWrapper.isJobFinished()) {
            // if the job has not yet complete, then the user wants to stop the job
        	this.progressPanelWrapper.stopJob();
    	}
	},
	
	afterCallJob: function(jobId){
		this.jobId = jobId;
		// notify the progress panel
        this.progressPanelWrapper.onJobStarted(this.jobId);
        this.startRefreshGridTask(this);
        this.initializeButtons(false, false, true);
	},
	
	afterJobFinished: function(status) {
		this.reportTaskRunner.stop(this.reportTask);
		updatePartiaJobStatus(status);
		if(status.jobStatusCode == 3){
	    	this.progressPanelWrapper.clear();
		}
		this.initializeButtons(true, true, false);
	},
	
	initializeButtons: function(isBack, isStart, isStop){
		if(isBack){
			this.actionProgressPanel.actions.get('back').forceDisable(false);
		}
		if(isStart){
			this.actionProgressPanel.actions.get('start').forceDisable(false);
		}
		if(isStop){
			this.actionProgressPanel.actions.get('stop').forceDisable(false);
		}
		this.actionProgressPanel.enableButton('back',isBack);
		this.actionProgressPanel.enableButton('start',isBack);
		this.actionProgressPanel.enableButton('stop',isStop);
	}
});

function updatePartiaJobStatus(status){
	var partialJobResultsTable = document.getElementById("partialJobResults");
    var message = "";
	for (var i = 0; i < status.jobPartialResults.length; i++) {
    	message += '&nbsp;&nbsp;&nbsp;&nbsp;' + status.jobPartialResults[i].title + '<br/><br/>';
    }
    partialJobResultsTable.innerHTML = message;
}