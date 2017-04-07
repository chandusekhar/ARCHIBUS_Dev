var eqstdManageController = View.createController('eqstdManageController', {

	detailsPanel_afterRefresh: function() {
		// Refresh the hidden wrcf panel and obtain the cf_id
		
		var eq_std = this.detailsPanel.getFieldValue('eqstd.eq_std');
		//alert (eq_std);
		//Check to see if the equipment standard has any associated equipment
		var eqRecords = UC.Data.getDataRecords('eq', ['eq_id'], "eq_std='" + eq_std + "'");

		//disable the delete action if the standard has equipment
		if (eqRecords.length > 0) {
			var deleteAction = this.detailsPanel.actions.get('delete'); 
			deleteAction.enable(false); 
		}
	},
});

