var floorEditDialogController = View.createController('floorEditDialogController',{
	
	selectedBlId: null,
	
	selectedFlId: null,
	
	hasBeenRefreshed: [0,0,0,0],
	
	afterInitialDataFetch: function() {
		this.allocWizFlEditTabs.addEventListener('afterTabChange', this.afterTabChange.createDelegate(this));
		restriction = new Ab.view.Restriction();
		restriction.addClause('fl.bl_id', this.selectedBlId, '=');
		restriction.addClause('fl.fl_id', this.selectedFlId, '=');
		this.allocWizFlEdit_flForm.refresh(restriction, false);
		this.hasBeenRefreshed[0] = 1;
	},
	
	afterTabChange: function(tabPanel, selectedTabName){
		var restriction = null;
		if (selectedTabName == 'allocWizFlEditPage1' && this.hasBeenRefreshed[0]==0) {
			restriction = new Ab.view.Restriction();
			restriction.addClause('fl.bl_id', this.selectedBlId, '=');
			restriction.addClause('fl.fl_id', this.selectedFlId, '=');
			this.allocWizFlEdit_flForm.refresh(restriction);
			this.hasBeenRefreshed[0] = 1;
		} else if(selectedTabName == 'allocWizFlEditPage2' && this.hasBeenRefreshed[1]==0) {
			restriction = new Ab.view.Restriction();
			restriction.addClause('rm.bl_id', this.selectedBlId, '=');
			restriction.addClause('rm.fl_id', this.selectedFlId, '=');
			this.allocWizFlEdit_rmEmData.refresh(restriction);
			this.hasBeenRefreshed[1] = 1;
		} else if(selectedTabName == 'allocWizFlEditPage3' && this.hasBeenRefreshed[2]==0) {
			restriction = new Ab.view.Restriction();
			restriction.addClause('ot.bl_id', this.selectedBlId, '=');
			this.allocWizFlEdit_ot.refresh(restriction);
			this.hasBeenRefreshed[2]==1;
		} else if(selectedTabName == 'allocWizFlEditPage4' && this.hasBeenRefreshed[3]==0) {
			restriction = new Ab.view.Restriction();
			restriction.addClause('su.bl_id', this.selectedBlId, '=');
			restriction.addClause('su.fl_id', this.selectedFlId, '=');
			this.allocWizFlEdit_suGrid.refresh(restriction);
			this.hasBeenRefreshed[3]==1;
		}
	}
});

