var ucPartsOnHoldCycleTime =  View.createController("ucPartsOnHoldCycleTime",{
	afterViewLoad: function() {
		this.inherit();

		View.setToolbarButtonVisible('printButton', false);
		View.setToolbarButtonVisible('emailButton', false);
		View.setToolbarButtonVisible('alterButton', false);
		View.setToolbarButtonVisible('favoritesButton', false);
    },

	afterInitialDataFetch: function(){
		//ABODC_populateYearConsole("wrhwr","date_requested","selectYear");
	},

	consolePanel_afterRefresh: function(){}
});

function onCrossTableClick(obj){
    var restriction = obj.restriction;

    var console = View.panels.get("requestConsole");
    var date_from = console.getFieldValue('wrhwr.date_requested.from');
	if (date_from != '') {
		restriction.addClause("wrhwr.date_requested", restLiteral(date_from), ">=");
	}

	var date_to = console.getFieldValue('wrhwr.date_requested.to');
	if (date_to != '') {
		restriction.addClause("wrhwr.date_requested", restLiteral(date_to), "<=");
	}


    View.openDialog("uc-ondemand-report-requests-reactive.axvw", restriction);
}

function apply_console_restriction() {
    var console = View.panels.get("requestConsole");
    var restriction = " 1 = 1 ";

	var date_from = console.getFieldValue('wrhwr.date_requested.from');
	if (date_from != '') {
		restriction += " AND wrhwr.date_requested >= "+restLiteral(date_from);
	}

	var date_to = console.getFieldValue('wrhwr.date_requested.to');
	if (date_to != '') {
		restriction += " AND wrhwr.date_requested <= "+restLiteral(date_to);
	}

    var reportView = View.panels.get("partsCycleTime_chart");
    reportView.refresh(restriction);
}

function restLiteral(value) {
	return "'"+value.replace(/'/g, "'")+"'";
}