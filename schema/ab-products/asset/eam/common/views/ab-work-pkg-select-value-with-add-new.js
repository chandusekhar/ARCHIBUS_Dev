var abWorkPgkSelectValueCtrl = View.createController('abWorkPgkSelectValueCtrl', {
	restriction: null,
	
	selectValueType: null,
	multipleSelectionEnabled: false,
	
	projectId: null,
	workPkgId: null,
	
	tmpProjectId: null,
	
	callbackMethod: null,
	
	afterViewLoad: function(){
		if(valueExists(this.view.restriction)){
			this.restriction = this.view.restriction;
		} else if (valueExists(this.view.parameters) && valueExists(this.view.parameters.restriction)){
			this.restriction = this.view.parameters.restriction;
		}

		if (valueExists(this.view.parameters) && valueExists(this.view.parameters.selectValueType)) {
			this.selectValueType = this.view.parameters.selectValueType;
			this.multipleSelectionEnabled = this.selectValueType == 'multiple';
		}

		if (valueExists(this.view.parameters) && valueExists(this.view.parameters.projectId)) {
			this.projectId = this.view.parameters.projectId;
			this.tmpProjectId = this.projectId;
			this.abWorkPkgsSelectValue_list.filterValues = {'work_pkgs.project_id': this.projectId};
		}
		
		if (valueExists(this.view.parameters) && valueExists(this.view.parameters.workPkgId)) {
			this.workPkgId = this.view.parameters.workPkgId;
			this.abWorkPkgsSelectValue_list.filterValues = {'work_pkgs.work_pkg_id': this.workPkgId};
		}
		
		if (valueExists(this.view.parameters) && valueExists(this.view.parameters.callback)) {
			this.callbackMethod = this.view.parameters.callback;
		}
		this.abWorkPkgsSelectValue_list.addEventListener('onMultipleSelectionChange', abWorkPkgsSelectValue_list_onMultipleSelectionChange); 
		
	},
	
	afterInitialDataFetch: function(){
		this.abWorkPkgsSelectValue_list.showColumn('multipleSelectionColumn', this.multipleSelectionEnabled);
		this.abWorkPkgsSelectValue_list.actions.get('saveSelected').show(this.multipleSelectionEnabled);
		this.abWorkPkgsSelectValue_list.update();
		this.abWorkPkgsSelectValue_list.refresh();
		if(this.multipleSelectionEnabled){
			this.abWorkPkgsSelectValue_list.enableAction('saveSelected', this.abWorkPkgsSelectValue_list.getSelectedRows().length > 0);
		}
	},
	
	abWorkPkgsSelectValue_list_afterRefresh: function(){
		var doRefresh = false;
		if(valueExists(this.projectId)){
			this.abWorkPkgsSelectValue_list.filterValues = {'work_pkgs.project_id': this.projectId};
			this.abWorkPkgsSelectValue_list.setFilterValue('work_pkgs.project_id', this.projectId);
			this.projectId = null;
			doRefresh = true;
		}
		if(valueExists(this.workPkgId)){
			this.abWorkPkgsSelectValue_list.filterValues = {'work_pkgs.work_pkg_id': this.workPkgId};
			this.abWorkPkgsSelectValue_list.setFilterValue('work_pkgs.work_pkg_id', this.workPkgId);
			this.workPkgId = null;
			doRefresh = true;
		}
		
		if(doRefresh){
			this.abWorkPkgsSelectValue_list.refresh();
		}
	},
	
	abWorkPkgsSelectValue_form_onSave: function(){
		if(this.abWorkPkgsSelectValue_form.save()){
			this.abWorkPkgsSelectValue_list.refresh(this.abWorkPkgsSelectValue_list.restriction);
			this.abWorkPkgsSelectValue_form.closeWindow();
		}
	},
	
	abWorkPkgsSelectValue_list_onMultipleSelectionChange: function(row){
		this.abWorkPkgsSelectValue_list.enableAction('saveSelected', this.abWorkPkgsSelectValue_list.getSelectedRows().length > 0);
	},
	
	abWorkPkgsSelectValue_list_onSaveSelected: function(){
		var rows = this.abWorkPkgsSelectValue_list.getSelectedGridRows();
		if(valueExists(this.callbackMethod) && 
				rows.length > 0 ){
			this.callbackMethod(rows); 
			View.closeThisDialog();
		}
	}
});

/**
 * On select row event handler.
 */
function onSelectRow(ctx){
	var controller = View.controllers.get('abWorkPgkSelectValueCtrl');
	var selGridRow = controller.abWorkPkgsSelectValue_list.gridRows.get(controller.abWorkPkgsSelectValue_list.selectedRowIndex);
	var rows = new Array();
	rows.push(selGridRow);
	if(valueExists(controller.callbackMethod) && 
			rows.length > 0){
		controller.callbackMethod(rows); 
		View.closeThisDialog();
	}
}

function abWorkPkgsSelectValue_list_onMultipleSelectionChange(row){
	var controller = View.controllers.get('abWorkPgkSelectValueCtrl');
	controller.abWorkPkgsSelectValue_list_onMultipleSelectionChange(row);
}


function setProjectId(){
	var controller = View.controllers.get('abWorkPgkSelectValueCtrl');
	var form = View.panels.get('abWorkPkgsSelectValue_form');
	if (valueExists(controller.tmpProjectId)) {
		if(isArray(controller.tmpProjectId)){
			form.setFieldValue('work_pkgs.project_id', controller.tmpProjectId[0]);
		}else{
			form.setFieldValue('work_pkgs.project_id', controller.tmpProjectId);
		}
		
	}
}


function selectValueProject(){
	var controller = View.controllers.get('abWorkPgkSelectValueCtrl');
	var restriction = new Ab.view.Restriction();
	if (valueExists(controller.tmpProjectId)) {
		if(isArray(controller.tmpProjectId)){
			restriction.addClause('project.project_id', controller.tmpProjectId, 'IN');
		}else{
			restriction.addClause('project.project_id', controller.tmpProjectId, '=');
		}
		
	}
	
	View.selectValue(
		'abWorkPkgsSelectValue_form',
		getMessage('titleSelectValueProjectId'),
		['work_pkgs.project_id'],
		'project',
		['project.project_id'],
		['project.project_id', 'project.project_name', 'project.status', 'project.summary'],
		restriction
	);
}


function verifyEndAfterStart(formId, field) {
	var form = View.panels.get(formId);
	var date_started = form.getFieldValue(field + '_start');
	var date_completed = form.getFieldValue(field + '_end');
	if (date_started != '' && date_completed != '' && date_completed < date_started) {
		form.setFieldValue(field + '_end', date_started);
	}
}
