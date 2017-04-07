var previouSelectedNodeImgID		= "";
var strPreviousSelectedIcon			= "ab-icon-task-dflt.gif";
var strLeafBeingSelectectedIcon		= "ab-icon-tree-selected.gif";
var abSchemaSystemGraphicsFolder = "";

function settingValues(dv_dp_id, strSerialized, strTarget)
{
	
var strRestriction = "";
var objFrame = getFrameObject(window, "detailsFrame").name;
	
strRestriction = strRestriction +	'<restriction type="sql" sql="dv_dp_id=\''+dv_dp_id+'\'"></restriction>';	
	strRestriction = '<userInputRecordsFlag><restrictions>' + strRestriction + '</restrictions></userInputRecordsFlag>';
	
	setSerializedInsertingDataVariables(strSerialized);
	
	strRestriction = strSerializedInsertingDataFirstPart + strRestriction +  strSerializedInsertingDataRestPart;
	
	var renderedViewFile = "";
	
		renderedViewFile = "brg-proj-projects-org-impact-by-room-details.axvw";
		
	//strRestriction = insertRenderedAXVWFile2AfmAction(strRestriction, renderedViewFile);
	sendingDataFromHiddenForm("",strRestriction,objFrame,"",false,"");
}

function ChangeItToActiveItem(imgID)
{

	abSchemaSystemGraphicsFolder = abSchemaSystemGraphicsFolder + "/";

	if(previouSelectedNodeImgID != "")
	{
		var previousImgObj = document.getElementById(previouSelectedNodeImgID);
		if(previousImgObj != null)
			previousImgObj.src = abSchemaSystemGraphicsFolder + strPreviousSelectedIcon;;
	}

	var imgObj = document.getElementById(imgID);
	if(imgObj!=null)
	{
		imgObj.src = abSchemaSystemGraphicsFolder + strLeafBeingSelectectedIcon;
	}

	previouSelectedNodeImgID = imgID;
	
}