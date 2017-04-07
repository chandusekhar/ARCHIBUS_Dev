var evaluateScenarioByFundController = View.createController('evaluateScenarioByFund', {
	project_id : '',
	proj_scenario_id : '',
	
	afterViewLoad: function() {
        this.evaluateScenarioByFundScenarioItemsTable.addEventListener('afterGetData', this.evaluateScenarioByFundScenarioItemsTable_afterGetData, this);
    },
    
    evaluateScenarioByFundScenarioItemsTable_afterGetData: function(panel, dataSet) {
    	dataSet.totals[0].localizedValues['projscns.design_cost'] = '';
		dataSet.totals[0].localizedValues['projscns.cost_scenario'] = '';
		for (var r = 0; r < dataSet.rowSubtotals.length; r++) {
			dataSet.rowSubtotals[r].localizedValues['projscns.design_cost'] = '';
			dataSet.rowSubtotals[r].localizedValues['projscns.cost_scenario'] = '';
		}
	},
	
	afterInitialDataFetch : function() {
		this.evaluateScenarioByFundScenarioItemForm.show(false);	
	},
	
	restrictScenarioItemsTable : function(project_id, proj_scenario_id) {
		this.project_id = project_id;
	    this.proj_scenario_id = proj_scenario_id;
	    
	    this.evaluateScenarioByFundScenarioItemsTable.addParameter('projectId', this.project_id);
	    this.evaluateScenarioByFundScenarioItemsTable.addParameter('projScenarioId', this.proj_scenario_id);
	    this.evaluateScenarioByFundScenarioItemsTable.refresh();
	    this.evaluateScenarioByFundScenarioItemsTable.appendTitle(this.project_id + ' - ' + this.proj_scenario_id);
	},
	
	evaluateScenarioByFundScenarioItemsTable_onAddScenarioItem : function() {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('projscns.project_id', this.project_id);
		restriction.addClause('projscns.proj_scenario_id', this.proj_scenario_id);
		this.evaluateScenarioByFundScenarioItemForm.newRecord = true;
		this.evaluateScenarioByFundScenarioItemForm.refresh(restriction);
		this.evaluateScenarioByFundScenarioItemForm.showInWindow({
			width: 600,
			height: 500
		});
	},
	
	evaluateScenarioByFundScenarioItemForm_onSelectFund : function() {
		View.openDialog('ab-evaluate-scenario-by-fund-select-fund.axvw', '', false, {width: 500, height: 400});
	},
	
	evaluateScenarioByFundScenarioItemForm_onSave: function() {		
		var fund_id = this.evaluateScenarioByFundScenarioItemForm.getFieldValue('projscns.fund_id');		
		var restriction = new Ab.view.Restriction();
		restriction.addClause('funding.fund_id', fund_id);
		var funding_record = this.evaluateScenarioByFundScenarioItemFormDs3.getRecord(restriction);
		var funding_program_id = funding_record.getValue('funding.program_id');
			
		restriction = new Ab.view.Restriction();
		restriction.addClause('project.project_id', this.project_id);
		var project_record = this.evaluateScenarioByFundScenarioItemFormDs2.getRecord(restriction);
		var project_program_id = project_record.getValue('project.program_id');
		
		if (!this.checkProgramIdMatch(funding_program_id, project_program_id)) return;
		var fiscal_year = this.evaluateScenarioByFundScenarioItemForm.getFieldValue('projscns.fiscal_year');
		if (fiscal_year && !this.checkDateAvailability(funding_record, fiscal_year)) return;
		
		if (this.evaluateScenarioByFundScenarioItemForm.save()) {
			this.evaluateScenarioByFundScenarioItemsTable.refresh();
			this.evaluateScenarioByFundScenarioItemsTable.appendTitle(this.project_id + ' - ' + this.proj_scenario_id);
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

	evaluateScenarioByFundScenarioItemForm_onDelete : function() {
		this.evaluateScenarioByFundScenarioItemsTable.appendTitle(this.project_id + ' - ' + this.proj_scenario_id);
	},
	
	evaluateScenarioByFundScenarioItemForm_onCancel : function() {
		this.evaluateScenarioByFundScenarioItemsTable.appendTitle(this.project_id + ' - ' + this.proj_scenario_id);
	}
});

function evaluateScenarioByFundScenarioItemsTable_onClick(obj) {
	var controller = View.controllers.get('evaluateScenarioByFund');
    obj.restriction.addClause('projscns.project_id', controller.project_id);
    obj.restriction.addClause('projscns.proj_scenario_id', controller.proj_scenario_id);
    controller.evaluateScenarioByFundScenarioItemForm.refresh(obj.restriction);
    controller.evaluateScenarioByFundScenarioItemForm.showInWindow({
		width: 600,
		height: 500
	});
}

function evaluateScenarioByFundScenariosTree_onClick() {
	var curTreeNode = View.panels.get('evaluateScenarioByFundProjectsTree').lastNodeClicked;
	var project_id = curTreeNode.data['projscns.project_id'];
	var proj_scenario_id = curTreeNode.data['projscns.proj_scenario_id'];
	var controller = View.controllers.get('evaluateScenarioByFund');
	controller.restrictScenarioItemsTable(project_id, proj_scenario_id);
}
