var abCbAssessHistoryCtrl = View.createController('abCbAssessHistoryCtrl', {
	//page task mode - from where is called
	taskMode: null,
	
	taskModeRestr: "",
	
	// selected project id
	projectId: null,
	
	// project prob_type
	projProbType: null,

	// main controller
	mainControllerId: null,
	
	// selected assessment item
	activityLogId: -100,
	
	afterInitialDataFetch: function(){
		// get initial data
		if(valueExists(this.view.parentTab)){
			if (valueExists(this.view.parentTab.taskMode)){
				this.taskMode = this.view.parentTab.taskMode;
			}
			if (valueExists(this.view.parentTab.mainControllerId)){
				this.mainControllerId = this.view.parentTab.mainControllerId;
			}
		}
		if(valueExists(this.mainControllerId)){
			// do some initializations here
			var parentCtrl  = View.getView('parent').controllers.get(this.mainControllerId);
			this.projectId = parentCtrl.projectId;
			this.projProbType = parentCtrl.projProbType;
			this.activityLogId = parentCtrl.activityLogId;
			// show information label
			var informationHTML = "";
			for (prop in parentCtrl.activityLogInfo){
				if (prop != "reset"){
					informationHTML += parentCtrl.activityLogInfo[prop].label + ": " + parentCtrl.activityLogInfo[prop].value +"; ";
				}
			}
			this.abCbAssessHistoryList.setInstructions(informationHTML);
			
			// refresh panels
			var assessmentId = parentCtrl.assessmentRow["activity_log.assessment_id"];
			var restriction = new Ab.view.Restriction();
			//restriction.addClause('activity_log.project_id', this.projectId, '=');
			restriction.addClause('activity_log.activity_type', "ASSESSMENT - HAZMAT", '=');
			restriction.addClause('activity_log.assessment_id', assessmentId, '=');//restriction.addClause('activity_log.assessment_id', this.activityLogId, '=');
			// add task restriction here as parameter
			if(this.taskMode == "assessor" || this.taskMode == "worker"){
				this.taskModeRestr = "( activity_log.assessed_by = ${sql.literal(user.name)}  OR activity_log.assigned_to IN (SELECT person_id FROM cb_accredit_person WHERE cb_accredit_person.em_id = ${sql.literal(user.employee.id)}) ";
				this.taskModeRestr += "OR activity_log.hcm_abate_by IN (SELECT person_id FROM cb_accredit_person WHERE cb_accredit_person.em_id = ${sql.literal(user.employee.id)})) ";
			}
			
			this.abCbAssessHistoryList.addParameter("taskModeRest", this.taskModeRestr);
			this.abCbAssessHistoryList.refresh(restriction);
			this.abCbAssessHistoryForm.show(false, true);
			
		}
	},
	
	abCbAssessHistoryList_onDoc: function(){
		var pRestriction = [];
		var ids = this.abCbAssessHistoryList.restriction.findClause('activity_log.assessment_id');
		if(ids){
			pRestriction.push({'title': getMessage("itemIdLabel"), 'value': ids.value});
		}
		
		var parameters = {
				 'consoleRestriction': getSqlFromClauses(this.abCbAssessHistoryList.restriction.clauses),
				 'printRestriction':true,
				 'taskModeRest': this.taskModeRestr,
				 'printableRestriction': pRestriction
		};
		View.openPaginatedReportDialog('ab-cb-assess-history-pgrpt.axvw', null, parameters);
	},
	
	abCbAssessHistoryForm_onDoc: function(){
		var restriction = null;
		restriction = {'abCbAssessHistoryPgRptItems_ds':this.abCbAssessHistoryForm.restriction};
		
		var parameters = {
				 'printRestriction':true,
				 'taskModeRest': this.taskModeRestr
		};
		View.openPaginatedReportDialog('ab-cb-assess-history-pgrpt.axvw', restriction, parameters);
	}
});

/**
 * Generate a string SQL from the clauses of a Ab.view.Restriction object.
 * 
 * @param restrClauses
 * @returns {String}
 */
function getSqlFromClauses( restrClauses){
	
	var restriction  = " 1=1 ";
	for (var i = 0; i<restrClauses.length; i++){
		restriction += " and " + restrClauses[i].name + " ='" + restrClauses[i].value + "' ";
	}
	return restriction
}