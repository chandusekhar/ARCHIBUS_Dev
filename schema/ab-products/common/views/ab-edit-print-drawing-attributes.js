
/**
 * Controller to edit pdf printing attributes.
 */
var printDrawingAttributesController = View.createController('printDrawingAttributesController', {
	
	/**
	 * Show the edit form for active plan types.
	 */
	showEditPlanTypeForm: function() {
		var planTypesGroupGrid = this.editPlantypeGroupsGrid;
	    var row = planTypesGroupGrid.rows[planTypesGroupGrid.selectedRowIndex];
	    var planType = row['plantype_groups.plan_type'];
	    var restriction = new Ab.view.Restriction();
	    restriction.addClause('active_plantypes.plan_type', planType, '=');
	    this.editActivePlanTypesForm.show(true);
	    this.editActivePlanTypesForm.refresh(restriction);
	},
	
	/**
	 * Hide the edit plan type form.
	 */
	editActivePlanTypesForm_onCancelEditActionPlanType: function() {
		this.editActivePlanTypesForm.show(false);
	}
	
	/**
	 * Allow to check in a new document.
	 */
	/*editPlantypeGroupsGrid_onUploadTemplateFile: function() {
		var uploadWindow = View.openDialog('ab-edit-print-drawing-template.axvw', null, true, {
			width : 900,
			height: 300,
			title:  getMessage('uploadTemplateTitle')
		});
	}*/
});