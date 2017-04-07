/**
 * 
 */
var abEhsRptIncidentsMapLocTabsFlCtrl = View.createController('abEhsRptIncidentsMapLocTabsFlCtrl', {
	// restriction from the tree and the filter console
	consoleRestriction: "1=1",
	blId: "",
	flId: "",
	
	afterInitialDataFetch: function(){
	    // get the view parameters and set them to the controller
		if(View.parameters.consoleRestriction){
			this.consoleRestriction = View.parameters.consoleRestriction;
		}
		
		// set the restriction to the panels
		this.abEhsRptIncidentsMapLocTabsFl_floorsPanel.addParameter("consoleRestriction", this.consoleRestriction);
		this.abEhsRptIncidentsMapLocTabsFl_floorsPanel.refresh();
		this.abEhsRptIncidentsMapLocTabsFl_dsDrawingHighlight.addParameter("consoleRestriction", this.consoleRestriction);
		this.abEhsRptIncidentsMapLocTabsFl_dsDrawingLabel.addParameter("consoleRestriction", this.consoleRestriction);
	},
	
	showSelectedFloor: function(cmdObject) {
		var selectedFloorIndex = cmdObject.getParentPanel().selectedRowIndex;
		var selectedRow = cmdObject.getParentPanel().rows[selectedFloorIndex].row;
		this.blId = selectedRow.getFieldValue("rm.bl_id");
		this.flId = selectedRow.getFieldValue("rm.fl_id");
		var dwgName = selectedRow.getFieldValue("rm.dwgname");
		
		var drawingPanel = this.abEhsRptIncidentsMapLocTabsFl_drawingPanel;
		if(FABridge.abDrawing){
			drawingPanel.clear();
		}
		
		var opts = new DwgOpts();
		
		var dcl = new Ab.drawing.DwgCtrlLoc(this.blId, this.flId, null, dwgName);
		drawingPanel.addDrawing(dcl, opts);
	}
});

function exportIncidentMapDetails(){
	var blId = abEhsRptIncidentsMapLocTabsFlCtrl.blId;
	var flId = abEhsRptIncidentsMapLocTabsFlCtrl.flId;
	if(valueExistsNotEmpty(blId) && valueExistsNotEmpty(flId)){
		var incidentsRestriction = new Ab.view.Restriction();
		incidentsRestriction.addClause("ehs_incidents.bl_id", blId, "=");
		incidentsRestriction.addClause("ehs_incidents.fl_id", flId, "=");
		
		var restriction = {"abEhsRptIncidentsMapLocTabsFlPgrp_dsDrawingHighlight": incidentsRestriction,
						   "abEhsRptIncidentsMapLocTabsFlPgrp_dsDrawingLabel": incidentsRestriction,
						   "abEhsIncidentDetailsDialogPgrp_incidentDs":incidentsRestriction};
		
		var parameters = {
	        'consoleRestriction': abEhsRptIncidentsMapLocTabsFlCtrl.consoleRestriction
	    };
	    
	    View.openPaginatedReportDialog("ab-ehs-rpt-incidents-map-loc-tabs-fl-pgrp.axvw", restriction, parameters);
	}else{
		View.showMessage(getMessage('noBlAndFl'));
	}
}
