function calculateActivityDuration() {
	var form = View.panels.get('projUpdateActionsForm');	
	var startDateISO = form.getFieldValue('activity_log.date_started');
	var endDateISO = form.getFieldValue('activity_log.date_completed');

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
	var ds = View.dataSources.get('projUpdateActionsDs0');
	var restriction = {'activity_log.activity_log_id': actionId};
	var record = ds.getRecord(restriction);
	var days_per_week = '5';
	var workPkgId = record.getValue('activity_log.work_pkg_id');
	if (workPkgId) {
		days_per_week = record.getValue('work_pkgs.days_per_week');
	}
	else {
		days_per_week = record.getValue('project.days_per_week');
	}
	return days_per_week;
}

function getDateObject(ISODate) {
	var tempArray = ISODate.split('-');
	return new Date(tempArray[0], tempArray[1]-1, tempArray[2]);
}