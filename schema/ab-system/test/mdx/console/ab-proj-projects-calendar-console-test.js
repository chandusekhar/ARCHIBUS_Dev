/******************************************************************
	ab-proj-projects-calendar-console.js
 ******************************************************************/

var bBeenHere = false;

function SelvalsCustom(field,table){
	document.forms[0].field.value=field;
	document.forms[0].table.value=table;
	window.open("selvals-" + table + ".axvw", "subWindow", "height=600,width=500, scrollbars=yes,resizable=yes, status=yes");
}

//used in common.js to send uers's data to server
function gettingRecordsData(strSerialized)
{
	var objForm = document.forms[afmInputsFormName];

	var state_id;
	var site_id;
	var city_id;
	var bl_id;
	var dv_id;
	var dp_id;
	var program_id;
	var apprv_mgr1;
	var project_type;
	var activity_type;
	var project_id;

	state_id = objForm.elements["state_id"].value;
	state_id = trim(state_id);

	site_id = objForm.elements["site_id"].value;
	site_id = trim(site_id);

	city_id = objForm.elements["city_id"].value;
	city_id = trim(city_id);

	bl_id = objForm.elements["bl_id"].value;
	bl_id = trim(bl_id);

	dv_id = objForm.elements["dv_id"].value;
	dv_id = trim(dv_id);

	dp_id = objForm.elements["dp_id"].value;
	dp_id = trim(dp_id);

	program_id = objForm.elements["program_id"].value;
	program_id = trim(program_id);

	apprv_mgr1 = objForm.elements["apprv_mgr1"].value;
	apprv_mgr1 = trim(apprv_mgr1);

	project_type = objForm.elements["project_type"].value;
	project_type = trim(project_type);

	activity_type = objForm.elements["activity_type"].value;
	activity_type = trim(activity_type);

	project_id = objForm.elements["project_id"].value;
	project_id = trim(project_id);

	project_id = objForm.elements["project_id"].value;
	project_id = trim(project_id);


	var year	= objForm.elements["lstYear"].value;
	var	month	= objForm.elements["lstMonth"].value;
	var display	= objForm.elements["Display"].selectedIndex+1;
	var view	= objForm.elements["View"].selectedIndex+1;

	//////////////saving info into main toolbar's javascript array
	//main toolbar frame window.top.frames[0]
	var objMainToolbarFrame = window.top.frames[0];
	if(objMainToolbarFrame!=null)
	{
		//saving information into array:
		//objMainToolbarFrame.arrReferredByAnotherFrame1
		//since Show action will refresh console window
		var tempArray = objMainToolbarFrame.arrReferredByAnotherFrame1;

		if(tempArray!=null)
		{
			var newTempArray = new Array();
			newTempArray["state_id"] = state_id;
			newTempArray["site_id"] = site_id;
			newTempArray["city_id"] = city_id;
			newTempArray["bl_id"] = bl_id;
			newTempArray["dv_id"] = dv_id;
			newTempArray["dv_id"] = dv_id;
			newTempArray["dp_id"] = dp_id;
			newTempArray["program_id"] = program_id;
			newTempArray["apprv_mgr1"] = apprv_mgr1;
			newTempArray["project_type"] = project_type;
			newTempArray["activity_type"] = activity_type;
			newTempArray["project_id"] = project_id;
			newTempArray["lstYear"] = year;
			newTempArray["lstMonth"] = month;
			newTempArray["display"] = display;
			newTempArray["view"] = view;
			tempArray["CALENDAR_INFO"] = newTempArray;

			//assigned newTempArray to tempArray by name
			//"WR_REVIEW_INFO", which will be used to retreat info

		}
	}

	var strSQLRestriction = "";
	var strDateRangeStatement = "";
/*
	if(state_id != "")
		strSQLRestriction = strSQLRestriction + '<clause relop="AND" op="LIKE" value="'+state_id+'"><field name="state_id" table="bl"/></clause>';
	if(site_id != "")
		strSQLRestriction = strSQLRestriction + '<clause relop="AND" op="LIKE" value="'+site_id+'"><field name="site_id" table="bl"/></clause>';
	if(city_id != "")
		strSQLRestriction = strSQLRestriction + '<clause relop="AND" op="LIKE" value="'+city_id+'"><field name="city_id" table="bl"/></clause>';
	if(bl_id != "")
		strSQLRestriction = strSQLRestriction + '<clause relop="AND" op="LIKE" value="'+bl_id+'"><field name="bl_id" table="activity_log"/></clause>';
	if(dv_id != "")
		strSQLRestriction = strSQLRestriction + '<clause relop="AND" op="LIKE" value="'+dv_id+'"><field name="dv_id" table="project"/></clause>';
	if(dp_id != "")
		strSQLRestriction = strSQLRestriction + '<clause relop="AND" op="LIKE" value="'+dp_id+'"><field name="dp_id" table="project"/></clause>';
	if(program_id != "")
		strSQLRestriction = strSQLRestriction + '<clause relop="AND" op="LIKE" value="'+program_id+'"><field name="program_id" table="project"/></clause>';
	if(activity_type != "")
		strSQLRestriction = strSQLRestriction + '<clause relop="AND" op="LIKE" value="'+activity_type+'"><field name="activity_type" table="activity_log"/></clause>';
	if(apprv_mgr1 != "")
		strSQLRestriction = strSQLRestriction + '<clause relop="AND" op="LIKE" value="'+apprv_mgr1+'"><field name="apprv_mgr1" table="project"/></clause>';
*/
alert("project_id : " + project_id);
	if(project_id != "")
	 	strSQLRestriction = '<queryParameter name="projectid" type="java.lang.String" value="'+project_id+'" />';
//		strSQLRestriction = strSQLRestriction + '<clause relop="AND" op="LIKE" value="'+project_id+'"><field name="project_id" table="project"/></clause>';
	if(project_type != "")
		strSQLRestriction = strSQLRestriction + '<clause relop="AND" op="LIKE" value="'+project_type+'"><field name="project_type" table="project"/></clause>';
	if(strSQLRestriction != "")
		strSQLRestriction = '<queryParameters>' + strSQLRestriction + '</queryParameters>';

	var month=parseInt(month) + 1
	var monthend=parseInt(month) + 1

	var date_end= year + "-" + monthend + "-01";
	var date_start= year + "-" + month + "-01";

	strDateRangeStatement = 'date_scheduled &gt;=#Date%'+date_start+'%';
	strDateRangeStatement = strDateRangeStatement + ' AND date_scheduled &lt;=#Date%'+date_end+'%';

//	strSQLRestriction = strSQLRestriction + '<restriction type="sql" sql="'+strDateRangeStatement+'"><title translatable="false"></title><field table="activity_log"/></restriction>';

//	strSQLRestriction = '<restrictions>' + strSQLRestriction + '</restrictions>';

//	return strSQLRestriction;

	//render if transaction is OK.

	var strXMLCancelChange = "";

	// Determine which axvw to go to.

	var sDisplay = display;
	var sActivityType = view;

	var sFilename = "";

	// Project
	if (sDisplay == "1" && sActivityType =="1") {
		sFilename = "ab-proj-projects-calendar-project-mnthyear.axvw"
	}
	else if(sDisplay == "1" && sActivityType =="2")
	{
		sFilename = "ab-proj-projects-calendar-project-daysmnth.axvw"
	}
	else if(sDisplay == "1" && sActivityType =="3")
	{
		sFilename = "ab-proj-projects-calendar-project-daysweek.axvw"
	}

	// Work Packages
	if (sDisplay == "2" && sActivityType =="1") {
		sFilename = "ab-proj-projects-calendar-wrkpkg-mnthyear.axvw"
	}
	else if(sDisplay == "2" && sActivityType =="2")
	{
		sFilename = "ab-proj-projects-calendar-wrkpkg-daysmnth.axvw"
	}
	else if(sDisplay == "2" && sActivityType =="3")
	{
		sFilename = "ab-proj-projects-calendar-wrkpkg-daysweek.axvw"
	}

	// Actions or Activities
	if (sDisplay == "3" && sActivityType =="1") {
		sFilename = "ab-proj-projects-calendar-actvty-mnthyear.axvw"
	}
	else if(sDisplay == "3" && sActivityType =="2")
	{
		sFilename = "ab-proj-projects-calendar-actvty-daysmnth.axvw"
	}
	else if(sDisplay == "3" && sActivityType =="3")
	{
		sFilename = "ab-proj-projects-calendar-actvty-daysweek.axvw"
	}

	if (sFilename != ""){

		sFilename = "ab-proj-projects-calendar-project-test.axvw";  // debug
		strXMLCancelChange = '<afmAction type="applyParameters1" state="' + sFilename +'" response="true">';
		strXMLCancelChange += strSQLRestriction + '</afmAction>';
		strXMLCancelChange += strSQLRestriction;
		strSerialized = insertRenderedAXVWFile2AfmAction(strSerialized,sFilename);
		sendingAfmActionRequestWithClientDataXMLString2Server("_parent", strSerialized, strXMLCancelChange);

/*
		strXMLCancelChange = '<afmAction type="render" state="' + sFilename +'" response="true">';
		//<restrictions>
		strXMLCancelChange = strXMLCancelChange + strSQLRestriction + '</afmAction>';
		//strXMLCancelChange = '<userInputRecordsFlag>' + strXMLCancelChange + '</userInputRecordsFlag>';

		//send request to server
		alert(strXMLCancelChange);
*/
		// strSerialized = insertRenderedAXVWFile2AfmAction(strSerialized,sFilename);

		// var strFrame = getFrameObject(window, "detailsFrame").name;
		// sendingAfmActionRequestWithClientDataXMLString2Server(strFrame, strSerialized, strSQLRestriction);

		// sendingAfmActionRequestWithClientDataXMLString2Server("_parent", strSerialized, strXMLCancelChange);
	} else {alert("nothing")}
}





function onPageLoad()
{


	//set up cookies
	var today = new Date()  ;
	var expires = new Date() ;
	//one year?
	expires.setTime(today.getTime() + 1000*60*60*24*365);
	//set up cookies
	setCookie("WeekNumber", 0, expires);

	var objForm = document.forms[afmInputsFormName];
	//////////////saving info into main toolbar's javascript array
	var objMainToolbarFrame = window.top.frames[0];

	if(objMainToolbarFrame!=null)
	{

		var tempArray = objMainToolbarFrame.arrReferredByAnotherFrame1;

		if(objMainToolbarFrame.arrReferredByAnotherFrame1!=null)
		{

			var tempArray = objMainToolbarFrame.arrReferredByAnotherFrame1["CALENDAR_INFO"];

			if(tempArray!=null)
			{

			objForm.elements["state_id"].value=			tempArray["state_id"];
			objForm.elements["site_id"].value=			tempArray["site_id"];
			objForm.elements["city_id"].value=			tempArray["city_id"];
			objForm.elements["bl_id"].value=				tempArray["bl_id"];
			objForm.elements["dv_id"].value=		tempArray["dv_id"];
			objForm.elements["dp_id"].value=		tempArray["dp_id"];
			objForm.elements["program_id"].value=	tempArray["program_id"];
			objForm.elements["apprv_mgr1"].value=	tempArray["apprv_mgr1"];
			objForm.elements["project_type"].value=	tempArray["project_type"];
			objForm.elements["activity_type"].value=tempArray["activity_type"];
			objForm.elements["project_id"].value=	tempArray["project_id"];
			fProjectLogic();
			objForm.elements["lstYear"].value=tempArray["lstYear"];
			objForm.elements["lstMonth"].value=	tempArray["lstMonth"];
			objForm.elements["Display"].value=	tempArray["display"];
			objForm.elements["View"].value=	tempArray["view"];
			}
		}
	}

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
function onSelectV(strSerialized, strField, strTemp)
{
	var strXMLData = "";
	var objForm  = document.forms[afmInputsFormName];

	if(strField != "")
	{
		var typeUpperCase = arrFieldsInformation[strField]["type"];
		typeUpperCase = typeUpperCase.toUpperCase();
		var formatUpperCase = arrFieldsInformation[strField]["format"];
		formatUpperCase = formatUpperCase.toUpperCase();
		var strValue = objForm.elements[strField].value;
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
			<!-- adding role="self" in field will disable Java to show the values in its referred table if it is a foreign key -->
			<!-- not adding role="" or adding role="" with any string rather than "self" will enable Java to show the values in its referred table-->
			strData = '<fields><field role="self" table="'+temp_table+'" name="'+temp_field+'"/></fields>';
			//getting all records
			//strData = strData +gettingRecordsData();
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
		strField = "activity_log_id." + strField;
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

function fBuildYear ()
{
var dCurrentDate = new Date();
var dCurrentYear = dCurrentDate.getYear()

document.write ("<select class='inputField_box' id='lstYear' name='lstYear'>")

for (i = dCurrentYear - 10; i <= dCurrentYear + 10; i++)
{
	if (dCurrentYear == i) {
		document.write ("<option value='" + i + "' SELECTED><span translatable='true'>" + i + "</span></option>")
	}
	else {
		document.write ("<option value='" + i + "'><span translatable='true'>" + i + "</span></option>")
	}
}

document.write ("</select>")
}

function fBuildMonth ()
{
	var dCurrentDate = new Date();
	var dMonthNumber = dCurrentDate.getMonth() + 1
	var aMonth = new Array()

	aMonth[0]="January" ;
	aMonth[1]="February";
	aMonth[2]="March";
	aMonth[3]="April";
	aMonth[4]="May";
	aMonth[5]="June";
	aMonth[6]="July";
	aMonth[7]="August";
	aMonth[8]="September";
	aMonth[9]="October";
	aMonth[10]="November";
	aMonth[11]="December";

	document.write ("<select class='inputField_box' id='lstMonth' name='lstMonth'>")

	for (i = 0; i <= 11; i++)
	{
		if (dMonthNumber == i + 1) {
			document.write ("<option value='" + i + "' SELECTED><span translatable='true'>" + aMonth[i] + "</span></option>")
		}
		else {
			document.write ("<option value='" + i + " '><span translatable='true'>" + aMonth[i] + "</span></option>")
		}
	}

	document.write ("</select>")
}

function fDisplayOnchangeLogic () {
	if (document.getElementById("display").value =="3") {

		document.getElementById("activity_type").value = "";
		document.getElementById("activity_type").disabled = "true";
		document.getElementById("activity_type.button").disabled = "true";
	}
	else {
		document.getElementById("activity_type").disabled = false;
		document.getElementById("activity_type.button").disabled = false;
	}
}

function fViewOnchangeLogic () {
	if (document.getElementById("view").value == "1") {
		document.getElementById("lstMonth").disabled = true;
	}
	else {
		document.getElementById("lstMonth").disabled = false;
	}
}

function fProjectLogic () {
	if (document.getElementById("project_id").value != "") {
		document.getElementById("Display").options.length=0;
		addOption(document.getElementById("Display"),"Projects","1")
		addOption(document.getElementById("Display"),"Work Packages","2")
		addOption(document.getElementById("Display"),"Actions","3")
	}
	else if (document.getElementById("project_id").value == "") {
		document.getElementById("Display").options.length=0;
		addOption(document.getElementById("Display"),"Projects","1")
	}
}

function addOption(selectObject,optionText,optionValue) {
    var optionObject = new Option(optionText,optionValue)
    var optionRank = selectObject.options.length
    selectObject.options[optionRank]=optionObject
	selectObject.options[optionRank]=optionObject
}

function deleteOption(selectObject,optionRank) {
	selectObject.options.length=0;
	addOption(document.getElementById("Display"),"Project","0")
}
