var eqpmwowrController = View.createController('eqpmwowrController', {

	pmwowr2panels_woGrid_onShowSelected: function() {
		var selectedRecords = this.pmwowr2panels_woGrid.getSelectedRecords();
		this.eqpmwowrReport.woIdList = this.eqpmwowrReport.getIdListFromRecords('wo.wo_id', selectedRecords);
		if (this.eqpmwowrReport.woIdList.length > 0) {
			this.eqpmwowrReport.show(true);
			this.eqpmwowrReport.printReport();
		}
	},


	pmwowr2panels_woGrid_onShowAll: function() {
		this.eqpmwowrReport.woIdList = this.eqpmwowrReport.getIdListFromRecords('wo.wo_id', this.pmwowr2panels_woGrid.getAllRecords());
		this.eqpmwowrReport.show(true);
		this.eqpmwowrReport.printReport();
	}
});