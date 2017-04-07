// ab-rm-change-dp-edit.js
// Space claim and release actions

function refreshDrawingFrame()
{
	var objMainToolbarFrame = window.top;
	if(objMainToolbarFrame!=null)
	{
		//saving strSQLRestriction into array:
		//objMainToolbarFrame.arrReferredByAnotherFrame1
		//since Show action will refresh console window
		var tempArray = objMainToolbarFrame.arrReferredByAnotherFrame1;
		if(tempArray!=null)
		{
			
			var bRefresh = tempArray["ab_rm_change_dp_rem_edit_refreshDrawingFrame"];
			if(bRefresh!=null && bRefresh)
				reloadFrameWindow("drawingFrame");
		}
	}
	
}
// UpdateSpace()
// Performs claim or release actions
function UpdateSpace(strSerialized, strDv, strDp)
{
	var objMainToolbarFrame = window.top;
	if(objMainToolbarFrame!=null)
	{
		//saving strSQLRestriction into array:
		//objMainToolbarFrame.arrReferredByAnotherFrame1
		//since Show action will refresh console window
		var tempArray = objMainToolbarFrame.arrReferredByAnotherFrame1;
		if(tempArray!=null)
		{
			//don't change
			//"ab_rm_change_dp_rem_edit_refreshDrawingFrame"
			if(tempArray["ab_rm_change_dp_rem_edit_refreshDrawingFrame"]!=null)
				tempArray["ab_rm_change_dp_rem_edit_refreshDrawingFrame"]=true;
		}
	}
	
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

  // Create a parsed restriction to specify the record we are changing
	var strWhereClause = "<restriction type='parsed'>";
	strWhereClause += "<title translatable='true'>restriction</title>";
  strWhereClause += "<clause relop='AND' op='=' value='" + strDpChangeBl + "'><field name='bl_id' table='rm'/></clause>";
  strWhereClause += "<clause relop='AND' op='=' value='" + strDpChangeFl + "'><field name='fl_id' table='rm'/></clause>";
  strWhereClause += "<clause relop='AND' op='=' value='" + strDpChangeRm + "'><field name='rm_id' table='rm'/></clause>";
	strWhereClause += "</restriction>";
	
  // Construct the XML action string
	var strXMLSQLTransaction = '<afmAction type="render" state="ab-rm-change-dp-rem-edit.axvw" response="true">';
	//<restrictions>
	strXMLSQLTransaction = strXMLSQLTransaction + '<restrictions>';
	strXMLSQLTransaction = strXMLSQLTransaction + strWhereClause;
	strXMLSQLTransaction = strXMLSQLTransaction + '</restrictions>';
	strXMLSQLTransaction = strXMLSQLTransaction + '</afmAction>';
	strXMLSQLTransaction = strXMLSQLTransaction + '<userInputRecordsFlag><transaction><command type="update"><record ';
	strXMLSQLTransaction += 'rm.dv_id="' + strDv + '" rm.dp_id ="' + strDp + '"';
	strXMLSQLTransaction += ' />' + strWhereClause + '</command></transaction></userInputRecordsFlag>';
	var strXML = strSerializedInsertingSQLCommandsFirstPart + strXMLSQLTransaction + strSerializedInsertingSQLCommandsRestPart;
	
	//sending data to server through a hidden form
	sendingDataFromHiddenForm('',strXML, '_self', '',false,'');
  
}

// ClaimSpace()
// Action to assign a room to a division and department
function ClaimSpace(strSerialized)
{
	UpdateSpace(strSerialized, strDpChangeDv, strDpChangeDp);
}

// ReleaseSpace()
// Action to remove dv and dp assignment from a room
function ReleaseSpace(strSerialized)
{
	UpdateSpace(strSerialized, '', '');
}
