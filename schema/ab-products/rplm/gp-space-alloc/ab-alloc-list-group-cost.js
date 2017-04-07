var allocListGroupCostcontroller = View.createController('allocListGroupCost', {

	afterInitialDataFetch: function() {
		setPortfolioScenario();
	},

	allocGroupConsole_onFilter : function() {
		this.restoreSelection();
	},
    
	restoreSelection: function(){
		allocCommonController.recalculateCostsSingle();

		this.restrictView();
	},

    allocGroupConsole_onCalculate : function() {
		calculateCostsSingle(this.tabs.wizard.getBl());

		this.restrictView();
	},

	restrictView: function(){
		var restArray = this.getConsoleRestriction();

		try {
			this.groupGrid.refresh(restArray["restriction"]);
		} catch (e) {
			Workflow.handleError(e);
		}

		this.allocGroupConsole.setTitle(restArray["title"]);
	},

	getConsoleRestriction: function() {
		var restriction = "";
		var title = "";

		var console = View.panels.get('allocGroupConsole');
		var bl_id = this.tabs.wizard.getBl();
		var dateReport = console.getFieldValue('gp.date_start');
		var portfolio_scenario_id = console.getFieldValue('gp.portfolio_scenario_id');

		if (bl_id != "") {
			title = trim(title + " " + getMessage('buildingTitle') + " " + bl_id);
			restriction = addRestriction(restriction," gp.bl_id ='" + bl_id + "'");
		}
		if (portfolio_scenario_id != "") {
			title = trim(title + " " + getMessage('portfolioScenarioTitle') + " " + portfolio_scenario_id);
			restriction = addRestriction(restriction," gp.portfolio_scenario_id ='" + portfolio_scenario_id + "'");
		}
		if (dateReport != "") {
			title = trim(title + " " + getMessage('reviewDateTitle') + " " + dateReport);
			restriction=addRestriction(restriction,getDateRestriction(dateReport));
        }

		var restArray = new Array();
		restArray["restriction"]=restriction;
		restArray["title"]=title;
		return restArray;
	}
});

function localRestoreSelection(){
	allocListGroupCostcontroller.restoreSelection();
}

function matchReviewDate () {
	var console = View.panels.get('allocCostConsole');
	var record = console.getRecord();
	var date_start = record.getValue('cost_tran_recur.date_start');
	var dateStart = console.getFieldValue('cost_tran_recur.date_start');
	console = View.panels.get('allocGroupConsole');
	record = console.getRecord();
	if (record.getValue('gp.date_start') == '') {
		record.setValue('gp.date_start', dateStart);
		console.onModelUpdate();
	}
}