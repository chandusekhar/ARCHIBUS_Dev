function settingValues(project_id, strSerialized, strTarget)
{
	/*
	var strRestriction = "";
	strRestriction = strRestriction +	'<restriction type="parsed"><clause relop="AND" op="LIKE" value="'+project_id+'"><field table="work_pkgs" name="project_id"/></clause></restriction>';
	strRestriction = '<userInputRecordsFlag><restrictions>' + strRestriction + '</restrictions></userInputRecordsFlag>';
	setSerializedInsertingDataVariables(strSerialized);
	strRestriction = strSerializedInsertingDataFirstPart + strRestriction +  strSerializedInsertingDataRestPart;
	*/
	var newTargetWindowSettings = "titlebar=no,toolbar=yes,menubar=no,resizable=yes,scrollbars=yes,status=yes,width=1000,height=650";
	sendingDataFromHiddenForm("",strSerialized,strTarget,"",false,newTargetWindowSettings);
}

