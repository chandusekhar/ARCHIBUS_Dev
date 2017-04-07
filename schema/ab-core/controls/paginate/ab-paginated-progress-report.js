/*
 * AFM Custom Progress Report class
 * 
 * In V.20.1, use the new Ab.paginate.ProgressPanel component in applications.
 * See the ab-products/solutions/programming/progress/ab-ex-progress-panel.axvw example. 
 */

Ab.namespace('paginate');

Ab.paginate.ProgressReport = Ab.paginate.BaseReport.extend({	

	pBars: null,
    
    progressColSpan: '5',
    
    footerMsg: '',
    
   	constructor: function(panel, result, progressColSpan) {
  		
  		this.inherit(panel, result);
  
  		this.progressColSpan = progressColSpan;
  
  		this.footerMsg = this.PROCESS_LEAVEWINDOW_MESSAGE;
  		
		this.pBars = new Array();
		
		//we will only add header once
		this.processHeader();	
		
		//only add the job header for a list of jobs
		if(this.result!= null && typeof(this.result.jobId) == 'undefined'){
			this.addHeaderInstruction();
		}
		
		if(result != null){
			this.addDataRows();
		} 	
	 	
		// KB 3026447: Attach event listener that will be called if the window is resized.
		Ext.EventManager.onWindowResize(this.onWindowResize, this);
   },
   
   setFooterMsgForSingleJob:function(){
   
   		this.footerMsg = this.PROCESS_LEAVEJOB_MESSAGE;

  		this.removeFooter();
		this.addFooter(this.progressColSpan+1,  Ab.view.View.getLocalizedString(this.footerMsg));
   },
   
   refresh: function(result){
   
		this.result = result;

		this.removeDataRows();

   		this.addDataRows();
   },
   
   /**
    * Sets result links.
    */
   setResultViewLink: function(){
		var dataRows = Ext.query('.dataRow',  this.panel.tableBodyElement);
		var row = dataRows[0];			
		// test column name & value to see if row should be set as a link
		for (var j = 0; j < this.panel.columns.length ; j++) {
			if (this.panel.columns[j].id == 'afm_tbls.result_view') {
				var docFile = row.childNodes[j].innerHTML;
				if( this.result.jobFile.url.lastIndexOf(".pdf") > 0){
					//open PDF in a new tab
					row.childNodes[j].innerHTML = '<a class="prominent" onclick="window.open(\'' + this.result.jobFile.url + '\')" />' + docFile + '</a>';
				}else{
					row.childNodes[j].innerHTML = '<a class="prominent" href="' + this.result.jobFile.url + '" />' + docFile + '</a>';
				}	
			}
		}
},


	/** this function process all the headers in the table and replace the special characters as needed
	*   this is mainly used to force the return line chars  <br/> in the title
	*/ 
	processHeader: function(){

		var headerRows = this.panel.headerRows;
	   	if (headerRows.length > 0) {
			//?? does not seem to work!
			headerRows[0].vAlign = "top";
		   
		    // loop through each of the header cell
			for (var i=0; i < headerRows[0].childNodes.length; i++) {
			
				// retain the cell value
				var cellTitle = headerRows[0].childNodes[i].innerHTML;
				
				// clear the cell value
				headerRows[0].childNodes[i].innerHTML = "";
			    
			    // add a <span> object so that all the styles to the title can be applied
			    var spanCell = document.createElement("span");
			    headerRows[0].childNodes[i].appendChild(spanCell);

				// replace the special chars
			    this.replaceSpecialChars(spanCell, cellTitle, true);
			}
		}
	},

   	// remove all the table rows from the table	
	removeDataRows: function(){

		var dataRows = this.panel.rows;
		
		if(dataRows==null){
			return;
		}

		// remove the progress table content
		if(dataRows.length > 0){
		    this.panel.removeRows(0);
			this.panel.clear();
		}
	},
   
	addDataRows: function(){

		// table body object to hold all the data rows
		var oTBody = this.panel.tableBodyElement;
		
		if(oTBody==null){
			return;
		}
		
		// this is used to record the total number of data rows
		var resultSize = 0;
		
		if(typeof(this.result.jobId) == 'undefined'){
			// loop through the WFR result and add all the data rows first, 
			// get the total number of the data rows to add
			for(var dataIndex in this.result){
				resultSize++;
			}
			
			// add the data row
			for(var index = 0;  index < resultSize; index++){		
				this.addDataRow(this.result[index]);
			}	
		} else {
			this.addDataRow(this.result);
			resultSize++;
		}

		// add the progress bars, note we need to add the progress bar from the bottom to the top
		// in order to keep the child node index consistent
		var dataResult = null;
		for(var index = resultSize-1; index >=0; index--){
			dataResult = this.getValidDataResult(index, this.result);
			if(index<resultSize-1){
				// for the non-last record, we will insert the progress bar before the next data
			    this.insertProgressBar(index, dataResult.jobId, oTBody.childNodes[index+1]);
			} else {
			    // for the last record, append the progress bar
			    this.insertProgressBar(index, dataResult.jobId);
			}
		    this.updateButtonValue(index, this.result);
		}
		
		if(resultSize>0){
			this.removeFooter();
			this.addFooter(this.progressColSpan+1,  Ab.view.View.getLocalizedString(this.footerMsg));
		}
	},
	
	addDataRow: function(dataRow){
		var record = new Ab.data.Record({
							'afm_tbls.job_name':dataRow.jobFile.title,
							'afm_tbls.result_view': dataRow.jobFile.name,
							'afm_tbls.pct_complete': dataRow.jobPercentComplete,
							'afm_tbls.eclapsed_time':dataRow.jobElapsedTime,
							'afm_tbls.est_time_remain':dataRow.jobEstimatedTimeRemaining},true);
		
		this.panel.addGridRow(record);
		this.panel.update();
	},
	
	addHeaderInstruction: function(){
		var oPanel = this.panel.parentElement;
		var oTable = this.panel.divHeadElement;
		var oNewTable = this.insertChild(oPanel, "table", {"class":"panelReport"}, null, oTable);
		var oTr = this.insertChild(oNewTable, "tr");
		var oTd = this.insertChild(oTr, "td", {"class":"instruction"}, "<i>" + Ab.view.View.getLocalizedString(this.PROGRESS_LEAVE_RETURN) + "</i>");
		if(oTd!=null){
			oTd.colSpan = this.progressColSpan;
		}
		oTr = this.insertChild(oNewTable, "tr");
		oTd = this.insertChild(oTr, "td", {"class":"instruction"}, "<i>" + Ab.view.View.getLocalizedString(this.PROGRESS_ALLRESULT_REMAIN) + "</i>");
		if(oTd!=null){
			oTd.colSpan = this.progressColSpan;
		}
		
	},
		
	// internal helper function to replace the < and >
	replaceSpecialChars: function(elem, text, replace){
		if(replace){
			text = text.replace(/&lt;/g, "<");
			text = text.replace(/&gt;/g, ">");
		}
		elem.innerHTML = text;   
	},
	
	insertProgressBar: function(index, jobId, oTrAfter) {
		
		var oTBody = this.panel.tableBodyElement;
			
		var oTr = null;
		
		if(index % 2 == 0){
			oTr = this.insertChild(oTBody, "tr", {"class":"dataRow"}, null, oTrAfter);
		} else {
			oTr = this.insertChild(oTBody, "tr", {"class":"dataRow odd"}, null, oTrAfter);
		}
		
		var oTd = this.insertChild(oTr, "td", {"id":"pb_" + jobId, "class":"text",align:"center"} );
		if(oTd!=null){
			oTd.colSpan = this.progressColSpan;
		}

		
		var oDiv = this.insertChild(oTd, "div", {id:jobId+"_div"});
			
		var progressDiv = document.getElementById(jobId);
		
		var progressBar = new Ext.ProgressBar({text:this.PROGRESSBAR_READY,
			          id:jobId+ "_bar_div",
        			  cls:'x-progress-wrap',
        			  width: '70%',
        			  renderTo:jobId+"_div"
    				});
    				
		this.pBars[index] = progressBar;
			
	},
		
	updateButtonValue: function(index, result) {
		var dataResult = this.getValidDataResult(index, result);
		var jobPercentNum = parseInt(dataResult.jobPercentComplete);
		
		var statusText = dataResult.jobStatusMessage;

		if (valueExistsNotEmpty(dataResult.jobMessage)) {
			statusText = statusText + ' - ' + dataResult.jobMessage; 
		}
		
		var pBar = this.pBars[index]; 
		pBar.updateProgress(jobPercentNum/100, statusText);

		// KB 3026447: fix Ext.JS 2.0.2 bug. 
		// The progress bar area width is not in sync with the progress border width. 
		if (jobPercentNum == 100) {
	        var w = Math.floor(1.0 * pBar.el.parent().dom.offsetWidth);
	        pBar.progressBar.setWidth(w);
		}

		var progressButton = document.getElementById(this.panel.id + "_row" + index + "_progressButton");
        if (progressButton) {		
			progressButton.value = Ab.view.View.getLocalizedString(this.PROGRESS_STOP_JOB);
			
			// user can only stop the job when the job status is "Job Started"
			if(dataResult.jobStatusCode==2){
				progressButton.disabled = false;
			} else {
				progressButton.disabled = true;
			}
        }
	},
	
	onWindowResize: function() {
		this.refresh(this.result);
		
		if(this.result.jobFinished){
			this.setResultViewLink();
		}
	},

	// ----------------------- constants -----------------------------------------------------------
	   
	 // @begin_translatable
	PROGRESSBAR_READY: 'Ready',
	PROCESS_LEAVEWINDOW_MESSAGE: "If you leave this window, your report will continue generating. You can access it later from Web Central's <b>My Jobs</b> view.",
	PROCESS_LEAVEJOB_MESSAGE: "If you leave this window, your job will continue running. You can access it later from Web Central's <b>My Jobs</b> view.",
	PROGRESS_STOP_JOB:  'Stop Job',
	PROGRESS_LEAVE_RETURN: 'You can leave this view and return using the <b>My Jobs</b> selection in the main menu bar',
	PROGRESS_ALLRESULT_REMAIN: 'All jobs will continue and all job results will remain until you remove them or until you end your Web Central session.'
	// @end_translatable

});

/**
 * Wrapper for the grid panel that displays the progress bar.
 */
Ab.paginate.ProgressPanel = Base.extend({
	
	// view panel that displays the progress report
	panel: '',
	
    // job ID
    jobId: '',
    
    // current job status
    status: null,
    
    // background task that refreshes the UI while the job is running
    progressTask: null,
    
    // task runner for that background task
    progressTaskRunner: null,
    
    // progress refresh interval in seconds
    progressRefreshInterval: 5,
    
    // Ab.paginate.ProgressReport instance
    progressReport: null,
    
    // custom application function to call when the job status is updated
    onJobStatusUpdated: null,
    
    // custom application function to call when the job is finished
    afterJobFinished: null,
    
    // the Start/Stop Job button in the first grid row 
    jobButton: null,

    /**
     * Constructor.
     */
    constructor: function(panel, afterJobFinished, onJobStatusUpdated) {
	    this.panel = panel;
	    this.panel.sortEnabled = false;
	    
	    if (valueExists(afterJobFinished)) {
	    	this.afterJobFinished = afterJobFinished;
	    }
	    
	    if (valueExists(onJobStatusUpdated)) {
	    	this.onJobStatusUpdated = onJobStatusUpdated;
	    }
	    
	    this.jobButton = $(this.panel.getParentElementId() + "_row0_progressButton"); 
    },
    
    /**
     * Called by the application code after the job has been started.
     */
    onJobStarted: function(jobId) {
    	// store the job ID
    	this.jobId = jobId;
        this.status = Workflow.getJobStatus(this.jobId);
        
        // create the progress bar based on the grid panel
        if (this.progressReport == null) {
            this.progressReport = new Ab.paginate.ProgressReport(this.panel, this.status, "6");
        }
        
        // start the background progress update task
        this.startProgressTask();
        
        // change the button title to Stop Job
        if (this.jobButton) {
            this.jobButton.value = this.progressReport.PROGRESS_STOP_JOB;
        }
    },
    
    /**
     * Starts the progress refresh background task using Ext.util.TaskRunner.
     */
    startProgressTask: function() {
    	var controller = this;
        this.progressTask = {
            run: function() {
        	    // get the job status and refresh the UI
                controller.status = Workflow.getJobStatus(controller.jobId);
                controller.progressReport.refresh(controller.status);

                // if the onJobStatusUpdated is defined, call it
                if (controller.onJobStatusUpdated) {
                	controller.onJobStatusUpdated(controller.status);
                }
                
                // if the job has completed, stop the task
                if (controller.status.jobFinished) {
                    controller.progressTaskRunner.stop(controller.progressTask);

                    // if the afterJobFinished is defined, call it
                    if (controller.afterJobFinished) {
                    	controller.afterJobFinished(controller.status);
                    }
                }
            },
            interval: 1000 * controller.progressRefreshInterval
        }
        this.progressTaskRunner = new Ext.util.TaskRunner();
        this.progressTaskRunner.start(this.progressTask);
    },
    
    /**
     * Stops the job and updates the UI.
     */
    stopJob: function() {
    	// stop the server job
        Workflow.stopJob(this.jobId);
        
        // stop the task runner
        this.progressTaskRunner.stop(this.progressTask);
        
        // get the result and update the progress bar
        var status = Workflow.getJobStatus(this.jobId);
        this.progressReport.refresh(status);

        // disable the Stop Job button
        if (this.jobButton) {
            this.jobButton.disabled = true;
        }
    },
    
    /**
     * Returns true if the job has been started.
     */
    isJobStarted: function() {
    	return valueExists(this.status);
    },
    
    /**
     * Returns true if the job has been finished.
     */
    isJobFinished: function() {
    	return valueExists(this.status) && this.status.jobFinished;
    },
    
    /**
     * Clears the last job status.
     */
    clear: function() {
    	this.jobId = null;
    	this.status = null;

    	if (this.jobButton) {
	        // change the button title to Start Job
	        this.jobButton.value = this.PROGRESS_START_JOB;
	        
	        // enable the Stop Job button
	        this.jobButton.disabled = false;
    	}
    },
    
    /**
     * Private: returns the Start Job / Stop Job button.
     */
    getJobButton: function() {
    	return $(this.panel.getParentElementId() + "_row0_progressButton");    
    },
    
	// ----------------------- constants -----------------------------------------------------------
	   
	 // @begin_translatable
	PROGRESS_START_JOB:  'Start Job'
	// @end_translatable
});

