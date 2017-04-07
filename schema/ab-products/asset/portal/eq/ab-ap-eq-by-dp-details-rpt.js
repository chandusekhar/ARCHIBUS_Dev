/**
 * controller definition
 */
var abApEqByDpDetailsRptController = View.createController('abApEqByDpDetailsRptCtrl',{
	nodeRestriction: null,
	consoleRestriction: null	
});

/**
 * show equipment details report for 
 * selected tree node
 * @param {Object} node
 */
function abApEqByDpDetailsRpt_showEquipments(node){
	var report = View.panels.get('panel_abApEqByDpDetailsRpt');
	var controller = View.controllers.get('abApEqByDpDetailsRptCtrl');
	var clause = null;
	
	controller.nodeRestriction = new Ab.view.Restriction();
	for(var i=0; i < node.restriction.clauses.length; i++) {
		clause = node.restriction.clauses[i];
		controller.nodeRestriction.addClause(clause.name.replace(/..\./, "eq."), clause.value, clause.op);
	}
	
	var restriction = new Ab.view.Restriction();
	if(controller.consoleRestriction)
		restriction.addClauses(controller.consoleRestriction);
	if(controller.nodeRestriction)
		restriction.addClauses(controller.nodeRestriction);
	
	report.refresh(restriction);
}

/**
 * refresh equipment details report for 
 * user selection in the console
 * @param {Object} button
 */
function abApEqByDpDetailsRpt_filterEquipments(button){
	var report = View.panels.get('panel_abApEqByDpDetailsRpt');
	var controller = View.controllers.get('abApEqByDpDetailsRptCtrl');

	if(!report.visible){
		View.showMessage(getMessage("firstSelectADepartment"));
		return;
	}

	controller.consoleRestriction = button.restriction;
	
	var siteParameter = "";
	if(controller.consoleRestriction) {
		var siteClause = controller.consoleRestriction.findClause('bl.site_id');
		if(siteClause != null){
			siteParameter = "eq.bl_id IN (SELECT DISTINCT bl_id FROM bl WHERE site_id='" + siteClause.value + "')";
			controller.consoleRestriction.removeClause('bl.site_id');
		}
	}
	report.addParameter("siteRestriction", siteParameter);
	
	var restriction = new Ab.view.Restriction();
	if(controller.consoleRestriction)
		restriction.addClauses(controller.consoleRestriction);
	if(controller.nodeRestriction)
		restriction.addClauses(controller.nodeRestriction);
	report.refresh(restriction);
}

/**
 * generate paginated report for user selection
 */
function abApEqByDpDetailsRpt_paginatedReport(button){
	var parameters = null;
	var restriction = button.restriction;
	var restrictions = null;
	
	var siteClause = restriction.findClause("bl.site_id");
	if(siteClause != null) {
		parameters = {
			'siteRestriction': "(eq.bl_id IN (SELECT DISTINCT bl_id FROM bl WHERE site_id='" + siteClause.value + "'))"
		};
		restriction.removeClause("bl.site_id");
	}
	
	restrictions = {
		'ds_abApEqByDpPgrp': restriction,
		'ds_abApEqByDpPgrp_details': restriction
	};
			
	View.openPaginatedReportDialog('ab-ap-eq-by-dp-pgrp.axvw', restrictions, parameters);
}

