var ucWrhwr62030 =  View.createController("ucWrhwr62030",{
	afterViewLoad: function() {
		this.inherit();

		View.setToolbarButtonVisible('printButton', false);
		View.setToolbarButtonVisible('emailButton', false);
		View.setToolbarButtonVisible('alterButton', false);
		View.setToolbarButtonVisible('favoritesButton', false);
    },

	afterInitialDataFetch: function(){
		//ABODC_populateYearConsole("wrhwr","date_requested","selectYear");
	}
});

function apply_console_restriction() {
    var console = View.panels.get("requestConsole");
    var restriction = " 1 = 1 ";

	var date_from = console.getFieldValue('wrhwr.date_requested.from');
	var date_to = console.getFieldValue('wrhwr.date_requested.to');

	if(date_from != '' || date_to != ''){
		if (date_from != '') {
			restriction += " AND wrhwr.date_requested >= "+restLiteral(date_from);
		}
		if (date_to != '') {
			restriction += " AND wrhwr.date_requested <= "+restLiteral(date_to);
		}
	}

    var reportView = View.panels.get("reportPanel");
    reportView.addParameter('dateRest', restriction);
    reportView.refresh();
}

function restLiteral(value) {
	return "'"+value.replace(/'/g, "'")+"'";
}