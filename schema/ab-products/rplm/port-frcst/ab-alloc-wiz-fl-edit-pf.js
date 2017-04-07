var allocWizFlEditController = View.createController('allocWizFlEdit',{
	afterViewLoad: function() {
		this.allocWizFlEditTabs.showTab('allocWizFlEditPage2', false);
	},
	
	afterInitialDataFetch: function() {		
		if (this.allocWizFlEdit_suGrid.gridRows.length == 0) {
			this.allocWizFlEditTabs.selectTab('allocWizFlEditPage1');
		} else {
			this.allocWizFlEdit_flForm.enableField('fl.area_manual', false);
			this.allocWizFlEditTabs.showTab('allocWizFlEditPage2', true);
			this.allocWizFlEditTabs.selectTab('allocWizFlEditPage2');
		}
		var area_usable = this.allocWizFlEdit_flForm.getFieldValue('fl.area_usable');
		if (area_usable > 0) this.allocWizFlEdit_flForm.showField('fl.area_manual', false);
	}
});

