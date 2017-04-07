var allocScenarioController = View.createController('allocScenario',{

	gridRow:null,

	afterInitialDataFetch: function() {
		this.scenarioGrid.refresh();
		this.scenarioGrid.enableSelectAll(false);
	},

	editScenarioForm_onSave: function() {
		this.scenarioGrid.refresh();
	},

    scenarioGrid_onAddNew: function() {

		this.editScenarioForm.refresh(null, true);

        this.editScenarioForm.showInWindow({
			newRecord: true,
            closeButton: true
        });

    },

	scenarioGrid_onCopyGroupInventoryToScenario: function() {

		this.copyInventoryForm.refresh(null, true);

		this.copyInventoryForm.setFieldValue('gp.portfolio_scenario_id','Baseline');

		if (this.copyInventoryForm.getFieldValue('gp.date_start') == '') {

			var record = this.copyInventoryForm.getRecord();

			record.setValue('gp.date_start', new Date());

			this.copyInventoryForm.onModelUpdate();
		}

		addPeriod("YEAR",5,'copyInventoryForm','gp.date_start','gp.date_end');

        this.copyInventoryForm.showInWindow({
			newRecord: true,
            closeButton: true
        });
	},

	scenarioGrid_onCopyScenario: function() {
		var from_portfolio_scenario_id = "";

		this.gridRow = this.scenarioGrid.gridRows.get(this.scenarioGrid.selectedRowIndex);

		if(this.gridRow != null){
			from_portfolio_scenario_id = this.gridRow.getFieldValue('portfolio_scenario.portfolio_scenario_id');
		} else {
			View.showMessage(getMessage('errorSelectFromScenario'));
			return;
		}
		
		this.copyScenarioForm.refresh(null, true);

		this.copyScenarioForm.setFieldValue('from_portfolio_scenario_id',from_portfolio_scenario_id);

        this.copyScenarioForm.showInWindow({
			newRecord: true,
            closeButton: true
        });
	},

	scenarioGrid_onDeleteScenario: function() {
		var portfolio_scenario_id = "";

		this.gridRow = this.scenarioGrid.gridRows.get(this.scenarioGrid.selectedRowIndex);

		if(this.gridRow != null){
			portfolio_scenario_id = this.gridRow.getFieldValue('portfolio_scenario.portfolio_scenario_id');
		} else {
			View.showMessage(getMessage('errorSelectScenarioToDelete'));
			return;
		}

		if (portfolio_scenario_id != "") {

			if (portfolio_scenario_id == "Baseline") {
				View.showMessage(getMessage('errorDeleteBaselineScenario'));
				return;
			}

            View.confirm(getMessage('confirmDeleteExistingScenario') + ' ' + portfolio_scenario_id, function(button){
                if (button == 'yes') {
					allocScenarioController.performDeleteScenario(portfolio_scenario_id);
                } else {
                    return;
				}
            })
		}
	},

	copyInventoryForm_onSave: function() {
		var to_portfolio_scenario_id = this.copyInventoryForm.getFieldValue('gp.portfolio_scenario_id');

		if (this.gridDs.getRecords('portfolio_scenario.portfolio_scenario_id = \'' + to_portfolio_scenario_id + '\'').length <= 0) {
			View.showMessage(getMessage('error_invalid_scenario'));
			return false;
		}

		var date_start = this.copyInventoryForm.getFieldValue('gp.date_start');
		var date_end = this.copyInventoryForm.getFieldValue('gp.date_end');

		if ((date_start == "") || (date_end == "")) {
			View.showMessage(getMessage('error_no_dates'));
			return false;
		}
		var record = this.copyInventoryForm.getRecord();
	    var date_start_test = record.getValue('gp.date_start');
		var date_end_test = record.getValue('gp.date_end');
		if (date_end_test <= date_start_test) {
			View.showMessage(getMessage('errorDateEnd'));
			return false;
        }

		View.confirm(getMessage('confirmOverwriteTargetScenarioData'), function(button){
			if (button == 'yes') {
				allocScenarioController.performCopyGroupInventoryToScenario(date_start,date_end,to_portfolio_scenario_id);
			} else {
				return;
			}
		})
	},

	copyScenarioForm_onSave: function() {
		var from_portfolio_scenario_id = this.copyScenarioForm.getFieldValue('from_portfolio_scenario_id');
		var to_portfolio_scenario_id = this.copyScenarioForm.getFieldValue('to_portfolio_scenario_id');

		if (from_portfolio_scenario_id == to_portfolio_scenario_id) {
			View.showMessage(getMessage('errorSameScenarios'));
			return;
		}
		if (to_portfolio_scenario_id == '') {
			View.showMessage(getMessage('errorSelectToScenario'));
			return;
		}

		var scenario_exists = "";

		// if the scenario is existing we mark the parameter
		if (this.gridDs.getRecords('portfolio_scenario.portfolio_scenario_id = \'' + to_portfolio_scenario_id + '\'').length > 0) {
            View.confirm(getMessage('confirmOverwriteExistingScenario') + ' ' + to_portfolio_scenario_id, function(button){
                if (button == 'yes') {
					scenario_exists = "Y";
					allocScenarioController.performCopyScenario(from_portfolio_scenario_id,to_portfolio_scenario_id,scenario_exists);
                } else {
                    return;
				}
            })
		} else {
		// if the scenario is new we also mark the parameter
			scenario_exists = "N";
			allocScenarioController.performCopyScenario(from_portfolio_scenario_id,to_portfolio_scenario_id,scenario_exists);
		}
	},

	performCopyScenario: function(from_portfolio_scenario_id,to_portfolio_scenario_id,scenario_exists) {

		View.openProgressBar("Updating...");

        try {
			var result =  Workflow.callMethod(
				'AbRPLMGroupSpaceAllocation-PortfolioForecastingService-copyScenario',from_portfolio_scenario_id,to_portfolio_scenario_id,scenario_exists);
			View.closeProgressBar();
			this.copyScenarioForm.closeWindow();
			this.scenarioGrid.refresh();

        } catch (e) {
			View.closeProgressBar();
            Workflow.handleError(e);
        }
	},

	performCopyGroupInventoryToScenario: function(date_start,date_end,to_portfolio_scenario_id) {

		View.openProgressBar("Updating...");

        try {
			var result =  Workflow.callMethod(
				'AbRPLMGroupSpaceAllocation-PortfolioForecastingService-copyGroupInventoryToScenario', date_start, date_end, to_portfolio_scenario_id);
			View.closeProgressBar();
			this.copyInventoryForm.closeWindow();

        } catch (e) {
			View.closeProgressBar();
            Workflow.handleError(e);
        }
	},

	performDeleteScenario: function(portfolio_scenario_id) {
		View.openProgressBar("Updating...");

        try {
			var result =  Workflow.callMethod(
				'AbRPLMGroupSpaceAllocation-PortfolioForecastingService-deleteScenario', portfolio_scenario_id);
			View.closeProgressBar();
			this.scenarioGrid.refresh();

        } catch (e) {
            Workflow.handleError(e);
        }			
	},

	scenarioGrid_multipleSelectionColumn_onClick: function(row){
		if(this.gridRow != null){
			this.gridRow.select(false);
		}
		if(row.isSelected()){
			this.gridRow = row;
		}
		else{
			this.gridRow = null;
		}
	}
});
