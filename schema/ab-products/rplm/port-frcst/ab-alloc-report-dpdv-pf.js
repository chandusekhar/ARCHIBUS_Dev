var allocDpDvController = View.createController('allocDpDv', {

	restoreSelection: function(){
		var restArray = allocDpDvController.getConsoleRestriction();

		this.dpAnalysis.refresh(restArray["restriction"]);

		this.dpAnalysis.setTitle(restArray["title"]);
	},

	getConsoleRestriction: function() {
		var restriction = "";
		var title = "";

		var bl_id = this.tabs.wizard.getBl();
		var fl_id = this.tabs.wizard.getFl();
		var dateReport = this.allocGroupConsole.getFieldValue('gp.date_start');
		var portfolio_scenario_id = this.allocGroupConsole.getFieldValue('gp.portfolio_scenario_id');

		if (bl_id != "") {
			title = trim(title + " " + getMessage('buildingTitle') + " " + bl_id);
			restriction = addRestriction(restriction," gp.bl_id ='" + bl_id + "'");
		}
		if (fl_id != "") {
			title = trim(title + " " + getMessage('floorTitle') + " " + fl_id);
			restriction = addRestriction(restriction," gp.fl_id ='" + fl_id + "'");
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