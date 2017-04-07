/******************************************************************
	ab-rm-reserve-cancel-confirm-detail.js.
 ******************************************************************/
function onConfirm(strSerialized, pkValue)
{

	//strSerialized is coming from server
	var strSerializedInsertingSQLCommandsFirstPart = "";
	var strSerializedInsertingSQLCommandsRestPart = "";
	var strStartTag = "<%2FafmAction>";
	var numPos = strSerialized.indexOf(strStartTag);
	if(numPos > 0)
	{
		strSerializedInsertingSQLCommandsFirstPart = strSerialized.substring(0, numPos);
		strSerializedInsertingSQLCommandsRestPart = strSerialized.substring(numPos);
	}
	var strXML  = "";
	var strXMLSQLTransaction = '<afmAction type="render" state="ab-rm-reserve-cancel-confirm-detail.axvw" response="true">';
	//<restrictions>
	strXMLSQLTransaction = strXMLSQLTransaction + '<restrictions>';
	strXMLSQLTransaction = strXMLSQLTransaction + '<restriction type="sql" sql="auto_number='+pkValue+'">';
	strXMLSQLTransaction = strXMLSQLTransaction + '<title translatable="true">SQL Restriction</title>';
	strXMLSQLTransaction = strXMLSQLTransaction + '<field table="rm_reserve"/>';
	strXMLSQLTransaction = strXMLSQLTransaction + '</restriction>';
	strXMLSQLTransaction = strXMLSQLTransaction + '</restrictions>';
	strXMLSQLTransaction = strXMLSQLTransaction + '</afmAction>';

	strXMLSQLTransaction = strXMLSQLTransaction + '<transaction><command type="update">';	
	strXMLSQLTransaction = strXMLSQLTransaction + '<record  rm_reserve.status="Con"/>';
	strXMLSQLTransaction = strXMLSQLTransaction + '<restriction type="sql" sql="auto_number=\''+pkValue+'\'">';
	strXMLSQLTransaction = strXMLSQLTransaction + '<title translatable="true">SQL Restriction</title>';
	strXMLSQLTransaction = strXMLSQLTransaction + '<field table="rm_reserve"/>';
	strXMLSQLTransaction = strXMLSQLTransaction + '</restriction>';
	strXMLSQLTransaction = strXMLSQLTransaction + '</command></transaction>';
	strXMLSQLTransaction = '<userInputRecordsFlag>' + strXMLSQLTransaction + '</userInputRecordsFlag>';
	strXML = strSerializedInsertingSQLCommandsFirstPart + strXMLSQLTransaction + strSerializedInsertingSQLCommandsRestPart;
	//send to server
	sendingDataFromHiddenForm('',strXML, '_self', '',false,'');
}

function onCancel(strSerialized, pkValue)
{
	var bReturned = true;
	var cancel_warning_message = document.getElementById("are_you_sure").innerHTML;  
	//localized string
	var cancel_warning_message_object = document.getElementById("ab_rm_reserve_cancel_confirm_detail_cancel_warning_message");
	if(cancel_warning_message_object!=null)
		cancel_warning_message = cancel_warning_message_object.innerHTML;
	//confirmation
	var bSent = confirm(cancel_warning_message);
	if(bSent)
	{
		//strSerialized is coming from server
		var strSerializedInsertingSQLCommandsFirstPart = "";
		var strSerializedInsertingSQLCommandsRestPart = "";
		var strStartTag = "<%2FafmAction>";
		var numPos = strSerialized.indexOf(strStartTag);
		if(numPos > 0)
		{
			strSerializedInsertingSQLCommandsFirstPart = strSerialized.substring(0, numPos);
			strSerializedInsertingSQLCommandsRestPart = strSerialized.substring(numPos);
		}
		var strXML  = "";
		var strXMLSQLTransaction = '<afmAction type="render" state="ab-rm-reserve-cancel-confirm-detail.axvw" response="true">';
		//<restrictions>
		strXMLSQLTransaction = strXMLSQLTransaction + '<restrictions>';
		strXMLSQLTransaction = strXMLSQLTransaction + '<restriction type="sql" sql="auto_number='+pkValue+'">';
		strXMLSQLTransaction = strXMLSQLTransaction + '<title translatable="true">SQL Restriction</title>';
		strXMLSQLTransaction = strXMLSQLTransaction + '<field table="rm_reserve"/>';
		strXMLSQLTransaction = strXMLSQLTransaction + '</restriction>';
		strXMLSQLTransaction = strXMLSQLTransaction + '</restrictions>';
		strXMLSQLTransaction = strXMLSQLTransaction + '</afmAction>';

		strXMLSQLTransaction = strXMLSQLTransaction + '<transaction><command type="update">';	
		strXMLSQLTransaction = strXMLSQLTransaction + '<record  rm_reserve.status="Can"/>';
		strXMLSQLTransaction = strXMLSQLTransaction + '<restriction type="sql" sql="auto_number=\''+pkValue+'\'">';
		strXMLSQLTransaction = strXMLSQLTransaction + '<title translatable="true">SQL Restriction</title>';
		strXMLSQLTransaction = strXMLSQLTransaction + '<field table="rm_reserve"/>';
		strXMLSQLTransaction = strXMLSQLTransaction + '</restriction>';
		strXMLSQLTransaction = strXMLSQLTransaction + '</command></transaction>';
		strXMLSQLTransaction = '<userInputRecordsFlag>' + strXMLSQLTransaction + '</userInputRecordsFlag>';
		strXML = strSerializedInsertingSQLCommandsFirstPart + strXMLSQLTransaction + strSerializedInsertingSQLCommandsRestPart;
		//send to server
		sendingDataFromHiddenForm('',strXML, '_self', '',false,'');
	}
}

