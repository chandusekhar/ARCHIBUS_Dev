/******************************************************************
	ab-rm-reserve-filter.js
	some javascript API used in
	ab-rm-reserve-filter.js are defined in
	locale.js, date-time.js, and inputs-validation.js
	Javascript Api to set up filters in Tgrp.
	 strSerializedStartTag, strSerializedCloseTag,
	 strSerializedInsertingDataFirstPart,
	 strSerializedInsertingDataRestPart,
	 and setSerializedInsertingDataVariables(strSerialized); are in common.js
 ******************************************************************/

//used by ab-rm-reserve-detail.js
var rm_reserve_date_start = "";
var rm_reserve_date_end = "";
var rm_reserve_time_start = "";
var rm_reserve_time_end = "";
var rm_reserve_duration = "";


//don't change them! those variables will be used by selectV new window when users
//select value to set up the value field by the selected value
//don't change them
var selectedValueInputFormName   = afmInputsFormName;
var selectValueInputFieldID      = "";
//in filter form, there is no lookup required
var bSelectValueLookup = true;
//this array contains the enum fields and their enum lists
var arrEnumFieldsAndLists = new Array();
//called in view-definition-form-content-table-filter.xsl
//enumFieldName=rm.prorate
//enumFieldValueList=new Array();
//(enumFieldValueList["value"]="display";)
//enumFieldValueList["NONE"]="NONE";enumFieldValueList["FLOOR"]="FLOOR";
//enumFieldValueList["BUILDING"]="BUILDING";enumFieldValueList["SITE"]="SITE";
function setupArrEnumFieldsAndLists(FieldName,arrValueList)
{
	arrEnumFieldsAndLists[FieldName] = arrValueList;

}

////used by ab-rm-reserve-detail.js to generate SQL to insert a new
////record in rm_reserve table



//used in common.js to send uers's data to server
function gettingRecordsData()
{
	/*
	 (1) validate inputs
	 (2) how to get year, month, day (locale format?)
	 (3) calculate date_end and time_end
	 (4) sybase SQL API?
	 */
	var objForm = document.forms[afmInputsFormName];

	var rm_std, rm_cat, rm_type;
	rm_std = objForm.elements["rm.rm_std"].value;
	rm_std = convert2validXMLValueAndLiteralizeValue(rm_std);
	rm_cat = objForm.elements["rm.rm_cat"].value;
	rm_cat = convert2validXMLValueAndLiteralizeValue(rm_cat);
	rm_type = objForm.elements["rm.rm_type"].value;
	rm_type = convert2validXMLValueAndLiteralizeValue(rm_type);

	var strExtraRestriction = "";
	if(rm_std != "")
		strExtraRestriction = strExtraRestriction + "(rm.rm_std='"+rm_std+"'";
	if(rm_cat != "")
	{
		if(strExtraRestriction!=""){
			strExtraRestriction = strExtraRestriction + " AND rm.rm_cat='"+rm_cat+"'";
		}else{
			strExtraRestriction = strExtraRestriction + "(rm.rm_cat='"+rm_cat+"'";
		}
	}
	if(rm_type != "")
	{
		if(strExtraRestriction!=""){
			strExtraRestriction = strExtraRestriction + " AND rm.rm_type='"+rm_type+"'";
		}else{
			strExtraRestriction = strExtraRestriction + "(rm.rm_type='"+rm_type+"'";
		}
	}
	if(strExtraRestriction!="")
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

	var bl_id, fl_id, rm_id;

	var duration;


	bl_id = objForm.elements["rm.bl_id"].value;
	bl_id = convert2validXMLValue(bl_id);
	fl_id = objForm.elements["rm.fl_id"].value;
	fl_id = convert2validXMLValue(fl_id);
	rm_id = objForm.elements["rm.rm_id"].value;
	rm_id = convert2validXMLValue(rm_id);

	date_start = objForm.elements["rm_reserve.date_start"].value;

	arrDate_start = getDateArray(date_start);
	year_start = arrDate_start["year"];
	year_start = parseInt(year_start, 10);
	month_start = arrDate_start["month"];
	month_start = parseInt(month_start, 10);
	day_start = arrDate_start["day"];
	day_start = parseInt(day_start, 10);

	time_start = objForm.elements["startTime"].value;
	arrTime_start = gettingHourMinuteFromHHMMFormattedTime(time_start);
	hour_start = arrTime_start["HH"];
	hour_start = parseInt(hour_start, 10);
	minute_start = arrTime_start["MM"];
	minute_start = parseInt(minute_start, 10);

	duration = objForm.elements["duration"].value;
	duration = parseFloat(duration);
	//don't change the following orders
	days_duration = Math.floor(duration/24);
	hours_duration = duration % 24;

	minutes_duration = hours_duration * 60;
	minutes_start = hour_start * 60 + minute_start;
	totalMinutes = minutes_duration + minutes_start;
	minutes_left = totalMinutes % (24*60);
	hours_end = Math.floor(minutes_left/60);
	minutes_end = minutes_left % 60;

	time_end = FormattingTime(hours_end, minutes_end, "", "HH:MM");

	days_end = days_duration + day_start ;
	//adding any days in totalMinutes
	days_end = days_end + Math.floor(totalMinutes / (24*60));

	max_days = GetMonthMaxDays(month_start, year_start);
	if(days_duration==0)
		month_increased = 0;
	else
		month_increased = Math.floor(days_end / max_days);
	if(days_end > max_days)
		days_end = days_end % max_days;

	month_end = month_start + month_increased;

	year_end = (Math.floor(month_end / 12)==1)?(0):(Math.floor(month_end / 12));
	month_end = month_end  % 12;
	month_end = (month_end==0)?(12):(month_end);
	year_end = year_end + year_start ;

	date_end = FormattingDate(days_end, month_end, year_end,strDateShortPattern);
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
	if(bl_id != "")
		strSQLRestriction = strSQLRestriction + '<clause relop="AND" op="=" value="'+bl_id+'"><field name="bl_id" table="rm"/></clause>';
	if(fl_id != "")
		strSQLRestriction = strSQLRestriction + '<clause relop="AND" op="=" value="'+fl_id+'"><field name="fl_id" table="rm"/></clause>';
	if(rm_id != "")
	    strSQLRestriction = strSQLRestriction + '<clause relop="AND" op="=" value="'+rm_id+'"><field name="rm_id" table="rm"/></clause>';
	if(strSQLRestriction != "")
		strSQLRestriction = '<restriction type="parsed"><title translatable="true"/>' + strSQLRestriction + '</restriction>';



	//even strReturned is empty, <restrictions></restrictions> is necessary to be passed to server
	strSQLRestriction = strSQLRestriction + '<restriction type="sql" sql="'+strExtraRestriction+'(NOT EXISTS ( SELECT 1 FROM rm_reserve  WHERE rm_reserve.bl_id = rm.bl_id  AND   rm_reserve.fl_id = rm.fl_id  AND rm_reserve.rm_id = rm.rm_id  AND rm_reserve.status &lt;&gt; \'Can\'  AND ';
	strSQLRestriction = strSQLRestriction +	'( ( #TimeStampForField%rm_reserve.date_start rm_reserve.time_start%  &gt;= #TimeStampForValue%\''+date_start+'\'  \''+time_start+'\'% AND #TimeStampForField%rm_reserve.date_start rm_reserve.time_start% &lt; #TimeStampForValue%\''+date_end+'\'  \''+time_end+'\'%) OR ';
	strSQLRestriction = strSQLRestriction +	'(#TimeStampForField%rm_reserve.date_end rm_reserve.time_end% &lt;= #TimeStampForValue%\''+date_end+'\'  \''+time_end+'\'% AND #TimeStampForField%rm_reserve.date_end rm_reserve.time_end% &gt; #TimeStampForValue%\''+date_start+'\'  \''+time_start+'\'%)  OR ';
	strSQLRestriction = strSQLRestriction +	'(#TimeStampForField%rm_reserve.date_end rm_reserve.time_end% &gt; #TimeStampForValue%\''+date_end+'\'  \''+time_end+'\'%  AND #TimeStampForField%rm_reserve.date_start rm_reserve.time_start% &lt; #TimeStampForValue%\''+date_start+'\'  \''+time_start+'\'% ) ) ))">';
	//saving date_start, time_start, date_end, time_end and duration to
	//<title>2003-12-26;09:30|2003-12-30;12:30|36.0<title/>
	strSQLRestriction = strSQLRestriction +	'<title translatable="true">'+date_start+';'+time_start+'|'+date_end+';'+time_end+'|'+duration+'</title><field table="rm"/></restriction>';
	/////////////////////save the strSQLRestriction to the main tool
	/////////////////////bar, so later on, it can be reused.
	//XXX
	var today = new Date()  ;
	var expires = new Date() ;
	//one day
	expires.setTime(today.getTime() + 1000*60*60*24*1);

        if(strSQLRestriction!=null)
          setCookie("ab_rm_reserve_filter_restriction_cookies", strSQLRestriction, expires);
        else
          setCookie("ab_rm_reserve_filter_restriction_cookies", "", expires);

        if(objForm.elements["rm.rm_std"].value!=null)
          setCookie("ab_rm_reserve_rm_std_cookies", objForm.elements["rm.rm_std"].value, expires);
        else
          setCookie("ab_rm_reserve_rm_std_cookies", "", expires);

        if(objForm.elements["rm.rm_cat"].value!=null)
          setCookie("ab_rm_reserve_rm_cat_cookies", objForm.elements["rm.rm_cat"].value, expires);
        else
          setCookie("ab_rm_reserve_rm_cat_cookies", "", expires);

        if(objForm.elements["rm.rm_type"].value!=null)
          setCookie("ab_rm_reserve_rm_type_cookies", objForm.elements["rm.rm_type"].value, expires);
        else
          setCookie("ab_rm_reserve_rm_type_cookies", "", expires);

        setCookie("ab_rm_reserve_date_start_cookies", date_start, expires);
	setCookie("ab_rm_reserve_date_end_cookies", date_end, expires);
	setCookie("ab_rm_reserve_time_start_cookies", time_start, expires);
	setCookie("ab_rm_reserve_time_end_cookies", time_end, expires);

	//restrictions
	strSQLRestriction = '<restrictions><userInputRecordsFlag>' + strSQLRestriction + '</userInputRecordsFlag></restrictions>';
	return strSQLRestriction;
}


//called in view-definition-form-content-table-filter.xsl
/*
strSerializedStartTag, strSerializedCloseTag,
strSerializedInsertingDataFirstPart,
strSerializedInsertingDataRestPart,
and setSerializedInsertingDataVariables(strSerialized);
convert2validXMLValue()
in common.js
*/
function onSelectV(strSerialized, fieldName)
{
	var strXMLData = "";
	var objForm  = document.forms[afmInputsFormName];
	var strField = fieldName;

	if(strField != "")
	{
		var typeUpperCase = arrFieldsInformation[strField]["type"];
		typeUpperCase = typeUpperCase.toUpperCase();
		var formatUpperCase = arrFieldsInformation[strField]["format"];
		formatUpperCase = formatUpperCase.toUpperCase();
		var strValue = objForm.elements[fieldName].value;
		//removing money sign and grouping separator and changing date into ISO format
		strValue = convertFieldValueIntoValidFormat(typeUpperCase, formatUpperCase, strValue);
		//trim strValues
		strValue = strValue.replace(/^\s+/,'').replace(/\s+$/,'');
		if(typeUpperCase != "JAVA.SQL.TIME")
			strValue = convert2validXMLValue(strValue);
		var strData = "";
		var strXMLValue = "";
		if(strSerialized != "")
		{
			//calling setSerializedInsertingDataVariables() in
			//common.js to set up related js variables in common.js
			//strSerializedStartTag, strSerializedCloseTag,
			//strSerializedInsertingDataFirstPart,strSerializedInsertingDataRestPart
			setSerializedInsertingDataVariables(strSerialized);
			var temp_table = "";
			var temp_field = "";
			var temp_array = new Array();
			temp_array = strField.split(".");
			if(temp_array[0] != null)
				temp_table = temp_array[0];
			if(temp_array[1] != null)
				temp_field = temp_array[1];
			strData = '<fields><field ';
			strData = strData + 'table="'+temp_table+'" name="'+temp_field+'"/>'+'</fields>';
			//getting all records
			var bl_id = objForm.elements["rm.bl_id"].value;
			bl_id = convert2validXMLValue(bl_id);
			var fl_id = objForm.elements["rm.fl_id"].value;
			fl_id = convert2validXMLValue(fl_id);
			var rm_id = objForm.elements["rm.rm_id"].value;
			rm_id = convert2validXMLValue(rm_id);

			strData = strData +'<record rm.bl_id="'+bl_id+'" rm.fl_id="'+fl_id+'" rm.rm_id="'+rm_id+'"/>';
			//strData = strData +strStartTag+ 'prefix ';
			//strData = strData + 'value="'+strValue+'"';
			//strData = strData + '/'+strCloseTag;
			strData = '<userInputRecordsFlag>'+strData+'</userInputRecordsFlag>';
			strXMLValue = strSerializedInsertingDataFirstPart + strData +  strSerializedInsertingDataRestPart;
			//calling OpenSelectVWindow() to open a new window for server
			//to show available values for specified field
			OpenSelectVWindow(strXMLValue);
		}
		else
		{
			if(Debug)
			{
				alert("The attribute serialized of afmAction is empty.");
			}
		}
	}
}


////////////////////////////////////
//called when users type into values input field to validate user's
//input (onKeyUp and onfocus events)
function validationInputs(strField)
{
	var objForm = document.forms[afmInputsFormName];
	var objValue = objForm.elements[strField];
	var bReturned = true;

	if(strField == "")
	{
		//set values input to empty
		objValue.value = "";
	}
	else if(objValue.value != "")
	{
		//validation
		var maxsize = arrFieldsInformation[strField]["size"];
		maxsize = parseInt(maxsize);
		var format  = arrFieldsInformation[strField]["format"];
		var formatUpperCase = format.toUpperCase();
		var type  = arrFieldsInformation[strField]["type"];
		var typeUpperCase = type.toUpperCase();
		var decimal = arrFieldsInformation[strField]["decimal"];

		//check integer
		if(typeUpperCase=="JAVA.LANG.INTEGER")
		{
			if(!validationIntegerOrSmallint(objValue, true))
				bReturned = false;
		}
		//check numeric
		else if(typeUpperCase=="JAVA.LANG.DOUBLE" || typeUpperCase=="JAVA.LANG.FLOAT")
		{
			if(!validationNumeric(objValue,decimal, true))
				bReturned = false;
		}

		//check UPPERALPHANUM
		if(formatUpperCase=="UPPERALPHANUM")
		{
			objValue.value = (objValue.value).toUpperCase();
			if(!validationUPPERALPHANUMString(objValue))
				bReturned = false;
		}
		//check UPPERALPHA
		else if(formatUpperCase=="UPPERALPHA")
		{
			objValue.value = (objValue.value).toUpperCase();
			if(!validationUPPERALPHAString(objValue))
				bReturned = false;
		}
		else if(formatUpperCase=="UPPER")
		{
			objValue.value = (objValue.value).toUpperCase();
		}

		//check maxsize(skip date and time fields)
		if(typeUpperCase!= "JAVA.SQL.DATE" && typeUpperCase!= "JAVA.SQL.TIME")
		{
			if(!validationDataMaxSize(objValue, arrFieldsInformation[strField]))
				bReturned = false;
		}
	}
	return bReturned;
}

//what this function is doing is not only validating the inputs, but
//also converting the inputs into correct localized date or time format
//(onBlur event: when mouse is leaving is focus for current date/time
//input field)
//validationAndConvertionDateInput() and
//validationAndConvertionTimeInput //are defined in date-time.js
function validationAndConvertionDateAndTime(fieldName, bPagedLoaded)
{
	var objForm = document.forms[afmInputsFormName];
	//var strField = objForm.elements[fieldName].value;
	var objValue = objForm.elements[fieldName];
	if(objValue.value != "")
	{
		var type  = arrFieldsInformation[fieldName]["type"];
		var typeUpperCase = type.toUpperCase();
		var bRequired  = arrFieldsInformation[fieldName]["required"];
		var field_value = objValue.value;
		if(typeUpperCase == "JAVA.SQL.DATE")
		{
			//since initially sever sends date in ISO format
			//"YYY-MM-DD"
			var dateArrayObj = new Array();
			if(bPagedLoaded && field_value != null && field_value != "")
				dateArrayObj = field_value.split("-");
			else
				dateArrayObj = null;
			validationAndConvertionDateInput(objValue, fieldName, dateArrayObj,bRequired, false, true);
		}
		else if(typeUpperCase == "JAVA.SQL.TIME")
		{
			//since initially sever sends time in the format "HH:MM"
			var TimeArrayObj = new Array();
			if(bPagedLoaded && field_value != null && field_value != "")
				TimeArrayObj = field_value.split(":");
			else
				TimeArrayObj = null;
			validationAndConvertionTimeInput(objValue, fieldName, TimeArrayObj,bRequired, false, true);
		}
	}
}
//called when page is onload for initialize start date as today
function setupDateTimeValues(strDateTime)
{

	var temp_array = new Array();
	//2003-12-26;09:30|2003-12-30;12:30|4.0
	//pay attentation to used separators and order!!!
	temp_array = strDateTime.split("|");
	if(temp_array[1]!=null)
	{
		//which will be used by ab-rm-reserve-detail.js to generate SQL
		//for room reservation
		rm_reserve_date_start = temp_array[0].split(";")[0];
		rm_reserve_time_start = temp_array[0].split(";")[1];
		rm_reserve_date_end = temp_array[1].split(";")[0];
		rm_reserve_time_end = temp_array[1].split(";")[1];
		rm_reserve_duration = temp_array[2];
		//set up initial values for date_start, time_start, and
		//duration in console window
		var temp_rm_reserve_time_start=rm_reserve_time_start.substring(0,5);
		var objForm = document.forms[afmInputsFormName];
		var objField_startTime = objForm.elements['startTime'];
		for(var i=0; i<objField_startTime.length; i++)
		{
			if(objField_startTime[i].value == temp_rm_reserve_time_start)
				objField_startTime[i].selected = 1;
		}
		var objField_duration = objForm.elements['duration'];
		for(var i=0; i<objField_duration.length; i++)
		{
			if(objField_duration[i].value == rm_reserve_duration)
				objField_duration[i].selected = 1;
		}
		var objField_startDate = objForm.elements['rm_reserve.date_start'];
		var temp_year = rm_reserve_date_start.split("-")[0];
		var temp_month = rm_reserve_date_start.split("-")[1];
		var temp_day = rm_reserve_date_start.split("-")[2];
		objField_startDate.value = FormattingDate(temp_day, temp_month, temp_year, strDateShortPattern);;
	}
	else
	{
		//date(tomorrow)
		var tomorrow = new Date(new Date().valueOf() + 86400000);
		var month = tomorrow.getMonth()+ 1;
		var day	  = tomorrow.getDate();
		var year  = tomorrow.getFullYear();
		//strDateShortPattern is defined in locale.js  and overwritten by
		//xslt
		var selectedDate = FormattingDate(day, month, year, strDateShortPattern);
		userSelectedDate = selectedDate;
		var objSelectedDate	= document.getElementById('rm_reserve.date_start');
		if(objSelectedDate != null)
			objSelectedDate.value = selectedDate;
	}

        if(getCookie("ab_rm_reserve_rm_std_cookies")!=null)
  	  document.getElementById('rm.rm_std').value = getCookie("ab_rm_reserve_rm_std_cookies");

        if(getCookie("ab_rm_reserve_rm_cat_cookies")!=null)
          document.getElementById('rm.rm_cat').value = getCookie("ab_rm_reserve_rm_cat_cookies");

        if(getCookie("ab_rm_reserve_rm_type_cookies")!=null)
	  document.getElementById('rm.rm_type').value = getCookie("ab_rm_reserve_rm_type_cookies");
}

//start date cannot be earlier than today
function checkStartDateInput(objElement)
{
	var startDateInput = objElement.value;
	var strWarningMessage = document.getElementById("start_date").innerHTML;
	var curDate = new Date();
	var month = curDate.getMonth()+ 1;
	var day	  = curDate.getDate();
	var year  = curDate.getFullYear();

	if(startDateInput!="")
	{
		var ToDay = new Date(month+"/"+day+"/"+year);
		var startDateInputArray = getDateArray(startDateInput);
		var startDate = new Date(startDateInputArray["month"]+"/"+startDateInputArray["day"]+"/"+startDateInputArray["year"]);
		if(startDate < ToDay)
		{
			//localized
			if(document.getElementById("ab_rm_reservation_startdate_message") != null & document.getElementById("ab_rm_reservation_startdate_message").innerHTML != "")
				strWarningMessage = document.getElementById("ab_rm_reservation_startdate_message").innerHTML;
			alert(strWarningMessage);
			objElement.focus();
			return false;
		}
	}else{
		//today as default
		var tomorrow = new Date(new Date().valueOf() + 86400000);
		var t_month = tomorrow.getMonth()+ 1;
		var t_day   = tomorrow.getDate();
		var t_year  = tomorrow.getFullYear();
		objElement.value = FormattingDate(t_day, t_month, t_year, strDateShortPattern);
	}
	return true;
}

//start time cannot be earlier than current time if the start date is
//today
function checkStartTimeInput(objElement)
{
	var objForm = document.forms[afmInputsFormName];
	var startTimeInput = objElement.value;

	var strWarningMessage = document.getElementById("start_date_and_time").innerHTML;
	if(startTimeInput!="")
	{
		var curDate = new Date();
		var month = curDate.getMonth()+ 1;
		var day	  = curDate.getDate();
		var year  = curDate.getFullYear();
		var ToDay = month+"/"+day+"/"+year;
		var startDateInput = objForm.elements["rm_reserve.date_start"].value;

		if(startDateInput!="")
		{
			var startDateInputArray = getDateArray(startDateInput);

			var startDate = startDateInputArray["month"]+"/"+startDateInputArray["day"]+"/"+startDateInputArray["year"];
			if(startDate == ToDay)
			{

				var tempStartTimeArray = gettingHourMinuteFromHHMMFormattedTime(startTimeInput);
				var hoursNow = curDate.getHours();
				var minsNow	 = curDate.getMinutes();
				var start_hour = tempStartTimeArray["HH"];
				var start_minute = tempStartTimeArray["MM"];
				start_hour = parseInt(start_hour, 10);
				start_minute = parseInt(start_minute, 10);

				if((hoursNow > start_hour) ||((hoursNow == start_hour)&&(minsNow > start_minute)))
				{
					//localized
					if(document.getElementById("ab_rm_reservation_starttime_message") != null & document.getElementById("ab_rm_reservation_starttime_message").innerHTML != "")
						strWarningMessage = document.getElementById("ab_rm_reservation_starttime_message").innerHTML;
					alert(strWarningMessage);
					objElement.focus();
					return false;
				}
			}
		}
	}
	return true;
}
//send to server?
function onShow(strUrl, strSerialized, strTarget, subFrameName ,bData, newWindowSettings)
{
	var objForm = document.forms[afmInputsFormName];
	if(checkStartDateInput(objForm.elements["rm_reserve.date_start"]) && checkStartTimeInput(objForm.elements["startTime"]))
		sendingDataFromHiddenForm(strUrl, strSerialized, "_parent", subFrameName ,bData, newWindowSettings);
}

