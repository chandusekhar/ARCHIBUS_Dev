/*********************************************************************
 reports.js
 handling the functionalities for data reports
 Author: Yong Shao
 Date:	 06/20/2002
  strSerializedStartTag, strSerializedCloseTag,
  strSerializedInsertingDataFirstPart,
  strSerializedInsertingDataRestPart,	
  and setSerializedInsertingDataVariables(strSerialized); are in common.js
 *********************************************************************/

//will be overwritten in XSL
var abSchemaSystemGraphicsFolder = "";

var strIMGDirectory	= "";
var previouSelectedNodeImgID	= "";
var strPreviousSelectedIcon		= "ab-icon-tree-deselected.gif";
var strBeingSelectedIcon		= "ab-icon-tree-selected.gif";//ab-icon-tree-exp.gif";
var strNotBeingSelectedIcon		= "ab-icon-task-dflt.gif";


//this variable value must be same as the xslt variable "bSelect" in report-table-data.xsl
var strBSelectCheckBoxName = "bSelect";
//each tgrp has a unquie form with it
//hold each form's row selection action button's names
//arrSelectionActionButtonNames[formName][0]=selectionButton1Name;
//arrSelectionActionButtonNames[formName][1]=selectionButton2Name;
var arrSelectionActionButtonNames = new Array();
//checking if any row is selectd in a report table
//objForm: the object of form
function CheckSelectionAfmReportForm(objForm)
{
	var isSelected = false;
	var objBSelectCheckbox = objForm.elements[strBSelectCheckBoxName];
	if(objBSelectCheckbox != null){
		if(objBSelectCheckbox.length != null){
			//existing multiple rows?
			for(var i = 0; i < objBSelectCheckbox.length; i++){
				if( objBSelectCheckbox[i].checked){
					//rows are selected
					isSelected = true;
					break;
				}
			}
		}else{
			//existing only one row? it seems objBSelectCheckbox.length
			//is not working in this case(bug in IE or Javascript
			//engine?).
			if(objBSelectCheckbox.checked)
				isSelected = true;
		}
	}
	return isSelected;
}

//inserting user's data records into strSerialized
//formName: form's name
//strSerialized: xml string coming from action in xml
function insertingRecodDataString(formName, strSerialized)
{
	var strXMLValue = strSerialized;
	var objForm = document.forms[formName];
	var strData = "";
	//setSerializedInsertingDataVariables() in common.js
	//to set strSerializedStartTag, strSerializedCloseTag,
	//strSerializedInsertingDataFirstPart,
	//strSerializedInsertingDataRestPart in common.js
	setSerializedInsertingDataVariables(strSerialized);
	
	var bRowSelected = CheckSelectionAfmReportForm(objForm);
	if(bRowSelected && strSerializedInsertingDataFirstPart!="" && strSerializedInsertingDataRestPart!=""){
		var objBSelectCheckbox = objForm.elements[strBSelectCheckBoxName];
		if(objBSelectCheckbox != null){
			//getting value(only primary keys) from each selected row in the table 
			for(var i = 0; i < objBSelectCheckbox.length; i++){
				if( objBSelectCheckbox[i].checked){
					//forming record data string like
					//&lt;record rm.bl_id='HQ'/&gt;(<record rm.bl_id='HQ'/>)
					strData = strData + strSerializedStartTag + 'record' + objBSelectCheckbox[i].value + ' /' + strSerializedCloseTag;
				}
			}
		}
		//inserting into strSerialized
		strXMLValue = strSerializedInsertingDataFirstPart + strData +  strSerializedInsertingDataRestPart;
	}
	return strXMLValue;
}

//when users click URL linkings or actions, set up proper linking url with
//restriction information in xml
//formName: form's name
//strSerialized: xml string coming from action in XML
//strTarget: request's target
//isRowsAction: if the action is on data rows in the form
function sendingRequestToServer(formName, strSerialized, strTarget, isRowsAction)
{
	var strXMLValue = strSerialized;
	if(isRowsAction){
		//inserting selected rows' pks value into strSerialized
		strXMLValue = insertingRecodDataString(formName,strSerialized);
	}
	//sending data to server through a hidden form
	sendingDataFromHiddenForm('', strXMLValue, strTarget, '', false,"");
	//calling onLoadTableRefreshChildren to refresh all other child frames
	onLoadTableRefreshChildren(formName, strTarget);
}


//calling to enable selection action buttons
//formName: form's name
function EnableSelectionActionButtons(formName)
{
	//get array for sepecified form's row selection action button's
	//names
	var arrSelectionButtonNames = arrSelectionActionButtonNames[formName];
	if(arrSelectionButtonNames != null){
		var objForm = document.forms[formName];
		//check if any row selection check box is checked
		var bFlag = CheckSelectionAfmReportForm(objForm);
		for(var i=0; i < arrSelectionButtonNames.length; i++){
			var strButtonName = arrSelectionButtonNames[i];
			var objButton = objForm.elements[strButtonName];
			if(objButton != null){
				if(bFlag)
					//enable it
					objButton.disabled = 0;
				else
					//disable it
					objButton.disabled = 1;
			}
		}
	}
}

//depreciated????????????????
function printOutView(printButtonID, printCloseWndID)
{
	var objPrintButton = document.getElementById(printButtonID);
	var objPrintCloseWndButton = document.getElementById(printCloseWndID);
	//hidding buttons
	if(objPrintButton != null && objPrintCloseWndButton != null){
		if( document.all ||(!document.all && document.getElementById) ){
			objPrintButton.style.visibility = "hidden";
			objPrintCloseWndButton.style.visibility = "hidden";
		}
	}
	//print out
	self.print();
	//reshow buttons after print ???
	if(objPrintButton != null && objPrintCloseWndButton != null){
		if( document.all ||(!document.all && document.getElementById) ){
			objPrintButton.style.visibility = "visible";
			objPrintCloseWndButton.style.visibility = "visible";
		}
	}
	//<A href="#"></A> 
	return false;
}



//when document Item is clicked, this function is called to
//change the image with this item to indicate it is selected. 
function ChangeItToActiveItem(IMGID, strUrl, strXML, strTarget)
{
	strIMGDirectory = abSchemaSystemGraphicsFolder + "/";
	//send out request to server
	sendingDataFromHiddenForm(strUrl, strXML, strTarget, "", false,"");
	//change previous active node icon as selected
	if(previouSelectedNodeImgID != ""){
		var previousSelectedImgObj = document.getElementById(previouSelectedNodeImgID);
		if(previousSelectedImgObj != null)
			previousSelectedImgObj.src = strIMGDirectory + strPreviousSelectedIcon;;
			previousSelectedImgObj.alt = "Item Previously Selected";
			previousSelectedImgObj.title = "Item Previously Selected";
	}
	if(IMGID != ""){
		//change icon to indicate active link
		var strIMGName = "IMG_"+IMGID;
		//assign strIMGName to previouSelectedNodeImgID for next time use 
		previouSelectedNodeImgID = strIMGName;

		var imgObj = document.getElementById(strIMGName);
		if(imgObj!=null)
			imgObj.src = strIMGDirectory + strBeingSelectedIcon;
			imgObj.alt = "Item Selected";
			imgObj.title = "Item Selected";
	}
}
///////////////////////////
////////panel
//single row
function getRowPKs(rowIndex, formName)
{
	var returnValue="";
	var form = formName;
	if (typeof arguments[0] == "undefined"){
		form = document.forms[1].name;
	}
	var objForm = document.forms[form];
	var objBSelectCheckbox = objForm.elements[strBSelectCheckBoxName]
	if(objBSelectCheckbox.length != null){
		returnValue = objBSelectCheckbox[rowIndex].value;
	}else{
		returnValue = objBSelectCheckbox.value;
	}
	return returnValue;
}
//multi-select rows by checking checkbox
function getRowsPKs(formName)
{
	var form = formName;
	if (typeof arguments[0] == "undefined"){
		form = document.forms[1].name;
	}
	var returnedValue = "";
	var objForm = document.forms[form];
	var objBSelectCheckbox = objForm.elements[strBSelectCheckBoxName];
	if(objBSelectCheckbox != null){
		if(objBSelectCheckbox.length != null){
			for(var i = 0; i < objBSelectCheckbox.length; i++){
				if( objBSelectCheckbox[i].checked){
					var rowPKs =  objBSelectCheckbox[i].value;
					rowPKs = generateRecordXML(rowPKs)
					if(rowPKs!=""){
						returnedValue = returnedValue +rowPKs;
					}
				}
			}
		}else{

			if( objBSelectCheckbox.checked){
				var rowPKs =  objBSelectCheckbox.value;
				rowPKs = generateRecordXML(rowPKs)
				if(rowPKs!=""){
					returnedValue = returnedValue +rowPKs;
				}
			}
		}

	}
	if(returnedValue!=""){
		returnedValue = "<userInputRecordsFlag>"+returnedValue+"</userInputRecordsFlag>";
	}
	
	return returnedValue;
}


function generateRecordXML(rowPKs)
{
	rowPKs = trim(rowPKs);
	if(rowPKs!=""){
		rowPKs = convert2validXMLValue(rowPKs);
		rowPKs = rowPKs.replace(/AFM_FLAG::QUOTE/g, '"');
		rowPKs = rowPKs.replace(/AFM_FLAG::GROUP/g, '');
		rowPKs = "<record "+rowPKs+"><keys "+rowPKs+"/></record>";		
	}
	return rowPKs;
}

function getSQLRestrictionMultiSelection(formName)
{
	var form = formName;
	if (typeof arguments[0] == "undefined"){
		form = document.forms[1].name;
	}
	var returnedValue = "";
	
	var objForm = document.forms[form];
	var objBSelectCheckbox = objForm.elements[strBSelectCheckBoxName];
	if(objBSelectCheckbox != null){
		if(objBSelectCheckbox.length != null){
			for(var i = 0; i < objBSelectCheckbox.length; i++){
				if( objBSelectCheckbox[i].checked){
					var rowPKs =  objBSelectCheckbox[i].value;
					rowPKs = trim(rowPKs);
					if(rowPKs!=""){
						rowPKs = convert2validXMLValue(rowPKs);
						rowPKs = rowPKs.replace(/AFM_FLAG::QUOTE/g, '\'');
						var tempArray = rowPKs.split("AFM_FLAG::GROUP");
						var clauses = "";
						for(var j=0;j<tempArray.length;j++){
							var tempArray2 = tempArray[j];
							if(tempArray2!=""){
								var name= tempArray2.split("=")[0];
								name = trim(name);
								var value = tempArray2.split("=")[1];
								value = trim(value);
								if(clauses==""){
									clauses = '('+name+'='+value;
								}else{
									clauses = clauses + ' AND '+name+'='+value;
								}
							}
						}
						if(clauses!="")
							clauses = clauses + ") ";
						if(returnedValue=="")
							returnedValue = returnedValue + clauses;
						else
							returnedValue = returnedValue + " OR " + clauses;
					}
				}
			}
		}else{

			if( objBSelectCheckbox.checked){
				var rowPKs =  objBSelectCheckbox.value;
				rowPKs = trim(rowPKs);
				if(rowPKs!=""){
					rowPKs = convert2validXMLValue(rowPKs);
					rowPKs = rowPKs.replace(/AFM_FLAG::QUOTE/g, '\'');
					var tempArray = rowPKs.split("AFM_FLAG::GROUP");
					var clauses = "";
					for(var j=0;j<tempArray.length;j++){
						var tempArray2 = tempArray[j];
						if(tempArray2!=""){
							var name= tempArray2.split("=")[0];
							name = trim(name);
							var value = tempArray2.split("=")[1];
							value = trim(value);
							if(clauses==""){
								clauses = '('+name+'='+value;
							}else{
								clauses = clauses + ' AND '+name+'='+value;
							}
						}
					}
					if(clauses!="")
						clauses = clauses + ") ";
					if(returnedValue=="")
						returnedValue = returnedValue + clauses;
					else
						returnedValue = returnedValue + " OR " + clauses;
				}
			}
		}

	}
	if(returnedValue!=""){
		returnedValue = '<userInputRecordsFlag><restrictions><restriction type="sql" sql="'+returnedValue+'"/></restrictions></userInputRecordsFlag>';
	}
	
	return returnedValue;

}

/**
 * Unified method for parsed restriction string in any of the accepted primary key format
 *
 */
function getParsedRestrictionFromRowPrimaryKeys(rowPKs, fieldName, tableName) {
	var returnedValue = "";
	if (typeof(rowPKs) == "string" && rowPKs.indexOf("AFM_FLAG::QUOTE") >= 0) {
		returnedValue = getClausesFromRowKeys(rowPKs, fieldName, tableName);
	}
	else if (typeof(rowPKs) == "string" && rowPKs.indexOf("<record") >= 0) {
		returnedValue = getClausesFromPrimaryKeys(rowPKs, fieldName, tableName);
	}
	else {
		returnedValue = getClausesFromPrimaryKeyObject(rowPKs, fieldName, tableName);
	}

	if (returnedValue != "") {
		returnedValue = '<userInputRecordsFlag><restrictions><restriction type="parsed">'+returnedValue+'</restriction></restrictions></userInputRecordsFlag>';
	}
	return returnedValue;
}


//one row
//return <clause...></clause><clause...></clause>...
/**
 * Return restriction clauses
 * when PKs are represented by a string delimited by "AFM_FLAG::GROUP"
 * return <clause...></clause><clause...></clause>...
 */
function getClausesFromRowKeys(rowPKs, fieldName, tableName){
	var cluses="";
	rowPKs = trim(rowPKs);
	if(rowPKs!=""){
		rowPKs = convert2validXMLValue(rowPKs);
		rowPKs = rowPKs.replace(/AFM_FLAG::QUOTE/g, '"');
		var tempArray = rowPKs.split("AFM_FLAG::GROUP");
		for(var j=0;j<tempArray.length;j++){
			var tempArray2 = tempArray[j];
			if(tempArray2!=""){
				var name= tempArray2.split("=")[0];
				name = trim(name);
				var table = name.split(".")[0];
				var field = name.split(".")[1];
				if (typeof fieldName != 'undefined' && fieldName!="") {
					field = fieldName;
				}
				if (typeof tableName != 'undefined' && tableName!="") {
					table = tableName;
				}
				var value = tempArray2.split("=")[1];
				value = trim(value);
				value = convert2validXMLValue(value);
				cluses = cluses + '<clause relop="AND" op="=" value='+value+'><field name="'+field+'" table="'+table+'"/></clause>';
			}
		}
	}
	return cluses;
}
//one row
function getParsedRestrictionFromRowKeys(rowPKs, fieldName, tableName)
{
	var returnedValue=getClausesFromRowKeys(rowPKs, fieldName, tableName);
	if(returnedValue!=""){
		returnedValue = '<userInputRecordsFlag><restrictions><restriction type="parsed">'+returnedValue+'</restriction></restrictions></userInputRecordsFlag>';
	}

	return returnedValue;
}

/**
 * Return restriction clauses ( from a miniConsole )
 * when row primary key is represented as a string of form <record> <keys /></record>"
 * return <clause...></clause><clause...></clause>...
 */
function getClausesFromPrimaryKeys(rowPKs, fieldName, tableName){
	var clauses="";
	var delimiter = "AFM_FLAG::GROUP";
	rowPKs = trim(rowPKs);
	if(rowPKs!=""){
		rowPKs = convert2validXMLValue(rowPKs);
		var position = rowPKs.indexOf('keys');
		if (position > 0) {
			rowPKs = rowPKs.substring(position + 4);
		}
		position = rowPKs.indexOf('/&gt;&lt;/record&gt;');
		if (position > 0) {
			rowPKs = rowPKs.substring(0, position);
		}
		while (rowPKs.indexOf('&apos;') > 0) {
			rowPKs = rowPKs.replace('&apos;', '"');
		}

		var tempArray = rowPKs.split(delimiter);
		for(var j=0;j<tempArray.length;j++){
			var tempArray2 = tempArray[j];
			if(tempArray2!=""){
				var name= tempArray2.split("=")[0];
				name = trim(name);
				var table = name.split(".")[0];
				var field = name.split(".")[1];
				if (typeof fieldName != 'undefined' && fieldName!="") {
					field = fieldName;
				}
				if (typeof tableName != 'undefined' && tableName!="") {
					table = tableName;
				}
				var value = tempArray2.split("=")[1];
				value = trim(value);
				value = convert2validXMLValue(value);
				clauses = clauses + '<clause relop="AND" op="=" value='+value+'><field name="'+field+'" table="'+table+'"/></clause>';
			}
		}
	}
	return clauses;
}

/**
 * parse a miniConsole row primary key into a restriction clause
 * when row primary key is represented as a string of form <record> <keys /></record>"
 * return <clause...></clause><clause...></clause>...
 */
function getParsedRestrictionFromPrimaryKeys(rowPKs, fieldName, tableName)
{
	var returnedValue=getClausesFromPrimaryKeys(rowPKs, fieldName, tableName);
	if(returnedValue!=""){
		returnedValue = '<userInputRecordsFlag><restrictions><restriction type="parsed">'+returnedValue+'</restriction></restrictions></userInputRecordsFlag>';
	}

	return returnedValue;
}

/**
 * Return restriction clauses
 * when PKs are represented as an object whose member var name is the table.field name
 */
function getClausesFromPrimaryKeyObject(rowPKs, fieldName, tableName){
	var clauses="";

	// kb# 3015962
	// if the rowPk is an array, then loop through the rowPk and compose the clause for each rowPK record
	if(rowPKs.constructor==Array) {
		for (var name in rowPKs) {	
			clauses = clauses + getClausesFromPrimaryKeyObject(rowPKs[name]	, fieldName, tableName);
		}
	} else {
		// for non-array rowPks
		for (var name in rowPKs) {		
			var value = rowPKs[name];
			name = trim(name);
			var table = name.split(".")[0];
			var field = name.split(".")[1];
			if (typeof fieldName != 'undefined' && fieldName!="") {
				field = fieldName;
			}
			if (typeof tableName != 'undefined' && tableName!="") {
				table = tableName;
			}
			value = trim(value);
			value = convert2validXMLValue(value);
			clauses = clauses + '<clause relop="AND" op="=" value="'+value+'"><field name="'+field+'" table="'+table+'"/></clause>';
		}
	}
	return clauses;
}



/**
 * Construct an AFM.view.Restriction object
 * apllicable for setting a restriction on all the tabs of a Yalta view
 *
 * Yalta forms within each tab will inherit this restriction
 * when the return obj is used in tabFrams.restriction = returnObj
 *
 * Bridging function for pre-Yalta apps to use Yalta forms (or vice versa)
 */
function getRestrictionObjectFromRowKeys(rowPKs) {
	var fieldValues = new Array();
	rowPKs = trim(rowPKs);
	if(rowPKs!=""){
		rowPKs = convert2validXMLValue(rowPKs);
		rowPKs = rowPKs.replace(/AFM_FLAG::QUOTE/g, '');
		var tempArray = rowPKs.split("AFM_FLAG::GROUP");
		for (var j=0, tempArray2; tempArray2 = tempArray[j]; j++){
			if (tempArray2 != "") {
				var name = trim(tempArray2.split("=")[0]);
				var value = trim(tempArray2.split("=")[1]);
				fieldValues[name] = value;
			}
		}
	}
	return new AFM.view.Restriction(fieldValues);
}




function sendSelectedRequest2Server(target, xml, form, rowPKs)
{
	var data = "";
	if(rowPKs == null)
		data=getSQLRestrictionMultiSelection(form);
	else
		data=getParsedRestrictionFromRowKeys(rowPKs);
	if(data!="" && xml!="")
		sendingAfmActionRequestWithClientDataXMLString2Server(target, xml, data);
}


// -------------------------------------------------------------------------------------------------
// Sends afmAction request with client-side data XML to the server.
// Parameters:
// 		action	String containing serialized afmAction.
// 		data		Request XML data or "" if no data is attached.	
// 		target	Request target: "_blank" to open a new window, "" to reuse the current window.
//
function sendAction(action, data, target)
{
	sendingAfmActionRequestWithClientDataXMLString2Server(target, action, data);
}


// -------------------------------------------------------------------------------------------------
// Sends afmAction request with current row PKs restriction to the server.
// Parameters:
// 		action	String containing serialized afmAction.
// 		rowPKs	List of current row primary key values.	
// 		target	Request target: "_blank" to open a new window, "" to reuse the current window.
//
function sendActionWithRestrictionForRow(action, rowPKs, target)
{
	var restriction = getParsedRestrictionFromRowKeys(rowPKs);
	sendAction(action, restriction, target);
}


// -------------------------------------------------------------------------------------------------
// Sends afmAction request with multi-selection PKs restrictions to the server.
// Parameters:
// 		action	String containing serialized afmAction.
// 		formName HTML form name.	
// 		target	Request target: "_blank" to open a new window, "" to reuse the current window.
//
function sendActionWithRestrictionForSelectedRows(action, formName, target)
{
	var restriction = getSQLRestrictionMultiSelection(formName);
	sendAction(action, restriction, target);
}


// -------------------------------------------------------------------------------------------------
// Returns XML string containing a list of <record> elements for selected rows PKs.
// Parameters:
// 		rowPKs	List of current row primary key values.	
//
function getRecordForRow(rowPKs) 
{
	return generateRecordXML(rowPKs);
}


// -------------------------------------------------------------------------------------------------
// Returns XML string containing a list of <record> elements for selected rows PKs.
// Parameters:
// 		formName       HTML form name.	
//
function getRecordsForSelectedRows(formName) {
	var records = "<userInputRecordsFlag><records>";
	
	var objForm = getForm(formName);
	var objBSelectCheckbox = objForm.elements[strBSelectCheckBoxName];
	if(objBSelectCheckbox != null){
		if(objBSelectCheckbox.length != null){
			// array of check box controls 
			for(var i = 0; i < objBSelectCheckbox.length; i++){
				if( objBSelectCheckbox[i].checked ){
					var rowPKs =  objBSelectCheckbox[i].value;
					var record = getRecordForRow(rowPKs);
					records = records + record;
				}
			}
		}else{
			// single check box control
			if( objBSelectCheckbox.checked){
				var rowPKs =  objBSelectCheckbox.value;
				var record = getRecordForRow(rowPKs);
				records = records + record;
			}
		}

	}
	
	records = records + '</records></userInputRecordsFlag>';
	return records;
}


// -------------------------------------------------------------------------------------------------
// Returns XML string containing a list of <record> elements for all rows PKs.
// Parameters:
//      reportId       Report panel ID attribute in AXVW.
//
function getRecordsForAllRows(reportId) {
    var records = "<userInputRecordsFlag><records>";
    
    var table = $(reportId);
    var tbody = table.childNodes[0];
    for (var i = 1; i < tbody.childNodes.length; i++) {
        var tr = tbody.childNodes[i];
        var record = getRecordForRow(tr.id);
        records = records + record;
    }
    
    records = records + '</records></userInputRecordsFlag>';
    return records;
}


/**
 * Returns the number of rows in specified report.
 * @param {reportId}    Report panel ID attribute in AXVW.
 */
function getNumberOfRows(reportId) {
    var table = $(reportId);
    var tbody = table.childNodes[0];
    return tbody.childNodes.length - 1;
}


/**
 * Returns child element of specified report cell.
 * @param {reportId}    Report panel ID attribute in AXVW.
 * @param {row}         O-based data row index (header row is not included).
 * @param {column}      0-based column index.
 */
function getCellContent(reportId, row, column) {
    var table = $(reportId);
    var tbody = table.childNodes[0];
    var tr = tbody.childNodes[row + 1];
    var td = tr.childNodes[column];
    return td.childNodes[0];
}

// -------------------------------------------------------------------------------------------------
// Returns HTML form object by name. If the name is not specified, returns first form.
//
function getForm(formName) 
{
	var actualFormName = formName;
	if (typeof arguments[0] == "undefined"){
		actualFormName = document.forms[1].name;
	}
	return document.forms[actualFormName];
}
