var capbudFciAnalyzeItemsController = View.createController('capbudFciAnalyzeItems', {
	records : null,
	
	afterInitialDataFetch : function() {
		var restrictionValues = this.capbudFciAnalyzeItemsGrid.restriction.substring(this.capbudFciAnalyzeItemsGrid.restriction.indexOf("=")+3)
	    this.capbudFciAnalyzeItemsGrid.appendTitle(restrictionValues.substring(0,restrictionValues.indexOf("\'")));
	},
	
	capbudFciAnalyzeItemsGrid_onEditSelectedItems : function() {
		this.records = this.capbudFciAnalyzeItemsGrid.getSelectedRecords();
		if (this.records.length == 0) return; 
		var restriction = new Ab.view.Restriction();
		restriction.addClause('actscns.proj_scenario_id', this.records[0].getValue('actscns.proj_scenario_id'));
		restriction.addClause('actscns.activity_log_id', this.records[0].getValue('actscns.activity_log_id'));
		if (this.records.length == 1) {
			this.capbudFciAnalyzeItemsForm.refresh(restriction);
			this.capbudFciAnalyzeItemsForm.showInWindow({
				width: 600,
				height: 500
			});
		}
		else {
			this.capbudFciAnalyzeItemsMultipleForm.refresh(restriction);
			this.capbudFciAnalyzeItemsMultipleForm.newRecord = true;
			this.capbudFciAnalyzeItemsMultipleForm.showInWindow({
				width: 600,
				height: 500
			});
		}		
	},
	
	capbudFciAnalyzeItemsForm_onSave : function() {
		this.capbudFciAnalyzeItemsForm.save();
		View.getOpenerView().panels.get('capbudFciAnalyzeScenariosTable').refresh();
		this.capbudFciAnalyzeItemsGrid.refresh();
		this.capbudFciAnalyzeItemsGrid.appendTitle(this.capbudFciAnalyzeItemsGrid.restriction.clauses[0].value);
	},
	
	capbudFciAnalyzeItemsMultipleForm_onSave : function() {
		var fiscal_year = this.capbudFciAnalyzeItemsMultipleForm.getFieldValue('actscns.fiscal_year');
		for (i = 0; i < this.records.length; i++) {
			var restriction = new Ab.view.Restriction();
			restriction.addClause('actscns.proj_scenario_id', this.records[i].getValue('actscns.proj_scenario_id'));
			restriction.addClause('actscns.activity_log_id', this.records[i].getValue('actscns.activity_log_id'));
			var record = this.capbudFciAnalyzeItemsDs.getRecord(restriction);
			record.setValue('actscns.fiscal_year', fiscal_year);
			this.capbudFciAnalyzeItemsDs.saveRecord(record);
		}
		View.getOpenerView().panels.get('capbudFciAnalyzeScenariosTable').refresh();
		this.capbudFciAnalyzeItemsGrid.refresh();
		this.capbudFciAnalyzeItemsGrid.appendTitle(this.capbudFciAnalyzeItemsGrid.restriction.clauses[0].value);
	}
});