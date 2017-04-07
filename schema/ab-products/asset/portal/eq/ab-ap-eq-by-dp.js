/**
 * generate paginated report for user selection
 */
function abApEqByDp_paginatedReport(button){
	var restriction = button.restriction;
	var restrictions = null;
	
	restrictions = {
		'ds_abApEqByDpPgrp': restriction,
		'ds_abApEqByDpPgrp_details': restriction
	};
			
	View.openPaginatedReportDialog('ab-ap-eq-by-dp-pgrp.axvw', restrictions);
}

