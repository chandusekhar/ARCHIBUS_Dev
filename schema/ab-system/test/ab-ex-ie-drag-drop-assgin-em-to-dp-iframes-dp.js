/************************************************
	ab-ex-ie-drag-drop-assgin-em-to-dp-iframes-dp.js
	
 ************************************************/
//setting up in ab-ex-ie-drag-drop-assgin-em-to-dp-iframes-dp.xsl
var arrAssginedRMS2DP = new Array();
var strExecuteTransaction = "";
var em_message="";
var dp_message="";
var dv_message="";
var message_message="";

function onPageLoad()
{
	if(window.parent.document.bRefreshingEMFrame)
	{
		window.parent.document.bRefreshingEMFrame = false;
		window.parent.frames["employees"].location.reload();
	}
	
}

function cancelEvent() {
	window.event.returnValue = false;
}

function drop(parentID, node_id) {
	//strSerialized is coming from server
	var strSerializedInsertingSQLCommandsFirstPart = "";
	var strSerializedInsertingSQLCommandsRestPart = "";
	var strStartTag = "&lt;%2FafmAction&gt;";
	//alert(strExecuteTransaction);
	var numPos = strExecuteTransaction.indexOf(strStartTag);
	if(numPos > 0)
	{
		strSerializedInsertingSQLCommandsFirstPart = strExecuteTransaction.substring(0, numPos);
		strSerializedInsertingSQLCommandsRestPart = strExecuteTransaction.substring(numPos);
	}
	
	var id = window.event.dataTransfer.getData("text");
	if(parentID!=null && parentID!="")
	{
		var bPossible = true;
		var bRefreshEMFrame = true;
		var temp_array = arrAssginedRMS2DP[parentID];
		if(temp_array!=null)
		{
			for(var s in temp_array)
			{
				if(s==id)
				{
					bPossible = false;
					break;
				}
			}
		}
		for(var dp in arrAssginedRMS2DP)
		{
			for(var em in arrAssginedRMS2DP[dp])
			{
				if(em==id)
				{
					bRefreshEMFrame = false;
					break;
				}
			}
		}
		if(bPossible)
		{
			//do update DP statement: assign rm to dp
			var dv_id = parentID.split(";")[1];
			var dp_id = parentID.split(";")[0];
			var em_id = id;
			
			var strXMLSQLTransaction = "";
			//render ab-ex-ie-drag-drop-assgin-em-to-dp-iframes-dp.axvw if transaction is OK.
			strXMLSQLTransaction = strXMLSQLTransaction + '<afmAction type="render" state="ab-ex-ie-drag-drop-assgin-em-to-dp-iframes-dp.axvw" response="true"/>';
			strXMLSQLTransaction = strXMLSQLTransaction + '<transaction><command type="update">';
			strXMLSQLTransaction = strXMLSQLTransaction + '<record  em.dp_id="'+dp_id+'" ';
			strXMLSQLTransaction = strXMLSQLTransaction + 'em.dv_id="'+dv_id+'" ';
			strXMLSQLTransaction = strXMLSQLTransaction + '/>';
			strXMLSQLTransaction = strXMLSQLTransaction + '<restriction type="parsed">';
			strXMLSQLTransaction = strXMLSQLTransaction + '<clause relop="AND" op="=" value="'+em_id+'"><field table="em" name="em_id"/></clause>';
			strXMLSQLTransaction = strXMLSQLTransaction + '</restriction>';
			strXMLSQLTransaction = strXMLSQLTransaction + '</command></transaction>';
			strXMLSQLTransaction = '<userInputRecordsFlag>' + strXMLSQLTransaction + '</userInputRecordsFlag>';
			strXMLSQLTransaction = strSerializedInsertingSQLCommandsFirstPart + strXMLSQLTransaction + strSerializedInsertingSQLCommandsRestPart;
			//sending data to server through a hidden form
			sendingDataFromHiddenForm('',strXMLSQLTransaction, '_self', '',false,'');
			//
			var messageBox_object = window.parent.document.getElementById("messageBox");
			messageBox_object.innerHTML =  em_id + " "+message_message+" "+dp_message+": " + dp_id + ", "+dv_message+": " + dv_id + ".";
			//???
			var highlightRecord_obj = window.parent.frames["employees"].document.getElementById(window.parent.ab_ex_em_open_em_id);
			if(highlightRecord_obj!=null)
				highlightRecord_obj.style.background="white";
			//???
			window.parent.ab_ex_em_open_node_id=node_id;
			window.parent.ab_ex_em_open_em_id=em_id;
			//window.location.reload();
			window.parent.document.bRefreshingEMFrame = bRefreshEMFrame;
			 
			/*if(bRefreshEMFrame)
			{
				window.parent.frames["employees"].location.reload();
			}*/
		}
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

