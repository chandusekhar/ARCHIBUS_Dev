View.createController('abCbRptScoreBoardCtrl',{
	
	// context from drill down event
	drillDownContext: null,
	//date & time when scoreboard was generated
	genTime: null,
	
	afterViewLoad: function(){
		this.tabsScoreboard.enableTab('tabDetails', false);
	},
	/**
	 * open view with selected project details 
	 * defined in ab-ca-common.js
	 */
	abCbRptScoreBoardProjects_grid_onProjDetails: function(){
		showProjectDetails(this.abCbRptScoreBoardProjects_grid, 'project.project_id');
	},
	/**
	 * show scoreboard restricted to user selection
	 */
	abCbRptScoreBoard_filter_onShow: function(){
    	// validateDates
    	var startDate = this.abCbRptScoreBoard_filter.getFieldValue("dateFrom");
    	var endDate = this.abCbRptScoreBoard_filter.getFieldValue("dateTo");
    	if(!validateDates(startDate, endDate))
        	return;

    	this.genTime = new Date();
		this.selectedProjectIds = getKeysForSelectedRows(this.abCbRptScoreBoardProjects_grid, 'project.project_id');
		if(this.selectedProjectIds.length == 0){
			View.showMessage(getMessage('err_no_project'));
			return;	
		}
		var restriction = getFilterRestriction(this.abCbRptScoreBoard_filter, this.selectedProjectIds).restriction;
		this.abCbRptScoreBoard_scoreboard.refresh(restriction);
	},

	/**
	 * after refresh we need to set the colors
	 */
	abCbRptScoreBoard_scoreboard_afterRefresh: function(){
		this.panelScoreboard_colorcode();
		//get date
		var currentTime = this.genTime;
		var month = currentTime.getMonth() + 1;
		var day = currentTime.getDate();
		var year = currentTime.getFullYear();
		var hour = currentTime.getHours();
		var minutes = currentTime.getMinutes();
		minutes = (minutes<10)? 0 + minutes.toString():minutes;
		
		var crtTitle = this.abCbRptScoreBoard_scoreboard.getTitle();
		crtTitle += '  '+month + "/" + day + "/" + year+" "+hour+":"+minutes;
		this.abCbRptScoreBoard_scoreboard.setTitle(crtTitle);

		this.tabsScoreboard.selectTab('tabReport');
		this.tabsScoreboard.enableTab('tabDetails', false);
	},
	/**
	 * insert missing values for X and Y axis
	 * @param {Object} panel
	 * @param {Object} dataSet
	 */
	abCbRptScoreBoard_scoreboard_afterGetData: function(panel, dataSet){
		var defaultColumnSubtotal = new Ab.data.Record({
			'activity_log.activity_log_id': {l: '0', n: '0'},
            'activity_log.cond_value': {l: '0', n: '0'},
            'activity_log.sum_est_budget': {l: '0', n: '0'},
			'activity_log.count_items': {l: '0', n: '0'}
        });
		var defaultRowSubtotal = new Ab.data.Record({
			'activity_log.activity_log_id': {l: '0', n: '0'},
            'activity_log.cond_priority': {l: '0', n: '0'},
            'activity_log.sum_est_budget': {l: '0', n: '0'},
			'activity_log.count_items': {l: '0', n: '0'}
        });
		
        var columnValues = new Ext.util.MixedCollection();
		columnValues.add('5', defaultColumnSubtotal);
		columnValues.add('4', defaultColumnSubtotal);
		columnValues.add('3', defaultColumnSubtotal);
		columnValues.add('2', defaultColumnSubtotal);
		columnValues.add('1', defaultColumnSubtotal);
		columnValues.add('0', defaultColumnSubtotal);
		
		var rowValues = new Ext.util.MixedCollection();
		rowValues.add('10', defaultRowSubtotal);
		rowValues.add('9', defaultRowSubtotal);
		rowValues.add('8', defaultRowSubtotal);
		rowValues.add('7', defaultRowSubtotal);
		rowValues.add('6', defaultRowSubtotal);
		rowValues.add('5', defaultRowSubtotal);
		rowValues.add('4', defaultRowSubtotal);
		rowValues.add('3', defaultRowSubtotal);
		rowValues.add('2', defaultRowSubtotal);
		rowValues.add('1', defaultRowSubtotal);
		rowValues.add('0', defaultRowSubtotal);

        for (var c = 0; c < dataSet.columnValues.length; c++) {
            var columnValue = dataSet.columnValues[c].n;
            var columnSubtotal = dataSet.columnSubtotals[c];
            
            columnValues.replace(columnValue, columnSubtotal);
        }
        // use new column values and sub-totals
        dataSet.columnValues = [];
        dataSet.columnSubtotals = [];
		
        columnValues.eachKey(function(columnValue){
            var columnSubtotal = columnValues.get(columnValue);
            
            dataSet.columnValues.push({l: getMessage('cond_value_'+columnValue), n: columnValue});
            dataSet.columnSubtotals.push(columnSubtotal);
        });
        for (var r = 0; r < dataSet.rowValues.length; r++) {
            var rowValue = dataSet.rowValues[r].n;
            var rowSubtotal = dataSet.rowSubtotals[r];
            
            rowValues.replace(rowValue, rowSubtotal);
        }
        // use new column values and sub-totals
        dataSet.rowValues = [];
        dataSet.rowSubtotals = [];
		
        rowValues.eachKey(function(rowValue){
            var rowSubtotal = rowValues.get(rowValue);
            
            dataSet.rowValues.push({l: getMessage('cond_priority_'+rowValue), n: rowValue});
            dataSet.rowSubtotals.push(rowSubtotal);
        });
	},
	
	//XXX: XLS report
	abCbRptScoreBoard_scoreboard_onExportXLS: function() {
		View.openProgressBar(View.getLocalizedString(this.z_PROGRESS_MESSAGE));  
		try {
			var jobId  = Workflow.startJob('AbRiskCleanBuilding-CleanBuildingService-exportXLS', 
					this.abCbRptScoreBoard_scoreboard.viewDef.viewName + '.axvw',
					this.abCbRptScoreBoard_scoreboard.title,
					this.abCbRptScoreBoard_scoreboard.dataSourceId,
					this.abCbRptScoreBoard_scoreboard.groupByFields,
					this.abCbRptScoreBoard_scoreboard.calculatedFields,
					this.abCbRptScoreBoard_scoreboard.getDataSource().sortFieldDefs,
					this.abCbRptScoreBoard_scoreboard.dataSet);
			if(jobId != null){
				 var jobStatus = Workflow.getJobStatus(jobId);
   			 //XXX: finished or failed
   			 while (jobStatus.jobFinished != true && jobStatus.jobStatusCode != 8) {
					jobStatus = Workflow.getJobStatus(jobId);
   			 }
				
   			 if (jobStatus.jobFinished) {
					var url  = jobStatus.jobFile.url;
					window.location = url;
				}
			 }
			
		  
		}catch(e){
    		Workflow.handleError(e);
		}
		View.closeProgressBar();
	},
	
	/**
	 * set scoreboard colors
	 */
	panelScoreboard_colorcode: function(){
		var styleCode = [
				['1','1','2','3','4','5'],
				['1','2','2','3','4','5'],
				['2','2','2','3','4','5'],
				['2','2','3','3','4','5'],
				['3','3','3','3','4','5'],
				['3','3','3','3','4','5'],
				['4','4','4','4','4','5'],
				['4','4','4','4','5','5'],
				['4','4','4','5','5','5'],
				['4','4','5','5','5','5'],
				['5','5','5','5','5','5'],
			];
		for (var i=0; i<11; i++){
			for(var j=0;j<6;j++){
				colorBlock(i, j, 'CARating'+styleCode[i][j]);
			}
		}
	}
})

/**
 * set style for a specific cell
 * @param {Object} row
 * @param {Object} column
 * @param {Object} class_name
 */
function colorBlock(row, column, class_name){
	var panel = Ab.view.View.getControl(window, 'abCbRptScoreBoard_scoreboard');
	panel.getCellElement(row, column, 0).parentNode.className = class_name;
	panel.getCellElement(row, column, 1).parentNode.className = class_name;
}

/**
 * show scoreboard details
 */
function panelScoreboard_onClickItem(context){
	var controller = View.controllers.get("abCbRptScoreBoardCtrl");
	controller.drillDownContext = context;
	var restriction = context.restriction;
	
	var detailsPanel = View.panels.get('abCbRptScoreBoard_details');
	var consoleRestriction = getFilterRestriction(View.panels.get('abCbRptScoreBoard_filter'),View.controllers.get("abCbRptScoreBoardCtrl").selectedProjectIds).restriction;
	detailsPanel.addParameter('consoleRestriction', consoleRestriction);
	detailsPanel.refresh(restriction);
	
	var objTabs = View.panels.get('tabsScoreboard');
	objTabs.selectTab('tabDetails');
	objTabs.tabs[1].config['enabled'] = 'true';
}


