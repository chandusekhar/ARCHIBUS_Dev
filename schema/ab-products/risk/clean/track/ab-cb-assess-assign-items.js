/**
 * controller definition
 */
var selectAssessorCtrl = View.createController('selectAssessorCtrl',{
	// pkey of selected items
	selKeys:[],
	
	// assign to type
	assignTo: null,
	
	// project problem type
	probType: null,
	
	afterInitialDataFetch: function(){
		if(valueExists(this.view.parameters.selKeys)){
			this.selKeys = this.view.parameters.selKeys;
		}
		if(valueExists(this.view.parameters.assignTo)){
			this.assignTo = this.view.parameters.assignTo;
		}

		if(valueExists(this.view.parameters.probType)){
			this.probType = this.view.parameters.probType;
		}

		if(this.assignTo == "assessor"){
			this.abCbAssessAssessor.show(true, true);
		}else if (this.assignTo == "inspector"){
			this.abCbAssessInspector.show(true, true);
		}
		
		this.grid_AssessedByNew.addParameter('activityId', this.view.taskInfo.activityId);
		this.grid_AssessedByNew.addParameter('yes', getMessage('msg_yes'));
		this.grid_AssessedByNew.addParameter('no', getMessage('msg_no'));
	},
	
	// on pressing Assign button for Assessor
	abCbAssessAssessor_onAssign: function(){
		var assessorId = this.abCbAssessAssessor.getFieldValue("activity_log.assessed_by");
		if(!valueExistsNotEmpty(assessorId)){
			View.showMessage(getMessage("msg_no_assessor"));
			return false;
		}
		
		var record = this.abCbAssessAssessor.getOutboundRecord();
		
		try{
			var result = Workflow.callMethod('AbRiskCleanBuilding-CleanBuildingService-updateItems', this.selKeys, record);
			if(this.view.parameters.callback && typeof(this.view.parameters.callback) == "function"){
				this.view.parameters.callback.call();
			}
			View.closeThisDialog();
		}catch(e){
			Workflow.handleError(e);
			return false;
		}
	},
	
	// on pressing Assign button for Inspector
	abCbAssessInspector_onAssign: function(){
		var inspector = this.abCbAssessInspector.getFieldValue('activity_log.assigned_to');
		var worker = this.abCbAssessInspector.getFieldValue('activity_log.hcm_abate_by');
		
		if(!valueExistsNotEmpty(inspector) && !valueExistsNotEmpty(worker) ){
			View.showMessage(getMessage("msg_no_inspector"));
			return false;
		}
		
		var record = this.abCbAssessInspector.getOutboundRecord();
		
		try{
			var result = Workflow.callMethod('AbRiskCleanBuilding-CleanBuildingService-updateItems', this.selKeys, record);
			if(this.view.parameters.callback && typeof(this.view.parameters.callback) == "function"){
				this.view.parameters.callback.call();
			}
			View.closeThisDialog();
		}catch(e){
			Workflow.handleError(e);
			return false;
		}
	}
});


/**
 * set existing user
 * @param {Object} row
 */
function setAssignExistingUser(row){
	var userName = row['activity_log.assessed_by'];
	selectAssessorCtrl.abCbAssessAssessor.setFieldValue('activity_log.assessed_by', userName);
	selectAssessorCtrl.grid_AssessedByExisting.closeWindow();
}
/**
 * set new user
 * @param {Object} row
 */
function setAssignNewUser(row){
	var userName = row['afm_userprocs.user_name'];
	selectAssessorCtrl.abCbAssessAssessor.setFieldValue('activity_log.assessed_by', userName);
	selectAssessorCtrl.grid_AssessedByNew.closeWindow();
}