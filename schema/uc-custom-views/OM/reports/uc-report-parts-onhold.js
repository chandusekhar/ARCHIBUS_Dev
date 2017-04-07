var ucPartsOnHold =  View.createController("ucPartsOnHold",{
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
		restriction = " EXISTS(select 1 from wr where wr.wr_id=wr_other.wr_id AND 1=1 ";
		
		if (date_from != '') {
			restriction += " AND wr.date_requested >= "+restLiteral(date_from);
		}		
		if (date_to != '') {
			restriction += " AND wr.date_requested <= "+restLiteral(date_to);
		}
		restriction += " ) ";
	}
	
	

    var reportView = View.panels.get("reportPanel");
    reportView.refresh(restriction);
}

function restLiteral(value) {
	return "'"+value.replace(/'/g, "'")+"'";
}