var allocBlDvController = View.createController('allocBlDv',{

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

	restoreSelection: function(){
		if(document.getElementById("autoCalculateCosts") != null) {
			allocCommonController.recalculateCostsAll();
		}
		this.restrictView();
	},

	allocGroupConsole_onCalculate : function() {
		calculateCostsAll();

		this.restoreSelection();
	},

	restrictView: function(){
		var restArray = this.getConsoleRestriction();

		this.abViewdefSummaryReport_detailsPanel.refresh(restArray["restriction"]);

		this.allocGroupConsole.setTitle(restArray["title"]);
	},

	getConsoleRestriction: function() {
		var restriction = "";
		var title = "";

		var console = View.panels.get('allocGroupConsole');
		var dv_id = console.getFieldValue('gp.dv_id');
		var dateReport = console.getFieldValue('gp.date_start');
		var portfolio_scenario_id = console.getFieldValue('gp.portfolio_scenario_id');

		if (dv_id != "") {
			title = getMessage('divisionTitle') + " " + dv_id;
			restriction = addRestriction(restriction," gp.dv_id ='" + dv_id + "'");
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

function onClickEvent(obj){
    var groupGrid = View.panels.get('gpGrid');
	var restPart = "";

    //var restriction = new Ab.view.Restriction();

    for (var i = 0; i < obj.restriction.clauses.length; i++) {
        var clause = obj.restriction.clauses[i];
		restPart = restPart + " AND " + clause.name + clause.op + "'" + clause.value + "'";
    }

	// Get the restriction that applies to the view.
	var restArray = allocBlDvController.getConsoleRestriction();
    
	if (restArray["restriction"] != "") {
		restriction = restArray["restriction"] + restPart;
	}

	groupGrid.refresh(restriction);

    groupGrid.show(true);

    groupGrid.showInWindow({
        width: 600,
        height: 400
    });
}

function localRestoreSelection(){
	allocBlDvController.restoreSelection();
}