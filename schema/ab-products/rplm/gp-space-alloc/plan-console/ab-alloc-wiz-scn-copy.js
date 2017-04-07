var copyPortfolioScenarioController = View.createController('copyPortfolioScenarioController', {
	afterInitialDataFetch: function() {
		this.copyPortfolioForm.enableField("portfolio_scenario.scn_name", false);
		this.copyPortfolioForm.enableFieldActions("portfolio_scenario.scn_name", true);
	},
	
	copyPortfolioForm_onCopyPortfolioScn: function() {
		if(this.copyPortfolioForm.canSave()) {
			//save the newly created portfolio scenario
			this.saveNewPortfolioScn();
			
			//check and save Space Budget and Space Budget items if they exist for 'fg' level.
			//if ('fg'==this.copyPortfolioForm.getFieldValue('portfolio_scenario.scn_level')) {
			this.saveSpaceBugdet();
			this.saveSpaceBudgetItems();	  			
			//}
			
			//save the gp records and sb items
			this.copyAllocations();
			
			this.copyPortfolioForm.displayTemporaryMessage('Copied Successfully');

			//kb#3050136: refresh the scenario list in Select Scenario tab.
			View.getOpenerView().controllers.get('allocWizScn').allocWizScn_grid.refresh();
		} 
	},
	
	/**
	 * Save the new ps with values from form and copied ps.
	 */
	saveNewPortfolioScn: function() {
		var sourcePortfolioId = this.copyPortfolioForm.getFieldValue('portfolio_scenario.portfolio_scenario_id');
		var newPortfolioId = this.copyPortfolioForm.getFieldValue('new_scn_id');
		var newScnName = this.copyPortfolioForm.getFieldValue('new_scn_name');
		var newDescription = this.copyPortfolioForm.getFieldValue('portfolio_scenario.description');
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause('portfolio_scenario.portfolio_scenario_id', newPortfolioId, '=');
		var records = this.copyPortfolioDs.getRecords(restriction);
		if (records.length > 0) {
			View.message('error', "A duplicate portfolio scenario " + newPortfolioId + ' already exists!');
		} else {
			restriction = new Ab.view.Restriction();
			restriction.addClause('portfolio_scenario.portfolio_scenario_id', sourcePortfolioId, '=');
			records = this.copyPortfolioDs.getRecords(restriction);
			var copiedPortfolioScenario = records[0];
			
			var record = new Ab.data.Record();
			record.setValue('portfolio_scenario.portfolio_scenario_id', newPortfolioId);
			record.setValue('portfolio_scenario.scn_name', newScnName);
			if(valueExists(newDescription)) {
				record.setValue('portfolio_scenario.description', newDescription);
			}
			record.setValue('portfolio_scenario.date_start', copiedPortfolioScenario.getValue('portfolio_scenario.date_start'));
			record.setValue('portfolio_scenario.scn_level', copiedPortfolioScenario.getValue('portfolio_scenario.scn_level'));
			record.setValue('portfolio_scenario.status', copiedPortfolioScenario.getValue('portfolio_scenario.status'));
			
			this.copyPortfolioDs.saveRecord(record);
		}
	},
	
	saveSpaceBugdet: function() {
		var sourceScnName = this.copyPortfolioForm.getFieldValue('portfolio_scenario.scn_name');
		var newScnName = this.copyPortfolioForm.getFieldValue('new_scn_name');
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause('sb.sb_name', sourceScnName, '=');
		var sourceSbs = this.copiedSpaceBudgetDs.getRecords(restriction);
		if (sourceSbs.length > 0) {
			var sourceSb = sourceSbs[0];
			sourceSb.setValue('sb.sb_name', newScnName);
			sourceSb.isNew = true;
			this.copiedSpaceBudgetDs.saveRecord(sourceSb);
		}
	},
	
	saveSpaceBudgetItems: function() {
		var sourceScnName = this.copyPortfolioForm.getFieldValue('portfolio_scenario.scn_name');
		var newScnName = this.copyPortfolioForm.getFieldValue('new_scn_name');
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause('sb_items.sb_name', sourceScnName, '=');
		var sbItems = this.copiedSpaceBudgetItemsDs.getRecords(restriction);
		
		for (var i = 0; i < sbItems.length; i++) {
			var sbItem = sbItems[i];
			sbItem.removeValue('sb_items.auto_number');
			sbItem.setValue('sb_items.sb_name', newScnName);
			sbItem.isNew = true;
			this.copiedSpaceBudgetItemsDs.saveRecord(sbItem);
		}
	},
	
	copyAllocations: function() {
		var sourcePortfolioId = this.copyPortfolioForm.getFieldValue('portfolio_scenario.portfolio_scenario_id');
		var newPortfolioId = this.copyPortfolioForm.getFieldValue('new_scn_id');
		var sourceScnName = this.copyPortfolioForm.getFieldValue('portfolio_scenario.scn_name');
		var newScnName = this.copyPortfolioForm.getFieldValue('new_scn_name');

		var restriction = new Ab.view.Restriction();
		restriction.addClause('gp.portfolio_scenario_id', sourcePortfolioId, '=');
		var allAllocations = this.copyAllocationsDataSource.getRecords(restriction);
		for (var i = 0; i < allAllocations.length; i++) {
			var allocation = allAllocations[i];
			allocation.setValue('gp.portfolio_scenario_id', newPortfolioId);
			allocation.removeValue('gp.gp_id');
			allocation.isNew = true;
			this.copyAllocationsDataSource.saveRecord(allocation);
		}
	}
});