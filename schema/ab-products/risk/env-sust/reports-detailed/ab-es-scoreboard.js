/**
 * @author Ioan Draghici
 */

var esScoreBoardController = View.createController('esScoreBoardCtrl',{
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
		var managerProcess = [{activityId : 'AbRiskES', processIds: ['Assessment Manager','Manage Assessments']}];
		var helpDeskProcess = [{activityId : 'AbBldgOpsHelpDesk', processIds: ['Create Service Request','Client']}];
		var isUserProcess = (this.view.isProcessAssignedToUser(helpDeskProcess) && this.view.isProcessAssignedToUser(managerProcess));

		this.abEsScoreboard_scoreboard.addEventListener('afterGetData', this.abEsScoreboard_scoreboard_afterGetData, this);
		this.abEsScoreboard_scoreboard.addEventListener('afterRefresh', this.abEsScoreboard_scoreboard_afterRefresh, this);
		
		$('txt_active_work_order').innerHTML = getMessage('txtActiveWorkOrder');
		afterCreateDataRows_removeWorkRequest(null, null, isUserProcess, this.abEsScoreboard_details);

		this.abEsScoreboard_details.afterCreateCellContent = afterCreateCellContent_disableIcon;
		this.abEsScoreboard_tabs.enableTab('abEsScoreboard_details_tab', false);
	},
	/**
	 * open view with selected project details 
	 * defined in ab-ca-common.js
	 */
	abEsScoreboard_listProjects_onProjDetails: function(){
		showProjectDetails(this.abEsScoreboard_listProjects, 'project.project_id');
	},
	/**
	 * show scoreboard restricted to user selection
	 */
	abEsScoreboard_filterConsole_onShow: function(){
		this.genTime = new Date();
		this.selectedProjectIds = getKeysForSelectedRows(this.abEsScoreboard_listProjects, 'project.project_id');
		if(this.selectedProjectIds.length == 0){
			View.showMessage(getMessage('err_no_project'));
			return;	
		}
		this.getRestriction();
		this.abEsScoreboard_scoreboard.refresh(this.consoleRestriction);
		// KB 3025677  - 01/26/2010
		this.abEsScoreboard_tabs.selectTab('abEsScoreboard_report_tab');
		this.abEsScoreboard_tabs.enableTab('abEsScoreboard_details_tab', false);
	},
	/**
	 * get user restriction in sql format
	 */
	getRestriction: function(){
		var console = this.abEsScoreboard_filterConsole;
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
	abEsScoreboard_scoreboard_afterRefresh: function(){
		this.abEsScoreboard_scoreboard_colorcode();
		//get date
		var currentTime = this.genTime;
		var month = currentTime.getMonth() + 1;
		var day = currentTime.getDate();
		var year = currentTime.getFullYear();
		var hour = currentTime.getHours();
		var minutes = currentTime.getMinutes();
		minutes = (minutes<10)? 0 + minutes.toString():minutes;
		
		var crtTitle = this.abEsScoreboard_scoreboard.getTitle();
		crtTitle += '  '+month + "/" + day + "/" + year+" "+hour+":"+minutes;
		this.abEsScoreboard_scoreboard.setTitle(crtTitle);
	},
	/**
	 * insert missing values for X and Y axis
	 * @param {Object} panel
	 * @param {Object} dataSet
	 */
	abEsScoreboard_scoreboard_afterGetData: function(panel, dataSet){
		var defaultColumnSubtotal = new Ab.data.Record({
			'activity_log.activity_log_id': {l: '0', n: '0'},
            'activity_log.cond_value': {l: '0', n: '0'},
            'activity_log.sum_est_budget': {l: '0', n: '0'},
			'activity_log.count_items': {l: '0', n: '0'}
        });
		var defaultRowSubtotal = new Ab.data.Record({
			'activity_log.activity_log_id': {l: '0', n: '0'},
            'activity_log.sust_priority': {l: '0', n: '0'},
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
            
            dataSet.rowValues.push({l: getMessage('sust_priority_'+rowValue), n: rowValue});
            dataSet.rowSubtotals.push(rowSubtotal);
        });
	},
	/**
	 * set scoreboard colors
	 */
	abEsScoreboard_scoreboard_colorcode: function(){
		var styleCode = [
				['1','1','2','3','4','6'],
				['1','2','2','3','4','6'],
				['2','2','2','3','4','6'],
				['2','2','3','3','4','6'],
				['3','3','3','3','4','6'],
				['3','3','3','3','4','6'],
				['4','4','4','4','4','6'],
				['4','4','4','4','5','6'],
				['4','4','4','5','5','6'],
				['4','4','5','5','5','6'],
				['6','6','6','6','6','6'],
			];
		for (var i=0; i<11; i++){
			for(var j=0;j<6;j++){
				colorBlock(i, j, 'ESRating'+styleCode[i][j]);
			}
		}
	},
	/**
	 * edit CA item
	 * @param {Object} row
	 */
	abEsScoreboard_details_onEdit: function(row, action){
		var controller = this;
		var activity_log_id = row.getFieldValue('activity_log.activity_log_id');
	
		// open edit dialog
		editCAItem(activity_log_id, function(){
			/*
			 * KB 3027943 IOAN Refresh scoreboard and details with applied console restriction,
			 * not with new values from filter console
			 */
			//controller.abEsScoreboard_filterConsole_onShow();
			controller.genTime = new Date();
			controller.abEsScoreboard_scoreboard.refresh(controller.consoleRestriction);
			abEsScoreboard_scoreboard_onClickItem(controller.drillDownContext);
		});
	},
	abEsScoreboard_details_onCreateWorkReq: function(row, action){
		var controller = this;
		if(!createWorkRequest(this.view, row, function(){
				/*
				 * KB 3027943 IOAN Refresh scoreboard and details with applied console restriction,
				 * not with new values from filter console
				 */
				//controller.abEsScoreboard_filterConsole_onShow();
				controller.genTime = new Date();
				controller.abEsScoreboard_scoreboard.refresh(controller.consoleRestriction);
				abEsScoreboard_scoreboard_onClickItem(controller.drillDownContext);
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
	var panel = Ab.view.View.getControl(window, 'abEsScoreboard_scoreboard');
	panel.getCellElement(row, column, 0).parentNode.className = class_name;
	panel.getCellElement(row, column, 1).parentNode.className = class_name;
}

/**
 * show scoreboard details
 */
function abEsScoreboard_scoreboard_onClickItem(context){
	var controller = View.controllers.get("esScoreBoardCtrl");
	controller.drillDownContext = context;
	var restriction = context.restriction;
	
	var detailsPanel = View.panels.get('abEsScoreboard_details');
	detailsPanel.addParameter('consoleRestriction', controller.consoleRestriction); 
	detailsPanel.refresh(restriction);
	
	var objTabs = View.panels.get('abEsScoreboard_tabs');
	objTabs.selectTab('abEsScoreboard_details_tab');
	objTabs.tabs[1].config['enabled'] = 'true';
}

/*
 * 05/19/2010 IOAN KB 3027568
 * reset Only with Work Orders in Process checkbox
 */

function resetCheckbox(){
	document.getElementById('chk_active_work_order').checked = false;
}
