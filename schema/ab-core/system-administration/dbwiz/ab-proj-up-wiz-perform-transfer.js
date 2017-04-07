var performTransferController = View.createController('performTransferController', {
	wizardController:null,
	jobId: '',
	intervalID: null,
	progressPanelWrapper:null,
	progressControl: null,
	progressReportParameters: null,
	reportTask: null,
    reportTaskRunner: null,
    isPaused:false,
	panelGrid:null,
	selectedTableNames:[],
	
	afterInitialDataFetch:function(){
		this.reportProgressPanel.removeSorting();
		this.wizardController = View.getOpenerView().controllers.get('tabsController');
	},
	
	actionProgressPanel_onBack:function(){
		goToPrevTab(this.wizardController.updProjWizTabs);
		this.initializeButtons(true, true, false, true);
		// reload job tab to reset the progress bar
		this.wizardController.updProjWizTabs.tabs[2].loadView();
	},
	
	actionProgressPanel_onStartOver:function(){
		this.initializeButtons(true, true, false, true);
		// reload job tab to reset the progress bar
		this.wizardController.updProjWizTabs.tabs[2].loadView();
   		goToTabName(this.wizardController.updProjWizTabs, 'specifyTransfer');	
	},

	// start auto-refresh the table status grid using Ext.util.TaskRunner
    startRefreshGridTask: function(controller){
        this.reportTask = {
            run: function(){
            	var status = Workflow.getJobStatus(controller.jobId);
            	// if the job is not running
            	if(status.jobStatusCode != 2){
            		controller.reportTaskRunner.stop(controller.reportTask);
				}
            	if(!status.jobFinished){
            		controller.initializeButtons(false, false, true, true);
            	}
        		updateTableProgress(status);
            	controller.panelGrid.restriction = null;
            	controller.panelGrid.refresh();
            	refreshCheckboxes(controller.panelGrid, controller.selectedTableNames, true);
            },
            interval: 2000
        }
        controller.reportTaskRunner = new Ext.util.TaskRunner();
        controller.reportTaskRunner.start(controller.reportTask);
    },
    
    /**
     * Called when "Start" button is pressed and calls the job. 
     */
    actionProgressPanel_onStart:function(){
    	
    	var transferPanel = this.afmTransferSetIn_grid;
    	
		if (this.wizardController.transferOut){
			transferPanel = this.afmTransferSetOut_grid;
		} else if(this.wizardController.compare){
			transferPanel = this.afmTransferSetCompare_grid;
		}

		if(!this.wizardController.isMergeDataDict && transferPanel.getSelectedGridRows().length == 0){
    		View.showMessage(getMessage('no_table_selected'));
    		return;
    	}
		if(!this.wizardController.isMergeDataDict){
			this.setTablesToNotProcessed(transferPanel);
		}
		this.callTransferJob();
	},
	
	/**
	 * Sets unselected tables status to "not processed".
	 */
	setTablesToNotProcessed: function(transferPanel){
		var records = getUncheckedRecords(transferPanel);
		if(records.length > 0){
			var dataSource = transferPanel.getDataSource();
			dataSource.saveRecords(records);
		}
	},

	
	/**
	 * Calls the transfer in/out job.
	 */
	callTransferJob:function(){
		this.progressPanelWrapper = new Ab.paginate.ProgressPanel(this.reportProgressPanel, this.afterJobFinished.createDelegate(this));
		
		if (!this.progressPanelWrapper.isJobStarted()) {
	
			try{
				
				if (this.wizardController.transferOut){
					this.startTransferOutJob();
				}else if(this.wizardController.transferIn){
					this.startTransferInJob();
				}else if(this.wizardController.compare){
					this.startCompareJob();
				}
			}catch(e){
   				Workflow.handleError(e);
				}
		}else if (!this.progressPanelWrapper.isJobFinished()) {
            // if the job has not yet complete, then the user wants to stop the job
        	this.progressPanelWrapper.stopJob();
    	}
	},
	
	actionProgressPanel_onStop:function(){
		this.reportTaskRunner.stop(this.reportTask);
		var status = Workflow.stopJob(this.jobId);
		this.initializeButtons(true, false, false, false);
	},	
	
	actionProgressPanel_onPause:function(){
		 var pauseButton = this.actionProgressPanel.actions.get('pause');
		 var status = Workflow.getJobStatus(this.jobId);
		 if(status.jobStatusCode == 4 || status.jobStatusCode == 2 || this.isPaused){
		 	if(this.isPaused){
		 		pauseButton.setTitle('Pause');
		 		this.isPaused = false;
		 		this.actionProgressPanel_onStart();
		 	}else{
				this.progressPanelWrapper.stopJob();
				this.reportTaskRunner.stop(this.reportTask);
		 		pauseButton.setTitle('Resume');
		 		this.isPaused = true;
		 	}
			this.initializeButtons(false, false, false, true);
		}
   },

   afterJobFinished: function(status) {
	    // clear the progress panel status so that the job can be started again
	    this.progressPanelWrapper.clear();
		this.reportTaskRunner.stop(this.reportTask);
		// the job has finished	and we can clear the interval
	   	this.panelGrid.refresh();
	   	this.initializeButtons(true, false, false, false);
	   	if (this.wizardController.isMergeDataDict){
	   		var mergeTab = this.wizardController.updProjWizTabs.findTab('mergeDataDictionary')
	   		var mergeTabController = mergeTab.getContentFrame().View.controllers.get('mergeDataDict_ctrl');
			var panelGrid = mergeTabController.afmFldsTrans_grid;
			panelGrid.refresh();
			if(panelGrid.rows.length > 0){
				goToNextTab(this.wizardController.updProjWizTabs);
		   		mergeTabController.setOutput();
			}else{
				View.showMessage(getMessage('nothing_to_merge'));
				this.initializeButtons(true, true, false, false);
			}
	   	}
	   	if (this.wizardController.compare){
			var compareTab = this.wizardController.updProjWizTabs.findTab('compareDataDictionary');
			var panelGrid = compareTab.getContentFrame().View.controllers.items[0].afmFldsTransCompare_grid;
		   	panelGrid.refresh();
			if(panelGrid.rows.length > 0){
				goToTabName(this.wizardController.updProjWizTabs, 'compareDataDictionary');
			}else{
				View.showMessage(getMessage('nothing_to_merge'));
				this.initializeButtons(true, true, false, false);
			}
	   	}
	   	refreshCheckboxes(this.panelGrid, this.selectedTableNames, false);
	},

	/**
	 * Starts transfer out job.
	 */
	startTransferOutJob:function(){
		try {
			ProjectUpdateWizardService.startTransferOutJob(performTransferController.wizardController.deleteBeforeTransferOut,
					{
					callback: function(job_id) {
						performTransferController.afterCallJob(job_id);
	    			},
	    	        errorHandler: function(m, e) {
	    	            View.showException(e);
	    	        }
		});
			
		}catch(e){
			Workflow.handleError(e);
		}
	},
	
	/**
	 * Starts transfer in job.
	 */
	startTransferInJob:function(){
		try {
			ProjectUpdateWizardService.startTransferInJob(performTransferController.wizardController.deleteAfterTransferIn, performTransferController.wizardController.generateSqlLog, performTransferController.wizardController.executeSql, performTransferController.wizardController.isMergeDataDict,
					{
					callback: function(job_id) {
						performTransferController.afterCallJob(job_id);
	    			},
	    	        errorHandler: function(m, e) {
	    	            View.showException(e);
	    	        }
		});
			
		}catch(e){
			Workflow.handleError(e);
		}
	},

	/**
	 * Starts compare job.
	 */
	startCompareJob:function(){
		try {
			ProjectUpdateWizardService.startCompareJob(
					{
					callback: function(job_id) {
						performTransferController.afterCallJob(job_id);
	    			},
	    	        errorHandler: function(m, e) {
	    	            View.showException(e);
	    	        }
		});
			
		}catch(e){
			Workflow.handleError(e);
		}
	},
	
	afterCallJob: function(job_id){
		this.jobId = job_id;
		this.initializeButtons(false, false, true, true);
		// notify the progress panel
    	this.progressPanelWrapper.onJobStarted(this.jobId);
    	if(this.wizardController.transferIn){
    		this.panelGrid = this.afmTransferSetIn_grid;
    	}else if(this.wizardController.transferOut){
    		this.panelGrid = this.afmTransferSetOut_grid;
    	}else{
    		this.panelGrid = this.afmTransferSetCompare_grid;
    	}
		this.startRefreshGridTask(this);
	},

	initializeButtons: function(isBack, isStart, isStop, isPause){
		//XXX: if an action is disabled, reloading its panel would make it forceDisabled.
		//and then enableButton() API would not enable to make it enabled again.
		if(isBack){
			this.actionProgressPanel.actions.get('startOver').forceDisable(false);
		}
		if(isBack){
			this.actionProgressPanel.actions.get('back').forceDisable(false);
		}
		if(isStart){
			this.actionProgressPanel.actions.get('start').forceDisable(false);
		}
		if(isStop){
			this.actionProgressPanel.actions.get('stop').forceDisable(false);
		}
		if(isPause){
			this.actionProgressPanel.actions.get('pause').forceDisable(false);
		}
		this.actionProgressPanel.enableButton('startOver',isBack);
		this.actionProgressPanel.enableButton('back',isBack);
		this.actionProgressPanel.enableButton('start',isStart);
		this.actionProgressPanel.enableButton('stop',isStop);
		this.actionProgressPanel.enableButton('pause',isPause);
	},
	
	afmTransferSetOut_grid_afterRefresh: function(){
		var grid = this.afmTransferSetOut_grid;
		for(var i=0;i< grid.rows.length;i++){
			var row = grid.rows[i];
			var nRecordsInTable = row['afm_transfer_set.nrecords_source'];
			var tableName = row['afm_transfer_set.table_name'];
			if(nRecordsInTable != '0'){
				row.row.cells.get('afm_transfer_set.nrecords_source').dom.innerHTML = nRecordsInTable + '&nbsp;' + "<a href=\"javascript:viewTable('"+tableName+"');\" title=\"Load popup view of this table's data\">[...]</a>";
			}
		}
	},

	afmTransferSetCompare_grid_afterRefresh: function(){
		var grid = this.afmTransferSetCompare_grid;
		for(var i=0;i< grid.rows.length;i++){
			var row = grid.rows[i];
			var nRecordsInTable = row['afm_transfer_set.nrecords_dest'];
			var nRecordsInFile = row['afm_transfer_set.nrecords_source'];
			var tableName = row['afm_transfer_set.table_name'];
			var URLToCsv = getCsvFilePath(tableName);

			var tableName = row['afm_transfer_set.table_name'];
			if(nRecordsInTable != '0'){
				row.row.cells.get('afm_transfer_set.nrecords_dest').dom.innerHTML = nRecordsInTable + '&nbsp;' + "<a href=\"javascript:viewTable('"+tableName+"');\" title=\"Load popup view of this table's data\">[...]</a>";
			}
			if(nRecordsInFile != '0'){
				row.row.cells.get('afm_transfer_set.nrecords_source').dom.innerHTML = nRecordsInFile + '&nbsp;' + "<a href=\""+URLToCsv+"\" title=\"View full .csv extract file\">[...]</a>";
			}
		}
	},

	afmTransferSetIn_grid_afterRefresh: function(){
		var grid = this.afmTransferSetIn_grid;
		for(var i=0;i< grid.rows.length;i++){
			var row = grid.rows[i];
			var nRecordsInSource = row['afm_transfer_set.nrecords_source'];
			var tableName = row['afm_transfer_set.table_name'];
			var URLToCsv = getCsvFilePath(tableName);
			if(nRecordsInSource != '0'){
				row.row.cells.get('afm_transfer_set.nrecords_source').dom.innerHTML = nRecordsInSource + '&nbsp;' + "<a href=\""+URLToCsv+"\" title=\"View full .csv extract file\">[...]</a>";
			}
			var nRecordsInDest = row['afm_transfer_set.nrecords_dest'];
			if(nRecordsInDest != '0'){
				row.row.cells.get('afm_transfer_set.nrecords_dest').dom.innerHTML = nRecordsInDest + '&nbsp;' + "<a href=\"javascript:viewTable('"+tableName+"');\" title=\"Load popup view of this table's data\">[...]</a>";
			}
			var nRecordsInserted = row['afm_transfer_set.nrecords_inserted'];
			var URLToRecIns = View.getBaseUrl() + "/schema/per-site/datatransfer/" + View.user.name.toLowerCase() + "/" + tableName + "/" + View.user.name.toLowerCase() + "-" + tableName+ "-inserted.csv";
			if(nRecordsInserted != '0'){
				row.row.cells.get('afm_transfer_set.nrecords_inserted').dom.innerHTML = nRecordsInserted + '&nbsp;' + "<a href=\""+URLToRecIns+"\" title=\"View .xls log file of records that were inserted\">[...]</a>";
			}
			var nRecordsUpdated = row['afm_transfer_set.nrecords_updated'];
			var URLToRecUpd = View.getBaseUrl() + "/schema/per-site/datatransfer/" + View.user.name.toLowerCase() + "/" + tableName + "/" + View.user.name.toLowerCase() + "-" + tableName+ "-updated.csv";
			if(nRecordsUpdated != '0'){
				row.row.cells.get('afm_transfer_set.nrecords_updated').dom.innerHTML = nRecordsUpdated + '&nbsp;' + "<a href=\""+URLToRecUpd+"\" title=\"View .xls log file of records that were updated\">[...]</a>";
			}
			var nRecordsMissing = row['afm_transfer_set.nrecords_missing'];
			var URLToRecMiss = View.getBaseUrl() + "/schema/per-site/datatransfer/" + View.user.name.toLowerCase() + "/" + tableName + "/" + View.user.name.toLowerCase() + "-" + tableName+ "-errors.csv";
			if(nRecordsMissing != '0'){
				row.row.cells.get('afm_transfer_set.nrecords_missing').dom.innerHTML = nRecordsMissing + '&nbsp;' + "<a href=\""+URLToRecMiss+"\" title=\"View .xls log file of records that had errors and so were not imported\">[...]</a>";
			}
			/*
			var nRecordsErrors = row['afm_transfer_set.nrecords_errors'];
			var URLToRecErr = View.getBaseUrl() + "/schema/per-site/datatransfer/" + View.user.name.toLowerCase() + "/" + tableName + "/" + View.user.name.toLowerCase() + "-" + tableName+ "-errors.csv";
			if(nRecordsErrors != '0' || nRecordsErrors != 'undefined'){
				row.row.cells.get('afm_transfer_set.nrecords_errors').dom.innerHTML = nRecordsErrors + '&nbsp;' + "<a href=\"\" title=\"View .xls log file of records that had errors and so were not imported\">[...]</a>";
			}*/
		}
	}
});

/**
 * Returns afm_transfer_set.autonumbered_id of unchecked records.
 * @returns {Array}
 */
function getUncheckedRecords(gridPanel){
	var gridRows = gridPanel.rows;
	var records = new Array();
	var j = 0;
	var s = 0;
	for(var i = 0; i < gridRows.length; i++){
		var row = gridRows[i].row;
		var record = row.getRecord();
		if(row.isSelected()){
			performTransferController.selectedTableNames[s++] = record.getValue('afm_transfer_set.table_name');
		}else{
			record.setValue("afm_transfer_set.status", "NOT PROCESSED");
			records[j++] = record;
		}
	}
	return records;
}

function viewTable(tableName){
	var defaultView = getDefaultView(tableName);
	
	if(defaultView.length > 0){
	    View.openDialog(defaultView, '', false, {
	        width: 800,
	        height: 400
	    });	

	}else{
		var fields = getFieldNames(tableName);

		View.selectValue({
			title: tableName,
	    	fieldNames: fields,
	    	selectTableName: tableName,
	    	selectFieldNames: fields,
	    	visibleFieldNames: fields,
	    	//actionListener: actionListener,
	    	width: 800,
	    	height: 400
		});
	}
}

function getFieldNames(tableName){
	var restriction = new Ab.view.Restriction();
	restriction.addClause('afm_flds.table_name', tableName , '=');
	var ds = View.dataSources.get('afmTableFields_ds');
	var records = ds.getRecords(restriction);
	
	var fields = new Array();
	for(var i = 0; i < records.length; i++){
		fields.push(tableName + "."+ records[i].values['afm_flds.field_name']);
	}
	return fields;
}

function getDefaultView(tableName){
	var restriction = new Ab.view.Restriction();
	restriction.addClause('afm_tbls.table_name', tableName , '=');
	var ds = View.dataSources.get('defaultViewForTable_ds');
	var records = ds.getRecords(restriction);
	
	return records[0].values['afm_tbls.default_view'];
}

function updateTableProgress(status){
	$('tableProgressMessage').innerHTML = status.jobFile.title;
} 
