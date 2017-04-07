/**
 * @fileoverview Common functions for on demand activity
 */

/**
 * Closes dialog window and selects given tab in opener
 * @param {String} tabName tab to select
 */
function closeWindow(tabName) {
    var tabs = View.getControl('','mainTabs');
	if(tabs != null){
		tabs.selectTab(tabName);
	}
	window.close();   
}

/**
 * Delete database records, selected in given grid, from given table
 * Calls WFR <a href='../javadoc/com/archibus/eventhandler/ondemandwork/WorkRequestHandler.html#deleteItems(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsOnDemandWork-deleteItems</a><br />
 * Reloads current tab<br />
 * @param {String} gridName grid with selected records to delete
 * @param {String} tableName table to delete records from
 */
function deleteItems(gridName, tableName) {
	var grid = View.getControl('',gridName);
	var records = grid.getPrimaryKeysForSelectedRows();
	var result = {};
	try{			
		 result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-deleteItems', records); 
	}catch(e){
	Workflow.handleError(result);
	}
	if (result.code == 'executed') {
		tabs = View.getControl('','mainTabs');
		// refresh tab 
		tabs.selectTab(tabs.getSelectedTabName());		 
	} else {
		Workflow.handleError(result);
	}
}

/**
 * Set status of selected workrequests to completed<br />
 * Calls WFR <a href='../javadoc/com/archibus/eventhandler/ondemandwork/WorkRequestHandler.html#setComplete(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsOnDemandWork-setComplete</a><br />
 * Reloads update tab
 * @param {String} gridName grid to get selected rows from
 * @param {String} tabName name of tabpage to select after execution of the WFR
 */
function setComplete(gridName, tabName){
	var grid = View.getControl('',gridName);
	var records = grid.getPrimaryKeysForSelectedRows();
	if(records.length > 0){
		var result = {};
		try{
			 result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-setComplete',records);
		}catch(e){
			Workflow.handleError(result);
		}
		if (result.code == 'executed'){
			if(tabName != undefined) {
				var rest = new Ab.view.Restriction();
				rest.addClause("wo.wo_id",document.getElementById("wo.wo_id").value);
				View.selectTabPage(tabName,rest);
			} else {
				 grid.refresh();
			}
		} else {
			Workflow.handleError(result);
		}
	}
}

/**
 * Hide documents panel if no documents are attached to this request
 */
function hideEmptyDocumentsPanel(){
	if((document.getElementById("wr.doc1") == null || document.getElementById("wr.doc1").value == "") &&
	(document.getElementById("wr.doc2") == null || document.getElementById("wr.doc2").value == "") &&
	(document.getElementById("wr.doc3") == null || document.getElementById("wr.doc3").value == "") &&
	(document.getElementById("wr.doc4") == null || document.getElementById("wr.doc4").value == "")){
		document.getElementById("panel_documents_head").style.display='none';
		document.getElementById("panel_documents_body").style.display='none';
	}
}