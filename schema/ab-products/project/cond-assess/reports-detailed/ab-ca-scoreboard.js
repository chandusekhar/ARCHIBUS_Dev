/**
 * @author Ioan Draghici
 */

var scoreBoardController = View.createController('scoreBoardCtrl',{
	selectedProjectIds: [],
	// restriction from filter console
	consoleRestriction: null,
	// context from drill down event
	drillDownContext: null,
	//date & time when scoreboard was generated
	genTime: null,
	/**
	 * add event listener for afterGetData
	 */
	afterViewLoad: function(){
		var managerProcess = [{activityId : 'AbCapitalPlanningCA', processIds: ['Assessment Manager','Manage Assessments']}];
		var helpDeskProcess = [{activityId : 'AbBldgOpsHelpDesk', processIds: ['Create Service Request','Client']}];

		var isUserProcess = (this.view.isProcessAssignedToUser(helpDeskProcess) && this.view.isProcessAssignedToUser(managerProcess));

		this.panelScoreboard.addEventListener('afterGetData', this.panelScoreboard_afterGetData, this);
		this.panelScoreboard.addEventListener('afterRefresh', this.panelScoreboard_afterRefresh, this);
		
		$('txt_active_work_order').innerHTML = getMessage('txtActiveWorkOrder');
		
		afterCreateDataRows_removeWorkRequest(null, null, isUserProcess, this.panelScoreboardDetails);

		this.panelScoreboardDetails.afterCreateCellContent = afterCreateCellContent_disableIcon;
		this.tabsScoreboard.enableTab('tabDetails', false);
		
		if (this.view.taskInfo.activityId == 'AbProjCommissioning') {
			this.listProjects.addParameter('projecttype', 'COMMISSIONING');
		}
	},
	
	afterInitialDataFetch: function(){
		if (this.view.taskInfo.activityId == 'AbProjCommissioning') {
			View.setTitle(getMessage('comm_title'));
			this.listProjects.selectAll();
			this.consoleScoreboard_onShow();
		}
	},
		
	/**
	 * open view with selected project details 
	 * defined in ab-ca-common.js
	 */
	listProjects_onProjDetails: function(){
		showProjectDetails(this.listProjects, 'project.project_id');
	},
	/**
	 * show scoreboard restricted to user selection
	 */
	consoleScoreboard_onShow: function(){
		this.genTime = new Date();
		this.selectedProjectIds = getKeysForSelectedRows(this.listProjects, 'project.project_id');
		if(this.selectedProjectIds.length == 0){
			View.showMessage(getMessage('err_no_project'));
			return;	
		}
		this.getRestriction();
		this.panelScoreboard.refresh(this.consoleRestriction);
		// KB 3025677  - 01/26/2010
		this.tabsScoreboard.selectTab('tabReport');
		this.tabsScoreboard.enableTab('tabDetails', false);
	},
	/**
	 * get user restriction in sql format
	 */
	getRestriction: function(){
		var console = this.consoleScoreboard;
		this.consoleRestriction = '1 = 1';
		var site_id = console.getFieldValue('activity_log.site_id');
		if (site_id) {
			this.consoleRestriction += " AND activity_log.site_id = '"+ site_id +"'";
		}
		var bl_id = console.getFieldValue('activity_log.bl_id');
		if (bl_id) {
			this.consoleRestriction += " AND activity_log.bl_id = '"+ bl_id +"'";
		}
		var fl_id = console.getFieldValue('activity_log.fl_id');
		if (fl_id) {
			this.consoleRestriction += " AND activity_log.fl_id = '"+ fl_id +"'";
		}
		var fromDate = console.getFieldValue('activity_log.date_assessed');
		if (fromDate) {
			this.consoleRestriction += " AND activity_log.date_assessed >= ${sql.date('"+ fromDate +"')}";
		}
		var toDate = console.getFieldValue('activity_log.date_completed');
		if (toDate) {
			this.consoleRestriction += " AND activity_log.date_assessed <= ${sql.date('"+ toDate +"')}";
		}
		var csi_id = console.getFieldValue('activity_log.csi_id');
		var csiRestriction = '';
		if(csi_id && csi_id != 0 ){
			csiRestriction = "( activity_log.csi_id LIKE '%|" + csi_id + "|%' ";
			csiRestriction += " OR EXISTS (SELECT 1 FROM csi WHERE csi.csi_id=activity_log.csi_id";
			csiRestriction += " AND hierarchy_ids LIKE '%|" + csi_id + "|%')";
			csiRestriction += " OR EXISTS (SELECT 1 FROM csi WHERE csi.csi_id=activity_log.csi_id";
			csiRestriction += " AND EXISTS (SELECT 1 FROM csi ${sql.as} csi_inner WHERE csi_inner.csi_id = csi.hierarchy_ids";
			csiRestriction += " AND csi_inner.hierarchy_ids LIKE '%|" + csi_id + "|%')))";
			this.consoleRestriction += "AND " + csiRestriction;
		}
		var withActiveWork = document.getElementById('chk_active_work_order').checked;
		if(withActiveWork){
			this.consoleRestriction += " AND EXISTS (SELECT 1 FROM wr, activity_log act_log_inner WHERE wr.activity_log_id = act_log_inner.activity_log_id ";
			this.consoleRestriction += " AND act_log_inner.assessment_id = activity_log.activity_log_id AND wr.status IN ('I','HP','HA','HL'))";
		}
		var notCompletedStatus = document.getElementById('chk_not_completed_assessments').checked;
		if(notCompletedStatus){
			this.consoleRestriction += " AND activity_log.status NOT IN ('COMPLETED','COMPLETED-V')";
		}
		this.consoleRestriction += " AND activity_log.project_id IN ('" + this.selectedProjectIds.join('\',\'') + "')";
	},
	/**
	 * after refresh we need to set the colors
	 */
	panelScoreboard_afterRefresh: function(){
		this.panelScoreboard_colorcode();
		//get date
		var currentTime = this.genTime;
		var month = currentTime.getMonth() + 1;
		var day = currentTime.getDate();
		var year = currentTime.getFullYear();
		var hour = currentTime.getHours();
		var minutes = currentTime.getMinutes();
		minutes = (minutes<10)? 0 + minutes.toString():minutes;
		
		var crtTitle = this.panelScoreboard.getTitle();
		crtTitle += '  '+month + "/" + day + "/" + year+" "+hour+":"+minutes;
		this.panelScoreboard.setTitle(crtTitle);

	},
	/**
	 * insert missing values for X and Y axis
	 * @param {Object} panel
	 * @param {Object} dataSet
	 */
	panelScoreboard_afterGetData: function(panel, dataSet){
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
	},
	/**
	 * edit CA item
	 * @param {Object} row
	 */
	panelScoreboardDetails_onEdit: function(row, action){
		var controller = this;
		var activity_log_id = row.getFieldValue('activity_log.activity_log_id');
	
		// open edit dialog
		editCAItem(activity_log_id, function(){
			/*
			 * KB 3027943 IOAN Refresh scoreboard and details with applied console restriction,
			 * not with new values from filter console
			 */
			//controller.consoleScoreboard_onShow();
			controller.genTime = new Date();
			controller.panelScoreboard.refresh(controller.consoleRestriction);
			panelScoreboard_onClickItem(controller.drillDownContext);
		});
	},
	panelScoreboardDetails_onCreateWorkReq: function(row, action){
		var controller = this;
		if(!createWorkRequest(this.view, row, function(){
				/*
				 * KB 3027943 IOAN Refresh scoreboard and details with applied console restriction,
				 * not with new values from filter console
				 */
				//controller.consoleScoreboard_onShow();
				controller.genTime = new Date();
				controller.panelScoreboard.refresh(controller.consoleRestriction);
				panelScoreboard_onClickItem(controller.drillDownContext);
			})){
			return;
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
	var panel = Ab.view.View.getControl(window, 'panelScoreboard');
	panel.getCellElement(row, column, 0).parentNode.className = class_name;
	panel.getCellElement(row, column, 1).parentNode.className = class_name;
}

/**
 * show scoreboard details
 */
function panelScoreboard_onClickItem(context){
	var controller = View.controllers.get("scoreBoardCtrl");
	controller.drillDownContext = context;
	var restriction = context.restriction;
	
	var detailsPanel = View.panels.get('panelScoreboardDetails');
	detailsPanel.addParameter('consoleRestriction', controller.consoleRestriction); 
	detailsPanel.refresh(restriction);
	
	var objTabs = View.panels.get('tabsScoreboard');
	objTabs.selectTab('tabDetails');
	objTabs.tabs[1].config['enabled'] = 'true';
}

/*
 * 05/19/2010 IOAN KB 3027568
 * reset Only with Work Orders in Process checkbox
 */

function resetCheckbox(){
	document.getElementById('chk_active_work_order').checked = false;
}