var abMoveScenariosCreateCtrl = View.createController('abMoveScenariosCreateCtrl',{
	//selected project id
	project_id: null,
	
	// selected scenario id
	scenario_id: null,
	
	isNew: true,
	
	original_scenario_id: null,
	
	afterViewLoad: function(){
		var parameters = this.view.parameters;
		this.project_id = parameters['project_id'];
		this.scenario_id = parameters['scenario_id'];
		this.original_scenario_id = parameters['original_scenario_id'];
		this.isNew = parameters['isNew'];
	},
	afterInitialDataFetch: function(){
		var restriction = new Ab.view.Restriction();
		if( valueExistsNotEmpty(this.project_id)){
			restriction.addClause('mo_scenario.project_id', this.project_id, '=');
		}
		if( valueExistsNotEmpty(this.scenario_id)){
			restriction.addClause('mo_scenario.scenario_id', this.scenario_id, '=');
			this.isNew = false;
		}
		this.form_abMoveScenariosCreate.refresh(restriction, this.isNew);
		if( valueExistsNotEmpty(this.project_id)){
			this.form_abMoveScenariosCreate.enableField('mo_scenario.project_id', false);
		}
	},
	
	form_abMoveScenariosCreate_onSave: function(){
		var record = null;
		if (this.form_abMoveScenariosCreate.canSave()) {
			if (this.isNew && this.original_scenario_id == null) {
				try {
					record = this.form_abMoveScenariosCreate.getOutboundRecord();
					var result = Workflow.callMethod('AbMoveManagement-MoveService-createMoveScenario', record, false);
					closeAndRefresh();
				} 
				catch (e) {
					//Workflow.handleError(e);
					View.showMessage('error',e.message);
				}
			}
			else 
				if (this.isNew && this.original_scenario_id != null) {
					try {
						record = this.form_abMoveScenariosCreate.getOutboundRecord();
						var result = Workflow.callMethod('AbMoveManagement-MoveService-copyMoveScenario', record, this.original_scenario_id);
						closeAndRefresh();
					} 
					catch (e) {
						//Workflow.handleError(e);
						View.showMessage('error',e.message);
					}
				}
				else 
					if (!this.isNew) {
						this.form_abMoveScenariosCreate.save();
						closeAndRefresh();
					}
		}
	}
})

function closeAndRefresh(){
	View.getOpenerView().panels.items[0].refresh();
	View.closeThisDialog();
}
