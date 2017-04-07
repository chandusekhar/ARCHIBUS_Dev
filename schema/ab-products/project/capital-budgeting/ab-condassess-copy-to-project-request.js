var condassessCopyToProjectRequestController = View.createController('condassessCopyToProjectRequest', {
	quest : null,
	
	afterInitialDataFetch : function() {
		var requestor = this.condassessCopyToProjectRequestPage1Form.getFieldValue('project.requestor');
		if (requestor == '') {
			this.condassessCopyToProjectRequestPage1Form.show(false, true);
			View.showMessage(getMessage('missingUserInfo'));
		}
		if (this.view.taskInfo.activityId == 'AbProjCommissioning') {
			this.condassessCopyToProjectRequestPage1Form.setFieldValue('project.project_type', 'COMMISSIONING');
			this.condassessCopyToProjectRequestPage1Form.enableField('project.project_type', false);
		} else this.condassessCopyToProjectRequestPage1Form.setFieldValue('project.project_type', '');
	},
	
	condassessCopyToProjectRequestPage1Form_onSave: function() {
		var form = this.condassessCopyToProjectRequestPage1Form;
		form.clearValidationResult();
		if (!this.validateFormFields(form)) return false;
		if (!this.validateDates(form)) return false;
	
		/* create project using an auto-generated Project Code to populate the project_id */
		var record = form.getOutboundRecord(); 
		record.removeValue('project.template_project_id');
		var result = Workflow.callMethod('AbCommonResources-ProjectService-createProject', record);
		if (result.code == 'executed') {

		} else {
		   	View.showMessage('error', result.code + " :: " + result.message);
		   	return;
		}
		var newRecord = result.dataSet;
	    var project_id = newRecord.getValue("project.project_id");
		var restriction = new Ab.view.Restriction();
		restriction.addClause('project.project_id', project_id);
	    var template_project_id = form.getFieldValue('project.template_project_id');
	    var controller = this;
		if (template_project_id != "") {
			try {
				var jobId = Workflow.startJob('AbCommonResources-ProjectService-copyTemplateProject', template_project_id, project_id, true);
				View.openJobProgressBar(getMessage('progressMessage'), jobId, '', function(status) {
					controller.condassessCopyToProjectRequestTabs.selectTab('condassessCopyToProjectRequestPage2', restriction);
				});
			} catch (e) {
			    Workflow.handleError(e);
			}
		} else {
			this.condassessCopyToProjectRequestTabs.selectTab('condassessCopyToProjectRequestPage2', restriction);
		}
	},	
	
	validateFormFields: function(form) {
		var valid = true;
		if (!this.checkRequiredValue(form, 'project.date_start')) valid = false;
		if (!this.checkRequiredValue(form, 'project.date_end')) valid = false;
		if (!this.checkRequiredValue(form, 'project.project_type')) valid = false;
		if (!this.validateProjectType(form)) valid = false;
		if (!this.validateTemplateProject(form)) valid = false;
		if (!valid) {
			View.showMessage('message', getMessage('formMissingValues'));
			form.displayValidationResult('');
		}
		return valid;
	},
	
	checkRequiredValue: function(form, field_name){
		if (!form.getFieldValue(field_name)) {
			form.addInvalidField(field_name, '');
			return false;
		}
		return true;
	},
	
	validateDates: function(form) {
		var curDate = new Date();
		var date_start = getDateObject(form.getFieldValue('project.date_start'));//note that getFieldValue returns date in ISO format
		var date_end = getDateObject(form.getFieldValue('project.date_end'));
		if (date_end < date_start) {
			View.showMessage('message', getMessage('formMissingValues'));
			form.addInvalidField('project.date_end', getMessage('endBeforeStart'));
			form.displayValidationResult('');
			return false;
		}
		if ((curDate - date_start)/(1000*60*60*24) >= 1) {
			if (!confirm(getMessage('dateBeforeCurrent'))) return false;		
		}
		return true;
	},
	
	validateProjectType: function(form) {
		var project_type = form.getFieldValue('project.project_type');
		if (project_type) {
			var restriction = new Ab.view.Restriction();
			restriction.addClause('projecttype.project_type', project_type);
			var records = this.condassessCopyToProjectRequest_projectTypeDs.getRecords(restriction);
			if (records.length == 0) {
				form.addInvalidField('project.project_type', '');
				return false;
			}
		}
		return true;
	},
	
	validateTemplateProject: function(form) {
		var template_project_id = form.getFieldValue('project.template_project_id');
		if (template_project_id) {
			var restriction = new Ab.view.Restriction();
			restriction.addClause('project.project_id', template_project_id);
			var template_record = this.condassessCopyToProjectRequestDs.getRecord(restriction);
			if (template_record == null || template_record.getValue('project.is_template') != 1) {
				form.addInvalidField('project.template_project_id', '');
				return false;
			}
		}
		return true;
	},
	
    condassessCopyToProjectRequestPage2Form_afterRefresh: function() {      
		var q_id = 'Project - '.toUpperCase() + this.condassessCopyToProjectRequestPage2Form.getFieldValue('project.project_type');	
		this.quest = new Ab.questionnaire.Quest(q_id, 'condassessCopyToProjectRequestPage2Form');
    },
    
    condassessCopyToProjectRequestPage2Form_beforeSave : function() {
    	this.validateDates(this.condassessCopyToProjectRequestPage2Form);
    	return this.quest.beforeSaveQuestionnaire();
    },
    
    condassessCopyToProjectRequestPage2Form_onRequest : function() {
    	if (!this.condassessCopyToProjectRequestPage2Form.save()) return false;
    	
    	var projectId = this.condassessCopyToProjectRequestPage2Form.getFieldValue('project.project_id');
		var parameters = {};
		parameters.fieldValues = toJSON({'project.project_id': projectId, 'project.status': 'CREATED'});
		var result = Workflow.callMethodWithParameters('AbCapitalBudgeting-CapitalProjectsService-requestProject', parameters);
  		if (result.code == 'executed') {
  			this.copyAssessmentItemsToProject(this.condassessCopyToProjectRequestPage2Form.getRecord());
			View.closeThisDialog();
  		} 
  		else 
  		{
    		alert(result.code + " :: " + result.message);
  		}		
    },    
	
	copyAssessmentItemsToProject : function(record) {
		var condassessCopyToProjectController = View.getOpenerView().getOpenerView().controllers.get('condassessCopyToProject');
		var projectId = record.getValue('project.project_id');
		var projectName = record.getValue('project.project_name');
		condassessCopyToProjectController.projectIdName = projectId;
		if (projectName) condassessCopyToProjectController.projectIdName += "-" + projectName;
		
		var parameters = 
		{
			'project_id' : projectId,
			'copied_from' : condassessCopyToProjectController.condassessProject,
			'activity_log_ids' : condassessCopyToProjectController.strSelectedItems
		};
		var result = Workflow.callMethodWithParameters('AbCapitalBudgeting-CapitalProjectsService-copyActionsToProject',parameters);
		if (result.code == 'executed') {
			var restriction = new Ab.view.Restriction();
			restriction.addClause('project.project_id', projectId);
			var tabs = View.getOpenerView().getOpenerView().panels.get('condassessCopyToProjectTabs');
			tabs.selectTab('condassessCopyToProjectPage3', restriction);	
	    } else   
	    {
	    	alert(result.code + " :: " + result.message);
	  	}
	}
});

function getDateObject(ISODate)
{
	var tempArray = ISODate.split('-');
	return new Date(tempArray[0],tempArray[1]-1,tempArray[2]);
}
