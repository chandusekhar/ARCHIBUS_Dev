var allocDpDvController = View.createController('allocDpDv',{

	restoreSelection: function(){
		allocCommonController.recalculateCostsSingle();

		this.restrictView();
	},

    dpAnalysis_onCalculate : function() {
		calculateCostsSingle(this.tabs.wizard.getBl());
	
		this.restrictView();
	},

	restrictView: function(){
		var restArray = this.getConsoleRestriction();

		try {
			this.dpAnalysis.refresh(restArray["restriction"]);
		} catch (e) {
			Workflow.handleError(e);
		}

		this.dpAnalysis.setTitle(restArray["title"]);
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

		restriction=addRestriction(restriction," gp.dv_id IS NOT NULL AND gp.dp_id IS NOT NULL ");

		var restArray = new Array();
		restArray["restriction"]=restriction;
		restArray["title"]=title;
		return restArray;
	}
});