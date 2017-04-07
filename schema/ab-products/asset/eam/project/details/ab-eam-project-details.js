var abEamProjectDetailsCtrl = View.createController('abEamProjectDetailsCtrl', {
	projectIds: null,
	
	itemType: null,
	
	itemId: null,
	
	callbackMethod: null,

	quest : null,

	restriction: null,
	
	isDeleteBtnVisible: true,
	isCloseBtnVisible: true,
	
	afterViewLoad: function(){
		if(valueExists(this.view.parameters)){
			if(valueExists(this.view.parameters.projectIds)){
				this.projectIds = this.view.parameters.projectIds;
			}
			if(valueExists(this.view.parameters.itemType)){
				this.itemType = this.view.parameters.itemType;
			}
			if(valueExists(this.view.parameters.isDeleteBtnVisible)){
				this.isDeleteBtnVisible = this.view.parameters.isDeleteBtnVisible;
			}
			if(valueExists(this.view.parameters.isCloseBtnVisible)){
				this.isCloseBtnVisible = this.view.parameters.isCloseBtnVisible;
			}
			if(valueExists(this.view.parameters.callback)){
				this.callbackMethod = this.view.parameters.callback;
			}
		}
		if(valueExists(this.view.restriction)){
			this.restriction = this.view.restriction;
		}
	},

	projProjectStatusUpdateForm_afterRefresh : function() {			
		var project_type = this.projProjectStatusUpdateForm.getFieldValue('project.project_type');
		var q_id = 'Project - ' + project_type;
		this.quest = new Ab.questionnaire.Quest(q_id, 'projProjectStatusUpdateForm');
		
		for (var i = 0; i < 6; i++) {
			this.projProjectStatusUpdateForm.getFieldElement('project.status').options[i].setAttribute("disabled", "true");
		}
		var status = this.projProjectStatusUpdateForm.getFieldValue('project.status');
		if (status == 'Approved' || status == 'Approved-In Design' || status == 'Approved-Cancelled' || status == 'Issued-In Process' || 
				status == 'Issued-On Hold' || status == 'Issued-Stopped' || status == 'Completed-Pending' || status == 'Completed-Not Ver' ||
				status == 'Completed-Verified' || status == 'Closed') {
			this.projProjectStatusUpdateForm.enableField('project.status', true);
		}
		else this.projProjectStatusUpdateForm.enableField('project.status', false);
		// show hide action
		this.projProjectStatusUpdateForm.actions.get('closeProject').show(this.isCloseBtnVisible);
		this.projProjectStatusUpdateForm.actions.get('delete').show(this.isDeleteBtnVisible);
		
    },
    
    projProjectStatusUpdateForm_beforeSave : function() {
    	if (!this.quest.beforeSaveQuestionnaire()) return false; 
    	return this.validateDateFields();
    },
    
    projProjectStatusUpdateForm_onCloseProject : function() {
    	var date = new Date();
    	var currentDate = FormattingDate(date.getDate(), date.getMonth() + 1, date.getFullYear(), 'YYYY-MM-DD');
    	this.projProjectStatusUpdateForm.setFieldValue('project.status', 'Closed');
    	this.projProjectStatusUpdateForm.setFieldValue('project.date_closed', currentDate);
    	this.projProjectStatusUpdateForm.save();
    	this.selectProjectReport.refresh();
    	this.projProjectStatusUpdateForm.refresh();
    },
    
    validateDateFields : function() {
    	var date_start = getDateObject(this.projProjectStatusUpdateForm.getFieldValue('project.date_start'));//note that getFieldValue returns date in ISO format
    	var date_end = getDateObject(this.projProjectStatusUpdateForm.getFieldValue('project.date_end'));
    	if (date_end < date_start) {
    		this.projProjectStatusUpdateForm.addInvalidField('project.date_end', getMessage('endBeforeStart'));
    		return false;
    	}
    	return true;    	
    },

	abDeleteConfirm_form_onOk: function(){
		var isDeleteLink = $('abDeleteConfirm_link').checked;
		var isDeleteAction = $('abDeleteConfirm_action').checked;
		if (!isDeleteAction && !isDeleteLink) {
			View.showMessage(getMessage('errNoOptionSelected'));
			return false;
		}
		
		var deteleType = isDeleteAction?'action':'link';
		var fields = this.getSelectedFields();
		
		try{
			var result = Workflow.callMethod('AbCommonResources-ProjectRequirementsService-deleteAction', deteleType, fields , this.projectIds);
			if(result.code == 'executed'){
				if(valueExists(this.callbackMethod)){
					this.callbackMethod();
					this.abDeleteConfirm_form.closeWindow();
					View.closeThisDialog();
				}
			}
		} catch(e) {
			Workflow.handleError(e);
			return false;
		}
	},
	
	getSelectedFields: function(){
		var fieldNames = {
				'geo_region': 'geo_region_id', 'ctry': 'ctry_id', 'regn': 'regn_id', 'state': 'state_id', 'city': 'city_id',  
				'site': 'site_id', 'bl': 'bl_id', 'fl': 'fl_id', 'rm': 'rm_id',
				'program': 'program_id', 'project': 'project_id', 'work_pkgs':'work_pkg_id', 'activity_log': 'activity_log_id' 
		};
		
		var result = null;
		var fieldName = fieldNames[this.itemType];
		var clauseName = this.itemType + "." + fieldName;
		var clause =  this.restriction.findClause(clauseName);
		if(clause){
			var value = clause.value;
			result = JSON.parse('{"' + fieldName + '":"' + value + '"}');
		}

		return result;
	}
    
});

function getDateObject(ISODate)
{
	var tempArray = ISODate.split('-');
	return new Date(tempArray[0],tempArray[1]-1,tempArray[2]);
}


function executeDetailsCallback(ctx){
	var controller = View.controllers.get('abEamProjectDetailsCtrl');
	if(valueExists(controller.callbackMethod)){
		controller.callbackMethod();
	}
}
