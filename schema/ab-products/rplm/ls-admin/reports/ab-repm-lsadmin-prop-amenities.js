var abRplmPfadminPrAmenByPr_ctrl = View.createController('abRplmPfadminPrAmenByPr_ctrl',{
	 /**
	 * show paginated report
	 */
	abRplmPfadminPrAmenByPr_prGrid_onReport: function(){
		
		View.openPaginatedReportDialog('ab-repm-lsadmin-prop-amenities-pgrp.axvw');
	}
});

function hidePanel(panel){
	abRplmPfadminPrAmenByPr_ctrl.view.panels.get(panel).show(false);
}
