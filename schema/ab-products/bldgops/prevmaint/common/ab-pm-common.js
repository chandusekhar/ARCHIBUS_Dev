//Generate schedule dates
function generateScheduleDate(dateFrom, dateTo, restriction){
	var result = {};
	//This method serve as a WFR to call a long running job generating schedule dates for specified date range and PM Schedules ,file='PreventiveMaintenanceCommonHandler.java'
    try {
		result = Workflow.callMethod('AbBldgOpsPM-PmEventHandler-PmScheduleGenerator', dateFrom,dateTo,restriction,true);
		var jobId = "";
        if (valueExists(result.jsonExpression) && result.jsonExpression != '') {
            result.data = eval('(' + result.jsonExpression + ')');
            jobId = result.data.jobId;
        }
        return jobId;
    } 
    catch (e) {
        Workflow.handleError(e);
    }
}

//get schedule dates restrion
function getSchedDatesRestriction(siteId, blId, flId, pmGroup, trId, pmpType){
    var restriction = '';
    if (siteId) {
        restriction += "EXISTS (SELECT 1 FROM pms ${sql.as} pms1 LEFT JOIN pmp ON pms1.pmp_id = pmp.pmp_id LEFT OUTER JOIN eq ON pms1.eq_id = eq.eq_id WHERE pms1.pms_id = pms.pms_id AND ((pmp.pmp_type = 'EQ' AND eq.site_id IN " + stringToSqlArray(siteId) + ") OR (" +
        " pmp.pmp_type = 'HK' AND pms.site_id IN " +
        stringToSqlArray(siteId) +
        ")))";
    }
    if (blId) {
        if (restriction) {
            restriction += " AND "
        }
        restriction += "EXISTS (SELECT 1 FROM pms ${sql.as} pms2 LEFT JOIN pmp ON pms2.pmp_id = pmp.pmp_id LEFT OUTER JOIN eq ON pms2.eq_id = eq.eq_id WHERE pms2.pms_id = pms.pms_id AND ((pmp.pmp_type = 'EQ' AND eq.bl_id IN " + stringToSqlArray(blId) + ") OR (" +
        " pmp.pmp_type = 'HK' AND pms.bl_id IN " +
        stringToSqlArray(blId) +
        ")))";
    }
    if (flId) {
        if (restriction) {
            restriction += " AND "
        }
        
        restriction += "EXISTS (SELECT 1 FROM pms ${sql.as} pms3 LEFT JOIN pmp ON pms3.pmp_id = pmp.pmp_id LEFT OUTER JOIN eq ON pms3.eq_id = eq.eq_id WHERE pms3.pms_id = pms.pms_id AND ((pmp.pmp_type = 'EQ' AND eq.fl_id IN " + stringToSqlArray(flId) + ") OR (" +
        " pmp.pmp_type = 'HK' AND pms.fl_id IN " +
        stringToSqlArray(flId) +
        ")))";
    }
    if (pmGroup) {
        if (restriction) {
            restriction += " AND "
        }
        restriction += "pms.pm_group = '" + pmGroup + "'";
    }
    if (trId) {
        if (restriction) {
            restriction += " AND "
        }
        restriction += "EXISTS (SELECT 1 FROM pmp WHERE pmp.pmp_id = pms.pmp_id AND pmp.tr_id = '" + trId + "'" + ")";
    }
    if (pmpType) {
        if (restriction) {
            restriction += " AND "
        }
        restriction += "EXISTS (SELECT 1 FROM pmp WHERE pmp.pmp_id = pms.pmp_id AND pmp.pmp_type = '" + pmpType + "'" + ")";
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

function getColumnIndexByFullName(fieldFullName, reportColumns){
    var len = reportColumns.length;
    for (var i = 0; i < len; i++) {
        var column = reportColumns[i];
        if (column.id == fieldFullName) {
            return i;
        }
    }
    return -1;
}

function getCurrentDate(){
    var curDate = new Date();
    var month = curDate.getMonth() + 1;
    var day = curDate.getDate();
    var year = curDate.getFullYear();
    
    return year + "-" + ((month < 10) ? "0" : "") + month + "-" + ((day < 10) ? "0" : "") + day;
}

//get the days between two dates
function getDays(date1, date2){
    var ONE_DAY = 1000 * 60 * 60 * 24;
    var date1Ms = date1.getTime();
    var date2Ms = date2.getTime();
    var dateDiff = Math.abs(date1Ms - date2Ms);
    var numDays = Math.round(dateDiff / ONE_DAY);
    
    return numDays;
}

function dateRangeInterval(startDate, endDate){
    // alert(endDate.replace(/\-/g, "/"));
    var sDate = new Date(startDate.replace(/\-/g, "/"));
    var eDate = new Date(endDate.replace(/\-/g, "/"));
    var drDays = (eDate.getTime() - sDate.getTime()) / 3600 / 1000 / 24;
    return drDays;
}

function fixedFromDate_toToDate(fromDate, intervalDays){
    var toDate = null;
    var temp_datefrom = new Date(fromDate.replace(/\-/g, "/"));
    temp_datefrom.setDate(temp_datefrom.getDate() + intervalDays);
    toDate = temp_datefrom.getFullYear() + "-" + (temp_datefrom.getMonth() + 1) + "-" + temp_datefrom.getDate();
    return toDate;
}

//get the date of adding some days
function dateAddDays(date_start, nxtdays){
    var date_new = new Date(date_start.getTime() + nxtdays * (24 * 60 * 60 * 1000));
    var month = date_new.getMonth() + 1;
    if (month < 10) 
        month = "0" + month;
    var day = date_new.getDate();
    if (day < 10) 
        day = "0" + day;
    return date_new.getFullYear() + '-' + month + '-' + day;
}

//get the date after one year of current date
function getDateAfterOneYear(){
    var curDate = new Date();
    var month = curDate.getMonth() + 1;
    if (month < 10) 
        month = "0" + month;
    var day = curDate.getDate();
    if (day < 10) 
        day = "0" + day;
    var year = curDate.getFullYear() + 1;
    return year + '-' + month + '-' + day;
}

//get the date after half of month of current date
function getDateAfterHalfMonth(){
    var curDate = new Date();
    var endDate = dateAddDays(curDate, 14);
    return endDate;
}

//get the date after half of month of current date
function getDateAfter52Week(){
    var curDate = new Date();
    var endDate = dateAddDays(curDate, 52*7);
    return endDate;
}

/**
 * get and set the task priority field
 * used in Define and Edit PM Schedules views
 */
function setTaskPriorityOptions(){
    var prioritySelect = document.getElementById('taskPriority');
    prioritySelect.options.length = 0;
    
    //get the enum_list of task priority
    var parameters = {
        tableName: 'helpdesk_sla_response',
        fieldNames: toJSON(['helpdesk_sla_response.priority', 'helpdesk_sla_response.activity_type']),
        restriction: toJSON("helpdesk_sla_response.activity_type='SERVICE DESK - MAINTENANCE' AND helpdesk_sla_response.ordering_seq = 1"),
        sortValues: toJSON([{
            fieldName: "helpdesk_sla_response.priority",
            sortOrder: 1
        }])
    };
	 var result = {};
    try {
         result = Workflow.call('AbCommonResources-getDataRecords', parameters);
    } 
    catch (e) {
        Workflow.handleError(e);
    }
    
    //set the priority
    var rows = result.data.records;
    for (var i = 0, record; record = rows[i]; i++) {
        var priority = record["helpdesk_sla_response.priority"];
        option = new Option(priority, priority);
        prioritySelect.options.add(option);
    }
}
