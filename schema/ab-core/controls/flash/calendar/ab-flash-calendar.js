/*
Copyright (c) 2009, ARCHIBUS Inc. All rights reserved.
Author: Jing Guo
Date: December, 2009
*/
Ab.namespace('flash');

// This is the calendar control itself
var calendarControl = null;

// To be called by ActionScript.
// Get localized string.
function getLocalizedString_calendar_JS(input) {
	try {
		return calendarControl.getLocalizedString_calendar(input);
	}
	catch (e) {
		return input;
	}
};

function getLocalizedDayNamesArray_JS(){
	return [View.getLocalizedString(calendarControl.z_MESSAGE_SUNDAY).charAt(0),
		View.getLocalizedString(calendarControl.z_MESSAGE_MONDAY).charAt(0),
		View.getLocalizedString(calendarControl.z_MESSAGE_TUESDAY).charAt(0),
		View.getLocalizedString(calendarControl.z_MESSAGE_WEDNESDAY).charAt(0),
		View.getLocalizedString(calendarControl.z_MESSAGE_THURSDAY).charAt(0),
		View.getLocalizedString(calendarControl.z_MESSAGE_FRIDAY).charAt(0),
		View.getLocalizedString(calendarControl.z_MESSAGE_SATURDAY).charAt(0)
	];
};

function getLocalizedMonthArray_JS() {
	return [View.getLocalizedString(calendarControl.z_MESSAGE_JANUARY),
		View.getLocalizedString(calendarControl.z_MESSAGE_FEBRUARY),
		View.getLocalizedString(calendarControl.z_MESSAGE_MARCH),
		View.getLocalizedString(calendarControl.z_MESSAGE_APRIL),
		View.getLocalizedString(calendarControl.z_MESSAGE_MAY),
		View.getLocalizedString(calendarControl.z_MESSAGE_JUNE),
		View.getLocalizedString(calendarControl.z_MESSAGE_JULY),
		View.getLocalizedString(calendarControl.z_MESSAGE_AUGUST),
		View.getLocalizedString(calendarControl.z_MESSAGE_SEPTEMBER),
		View.getLocalizedString(calendarControl.z_MESSAGE_OCTOBER),
		View.getLocalizedString(calendarControl.z_MESSAGE_NOVEMBER),
		View.getLocalizedString(calendarControl.z_MESSAGE_DECEMBER)
	];
};

function getDistinctColorValues_JS(field){
	var values = [];	
	var ds = View.dataSources.get(calendarControl.dataSourceId);
	var enumValues = ds.fieldDefs.map[field].enumValues;
	if(enumValues != null){
		for(i in enumValues){
			values.push(i);
		}
	} else {
		
		try {
			var temp = field.split(".");
			var table = temp[0];
			var parameters = {
				tableName: table,
				fieldNames: toJSON([field]),
				sortValues: toJSON([{'fieldName': field, 'sortOrder':1}]), 
				recordLimit: 0,  		
				isDistinct: true
			};
			
			var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
			var rows = result.data.records;			
			for(var i=0; i<rows.length; i++){
				values.push(rows[i][field]);
			}

			return values;
		} catch (e) {
			Workflow.handleError(e);
		}
	}

	return values;
}

////////////////////////////////////////////////////////////////////////
//
// Here are a whole bunch of functions that manipulate a five-field time.
// The string representation of such a time is "2009/1/3 23:59".
// The array representation of such a time is [2009, 1, 3, 23, 59].
//
////////////////////////////////////////////////////////////////////////
    
// String representation --> array representation
function FiveFieldTimeSplit(date) {
  	try {
    	var arrA = [];
	   	var tmp;
	   	var s;
	   	
	   	tmp = date.split(" ");
	   	if (tmp[0].indexOf("/")!=-1) {
		   	s = tmp[0].split("/"); // year, month, day
		}
		else if (tmp[0].indexOf("-")!=-1) {
			s = tmp[0].split("-");
		}
		else {
			return null;
		}
	   	arrA.push(parseInt(s[0]));
	   	arrA.push(parseInt(s[1]));
	   	arrA.push(parseInt(s[2]));
	   	s = tmp[1].split(":"); // hour, minute
	   	arrA.push(parseInt(s[0]));
	   	arrA.push(parseInt(s[1]));
  		return arrA;
  	}
  	catch (e) {
  		alert("ab-flash-calendar.js::FiveFieldTimeSplit() error!");
  		return null;
  	}
};
 
// String representation --> array representation
function FiveFieldTimeSplitDateOnly(date, isStart) {
  	try {
    	var arrA = [];
	   	var tmp;
	   	
	   	tmp = date.split(" ");
	   	if (tmp[0].indexOf("/")!=-1) {
		   	s = tmp[0].split("/"); // year, month, day
		}
		else if (tmp[0].indexOf("-")!=-1) {
			s = tmp[0].split("-");
		}
		else {
			return null;
		}
	   	arrA.push(parseInt(s[0]));
	   	arrA.push(parseInt(s[1]));
	   	arrA.push(parseInt(s[2]));
	   	
	   	if (isStart) {
	   		arrA.push(0); 
	   		arrA.push(0);
	   	}
	   	else {
	   		arrA.push(23);
	   		arrA.push(59);
	   	}
  		return arrA;
  	}
  	catch (e) {
  		alert("ab-flash-calendar.js::FiveFieldTimeSplitDateOnly() error!");
  		return null;
  	}
}; 

// array representation --> string representation
function FiveFieldTimeCombine(arr) {
  	return "" + arr[0] + "/" + arr[1] + "/" + arr[2] + " " + arr[3] + ":" + arr[4];
};
  
// Return if one time is less than the other. 
// Input in array represtation.
function FiveFieldTimeIsLess(arrA, arrB) {
  	for (var i=0; i<arrA.length; i++) {
  		if (arrA[i]<arrB[i]) return true;
  		if (arrA[i]>arrB[i]) return false;
  	}
  	return false;
};

// Return if one time is equal to the other. 
// Input in array represtation.
function FiveFieldTimeIsEqual(arrA, arrB) {
  	for (var i=0; i<arrA.length; i++) {
  		if (arrA[i]!=arrB[i]) return false;
  	}
  	return true;
};

// Increase a date by a certain number of days
// Note: in-place update is performed.
// Also, only the first three fields of the array is needed. 
function FiveFieldTimeIncrease(arr, numDaysToIncrease) {
   	var date = new Date();
	date.setFullYear(arr[0], arr[1]-1, arr[2]);
	date.setDate(date.getDate() + numDaysToIncrease);
	arr[0] = date.getFullYear();
	arr[1] = date.getMonth()+1;
	arr[2] = date.getDate();
};
    
// Return whether the first time (arrA) is immediately before another time (arrB).
// Note: to be continuous, arrA's time must be 23:59, and arrB's time must be 0:0.
function FiveFieldTimeIsContinuous(arrA, arrB) {
  	// time should be 23:59 vs 0:0
  	if (arrA[3]!=23 || arrA[4]!=59 || arrB[3]!=0 || arrB[4]!=0) return false;
  	
  	// increase arrA by one
  	var arrAInc = [arrA[0], arrA[1], arrA[2]];
  	FiveFieldTimeIncrease(arrAInc, 1);
  	
  	return arrAInc[0]==arrB[0] && arrAInc[1]==arrB[1] && arrAInc[2]==arrB[2];
};
  
// Copy time dest <-- src
function FiveFieldTimeCopy(dest, src) {
	for (var i=0; i<dest.length; i++ ) dest[i] = src[i];
};

// Return the day of the week. 0: Sunday, 1: Monday, etc.
function FiveFieldTimeGetDay(arr) {
	var date = new Date();
	date.setFullYear(arr[0], arr[1]-1, arr[2]);
	return date.getDay();
};

// return is weekend
function FiveFieldTimeIsWeekend(arr) {
	var day = FiveFieldTimeGetDay(arr);
	return day==0 || day==6;
};

// if not Monday, advance to the next Monday morning at 0:0
function FiveFieldTimeAdvanceToMondayMorning(arr) {
	var day = FiveFieldTimeGetDay(arr);
	if (day==1) return;

	if (day==0) 
		FiveFieldTimeIncrease(arr, 1);
	else
		FiveFieldTimeIncrease(arr, 8-day);
		
	arr[3] = 0;
	arr[4] = 0;
};

// advance to the next Friday night 23:59
function FiveFieldTimeAdvanceToFridayNight(arr) {
	var day = FiveFieldTimeGetDay(arr);
	if (day==6)  
		FiveFieldTimeIncrease(arr, 6);
	else
		FiveFieldTimeIncrease(arr, 5-day);
		
	arr[3] = 23;
	arr[4] = 59;
};

//////////////////////////////////////////////////////
//
// class Ab.flash.Calendar
//
/////////////////////////////////////////////////////
Ab.flash.Calendar = Ab.flash.FlashControl.extend({
    // @begin_translatable
    z_MESSAGE_PREV: 'prev',
    z_MESSAGE_NEXT:	'next',
    z_MESSAGE_TODAY: 'today',
    z_MESSAGE_BYDAY: 'by day',
    z_MESSAGE_BYWORKWEEK: 'by workweek',
    z_MESSAGE_BYWEEK: 'by week',
    z_MESSAGE_BYMONTH: 'by month',
    z_MESSAGE_SUNDAY: 'Sunday',
    z_MESSAGE_MONDAY: 'Monday',
    z_MESSAGE_TUESDAY: 'Tuesday',
    z_MESSAGE_WEDNESDAY: 'Wednesday',
    z_MESSAGE_THURSDAY: 'Thursday',
    z_MESSAGE_FRIDAY: 'Friday',
    z_MESSAGE_SATURDAY: 'Saturday',
    z_MESSAGE_JANUARY: 'January',
    z_MESSAGE_FEBRUARY: 'February',
    z_MESSAGE_MARCH: 'March',
    z_MESSAGE_APRIL: 'April',
    z_MESSAGE_MAY: 'May',
    z_MESSAGE_JUNE: 'June',
    z_MESSAGE_JULY: 'July',
    z_MESSAGE_AUGUST: 'August',
    z_MESSAGE_SEPTEMBER: 'September',
    z_MESSAGE_OCTOBER: 'October',
    z_MESSAGE_NOVEMBER: 'November',
    z_MESSAGE_DECEMBER: 'December',
    z_MESSAGE_INITIALIZING: 'Initializing',
	// @end_translatable

	// max length of a summary field. Longer fields will be truncated.
	maxSummaryLength: 100,
	
	// the function that supports getLocalizedString_calendar_JS
	getLocalizedString_calendar: function(input) {
		return View.getLocalizedString(this[input]);
	},
		
 	// important field names
 	primaryKeyField: null,
 	summaryField: null,
 	startTimeField: null, 
 	endTimeField: null,
 	
 	// whether show weekend events on calendar
 	showWeekend: false,
 	
 	// used if want to color according to field
 	colorField: null,	
 	useDefaultColors: true,							
 	distinctColorValues: [],
 	
 	readOnly: false,
 	
 	// constructor
    constructor: function(controlId, dataSourceId, primaryKeyField, summaryField, startTimeField, endTimeField, showWeekend, additionalSWFParam, readOnly) {
    	calendarControl = this;
    	var swfParam = '?panelId=' + controlId;
    	if (typeof(additionalSWFParam)!="undefined" && additionalSWFParam != null) {
    		swfParam += additionalSWFParam;
    		if(additionalSWFParam.match(/colorField/g)){
    			this.colorField = additionalSWFParam.replace(/(.*?)&colorField=(.*?)/g, "$2");
    			this.colorField = this.colorField.replace(/&.*/g, "");
    			if(typeof(getColorForRecord) == 'function'){
    				this.useDefaultColors = false;
    			}
    			swfParam += '&useDefaultColors='+this.useDefaultColors;  		    	
    		}
    	}
    			
    	if (typeof(showWeekend)!="undefined" && showWeekend==true) {
    		this.showWeekend = true;
    	}
    	
    	if(typeof(readOnly) != undefined && readOnly == true) {
    		this.readOnly = true;
    	}
    	swfParam += "&readOnly="+this.readOnly;
    	
    	//get locale of current user to set correct first day of week
		var locale = View.user.locale;
		if(locale != 'en_US'){
			swfParam += '&firstDayOfWeek='+1;
		}
    	this.inherit(controlId, dataSourceId, "calendar/AbFlashCalendar", swfParam);
    	
		this.primaryKeyField = primaryKeyField;
		this.summaryField = summaryField.split(";");
		this.startTimeField = startTimeField.split(";");
		this.endTimeField = endTimeField.split(";");
 	},
 	
 	// if theTime!="", use theTime.
 	// Otherwise, if isEnd, use 23:59.
 	// Otherwise, use 00:00
 	myParseTime: function(theDate, theTime, isEnd) {
    	try {
	    	var year = theDate.getFullYear();
    		var month = theDate.getMonth() + 1;
    		var date = theDate.getDate();
    		var hours;
    		var minutes;
    		
    		if (theTime != ""){
    			hours = theTime.getHours();
    			minutes = theTime.getMinutes();
    		}
    		else if (isEnd) {
    			hours = 23;
    			minutes = 59;
    		}
    		else {
    			hours = 0;
    			minutes = 0;
    		}
    		return "" + year + "/" + month + "/" + date + " " + hours + ":" + minutes;
    	}
    	catch (e) {
    		return null;
    	}
    },
    
    // push a calendar item into an array
    pushCalendarItem: function(data, temp) {
    	for (var i=0; i<data.length; i++) {
    		// see if temp and data[i] should be merged into one
    		if (temp.primaryKey==data[i].primaryKey && temp.summary==data[i].summary) {
    			var arrTempStart = FiveFieldTimeSplit(temp.startTime);
    			var arrTempEnd = FiveFieldTimeSplit(temp.endTime);
    			var arrDataStart = FiveFieldTimeSplit(data[i].startTime);
    			var arrDataEnd = FiveFieldTimeSplit(data[i].endTime);
    			
    			// equal time range: return
    			if (FiveFieldTimeIsEqual(arrTempStart, arrDataStart) && FiveFieldTimeIsEqual(arrTempEnd, arrDataEnd)) {
    				return;
    			}
    			// intersect: merge by extending data[i]'s time interval
    			else if (FiveFieldTimeIsLess(arrTempStart, arrDataEnd) && FiveFieldTimeIsLess(arrDataStart, arrTempEnd)) {
     				if (FiveFieldTimeIsLess(arrTempStart, arrDataStart)) data[i].startTime = temp.startTime;
    				if (FiveFieldTimeIsLess(arrDataEnd, arrTempEnd)) data[i].endTime = temp.endTime;
    				return;
    			}
    			// temp immediately before data
    			else if (FiveFieldTimeIsContinuous(arrTempEnd, arrDataStart)) {
    				data[i].startTime = temp.startTime;
    				return;
    			}
    			// data immediately before temp
    			else if (FiveFieldTimeIsContinuous(arrDataEnd, arrTempStart)) {
    				data[i].endTime = temp.endTime;
    				return;
    			}
    		}
	    }
  		// cannot merge. So push.
    	data.push(temp);
    },
       
    // set this.data = an array of records, each having (primaryKey, summary, startTime, endTime)
	refreshDataFromDataSource: function(start, end){	 
		var ds = View.dataSources.get(this.dataSourceId);
		if (ds==null) return;
		var restrictionWithTime;
		if (this.restriction==null || this.restriction=="") 
			restrictionWithTime = "";
		else 
			restrictionWithTime = this.restriction + " AND ";

		restrictionWithTime += 
			this.startTimeField[0] + "<=${sql.date(\'" + end + "\')} AND ${sql.date(\'" +
			start + "\')} <=" + this.endTimeField[0];
				
		var records = ds.getRecords(restrictionWithTime);
		this.data = [];

		for (var i=0; i<records.length; i++) {
			var record = records[i];
			var temp = {};
			temp.primaryKey = record.getValue(this.primaryKeyField);
			if (temp.primaryKey=="") continue;
			
			// summary
			temp.summary = "";
			for (var k=0; k<this.summaryField.length; k++) {
				var e = record.getValue(this.summaryField[k]);
				if (e!=null && e!="") {
					if (temp.summary!="") temp.summary += "; ";
					temp.summary += e;
				}
			}
			if (temp.summary=="") continue;
			if (temp.summary.length>this.maxSummaryLength) 
				temp.summary = temp.summary.substring(0, this.maxSummaryLength);
			
			// startTime
			var startDate = record.getValue(this.startTimeField[0]);
			var startTime="";
			if (this.startTimeField.length==2) {
				startTime = record.getValue(this.startTimeField[1]);
			}
		
			temp.startTime = this.myParseTime(startDate, startTime, false);
		
			// endTime
			var endDate = record.getValue(this.endTimeField[0]);
			var endTime="";
			if (this.endTimeField.length==2) {
				endTime = record.getValue(this.endTimeField[1]);
			}
			
			temp.endTime = this.myParseTime(endDate, endTime, true);	
			
			// colorField
			if(this.colorField != null){
				if(this.useDefaultColors){
					temp.colorField = record.getValue(this.colorField);
				} else {
					temp.color = getColorForRecord(record);
				}
			}
						
			// insert a new entry
			if (temp.startTime!=null && temp.endTime!=null) {
				this.pushCalendarItem(this.data, temp);
			}
		}
		
		// split the records to avoid weekends if showWeekend==false
		if (this.showWeekend==false) {
			// get five-field array representation of the query start and end
			var queryStart = FiveFieldTimeSplitDateOnly(start, true);
			var queryEnd = FiveFieldTimeSplitDateOnly(end, false);
			
			// empty this.data
			var orig = this.data;
			this.data = [];
			
			// for each element in orig, split and push into this.data.
			for (var i=0; i<orig.length; i++) {
				// initialize start and end
				var arrOrigStart = FiveFieldTimeSplit(orig[i].startTime);
				if (FiveFieldTimeIsLess(arrOrigStart, queryStart)) {
					FiveFieldTimeCopy(arrOrigStart, queryStart);
				}
				var arrOrigEnd = FiveFieldTimeSplit(orig[i].endTime);
				if (FiveFieldTimeIsLess(queryEnd, arrOrigEnd)) {
					FiveFieldTimeCopy(arrOrigEnd, queryEnd);
				}
				var arrNewStart = [];
				var arrNewEnd = [];
				for (var k=0; k<arrOrigStart.length; k++) {
					arrNewStart.push(arrOrigStart[k]);
					arrNewEnd.push(arrOrigStart[k]);
				}
				if (FiveFieldTimeIsWeekend(arrNewStart)) {
					FiveFieldTimeAdvanceToMondayMorning(arrNewStart);
					if (FiveFieldTimeIsLess(arrOrigEnd, arrNewStart)) continue;
				}
				FiveFieldTimeAdvanceToFridayNight(arrNewEnd);
				if (FiveFieldTimeIsLess(arrOrigEnd, arrNewEnd)) {
					FiveFieldTimeCopy(arrNewEnd, arrOrigEnd); // arrNewEnd = arrOrigEnd
				}
				if (FiveFieldTimeIsLess(arrNewEnd, arrNewStart)) continue;
				
				// keep adding a new element and pushing
				while (true) {
					// push a new segment
					var temp = {};
					temp.primaryKey = orig[i].primaryKey;
					temp.summary = orig[i].summary;
					temp.startTime = FiveFieldTimeCombine(arrNewStart);
					temp.endTime = FiveFieldTimeCombine(arrNewEnd);
					
					// colorField
					if(this.colorField != null){
						if(this.useDefaultColors){
							temp.colorField = orig[i].colorField;
						} else {
							temp.color = orig[i].color;
						}
					}

					this.data.push(temp);
					
					// advance start
					FiveFieldTimeIncrease(arrNewStart, 1);
					FiveFieldTimeAdvanceToMondayMorning(arrNewStart);
					if (FiveFieldTimeIsLess(arrOrigEnd, arrNewStart)) break;
					
					// advance end
					FiveFieldTimeIncrease(arrNewEnd, 1);
					FiveFieldTimeAdvanceToFridayNight(arrNewEnd);
					if (FiveFieldTimeIsLess(arrOrigEnd, arrNewEnd)) {
						FiveFieldTimeCopy(arrNewEnd, arrOrigEnd); // arrNewEnd = arrOrigEnd
					}
				}
			}
		}	
		
		//XXX: The above implementation is not readable, have to process all-day events finally here.
		this.processAllDayEvents();
	 },
	 
	 /**
	  * When start and end dates are equal, increases end date by 1 and sets end time as "0:0", so that Flex calendar could display them as all-day events.
	  */
	 processAllDayEvents: function (){
		 for(var i = 0; i < this.data.length; i++){
			 var eventItem  = this.data[i];
			 var allDayEventEndDateTime = this.getAllDayEventDate(eventItem.startTime, eventItem.endTime);
			 if(allDayEventEndDateTime != null){
				 this.data[i].endTime = allDayEventEndDateTime;
			 }
		 }
	 },
	 
	 /**
	  * Gets all-day event date when the event is the target to become one All_day event,
	  * otherwise, returns null.
	   * @param {startDateTime} start date with time like "2012/6/12 0:0".
	   * @param {endDateTime} end date with time like "2012/6/12 23:59".
	  */
	 getAllDayEventDate: function(startDateTime, endDateTime){
		 var startDateISO = this.getISODate(startDateTime);
		 var endDateISO = this.getISODate(endDateTime);
		 var startTimeValue = this.getTimeValue(startDateTime);
		 var endTimeValue = this.getTimeValue(endDateTime);
		 
		 if ((startTimeValue === "0:0") && (endTimeValue === "23:59")){
			 return this.getAllDayEventEndDate(endDateISO);
		 }
		 
		 return null;
	 },
	 
	 /**
	  * Gets a time value like "23:59".
	   * @param {fullDate} date with time like "2012/6/12 23:59".
	  */
	 getTimeValue: function(fullDate){
		 var tmpArray = fullDate.split(" ");
		 return tmpArray[1];
	 },
	 
	 /**
	  * Gets a date in ISO date format "yyyy-mm-dd".
	   * @param {fullDate} date with time like "2012/6/12 0:0".
	  */
	 getISODate: function(fullDate){
		 	var isoDateArray = [];
			var tmpArray = fullDate.split(" ");
		   	if (tmpArray[0].indexOf("/") != -1) {
		   		isoDateArray = tmpArray[0].split("/"); 
			}else if (tmpArray[0].indexOf("-") != -1) {
				isoDateArray = tmpArray[0].split("-");
			}
		   	
		   	return isoDateArray[0] + "-" + isoDateArray[1] + "-" + isoDateArray[2];
	 },
	 
	 /**
	  * Gets a date in Flex Calendar's readable format like "2012/6/4 0:0".
	  * Increases the end day by 1.
	  * @param {endDateISO} date in ISO format.
	  */
	 getAllDayEventEndDate: function(endDateISO){
		 var dateArray = endDateISO.split("-");
		 var date = new Date();
		 date.setFullYear(dateArray[0], dateArray[1]-1, dateArray[2]);
		 date.setDate(date.getDate() + 1);
			
		 return date.getFullYear() + "/" + (date.getMonth()+1) + "/" +  date.getDate() + " 0:0";
	 }, 
	 
	 refreshData: function(restriction) {
		this.restriction = restriction;
	 	var obj = this.getSWFControl();
	 	if (obj!=null) obj.RefreshData();
	 }
});
