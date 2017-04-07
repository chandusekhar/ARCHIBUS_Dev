/**
 * Export to DOCX.
 * @param context command context
 */
function onExportDOCX(context){
	var command = context.command;
	var parentPanel = command.getParentPanel();
	
	var parameters = {
	        'printRestriction': true
	    };
	var restriction = null;
	if (parentPanel.type != 'tree') {
		var vnRestriction = new Ab.view.Restriction();
		var vnId = parentPanel.getFieldValue("vn.vn_id");
		vnRestriction.addClause("vn.vn_id", vnId, "=");
		restriction = {"abEhsTrainingByVnPgrpVendor_ds": vnRestriction};
	}
	
	View.openPaginatedReportDialog("ab-ehs-rpt-training-by-vendor-pgrp.axvw", restriction, parameters);
}