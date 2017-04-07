// CHANGE LOG:
// 2016/03/17  -  MSHUSSAI - Created new AXVW file to report on Parts Inventory for MOTORPOOL

var ucWrhwrExec =  View.createController("ucWrhwrExec",{
	afterViewLoad: function() {
		this.inherit();

		View.setToolbarButtonVisible('printButton', false);
		View.setToolbarButtonVisible('emailButton', false);
		View.setToolbarButtonVisible('alterButton', false);
		View.setToolbarButtonVisible('favoritesButton', false);
    },

	requestConsole_onClear: function(){
		this.requestConsole.clear();		
	},

	afterInitialDataFetch: function(){
		
        
	}
});

function apply_console_restriction() {
    var console = View.panels.get("requestConsole");
    var restriction = " 1 = 1 ";

    var restriction = "1=1";


	var date_from = console.getFieldValue('wrpthwrpt.date_assigned.from');
	var date_to = console.getFieldValue('wrpthwrpt.date_assigned.to');

	if(date_from != '' || date_to != ''){
		if (date_from != '') {
			restriction += " AND wrpthwrpt.date_assigned >= "+restLiteral(date_from);
		}
		if (date_to != '') {
			restriction += " AND wrpthwrpt.date_assigned <= "+restLiteral(date_to);
		}
	}

    var reportView = View.panels.get("reportPanel");
    reportView.addParameter('consoleRest', restriction);
    reportView.refresh();
}

function restLiteral(value) {
	return "'"+value.replace(/'/g, "'")+"'";
}