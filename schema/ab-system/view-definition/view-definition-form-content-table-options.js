/******************************************************************
	Javascript Api to handle options in Tgrp.
 ******************************************************************/

/*****************************************************************
 HTML form's names and DIV's id and form's element's names will be
 overwritten in XSLT by XSLT's defined variables

 *****************************************************************/
//user inputs form's element names
//their values will be overwritten in view-definition-form-content-table-options.xsl
var titleName       = "title";
var typesName		= "types";
var formatsName		= "formats";
var gridableName	= "gridable";
var printableName	= "printable";
//var tableWidthName  = "tableWidth";
var defaultActionsName  = "defaultActions";
var frameName			= "frame";
var iColumnNumberArea_title = "iColumnNumberArea_title";
var iColumnNumberArea_field = "iColumnNumberArea_field";
var iColumnNumberName = "iColumnNumberName";

/*function setUpTableWidth(n)
{
	var objForm	= document.forms[afmInputsFormName];
	var objTableWidth = objForm.elements[tableWidthName];
	for(var i=0; i < objTableWidth.length; i++)
	{
		if(objTableWidth[i].value == n)
		{
			objTableWidth[i].selected = 1;
			break;
		}
	}
}*/
//when users select report's format, if it's column, show "column
//number" options, otherwises, hide it.
function showOrHideIColumnNumberArea(objElem)
{
	var format   = objElem.value;
	var obj_iColumnNumberArea_title = document.getElementById(iColumnNumberArea_title);
	var obj_iColumnNumberArea_field = document.getElementById(iColumnNumberArea_field);
	format = format.toUpperCase();
	if(format=="COLUMN")
	{
		//show
		if(obj_iColumnNumberArea_title != null)
			obj_iColumnNumberArea_title.style.display = "";
		if(obj_iColumnNumberArea_field != null)
			obj_iColumnNumberArea_field.style.display = "";
	}
	else
	{
		//hide
		if(obj_iColumnNumberArea_title != null)
			obj_iColumnNumberArea_title.style.display = "none";
		if(obj_iColumnNumberArea_field != null)
			obj_iColumnNumberArea_field.style.display = "none";
	}

}


function gettingRecordsData()
{
	var objForm			= document.forms[afmInputsFormName];
	var temp_title      = "";
	var temp_defaultActions = "false";
	var temp_frame      = "";
	var temp_format     = "";
	var temp_iColumn    = 1;
	var temp_type       = "";
	var temp_tableWidth = "";
	var temp_showGrid   = "false";
	var temp_printable  = "false";
	var xml = "";

	temp_title      = objForm.elements[titleName].value;
	if(objForm.elements[defaultActionsName].checked)
		temp_defaultActions = "true";
	temp_format     = objForm.elements[formatsName].value;
	temp_type       = objForm.elements[typesName].value;
	temp_frame		= objForm.elements[frameName].value;
	temp_iColumn    = objForm.elements[iColumnNumberName].value;
	//temp_tableWidth = objForm.elements[tableWidthName].value;
	if(objForm.elements[gridableName].checked)
		temp_showGrid   = "true";
	if(objForm.elements[printableName].checked)
		temp_printable  = "true";

	//trim() and convert2validXMLValue() in common.js
	temp_title = trim(temp_title);
	temp_title = convert2validXMLValue(temp_title);

	///////////////////////////////////////////
	//window.top.frames[0] is view definiton top bar
	//currentTgrpFormat is defined by view definiton tree
	//used by visible fields form to handle PKs
	if(window.top.frames[0].currentTgrpFormat!=null)
		window.top.frames[0].currentTgrpFormat=temp_format;

	///////////////////////////////////////////

	//if(temp_title != "")
	{
		xml = '<afmTableGroup defaultActions="'+temp_defaultActions+'" ';
		xml = xml + ' type="'+temp_type+'" ';
		xml = xml + ' format="'+temp_format+'" ';
		xml = xml + ' column="'+temp_iColumn+'" ';
		//if there is no frame attribute or its value is empty with
		//afmTableGroup in XML, don't set up frame attribute
		if(temp_frame != "")
			xml = xml + ' frame="'+temp_frame+'" ';
		xml = xml + ' showGrid="'+temp_showGrid+'" ';
		//xml = xml + ' tableWidth="'+temp_tableWidth+'" ';
		xml = xml + ' >';
		xml = xml + '<title translatable="true" >'+temp_title+'</title>';
		xml = xml + '<afmReport printable="'+temp_printable+'"/>';
		xml = xml + '</afmTableGroup>';
		//user's inputs
		xml = "<userInputRecordsFlag>" + xml + "</userInputRecordsFlag>";
	}
	return xml;
}

//legal combination of type and format
function onChangeType(type)
{
	var objForm	= document.forms[afmInputsFormName];
	var format = objForm.elements[formatsName].value;
	type = type.toUpperCase();
	format = format.toUpperCase();
	if(type=="REPORT" || type=="REPORTNAVIGATOR")
	{
		if(format=="EDITFORM")
			objForm.elements[formatsName][0].selected=1;
	}
	else if(type=="FORM")
	{
		if(format!="EDITFORM")
		{
			objForm.elements[formatsName][1].selected=1;
		}
	}
}
function onChangeFormat(format)
{
	var objForm	= document.forms[afmInputsFormName];
	var type = objForm.elements[typesName].value;
	type = type.toUpperCase();
	format = format.toUpperCase();

        var formtable_format_warning_message = "";
	//localized string
	var formtable_format_warning_message_object = document.getElementById("formtable_format_warning_message");
	if(formtable_format_warning_message_object!=null)
		formtable_format_warning_message = formtable_format_warning_message_object.innerHTML;

	if(format=="COLUMN")
	{
		if(type=="FORM")
		{
			objForm.elements[typesName][0].selected=1;
		}
	}
	else if(format=="TABLE")
	{
		if(type=="FORM")
		{
			var bConfirm = confirm(formtable_format_warning_message);
			if(!bConfirm)
				objForm.elements[formatsName][1].selected=1;
		}
	}
	else if(format=="EDITFORM")
	{
		if(type!="FORM" && type!="DRAWING")
		{
			objForm.elements[typesName][1].selected=1;
		}
	}
}
