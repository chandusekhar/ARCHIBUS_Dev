/**
 * Based on Single Job Report Controller  from Ying Qin
 *  
 * By : 	Zhang Yi
 *
 */
var controller = View.createController('mySingleJobReportController', {
	
	progressReport: null,
	
	result: null,
	
	autoRefreshInterval: 2,
	reportTask: null,
	reportTaskRunner: null,
	
	jobId: '',
		
	afterInitialDataFetch: function() {
 		this.reportProgressPanel.sortEnabled = false;
		
        var tabs = View.parentTab.parentPanel;
		if (tabs.jobId)
			this.jobId = tabs.jobId; 

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
									row.childNodes[j].innerHTML = '<a href="javascript:showResultTab()">' + row.childNodes[j].innerHTML + '</a>';
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
		
	reportProgressPanel_onBack: function(){
        View.parentTab.parentPanel.selectTab(View.parentTab.parentPanel.tabs[1].name, null, false, false, true);
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
	
function showResultTab(){
	var controller = View.controllers.get('mySingleJobReportController');
	var properties	= 	 controller.result.jobProperties;

	var tabs = View.parentTab.parentPanel;
	tabs.startWo =properties['startWo'];
	tabs.endWo =properties['endWo'];																												
	tabs.pmType =properties['pmType'];

	tabs.selectTab("result_tab");
}




