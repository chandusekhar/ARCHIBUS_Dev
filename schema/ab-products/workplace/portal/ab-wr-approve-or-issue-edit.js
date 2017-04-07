/*********************************************************************
 JavaScript File:ab-wr-approve-or-issue-edit.js


 *********************************************************************/
///////////////////////////////////////////////////////////////////////
//don't change those variables, they will be used by selectV new window when users
//select value to set up the value field by the selected value
//don't change them
var selectedValueInputFormName   = "";
var selectValueInputFieldID      = "";
//in edit form, it's required to lookup and fill up parent's inputs fields
var bSelectValueLookup = true;
var str_to_bl_id = "";
var str_to_fl_id = "";


function prepareLoad(formName,status)
{
	if(status!='')
	{
		//changing the value of show fields for date and time fields
		var objForm = document.forms[formName];
		var str_date_requested = objForm.elements["wr.date_requested"].value;
		var str_date_stat_chg = objForm.elements["wr.date_stat_chg"].value;
		var year, month, day;

		var str_time_requested = objForm.elements["wr.time_requested"].value;
		var str_time_stat_chg = objForm.elements["wr.time_stat_chg"].value;
		var hour, minute;
		var AMPM = "am";


		var obj_date_assigned = objForm.elements["wr.date_assigned"];
		if(obj_date_assigned.value!="")
		{
			//str_date_assigned: yyyy-mm-dd
			year = obj_date_assigned.value.split("-")[0];
			month = obj_date_assigned.value.split("-")[1];
			day = obj_date_assigned.value.split("-")[2];
			//FormattingDate() in date-time.js and strDateShortPattern in
			//locale.js
			 obj_date_assigned.value = FormattingDate(day, month, year,  strDateShortPattern);
		}

		if(str_date_requested!="")
		{
			//str_date_requested: yyyy-mm-dd
			year = str_date_requested.split("-")[0];
			month = str_date_requested.split("-")[1];
			day = str_date_requested.split("-")[2];
			//FormattingDate() in date-time.js and strDateLongPattern in
			//locale.js
			var show_obj_date_requested = document.getElementById("show_wr.date_requested");

			if(show_obj_date_requested!=null)
				show_obj_date_requested.innerHTML = FormattingDate(day, month, year,  strDateLongPattern);
		}
		if(str_date_stat_chg!="")
		{
			//str_date_requested: yyyy-mm-dd
			year = str_date_stat_chg.split("-")[0];
			month = str_date_stat_chg.split("-")[1];
			day = str_date_stat_chg.split("-")[2];
			//FormattingDate() in date-time.js and strDateLongPattern in
			//locale.js
			var show_obj_date_stat_chg = document.getElementById("show_wr.date_stat_chg");
			if(show_obj_date_stat_chg!=null)
				show_obj_date_stat_chg.innerHTML = FormattingDate(day, month, year,  strDateLongPattern);
		}
		if(str_time_stat_chg!="")
		{
			hour = str_time_stat_chg.split(":")[0];
			hour = parseInt(hour, 10);
			if(hour>=12)
				AMPM = "pm";
			while(hour > 12)
				hour = (hour>12) ? (hour-12): hour;

			minute = str_time_stat_chg.split(":")[1];
			var show_obj_time_stat_chg = document.getElementById("show_wr.time_stat_chg");
			if(show_obj_time_stat_chg!=null)
				show_obj_time_stat_chg.innerHTML = FormattingTime(hour, minute, AMPM, timePattern);
			// FormattingTime(hoursNow, minsNow, "", timePattern);
		}
		if(str_time_requested!="")
		{
			hour = str_time_requested.split(":")[0];
			hour = parseInt(hour, 10);
			if(hour>=12)
				AMPM = "pm";
			while(hour > 12)
				hour = (hour>12) ? (hour-12): hour;

			minute = str_time_requested.split(":")[1];
			var show_obj_time_requested = document.getElementById("show_wr.time_requested");
			if(show_obj_time_requested!=null)
				show_obj_time_requested.innerHTML = FormattingTime(hour, minute, AMPM, timePattern);
			// FormattingTime(hoursNow, minsNow, "", timePattern);
		}
	}
}
////////////////////////////////////
//called when users type into values input field to validate user's
//input (onKeyUp and onfocus events)
function validationInputs(formName, fieldName)
{
	var objForm = document.forms[formName];
	var objValue = objForm.elements[fieldName];
	var bReturned = true;
	if(objValue != null)
	{
		//arrFieldsInformation is in inputs-validation.js and
		//initialized by inputs-validation.xsl
		var maxsize = arrFieldsInformation[fieldName]["size"];
		maxsize = parseInt(maxsize);
		var format  = arrFieldsInformation[fieldName]["format"];
		var formatUpperCase = format.toUpperCase();
		var type  = arrFieldsInformation[fieldName]["type"];
		var typeUpperCase = type.toUpperCase();
		var decimal = arrFieldsInformation[fieldName]["decimal"];
		var bIsEnum = arrFieldsInformation[fieldName]["isEnum"];
		var required = arrFieldsInformation[fieldName]["required"];
		//don't work on any enumeration fields
		if(!bIsEnum)
		{
			//all validation funcrions are in inputs-validation.js
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
				if(!validationDataMaxSize(objValue, arrFieldsInformation[fieldName]))
					bReturned = false;
			}
			//check required fields
			if(!validationRequiredField(objValue, required))
				bReturned = false;
		}
	}
	return bReturned;
}

//and called in view-definition-form-content-table-filter.xsl
function onSelectV(strSerialized, strField, formName)
{
	var strXMLData = "";
	var objForm  = document.forms[formName];
	var selectedFieldObj = objForm.elements[strField];
	if(selectedFieldObj != null)
	{
		//setSerializedInsertingDataVariables() in common.js
		setSerializedInsertingDataVariables(strSerialized);
		var typeUpperCase = arrFieldsInformation[strField]["type"];
		typeUpperCase = typeUpperCase.toUpperCase();
		var formatUpperCase = arrFieldsInformation[strField]["format"];
		formatUpperCase = formatUpperCase.toUpperCase();
		var strValue = selectedFieldObj.value;
		//removing money sign and grouping separator and changing date into ISO format
		strValue = convertFieldValueIntoValidFormat(typeUpperCase, formatUpperCase, strValue);
		//trim strValue
		strValue = trim(strValue);
		//changing some special characters into valid characters in xml
		//convert2validXMLValue() in common.js
		strValue = convert2validXMLValue(strValue);
		var strData = "";
		var strXMLValue = "";
		if(strSerialized != "")
		{
			var temp_table = "";
			var temp_field = "";
			var temp_array = new Array();
			temp_array = strField.split(".");
			if(temp_array[0] != null)
				temp_table = temp_array[0];
			if(temp_array[1] != null)
				temp_field = temp_array[1];

			strData = '<fields><field ';
			strData = strData + 'table="'+temp_table+'" name="'+temp_field+'"/></fields>';
			//getting all records
			strData = strData + '<userInputRecordsFlag><record ' + gettingRecordsData(objForm) + '/></userInputRecordsFlag>';
			//strData = strData +strStartTag+ 'prefix ';
			//strData = strData + 'value="'+strValue+'"';
			//strData = strData + '/'+strCloseTag;

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

//reject the work request
function onReject(strSerialized, form_name)
{
	var objForm = document.forms[form_name];
	var wr_id, requestor, bl_id, prob_type;
	var tr_id, priority, ac_id, description;

	var date_stat_chg = getCurrentDateInISOFormat();
	var time_stat_chg = getCurrentTimeIn24HourFormat();

	var date_assigned = "";
	var time_assigned = "";
	date_assigned = objForm.elements["wr.date_assigned"].value;
	//trim
	date_assigned = trim(date_assigned);
	//getDateWithISOFormat
	if(date_assigned!="")
	{
		date_assigned = getDateWithISOFormat(date_assigned);
	}
	else
	{
		date_assigned = getCurrentDateInISOFormat();
	}

	time_assigned = objForm.elements["Storedwr.time_assigned"].value;
	time_assigned = trim(time_assigned);
	/*//getTimeWith24Format
	if(time_assigned!="")
	{
		time_assigned = getTimeWith24Format(time_assigned);
	}
	else*/
	if(time_assigned=="")
	{
		time_assigned = getCurrentTimeIn24HourFormat();
	}

	wr_id = objForm.elements["wr.wr_id"].value;
	wr_id = trim(wr_id);
	wr_id = convert2validXMLValue(wr_id);

	requestor = objForm.elements["wr.requestor"].value;
	requestor = trim(requestor);
	requestor = convert2validXMLValue(requestor);

	description = objForm.elements["wr.description"].value;
	description = trim(description);
	description = convertMemo2validateXMLValue(description);

	bl_id = objForm.elements["wr.bl_id"].value;
	bl_id = trim(bl_id);
	bl_id = convert2validXMLValue(bl_id);

	prob_type = objForm.elements["wr.prob_type"].value;
	prob_type = trim(prob_type);
	prob_type = convert2validXMLValue(prob_type);

	tr_id = objForm.elements["wr.tr_id"].value;
	tr_id = trim(tr_id);
	tr_id = convert2validXMLValue(tr_id);

	ac_id = objForm.elements["wr.ac_id"].value;
	ac_id = trim(ac_id);
	ac_id = convert2validXMLValue(ac_id);

	priority = objForm.elements["wr.priority"].value;


	var act_labor_hours,cause_type,cf_notes,completed_by,cost_est_labor,cost_est_other;
	var cost_est_parts,cost_est_tools,cost_est_total,cost_labor,cost_other,cost_parts;
	var cost_tools,cost_total,curr_meter_val,date_completed,date_est_completion,desc_other_costs;
	var down_time,dp_id,dv_id,est_labor_hours,location,option1,option2;
	var pmp_id,pms_id,repair_type,time_completed,wo_id;
	act_labor_hours = objForm.elements["wr.act_labor_hours"].value;
	cause_type = objForm.elements["wr.cause_type"].value;
	cause_type = trim(cause_type);
	cause_type = convert2validXMLValue(cause_type);
	cf_notes = objForm.elements["wr.cf_notes"].value;
	cf_notes = trim(cf_notes);
	cf_notes = convert2validXMLValue(cf_notes);
	completed_by = objForm.elements["wr.completed_by"].value;
	completed_by = trim(completed_by);
	completed_by = convert2validXMLValue(completed_by);
	cost_est_labor = objForm.elements["wr.cost_est_labor"].value;
	cost_est_other = objForm.elements["wr.cost_est_other"].value;
	cost_est_parts = objForm.elements["wr.cost_est_parts"].value;
	cost_est_tools = objForm.elements["wr.cost_est_tools"].value;
	cost_est_total = objForm.elements["wr.cost_est_total"].value;
	cost_labor = objForm.elements["wr.cost_labor"].value;
	cost_other = objForm.elements["wr.cost_other"].value;
	cost_parts = objForm.elements["wr.cost_parts"].value;
	cost_tools = objForm.elements["wr.cost_tools"].value;
	cost_total = objForm.elements["wr.cost_total"].value;
	curr_meter_val = objForm.elements["wr.curr_meter_val"].value;
	date_completed = objForm.elements["wr.date_completed"].value;

	date_est_completion = objForm.elements["wr.date_est_completion"].value;
	desc_other_costs = objForm.elements["wr.desc_other_costs"].value;
	desc_other_costs = trim(desc_other_costs);
	desc_other_costs = convert2validXMLValue(desc_other_costs);
	down_time = objForm.elements["wr.down_time"].value;
	dp_id = objForm.elements["wr.dp_id"].value;
	dp_id = trim(dp_id);
	dp_id = convert2validXMLValue(dp_id);
	dv_id = objForm.elements["wr.dv_id"].value;
	dv_id = trim(dv_id);
	dv_id = convert2validXMLValue(dv_id);
	est_labor_hours = objForm.elements["wr.est_labor_hours"].value;
	location = objForm.elements["wr.location"].value;
	location = trim(location);
	location = convert2validXMLValue(location);
	option1 = objForm.elements["wr.option1"].value;
	option1 = trim(option1);
	option1 = convert2validXMLValue(option1);
	option2 = objForm.elements["wr.option2"].value;
	option2 = trim(option2);
	option2 = convert2validXMLValue(option2);
	pmp_id = objForm.elements["wr.pmp_id"].value;
	pms_id = objForm.elements["wr.pms_id"].value;
	repair_type = objForm.elements["wr.repair_type"].value;
	time_completed = objForm.elements["wr.time_completed"].value;
	wo_id = objForm.elements["wr.wo_id"].value;

	var fl_id, rm_id, eq_id, phone, date_requested, time_requested;
	fl_id = objForm.elements["wr.fl_id"].value;
	fl_id = trim(fl_id);
	fl_id = convert2validXMLValue(fl_id);
	rm_id = objForm.elements["wr.rm_id"].value;
	rm_id = trim(rm_id);
	rm_id = convert2validXMLValue(rm_id);
	eq_id = objForm.elements["wr.eq_id"].value;
	eq_id = trim(eq_id);
	eq_id = convert2validXMLValue(eq_id);
	phone = objForm.elements["wr.phone"].value;
	phone = trim(phone);
	phone = convert2validXMLValue(phone);

	date_requested = objForm.elements["wr.date_requested"].value;
	//trim
	date_requested = trim(date_requested);
	//date_requested is already in ISO format
	//getDateWithISOFormat
	/*if(date_requested!="")
	{
		date_requested = getDateWithISOFormat(date_requested);
	}*/

	time_requested = objForm.elements["wr.time_requested"].value;
	time_requested = trim(time_requested);
	/*//getTimeWith24Format
	if(time_requested!="")
	{
		time_requested = getTimeWith24Format(time_requested);
	}*/

	var strXMLApproveAndIssue = '<afmAction type="render" state="ab-wr-approve-or-issue-edit-reject-response.axvw" response="true">';
	//<restrictions>
	strXMLApproveAndIssue = strXMLApproveAndIssue + '<restrictions>';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '<restriction type="sql" sql="wr_id=\''+wr_id+'\'">';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '<title translatable="true">SQL Restriction</title>';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '<field table="hwr"/>';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '</restriction>';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '</restrictions>';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '</afmAction>';

	strXMLApproveAndIssue = strXMLApproveAndIssue + '<transaction>';
	//update wr
	strXMLApproveAndIssue = strXMLApproveAndIssue + '<command type="update">';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '<record wr.prob_type="'+prob_type+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'wr.date_assigned="'+date_assigned+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'wr.time_assigned="'+time_assigned+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'wr.date_stat_chg="'+date_stat_chg+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'wr.time_stat_chg="'+time_stat_chg+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'wr.description="'+description+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'wr.ac_id="'+ac_id+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'wr.tr_id="'+tr_id+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'wr.priority="'+priority+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'wr.status="Rej" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '/>';
	//strXMLApproveAndIssue = strXMLApproveAndIssue + '<restrictions>';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '<restriction type="sql" sql="wr_id='+wr_id+' AND status IN (\'R\',\'Rev\')">';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '<title translatable="true">SQL Restriction</title>';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '<field table="wr"/>';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '</restriction>';
	//strXMLApproveAndIssue = strXMLApproveAndIssue + '</restrictions>'
	strXMLApproveAndIssue = strXMLApproveAndIssue + '</command>';
	//create a new record in hwr table
	strXMLApproveAndIssue = strXMLApproveAndIssue + '<command type="insert">';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '<record  hwr.requestor="'+requestor+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.prob_type="'+prob_type+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.bl_id="'+bl_id+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.fl_id="'+fl_id+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.rm_id="'+rm_id+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.description="'+description+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.date_assigned="'+date_assigned+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.time_assigned="'+time_assigned+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.date_requested="'+date_requested+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.time_requested="'+time_requested+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.date_stat_chg="'+date_stat_chg+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.time_stat_chg="'+time_stat_chg+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.tr_id="'+tr_id+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.ac_id="'+ac_id+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.eq_id="'+eq_id+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.phone="'+phone+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.priority="'+priority+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.status="Rej" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.wr_id="'+wr_id+'" ';

	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.act_labor_hours="'+act_labor_hours+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.cause_type="'+cause_type+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.cf_notes="'+cf_notes+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.completed_by="'+completed_by+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.cost_est_labor="'+cost_est_labor+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.cost_est_other="'+cost_est_other+'" ';

	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.cost_est_parts="'+cost_est_parts+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.cost_est_tools="'+cost_est_tools+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.cost_est_total="'+cost_est_total+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.cost_labor="'+cost_labor+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.cost_other="'+cost_other+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.cost_parts="'+cost_parts+'" ';

	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.cost_tools="'+cost_tools+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.curr_meter_val="'+curr_meter_val+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.date_completed="'+date_completed+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.date_est_completion="'+date_est_completion+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.desc_other_costs="'+desc_other_costs+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.down_time="'+down_time+'" ';

	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.dp_id="'+dp_id+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.dv_id="'+dv_id+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.est_labor_hours="'+est_labor_hours+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.location="'+location+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.option1="'+option1+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.option2="'+option2+'" ';

	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.pmp_id="'+pmp_id+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.pms_id="'+pms_id+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.repair_type="'+repair_type+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.time_completed="'+time_completed+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'hwr.wo_id="'+wo_id+'" ';

	strXMLApproveAndIssue = strXMLApproveAndIssue + '/>';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '</command>';
	//delete current record from wr table
	strXMLApproveAndIssue = strXMLApproveAndIssue + '<command type="delete">';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '<record wr.wr_id="'+wr_id+'"/>';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '</command>';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '</transaction>'
	strXMLApproveAndIssue = '<userInputRecordsFlag>' + strXMLApproveAndIssue + '</userInputRecordsFlag>';
	//send request to server
	sendingAfmActionRequestWithClientDataXMLString2Server('_self', strSerialized, strXMLApproveAndIssue);
}


//put the work request on hold
function onHold(strSerialized, form_name)
{
	var objForm = document.forms[form_name];
	var wr_id, requestor, bl_id, prob_type;
	var tr_id, priority, ac_id, description;

	var date_stat_chg = getCurrentDateInISOFormat();
	var time_stat_chg = getCurrentTimeIn24HourFormat();

	var date_assigned = "";
	var time_assigned = "";
	date_assigned = objForm.elements["wr.date_assigned"].value;
	//trim
	date_assigned = trim(date_assigned);
	//getDateWithISOFormat
	if(date_assigned!="")
	{
		date_assigned = getDateWithISOFormat(date_assigned);
	}
	else
	{
		date_assigned = getCurrentDateInISOFormat();
	}

	time_assigned = objForm.elements["Storedwr.time_assigned"].value;
	time_assigned = trim(time_assigned);
	//getTimeWith24Format
	/*if(time_assigned!="")
	{
		time_assigned = getTimeWith24Format(time_assigned);
	}
	else*/
	if(time_assigned=="")
	{
		time_assigned = getCurrentTimeIn24HourFormat();
	}

	wr_id = objForm.elements["wr.wr_id"].value;
	wr_id = trim(wr_id);
	wr_id = convert2validXMLValue(wr_id);

	requestor = objForm.elements["wr.requestor"].value;
	requestor = trim(requestor);
	requestor = convert2validXMLValue(requestor);

	description = objForm.elements["wr.description"].value;
	description = trim(description);
	description = convertMemo2validateXMLValue(description);

	bl_id = objForm.elements["wr.bl_id"].value;
	bl_id = trim(bl_id);
	bl_id = convert2validXMLValue(bl_id);

	prob_type = objForm.elements["wr.prob_type"].value;
	prob_type = trim(prob_type);
	prob_type = convert2validXMLValue(prob_type);

	tr_id = objForm.elements["wr.tr_id"].value;
	tr_id = trim(tr_id);
	tr_id = convert2validXMLValue(tr_id);

	ac_id = objForm.elements["wr.ac_id"].value;
	ac_id = trim(ac_id);
	ac_id = convert2validXMLValue(ac_id);

	priority = objForm.elements["wr.priority"].value;

	var strXMLApproveAndIssue = '<afmAction type="render" state="ab-wr-approve-or-issue-edit-hold-response.axvw" response="true">';
	//<restrictions>
	strXMLApproveAndIssue = strXMLApproveAndIssue + '<restrictions>';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '<restriction type="sql" sql="wr_id=\''+wr_id+'\'">';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '<title translatable="true">SQL Restriction</title>';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '<field table="wr"/>';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '</restriction>';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '</restrictions>';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '</afmAction>';

	strXMLApproveAndIssue = strXMLApproveAndIssue + '<transaction>';
	//update wr
	strXMLApproveAndIssue = strXMLApproveAndIssue + '<command type="update">';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '<record wr.prob_type="'+prob_type+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'wr.date_assigned="'+date_assigned+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'wr.time_assigned="'+time_assigned+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'wr.date_stat_chg="'+date_stat_chg+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'wr.time_stat_chg="'+time_stat_chg+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'wr.description="'+description+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'wr.ac_id="'+ac_id+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'wr.tr_id="'+tr_id+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'wr.priority="'+priority+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'wr.status="Rev" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '/>';
	//strXMLApproveAndIssue = strXMLApproveAndIssue + '<restrictions>';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '<restriction type="sql" sql="wr_id='+wr_id+' AND status IN (\'R\',\'Rev\')">';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '<title translatable="true">SQL Restriction</title>';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '<field table="wr"/>';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '</restriction>';
	//strXMLApproveAndIssue = strXMLApproveAndIssue + '</restrictions>'
	strXMLApproveAndIssue = strXMLApproveAndIssue + '</command>';

	strXMLApproveAndIssue = strXMLApproveAndIssue + '</transaction>'
	strXMLApproveAndIssue = '<userInputRecordsFlag>' + strXMLApproveAndIssue + '</userInputRecordsFlag>';

	//send request to server
	sendingAfmActionRequestWithClientDataXMLString2Server('_self', strSerialized, strXMLApproveAndIssue);
}

//approve and issue the work request
function onApproveAndIssue(strSerialized, form_name)
{
	var objForm = document.forms[form_name];
	var wr_id, requestor, bl_id, prob_type;
	var tr_id, priority, ac_id, description;

	var date_issued = getCurrentDateInISOFormat();
	var time_issued = getCurrentTimeIn24HourFormat();
	var date_stat_chg = getCurrentDateInISOFormat();
	var time_stat_chg = getCurrentTimeIn24HourFormat();

	var date_assigned = "";
	var time_assigned = "";
	date_assigned = objForm.elements["wr.date_assigned"].value;
	//trim
	date_assigned = trim(date_assigned);
	//getDateWithISOFormat
	if(date_assigned!="")
	{
		date_assigned = getDateWithISOFormat(date_assigned);
	}
	else
	{
		date_assigned = getCurrentDateInISOFormat();
	}

	time_assigned = objForm.elements["Storedwr.time_assigned"].value;
	time_assigned = trim(time_assigned);
	/*//getTimeWith24Format
	if(time_assigned!="")
	{
		time_assigned = getTimeWith24Format(time_assigned);
	}
	else*/
	if(time_assigned=="")
	{
		time_assigned = getCurrentTimeIn24HourFormat();
	}

	wr_id = objForm.elements["wr.wr_id"].value;
	wr_id = trim(wr_id);
	wr_id = convert2validXMLValue(wr_id);

	requestor = objForm.elements["wr.requestor"].value;
	requestor = trim(requestor);
	requestor = convert2validXMLValue(requestor);

	description = objForm.elements["wr.description"].value;
	description = trim(description);
	//memo
	description = convertMemo2validateXMLValue(description);

	bl_id = objForm.elements["wr.bl_id"].value;
	bl_id = trim(bl_id);
	bl_id = convert2validXMLValue(bl_id);

	prob_type = objForm.elements["wr.prob_type"].value;
	prob_type = trim(prob_type);
	prob_type = convert2validXMLValue(prob_type);

	tr_id = objForm.elements["wr.tr_id"].value;
	tr_id = trim(tr_id);
	tr_id = convert2validXMLValue(tr_id);

	ac_id = objForm.elements["wr.ac_id"].value;
	ac_id = trim(ac_id);
	ac_id = convert2validXMLValue(ac_id);

	priority = objForm.elements["wr.priority"].value;


	var strXML  = "";
	var strXMLApproveAndIssue = '<afmAction type="render" state="ab-wr-approve-or-issue-edit-approveAndIssue-response-top.axvw" response="true">';
	//<restrictions>
	strXMLApproveAndIssue = strXMLApproveAndIssue + '<restrictions>';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '<restriction type="sql" sql="wr_id=\''+wr_id+'\'">';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '<title translatable="true">SQL Restriction</title>';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '<field table="wr"/>';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '</restriction>';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '</restrictions>';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '</afmAction>';

	strXMLApproveAndIssue = strXMLApproveAndIssue + '<transaction>';
	//update wr
	strXMLApproveAndIssue = strXMLApproveAndIssue + '<command type="update">';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '<record wr.prob_type="'+prob_type+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'wr.date_assigned="'+date_assigned+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'wr.time_assigned="'+time_assigned+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'wr.date_stat_chg="'+date_stat_chg+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'wr.time_stat_chg="'+time_stat_chg+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'wr.description="'+description+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'wr.ac_id="'+ac_id+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'wr.tr_id="'+tr_id+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'wr.priority="'+priority+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'wr.status="I" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '/>';
	//strXMLApproveAndIssue = strXMLApproveAndIssue + '<restrictions>';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '<restriction type="sql" sql="wr_id='+wr_id+' AND status IN (\'R\',\'Rev\')">';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '<title translatable="true">SQL Restriction</title>';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '<field table="wr"/>';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '</restriction>';
	//strXMLApproveAndIssue = strXMLApproveAndIssue + '</restrictions>'
	strXMLApproveAndIssue = strXMLApproveAndIssue + '</command>';
	//create new record in wo table
	strXMLApproveAndIssue = strXMLApproveAndIssue + '<command type="insert">';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '<record  wo.name_of_contact="'+requestor+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'wo.bl_id="'+bl_id+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'wo.description="'+prob_type+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'wo.date_assigned="'+date_assigned+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'wo.time_assigned="'+time_assigned+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'wo.date_issued="'+date_issued+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'wo.time_issued="'+time_issued+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'wo.tr_id="'+tr_id+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'wo.ac_id="'+ac_id+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + 'wo.priority="'+priority+'" ';
	//strXMLApproveAndIssue = strXMLApproveAndIssue + 'wo.wr_id="'+wr_id+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '/>';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '</command>';
	/*
	//get new wo and assigned it to wr
	strXMLApproveAndIssue = strXMLApproveAndIssue + '<command type="update">';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '<record wr.wo_id="'+prob_type+'" ';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '/>';
	//strXMLApproveAndIssue = strXMLApproveAndIssue + '<restrictions>';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '<restriction type="sql" sql="wr_id=\''+wr_id+'\'">';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '<title translatable="true">SQL Restriction</title>';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '<field table="wr"/>';
	strXMLApproveAndIssue = strXMLApproveAndIssue + '</restriction>';
	//strXMLApproveAndIssue = strXMLApproveAndIssue + '</restrictions>'
	strXMLApproveAndIssue = strXMLApproveAndIssue + '</command>';
	*/
	strXMLApproveAndIssue = strXMLApproveAndIssue + '</transaction>'
	strXMLApproveAndIssue = '<userInputRecordsFlag>' + strXMLApproveAndIssue + '</userInputRecordsFlag>';

	//send request to server
	sendingAfmActionRequestWithClientDataXMLString2Server('_self', strSerialized, strXMLApproveAndIssue);
}



//getting input data from the edit form
function gettingRecordsData(objForm)
{
	var strReturned = "";

	return strReturned;
}
