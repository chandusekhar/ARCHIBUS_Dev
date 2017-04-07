/**
 * View's controller
 */
View.createController('abEhsTrainingRescheduleCtrl', {

	trainingId : null,
	selectedEmployees : null,

	afterInitialDataFetch : function() {
		this.trainingId = View.getOpenerView().trainingIdForReschedule;
		this.abEhsAssignEmTraining_emGrid.addParameter('trainingRes', "ehs_training_results.training_id='" + this.trainingId + "'");
		this.abEhsAssignEmTraining_emGrid.refresh();
	},

	abEhsAssignEmTraining_emGrid_onAssignTraining : function() {
		this.selectedEmployees = this.abEhsAssignEmTraining_emGrid.getSelectedRows();
		if (this.selectedEmployees.length == 0) {
			View.showMessage(getMessage('errNoEmSelected'));
			return;
		}

		this.abEhsAssignEmTraining_assign.showInWindow({
			newRecord : true,
			x : 300,
			y : 300,
			closeButton : false
		});
		this.abEhsAssignEmTraining_assign.clearValidationResult();
	},

	abEhsAssignEmTraining_assign_onAssignTraining : function() {
		var initialDate = this.abEhsAssignEmTraining_assign.getFieldValue("ehs_training_results.date_actual");
		if (initialDate == "") {
			this.abEhsAssignEmTraining_assign.addInvalidField("ehs_training_results.date_actual", "");
			this.abEhsAssignEmTraining_assign.displayValidationResult();
			return;
		}
		var trainings = [];
		trainings.push(this.trainingId);
		var employeeIds = [];
		for ( var i = 0; i < this.selectedEmployees.length; i++) {
			employeeIds.push(this.selectedEmployees[i]['em.em_id']);
		}

		Workflow.callMethod('AbRiskEHS-EHSService-cancelTrainingAssinments', this.trainingId, employeeIds);

		// assign training to employee
		var controller = this;
		assignTrainingToEmployees(trainings, employeeIds, initialDate, "", function() {
			alert(getMessage('rescheduleDone'))
			controller.abEhsAssignEmTraining_emGrid.refresh();
			controller.abEhsAssignEmTraining_assign.closeWindow();
			controller.abEhsAssignEmTraining_assign.clear();
			View.closeThisDialog();
		});
	},

})