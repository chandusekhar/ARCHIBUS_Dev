/**
 * controller definition
 */
var abApEqPlansController = View.createController('abApEqPlansCtrl',{

	afterViewLoad: function() {

    	// specify a handler for when an onclick event occurs in the Drawing component
    	this.panel_abApEqPlans_drawing.addEventListener('onclick', onClickHandler);
	},

	/**
	 * generate paginated report for user selection
	 */
	panel_abApEqPlans_console_onPaginatedReport: function(){
		var site_id = this.panel_abApEqPlans_console.getFieldValue("bl.site_id");
		var bl_id = this.panel_abApEqPlans_console.getFieldValue("bl.bl_id");
		var parameters = null;
		var consoleRestrictionForEq = "";

		if (valueExistsNotEmpty(site_id)) {
			consoleRestrictionForEq += "(eq.bl_id IN (SELECT DISTINCT bl_id FROM bl WHERE site_id='" + site_id + "'))";
		}
		
		if (valueExistsNotEmpty(bl_id)) {
			consoleRestrictionForEq += (consoleRestrictionForEq != "" ? " AND " : "");
			consoleRestrictionForEq += "eq.bl_id = '" + bl_id + "'";
			
		}
		
		if (consoleRestrictionForEq != "") {
			consoleRestrictionForEq = "(" + consoleRestrictionForEq + ")";
			parameters = {
				'consoleRestrictionForEq': consoleRestrictionForEq
			};
		}
		
		View.openPaginatedReportDialog('ab-comm-eq-plans-pgrp.axvw', null, parameters);
	}
});

/**
 * clicking on floor event
 * @param {Object} node Node selected
 */
function abApEqPlans_showEquipment(node){
	
	var currentNode = View.panels.get('panel_abApEqPlans_blTree').lastNodeClicked;
	
	//get selected building and floor
    var selectedBl = currentNode.parent.data['bl.bl_id'];
    var selectedFl = currentNode.data['bl.state_id'];
	var selectedDwgName = currentNode.data['bl.dwgname'];

	//draw the floor map
    var drawingPanel = View.panels.get('panel_abApEqPlans_drawing');
    var dcl = new Ab.drawing.DwgCtrlLoc(selectedBl, selectedFl, null, selectedDwgName);
    drawingPanel.addDrawing(dcl);
	
	// show equipments list panel
    var restriction = new Ab.view.Restriction();
    restriction.addClause('eq.bl_id', selectedBl);
    restriction.addClause('eq.fl_id', selectedFl);
	View.panels.get('panel_abApEqPlans_eqDetails').refresh(restriction);
}

function onClickHandler(pk, selected){
	if (selected) {

	    var r = new Ab.view.Restriction();
	    r.addClause("eq.eq_id", pk[0], "=", true);
		
		View.openDialog('ab-comm-eq-plans-detail.axvw', r, false, {
                width: 475,
                height: 575
        });

	}
}
