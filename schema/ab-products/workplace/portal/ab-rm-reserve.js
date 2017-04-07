/**
 * @author keven.xi
 */
var rmreserveController = View.createController('rmreserveController', {

    timeOptions: new Array("00:00", "00:30", "01:00", "01:30", "02:00", "02:30", "03:00", "03:30", "04:00", "04:30", "05:00", "05:30", "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"),
    durationOptions: new Array(["1/2 Hour", "0.5"], ["1 Hour", "1"], ["1 1/2 Hours", "1.5"], ["2 Hours", "2"], ["2 1/2 Hours", "2.5"], ["3 Hours", "3"], ["3 1/2 Hours", "3.5"], ["4 Hours", "4"], ["4 1/2 Hours", "4.5"], ["5 Hours", "5"], ["5 1/2 Hours", "5.5"], ["6 Hours", "6"], ["6 1/2 Hours", "6.5"], ["7 Hours", "7"], ["7 1/2 Hours", "7.5"], ["8 Hours", "8"], ["9 Hours", "9"], ["10 Hours", "10"], ["11 Hours", "11"], ["12 Hours", "12"], ["1 Day", "24"], ["1 1/2 Days", "36"], ["2 Days", "48"], ["2 1/2 Days", "60"], ["3 Days", "72"], ["3 1/2 Days", "84"], ["4 Days", "96"], ["4 1/2 Days", "108"], ["1 Week", "168"], ["1 1/2 Weeks", "252"], ["2 Weeks", "336"]),
    
    dateStart: "",
    dateEnd: "",
    timeStart: "",
    timeEnd: "",
    blId: "",
    flId: "",
    rmId: "",
    
    afterInitialDataFetch: function(){
        this.rmreserveDetails.show(false);
        this.setTimeStartFieldSelectOptions();
        this.setDurationSelectOptions();
        this.setDefaultValue();
    },
    
    rmFilterPanel_onShow: function(){
        if (this.checkStartDateInput() && this.checkStartTimeInput()) {
            this.showRoomsList();
            
            //clear the drawing in the drawing panel and rows in the employee details panel
            this.locateRoom_cadPanel.clear();
            this.rmDetails.clear();
            this.amenityDetails.clear();
            
            this.rmreserveDetails.show(false);
            this.setDrawingPanelTitle('');
        }
    },
    
    rmDetails_afterRefresh: function(){
        var restriction = new Ab.view.Restriction();
        this.blId = this.rmDetails.rows[0]["rm.bl_id"];
        this.flId = this.rmDetails.rows[0]["rm.fl_id"];
        this.rmId = this.rmDetails.rows[0]["rm.rm_id"];
        restriction.addClause('rm.bl_id', this.blId, "=");
        restriction.addClause('rm.fl_id', this.flId, "=");
        restriction.addClause('rm.rm_id', this.rmId, "=");
        this.amenityDetails.refresh(restriction);
        this.rmreserveDetails.show(false);
    },
    
    rmDetails_onReserve: function(){
        if (!valueExists(this.availableRmGrid.rows[this.availableRmGrid.selectedRowIndex])) {
            alert(getMessage("noselectedRoom"));
            return;
        }
        //var thisController = this;
        View.openDialog('ab-rm-reserve-detail-ok-cancel.axvw', null, true, {
            width: 800,
            height: 400,
            closeButton: false
        });
    },
    
    afterRoomReserved: function(reserveID){
        this.rmDetails.show(false);
        this.amenityDetails.show(false);
        var restriction = new Ab.view.Restriction();
        restriction.addClause('rm_reserve.auto_number', reserveID, "=");
        this.rmreserveDetails.refresh(restriction);
        
        //!!!important 
        this.availableRmGrid.rows[this.availableRmGrid.selectedRowIndex].isReserved = true;
    },
    
    setTimeStartFieldSelectOptions: function(){
        var timeStartFrame = document.getElementById('rmreserve_time_start');
        timeStartFrame.options.length = 0;
        
        for (var i = 0; i < this.timeOptions.length; ++i) {
            this.addOption(timeStartFrame, this.timeOptions[i], this.timeOptions[i]);
        }
    },
    
    setDurationSelectOptions: function(){
        var durationFrame = document.getElementById('rmreserve_duration');
        durationFrame.options.length = 0;
        
        for (var i = 0; i < this.durationOptions.length; ++i) {
            var text = this.durationOptions[i][0];
            var value = this.durationOptions[i][1];
            this.addOption(durationFrame, text, value);
        }
    },
    
    addOption: function(selectFieldFrame, text, value){
        var option = new Option(text, value);
        selectFieldFrame.options.add(option);
    },
    
    setDefaultValue: function(){
        setConsoleDefaultValue();
        this.setDrawingPanelTitle('');
    },
    
    setDrawingPanelTitle: function(blFlRm){
        if (!valueExists(blFlRm)) 
            blFlRm = '';
        var drawingPanelTitle = getMessage("flash_headerMessage") + " " + blFlRm;
        this.locateRoom_cadPanel.appendInstruction("default", "", drawingPanelTitle);
        this.locateRoom_cadPanel.processInstruction("default", "");
    },
    
    showRoomsList: function(){
        /*
         (1) validate inputs
         (2) how to get year, month, day (locale format?)
         (3) calculate date_end and time_end
         (4) sybase SQL API?
         */
        var rm_std = this.rmFilterPanel.getFieldValue("rm.rm_std");
        var rm_cat = this.rmFilterPanel.getFieldValue("rm.rm_cat");
        var rm_type = this.rmFilterPanel.getFieldValue("rm.rm_type");
        
        var strExtraRestriction = "";
        if (rm_std != "") 
            strExtraRestriction = strExtraRestriction + "(rm.rm_std='" + rm_std + "'";
        if (rm_cat != "") {
            if (strExtraRestriction != "") {
                strExtraRestriction = strExtraRestriction + " AND rm.rm_cat='" + rm_cat + "'";
            }
            else {
                strExtraRestriction = strExtraRestriction + "(rm.rm_cat='" + rm_cat + "'";
            }
        }
        if (rm_type != "") {
            if (strExtraRestriction != "") {
                strExtraRestriction = strExtraRestriction + " AND rm.rm_type='" + rm_type + "'";
            }
            else {
                strExtraRestriction = strExtraRestriction + "(rm.rm_type='" + rm_type + "'";
            }
        }
        if (strExtraRestriction != "") 
            strExtraRestriction = strExtraRestriction + ") AND "
        //
        
        var arrDate_start = new Array();
        var arrTime_start = new Array();
        var date_start, time_start;
        var year_start, month_start, day_start;
        var hour_start, minute_start;
        
        //var arrDate_end = new Array();
        //var arrTime_end = new Array();
        var date_end, time_end;
        var year_end, month_end, day_end;
        var hour_end, minute_end;
        
        var bl_id = this.rmFilterPanel.getFieldValue("rm.bl_id");
        var fl_id = this.rmFilterPanel.getFieldValue("rm.fl_id");
        var rm_id = this.rmFilterPanel.getFieldValue("rm.rm_id");
        
        var duration;
        
        var date_start = $('rm_reserve.date_start').value;
        
        arrDate_start = getDateArray(date_start);
        year_start = arrDate_start["year"];
        year_start = parseInt(year_start, 10);
        month_start = arrDate_start["month"];
        month_start = parseInt(month_start, 10);
        day_start = arrDate_start["day"];
        day_start = parseInt(day_start, 10);
        
        var selectedIndex = $('rmreserve_time_start').selectedIndex;
        time_start = $('rmreserve_time_start').options[selectedIndex].value;
        arrTime_start = gettingHourMinuteFromHHMMFormattedTime(time_start);
        hour_start = arrTime_start["HH"];
        hour_start = parseInt(hour_start, 10);
        minute_start = arrTime_start["MM"];
        minute_start = parseInt(minute_start, 10);
        
        selectedIndex = $('rmreserve_duration').selectedIndex;
        duration = $('rmreserve_duration').options[selectedIndex].value;
        duration = parseFloat(duration);
        //don't change the following orders
        days_duration = Math.floor(duration / 24);
        hours_duration = duration % 24;
        
        minutes_duration = hours_duration * 60;
        minutes_start = hour_start * 60 + minute_start;
        totalMinutes = minutes_duration + minutes_start;
        minutes_left = totalMinutes % (24 * 60);
        hours_end = Math.floor(minutes_left / 60);
        minutes_end = minutes_left % 60;
        
        time_end = FormattingTime(hours_end, minutes_end, "", "HH:MM");
        
        days_end = days_duration + day_start;
        //adding any days in totalMinutes
        days_end = days_end + Math.floor(totalMinutes / (24 * 60));
        
        max_days = GetMonthMaxDays(month_start, year_start);
        if (days_duration == 0) 
            month_increased = 0;
        else 
            month_increased = Math.floor(days_end / max_days);
        if (days_end > max_days) 
            days_end = days_end % max_days;
        
        month_end = month_start + month_increased;
        
        year_end = (Math.floor(month_end / 12) == 1) ? (0) : (Math.floor(month_end / 12));
        month_end = month_end % 12;
        month_end = (month_end == 0) ? (12) : (month_end);
        year_end = year_end + year_start;
        
        date_end = FormattingDate(days_end, month_end, year_end, strDateShortPattern);
        date_end = getDateWithISOFormat(date_end);
        date_start = getDateWithISOFormat(date_start);
        
        //HH.MM.S.SSS
        time_end = time_end + ".0.000";
        time_start = time_start + ".0.000";
        
        //getDateArray(shortFormattedDate) is defined in date-time.js
        //FormattingDate(day, month, year, strDateShortPattern) is defined
        //in date-time.js and strDateShortPattern is defined in locale.js
        //which is overwritten in XSLT from server's value
        //gettingHourMinuteFromHHMMFormattedTime(time) and
        //getDateWithISOFormat(date) in date-time.js
        
        /*
         typical restriction:
         <restrictions><userInputRecordsFlag><restriction type="sql" sql="rm.rm_cat NOT IN ('VERT', 'SERV', 'STORAGE')
         AND (NOT EXISTS ( SELECT 1 FROM rm_reserve  WHERE rm_reserve.bl_id = rm.bl_id  AND   rm_reserve.fl_id =
         rm.fl_id  AND rm_reserve.rm_id = rm.rm_id  AND rm_reserve.status &lt;&gt; 'Can'  AND ( ( DATETIME(
         rm_reserve.date_start || ' ' || rm_reserve.time_start ) &gt;= DATETIME( '2003-12-29' || ' ' || '08:00' ) AND DATETIME(
         rm_reserve.date_start || ' ' || rm_reserve.time_start ) &lt; DATETIME( '2003-12-29' || ' ' || '14:30' )) OR (DATETIME(
         rm_reserve.date_end || ' ' || rm_reserve.time_end ) &lt;= DATETIME( '2003-12-29' || ' ' || '14:30' )  AND DATETIME(
         rm_reserve.date_end || ' ' || rm_reserve.time_end ) &gt; DATETIME( '2003-12-29' || ' ' || '08:00' ))  OR (DATETIME(
         rm_reserve.date_end || ' ' || rm_reserve.time_end ) &gt; DATETIME( '2003-12-29' || ' ' || '14:30' )  AND DATETIME(
         rm_reserve.date_start || ' ' || rm_reserve.time_start ) &lt; DATETIME( '2003-12-29' || ' ' || '08:00' )) ) )
         )"></userInputRecordsFlag><title translatable="true">2003-12-29;08:00|2003-12-29;14:30|6.5</title><field
         table="rm"/></restriction></restrictions>
         */
        var strSQLRestriction = "";
        if (bl_id != "") 
            strSQLRestriction = strSQLRestriction + "(rm.bl_id='" + bl_id + "'";
        if (fl_id != "") {
            if (strSQLRestriction != "") {
                strSQLRestriction = strSQLRestriction + " AND rm.fl_id='" + fl_id + "'";
            }
            else {
                strSQLRestriction = strSQLRestriction + "(rm.fl_id='" + fl_id + "'";
            }
        }
        if (rm_id != "") {
            if (strSQLRestriction != "") {
                strSQLRestriction = strSQLRestriction + " AND rm.rm_id='" + rm_id + "'";
            }
            else {
                strSQLRestriction = strSQLRestriction + "(rm.rm_id='" + rm_id + "'";
            }
        }
        if (strSQLRestriction != "") 
            strSQLRestriction = strSQLRestriction + ") AND ";
        
        this.dateStart = date_start;
        this.dateEnd = date_end;
        this.timeStart = time_start;
        this.timeEnd = time_end;
        
        time_start = formatTime(time_start);
        time_end = formatTime(time_end);
        
        strSQLRestriction = strExtraRestriction + strSQLRestriction;
        strSQLRestriction += " ( NOT EXISTS ( SELECT 1 FROM rm_reserve  WHERE rm_reserve.bl_id = rm.bl_id AND rm_reserve.fl_id = rm.fl_id  AND rm_reserve.rm_id = rm.rm_id  AND rm_reserve.status !='Can' AND ";
        strSQLRestriction += " (((rm_reserve.date_start &gt;= ${sql.date(\'" + date_start + "\')} AND rm_reserve.date_start &lt;= ${sql.date(\'" + date_end + "\')})";
        strSQLRestriction += " AND(rm_reserve.time_start &gt;= ${sql.time(\'" + time_start + "\')} AND rm_reserve.time_start &lt; ${sql.time(\'" + time_end + "\')}))";
        strSQLRestriction += " OR (( rm_reserve.date_end &gt;= ${sql.date(\'" + date_start + "\')} AND rm_reserve.date_end &lt;= ${sql.date(\'" + date_end + "\')})";
        strSQLRestriction += " AND (rm_reserve.time_end &gt; ${sql.time(\'" + time_start + "\')} AND rm_reserve.time_end &lt;= ${sql.time(\'" + time_end + "\')}))";
        strSQLRestriction += " OR ( (rm_reserve.date_start &lt;= ${sql.date(\'" + date_start + "\')} AND rm_reserve.date_end &gt;= ${sql.date(\'" + date_end + "\')})";
        strSQLRestriction += " AND (rm_reserve.time_start &lt; ${sql.time(\'" + time_start + "\')} AND rm_reserve.time_end &gt; ${sql.time(\'" + time_end + "\')})))))";
        
        this.availableRmGrid.refresh(strSQLRestriction);
    },
    
    //start date cannot be earlier than today
    checkStartDateInput: function(){
        var startDateInput = $('rm_reserve.date_start').value;
        var strWarningMessage = getMessage("startDateErrMsg");
        var curDate = new Date();
        var month = curDate.getMonth() + 1;
        var day = curDate.getDate();
        var year = curDate.getFullYear();
        
        if (startDateInput != "") {
            var ToDay = new Date(month + "/" + day + "/" + year);
            var startDateInputArray = getDateArray(startDateInput);
            var startDate = new Date(startDateInputArray["month"] + "/" + startDateInputArray["day"] + "/" + startDateInputArray["year"]);
            if (startDate < ToDay) {
                //localized
                alert(strWarningMessage);
                return false;
            }
        }
        else {
            //today as default
            var tomorrow = new Date(new Date().valueOf() + 86400000);
            var t_month = tomorrow.getMonth() + 1;
            var t_day = tomorrow.getDate();
            var t_year = tomorrow.getFullYear();
            this.rmFilterPanel.setFieldValue('rm_reserve.date_start', FormattingDate(t_day, t_month, t_year, strDateShortPattern));
        }
        return true;
    },
    
    //start time cannot be earlier than current time if the start date is
    //today
    checkStartTimeInput: function(){
        var selectedIndex = $('rmreserve_time_start').selectedIndex;
        var startTimeInput = $('rmreserve_time_start').options[selectedIndex].value;
        
        var strWarningMessage = getMessage("startDatetimeErrMsg");
        if (startTimeInput != "") {
            var curDate = new Date();
            var month = curDate.getMonth() + 1;
            var day = curDate.getDate();
            var year = curDate.getFullYear();
            var ToDay = month + "/" + day + "/" + year;
            var startDateInput = $('rm_reserve.date_start').value;
            
            if (startDateInput != "") {
                var startDateInputArray = getDateArray(startDateInput);
                
                var startDate = startDateInputArray["month"] + "/" + startDateInputArray["day"] + "/" + startDateInputArray["year"];
                if (startDate == ToDay) {
                
                    var tempStartTimeArray = gettingHourMinuteFromHHMMFormattedTime(startTimeInput);
                    var hoursNow = curDate.getHours();
                    var minsNow = curDate.getMinutes();
                    var start_hour = tempStartTimeArray["HH"];
                    var start_minute = tempStartTimeArray["MM"];
                    start_hour = parseInt(start_hour, 10);
                    start_minute = parseInt(start_minute, 10);
                    
                    if ((hoursNow > start_hour) || ((hoursNow == start_hour) && (minsNow > start_minute))) {
                        //localized
                        alert(strWarningMessage);
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
})

function setConsoleDefaultValue(){
    View.panels.get('rmFilterPanel').setFieldValue("rm_reserve.date_start", getCurrentISODateString());
    var timeStartFrame = document.getElementById('rmreserve_time_start');
    timeStartFrame.options[16].selected = true;
    var durationFrame = document.getElementById('rmreserve_duration');
    durationFrame.options[0].selected = true;
}

function refreshRoomsList(){
    var roomsPanel = View.panels.get('availableRmGrid');
    if (!valueExists(roomsPanel.restriction)) {
        return;
    }
    roomsPanel.refresh();
    
    View.panels.get("rmDetails").clear();
    View.panels.get("amenityDetails").clear();
    View.panels.get("rmreserveDetails").show(false);
    View.panels.get('locateRoom_cadPanel').clear();
    rmreserveController.setDrawingPanelTitle('');
}

function selectRoom(){
    var availableRoomsGrid = View.panels.get("availableRmGrid");
    var selectedRow = availableRoomsGrid.rows[availableRoomsGrid.selectedRowIndex];
    if (valueExists(selectedRow.isReserved)) {
        View.showMessage((getMessage("selectedRoomIsReserved")));
        View.panels.get("rmDetails").show(false);
        View.panels.get("amenityDetails").show(false);
        View.panels.get("rmreserveDetails").show(false);
        return;
    }
    else {
        highlightSelectedRoom();
        var restriction = new Ab.view.Restriction();
        restriction.addClause('rm.bl_id', selectedRow["rm.bl_id"], "=");
        restriction.addClause('rm.fl_id', selectedRow["rm.fl_id"], "=");
        restriction.addClause('rm.rm_id', selectedRow["rm.rm_id"], "=");
        View.panels.get("rmDetails").refresh(restriction);
    }
}

function highlightSelectedRoom(){
    var dc = View.getControl('', 'locateRoom_cadPanel');
    dc.clear();
    
    var opts = new DwgOpts();
    //opts.forceload = true;
    opts.selectionMode = "0";
    opts.mode = '';
    opts.setFillColor(gAcadColorMgr.getColorFromValue('oxce0b0b', true));
    
    var roomListGrid = View.panels.get("availableRmGrid");
    var selectedRow = roomListGrid.rows[roomListGrid.selectedRowIndex];
    dc.highlightAssets(opts, selectedRow);
    
    rmreserveController.setDrawingPanelTitle(selectedRow["rm.bl_id"] + '-' + selectedRow["rm.fl_id"] + '-' + selectedRow["rm.rm_id"]);
}

function getCurrentISODateString(){
    var year, month, day;
    var temp_curDate = new Date;
    year = temp_curDate.getFullYear();
    month = temp_curDate.getMonth() + 1;
    day = temp_curDate.getDate();
    return FormattingDate(day, month, year, strDateShortPattern);
}

//strTime like '20:30.0.000' -- >'20:30'
function formatTime(strTime){
    var temp = strTime.split(":");
    var shortTime = FormattingTime(temp[0], temp[1].substr(0, 2), "", "HH:MM");
    return shortTime;
}
