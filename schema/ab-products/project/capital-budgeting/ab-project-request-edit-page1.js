var projectRequestPage1Controller = View.createController('projectRequestPage1',{
	
	projectRequestPage1_createProjectForm_afterRefresh: function() {
		if (this.view.taskInfo.activityId == 'AbProjCommissioning') {
			this.projectRequestPage1_createProjectForm.setFieldValue('project.project_type', 'COMMISSIONING');
			this.projectRequestPage1_createProjectForm.enableField('project.project_type', false);
		} else this.projectRequestPage1_createProjectForm.setFieldValue('project.project_type', '');
	},
	
	projectRequestPage1_createProjectForm_onSave: function() {
		var form = this.projectRequestPage1_createProjectForm;
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
					View.getOpenerView().controllers.get('projectRequest').project_id = project_id;
					View.getOpenerView().panels.get('projectRequestTabs').selectTab('projectRequestTabPage2');
				});
			} catch (e) {
			    Workflow.handleError(e);
			}
		} else {
			View.getOpenerView().controllers.get('projectRequest').project_id = project_id;
			View.getOpenerView().panels.get('projectRequestTabs').selectTab('projectRequestTabPage2');
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
			var records = this.projectRequestPage1_projectTypeDs.getRecords(restriction);
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
			var template_record = this.projectRequestPage1_projectDs.getRecord(restriction);
			if (template_record == null || template_record.getValue('project.is_template') != 1) {
				form.addInvalidField('project.template_project_id', '');
				return false;
			}
		}
		return true;
	}
});

function getDateObject(ISODate)
{
	var tempArray = ISODate.split('-');
	return new Date(tempArray[0],tempArray[1]-1,tempArray[2]);
}

function selectProjectTemplate(){
	var restriction = new Ab.view.Restriction();
	restriction.addClause("project.is_template", 1);
	if (View.taskInfo.activityId == 'AbProjCommissioning') {
		restriction.addClause("project.project_type", 'COMMISSIONING%', 'LIKE');
	}
	View.selectValue('projectRequestPage1_createProjectForm', getMessage('titleSelectProjectTemplate'), ['project.template_project_id'],'project',['project.project_id'], 
			['project.project_id', 'project.project_name', 'project.project_type', 'project.summary'], restriction, '', false);
	
}