var abEhsAssignEmTrainingCtrl = View.createController('abEhsAssignEmTrainingCtrl', {
	
	trainingId: null,
	selectedEmployees: null,
	
	/*
	 * On filter event handler.
	 */
	abEhsAssignEmTraining_filter_onFilter: function(){
		if(!validateFilter('abEhsAssignEmTraining_filter')){
			return false;
		}
		
		var emRestriction = this.getEmFilterRestriction();
		var trainingRestriction = this.getTrainingFilterRestriction();
		
		this.abEhsAssignEmTraining_em.refresh(emRestriction);
		this.abEhsAssignEmTraining_trainings.refresh(trainingRestriction);
		this.abEhsAssignEmTraining_assign.show(false, true);
		this.abEhsTrainings.show(false, true);
	},
	
	getTrainingFilterRestriction: function(){
		var restriction = new Ab.view.Restriction();
		var trainingTypeId = this.abEhsAssignEmTraining_filter.getFieldValue('ehs_training.training_type_id');
		if(valueExistsNotEmpty(trainingTypeId)){
			restriction.addClause('ehs_training.training_type_id', trainingTypeId, '=');
		}
		var trainingId = this.abEhsAssignEmTraining_filter.getFieldValue('ehs_training.training_id');
		if(valueExistsNotEmpty(trainingId)){
			this.trainingId = trainingId;
			restriction.addClause('ehs_training_results.training_id', trainingId, '=');
		}
		return restriction;
	},
	
	getEmFilterRestriction: function(){
		var filterRestriction = this.abEhsAssignEmTraining_filter.getRecord().toRestriction();
		if(filterRestriction.findClause("ehs_training.training_type_id")){
			filterRestriction.removeClause("ehs_training.training_type_id");
		}
		if(filterRestriction.findClause("ehs_training.training_id")){
			filterRestriction.removeClause("ehs_training.training_id");
		}
		return filterRestriction;
	},
	
	abEhsAssignEmTraining_em_onAssignTraining: function(){
		this.selectedEmployees = this.abEhsAssignEmTraining_em.getSelectedRows();
		if(this.selectedEmployees.length == 0){
			View.showMessage(getMessage('errNoEmSelected'));
			return;
		}
		this.abEhsAssignEmTraining_assign.showInWindow({
		    newRecord: true,
		    x: 300,
		    y: 300,
		    closeButton: false
		});
		this.abEhsAssignEmTraining_assign.clearValidationResult();
	},
	
	abEhsAssignEmTraining_assign_onAssignTraining: function(){
		var initialDate = this.abEhsAssignEmTraining_assign.getFieldValue("ehs_training_results.date_actual");
		if(initialDate == ""){
			this.abEhsAssignEmTraining_assign.addInvalidField("ehs_training_results.date_actual", "");
			this.abEhsAssignEmTraining_assign.displayValidationResult();
		    return;
		}
		var trainings = [];
		trainings.push(this.trainingId);
		var employeeIds = [];
		for (var i=0; i<this.selectedEmployees.length; i++){
			employeeIds.push(this.selectedEmployees[i]['em.em_id']);
		}	
		// assign training to employee
		var controller =  this;
		assignTrainingToEmployees(trainings, employeeIds, initialDate, "", function(){
			controller.abEhsAssignEmTraining_trainings.refresh(controller.abEhsAssignEmTraining_trainings.restriction);
			controller.abEhsAssignEmTraining_assign.closeWindow();
			controller.abEhsAssignEmTraining_assign.clear();
		});
	},
	
	abEhsAssignEmTraining_em_onSeeTrainings: function(){
		this.selectedEmployees = this.abEhsAssignEmTraining_em.getSelectedRows();
		if(this.selectedEmployees.length != 1){
			View.showMessage(getMessage('errNotOneEmSelected'));
			return;
		}
		this.abEhsTrainings.showInWindow({
		    x: 300,
		    y: 300,
		    closeButton: false
		});
		this.abEhsTrainings.refresh(new Ab.view.Restriction({"ehs_training_results.em_id":this.selectedEmployees[0]["em.em_id"]}));
	}
});

/**
 * Open select value for training id console field.
 */
function showSelectValue_trainingId(){
	var console = View.panels.get('abEhsAssignEmTraining_filter');
	var trainingTypeId = console.getFieldValue("ehs_training.training_type_id");
	var trainingId = console.getFieldValue("ehs_training.training_id");
	var restriction = new Ab.view.Restriction();
	if (valueExistsNotEmpty(trainingTypeId)) {
		restriction.addClause("ehs_training.training_type_id", trainingTypeId, "=");
	}
	
//	if (valueExistsNotEmpty(trainingId)) {
//		restriction.addClause("ehs_training.training_id", trainingId, "=");
//	}
	var title = console.fields.get("ehs_training.training_id").fieldDef.title;
	
	View.selectValue(
			'abEhsAssignEmTraining_filter',
			title,
			['ehs_training.training_id'],
			'ehs_training',
			['ehs_training.training_id'],
			['ehs_training.training_id','ehs_training.training_name','ehs_training.training_category_id','ehs_training.needs_refresh','ehs_training.description'],
			restriction, null, true);
}