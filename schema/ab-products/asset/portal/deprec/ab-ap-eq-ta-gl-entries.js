// general controller
View.createController('eqTaGlEntriesCtrl',{
	eqFilter:{},
	taFilter:{},
	// filter console for equipment
	console_abApEqGLEntriesGd_onFilter : function() {
		var console = View.panels.get('console_abApEqGLEntriesGd');
		var restriction = new Ab.view.Restriction();
		var reportId = console.getFieldValue('eq_dep.report_id');
		if(this.eqFilter['eq_dep.report_id'] != reportId){
			if (valueExistsNotEmpty(reportId)) {
				restriction.addClause('dep_reports.report_id', reportId, '=');
			}
			this.grid_abApEqGLEntriesGd_depRep.refresh(restriction);
			this.crossTable_abApEqGLEntriesGd_summary.show(false)
		}
		if(this.crossTable_abApEqGLEntriesGd_summary.visible){
			// we need to refresh the summary table, report id was not changed
			var restriction = console.getRecord().toRestriction();
			this.crossTable_abApEqGLEntriesGd_summary.refresh(restriction);
		}
		// memorize current restriction
		this.eqFilter = console.getFieldValues();
	},
	// filter console for tagged furniture
	console_abApFtGLEntriesGd_onFilter : function() {
		var console = View.panels.get('console_abApFtGLEntriesGd');
		var restriction = new Ab.view.Restriction();
		var reportId = console.getFieldValue('ta_dep.report_id');
		if(this.taFilter['ta_dep.report_id'] != reportId){
			if (valueExistsNotEmpty(reportId)) {
				restriction.addClause('dep_reports.report_id', reportId, '=');
			}
			this.grid_abApFtGLEntriesGd_depRep.refresh(restriction);
			this.crossTable_abApFtGLEntriesGd_summary.show(false)
		}
		if(this.crossTable_abApFtGLEntriesGd_summary.visible){
			// we need to refresh the summary table, report id was not changed
			var restriction = console.getRecord().toRestriction();
			this.crossTable_abApFtGLEntriesGd_summary.refresh(restriction);
		}
		// memorize current restriction
		this.taFilter = console.getFieldValues();
	}
})

/**
 * click event on reports grid = equipment
 * @param {Object} cmdContext
 */
function showEqSummary(cmdContext){
	var controller = View.controllers.get('eqTaGlEntriesCtrl');
	var console = View.panels.get('console_abApEqGLEntriesGd');
	var summaryTable = View.panels.get('crossTable_abApEqGLEntriesGd_summary');
	
	var restriction = console.getRecord().toRestriction();
	var reportId = cmdContext.restriction['dep_reports.report_id'];
	restriction.addClause('eq_dep.report_id', reportId, '=', true);
	
	summaryTable.refresh(restriction);
	summaryTable.setTitle(getMessage('title_summary') +" : " + reportId);
}

/**
 * click event on summary table - equipment
 * @param {Object} cmdContext
 */
function showEqDetails(cmdContext){
	var pkGrid = cmdContext.command.getParentPanel();
	var pkClause = pkGrid.restriction.findClause('eq_dep.report_id');
	var pkValue = pkClause.value;
	var restriction = cmdContext.restriction;
	restriction.addClause('eq_dep.report_id', pkValue, '=');
	var detailsTitle = getMessage("title_details")+ " : ";
	var propertyType = restriction.findClause("eq.property_type");
	if(propertyType){
		detailsTitle += "  " + propertyType.value + ";";
	}
	var dvDpId = restriction.findClause("eq.dv_dp_id");
	var detailsPanel = View.panels.get('grid_abApEqGLEntriesGd_details');
	if(dvDpId && dvDpId.value != '-'){
		detailsTitle += "  " + dvDpId.value;
	}
	if(dvDpId){
		if (dvDpId.value == '') {
			detailsPanel.addParameter('dvDpId', " eq.dv_id${sql.concat}'-'${sql.concat}eq.dp_id IS NULL");
		}
		else {
			detailsPanel.addParameter('dvDpId', " eq.dv_id${sql.concat}'-'${sql.concat}eq.dp_id = '" + dvDpId.value +"'");
		}
	}else{
		detailsPanel.addParameter('dvDpId', " 1 = 1");
	}
	restriction.removeClause("eq.dv_dp_id")
	
    detailsPanel.refresh(restriction);
    detailsPanel.show(true);
    detailsPanel.showInWindow({
        width: 1200,
        height: 600,
        title: detailsTitle,
        closeButton: true
    });
}

/**
 * click event on reports grid = tagged furniture
 * @param {Object} cmdContext
 */
function showTaSummary(cmdContext){
	var controller = View.controllers.get('eqTaGlEntriesCtrl');
	var console = View.panels.get('console_abApFtGLEntriesGd');
	var summaryTable = View.panels.get('crossTable_abApFtGLEntriesGd_summary');
	
	var restriction = console.getRecord().toRestriction();
	var reportId = cmdContext.restriction['dep_reports.report_id'];
	restriction.addClause('ta_dep.report_id', reportId, '=', true);
	
	summaryTable.refresh(restriction);
	summaryTable.setTitle(getMessage('title_summary') +" : " + reportId);
}

/**
 * click event on summary table - tagged furniture
 * @param {Object} cmdContext
 */
function showTaDetails(cmdContext){
	var pkGrid = cmdContext.command.getParentPanel();
	var pkClause = pkGrid.restriction.findClause('ta_dep.report_id');
	var pkValue = pkClause.value;
	var restriction = cmdContext.restriction;
	restriction.addClause('ta_dep.report_id', pkValue, '=');
	var detailsTitle = getMessage("title_details")+ " : ";
	var propertyType = restriction.findClause("ta.property_type");
	if(propertyType){
		detailsTitle += "  " + propertyType.value + ";";
	}
	var dvDpId = restriction.findClause("ta.dv_dp_id");
	var detailsPanel = View.panels.get('grid_abApFtGLEntriesGd_details');
	if(dvDpId && dvDpId.value != '-'){
		detailsTitle += "  " + dvDpId.value;
	}
	if(dvDpId){
		if (dvDpId.value == '') {
			detailsPanel.addParameter('dvDpId', "ta.dv_id${sql.concat}'-'${sql.concat}ta.dp_id  IS NULL");
		}
		else {
			detailsPanel.addParameter('dvDpId', "ta.dv_id${sql.concat}'-'${sql.concat}ta.dp_id = '" + dvDpId.value +"'");
		}
	}else{
		detailsPanel.addParameter('dvDpId', " 1 = 1");
	}
	restriction.removeClause("ta.dv_dp_id")
    detailsPanel.refresh(restriction);
    detailsPanel.show(true);
    detailsPanel.showInWindow({
        width: 1200,
        height: 600,
        title: detailsTitle,
        closeButton: true
    });
}

