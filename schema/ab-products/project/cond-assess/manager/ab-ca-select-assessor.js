
/**
 * controller definition
 */
var selectAssessorController = View.createController('selectAssessorCtrl',{
	
	parameters:null,
	
	//get view parameters after view loads
	afterViewLoad: function() {
		this.parameters = View.parameters.parameters;
		
		this.grid_AssessedByNew.addParameter('activityId', this.view.taskInfo.activityId);
		this.grid_AssessedByNew.addParameter('yes', getMessage('msg_yes'));
		this.grid_AssessedByNew.addParameter('no', getMessage('msg_no'));
	},
	
	// on pressing Assign button
	caSelectAssessor_onAssign: function(){
		if(valueExists(this.view.parameters.selectedIds)){
			fieldName = "activity_log.assessed_by";
			fieldValue = this.caSelectAssessor.getRecord().getValue(fieldName);
			var selectedIds = this.view.parameters.selectedIds;
			
			View.openProgressBar(getMessage('updateMessage'));
			try {
				Workflow.callMethod('AbCapitalPlanningCA-ConditionAssessmentService-assignItemsToAssessor',
							selectedIds,
							fieldValue);
				View.closeProgressBar();
				
				if(this.view.parameters.refresh && typeof(this.view.parameters.refresh) == "function"){
					this.view.parameters.refresh.call();
				}
				View.closeThisDialog();
			} 
			catch (e) {
				View.closeProgressBar();
				Workflow.handleError(e);
			}
		}else{
			this.parameters.panel.setFieldValue('activity_log.assessed_by' , this.caSelectAssessor.getFieldValue('activity_log.assessed_by'));
			View.closeThisDialog();
		}
	}
	
});
/**
 * set existing user
 * @param {Object} row
 */
function setExistingUser(row){
	var userName = row['activity_log.assessed_by'];
	selectAssessorController.caSelectAssessor.setFieldValue('activity_log.assessed_by', userName);
	selectAssessorController.grid_AssessedByExisting.closeWindow();
}
/**
 * set new user
 * @param {Object} row
 */
function setNewUser(row){
	var userName = row['afm_userprocs.user_name'];
	selectAssessorController.caSelectAssessor.setFieldValue('activity_log.assessed_by', userName);
	selectAssessorController.grid_AssessedByNew.closeWindow();
}