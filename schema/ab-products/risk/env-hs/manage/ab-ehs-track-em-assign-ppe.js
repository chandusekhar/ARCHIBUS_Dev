var abEhsTrackEmAssignPpeCtrl = View.createController('abEhsTrackEmAssignPpeCtrl', {
	
	/*
	 * On filter event handler.
	 */
	abEhsTrackEmAssignPpe_panelFilter_onFilter: function(){
		var restriction = this.abEhsTrackEmAssignPpe_panelFilter.getRecord().toRestriction();
		
		// remove the work category clause
		restriction.removeClause("work_categories_em.work_category_id");

		var workCategoryRestriction = "1=1";
		var workCategoryId = this.abEhsTrackEmAssignPpe_panelFilter.getFieldValue("work_categories_em.work_category_id");
		if(valueExistsNotEmpty(workCategoryId)){
			workCategoryRestriction = "EXISTS(SELECT 1 FROM work_categories_em WHERE em_id = em.em_id"
				+ " AND work_category_id = '" + workCategoryId + "'"
				+ " AND (date_end >= ${sql.currentDate} OR date_end IS NULL))";
		}
		
		this.abEhsTrackEmAssignPpe_grid.addParameter("workCategoryRestriction", workCategoryRestriction);
		this.abEhsTrackEmAssignPpe_grid.refresh(restriction);
		this.abEhsTrackEmAssignPpe_assign.show(false, true);
	},
	
	abEhsTrackEmAssignPpe_grid_onAssign: function(){
		var selectedEmIds = getKeysForSelectedRows(this.abEhsTrackEmAssignPpe_grid, "em.em_id");
		if(selectedEmIds.length == 0){
			View.showMessage(getMessage("errNoEmployeeSelected"));
			return false;
		}
		
		this.abEhsTrackEmAssignPpe_assign.refresh(null, true);
	},
	
	/*
	 * Assign training to employee.
	 */
	abEhsTrackEmAssignPpe_assign_onAssignToEmployees: function(){
		if(this.abEhsTrackEmAssignPpe_assign.canSave()){
			var selectedEmIds = getKeysForSelectedRows(this.abEhsTrackEmAssignPpe_grid, "em.em_id");
			if(selectedEmIds.length == 0){
				View.showMessage(getMessage("errNoEmployeeSelected"));
				return false;
			}
			
			var ppeId = this.abEhsTrackEmAssignPpe_assign.getFieldValue("ehs_em_ppe_types.ppe_type_id");
			var ppeIds = [ppeId];

			var initialDate = this.abEhsTrackEmAssignPpe_assign.getFieldValue("ehs_em_ppe_types.date_use");
			var buildingId = this.abEhsTrackEmAssignPpe_assign.getFieldValue("ehs_em_ppe_types.bl_id");
			var floorId = this.abEhsTrackEmAssignPpe_assign.getFieldValue("ehs_em_ppe_types.fl_id");
			var roomId = this.abEhsTrackEmAssignPpe_assign.getFieldValue("ehs_em_ppe_types.rm_id");
			
			// assign training to employees
			assignPPEToEmployees(ppeIds, selectedEmIds, initialDate, buildingId, floorId, roomId, "");
		}
	}
});
