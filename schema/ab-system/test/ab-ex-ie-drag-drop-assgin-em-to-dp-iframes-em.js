/************************************************
	ab-ex-ie-drag-drop-assgin-em-to-dp-iframes-em.js
	
 ************************************************/
//setting up in ab-ex-ie-drag-drop-assgin-em-to-dp-iframes-em.xsl
var arrUnAssignedEMS = new Array();
var strExecuteTransaction = "";
var em_message="";
var dp_message="";
var dv_message="";
var message_message="";

function onPageLoad()
{
	if(window.parent.document.bRefreshingDPFrame)
	{
		window.parent.frames["department"].location.reload();
		window.parent.document.bRefreshingDPFrame = false;
	}

}

function cancelEvent() {
	window.event.returnValue = false;
}

function drop(parentID) {
	//strSerialized is coming from server
	var strSerializedInsertingSQLCommandsFirstPart = "";
	var strSerializedInsertingSQLCommandsRestPart = "";
	var strStartTag = "&lt;%2FafmAction&gt;";
	var numPos = strExecuteTransaction.indexOf(strStartTag);
	if(numPos > 0)
	{
		strSerializedInsertingSQLCommandsFirstPart = strExecuteTransaction.substring(0, numPos);
		strSerializedInsertingSQLCommandsRestPart = strExecuteTransaction.substring(numPos);
	}
	
	var id = window.event.dataTransfer.getData("text");
	
	//SQL: unassign rm from its DP
	var bPossible = true;
	for(var em in arrUnAssignedEMS)
	{
		if(em==id)
		{
			bPossible = false;
			break;
		}	
	}
	
	if(bPossible)
	{
		var em_id = id;
		var temp_dp_dv = "";
		var strXMLSQLTransaction = "";
		//render ab-ex-ie-drag-drop-assgin-em-to-dp-iframes-em.axvw if transaction is OK.
		strXMLSQLTransaction = strXMLSQLTransaction + '<afmAction type="render" state="ab-ex-ie-drag-drop-assgin-em-to-dp-iframes-em.axvw" response="true"/>';
		strXMLSQLTransaction = strXMLSQLTransaction + '<transaction><command type="update">';
		strXMLSQLTransaction = strXMLSQLTransaction + '<record  em.dp_id="" ';
		strXMLSQLTransaction = strXMLSQLTransaction + 'em.dv_id="" ';
		strXMLSQLTransaction = strXMLSQLTransaction + '/>';
		strXMLSQLTransaction = strXMLSQLTransaction + '<restriction type="parsed">';
		strXMLSQLTransaction = strXMLSQLTransaction + '<clause relop="AND" op="=" value="'+em_id+'"><field table="em" name="em_id"/></clause>';
		strXMLSQLTransaction = strXMLSQLTransaction + '</restriction>';
		strXMLSQLTransaction = strXMLSQLTransaction + '</command></transaction>';
		strXMLSQLTransaction = '<userInputRecordsFlag>' + strXMLSQLTransaction + '</userInputRecordsFlag>';
		strXMLSQLTransaction = strSerializedInsertingSQLCommandsFirstPart + strXMLSQLTransaction + strSerializedInsertingSQLCommandsRestPart;
		//sending data to server through a hidden form
		sendingDataFromHiddenForm('',strXMLSQLTransaction, '_self', '',false,'');
		var messageBox_object = window.parent.document.getElementById("messageBox");
		//
		window.parent.ab_ex_em_open_em_id=em_id;
		for(var dp_dv in window.parent.frames["department"].arrAssginedRMS2DP)
		{
			for(var em in window.parent.frames["department"].arrAssginedRMS2DP[dp_dv])
			{
				if(em==em_id)
				{
					temp_dp_dv = dp_dv;
					break;
				}
			}
		}
		if(temp_dp_dv!="")
			messageBox_object.innerHTML = em_id + " "+message_message+" "+dp_message+": " + (temp_dp_dv.split(";"))[0] + ", "+dv_message+": " + (temp_dp_dv.split(";"))[1] + ".";
		//window.location.reload();
		//window.parent.frames["department"].location.reload();
		window.parent.document.bRefreshingDPFrame = true;
	}
	
}

function handleMouseMove(id) {
	if (window.event.button == 1) {
		var obj = document.getElementById(id);
		obj.dragDrop();
	}
}

function handleDragStart(id) {
	window.event.dataTransfer.setData("text", id);
}

function handleDragEnter() {
	cancelEvent();
}

function handleDragLeave() {
	cancelEvent();
}

