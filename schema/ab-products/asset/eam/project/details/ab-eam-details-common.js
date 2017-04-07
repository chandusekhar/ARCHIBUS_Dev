var abEamDetailsController = View.createController('abEamDetailsController', {
	
	projectIds: null,
	
	itemType: null,
	
	itemId: null,
	
	callbackMethod: null,
	
	restriction: null,
	
	afterViewLoad: function(){
		if(valueExists(this.view.parameters)){
			if(valueExists(this.view.parameters.projectIds)){
				this.projectIds = this.view.parameters.projectIds;
			}
			if(valueExists(this.view.parameters.itemType)){
				this.itemType = this.view.parameters.itemType;
			}
			if(valueExists(this.view.parameters.callback)){
				this.callbackMethod = this.view.parameters.callback;
			}
		}
		if(valueExists(this.view.restriction)){
			this.restriction = this.view.restriction;
		}
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


function executeDetailsCallback(ctx){
	var controller = View.controllers.get('abEamDetailsController');
	if(valueExists(controller.callbackMethod)){
		controller.callbackMethod();
	}
}
