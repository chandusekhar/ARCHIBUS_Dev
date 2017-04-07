var abRplmPfadminLsImpByLs_ctrl = View.createController('abRplmPfadminLsImpByLs_ctrl', {
	
	abRplmPfadminLsImpByLs_lsGrid_onReport: function(){
		
		View.openPaginatedReportDialog('ab-repm-lsadmin-lshold-impr-by-ls-pgrp.axvw');
	}
	
});

function refreshPanels(row){
	var selectedLsId = row['ls.ls_id'];
	var restriction = new Ab.view.Restriction();
	restriction.addClause('ls.ls_id',selectedLsId,'=' );
	abRplmPfadminLsImpByLs_ctrl.abRplmPfadminLsImpByLs_lsDetailsRep.refresh(restriction);
	restriction.removeClause('ls.ls_id');
	restriction.addClause('cost_tran_sched.ls_id',selectedLsId,'=');
	abRplmPfadminLsImpByLs_ctrl.abRplmPfadminLsImpByLs_schedCostsRep.refresh(restriction);
	restriction.removeClause('cost_tran_sched.ls_id');
	restriction.addClause('cost_tran.ls_id',selectedLsId,'=');
	abRplmPfadminLsImpByLs_ctrl.abRplmPfadminLsImpByLs_costsRep.refresh(restriction);
}
