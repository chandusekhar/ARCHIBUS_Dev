/**
 * get current date in ISO format(like '07/20/2011')
 */
function getCurrentDate() {
	var curDate = new Date();
	var month = curDate.getMonth() + 1;
	var day = curDate.getDate();
	var year = curDate.getFullYear();
	return  year+ "-" +((month < 10) ? "0" : "") + month + "-"  + ((day < 10) ? "0" : "") + day;
}
/**
 * get date in ISO format(like '07/20/2011')
 */
function formatDate(curDate) {
	var month = curDate.getMonth() + 1;
	var day = curDate.getDate();
	var year = curDate.getFullYear();
	return ((month < 10) ? "0" : "") + month  + "/" + ((day < 10) ? "0" : "") + day + "/" + year;
}

/**
 * add period to change the date field value in console
 */
function addPeriod(periodType, num, controller) {
	var console=controller.console;
	var dateToAddField=controller.dateToAddField;
	var dateToUpdateField=controller.dateToUpdateField;
	var timeLine=controller.timeLine;
	if(!timeLine){
		timeLine = controller.console;
	}
	var console=controller.console;
	
	var record = console.getRecord();
	var action=timeLine.actions.get('currentDate');
	var date_start = record.getValue(dateToAddField);
	if (console.getFieldValue(dateToAddField) != '') {

		if (periodType == "MONTH") {
			date_start = date_start.add(Date.MONTH, num);
		} else if (periodType == "YEAR") {
			date_start = date_start.add(Date.YEAR, num);
		} else {
			date_start = date_start.add(Date.DAY, num);
		}

		record.setValue(dateToUpdateField, date_start);
		console.onModelUpdate();
		action.setTitle(console.getFieldElement(dateToAddField).value);
		if("afterTimeButtonClick" in controller){
			controller.afterTimeButtonClick();
		}
	}
}
/**
 * Choose previous year
 */
function previousYear() {
	addPeriod("YEAR", -1, controller);
}

/**
 *  Choose previous month
 */
function previousMonth() {
	addPeriod("MONTH", -1, controller);
}
		
/**
 * Choose previous week
 */
function previousWeek() {
	addPeriod("WEEK", -7, controller);
}

/**
 * Choose next Year
 */
function nextYear() {
	addPeriod("YEAR", 1, controller);
}

/**
 * Choose next month
 */
function nextMonth() {
	addPeriod("MONTH", 1, controller);
}

/**
 * Choose next week
 */
function nextWeek() {
	addPeriod("WEEK", 7, controller);
}
/**
 * change timeline button title
 */
function setTimeTitle(panel){
	var	previousYear=panel.actions.get('previousYear');
	previousYear.setTitle("&lt;&lt;&lt;");
	var previousMonth=panel.actions.get('previousMonth');
	previousMonth.setTitle("&lt;&lt;");
	var previousWeek=panel.actions.get('previousWeek');
	previousWeek.setTitle("&lt;");
	var nextWeek=panel.actions.get('nextWeek');
	nextWeek.setTitle("&gt;");
	var nextMonth=panel.actions.get('nextMonth');
	nextMonth.setTitle("&gt;&gt;");
	var nextYear=panel.actions.get('nextYear');
	nextYear.setTitle("&gt;&gt;&gt;");
}

/**
 * Change timeline button title to current date as well as fill back value to console's date field and do refresh
 */
function backToCurrentDate(mainController){
	var ctrl=(mainController?mainController:controller);
	var console=ctrl.console;
	var record = console.getRecord();
	var timeLine=ctrl.timeLine;
	if(!timeLine){
		timeLine = ctrl.console;
	}
	var action=timeLine.actions.get('currentDate');

	record.setValue(ctrl.dateToUpdateField, new Date());
	console.onModelUpdate();
	action.setTitle(console.getFieldElement(ctrl.dateToAddField).value);
	if("afterTimeButtonClick" in ctrl){
		ctrl.afterTimeButtonClick();
	}
}
