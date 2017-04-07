var abEhsTrackEmAssignMedMonCtrl = View.createController('abEhsTrackEmAssignMedMonCtrl', {
	
	/*
	 * On filter event handler.
	 */
	abEhsTrackEmAssignMedMon_panelFilter_onFilter: function(){
		var restriction = this.abEhsTrackEmAssignMedMon_panelFilter.getRecord().toRestriction();
		
		// remove the work category clause
		restriction.removeClause("work_categories_em.work_category_id");

		var workCategoryRestriction = "1=1";
		var workCategoryId = this.abEhsTrackEmAssignMedMon_panelFilter.getFieldValue("work_categories_em.work_category_id");
		if(valueExistsNotEmpty(workCategoryId)){
			workCategoryRestriction = "EXISTS(SELECT 1 FROM work_categories_em WHERE em_id = em.em_id"
				+ " AND work_category_id = '" + workCategoryId + "'"
				+ " AND (date_end >= ${sql.currentDate} OR date_end IS NULL))";
		}
		
		this.abEhsTrackEmAssignMedMon_grid.addParameter("workCategoryRestriction", workCategoryRestriction);
		this.abEhsTrackEmAssignMedMon_grid.refresh(restriction);
		this.abEhsTrackEmAssignMedMon_assign.show(false, true);
	},
	
	abEhsTrackEmAssignMedMon_grid_onAssign: function(){
		var selectedEmIds = getKeysForSelectedRows(this.abEhsTrackEmAssignMedMon_grid, "em.em_id");
		if(selectedEmIds.length == 0){
			View.showMessage(getMessage("errNoEmployeeSelected"));
			return false;
		}
		
		this.abEhsTrackEmAssignMedMon_assign.refresh(null, true);
	},
	
	/*
	 * Assign medical monitoring to employee.
	 */
	abEhsTrackEmAssignMedMon_assign_onAssignToEmployees: function(){
		if(this.abEhsTrackEmAssignMedMon_assign.canSave()){
			var selectedEmIds = getKeysForSelectedRows(this.abEhsTrackEmAssignMedMon_grid, "em.em_id");
			if(selectedEmIds.length == 0){
				View.showMessage(getMessage("errNoEmployeeSelected"));
				return false;
			}
			
			var monitoringId = parseInt(this.abEhsTrackEmAssignMedMon_assign.getFieldValue("ehs_medical_mon_results.medical_monitoring_id"));
			var monitoringIds = [monitoringId];

			var initialDate = this.abEhsTrackEmAssignMedMon_assign.getFieldValue("ehs_medical_mon_results.date_actual");
			
			// assign training to employee
			assignMonitoringToEmployees(monitoringIds, selectedEmIds, initialDate, "");
		}
	}
});
