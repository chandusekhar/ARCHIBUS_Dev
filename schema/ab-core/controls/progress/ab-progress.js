Ab.namespace('progress');

/**
 * The Column class defines a grid column. 
 */
Ab.progress.Column = Base.extend({
	
	// column ID, i.e.
	id: '',
	
	// localized column name to be displayed
	name: '',
	
	// column type: 'text'|'number'|'time'|'button'|'link'|'percent'
	type: 'text',
	
	// 'restriction' on column types, for checking validity
	supportedTypes: ['text', 'link', 'number', 'time', 'button', 'percent'],
	
	// reference to the event handler for the default user action (i.e. onclick)
	defaultActionHandler: null,
	
	// column span
	colSpan: 1,
    
    //if the field enabled?
    enabled: true,
    
    //the default value
    defaultValue: '',
    	
	/**
	 * Constructor.
	 * @param id   Required.
	 * @param name Required.
	 * @param type Required.
	 */
	constructor: function(id, name, type, colSpan, enabled, defaultValue, defaultActionHandler) {
		this.id = id;
		this.name = name;
		
		// validate given type
		this.type = this.supportedTypes[0];
		for (var i=0; i < this.supportedTypes.length; i++) { 
			if (this.supportedTypes[i] == type) {
				this.type = type;
				break;
			}			
		}

  		if (valueExists(colSpan)) {
		    this.colSpan = colSpan;
		}

  		if (valueExists(enabled)) {
		    this.enabled = enabled;
		}
		
		if (valueExists(defaultValue)) {
		    this.defaultValue = defaultValue;
		}
		
		if (valueExists(defaultActionHandler)) {
			this.defaultActionHandler = defaultActionHandler;
		}
	}
});


/**
 * The Grid class defines a grid component.
 */
Ab.progress.ProgressReport = Ab.view.Component.extend({

	// the job result returned from server
	result: null,

	// if the job will be started after view load
    startJobOnLoad: false,

	jobId: '',

	// parameters passed through client side
	parameters: null,
	
	// if job has errors.
	hasError: false,

	// The following are the variables used in Progress Report.
	// the panel id of the progress report    
    panelId: '',
	
	// progress table id
	tableId: '',
	
	// array of column objects
	columns: null,
	
	// array of row objects
	rows: null,
	
	// name of the CSS class for the table
	cssClassName: 'panelReport',

	// name of the CSS class for the table header
	cssHeaderClassName: '',

    //Progress Report : show column "Report or<br/>Job Name"
    showReportViewName: true,

	//Progress Report : show column "Result View or File"
    showResultFile: true,

    //Progress Report : show column "Progress - Records X of XX"
    showRecordsOfTotal: true,

    //Progress Report : show column "Percent<br/>Completed"
    showPercentCompleted: true,

    //Progress Report : show column "Elapsed<br/>Time"
    showElapsedTime:true,

    //Progress Report : show column "Estimated<br/>Remaining<br/>Time"
    showEstimatedRemainingTime: true,

	showStopJobButton: true,

	// the progress bar
	progressBar: null,
	
	//stop job button
	stopJobButton: null,
	
	// The following are variables used in Result Logs or Partial Results content	

	// show partial results content
	showResults: true,

	// results table id
	resultsTableId: '',

	// title for result table
	resultTitle: '',
	
	//job task parameters
	autoRefreshInterval: 2,
	reportTask: null,
	reportTaskRunner: null,

	/**
	 * Constructor.
	 *
	 * @param configObject 
	 *  id - the div element id that hold the progress report control
	 */
	constructor: function(id, configObject) {
	    this.inherit(id, 'progress', configObject); 
	    
		var showReportViewName = configObject.getConfigParameterIfExists('showReportViewName');
		if (valueExists(showReportViewName)) {
	     	this.showReportViewName = showReportViewName;
		}
	
		var showResultFile = configObject.getConfigParameterIfExists('showResultFile');
		if (valueExists(showResultFile)) {
	     	this.showResultFile = showResultFile;
		}

		var showRecordsOfTotal = configObject.getConfigParameterIfExists('showRecordsOfTotal');
		if (valueExists(showRecordsOfTotal)) {
	     	this.showRecordsOfTotal = showRecordsOfTotal;
		}

		var showPercentCompleted = configObject.getConfigParameterIfExists('showPercentCompleted');
		if (valueExists(showPercentCompleted)) {
	     	this.showPercentCompleted = showPercentCompleted;
		}

		var showElapsedTime = configObject.getConfigParameterIfExists('showElapsedTime');
		if (valueExists(showReportViewName)) {
	     	this.showElapsedTime = showElapsedTime;
		}

		var showEstimatedRemainingTime = configObject.getConfigParameterIfExists('showEstimatedRemainingTime');
		if (valueExists(showEstimatedRemainingTime)) {
	     	this.showEstimatedRemainingTime = showEstimatedRemainingTime;
		}

		var showStopJobButton = configObject.getConfigParameterIfExists('showStopJobButton');
		if (valueExists(showStopJobButton)) {
	     	this.showStopJobButton = showStopJobButton;
		}

		var panelId = configObject.getConfigParameterIfExists('panelId');
		if (valueExists(panelId)) {
			this.panelId = panelId;
		} else {
			this.panelId = id;
		}
		
	    this.rows = [];
	    this.columns = [];
        
		var columns = configObject.getConfigParameterIfExists('columns');
		if (valueExists(columns)) {
			this.addColumns(columns);
		} else {
			this.addDefaultColumns();
		}

		var rows = configObject.getConfigParameterIfExists('rows');
		if (valueExists(rows)) {
			this.addRows(rows);
		} else {
			this.addDefaultRow();
		}
		
		//get the parameters from the client
		this.parameters = View.progressReportParameters;
		if(this.parameters==null){
			this.parameters = View.getView("parent").progressReportParameters;
		}
		
		var resultTitle = configObject.getConfigParameterIfExists('resultTitle');
		if (valueExists(resultTitle )) {
			this.resultTitle = resultTitle;
		} else {
			this.resultTitle = View.getLocalizedString(this.RESULT_TITLE);
		}
		
		var showResults = configObject.getConfigParameterIfExists('showResults');
		if (valueExists(showResults)) {
			this.showResults = showResults;
		}
				
	},

	build: function(){
	
		this.tableId = this.panelId + '_table';
		this.buildProgressReport();
		
		this.resultsTableId = this.panelId + '_results_table';
		if(this.showResults){
			this.buildResults();
		}
	},
		
	// ----------------------- methods to manipulate the progress report structure ----------------------------
    
    addColumn: function(column){
    	this.columns.push(column);
    },
    
    /**
	 * Adds all column objects from the array to the progress list of columns.
	 */ 
	addColumns: function(columns) {
		this.columns = this.columns.concat(columns);
	},
	
	onStopJob: function(controller){
	   
	   if( typeof(controller.reportTask) != 'undefined' && controller.reportTask!=null){			
			
			controller.result = Workflow.stopJob(controller.result.jobId);		
			
			controller.setProgressResults();
			
			// stop the task runner
			controller.reportTaskRunner.stop(controller.reportTask);		
			
			var stopButton = $(controller.tableId + "_defaultJob_stop_job_button");
			stopButton.disbaled = true;
			
		}
	},
	
	updateProgressReport: function() {
	
		var jobPercentNum = parseInt(this.result.jobPercentComplete);
		var statusText = this.result.jobStatusMessage;

		if (valueExistsNotEmpty(this.result.jobMessage)) {
			statusText = statusText + ' - ' + this.result.jobMessage; 
		}

		this.progressBar.updateProgress(jobPercentNum/100, statusText);
		
		// user can only stop the job when the job status is "Job Started"
		if(this.result.jobStatusCode==2){
			this.stopJobButton.disabled = false;
		} else {
			this.stopJobButton.disabled = true;
		}
	},

	setButtonText: function(text){
		if(this.stopJobButton == null){
			this.stopJobButton = $(this.tableId + "_defaultJob_stop_job_button");
		}
		
		this.stopJobButton.value = text;
		
	},
	
	
	addDefaultColumns: function() {
		var columns = [];

		if(this.showReportViewName){
			columns.push(new Ab.progress.Column('view', View.getLocalizedString(this.PROGRESS_HEADER_VIEW), 'text', 1, this.showReportViewName, ''));
		}
		  
	    if(this.showResultFile){
			columns.push(new Ab.progress.Column('url', View.getLocalizedString(this.PROGRESS_HEADER_URL), 'link', 1, this.showResultFile, ''));
		}
		
		if(this.showPercentCompleted){
			columns.push(new Ab.progress.Column('pct', View.getLocalizedString(this.PROGRESS_HEADER_PCT), 'percent', 1, this.showPercentCompleted, '0.0%'));
		}
		
		if(this.showRecordsOfTotal){
			columns.push(new Ab.progress.Column('progress', View.getLocalizedString(this.PROGRESS_HEADER_RECORDS), 'text', 1, this.showRecordsOfTotal, ''));
		}
		
		if(this.showElapsedTime){
			columns.push(new Ab.progress.Column('elapsed_time', View.getLocalizedString(this.PROGRESS_HEADER_ELAPSED_TIME), 'time', 1, this.showElapsedTime, '00:00.00'));
		}
		
		if(this.showEstimatedRemainingTime){
			columns.push(new Ab.progress.Column('est_remain_time', View.getLocalizedString(this.PROGRESS_HEADER_EST_REMAIN_TIME), 'time', 1, this.showEstimatedRemainingTime, '00:00.00'));
		}
		
		if(this.showStopJobButton){
			columns.push(new Ab.progress.Column('stop_job', '', 'button', 1, this.showStopJobButton, 'Stop Job', this.onStopJob));
		}
		
		
		this.addColumns(columns);
	},
		
	
	/**
	 * insert a column object to the progress list of columns at position = index.
	 */
	insertColumn: function(column, columnIndex) {
        this.columns.splice(index, 0, column);
	},
	
	
	/**
	 * Removes column object at specified index.
	 */
	removeColumn: function(columnIndex) {
	    this.columns.splice(columnIndex, 1);
	},

	/**
	 * Adds a row object to the list of rows.
	 */
	addRow: function(row) {
 		this.rows.push(row);
	},
	
	/**
	 * Adds all row objects from the array to the list of rows.
	 */ 
	addRows: function(rows) {
 		this.rows = this.rows.concat(rows);
	},
	
	addDefaultRow: function() {
	   var row = {jobId: "defaultJob"};
	   
	   for (var i = 0; i < this.columns.length; i++) {
	   		var column = this.columns[i];
            row[column.id] = column.defaultValue;
       }
       this.addRows(row);
    },
    
	/**
	 * Removes row object at specified index.
	 */
	removeRow: function(rowIndex) {
	    this.rows.splice(rowIndex, 1);
	},

    /**
     * Removes rows starting with specified index.
     */	
	removeRows: function(rowIndex) {
	    this.rows.splice(rowIndex, this.rows.length - rowIndex);
	},

	/**
	 * Returns the number of generated table columns.
	 */
	getNumberOfColumns: function() {
		var numberOfColumns = 0;
		for (var c = 0; c < this.columns.length; c++) {
			var column = this.columns[c];
			numberOfColumns += column.colSpan;
		}
		return numberOfColumns;
	},
	
	// ----------------------- DOM building methods ------------------------------------------------
	
    /**
     * Removes the HTML content. Assumes that the progress <table> element 
     * is the first <table> child of the parent element with an ID = 'progress_' parentElement.id.
     */
    clear: function(tableId) {
        
		if (null == this.parentElement) {
			return false;
		}
		
        var table = document.getElementById(tableId);
        if (table != null) {
            this.parentElement.removeChild(table);
        }

		// remove the spacer bar in the title area
		var header = document.getElementById(this.panelId + "_head");
		if(header!=null){
			var childNode=header.firstChild;
			var nextChildNode = childNode.nextSibling;
			while (nextChildNode)
  			{
  				header.removeChild(nextChildNode);
  				nextChildNode = childNode.nextSibling;
  			}
		}
    },
	
	/**
	 * Creates HTML DOM treee containing progress <table> element and its children.
	 */
	buildProgressReport: function() {
        this.clear(this.tableId);
	    
		var table = document.createElement('table');
		table.id = this.tableId;
		table.className = this.cssClassName;
				
		// create proress header row
		var thead = document.createElement('thead');
		this.createHeaderRow(thead, this.columns);
		table.appendChild(thead);
		
		// create progress data rows
		var tbody = document.createElement('tbody');
		this.createDataRows(tbody, this.columns);		
		table.appendChild(tbody);

        this.parentElement.appendChild(table);
        
        this.createProgressBar();
	},
	
	buildResults: function() {
		this.clear(this.resultsTableId);
	    
	    var table = document.createElement('table');
		table.id = this.resultsTableId;
		table.className = this.cssClassName;
  
	},
	
	
	/**
	 * Invoked before the build() method.
	 */
	beforeBuild: function() {},
	
	/**
	 * Invoked after the build() method.
	 */
	afterBuild: function() {},
	
	
	/**
	 * Creates grid header row and adds it to the grid.
	 */
	createHeaderRow: function(parentElement, columns) {
		var headerRow = document.createElement('tr');
		
		
		for (var c = 0; c < columns.length; c++) {
			var column = columns[c];
			
			var headerCell = document.createElement('th');
			headerCell.colSpan = column.colSpan;
			headerCell.id = this.tableId + "_header_" + column.id;
			headerCell.vAlign = 'bottom';
			
			var headerCellSpan = document.createElement('span');
			headerCellSpan.innerHTML = column.name
			headerCell.appendChild(headerCellSpan);
			
			headerRow.appendChild(headerCell);
		}
	    parentElement.appendChild(headerRow);
	},
	
	/**
	 * Creates all data rows and adds them to the grid.
	 */
	createDataRows: function(parentElement, columns) {
	    var numRows = this.rows.length;

		for (var r = 0; r < numRows; r++) {
			var row = this.rows[r];
			row.index = r;
			
			var rowElement = document.createElement('tr');
			rowElement.className = 'dataRow';
		
		    var numColumns = columns.length;
            
            var cellElement; 
			for (var c = 0; c < numColumns; c++) {
				var column = columns[c];

                cellElement = document.createElement('td');
                cellElement.id = this.tableId + "_defaultJob_" + column.id;
                
                // create default cell content
                this.createCellContent(row, column, cellElement);

                rowElement.appendChild(cellElement);
			}
            
            parentElement.appendChild(rowElement);
            
            //create progress bar element
        	rowElement = document.createElement('tr');
			rowElement.className = 'dataRow';
    				
			cellElement = document.createElement('td');
       		cellElement.id = this.tableId + '_defaultJob_progress_bar_td';
			cellElement.className = 'text';
    		cellElement.colSpan = numColumns;
			cellElement.align = 'center';
			
			rowElement.appendChild(cellElement);
    		parentElement.appendChild(rowElement);
		}
		
		
	},
	
	createProgressBar: function(){
    	
    	var td = $(this.tableId + '_defaultJob_progress_bar_td');	
		
		// append progress div to td	
		var div = document.createElement('div');
		div.setAttribute('id',this.tableId + '_defaultJob_progress_div');
		td.appendChild(div);

		
	    this.progressBar = new Ext.ProgressBar({text:View.getLocalizedString(this.PROGRESSBAR_READY),
			          id:this.tableId + '_defaultJob_progress_bar_div',
        			  cls:'x-progress-wrap',
        			  width: '70%',
        			  renderTo:this.tableId + '_defaultJob_progress_div'
    				});
    				
		this.progressBar.updateProgress(0);
    
    },
	/**
	 * Helper function to create individual cell content element.
	 */
	createCellContent: function(row, column, cellElement) {
		var content = "";
	    var value = row[column.id];
	    
		if (column.type == 'text' || column.type == 'number' || column.type == 'time' || column.type == 'percent') {

            // handle special characters to make them shown up in both IE and FireFox
            value = value.replace(/>/g, "&gt;");
            value = value.replace(/</g, "&lt;");
			// extended ASCII characters (e.g., &#225; &aacute) must preserver the &, translate only isolated ampersands
            value = value.replace(/ & /g, " &amp; ");
            
            content = value;
			if (column.type == 'number' ||column.type == 'percent') {
			    cellElement.style.textAlign = 'right';
			}
			
		} else if (column.type == 'link') {
		    content = "<a href='javascript: //'>" + value + "</a>";
		    
		} else if (column.type == 'button') {
	        content = "<input type='button' value='" + column.defaultValue+ "' id='" + this.tableId + "_defaultJob_" + column.id + "_button'/>";   
	    } 
        
        cellElement.innerHTML = content;
        
        // register default column event handler
        if (column.defaultActionHandler != null) {
            var fn = column.defaultActionHandler;
            if (!fn.call) {
                 fn.call(window, this);
                
            }
            var delegate = fn.createDelegate(this, [this]);
            Ext.get(cellElement).addListener("click", delegate);
        }
	},
	

	/**
	 * Creates empty link for JS even handler.
	 */
	createLink: function() {
		var link = document.createElement('a');
		link.href = 'javascript: //';
        return link;	    
	},
	
	
	setProgressAndRunTask: function(jobId){
		this.jobId = jobId;
		
		this.result = Workflow.getJobStatus(jobId);
        
        this.setProgressResults();
        
        var controller = this;
        this.startReportTask(this);
    },
    
    setProgressResults: function(){
		if(this.result==null){
			return;
		}
		
		var jobId = 'defaultJob';
				
		for (var c = 0; c < this.columns.length; c++) {
			var column = this.columns[c];
			var elem = $(this.tableId + '_' + jobId + '_' + column.id);

			switch(column.id)
			{
			case 'view':
				if(this.parameters!=null){
					elem.innerHTML = this.parameters.panelTitle;
				}
			  	break;
			case 'url':
				if(this.result.jobFinished){
					elem.innerHTML = '<a href="' + this.result.jobFile.url + '" target="_blank"/>' + this.result.jobFile.name + '</a>';
				} else {
					elem.innerHTML = this.result.jobFile.name;
				}
				break;
			case 'pct':
			  	elem.innerHTML = this.result.jobPercentComplete;
			  	break;
			case 'progress':
	  			elem.innerHTML = View.getLocalizedString(this.RECORD) + ' ' + this.result.jobCurrentNumber + ' ' + View.getLocalizedString(this.OF) + ' ' + this.result.jobTotalNumber;
			  	break;
			case 'elapsed_time':
				if(this.result.jobElapsedTime != undefined)
					elem.innerHTML = this.result.jobElapsedTime;
			  	break;
			case 'est_remain_time':
				if(this.result.jobEstimatedTimeRemaining != undefined)
					elem.innerHTML = this.result.jobEstimatedTimeRemaining;
			  	break;
			}			
		}
		
		this.updateProgressReport();
			
	},
	
	// start auto-refresh background task using Ext.util.TaskRunner
	startReportTask: function(controller){
	        // wait until DWR fetches the script session ID, then proceed to initialDataFetch
        this.reportTaskRunner = new Ext.util.TaskRunner();
        
        controller.clearPartialResults();
        
        this.reportTask = {
            run: function(){
                if (valueExists(dwr.engine._scriptSessionId)) {
                    if(typeof controller.result != 'undefined'){
						
						controller.result = Workflow.getJobStatus(controller.result.jobId);
						
						controller.setProgressResults();
						
						//if job failed
						if(controller.result.jobStatusCode == 8){
						
							controller.hasError = true;
							// stop the task runner
							
							controller.setProgressResults();
							
							//set the result view link
							controller.setResultViewLink();
								
							//set the result logs
							controller.buildResults();
							
							controller.reportTaskRunner.stop(controller.reportTask);
							View.showMessage('error', View.getLocalizedString(controller.result.jobMessage));
								
						} else if(controller.result.jobStatusCode == 6 || controller.result.jobStatusCode == 7){
							// if job stopped or terminated, stop the task runner
							controller.reportTaskRunner.stop(this.reportTask);
						} else if(controller.result.jobFinished == true){
								// if job completed, stop the task runner
								controller.reportTaskRunner.stop(controller.reportTask);
								
								controller.setProgressResults(true);
								
								//set the result view link
								controller.setResultViewLink();
								
								//set the result logs
								controller.showPartialResults();
						}
					}
                }
            },
            interval: 1000 * this.autoRefreshInterval
        }
        this.reportTaskRunner.start(this.reportTask); 
        
	},
	
		/*
	 *  Set the result files links 
	 */
	setResultViewLink: function(){
		
		if(this.result.jobFile.url=="" ||this.result.jobFile.name ==""){
			return;
		}
		
		var elem = $(this.tableId + '_defaultJob_url');
		elem.innerHTML = '<a href="' + this.result.jobFile.url + '" target="_blank"/>' + this.result.jobFile.name + '</a>';
			
	},
	
	/*
	 *  remove the partial result. 
	 */
	clearPartialResults: function(){
		
		this.clear(this.resultsTableId);
	},
	
	/*
	 *  Set the files links to the result logs which will show at the south section of the view
	 */
	showPartialResults: function(){
		
		this.clear(this.resultsTableId);

		// sometimes the error log will display in the partial results
		if(this.parentElement==null){
			return;
		}
		
		if (this.result.jobPartialResults==null || this.result.jobPartialResults.length<1){
			return;
		}
		
		
		var table = document.createElement('table');
		table.id = this.resultsTableId;
		table.className = this.cssClassName;
		this.parentElement.appendChild(table);

		// create results header row
		var thead = document.createElement('thead');
		var headerRow = document.createElement('tr');
				
		var headerCell = document.createElement('th');
		headerCell.colSpan = 2;
		headerCell.vAlign = 'bottom';
		headerCell.innerHTML = this.resultTitle;
		headerRow.appendChild(headerCell);
		thead.appendChild(headerRow);
		table.appendChild(thead);
		
		// create progress data rows
		var tbody = document.createElement('tbody');
		if(this.result.jobPartialResults!=null && this.result.jobPartialResults.length>0){
			for( var i = 0; i < this.result.jobPartialResults.length; i++) {
				var rowElement = document.createElement('tr');
				rowElement.className = 'dataRow';
			
			    var cellElement1 = document.createElement('td');
	            cellElement1.innerHTML = this.result.jobPartialResults[i].title;
	            rowElement.appendChild(cellElement1);
	                
	            var cellElement2 = document.createElement('td');
	            cellElement2.innerHTML = '<a href="' + this.result.jobPartialResults[i].url + '" target="_blank"/>' + this.result.jobPartialResults[i].url + '</a>';;
	            rowElement.appendChild(cellElement2);
	                
				tbody.appendChild(rowElement);
			}
		} else {
			var rowElement = document.createElement('tr');
			rowElement.className = 'dataRow';
			
			var cellElement = document.createElement('td');
	        cellElement.innerHTML = View.getLocalizedString(this.NO_RESULT_TITLE);
	        cellElement.colSpan = 2;
	        cellElement.align = "center";
	        rowElement.appendChild(cellElement);

			tbody.appendChild(rowElement);
		}
		table.appendChild(tbody);
		
	},
	
	// ----------------------- constants -----------------------------------------------------------
	   
	// @begin_translatable
	PROGRESSBAR_READY: 'Ready',
	PROCESS_LEAVEWINDOW_MESSAGE: "If you leave this window, your report will continue generating. You can access it later from Web Central's <b>My Jobs</b> view.",
	RESULT_TITLE: 'Result Log(s)',
	RECORD: 'Record',
	OF: 'of', 
	
	PROGRESS_HEADER_VIEW: 'Report or<br/>Job Name<br/>',
	PROGRESS_HEADER_URL: 'Result View or File<br/><br><i>Link will be enabled when job finishes.</i>',
	PROGRESS_HEADER_PCT: 'Percent<br/>Completed',
	PROGRESS_HEADER_RECORDS: 'Progress',
	PROGRESS_HEADER_ELAPSED_TIME: 'Elapsed<br/>Time',
	PROGRESS_HEADER_EST_REMAIN_TIME: 'Estimated<br/>Remaining<br/>Time',
	
	NO_RESULT_TITLE: "No Transfer In and/or Comparison Report was generated as no differences were found."
	// @end_translatable
	
});