//test check in
// <!--v:1.3--> 
var timePattern24H = "HH:mm";

function ABRV_Clone(originalObject) {
	var newObject = [];
	
	for ( var key in originalObject )
    {
	    if ( typeof(originalObject[key]) == 'object')
        { 
            newObject[key] = ABRV_Clone(originalObject[key]);
        }
        else
        {
            newObject[key] = originalObject[key];
        }
    }
    return newObject;
}

/**
 * return an array which contains the values of the fields that are defined in the data source. 
 * @param {Object} dataSourceId
 */
function ABRV_getDataRecordValues(dataSourceId){

	var dataSource = View.dataSources.get(dataSourceId);
	var formattedValues = {};
	 
	for(var i=0;i<dataSource.fieldDefs.items.length;i++){
		
		var fieldId = dataSource.fieldDefs.items[i].id;
		if(ABRV_containField(fieldId) == true){
			formattedValues[fieldId] = ABRV_getFieldValue(fieldId);
		}				
	}
	return formattedValues;
}

/**
 * if the field is included in any form panels in the view,
 * return true, otherwise return false.
 *  
 * @param {Object} fieldId
 */
function ABRV_containField(fieldId){
	
	for(var i=0;i<View.panels.items.length;i++){
		var panel = View.panels.items[i];
		
		if(panel.type != 'form') continue;
		
		if(panel.containsField(fieldId)){
			return true;		
		}	
	}
	return false;
}

/**
 * Loop all form panels in View, and return the field value.
 * Note:If the filed appears in mutiple panels, it will return 
 * the value when it meets a panel, and it will not check any others..
 *  
 * @param {Object} fieldId
 */
function ABRV_getFieldValue(fieldId){
	var value = '';
	for(var i=0;i<View.panels.items.length;i++){
		var panel = View.panels.items[i];
		
		View.log(panel.id,"info");
		if(panel.type != 'form') continue;
		
		if(panel.containsField(fieldId)){
			// convert to string
			value = panel.getFieldValue(fieldId) + '';		
			break;
		}	
	}
	return value;
}

/**
 * return a array which contains all fields defined 
 * in the given panel and the fields's value.
 * 
 * @param {Object} panel
 */
function ABRV_getDataRecord(panel){
	var recordValues = ABRV_getDataRecordValues(panel.dataSourceId);
   	recordValues = ABRV_handleDataRecordValues(recordValues);
   	return recordValues;
}


/**
* in order to keep up with the version 1.0 to suitable for the work flow rule.
*/
function ABRV_handleDataRecordValues(recordValues){
	
	var formattedValues = "";
	for (var name in recordValues) {
	    var value = recordValues[name];
	    
	    formattedValues = formattedValues + name;
	    if(name == 'activity_log_hactivity_log.po_id'){
	    	if(value == '0') 
	    		value = '';
	    }else if(name == 'activity_log_hactivity_log.act_quest'
	    			||name == 'activity_log.act_quest'){
	    	if(value == null || value == 'undifined')
	    		value = '';		
	    	//value = convert2validXMLValue(value);
	    	
	    }else if(name == 'activity_log.priority'){
	    	if(value == '0') 
	    		value = '';
	    }else if(name == 'activity_log.activity_log_id'){
	    	if(value == '0' || value == 0) 
	    		value = '';
	    }else if(name == 'activity_log.po_id'){
	    	if(value == '0' || value == 0) 
	    		value = '';
	    }
	    //convert string
	    value = value + '';
	    
	    formattedValues = formattedValues + '="' + convert2validXMLValue(value) + '" ';
	}   
   	return '<record '  + formattedValues + ' />';
}


/**
 * delete a record from a form, then refresh another panel.
 * 
 * @param {Object} panelId The delete record in this panel (form).
 * @param {Object} refreshPanel refresh the other panel.
 * @param {Object} visible if true to show the panel, otherwise hidden it.
 */
function ABRV_deleteRecord(panelId, refreshPanelId, visible) {
	var panel = View.panels.get(panelId);
	var refreshPanel = View.panels.get(refreshPanelId);
	
	View.confirm(
		getMessage('deleteRecord'),
		function(button){
			if (button == 'yes') {
				if (panel.deleteRecord()) {
					refreshPanel.refresh();
					panel.show(visible);	
				}
			}
		});
}

/**
 * save a record from a form, then refresh another panel.
 * 
 * @param {Object} panelId The delete record in this panel (form).
 * @param {Object} refreshPanel refresh the other panel.
 * @param {Object} visible if true to show the panel, otherwise hidden it.
 */
function ABRV_saveRecord(panelId, refreshPanelId, visible) {
	var panel = View.panels.get(panelId);
	var refreshPanel = View.panels.get(refreshPanelId);
	
	if (panel.save()) {
		refreshPanel.refresh();
		panel.show(visible);	
	}
}

/**
 * show/hidden the given panel according the parameter visible.
 * 
 * @param {Object} panelId panelId
 * @param {Object} visible show panel if visible is ture, otherwise hidden it.
 */
function ABRV_showPanel(panelId, visible) {
	var panel = View.panels.get(panelId);
	panel.show(visible);
	
}

/**
 * Build a restriction from console, and apply it on report panel.
 * 
 * @param {Object} reportPanelId	The report will list all records according the parameters in console panel
 * @param {Object} consolePanelId   The Id of console panel.
 * @param {Object} showReport optional true(show)/hidden(false) report panel, default is true.
 */
function ABRV_onShowReport(reportPanelId, consolePanelId, showReport) {
	var restriction = buildReportRestriction(consolePanelId);
	if (restriction === null && restriction.isEmpty()) {
		return;
	}
	
	var reportPanel = View.panels.get(reportPanelId);
	reportPanel.refresh(restriction);
	
	if (showReport == null || showReport == 'undefined') {
		showReport = true;
	}	
	
	reportPanel.show(true);
}

/**
 * Response for clicking on chart panel/cross table.
 * In general, it pops up a dialog to list all related records.
 * 
 * @param {Object} obj the obj from panel, chart panel/cross table
 */
function ABRV_showReportOnChartPanel(obj, url,consolePanelId) {
	ABRV_showReportOnCrossTablePanel(obj, url);
}

/**
 * Response for clicking on chart panel/cross table.
 * In general, it pops up a dialog to list all related records.
 * 
 * @param {Object} obj the obj from panel, chart panel/cross table
 */
function ABRV_showReportOnCrossTablePanel(obj, url) {
	var restriction = obj.restriction;
	var consoleRestriction = View.panels.get(obj.parentPanelId).restriction;
	restriction.addClauses(consoleRestriction);
	View.openDialog(url, restriction);
}

/**
 * Logs WF rule error.
 * @param {Object} result
 * @param {Object} ruleName
 */
function ABRV_logError(result, ruleName) {
	View.showMessage(result.code + ": " + ruleName + "\n" + result.message);
}

/**
 * Creates a number of checkbox controls from specified array of names and values.
 * The controls are created next to the specified "All" checkbox. 
 * @param {Object} checkboxIdPrefix -- ID attribute prefix for checkbox HTML elements.
 * @param {Object} values -- Array of objects that must contain "name" and "type" properties.
 *                           Name property is displayed next to the checkbox.
 *                           Value property is set as a checkbox value.
 */
function ABRV_createCheckboxes(checkboxIdPrefix, values) {
	var checkboxAll = $(checkboxIdPrefix + "_all");
	var checkboxParent = checkboxAll.parentNode;
	var PER_LINE = 5;

	for (var i = 0; i < values.length; i++) {
    	var value = values[i];
	    var checkbox = window.document.createElement("input");

		checkbox.type = "checkbox";
		checkbox.id = checkboxIdPrefix + "_" + value.type;
		checkbox.value = value.type;
		checkboxParent.appendChild(checkbox);
		checkboxParent.appendChild(window.document.createTextNode(value.name));

		if ((i + 1) % PER_LINE == 0) {
			checkboxParent.appendChild(window.document.createElement("br"));
		}
	}
}

/**
 * Shows or hides specified panel.
 * @param {Object} id id attribute of the AXVW panel element.
 * @param {Object} visible Boolean flag, defines if the panel should be displayed (true) or hidden (false).
 * @param {Object} hideHead Boolean flag, defines if the panel's head should be displayed (true) or hidden (false).
 */
function ABRV_showHidePanel(panelId, visible, hideHead) {
	var panel = View.panels.get(panelId);
	panel.showHeader(!hideHead);
	panel.show(visible, false);
}


/**
 * Returns value of the selected radio button.
 * @param {Object} name -- Name attribute of the radio button HTML elements.
 */
function ABRV_getSelectedRadioButton(name) {
	var radioButtons = document.getElementsByName(name);

	for (var i=0; i < radioButtons.length; i++) {
		if (radioButtons[i].checked == 1) {
			return radioButtons[i].value; 
		}
	}
	return null;
}

/**
 * Fills in specified array with values of selected checkboxes.
 * @param {Object} checkboxIdPrefix -- ID attribute prefix for checkbox HTML elements.
 * @param {Object} values -- Array of objects that must contain "name" and "type" properties.
 *                           Value property is set from a checkbox value.
 * @return Comma-separated list of "type" properties for selected checkboxes only.
 */
function ABRV_getCheckboxValues(checkboxIdPrefix, values) {
	var result = "";

	for (var i = 0; i < values.length; i++) {
		var value = values[i];
		var checkbox = $(checkboxIdPrefix + "_" + value.type);

		if (checkbox.checked) {
			if (result != "") {
				result = result + ",";
			}
			result = result + value.type;
		}
	}
	return result;
}

/**
 * Sets the checked property of all checkboxes from the checked property of the "all" checkbox.
 * @param {Object} checkboxIdPrefix
 * @param {Object} values
 */
function ABRV_setCheckboxValues(checkboxIdPrefix, values) {
	var checkboxAll = $(checkboxIdPrefix + "_all");

	for (var i = 0; i < values.length; i++) {
		var value = values[i];
		var checkbox = $(checkboxIdPrefix + "_" + value.type);
		
		checkbox.checked = checkboxAll.checked;
	}
}


// -------------------------------------------------------------------------------------------------
// Returns the previous year for the year parameter 
// @param {year} Year at format yyyy
//
function getPrevYear(year) {
	year = year + "";
	year = parseInt(year, 10);
	
	if( year > 1900 )
		year =  year - 1;
	else
		year =  9999;
	
	return year;
}

// -------------------------------------------------------------------------------------------------
// Returns the next year for the year parameter 
// @param {year} Year at format yyyy
//
function getNextYear(year) {
	year = year + "";
	year = parseInt(year, 10);

	if(  year < 9999 )
		year = year + 1;
	else
		year = 1900;

	return year;
}

// -------------------------------------------------------------------------------------------------
// Returns the previous/next month for the month parameter
// @param {month} Month at format MM
// @param {mode} To indicate if the function must give back the next/previous (N/P) month
//
function getPrevNextMonth(month,mode){
	month = month + "";
	month = parseInt(month, 10);
	
	if (mode == "P")
		month = month - 1;
	if (mode == "N")
		month = month + 1;

	return month;
}

// -------------------------------------------------------------------------------------------------
// Get the max days in input month/year
// (leap-year is processed in this function) 
// @param {numMonth} Month at format MM
// @param {numYear} Year at format yyyy
//
function GetMonthMaxDays(numMonth, numYear) {
	var maxDaysMonth = -1;

	if(numMonth < 0)
		numMonth = 1;

	if(numMonth > 12)
		numMonth = 12;

	if(numYear<0)
		numYear = 0;

	//To cross the 12 months 
	for(var i = 0; i < 12; i++)
	{
		if((numMonth-1) == i)
		{
			if(i == 0 || i == 2 || i == 4 || i == 6 || i == 7 || i == 9 || i == 11)
				maxDaysMonth = 31;
			else if (i == 3 || i == 5 || i == 8 || i == 10)
				maxDaysMonth = 30;
			else
			{
				//leap-year / february / days
				if ((numYear % 4 == 0) || (numYear % 100 == 0) || (numYear % 400 == 0))
					maxDaysMonth = 29;
				else
					maxDaysMonth = 28;
			}
			break;
		}
	}
	return maxDaysMonth;
}

/**
 * Transform a date in format ISO (YYYY-MM-DD) to user format according to strDateShortPattern
 * Example "2006-02-04" --> "4/2/2006", if strDateShortPattern --> M/D/YYYY
 * @param {Object} ISODate -- Date at format ISO (YYYY-MM-DD)
 */
function ABRV_ISODate2UserDate(ISODate) {
	var arrayDate = [];

	arrayDate = ISODate.split("-");
	var year = arrayDate[0];
	var month = arrayDate[1];
	var day = arrayDate[2];	

	return FormattingDate(day, month, year, strDateShortPattern);
}

/**
 * Transform a date in strDateShortPattern format to format ISO (YYYY-MM-DD)
 * Example "4/2/2006" --> "2006-02-04", if strDateShortPattern --> M/D/YYYY
 * @param {Object} UserDate -- Date at user format (strDateShortPattern)
 */
function ABRV_UserDate2ISODate(UserDate) {
	var arrayDate = [];

	arrayDate = gettingYearMonthDayFromDate(UserDate);
	var year = arrayDate['year'];
	var month = arrayDate['month'];
	var day = arrayDate['day'];

	return FormattingDate(day, month, year, "YYYY-MM-DD");
}

/**
 * Increment or decrement in num_days the date_select in format ISO (YYYY-MM-DD)
 * Example ("2006-02-04",-2) --> "2006-02-02"
 * @param {Object} date_select -- Date at format ISO (YYYY-MM-DD)
 * @param {Object} num_day -- Increment (+) or decrement (-) of days
 */
function ABRV_getDateModified(date_select,num_day) {
	var arrayDate = [];

	arrayDate = date_select.split("-");
	var year = arrayDate[0];
	var month = arrayDate[1];
	var day = arrayDate[2];

	var year_int = parseInt(year,10);
	var month_int = parseInt(month,10);
	var day_int = parseInt(day,10);

	var num_month_year = GetMonthMaxDays(month,year);
	var num_days = parseInt(num_day,10);

	//Increment days
	if (num_days > 0) {
		//If the increase surpasses the days of the month...
		if ( (day_int + num_days) > num_month_year ) {
			//If it is at the end of year...
			if (month_int == 12) {
				month = "01";
				year = getNextYear(year);
			}
			else {
				month = getPrevNextMonth(month,"N");
				if (month < 10)
					month = "0" + month;
			}
			//Calcule days to add
			day_int = num_days - (num_month_year - day_int);
		
			day = day_int;
		}
		else {
			day = day_int + num_days;
		}
	}
	//Decrement days
	else {
		//if the decrement supposes change of month...
		if ( (day_int + num_days) <= 0 ) {
			//If it is at the beginning of year...
			if (month_int == 1) {
				month = "12";
				year = getPrevYear(year);
			}
			else {
				month = getPrevNextMonth(month,"P");
				if (month < 10)
					month = "0" + month;
			}
			//Calcule days to add
			num_month_year = GetMonthMaxDays(month,year);
			day_int = num_month_year - (Math.abs(num_days) - day_int);
			day = day_int;
		}
		else {
			day = day_int + num_days;		
		}
	}

	if (day < 10)
		day = "0" + day;		

	return year + "-" + month + "-" + day;
}

/**
 * Method to get the hour in format HH:MM AM/PM.
 * @param {Object} x
 */
function ABRV_convert12H(x){
	var converttime;
	var currentTime = new Date (new Date().toDateString() + ' ' + x);
	var hours = currentTime.getHours();
	var minutes = currentTime.getMinutes();
	var suffix = "AM";
	
	if (timePattern24H == timePattern)
		return x;

	if (hours >= 12) {
		suffix = "PM";
		hours = hours - 12;
	}

	if (hours == 0) {
		hours = 12;
	}

	if (minutes < 10){
		minutes = "0" + minutes;
	}
	
	converttime = hours + ":" + minutes + " " + suffix ;

	return converttime;
}
/**
 * 
 * @param {Object} date
 */
function ABRV_convert24H(date){
	result = date;		
	if ( (date.indexOf("AM")!=-1) || (date.indexOf("PM")!=-1) ){	
		var hour = date.substring(0,date.indexOf(":"));		
		var minute = date.substring(date.indexOf(":")+1,date.indexOf(" "));		
		if (date.indexOf("AM")!=-1){				
			hour = ((hour=="12")?"00":((hour<10)?("0"+hour):hour));				
		}
		if (date.indexOf("PM")!=-1){				
			hour = ((hour=="12")?hour:(parseInt(hour)+12));				
		}
		result = hour+":"+minute+":00";			
	}
	return result;
}

/**
 * To test if hour1 is minnor that hour2
 * @param {Object} hour1 -- Hour at format HH:MM.ss.mmm
 * @param {Object} hour2 -- Hour at format HH:MM.ss.mmm
 */
function ABRV_isMinnor(hour1,hour2) {
	if ((hour1 == "") || (hour2 == "")){
		return true;
	}
	
	var arrayHour = hour1.split(":");
	var arrayHour2 = hour2.split(":");

	if (arrayHour[0] > arrayHour2[0]){
		return false;
	}else if (arrayHour[0] < arrayHour2[0]){
		return true;
	}else{ //To consider the minutes of the hours
		if (arrayHour[1].substring(0,2) >= arrayHour2[1].substring(0,2)){
			return false;
		}else{
			return true;
		}
	}
}
// -------------------------------------------------------------------------------------------------
// Returns a current date in format ISO (YYYY-MM-DD)
//
function ABRV_getCurrentDate() {
	var curDate = new Date();
	var month = curDate.getMonth()+ 1;
	var day	  = curDate.getDate();
	var year  = curDate.getFullYear();

	return year + "-" + ((month<10)?"0":"") + month + "-" + ((day<10)?"0":"") + day;
}

/**
 * Returns the day of week a input date
 * @param {Object} date_select -- Date at format ISO (YYYY-MM-DD)
 */
function ABRV_getDayOfWeek(date_select){
	var arrayDate = new Array();
	arrayDate = date_select.split("-");		
	var newDate = new Date(arrayDate[0],(arrayDate[1]-1),arrayDate[2]);	

	return newDate.getDay();	
}

//ELIMINAR POR: dayDif =((dayDif<temp)?dayDif:temp); EN FICHERO ab-rr-content-add-room-reservation.js
function ABRV_min(x,y){
	if (x<y)
		return x;
	return y;	
}

/**
 * Returns if date1 is minnor that date2
 * @param {Object} date1 -- Date at format ISO (YYYY-MM-DD)
 * @param {Object} date2 -- Date at format ISO (YYYY-MM-DD)
 */
function ABRV_bISODateIsBefore(date1, date2){
	var arrayDate1 = new Array();
	arrayDate1 = date1.split("-");	
	var arrayDate2 = new Array();
	arrayDate2 = date2.split("-");
	var date = new Date( " "+ arrayDate2[0] +", "+arrayDate2[1] + ",  "+arrayDate2[2] );	

	return bDateIsBefore(arrayDate1[1]+"/"+arrayDate1[2]+"/"+arrayDate1[0], arrayDate2[1]+"/"+arrayDate2[2]+"/"+arrayDate2[0]);
}

/**
 * Check the values are valid and available period to modidy the event.
 * @param {Object} timelineStartTime -- Time start of event
 * @param {Object} minorSegments -- number of slots by hour
 * @param {Object} timeOfDay -- Time of event
 * @param {Object} MaxTimemarksColumn -- maximum number of slots in a room, independently of which there is available
 * @param {boolean} roundUp -- round up or down (true to round up): start times should be rounded down, end times up
 */
function ABRV_getTimeColumn(timelineStartTime,minorSegments,timeOfDay,MaxTimemarksColumn,roundUp) {
	var arrayTime = [];
	var arrayTimelineTime = [];

	//To divide Time in hours and minutes
	arrayTime = timeOfDay.split(":");
	arrayTimelineTime = timelineStartTime.split(":");
	var resStartHour = arrayTime[0];
	var resStartMin = arrayTime[1].toString();
	resStartMin = resStartMin.substring(0,2);
	var timelineStartHour = arrayTimelineTime[0];
	// Calculate column to nearest hour
	var columnAvailableFrom = (resStartHour - timelineStartHour) * minorSegments;
	
	// Add additional segments for minutes
	// KB 3048026 round start times down, end times up
	if (roundUp) {
		columnAvailableFrom += Math.ceil(resStartMin * minorSegments / 60);
	} else {
		columnAvailableFrom += Math.floor(resStartMin * minorSegments / 60);
	}
	
	// if the resource is availabe after the timeline end time, assume column MaxTimemarksColumn-1
	if (columnAvailableFrom >= MaxTimemarksColumn) {
	    columnAvailableFrom = MaxTimemarksColumn;
	}

	// if the resource is availabe before the timeline start time, assume column 0
	// negative column values are not allowed
	if (columnAvailableFrom < 0) {
	    columnAvailableFrom = 0;
	}
	
	return columnAvailableFrom;
}

/**
 * '20:30.0.000' -- >'20:30'
 * @param {Object} strTime
 */
function ABRV_formatTime(strTime){
	if (strTime != "") {
		var temp = strTime.split(":");
		var shortTime = FormattingTime(temp[0], temp[1].substr(0, 2), "", timePattern24H);
		return shortTime;
	}else{
		return "";
	}
}
/**
 * check the groups if includes the specialGroup
 * @param {Object} user -- user
 * @param {Object} group -- 'RESERVATION TRADES'
 * @return true or false
 */
function ABRV_isMemberOfGroup(user,group){
	var result = false;
	    if (group === '') {
	        result = true;
	    } else for (var i = 0; i < user.groups.length; i++) {
	        if (user.groups[i] === group) {
	            result = true;
	            break;
	        }
	    }  
	    return result;
}
