/**
 * generate paginated report with restriction
 */
function generateReport(){
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause('ls.ls_id', View.panels.get('abRepmLsadminAmenitiesByLs_lsDetails').getFieldValue('ls.ls_id'));	
	View.openPaginatedReportDialog('ab-repm-lsadmin-amenities-by-ls-pgrp.axvw' ,{'abRepmLsadminAmenitiesByLsPgrp_lsDs':restriction});	
}
