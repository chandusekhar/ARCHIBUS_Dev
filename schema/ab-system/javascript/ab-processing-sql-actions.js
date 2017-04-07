/*********************************************************************
 JavaScript File: ab-processing-sql-actions.js

 Yong Shao
 12/11/2003

 *********************************************************************/
//client-side afmActions
var arrStrXMLSQLCommands = new Array();
var iCounterForSQLCommands = 0;
function abProcessingSQLActionToServer(formName, strSerialized, target)
{
	var arrFieldsAndValues = new Array();
	var bValid = true;
	var objForm	= document.forms[formName];
	if(objForm != null)
	{
		for(var i=0; i<objForm.elements.length; i++)
		{
			var element_type = objForm.elements[i].type;
			element_type = element_type.toUpperCase();
			//filtering out "Button" and "Hidden" inputs
			if(element_type != "BUTTON" && element_type != "HIDDEN"  && element_type != "RESET")
			{
				var fieldValue = objForm.elements[i].value;
				var fieldName = objForm.elements[i].name;
				bValid = validationInputs(formName, fieldName);
				if(bValid)
				{
					var pKey  = arrFieldsInformation[fieldName]["primaryKey"];
					if(pKey=='true')
					{
						var typeUpperCase = arrFieldsInformation[fieldName]["type"];
						typeUpperCase = typeUpperCase.toUpperCase();
						var formatUpperCase = arrFieldsInformation[fieldName]["format"];
						formatUpperCase = formatUpperCase.toUpperCase();
						//removing money sign and grouping separator and changing date into ISO format
						fieldValue = convertFieldValueIntoValidFormat(typeUpperCase, formatUpperCase, fieldValue);
						//trim fieldValue
						fieldValue = trim(fieldValue);
						//changing some special characters into valid
						//characters in xml, 
						if(typeUpperCase != "JAVA.SQL.TIME")
							fieldValue = convert2validXMLValue(fieldValue);
						//record data
						arrFieldsAndValues[fieldName]= fieldValue;
					}
				}
			}
		}
		//if(arrFieldsAndValues.length != 0)
		{
			//adding update field and its value to arrFieldsAndValues
			
			var strXMLSQLTransaction = "";
			var sqlStatementForRestriction = "";
			for(var field in arrFieldsAndValues)
			{
				
				sqlStatementForRestriction = sqlStatementForRestriction + field + "='"+arrFieldsAndValues[field]+"' ";
			}
			var strWhereClause = abGeneratingSQLCommandWhereClause(sqlStatementForRestriction, "wr", "Test");
			arrFieldsAndValues = new Array();
			arrFieldsAndValues['wr.description']='?????????Test Form Update SQL Action !!!';
			var strXMLSQLCommand = abGeneratingSQLCommand(1, arrFieldsAndValues, strWhereClause);
			addingSingleSQLCommand2Array(strXMLSQLCommand);
			strXMLSQLTransaction = abGeneratingSQLTransaction(arrStrXMLSQLCommands);
			//test???????????????
			strXMLSQLTransaction = '<transaction><command type="insert"><record  rm_reserve.ac_id="" rm_reserve.area_desired="0" rm_reserve.bl_id="HQ" rm_reserve.comments="??????????????????" rm_reserve.contact="CARLO, CHRIS" rm_reserve.dp_id="" rm_reserve.dv_id="" rm_reserve.date_end="1998-11-18" rm_reserve.time_end="14:00:00" rm_reserve.event="Departmental meeting" rm_reserve.fl_id="17" rm_reserve.group_size="10" rm_reserve.option1="XXXXXXXXXXX?????" rm_reserve.rm_id="127" rm_reserve.date_start="1998-11-18" rm_reserve.time_start="12:00:00" rm_reserve.status="Req"/></command></transaction>';
			abSendSQLActionToServer(strSerialized, target , strXMLSQLTransaction, true);
		}
	}
}

function abSendSQLActionToServer(strSerialized, target , strXMLSQLTransaction, bRefresh){
	
	if(strXMLSQLTransaction != "")
	{
		var strXML  = "";
		var strSerializedInsertingSQLCommandsFirstPart = "";
		var strSerializedInsertingSQLCommandsRestPart = "";
		var strStartTag = "<%2FafmAction>";
		var numPos = strSerialized.indexOf(strStartTag);
		
		if(numPos > 0)
		{
			strSerializedInsertingSQLCommandsFirstPart = strSerialized.substring(0, numPos);
			strSerializedInsertingSQLCommandsRestPart = strSerialized.substring(numPos);
		}
		strXML = strSerializedInsertingSQLCommandsFirstPart + strXMLSQLTransaction + strSerializedInsertingSQLCommandsRestPart;
		//sending data to server through a hidden form
		sendingDataFromHiddenForm('',strXML, target, '',false,"");
		//reloading
		//if(bRefresh)
			//window.location.reload();
	}
}

function abGeneratingSQLCommand(type, arrFieldsAndValues, whereClause)
{
	var strXMLSQLCommand = '';
	//if(arrFieldsAndValues.length != 0)
	{
		strXMLSQLCommand = '<command ';
		if(type==0)
			strXMLSQLCommand = strXMLSQLCommand + 'type="insert">';
		if(type==1)
			strXMLSQLCommand = strXMLSQLCommand + 'type="update">';
		if(type==2)
			strXMLSQLCommand = strXMLSQLCommand + 'type="delete">';

		var strXMLSQLRecord = '<record';

		for(var field in arrFieldsAndValues)
		{
			strXMLSQLRecord = strXMLSQLRecord + ' ' + field + '="' + arrFieldsAndValues[field] + '"' + ' ';
		}
		strXMLSQLRecord = strXMLSQLRecord + '/>'
		strXMLSQLRecord = strXMLSQLRecord +	whereClause;
		strXMLSQLCommand = strXMLSQLCommand + strXMLSQLRecord + '</command>'
	}

	return  strXMLSQLCommand;
}

function abGeneratingSQLTransaction(arrStrXMLSQLCommands)
{
	var strXMLSQLTransaction = '';
	if(arrStrXMLSQLCommands.length != 0)
	{
		strXMLSQLTransaction = strXMLSQLTransaction + '<transaction>';
		strXMLSQLCommands = "";
		for(var i=0; i < arrStrXMLSQLCommands.length; i++)
			strXMLSQLCommands = strXMLSQLCommands + arrStrXMLSQLCommands[i];

		strXMLSQLTransaction = strXMLSQLTransaction + strXMLSQLCommands + '</transaction>';
	}
	return strXMLSQLTransaction;
}

function abGeneratingSQLCommandWhereClause(sqlStatementForRestriction, table, titleForRestriction)
{
	var strWhereClause = "";
	if(sqlStatementForRestriction != "")
	{
		strWhereClause = strWhereClause + '<restriction type="sql" sql="'+sqlStatementForRestriction+'">';
		strWhereClause = strWhereClause + '<title translatable="true">' + titleForRestriction + '</title>';
		strWhereClause = strWhereClause + '<field table="'+table+'"/>';
		strWhereClause = strWhereClause + '</restriction>';
	}
	return strWhereClause;
}

function addingSingleSQLCommand2Array(strXMLSQLCommand)
{
	arrStrXMLSQLCommands[iCounterForSQLCommands++] = strXMLSQLCommand;
}