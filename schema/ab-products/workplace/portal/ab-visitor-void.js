/*********************************************************************
 JavaScript File: ab-visitor-void.js

 Emily Zhang
 1/21/2004
 Yong Shao
 3/5/04: clean up
 *********************************************************************/

function voidVisitorPass (strSerialized, strVisitorID )
{
	var strSerializedInsertingSQLCommandsFirstPart = "";
	var strSerializedInsertingSQLCommandsRestPart = "";
	var strStartTag = "<%2FafmAction>";
	var numPos = strSerialized.indexOf(strStartTag);
	if(numPos > 0)
	{
		strSerializedInsertingSQLCommandsFirstPart = strSerialized.substring(0, numPos);
		strSerializedInsertingSQLCommandsRestPart = strSerialized.substring(numPos);
	}
	var strXMLSQLTransaction = '<userInputRecordsFlag><transaction><command type="update"><record ';
	strXMLSQLTransaction += 'visitors.is_authorized="0"/>';
	var strWhereClause = '<restriction type="sql" sql="visitor_id=' + strVisitorID + '"><field table="visitors" /></restriction>';
	strXMLSQLTransaction = strXMLSQLTransaction + strWhereClause + '</command></transaction></userInputRecordsFlag>';
    var strXML = strSerializedInsertingSQLCommandsFirstPart + strXMLSQLTransaction + strSerializedInsertingSQLCommandsRestPart;
    sendingDataFromHiddenForm('', strXML, '_self', '', false, '');
}

