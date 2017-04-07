/******************************************************************

 ******************************************************************/

var actionCnt = 0;
var cssClassNameForAction = "alterViewTopFrameAction";
var cssClassNameForActiveAction = "AbPMConsoleTab_active";
var frame1sz = "";
var frame2sz = "";
var tgt;

function inital(abSchemaSystemFolder, actcnt, actTab, actTabAction)
{
  actionCnt = actcnt;

	var targetFrameObj = getFrameObject(window, "dashboardcontent");
	if(targetFrameObj != null)
	{
		if (actTabAction == "") { targetFrameObj.location.href = abSchemaSystemFolder+"/html/blank.htm"; }
	  else { targetFrameObj.location.href = actTabAction; }
	}
	targetFrameObj = getFrameObject(window, "viewFrame");
	if(targetFrameObj != null)
	{
		targetFrameObj.location.href = abSchemaSystemFolder+"/html/blank.htm";
	}
	if (document!=null) {
		var at = document.getElementById(actTab);
	  if (at != null) { at.className = cssClassNameForActiveAction; }
  }
}

function collapseFrames() {
	var targetFrameObj = getFrameObject(window, "treeFrameMC").parent.document.getElementById("treeFrameset");
	if(targetFrameObj != null) {
	  if (targetFrameObj.cols == "0,*") { targetFrameObj.cols = frame1sz;}
	  else {frame1sz = targetFrameObj.cols; targetFrameObj.cols = "0,*"; }
	}
	targetFrameObj = getFrameObject(window, "consoleFrameMC").parent.document.body;
	if(targetFrameObj != null) {
	  if (targetFrameObj.rows == "0,*") { targetFrameObj.rows = frame2sz;}
	  else {frame2sz = targetFrameObj.rows; targetFrameObj.rows = "0,*"; }
	}
}

function changeActionFormat(actionID)
{
	for(var i=1; i <= actionCnt; i++)
	{
		document.getElementById("id"+i).className = cssClassNameForAction;
	}
	var objAction = document.getElementById(actionID);
	objAction.className = cssClassNameForActiveAction;
}

function changeButtonFormat(e)
{
	if (tgt) tgt.className = tgt.name;
	tgt = e;
	tgt.className="AbPMConsoleBtn_active";
}

function loadTabMenuReport(reportName)
{	
	var pkey = "";	
	var objConsoleFrame = getFrameObject(window, "consoleFrameMC");
	if (objConsoleFrame != null) {
		pkey = objConsoleFrame.mc_project_id;
	}
	var objTargetFrame = getFrameObject(window, "viewFrame");
	if(objTargetFrame!=null)
	{
			pkey = escape(pkey);
			pkey = pkey.replace(/\+/g, '%2B');
		if (reportName.indexOf('*')==-1) {
		  objTargetFrame.location.href=reportName+"?handler=com.archibus.config.Find&project.project_id="+pkey;
		} else alert(reportName);
	}
}

