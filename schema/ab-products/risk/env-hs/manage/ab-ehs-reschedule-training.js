var abEhsRescheduleTrainingCtrl = View.createController('abEhsRescheduleTrainingCtrl', {
	// selected training id's
	trainings: [],
	/*
	 * On filter event handler
	 */
	abEhsRescheduleTraining_filter_onFilter: function(){
		if(validateFilter('abEhsRescheduleTraining_filter')){
			var record = this.abEhsRescheduleTraining_filter.getRecord();
			var restriction = record.toRestriction();
			
			restriction.addClause("ehs_training_results.status", "Done", "<>" );
			
			// special treatment for Date type fields: from Date object to String
			var dateActual = this.abEhsRescheduleTraining_filter_ds.formatValue('ehs_training_results.date_actual',
					record.getValue('ehs_training_results.date_actual'), false);
			if(valueExistsNotEmpty(dateActual)){
				restriction.addClause("ehs_training_results.date_actual", dateActual, "=", "AND", true);
			}
			
			this.abEhsRescheduleTraining_details.refresh(restriction);
		}
	},
	
	/*
	 * On Reschedule event listener.
	 */
	abEhsRescheduleTraining_details_onReschedule: function(){
		var selectedRows = this.abEhsRescheduleTraining_details.getSelectedRows();
		if(selectedRows.length == 0){
			View.showMessage(getMessage("errNoSelection"));
			return false;
		}
		if (!this.validateSelection(selectedRows)) {
			return false;
		}
		
		// we must get selected trainings and actual date for each training program
		this.trainings = [];
		var dataSource = this.abEhsRescheduleTraining_results_ds;
		for (var i = 0; i < selectedRows.length; i++) {
			var row = selectedRows[i].row;
			var training = {
					trainingId: dataSource.formatValue("ehs_training_results.training_id", row.getFieldValue("ehs_training_results.training_id"), false),
					employeeId: dataSource.formatValue("ehs_training_results.em_id", row.getFieldValue("ehs_training_results.em_id"), false),
					dateActual: dataSource.formatValue("ehs_training_results.date_actual", row.getFieldValue("ehs_training_results.date_actual"), false)
			}
			this.trainings.push(training);
		}
		var windowConfig = {
	            width: 600, 
	            height: 400,
	            closeButton: true
		}
		this.abEhsRescheduleTraining_schedule.refresh(null, true);
		this.abEhsRescheduleTraining_schedule.showInWindow(windowConfig);
	},
	
	/*
	 * On Save event handler
	 * call reschedule wfr as job.
	 */
	abEhsRescheduleTraining_schedule_onSave: function(){
		var detailsGrid = this.abEhsRescheduleTraining_details;
		var formReschedule = this.abEhsRescheduleTraining_schedule;
		if(this.abEhsRescheduleTraining_schedule.canSave()){
			try{
				var newScheduleDate = this.abEhsRescheduleTraining_schedule.getFieldValue("ehs_training_results.date_actual");
				var jobId = Workflow.startJob('AbRiskEHS-EHSService-rescheduleTrainings', this.trainings, newScheduleDate);
			    View.openJobProgressBar(getMessage("msgRescheduleTrainings"), jobId, '', function(status) {
			    	detailsGrid.refresh(detailsGrid.restriction);
			    	if(formReschedule.isShownInWindow()){
			    		formReschedule.closeWindow();
			    	}else{
			    		formReschedule.show(false, true);
			    	}
			    });
				
			}catch (e) {
				Workflow.handleError(e);
			}
		}
	},
	
	/**
	 * Validate selected rows.
	 * If different training programs were selected for same employee throw an error message.
	 */
	validateSelection: function(rows){
		for (var index = 0; index < rows.length; index++){
			var row = rows[index].row;
			var employeeId = row.getFieldValue("ehs_training_results.em_id");  
			for (var counter = 0; counter < rows.length; counter++) {
				if (counter != index) {
					var crtRow = rows[counter].row;
					var crtEmployeeId = crtRow.getFieldValue("ehs_training_results.em_id");
					if (employeeId == crtEmployeeId) {
						View.showMessage(getMessage("errRescheduleSelection"));
						return false;
					}
				}
			}
		}
		return true;
	}
});


/**
 * Open select value for training id console field.
 */
function showSelectValue_trainingId(){
	var console = View.panels.get('abEhsRescheduleTraining_filter');
	var trainingTypeId = console.getFieldValue("ehs_training.training_type_id");
	var trainingId = console.getFieldValue("ehs_training.training_id");
	var restriction = new Ab.view.Restriction();
	if (valueExistsNotEmpty(trainingTypeId)) {
		restriction.addClause("ehs_training.training_type_id", trainingTypeId, "=");
	}
	
	if (valueExistsNotEmpty(trainingId)) {
		restriction.addClause("ehs_training.training_id", trainingId, "=");
	}
	
	var title = console.fields.get("ehs_training.training_id").fieldDef.title;
	
	View.selectValue(
			'abEhsRescheduleTraining_filter',
			title,
			['ehs_training.training_id'],
			'ehs_training',
			['ehs_training.training_id'],
			['ehs_training.training_id','ehs_training.training_name','ehs_training.training_category_id','ehs_training.needs_refresh','ehs_training.description'],
			restriction);
}