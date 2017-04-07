var updateSqlTablesController = View.createController('updateSqlTables_ctrl', {
	wizardController:null,
	reportTask: null,
    reportTaskRunner: null,
	intervalID: null,
	progressPanelWrapper:null,
	jobId:null,
	isPaused:false,
	selectedTableNames:[],
	
	afterInitialDataFetch:function(){
		this.wizardController = View.getOpenerView().controllers.items[0];
	},
	
	afmTransferSet_grid_afterRefresh:function(){
		populateSqlDiffColumn(this);	
	},
	
	actionProgressPanel_onBack:function(){
		goToPrevTab(View.getOpenerView().controllers.items[0].updSchWizTabs);
		var pauseButton = this.actionProgressPanel.actions.get('pause');
 		pauseButton.setTitle('Pause');
		this.isPaused = false;
	},
	
	actionProgressPanel_onStop:function(){
		this.reportTaskRunner.stop(this.reportTask);
		this.progressPanelWrapper.stopJob();
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

    // start auto-refresh the table status grid using Ext.util.TaskRunner
    startRefreshGridTask: function(controller){
        this.reportTask = {
            run: function(){
            	var status = Workflow.getJobStatus(controller.jobId);
            	
            	// if the job is not running
            	if(status.jobStatusCode != 2){
            		updateStatusColumn(controller.afmTransferSet_grid);
            		updateTableProgress(status);
					controller.reportTaskRunner.stop(controller.reportTask);
            	}else{
            		updateStatusColumn(controller.afmTransferSet_grid);
            		updateTableProgress(status);
            	}
        	   	refreshCheckboxes(controller.afmTransferSet_grid, controller.selectedTableNames, true);
            },
            interval: 2000
        }
        controller.reportTaskRunner = new Ext.util.TaskRunner();
        controller.reportTaskRunner.start(controller.reportTask);
    },

    actionProgressPanel_onStart:function(){
    	if(this.afmTransferSet_grid.getSelectedGridRows().length == 0){
    		View.showMessage(getMessage('no_table_selected'));
    		return;
    	}
		this.setTablesToNotProcessed();
		this.updateSchemaJob();
	},
    
	/**
	 * Sets unselected tables status to "not processed".
	 */
	setTablesToNotProcessed: function(){
		var records = getUncheckedRecords();
		if(records.length > 0){
			var dataSource = this.afmTransferSet_grid.getDataSource();
			dataSource.saveRecords(records);
		}
	},
	
	/**
	 * Update Schema Job.
	 */
	updateSchemaJob: function(){
		var executeOnDb = this.wizardController.executeOnDb;
		var logSqlCommands = this.wizardController.logSqlCommands;
		var isRecreateFK = this.wizardController.isRecreateFK;
		var isRecreateTable = this.wizardController.isRecreateTable;
		var isChar = this.wizardController.isChar;
		var tableSpaceName = this.wizardController.tableSpaceName;
		
		this.progressPanelWrapper = new Ab.paginate.ProgressPanel(this.reportProgressPanel, this.afterJobFinished.createDelegate(this));
		
		if (!this.progressPanelWrapper.isJobStarted()) {
	
			try {
				SchemaUpdateWizardService.startUpdateSchemaJob(executeOnDb, logSqlCommands, isRecreateTable, isRecreateFK, isChar, tableSpaceName,
						{
						callback: function(job_id) {
							updateSqlTablesController.afterCallJob(job_id);
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
		this.initializeButtons(false, false, true, true);
	},
	
	afterJobFinished: function(status) {
		this.reportTaskRunner.stop(this.reportTask);
		if(status.jobStatusCode == 3){
	    	this.progressPanelWrapper.clear();
	    	updateStatusColumn(this.afmTransferSet_grid);
		}
		this.initializeButtons(true, true, false, false);
	   	refreshCheckboxes(this.afmTransferSet_grid, this.selectedTableNames, false);
		goToNextTab(this.wizardController.updSchWizTabs);
	},
	
	initializeButtons: function(isBack, isStart, isStop, isPause){

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
		
		this.actionProgressPanel.enableButton('back',isBack);
		this.actionProgressPanel.enableButton('start',isStart);
		this.actionProgressPanel.enableButton('stop',isStop);
		this.actionProgressPanel.enableButton('pause',isPause);
	}
});

/**
 * Returns afm_transfer_set.autonumbered_id of unchecked records.
 * @returns {Array}
 */
function getUncheckedRecords(){
	var gridPanel = updateSqlTablesController.afmTransferSet_grid;
	var gridRows = gridPanel.rows;
	var records = new Array();
	var j = 0;
	var s = 0;
	for(var i = 0; i < gridRows.length; i++){
		var row = gridRows[i].row;
		var record = row.getRecord();
		if(row.isSelected()){
			updateSqlTablesController.selectedTableNames[s++] = record.getValue('afm_transfer_set.table_name');
		}else{
			record.setValue("afm_transfer_set.status", "NOT PROCESSED");
			records[j++] = record;
		}
	}

	return records;
}

function updateTableProgress(status){
	$('tableProgressMessage').innerHTML = status.jobFile.title;
} 

function updateStatusColumn(gridPanel){

	var dataRows = gridPanel.getDataRows();

	for (var r = 0; r < dataRows.length; r++) {
    	var cellElem = gridPanel.getCellElement(r,1);
    	var tableName = getGridElemValue(cellElem);
    	var record = getTableStatus(tableName);
    	var status = '';
    	if(valueExistsNotEmpty(record.records)){
    		//OLD db
    		status = record.records[0].getValue('afm_transfer_set.status')
    	}else{
    		//NEW db
        	status = record.getValue('afm_transfer_set.status');
    	}
    	
    	var tableStatusCell = gridPanel.getCellElement(r,4);
    	setGridElemValue(tableStatusCell, status);
    }
} 

function getTableStatus(tableName){
	var restriction = new Ab.view.Restriction();
	restriction.addClause('afm_transfer_set.table_name', tableName, '=');
	var records = updateSqlTablesController.tableStatus_ds.getRecord(restriction);
	return records;
}

function getGridElemValue(cellElement){
	return cellElement.innerHTML;
}

function setGridElemValue(cellElement, value){
	return cellElement.innerHTML = value;
}