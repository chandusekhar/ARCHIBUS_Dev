var planScenarioCostsPage2Controller = View.createController('planScenarioCostsPage2', {
	project_id : '',
	proj_scenario_id : '',
	
	afterViewLoad: function() {
        this.planScenarioCostsScenarioItemsTable.addEventListener('afterGetData', this.planScenarioCostsScenarioItemsTable_afterGetData, this);
    },
    
    planScenarioCostsScenarioItemsTable_afterGetData: function(panel, dataSet) {
    	dataSet.totals[0].localizedValues['projscns.design_cost'] = '';
		dataSet.totals[0].localizedValues['projscns.cost_scenario'] = '';
		for (var r = 0; r < dataSet.rowSubtotals.length; r++) {
			dataSet.rowSubtotals[r].localizedValues['projscns.design_cost'] = '';
			dataSet.rowSubtotals[r].localizedValues['projscns.cost_scenario'] = '';
		}
	},
	
	afterInitialDataFetch : function() {
		this.planScenarioCostsScenarioItemForm.show(false);
		this.planScenarioCostsScenarioItemsTable.refresh();
	},
	
	restrictScenarioItemsTable : function(obj) {
		var controllerPage1 = View.controllers.get('planScenarioCostsPage1');
		this.project_id = controllerPage1.project_id;
	    var proj_scenario_id = obj.restriction.clauses[0].value;
	    this.proj_scenario_id = proj_scenario_id;
	    
	    this.planScenarioCostsScenarioItemsTable.addParameter('projectId', this.project_id);
	    this.planScenarioCostsScenarioItemsTable.addParameter('projScenarioId', this.proj_scenario_id);
	    this.planScenarioCostsScenarioItemsTable.refresh();
	    this.planScenarioCostsScenarioItemsTable.appendTitle(this.project_id + ' - ' + this.proj_scenario_id);
	    this.planScenarioCostsTabs.findTab('planScenarioCostsPage2').setTitle(this.project_id + ' - ' + this.proj_scenario_id);
	},
	
	planScenarioCostsScenarioItemsTable_onAddScenarioItem : function() {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('projscns.project_id', this.project_id);
		restriction.addClause('projscns.proj_scenario_id', this.proj_scenario_id);
		this.planScenarioCostsScenarioItemForm.newRecord = true;
		this.planScenarioCostsScenarioItemForm.refresh(restriction);
		this.planScenarioCostsScenarioItemForm.showInWindow({
			width: 600,
			height: 500
		});
	},
	
	planScenarioCostsScenarioItemsTable_onPrevious : function() {
		this.planScenarioCostsTabs.selectTab('planScenarioCostsPage1');
		this.planScenarioCostsScenariosTable.refresh();
		this.planScenarioCostsScenariosTable.appendTitle(this.project_id);
		this.planScenarioCostsConsole.setFieldValue('project.project_id', this.project_id);
	},
	
	planScenarioCostsScenarioItemForm_onSelectFund : function() {
		View.openDialog('ab-plan-scenario-costs-select-fund.axvw', '', false, {width: 500, height: 400});
	},
	
	planScenarioCostsScenarioItemForm_onSave: function() {		
		var fund_id = this.planScenarioCostsScenarioItemForm.getFieldValue('projscns.fund_id');		
		var restriction = new Ab.view.Restriction();
		restriction.addClause('funding.fund_id', fund_id);
		var funding_record = this.planScenarioCostsScenarioItemFormDs3.getRecord(restriction);
		var funding_program_id = funding_record.getValue('funding.program_id');
			
		restriction = new Ab.view.Restriction();
		restriction.addClause('project.project_id', this.project_id);
		var project_record = this.planScenarioCostsScenarioItemFormDs2.getRecord(restriction);
		var project_program_id = project_record.getValue('project.program_id');
			
		if (!this.checkProgramIdMatch(funding_program_id, project_program_id)) return;
		var fiscal_year = this.planScenarioCostsScenarioItemForm.getFieldValue('projscns.fiscal_year');
		if (fiscal_year && !this.checkDateAvailability(funding_record, fiscal_year)) return;
		
		if (this.planScenarioCostsScenarioItemForm.save()) {
			this.planScenarioCostsScenarioItemsTable.refresh();
			this.planScenarioCostsScenarioItemsTable.appendTitle(this.project_id + ' - ' + this.proj_scenario_id);
			View.closeThisDialog();
		}
	},
	
	checkProgramIdMatch: function(fundingProgramId, projectProgramId) {
		/* project.program_id must either match funding.program_id or else either value must be null */
		if (fundingProgramId == '' || fundingProgramId == undefined || projectProgramId == '' || fundingProgramId == projectProgramId) {
			return true;
		}
		else {
			View.showMessage(getMessage('mismatchedProgramId'));
			return false;
		}		
	},
	
	checkDateAvailability: function(funding_record, fiscal_year) {
		var funds_available = true;
		/* fiscal_year must fall between funding date_avail and date_avail_end */
		var date_avail = funding_record.getValue('funding.date_avail');
		var date_avail_year = '';
		if (date_avail) date_avail_year = date_avail.getFullYear();
		
		var date_avail_end = funding_record.getValue('funding.date_avail_end');
		var date_avail_end_year = '';
		if (date_avail_end) date_avail_end_year = date_avail_end.getFullYear();
		
		if (date_avail_year && fiscal_year < date_avail_year) funds_available = false;
		if (date_avail_end_year && fiscal_year > date_avail_end_year) funds_available = false;
		
		if (!funds_available) {
			View.showMessage(getMessage('fundsUnavailableByDate'));
			return false;
		} else return true;	
	},
	
	planScenarioCostsScenarioItemForm_onDelete : function() {
		this.planScenarioCostsScenarioItemsTable.appendTitle(this.project_id + ' - ' + this.proj_scenario_id);
	},
	
	planScenarioCostsScenarioItemForm_onCancel : function() {
		this.planScenarioCostsScenarioItemsTable.appendTitle(this.project_id + ' - ' + this.proj_scenario_id);
	}
});

function planScenarioCostsScenarioItemsTable_onClick(obj) {
	var controller = View.controllers.get('planScenarioCostsPage2');
    obj.restriction.addClause('projscns.project_id', controller.project_id);
    obj.restriction.addClause('projscns.proj_scenario_id', controller.proj_scenario_id);
    controller.planScenarioCostsScenarioItemForm.refresh(obj.restriction);
    controller.planScenarioCostsScenarioItemForm.showInWindow({
		width: 600,
		height: 500
	});
}