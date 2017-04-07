/**
 * My Paginated Report Controller 
 *  
 * Author: 	Ying Qin
 * Date:	Feb 2009
 *
 */
var controller = View.createController('myJobsController', {
	
	progressReport: null,
	
	result: null,
	
	autoRefreshInterval: 5,
	reportTask: null,
	reportTaskRunner: null,
	
	/**
	 * After view loads set up the top panel's localized labels and profile values
	 * Set up the listener -- and localize the values -- for the locale select control in the form
	 */
	afterViewLoad: function() {
 		
 		this.reportProgressPanel.sortEnabled = false;
 		
 		this.reportProgressBar = new Array();
 		
	},
	
	afterInitialDataFetch: function() {
		
		this.result = Workflow.getJobStatusesForUser();
		
		this.progressReport = new Ab.paginate.ProgressReport(this.reportProgressPanel, this.result, "6");
		
		// start auto-refresh background task using Ext.util.TaskRunner
		var controller = this;
		this.startReportTask(controller);
	},
	
	setResultViewLink: function(index){
	
			var dataRows = Ext.query('.dataRow',  this.reportProgressPanel.tableBodyElement);
			var row = dataRows[index*2];

			// fix for kb# 3051039 - do not reassign since the even rows are always progress meters.
			//if(!mozillaFireFoxBrowser && !microsoftIEBrowser){
			//	row = dataRows[index];
			//}
			
			// test column name & value to see if row should be set as a link
			for (var j = 0; j < this.reportProgressPanel.columns.length ; j++) {
				if (this.reportProgressPanel.columns[j].id == 'afm_tbls.result_view' && typeof(row) != 'undefined') {
						row.childNodes[j].innerHTML = '<a href="' + this.result[index].jobFile.url + '" target="_blank"/>' + row.childNodes[j].innerHTML + '</a>';
				}
			}
	},
	
	startReportTask: function(controller){
		this.reportTask = {
				run: function(){
					controller.result = Workflow.getJobStatusesForUser();
					controller.progressReport.refresh(controller.result);
					for(var index in controller.result){
						// if job completed, stop the task
						if(controller.result[index].jobFinished == true){
							controller.setResultViewLink(index);
					    }
					}
				},
				interval: 1000 * controller.autoRefreshInterval
			}
		this.reportTaskRunner = new Ext.util.TaskRunner();
		this.reportTaskRunner.start(this.reportTask);
	}
});




function onProgressButtonClick(e){
	
	var	controller = View.controllers.get('myJobsController');
	var index = e.index;
	
	// if job is running, we can only stop it
	if( typeof(controller.reportTask) != 'undefined' && controller.reportTask!=null){
		
		var result = Workflow.stopJob(controller.result[index].jobId);
		
	
		// get the report status again
		controller.result = Workflow.getJobStatusesForUser();
		controller.progressReport.updateButtonValue(index, controller.result);
	} 
}