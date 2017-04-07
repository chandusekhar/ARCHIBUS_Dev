var projectRequestEditSubmitAddNewController = View.createController('projectRequestEditSubmitAddNew', {
	quest : null,
	
	afterInitialDataFetch : function() {
		var requestor = this.projectRequestEditSubmitAddNewPage1Form.getFieldValue('project.requestor');
		if (requestor == '') {
			this.projectRequestEditSubmitAddNewPage1Form.show(false, true);
			View.showMessage(getMessage('missingUserInfo'));
		}
		if (this.view.taskInfo.activityId == 'AbProjCommissioning') {
			this.projectRequestEditSubmitAddNewPage1Form.setFieldValue('project.project_type', 'COMMISSIONING');
			this.projectRequestEditSubmitAddNewPage1Form.enableField('project.project_type', false);
		} else this.projectRequestEditSubmitAddNewPage1Form.setFieldValue('project.project_type', '');
	},
	
	projectRequestEditSubmitAddNewPage1Form_onSave: function() {
		var form = this.projectRequestEditSubmitAddNewPage1Form;
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
	    var template_project_id = form.getFieldValue('project.template_project_id');
	    var controller = this;
		if (template_project_id != "") {
			try {
				var jobId = Workflow.startJob('AbCommonResources-ProjectService-copyTemplateProject', template_project_id, project_id, true);
				View.openJobProgressBar(getMessage('progressMessage'), jobId, '', function(status) {
					controller.afterCreateProject(project_id);
				});
			} catch (e) {
			    Workflow.handleError(e);
			}
		} else {
			this.afterCreateProject(project_id);
		}
	},
	
	afterCreateProject: function(project_id) {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('project.project_id', project_id);
		this.projectRequestEditSubmitAddNewTabs.selectTab('projectRequestEditSubmitAddNewPage2', restriction);
		var controller = View.getOpenerView().controllers.get('projectRequestEditSubmit');
		controller.projectRequestEditSubmit_summary.refresh();
		var statusRestriction = new Ab.view.Restriction();
		statusRestriction.addClause('project.status', 'Created');
		controller.projectRequestEditSubmit_projects.refresh(statusRestriction);
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
			var records = this.projectRequestEditSubmitAddNew_projectTypeDs.getRecords(restriction);
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
			var template_record = this.projectRequestEditSubmitAddNewDs.getRecord(restriction);
			if (template_record == null || template_record.getValue('project.is_template') != 1) {
				form.addInvalidField('project.template_project_id', '');
				return false;
			}
		}
		return true;
	},
	
    projectRequestEditSubmitAddNewPage2Form_afterRefresh: function() {      
		var q_id = 'Project - ' + this.projectRequestEditSubmitAddNewPage2Form.getFieldValue('project.project_type');	
		this.quest = new Ab.questionnaire.Quest(q_id, 'projectRequestEditSubmitAddNewPage2Form');
    },
    
    projectRequestEditSubmitAddNewPage2Form_beforeSave : function() {
    	this.validateDates(this.projectRequestEditSubmitAddNewPage2Form);
    	return this.quest.beforeSaveQuestionnaire();
    },
    
    projectRequestEditSubmitAddNewPage2Form_onSave : function() {
    	if (!this.projectRequestEditSubmitAddNewPage2Form.save()) return false;
    	var status = this.projectRequestEditSubmitAddNewPage2Form.getFieldValue('project.status');
    	var statusRestriction = new Ab.view.Restriction();
		statusRestriction.addClause('project.status', status);
		var controller = View.getOpenerView().controllers.get('projectRequestEditSubmit');
		controller.projectRequestEditSubmit_summary.refresh();	
		controller.projectRequestEditSubmit_projects.refresh(statusRestriction);
    },
    
    projectRequestEditSubmitAddNewPage2Form_onRequest : function() {
    	if (!this.projectRequestEditSubmitAddNewPage2Form.save()) return false;
    	
    	var projectId = this.projectRequestEditSubmitAddNewPage2Form.getFieldValue('project.project_id');
		var parameters = {};
		parameters.fieldValues = toJSON({'project.project_id': projectId, 'project.status': 'CREATED'});
		var result = Workflow.callMethodWithParameters('AbCapitalBudgeting-CapitalProjectsService-requestProject', parameters);
  		if (result.code == 'executed') {
  	    	var statusRestriction = new Ab.view.Restriction();
  			statusRestriction.addClause('project.status', 'Requested');
			var controller = View.getOpenerView().controllers.get('projectRequestEditSubmit');
			controller.projectRequestEditSubmit_summary.refresh();	
			controller.projectRequestEditSubmit_projects.refresh(statusRestriction);
			View.closeThisDialog();
  		} 
  		else 
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
