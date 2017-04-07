var buildingEditDialogController = View.createController('buildingEditDialogController', {
	
	selectedBlId: null,
	
	hasBeenRefreshed: [0,0,0],
	
	afterInitialDataFetch: function() {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('bl.bl_id', this.selectedBlId, '=');
		this.allocWizBlEdit_blForm.refresh(restriction, false);
		
		this.allocWizBlEditTabs.addEventListener('afterTabChange', this.afterTabChange.createDelegate(this));
	},
	
	afterTabChange: function(tabPanel, selectedTabName) {
		var restriction = null;
		if (selectedTabName == 'allocWizBlEditPage2' && this.hasBeenRefreshed[0]==0) {
			restriction = new Ab.view.Restriction();
			restriction.addClause('rm.bl_id', this.selectedBlId, '=');
			this.allocWizBlEdit_rmEmData.refresh(restriction);
			this.hasBeenRefreshed[0] = 1;
		} else if(selectedTabName == 'allocWizBlEditPage3' && this.hasBeenRefreshed[1]==0) {
			restriction = new Ab.view.Restriction();
			restriction.addClause('ot.bl_id', this.selectedBlId, '=');
			this.allocWizBlEdit_ot.refresh(restriction);
			this.hasBeenRefreshed[1] = 1;
		} else if(selectedTabName == 'allocWizBlEditPage4' && this.hasBeenRefreshed[2]==0) {
			restriction = new Ab.view.Restriction();
			restriction.addClause('su.bl_id', this.selectedBlId, '=');
			this.allocWizBlEdit_suGrid.refresh(restriction);
			this.hasBeenRefreshed[2]==1;
		}
	}
});