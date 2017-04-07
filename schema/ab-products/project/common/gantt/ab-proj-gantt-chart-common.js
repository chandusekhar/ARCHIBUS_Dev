function getActivityDuration(startDateISO, endDateISO, days_per_week) {
	var days = 1 + Math.ceil((getDateObject(endDateISO).getTime() - getDateObject(startDateISO).getTime()) / (1000*60*60*24)); // endDate - startDate, inclusive
	var weeks = Math.floor(days / 7);
	var daysRemain = days % 7;
	var durationRemain = getDurationRemain(endDateISO, days_per_week, daysRemain);
	var duration = days_per_week * weeks + durationRemain;
	return duration;
}

function adjustStartDateByDaysPerWeek(startDateISO, days_per_week) {
	var date = getDateObject(startDateISO);
	var day = date.getDay(); // (0 - 6) 0 = Sunday
	if (day == 0) day = 7; // (1 - 7) 1 = Monday
	if (day > days_per_week) return dateAddDays(date, 8-day); // adjust start date up to next working day
	else return dateAddDays(date, 0);
}

function truncateEndDateByDaysPerWeek(endDateISO, days_per_week) {
	var date = getDateObject(endDateISO);
	var day = date.getDay(); // (0 - 6) 0 = Sunday
	if (day == 0) day = 7; // (1 - 7) 1 = Monday
	if (day > days_per_week) return dateAddDays(date, days_per_week - day); // truncate non-working days
	else return dateAddDays(date, 0);
}

// Returns the number of working days in daysRemain
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

function getDaysPerWeek(actionId, controller) {	
	var restriction = {'activity_log.activity_log_id': actionId};
	var record = controller.projGanttChartDsActivityLogItems.getRecord(restriction);
	var days_per_week = '5';
	var workPkgId = record.getValue('activity_log.work_pkg_id');
	if (workPkgId) {
		var workPkgRecord = controller.projGanttChartDsWorkPackages.getRecord({'work_pkgs.work_pkg_id' : workPkgId});
		days_per_week = workPkgRecord.getValue('work_pkgs.days_per_week');
	}
	else {
		var projectId = record.getValue('activity_log.project_id');
		var projectRecord = controller.projGanttChartDsProjects.getRecord({'project.project_id' : projectId});
		days_per_week = projectRecord.getValue('project.days_per_week');
	}
	return days_per_week;
}

function dateAddDays(date_start, nxtdays) {
	date_start.setDate(date_start.getDate() + nxtdays);
	var day   = date_start.getDate();
	var month = date_start.getMonth()+1;
	var year  = date_start.getFullYear();
	return FormattingDate(day, month, year, 'YYYY-MM-DD');
}

function reformatDate(date, old_pattern, new_pattern) {
	var delimiter = '';
	if (old_pattern == 'YYYY-MM-DD') delimiter = '-';
	else if (old_pattern == 'YYYY/MM/DD') delimiter = '\/';
	else return date;
	var tempArray = date.split(delimiter);
	return FormattingDate(tempArray[2], tempArray[1], tempArray[0], new_pattern);
}

function getDateObject(ISODate) {
	var tempArray = ISODate.split('-');
	return new Date(tempArray[0], tempArray[1]-1, tempArray[2]);
}

function getValidValue(fieldValue)
{
	fieldValue = fieldValue.replace(/\'/g, "\'\'");
	return fieldValue;
}

/* Task Predecessor Functions */

function cascadeAllTaskDependencies() {
	try {
	    var result = Workflow.callMethod("AbCommonResources-ProjectService-cascadeAllTaskDependencies");
	    if (result.message) {
	    	return true;
	    }
	    else return false;
	} catch (e) {
	    Workflow.handleError(e);
	}	
}

function cascadeTaskDependencies(record) {
	var activity_log_id = parseInt(record.getValue('activity_log.activity_log_id'));
	try {
	    var result = Workflow.callMethod("AbCommonResources-ProjectService-cascadeTaskDependencies", activity_log_id);
	    if (result.message) {
	    	var message = '<b>' + getMessage('adjustedTaskList') + '<br/><br/>' + result.message + '</b>';
	    	View.showMessage(message);
	    	return true;
	    }
	    else return false;
	} catch (e) {
	    Workflow.handleError(e);
	}
}