var abCbAssessRequestCtrl = View.createController('abCbAssessRequestCtrl', {
	//page task mode - from where is called
	taskMode: null,

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
			this.abCbAssessServReqList.setInstructions(informationHTML);
			
			// refresh panels
			var restriction = new Ab.view.Restriction();
			restriction.addClause('activity_log.project_id', this.projectId, '=');
			restriction.addClause('activity_log.activity_type', 'SERVICE DESK - MAINTENANCE', '=');
			restriction.addClause('activity_log.assessment_id', this.activityLogId, '=');
			var taskNodeRestr = "";
			if(this.taskMode == "assessor" || this.taskMode == "worker"){
				taskNodeRestr += "(activity_log.supervisor = ${sql.literal(user.employee.id)} ";
				taskNodeRestr += "OR (activity_log.supervisor IS NULL AND NOT activity_log.work_team_id IS NULL AND activity_log.work_team_id IN (SELECT work_team_id FROM cf WHERE email = '${user.email}' AND is_supervisor = 1)))";
			}
			
			this.abCbAssessServReqList.addParameter("taskModeRest", taskNodeRestr);
			this.abCbAssessServReqList.refresh(restriction);
			
		}
	},
	
	abCbAssessServReqList_view_onClick: function(row){
		var pkey = row.getFieldValue("activity_log.activity_log_id");
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause("activity_log.activity_log_id", pkey, "=");
    	View.openDialog('ab-helpdesk-request-view.axvw', restriction, false, {
    		afterInitialDataFetch: function(dialogView){
    			dialogView.panels.get('requestPanel').refresh(restriction);
    		}
    	});
	},
	
	abCbAssessServReqList_onNew: function(){
		this.abCbAssessServReqProbType.refresh({}, true);
		this.abCbAssessServReqProbType.showInWindow({width: 600, height: 400});
	},
	
	openRequestForm: function(probType){
		// we must prepare one restriction
		var record = this.abCbAssessServReq_ds.getRecord(new Ab.view.Restriction({'activity_log.activity_log_id': this.activityLogId}));
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.activity_type', 'SERVICE DESK - MAINTENANCE', "=");	
		restriction.addClause('activity_log.site_id', record.getValue('activity_log.site_id'), "=");	
		restriction.addClause('activity_log.bl_id', record.getValue('activity_log.bl_id'), "=");	
		restriction.addClause('activity_log.fl_id', record.getValue('activity_log.fl_id'), "=");	
		restriction.addClause('activity_log.rm_id', record.getValue('activity_log.rm_id'), "=");
		restriction.addClause('activity_log.assessment_id', this.activityLogId, "=");
		restriction.addClause('activity_log.prob_type', probType, "=");
		restriction.addClause('activity_log.project_id', this.projectId, "=");
		
		try{
			var result = Workflow.callMethod('AbRiskCleanBuilding-CleanBuildingService-getAssessmentHazInfo', this.activityLogId);
			var hazardInfo = result.message;
			restriction.addClause('activity_log.description', hazardInfo, "=");
			controller = this;
			// close current dialog
			this.abCbAssessServReqProbType.closeWindow.defer(500, this.abCbAssessServReqProbType);
			// open service request dialog
			View.openDialog('ab-ondemand-request-create.axvw', restriction, true, {
				callback: function(res){
					controller.abCbAssessServReqList.refresh(controller.abCbAssessServReqList.restriction);
				}
			});
		}catch(e){
    		Workflow.handleError(e);
    		return false;
		}
	},
	
	
	abCbAssessServReqList_onDoc: function(){
		
		var activity_log = this.abCbAssessServReqList.restriction.clauses[2].value;
		var restriction = {'abCbServReqPgRptAssess_ds': " activity_log.activity_log_id = " + activity_log};
		var printableRestriction = [];
		printableRestriction.push({'title':getMessage('itemId'), 'value':activity_log});
		var parameters = {
				 'printRestriction':true, 
				 'printableRestriction': printableRestriction
			};
		
		View.openPaginatedReportDialog('ab-cb-assess-serv-req-pgrpt.axvw', restriction, parameters);
	}
	
})

function onSelectProblemType(ctx){
	var controller = View.controllers.get('abCbAssessRequestCtrl');
	var restriction = ctx.command.restriction;
	clause = restriction.findClause("probtype.prob_type");
	controller.openRequestForm(clause.value);
}
