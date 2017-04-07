var capbudFciCreatePage2Controller = View.createController('capbudFciCreatePage2', {
	project_id : '',
	proj_scenario_id : '',
	records : null,
	
	afterInitialDataFetch : function() {
		this.capbudFciCreateScenarioItemForm.show(false);	
	},
	
	restrictScenarioItemsGrid : function(obj) {
		var controllerPage1 = View.controllers.get('capbudFciCreatePage1');
		this.project_id = controllerPage1.project_id;
	    var proj_scenario_id = obj.restriction.clauses[0].value;
	    this.proj_scenario_id = proj_scenario_id;
	    
	    var restriction = new Ab.view.Restriction();
	    restriction.addClause('activity_log.project_id', this.project_id);
	    restriction.addClause('actscns.proj_scenario_id', this.proj_scenario_id);
	    this.capbudFciCreateScenarioItemsGrid.refresh(restriction);
	    this.capbudFciCreateScenarioItemsGrid.appendTitle(this.project_id + ' - ' + this.proj_scenario_id);
	    this.capbudFciCreateTabs.findTab('capbudFciCreatePage2').setTitle(this.project_id + ' - ' + this.proj_scenario_id);
	},
	
	capbudFciCreateScenarioItemsGrid_onEditSelectedItems : function() {
		this.records = this.capbudFciCreateScenarioItemsGrid.getSelectedRecords();
		if (this.records.length == 0) return; 
		var restriction = new Ab.view.Restriction();
		restriction.addClause('actscns.proj_scenario_id', this.records[0].getValue('actscns.proj_scenario_id'));
		restriction.addClause('actscns.activity_log_id', this.records[0].getValue('actscns.activity_log_id'));
		if (this.records.length == 1) {
			this.capbudFciCreateScenarioItemForm.refresh(restriction);
			this.capbudFciCreateScenarioItemForm.showInWindow({
				width: 600,
				height: 500
			});
		}
		else {
			this.capbudFciCreateScenarioItemMultipleForm.refresh(restriction);
			this.capbudFciCreateScenarioItemMultipleForm.newRecord = true;
			this.capbudFciCreateScenarioItemMultipleForm.showInWindow({
				width: 600,
				height: 500
			});
		}		
	},
	
	capbudFciCreateScenarioItemMultipleForm_onSave : function() {
		var fiscal_year = this.capbudFciCreateScenarioItemMultipleForm.getFieldValue('actscns.fiscal_year');
		for (i = 0; i < this.records.length; i++) {
			var restriction = new Ab.view.Restriction();
			restriction.addClause('actscns.proj_scenario_id', this.records[i].getValue('actscns.proj_scenario_id'));
			restriction.addClause('actscns.activity_log_id', this.records[i].getValue('actscns.activity_log_id'));
			var record = this.capbudFciCreateScenarioItemsDs.getRecord(restriction);
			record.setValue('actscns.fiscal_year', fiscal_year);
			this.capbudFciCreateScenarioItemsDs.saveRecord(record);
		}
		this.capbudFciCreateScenarioItemsGrid.refresh();
		this.capbudFciCreateScenarioItemsGrid.appendTitle(this.project_id + ' - ' + this.proj_scenario_id);
	},
	
	capbudFciCreateScenarioItemsGrid_onPrevious : function() {
		this.capbudFciCreateTabs.selectTab('capbudFciCreatePage1');
		this.capbudFciCreateScenariosTable.refresh();
		this.capbudFciCreateScenariosTable.appendTitle(this.project_id);
		this.capbudFciCreateConsole.setFieldValue('project.project_id', this.project_id);
	}
});