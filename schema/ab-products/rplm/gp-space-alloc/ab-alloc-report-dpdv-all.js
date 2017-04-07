var allocDpDvController = View.createController('allocDpDv',{

	afterInitialDataFetch: function() {
		setCurrentDate();
		setPortfolioScenario();
		this.restoreSelection();
	},

	allocGroupConsole_onFilter : function() {
		if (checkConsoleFields()) {
			this.restoreSelection();
		}
	},

	restoreSelection: function() {
		if (document.getElementById("autoCalculateCosts")!=null){
			allocCommonController.recalculateCostsAll();
		}
		this.restrictView();
	},

	allocGroupConsole_onCalculate : function() {
		calculateCostsAll();

		this.restrictView();
	},

	restrictView: function(){
		var restArray = this.getConsoleRestriction();

		this.dpAnalysis.refresh(restArray["restriction"]);

		this.allocGroupConsole.setTitle(restArray["title"]);
	},

	getConsoleRestriction: function() {
		var restriction = "";
		var title = "";

		var console = View.panels.get('allocGroupConsole');
		var site_id = console.getFieldValue('bl.site_id');
		var bl_id = console.getFieldValue('gp.bl_id');
		var dateReport = console.getFieldValue('gp.date_start');
		var portfolio_scenario_id = console.getFieldValue('gp.portfolio_scenario_id');

		if (site_id != "") {
			title = getMessage('siteTitle') + " " + site_id;
			restriction = addRestriction(restriction," gp.bl_id in (SELECT bl_id from bl where site_id ='" + site_id + "')");
		}
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

function localRestoreSelection(){
	allocDpDvController.restoreSelection();
}