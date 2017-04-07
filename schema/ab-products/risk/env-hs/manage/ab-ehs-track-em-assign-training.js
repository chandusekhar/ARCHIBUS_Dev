var abEhsTrackEmAssignTrainingCtrl = View.createController('abEhsTrackEmAssignTrainingCtrl', {
	
	/*
	 * On filter event handler.
	 */
	abEhsTrackEmAssignTraining_panelFilter_onFilter: function(){
		var restriction = this.abEhsTrackEmAssignTraining_panelFilter.getRecord().toRestriction();
		
		// remove the work category clause
		restriction.removeClause("work_categories_em.work_category_id");

		var workCategoryRestriction = "1=1";
		var workCategoryId = this.abEhsTrackEmAssignTraining_panelFilter.getFieldValue("work_categories_em.work_category_id");
		if(valueExistsNotEmpty(workCategoryId)){
			workCategoryRestriction = "EXISTS(SELECT 1 FROM work_categories_em WHERE em_id = em.em_id"
				+ " AND work_category_id = '" + workCategoryId + "'"
				+ " AND (date_end >= ${sql.currentDate} OR date_end IS NULL))";
		}
		
		this.abEhsTrackEmAssignTraining_grid.addParameter("workCategoryRestriction", workCategoryRestriction);
		this.abEhsTrackEmAssignTraining_grid.refresh(restriction);
		this.abEhsTrackEmAssignTraining_assign.show(false, true);
	},
	
	abEhsTrackEmAssignTraining_grid_onAssign: function(){
		var selectedEmIds = getKeysForSelectedRows(this.abEhsTrackEmAssignTraining_grid, "em.em_id");
		if(selectedEmIds.length == 0){
			View.showMessage(getMessage("errNoEmployeeSelected"));
			return false;
		}
		
		this.abEhsTrackEmAssignTraining_assign.refresh(null, true);
	},
	
	/*
	 * Assign training to employee.
	 */
	abEhsTrackEmAssignTraining_assign_onAssignToEmployees: function(){
		if(this.abEhsTrackEmAssignTraining_assign.canSave()){
			var selectedEmIds = getKeysForSelectedRows(this.abEhsTrackEmAssignTraining_grid, "em.em_id");
			if(selectedEmIds.length == 0){
				View.showMessage(getMessage("errNoEmployeeSelected"));
				return false;
			}
			
			var trainingId = this.abEhsTrackEmAssignTraining_assign.getFieldValue("ehs_training_results.training_id");
			var trainingIds = [trainingId];

			var initialDate = this.abEhsTrackEmAssignTraining_assign.getFieldValue("ehs_training_results.date_actual");
			
			// assign training to employees
			assignTrainingToEmployees(trainingIds, selectedEmIds, initialDate, "");
		}
	}
});
