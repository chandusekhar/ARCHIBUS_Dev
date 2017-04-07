
function openDetails(context)
{
	var rowRestriction = this.grid.getPrimaryKeysForRow(this);
	var work_pkg_id = rowRestriction['work_pkg_bids.work_pkg_id'];
	var consoleFrameMC = getFrameObject(window, 'consoleFrameMC');
	var view_project_id = consoleFrameMC.mc_project_id;
	
	view_project_id = view_project_id.replace(/\'/g,"\'\'");	
	work_pkg_id = work_pkg_id.replace(/\'/g,"\'\'");
	var targetFrameName = getFrameObject(parent, 'detailsFrame').name;
	var restriction = "work_pkg_bids.project_id = \'"+view_project_id+"\' AND work_pkg_bids.work_pkg_id = \'"+work_pkg_id+"\'";
	var strXMLSQLTransaction = '<afmAction type="render" state="brg-proj-view-contracts-details-mc.axvw" response="true">';
	strXMLSQLTransaction += '<restrictions><userInputRecordsFlag><restriction type="sql" sql="'+restriction+'">';
	strXMLSQLTransaction += '</restriction></userInputRecordsFlag></restrictions>';
	strXMLSQLTransaction += '</afmAction>';
	sendingDataFromHiddenForm('',strXMLSQLTransaction, targetFrameName, '',false,'');	
}
