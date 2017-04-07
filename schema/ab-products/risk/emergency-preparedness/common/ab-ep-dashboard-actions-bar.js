/******************************************************************

 ******************************************************************/
var arrActionIDs = new Array();
var cssClassNameForAction = "alterViewTopFrameAction";
var cssClassNameForActiveAction = "alterViewTopFrameAction_active";

function inital(schemaPath)
{
	var targetFrameObj = getFrameObject(window, "dashboardcontent");
	if(targetFrameObj != null)
	{
		targetFrameObj.location.href = schemaPath +"/ab-ep-dashboard-response.axvw";
	}
}

function changeActionFormat(actionID)
{
	for(var i=0; i < arrActionIDs.length; i++)
	{
		document.getElementById(arrActionIDs[i]).className = cssClassNameForAction;
	}
	var objAction = document.getElementById(actionID);
	objAction.className = cssClassNameForActiveAction;
}
