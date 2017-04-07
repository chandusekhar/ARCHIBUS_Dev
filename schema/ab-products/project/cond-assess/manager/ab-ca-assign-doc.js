var caAssignDocController = View.createController('caAssignDoc',{
	
	afterInitialDataFetch: function() {
		this.caAssignDoc_form.enableField('activity_log.action_title', false);
		this.caAssignDoc_form.enableField('activity_log.wbs_id', false);
	},
	
	caAssignDoc_form_onAssign: function() {
		var ds = this.caAssignDoc_ds0;
		
		var docActionId = this.caAssignDoc_form.getFieldValue('activity_log.activity_log_id');
		if (!docActionId) {
			View.showMessage(getMessage('noDocumentSelected'));
			return;
		}
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.activity_log_id', docActionId);
		var srcDocRecord = ds.getRecord(restriction);
		if (!srcDocRecord || !srcDocRecord.getValue('activity_log.doc')) {
			View.showMessage(getMessage('actionDoesNotContainDoc'));
			return;
		}
		
		var selectedIds = this.view.parameters.selectedIds;
		var activityId = this.view.taskInfo.activityId;
		
		try {
			var controller = this;
			var msg_assign_ok = getMessage('msg_assign_ok');
			var msg_assign_abort = getMessage('msg_assign_abort');

			var jobId = Workflow.startJob('AbCapitalPlanningCA-ConditionAssessmentService-assignDocumentation',
					selectedIds,
					docActionId,
					activityId);
		    View.openJobProgressBar(getMessage('assignMessage'), jobId, '', function(status) {
				var msg = (status.jobCurrentNumber == 0) ? msg_assign_abort : msg_assign_ok;
				controller.showInformationInForm(controller, controller.caAssignDoc_form, msg);	
				var openerController = View.getOpenerView().controllers.get('mngCondAssessCtrl');
				openerController.caAssignDoc_completeAssign();
				
		    });
		} 
		catch (e) {
			Workflow.handleError(e);
		}
	},
	
	showInformationInForm: function(controller, panel, message){
        var messageCell = panel.getMessageCell();
        messageCell.dom.innerHTML = "";
        
        var messageElement = Ext.DomHelper.append(messageCell, '<p>' + message + '</p>', true);
        messageElement.addClass('formMessage');
        messageElement.setVisible(true, {
            duration: 1
        });
        messageElement.setHeight(40, {
            duration: 1
        });
    },
	
	caAssignDoc_form_onSelectProjectId : function() {
		var restriction = "";
		var title = "";
		if (this.view.taskInfo.activityId == 'AbProjCommissioning') {
			restriction = "project.project_type='COMMISSIONING' AND EXISTS (SELECT 1 FROM activity_log WHERE activity_log.project_id = project.project_id AND activity_log.doc IS NOT NULL and activity_log.activity_type LIKE 'CX%' )";
			title = getMessage('commProjectCode');
		}
		else {
			restriction = "EXISTS (SELECT 1 FROM activity_log WHERE activity_log.project_id = project.project_id AND activity_log.doc IS NOT NULL)";
			title = getMessage('projectCode');
		}
		View.selectValue('caAssignDoc_form', title, ['activity_log.project_id'], 'project', ['project.project_id'], 
			['project.project_id','project.project_name','project.project_type','project.site_id','project.bl_id','project.proj_mgr','project.summary'], 
		    restriction);
	},
	
	caAssignDoc_form_onSelectActivityType : function() {
		var restriction = "";
		if (this.view.taskInfo.activityId == 'AbProjCommissioning') restriction = "activity_type IN ('CX - CONSTRUCTION CHECKLISTS', 'CX - TESTING PROCEDURES')";
		View.selectValue('caAssignDoc_form', getMessage('activityType'), ['activity_log.activity_type'], 'activitytype', ['activitytype.activity_type'], 
			['activitytype.activity_type','activitytype.description'], 
		    restriction);
	},
	
	caAssignDoc_form_onSelectActivityLogId : function() {      
		var restriction = "";
		if (this.view.taskInfo.activityId == 'AbProjCommissioning') restriction = "activity_log.doc IS NOT NULL AND activity_log.status='APPROVED' AND activity_log.activity_type IN ('CX - CONSTRUCTION CHECKLISTS', 'CX - TESTING PROCEDURES')";
		else restriction = "activity_log.doc IS NOT NULL AND activity_log.status='APPROVED'";
		View.selectValue('caAssignDoc_form', '', 
			['activity_log.activity_log_id','activity_log.action_title','activity_log.activity_type','activity_log.project_id','activity_log.work_pkg_id','activity_log.wbs_id','activity_log.doc'], 
			'activity_log', 
			['activity_log.activity_log_id','activity_log.action_title','activity_log.activity_type','activity_log.project_id','activity_log.work_pkg_id','activity_log.wbs_id','activity_log.doc'], 
			['activity_log.activity_log_id','activity_log.action_title','activity_log.activity_type','activity_log.project_id','activity_log.work_pkg_id','activity_log.wbs_id','activity_log.doc'], 
		    restriction);
	}
});
