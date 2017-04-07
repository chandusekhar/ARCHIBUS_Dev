// Function automatically called by axvw when the form loads.
function user_form_onload() {
	// refresh the sub-panel-grids
	var form = AFM.view.View.getControl('', 'detailsPanel');
	//form.refresh("ls_id IN (SELECT ls_id FROM ls WHERE ls_id='10000')");
	var ls_id = form.getFieldValue('ls.ls_id');
	
	
	var restriction = "ls_id IN (SELECT ls_id FROM ls WHERE ls_id=" + literalOrNull(ls_id)+")";

	refreshGridPanel('ls_contactsPanel',restriction);
	refreshGridPanel('ls_commPanel',restriction);
	//refreshGridPanel('roomsPanel',restriction);
	refreshGridPanel('docs_assignedPanel',restriction);
	refreshGridPanel('cost_tran_recurPanel',restriction);
	refreshGridPanel('cost_tran_schedPanel',restriction);
	refreshGridPanel('cost_tranPanel',restriction);
	refreshGridPanel('ls_respPanel',restriction);
	refreshGridPanel('opPanel',restriction);
	refreshGridPanel('ls_amendmentPanel',restriction);
	refreshGridPanel('lshistoryPanel',restriction);
	refreshGridPanel('lslienPanel',restriction);
	refreshGridPanel('lsestoppelPanel',restriction);

	//based on uc-repm-addedit-lease-in-a-property-tab.js area_usable does not need to get updated
	//var total = getAreaTotalFromRoomsPanel();
	//total = total + "";
	//form.setFieldValue("ls.area_usable", total);
	
}

function literalOrNull(val, emptyString) {
	if(val == undefined || val == null)
		return "NULL";
	else if (!emptyString && val == "")
		return "NULL";
	else
		return "'" + val.replace(/'/g, "''") + "'";
}

function refreshGridPanel(panelName,restriction){
	var grid = AFM.view.View.getControl('', panelName);
	grid.refresh(restriction);
	/*
	if(hideIfNoRecords != undefined){
		if(hideIfNoRecords){
			if(grid.getDataRows().length < 1){
				grid.show(false,true);
			}
		}
	}*/
}

function getAreaTotalFromRoomsPanel(){
	var grid = AFM.view.View.getControl('', 'roomsPanel');
	var rows = grid.data.records;
	var totalRoomArea =0;
	
	for (var i = 0; i < rows.length; i++) {
        totalRoomArea  += parseFloat(rows[i]['rm.area']);
	}
	
	return totalRoomArea;
}
