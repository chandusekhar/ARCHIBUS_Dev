var abEqEqByCsiEqTabCtrl = View.createController('abEqEqByCsiEqTabCtrl', {
	/**
	 * generate paginated report for user selection
	 */
	abEqEqByCsiEqTab_grid_onPaginatedReport: function (){
		var restriction = this.abEqEqByCsiEqTab_grid.restriction;
		
		var restrictions = {
			'abEqEqByCsiEqTab_ds_parent': restriction,
			'abEqEqByCsiEqTab_ds_data_costs': restriction,
			'abEqEqByCsiEqTab_ds_data_location': restriction
		};

		var openerController = View.getOpenerView().controllers.get('abEqEqByCsiCtrl');
		var printableRestriction = [];
		if (openerController.abEqEqByCsiGeoCtrl){
			printableRestriction = openerController.abEqEqByCsiGeoCtrl.printableRestriction;
		} else if(openerController.abEqEqByCsiOrgCtrl){
			printableRestriction = openerController.abEqEqByCsiOrgCtrl.printableRestriction;
		} else if(openerController.abEqEqByCsiCsiCtrl){
			printableRestriction = openerController.abEqEqByCsiCsiCtrl.printableRestriction;
		}
		
		var parameters = null;
		if(printableRestriction.length > 0){
			parameters = {
				'printRestriction': true,
				'printableRestriction': printableRestriction
			};
		}
				
		View.openPaginatedReportDialog('ab-eq-eq-by-csi-eq-tab-pgrp.axvw', restrictions, parameters);
	}
});
