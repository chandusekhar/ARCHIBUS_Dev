var abEhsTrackIncidentsResponseTabsCtrl = View.createController('abEhsTrackIncidentsResponseTabsCtrl', {
	abEhsTrackIncidents_workRestr_edit_afterRefresh: function(){
		enableDisableRestrictionDateEnd('abEhsTrackIncidents_workRestr_edit');
		this.abEhsTrackIncidents_workRestr_edit.enableField("ehs_restrictions.date_actual", false);
		this.clearDefaultFormFieldValue('abEhsTrackIncidents_workRestr_edit','ehs_restrictions.lost_work_days');
	},
	
	/**
	 * Clears Date Related Monitoring field if the user cleared the Related Medical Mon. Code field
	 */
	clearDateActual: function(){
		if(!valueExistsNotEmpty(this.abEhsTrackIncidents_workRestr_edit.getFieldValue("ehs_restrictions.medical_monitoring_id"))){
			this.abEhsTrackIncidents_workRestr_edit.fields.get("ehs_restrictions.date_actual").clear();
		}
	},
	
	/**
	 * Removes value from specified form's field if value matches the default specified in afm_flds
	 */
	clearDefaultFormFieldValue: function(panelName, fieldName){
		var defaultRecord = this.abEhsTrackIncidents_workRestr_ds.getDefaultRecord();		
		var testValue = defaultRecord.getValue(fieldName);
		if(this.abEhsTrackIncidents_workRestr_edit.getFieldValue(fieldName)==testValue){
			this.abEhsTrackIncidents_workRestr_edit.fields.get(fieldName).clear();
		}
	},
	
	/*
	 * Assign training to employee.
	 */
	abEhsAssignEmTraining_assign_onAssignToEmployee: function(){
		if(this.abEhsAssignEmTraining_assign.canSave()){
			var trainings = [];
			var trainingId = this.abEhsAssignEmTraining_assign.getFieldValue("ehs_training_results.training_id");
			trainings.push(trainingId);
			
			var employeeId = this.abEhsAssignEmTraining_assign.getFieldValue("ehs_training_results.em_id");
			var employeeIds = [employeeId];
			var initialDate = this.abEhsAssignEmTraining_assign.getFieldValue("ehs_training_results.date_actual");
			
			var incidentId = this.abEhsAssignEmTraining_assign.getFieldValue("ehs_training_results.incident_id");
			
			var grid_initila_size = this.abEhstrackEmTraining_result.gridRows.getCount();
			
			
			// assign training to employee
			var controller =  this;
			assignTrainingToEmployees(trainings, employeeIds, initialDate, incidentId, function(){
				controller.abEhstrackEmTraining_result.refresh();
				controller.abEhsAssignEmTraining_assign.show(false);
				
				if(controller.abEhstrackEmTraining_result.gridRows.getCount() - grid_initila_size == 1){
					controller.abEhstrackEmTraining_details.refresh(controller.abEhsAssignEmTraining_assign.restriction);
					controller.abEhstrackEmTraining_details.show(true);
				}
			
			});
		}
	}
});


function onDeleteWorkRestriction(){
	var controller = abEhsTrackIncidentsResponseTabsCtrl;
	View.confirm(getMessage('confirmDelete'), function(button){
        if (button == 'yes') {
        	var dataSource = controller.abEhsTrackIncidents_workRestr_edit.getDataSource();
        	var restrictionId = controller.abEhsTrackIncidents_workRestr_edit.getFieldValue("ehs_restrictions.restriction_id");
        	var record = new Ab.data.Record({"ehs_restrictions.restriction_id": restrictionId}, false);
        	try{
        		dataSource.deleteRecord(record);
                controller.abEhsTrackIncidents_workRestr_grid.refresh();
                controller.abEhsTrackIncidents_workRestr_edit.show(false);
        	} catch (e){
        		Workflow.handleError(e);
        	}
        }
    });
}

