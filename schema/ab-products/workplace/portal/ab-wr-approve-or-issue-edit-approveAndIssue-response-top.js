/*********************************************************************
 JavaScript File:ab-wr-approve-or-issue-edit-approveAndIssue-response-top.js

 *********************************************************************/
function preparedOnLoad(strSerialized, wr_id, wo_id)
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

	//render file ab-wr-approve-or-issue-edit-approveAndIssue-response.axvw if transaction is successful
	var strXML = '<afmAction type="render" state="ab-wr-approve-or-issue-edit-approveAndIssue-response.axvw" response="true">';
	//<restrictions>
	strXML = strXML + '<restrictions>';
	strXML = strXML + '<restriction type="sql" sql="wr_id=\''+wr_id+'\'">';
	strXML = strXML + '<title translatable="true">SQL Restriction</title>';
	strXML = strXML + '<field table="wr"/>';
	strXML = strXML + '</restriction>';
	strXML = strXML + '</restrictions>';
	strXML = strXML + '</afmAction>';
	//transaction
	strXML = strXML + '<transaction>';
	//update wr
	strXML = strXML + '<command type="update">';
	strXML = strXML + '<record wr.wo_id="'+wo_id+'"/>';
	strXML = strXML + '<restriction type="sql" sql="wr_id=\''+wr_id+'\'">';
	strXML = strXML + '<title translatable="true">SQL Restriction</title>';
	strXML = strXML + '<field table="wr"/>';
	strXML = strXML + '</restriction>';
	strXML = strXML + '</command>';

	strXML = strXML + '</transaction>'
	//strXML = '<userInputRecordsFlag>' + strXML +'</userInputRecordsFlag>';
	strXML = strSerializedInsertingSQLCommandsFirstPart + strXML + strSerializedInsertingSQLCommandsRestPart;
	//send to server
	sendingDataFromHiddenForm('',strXML, '_self', '',false,'');
}

