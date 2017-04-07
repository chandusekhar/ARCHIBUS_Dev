var compareJobController = View.createController('compareJob_ctrl', {
	progressPanelWrapper:null,
	refreshInterval:1,
	jobId:null,
	tabController:null,
	
startJob:function(){

		this.progressPanelWrapper = new Ab.paginate.ProgressPanel(this.reportProgressPanel, this.afterCompareJobFinished.createDelegate(this));
		this.progressPanelWrapper.progressRefreshInterval = this.refreshInterval;
	
		if (!this.progressPanelWrapper.isJobStarted()) {
			this.progressPanelWrapper.onJobStarted(this.jobId);
		}else if (!this.progressPanelWrapper.isJobFinished()) {
			// if the job has not yet complete, then the user wants to stop the job
			this.progressPanelWrapper.stopJob();
		}
},

reportProgressPanel_onStop:function(){
	    Workflow.stopJob(this.jobId);
},	

afterCompareJobFinished: function(status) {
	if(status.jobStatusCode == 3){
	    // clear the progress panel status so that the job can be started again
    	this.progressPanelWrapper.clear();
        loadNextTab();
        View.closeThisDialog();
	}
}
});

function loadNextTab(){
	// refresh tab first
	var tabC = compareJobController.tabController.updSchWizTabs.tabs[1];
	var tabController = tabC.getContentFrame().View.controllers.items[1];
	tabController.afmTransferSet_grid.refresh();
	var parentView = View.getOpenerView();
	if(tabController.afmTransferSet_grid.rows.length > 0){
		populateSqlDiffColumn(tabController);
		var allTabs = parentView.controllers.items[0].updSchWizTabs;
		var sqlTablesController = allTabs.tabs[1].getContentFrame().View.controllers.items[0];
		sqlTablesController.initializeButtons(true, true, false, false);
		goToNextTab(allTabs);
		sqlTablesController.reportProgressPanel.clear();
	}else{
		parentView.showMessage(getMessage('nothing_to_update'));
	}
}

function populateSqlDiffColumn(tabC){

	var gridPanel = tabC.afmTransferSet_grid;
	var dataRows = gridPanel.getDataRows();

	for (var r = 0; r < dataRows.length; r++) {
	    var sqlDifferences='';
    	var cellElem = gridPanel.getCellElement(r,1);
    	var tableName = getGridElemValue(cellElem);
    	var records = getSqlTableDiffs(tabC, tableName);
    	for(var i=0; i< records.length;i++){
    		sqlDifferences += records[i].values["afm_flds_trans.sql_table_diffs"];
        	if(i<records.length){
        		sqlDifferences+="<br/>";
        	}
    	}
    	var sqlDiffCell = gridPanel.getCellElement(r,3);
    	setGridElemValue(sqlDiffCell, sqlDifferences);
    }
	
	//fix for 3044860 - "Select all" missing from SCW after failed job
	// enable the "select all" checkbox if there is at least one data row in grid
	if(dataRows.length > 0){
		var checkAllEl = Ext.get(gridPanel.id + '_checkAll');
		if (checkAllEl) {
			checkAllEl.dom.style.display = "";
		}
	}
} 

function getGridElemValue(cellElement){
	return cellElement.innerHTML;
}

function setGridElemValue(cellElement, value){
	return cellElement.innerHTML = value;
}

function getSqlTableDiffs(tabC, tableName){
	var restriction = new Ab.view.Restriction();
	restriction.addClause('afm_flds_trans.table_name', tableName, '=');
	var records = tabC.afmFldsTrans_ds.getRecords(restriction);
	return records;
}