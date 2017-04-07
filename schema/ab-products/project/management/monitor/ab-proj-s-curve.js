var controller = View.createController('projSCurve', {
	
	afterViewLoad: function() {
		this.projSCurveConsole_onClear();
		this.hidePanels();
		this.calcActivityLogDates();
	},
	
	projSCurveConsole_onClear: function() {
		this.projSCurveConsole.clear();
		$('viewType').value = 'barChart';
		$('analyze').value = 'costs';
		$('display').value = 'baselineActual';
		$('groupBy').value = 'month';
		viewTypeListener();
	},
    
	projSCurveConsole_onShow: function() {
		var activityRestriction = getConsoleRestrictionForActions();
		
		this.projSCurveDs0.addParameter('activityRestriction', activityRestriction);
		var records = this.projSCurveDs0.getRecords();
		if (records.length < 400) this.showProjects(activityRestriction);
		else {		
			var controller = this;
			View.confirm(getMessage('num_records_confirm_message'), function(button){
				if (button == 'yes') {
					controller.showProjects(activityRestriction);							
				}
			});
		}
	},
	
	showProjects: function(activityRestriction) {
		this.hidePanels();
		
		var viewType = $('viewType').value;
		var analyze = $('analyze').value;
		var display = $('display').value;
		var groupBy = $('groupBy').value;
		
		var fromDate = this.projSCurveConsole.getFieldValue('activity_log.date_planned_for');
		var toDate = this.projSCurveConsole.getFieldValue('activity_log.date_planned_end');
		var minDate = this.getIsoDateForRestriction('activity_log.min_date', activityRestriction);
		if (fromDate == "") {
			fromDate = minDate;
			this.projSCurveConsole.setFieldValue('activity_log.date_planned_for', fromDate);
		}
		if (toDate == "") {
			toDate = this.getIsoDateForRestriction('activity_log.max_date', activityRestriction);
			this.projSCurveConsole.setFieldValue('activity_log.date_planned_end', toDate);
		}
		if (display == 'actual') {
			var date = new Date();
			toDate = FormattingDate(date.getDate(), date.getMonth() + 1, date.getFullYear(), "YYYY-MM-DD");
			this.projSCurveConsole.setFieldValue('activity_log.date_planned_end', toDate);
		}
		
		if (groupBy == 'year') View.groupBy = getMessage('year');
		else if (groupBy == 'quarter') View.groupBy = getMessage('quarter');
		else if (groupBy == 'month') View.groupBy = getMessage('month');
		else if (groupBy == 'week') View.groupBy = getMessage('week');
		else View.groupBy = getMessage('date');
		
		if (viewType == 'grid') {
			var panelId = 'projSCurveGrid';
			
			if (analyze == 'work') panelId += 'Wrk';
			else panelId += 'Costs';
			this.refreshGridData(View.panels.get(panelId), activityRestriction, fromDate, toDate, minDate, groupBy);
			return;
		}
		else if (viewType == 'columnLineChart') {
			var panelId = 'projSCurveColumnLine';
			
			if (analyze == 'work') panelId += 'Wrk';
			else panelId += 'Costs';
			
			if (display == 'baseline') panelId += 'Base';
			else if (display == 'design') panelId += 'Design';
			else panelId += 'Act';
			this.refreshChartData(View.panels.get(panelId), activityRestriction, fromDate, toDate, minDate, groupBy);
			return;
		}
		
		else if (viewType == 'lineChart') {
			var panelId = 'projSCurveLine';
			
			if (analyze == 'work') panelId += 'Wrk';
			else panelId += 'Costs';
			
			if (display == 'baseline') panelId += 'Base';
			else if (display == 'design') panelId += 'Design';
			else if (display == 'actual') panelId += 'Act';
			else if (display == 'baselineDesign') panelId += 'BaseDesign';
			else if (display == 'baselineActual') panelId += 'BaseAct';
			else if (display == 'designActual') panelId += 'DesignAct';
			else panelId += 'BaseDesignAct';
			this.refreshChartData(View.panels.get(panelId), activityRestriction, fromDate, toDate, minDate, groupBy);
			return;
		}
		
		else if (viewType == 'barChart') {
			var panelId = 'projSCurveColumn';
			
			if (analyze == 'work') panelId += 'Wrk';
			else panelId += 'Costs';
			
			if (display == 'baselineDesign') panelId += 'BaseDesign';
			else if (display == 'designActual') panelId += 'DesignAct';
			else panelId += 'BaseAct';
			this.refreshChartData(View.panels.get(panelId), activityRestriction, fromDate, toDate, minDate, groupBy);
			return;
		}	
	},
	
	refreshGridData : function(grid, activityRestriction, fromDate, toDate, minDate, groupBy) {
		var controller = this;
		try {
			var jobId = Workflow.startJob('AbProjectManagement-SCurveHandlers-getGridData', activityRestriction, fromDate, toDate, minDate, groupBy);
			View.openJobProgressBar(getMessage('progressMessage'), jobId, '', function(status) {
				if (valueExists(status.dataSet)) {
					var records = status.dataSet.records;
					grid.setRecords(records);
					grid.show(true);
					grid.removeSorting();
				}
			});
		} catch (e) {
		    Workflow.handleError(e);
		}
	},
	
	refreshChartData : function(chart, activityRestriction, fromDate, toDate, minDate, groupBy) {
		chart.addParameter("activityRestriction", activityRestriction);
		chart.addParameter("fromDate", fromDate);
		chart.addParameter("toDate", toDate);
		chart.addParameter("minDate", minDate);
		chart.addParameter("groupBy", groupBy);
		View.initializeProgressBar();
		chart.refresh();
		View.closeProgressBar();
		chart.show(true);
	},
	
	hidePanels : function() {
		View.panels.each(function(panel) {
		    if (panel.id.substr(0, 10) == "projSCurve" && panel.id != "projSCurveConsole")
		    	panel.show(false);
		});
	},
	
	getIsoDateForRestriction : function(fieldName, restriction) {
		var date = new Date();
		var dateIso = FormattingDate(date.getDate(), date.getMonth() + 1, date.getFullYear(), "YYYY-MM-DD");
		this.projSCurveDs2.addParameter('activityRestriction', restriction);
		var record = this.projSCurveDs2.getRecord();
		var base_value = record.getValue(fieldName + '_base');
		var design_value = record.getValue(fieldName + '_design');
		var act_value = record.getValue(fieldName + '_act');
		if (base_value == "" && design_value == "" && act_value == "") return dateIso;
		
		var replaceNull = '2999-12-31';
		if (fieldName == 'activity_log.max_date') replaceNull = '1900-01-01';
		
		if (base_value == "") base_value = replaceNull;
		else base_value = FormattingDate(base_value.getDate(), base_value.getMonth() + 1, base_value.getFullYear(), "YYYY-MM-DD");
		if (design_value == "") design_value = replaceNull;
		else design_value = FormattingDate(design_value.getDate(), design_value.getMonth() + 1, design_value.getFullYear(), "YYYY-MM-DD");
		if (act_value == "") act_value = replaceNull;
		else act_value = FormattingDate(act_value.getDate(), act_value.getMonth() + 1, act_value.getFullYear(), "YYYY-MM-DD");
		
		if (fieldName == 'activity_log.min_date') {
			if (base_value <= design_value && base_value <= act_value) dateIso = base_value;
			else if (design_value <= act_value) dateIso = design_value;
			else dateIso = act_value;
		}
		else if (fieldName == 'activity_log.max_date') {			
			if (base_value >= design_value && base_value >= act_value) dateIso = base_value;
			else if (design_value >= act_value) dateIso = design_value;
			else dateIso = act_value;
		}
		return dateIso;
	},
	
	calcActivityLogDates : function() {
		var parameters = {'project_id':''};
		var result = Workflow.callMethodWithParameters('AbCommonResources-ActionService-calcActivityLogDatePlannedEndForProject', parameters);
		if (result.code == 'executed') {		
		} 
		else 
		{
			alert(result.code + " :: " + result.message);
			return false;
		}
		result = Workflow.callMethodWithParameters('AbCommonResources-ActionService-calcActivityLogDateSchedEndForProject', parameters);
		if (result.code == 'executed') {
			return true;
		} 
		else 
		{
			alert(result.code + " :: " + result.message);
			return false;
		}
	}
});

function getConsoleRestrictionForActions() 
{
	var console = View.panels.get('projSCurveConsole');
 
    var restriction = "";
    var project_id = getValidValue(console, 'activity_log.project_id');
	if (project_id) restriction += getMultiSelectFieldRestriction('activity_log.project_id', project_id) + " AND ";
   	var work_pkg_id = getValidValue(console, 'activity_log.work_pkg_id');
   	if (work_pkg_id) restriction += "activity_log.work_pkg_id LIKE \'" + work_pkg_id + "\' AND "; 
   	var site_id = getValidValue(console, 'activity_log.site_id');
   	if (site_id)	{
   		restriction += "(project.site_id LIKE \'" + site_id + "\' OR ";
   		restriction += "bl.site_id LIKE \'" + site_id + "\') AND ";
   	}
   	var bl_id = getValidValue(console, 'activity_log.bl_id');
   	if (bl_id)	restriction += "project.bl_id LIKE \'" + bl_id + "\' AND ";
   	var dv_id = getValidValue(console, 'activity_log.dv_id');
   	if (dv_id)	restriction += "project.dv_id LIKE \'" + dv_id + "\' AND ";
   	var dp_id = getValidValue(console, 'activity_log.dp_id');
   	if (dp_id)	restriction += "project.dp_id LIKE \'" + dp_id + "\' AND "; 
   	var program_type = getValidValue(console, 'program.program_type');
   	if (program_type)	restriction += "program.program_type LIKE \'" + program_type + "\' AND "; 
   	var program_id = getValidValue(console, 'project.program_id');
   	if (program_id)	restriction += "project.program_id LIKE \'" + program_id + "\' AND ";

    restriction += " 1=1 ";
	return restriction;
}

function getValidValue(panel, inputFieldName)
{
	var fieldValue = panel.getFieldValue(inputFieldName).trim();
	fieldValue = fieldValue.replace(/\'/g, "\'\'");
	return fieldValue;
}

function viewTypeListener() 
{
	var viewType = $('viewType').value;
	if (viewType == 'grid') {
		$('display').value = 'baselineDesignActual';
		$('display').disabled = true;
	}
	
	else if (viewType == 'columnLineChart') {
		var display = $('display').value;
		if (display == 'baselineDesign' || display == 'baselineActual' || display == 'designActual' || display == 'baselineDesignActual')
			$('display').value = 'baseline';
		$('display').disabled = false;
		$('display').options[0].disabled = false;
		$('display').options[1].disabled = false;
		$('display').options[2].disabled = false;
		$('display').options[3].disabled = true;
		$('display').options[4].disabled = true;
		$('display').options[5].disabled = true;
		$('display').options[6].disabled = true;
	}
	
	else if (viewType == 'lineChart') {
		$('display').disabled = false;
		$('display').options[0].disabled = false;
		$('display').options[1].disabled = false;
		$('display').options[2].disabled = false;
		$('display').options[3].disabled = false;
		$('display').options[4].disabled = false;
		$('display').options[5].disabled = false;
		$('display').options[6].disabled = false;
	}
	
	else if (viewType == 'barChart') {
		var display = $('display').value;
		if (display == 'baseline' || display == 'design' || display == 'actual' || display == 'baselineDesignActual')
			$('display').value = 'baselineActual';
		$('display').disabled = false;
		$('display').options[0].disabled = true;
		$('display').options[1].disabled = true;
		$('display').options[2].disabled = true;
		$('display').options[3].disabled = false;
		$('display').options[4].disabled = false;
		$('display').options[5].disabled = false;
		$('display').options[6].disabled = true;
	}
}

function getMultiSelectFieldRestriction(field, consoleFieldValue){
    var restriction = "";
    restriction =  field + " IN " + stringToSqlArray(consoleFieldValue);
    return restriction;
}

function stringToSqlArray(string){
    var values = string.split(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
    var resultedString = "('" + values[0] + "'";
    
    for (i = 1; i < values.length; i++) {
        resultedString += " ,'" + values[i] + "'";
    }
    
    resultedString += ")"
    
    return resultedString;
}

function afterSelectProjectId(fieldName, newValue, oldValue) {
	var projSCurveController = View.controllers.get('projSCurve');
	projSCurveController.projSCurveConsole.setFieldValue('activity_log.date_planned_for','');
	projSCurveController.projSCurveConsole.setFieldValue('activity_log.date_planned_end','');
	return true;
}