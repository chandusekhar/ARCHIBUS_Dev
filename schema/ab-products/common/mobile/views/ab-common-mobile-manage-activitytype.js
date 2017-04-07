var mobileActivitytypeController = View.createController('mobileActivitytypeController', {
	
	handleActivitytypeSelection: function() {
		var selectedRow = this.mobileActivitytype_grid.rows[this.mobileActivitytype_grid.selectedRowIndex];
		var activityType = selectedRow['activitytype.activity_type'];
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activitytype.activity_type', activityType, '=');
		this.mobileActivitytypeForm.refresh(restriction);
	},
	
	mobileActivitytypeForm_onCancelEditActivityttype: function() {
		this.mobileActivitytypeForm.show(false);
	}
});