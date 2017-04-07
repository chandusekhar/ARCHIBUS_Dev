function selectNestedTab(tabs, tabName, nestedTabs, nestedTabName, restriction) {
	for (var i = 0; i < nestedTabs.tabs.length; i++) {
        var tab = nestedTabs.tabs[i]; 
        nestedTabs.setTabRestriction(tab.name, restriction);
	}
	nestedTabs.selectTab(nestedTabName, restriction, false, false, false);
	tabs.showTab(tabName, true);
	tabs.selectTab(tabName, restriction, false, false, false);
}

function onCalcEndDatesForProject(project_id)
{
	var parameters = {'project_id':project_id};
	var result = Workflow.callMethodWithParameters('AbCommonResources-ActionService-calcActivityLogDatePlannedEndForProject',parameters);
	if (result.code == 'executed') {
		return true;		
	} 
	else 
	{
		alert(result.code + " :: " + result.message);
		return false;
	}
	var result = Workflow.callMethodWithParameters('AbCommonResources-ActionService-calcActivityLogDateSchedEndForProject',parameters);
	if (result.code == 'executed') {
		return true;		
	} 
	else 
	{
		alert(result.code + " :: " + result.message);
		return false;
	}	
}

function validateDateFields(panel, date_field_start, date_field_end, checkDateBeforeCurrent) 
{	
	var date_start = getDateObject(panel.getFieldValue(date_field_start));//note that getFieldValue returns date in ISO format
	var date_end = getDateObject(panel.getFieldValue(date_field_end));
	if (date_end < date_start) {
		panel.addInvalidField(date_field_end, getMessage('endBeforeStart'));
		panel.displayValidationResult('');
		return false;
	}
	if (checkDateBeforeCurrent) {
		var curDate = new Date();
		if ((curDate - date_start)/(1000*60*60*24) >= 1) {
			if (!confirm(getMessage('dateBeforeCurrent'))) return false;		
		}
	}
	return true;    	
}

function getDateObject(ISODate)
{
	var tempArray = ISODate.split('-');
	return new Date(tempArray[0],tempArray[1]-1,tempArray[2]);
}

function closeNonMainPanels(tabPanel, currentTabName) {
	var tab = tabPanel.findTab(currentTabName);
	if (tab.hasView()) {
		 if (!tab.isContentLoading) {				 
			var iframe = tab.getContentFrame();				
			var childView = iframe.View;
			if (valueExists(childView)) {
				// hide all panels except main panel
				childView.panels.each(function(panel) {
				    if (panel.id != childView.mainPanelId)
				    	panel.show(false);
				}); 
			 }
		 }
	 }
}

function reloadGantt(tabPanel, newTabName) {
	var tab = tabPanel.findTab(newTabName);
	if (tab.hasView() && tab.isContentLoaded) {
		 tab.loadView();
	}
}

function calculateActivityDuration(panelId, startDateISO, endDateISO) {
	var form = View.panels.get(panelId);	
	if (!valueExists(startDateISO)) startDateISO = form.getFieldValue('activity_log.date_started');
	if (!valueExists(endDateISO)) endDateISO = form.getFieldValue('activity_log.date_completed');

	if (startDateISO == '' || endDateISO == '') {
		form.setFieldValue('activity_log.duration_act', 0);
		return;
	}
	if (endDateISO < startDateISO) {
		endDateISO = startDateISO;
		form.setFieldValue('activity_log.date_completed', startDateISO);
	}
	
	var days_per_week = getDaysPerWeek(form.getFieldValue('activity_log.activity_log_id'));
	var duration = getActivityDuration(startDateISO, endDateISO, days_per_week);
	form.setFieldValue('activity_log.duration_act', duration);
	return true;
}


function calculateActivityDateEnd(panelId, startDateISO, duration){
	var form = View.panels.get(panelId);	
	if (!valueExists(startDateISO)) startDateISO = form.getFieldValue('activity_log.date_started');
	if (!valueExists(duration)) duration = form.getFieldValue('activity_log.duration');
	
	if(!valueExistsNotEmpty(startDateISO)){
		return false;
	}
	
	if(duration == '' || duration == 0){
		form.setFieldValue('activity_log.date_completed', startDateISO);
		return;
	}

	var days_per_week = getDaysPerWeek(form.getFieldValue('activity_log.activity_log_id'));
	var endDateISO = getDateEndForActivity(startDateISO, duration, days_per_week);
	form.setFieldValue('activity_log.date_completed', endDateISO);
	return true;
}

function calculateActivityDateScheduledEnd(panelId, startDateISO, duration){
	var form = View.panels.get(panelId);	
	if (!valueExists(startDateISO)) startDateISO = form.getFieldValue('activity_log.date_scheduled');
	if (!valueExists(duration)) duration = form.getFieldValue('activity_log.duration');
	
	if(!valueExistsNotEmpty(startDateISO)){
		return false;
	}
	
	if(duration == '' || duration == 0){
		form.setFieldValue('activity_log.date_scheduled_end', startDateISO);
		return;
	}

	var days_per_week = getDaysPerWeek(form.getFieldValue('activity_log.activity_log_id'));
	var endDateISO = getDateEndForActivity(startDateISO, duration, days_per_week);
	form.setFieldValue('activity_log.date_scheduled_end', endDateISO);
	return true;
}


function getDateEndForActivity(startDateISO, duration, days_per_week) {
	if (duration == 0) return startDateISO;
	startDateISO = dateAddDays(getDateObject(startDateISO), -1);
	startDateISO = truncateEndDateByDaysPerWeek(startDateISO, days_per_week);
	var weeks = Math.floor(duration/days_per_week);
	var endDate = getDateObject(dateAddDays(getDateObject(startDateISO), weeks * 7));
	var durationRemain = duration % days_per_week; 
	while (durationRemain > 0) {
		endDate.setDate(endDate.getDate() + 1);
		var day = endDate.getDay(); // (0 - 6) 0 = Sunday
		if (day == 0) day = 7; // (1 - 7) 1 = Monday
		if (day <= days_per_week) durationRemain--; // check if day is a working day
	}
	var endDateISO = dateAddDays(endDate, 0);
	endDateISO = truncateEndDateByDaysPerWeek(endDateISO, days_per_week);
	return endDateISO;	
}


function getActivityDuration(startDateISO, endDateISO, days_per_week) {
	var days = 1 + Math.ceil((getDateObject(endDateISO).getTime() - getDateObject(startDateISO).getTime()) / (1000*60*60*24)); // endDate - startDate, inclusive
	var weeks = Math.floor(days / 7);
	var daysRemain = days % 7;
	var durationRemain = getDurationRemain(endDateISO, days_per_week, daysRemain);
	var duration = days_per_week * weeks + durationRemain;
	return duration;
}

//Returns the number of working days in daysRemain
function getDurationRemain(endDateISO, days_per_week, daysRemain) {
	var endDate = getDateObject(endDateISO);
	var durationRemain = 0;
	while (daysRemain > 0) {
		var day = endDate.getDay(); // (0 - 6) 0 = Sunday
		if (day == 0) day = 7; // (1 - 7) 1 = Monday
		if (day <= days_per_week) durationRemain++; // check if day is a working day
		endDate.setDate(endDate.getDate() - 1);
		daysRemain--;
	}
	return durationRemain;	
}

function getDaysPerWeek(actionId) {	
	var ds = View.dataSources.get('projMngCommonDs0');
	var restriction = {'activity_log.activity_log_id': actionId};
	var record = ds.getRecord(restriction);
	var days_per_week = '5';
	if (valueExists(record) && !record.isNew) {
		// if is new action record is not defined yet
		var workPkgId = record.getValue('activity_log.work_pkg_id');
		if (workPkgId) {
			days_per_week = record.getValue('work_pkgs.days_per_week');
		}
		else {
			days_per_week = record.getValue('project.days_per_week');
		}
	}
	return days_per_week;
}

function getValidRestVal(value)
{
	value = value.replace(/\'/g, "\'\'");
	value = value.replace(/&apos;/g, "\'\'");
	return value;
}

function getMultiSelectFieldRestriction(field, consoleFieldValue){
	var restriction = "";
    if (field[2]) {
        restriction =  field[2] + " IN " + stringToSqlArray(consoleFieldValue);
    }
    else {
        restriction =  field[0] + " IN " + stringToSqlArray(consoleFieldValue);
    }
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

function updatePctComplete(panelId) {
	var form = View.panels.get(panelId);
	var status = form.getFieldValue('activity_log.status');
	var pct_complete = form.getFieldValue('activity_log.pct_complete');
	if (status == 'COMPLETED' || status == 'COMPLETED-V' || status == 'CLOSED') {		  
		form.setFieldValue('activity_log.pct_complete', 100);
	}
	else if (pct_complete == 100) {
		form.setFieldValue('activity_log.pct_complete', 0);
	}
}

function verifyEndAfterStart(formId, dateStartField, dateEndField) {
	var form = View.panels.get(formId);
	var date_started = form.getFieldValue(dateStartField);
	var date_completed = form.getFieldValue(dateEndField);
	if (date_started != '' && date_completed != '' && date_completed < date_started) {
		form.setFieldValue(dateEndField, date_started);
	}
}

function dateAddDays(date_start, nxtdays) {
	date_start.setDate(date_start.getDate() + nxtdays);
	var day   = date_start.getDate();
	var month = date_start.getMonth()+1;
	var year  = date_start.getFullYear();
	return FormattingDate(day, month, year, 'YYYY-MM-DD');
}

function truncateEndDateByDaysPerWeek(endDateISO, days_per_week) {
	var date = getDateObject(endDateISO);
	var day = date.getDay(); // (0 - 6) 0 = Sunday
	if (day == 0) day = 7; // (1 - 7) 1 = Monday
	if (day > days_per_week) return dateAddDays(date, days_per_week - day); // truncate non-working days
	else return dateAddDays(date, 0);
}

function getDateObject(ISODate) {
	var tempArray = ISODate.split('-');
	return new Date(tempArray[0], tempArray[1]-1, tempArray[2]);
}


