var abMoveScenarioCtrl = View.createController('abMoveScenarioCtrl',{
	parentController: null,
	afterViewLoad: function(){
		if(View.controllers.get('tabsController')){
			this.parentController = View.controllers.get('tabsController');
		}else if(View.getOpenerView().controllers.get('tabsController')){
			this.parentController = View.getOpenerView().controllers.get('tabsController');
		}
	},
	afterInitialDataFetch: function(){
		var restriction = new Ab.view.Restriction();
		if(valueExistsNotEmpty(this.parentController.project_id)){
			restriction.addClause('mo_scenario_em.project_id', this.parentController.project_id, '=');
		}
		this.list_abMoveScenario.refresh(restriction);
	},
	list_abMoveScenario_afterRefresh: function(){
		this.list_abMoveScenario.enableSelectAll(false);
	},
	
	list_abMoveScenario_multipleSelectionColumn_onClick: function(row){
		var selected = row.isSelected();
		if(selected){
			this.list_abMoveScenario.setAllRowsSelected(false);
			row.select(selected);
			this.parentController.scenario_id = row.getFieldValue('mo_scenario.scenario_id');
		}else{
			this.parentController.scenario_id = null;
		}
	},
	list_abMoveScenario_edit_onClick: function(row){
		this.list_abMoveScenario.setAllRowsSelected(false);
		row.select(true);
		var project_id = row.getFieldValue('mo_scenario.project_id');
		var scenario_id = row.getFieldValue('mo_scenario.scenario_id');

		editScenario('edit', project_id, scenario_id);
	},
	list_abMoveScenario_onNew: function(){
		var project_id = this.parentController.project_id;
		editScenario('new', project_id);
	},
	list_abMoveScenario_onCopy: function(){
		var selectedRows = this.list_abMoveScenario.getSelectedRows();
		if(selectedRows.length == 0){
			View.showMessage(getMessage('msg_no_selection'));
			return;
		}
		var project_id = selectedRows[0]['mo_scenario.project_id'];
		var scenario_id = selectedRows[0]['mo_scenario.scenario_id'];
		editScenario('copy', project_id, scenario_id);
	}
});

function editScenario(type, project_id, scenario_id){
	var isNew = false;
	var original_scenario_id = null;
	if(type == "copy"){
		isNew = true;
		original_scenario_id = scenario_id;
		scenario_id = null;
	}else if(type == "edit"){
		isNew = false;
		original_scenario_id = null;
	}else if(type == "new"){
		isNew = true;
		scenario_id = null;
	}
	View.openDialog('ab-mo-gp-scenarios-create.axvw', null, false, {
		width: 600, 
	    height: 400, 
	    closeButton: false,
		isNew: isNew,
		project_id: project_id,
		scenario_id: scenario_id,
		original_scenario_id: original_scenario_id
	});
}

function refresh_panel(){
	View.panels.get('list_abMoveScenario').refresh();
}

function ifRowsSelected(){
	if(abMoveScenarioCtrl.list_abMoveScenario.getSelectedRows().length == 0) {
		View.showMessage(getMessage('msg_no_selection'));
		return false;
	}
	
	return true;
}
