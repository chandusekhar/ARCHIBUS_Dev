// CHANGE LOG:
// 2015/11/26 - MSHUSSAI - added requestConsole_onSelectCf() function to fix issue with Craftperson field not populating from pop up window and changed wrcf.cf_id to wrcfhwrcf.cf_id

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
		//ABODC_populateYearConsole("wrhwr","date_requested","selectYear");
        
	},
    	//setup selectbox for Work Unit (tr_id)
	

});

function apply_console_restriction() {
    var console = View.panels.get("requestConsole");
    var restriction = " other_rs_type like ('LOAD%') ";


   
	var date_from = console.getFieldValue('wr_other.date_status_changed.from');
	var date_to = console.getFieldValue('wr_other.date_status_changed.to');

	if(date_from != '' || date_to != ''){
		if (date_from != '') {
			restriction += " AND wr_other.date_status_changed >= "+restLiteral(date_from);
		}
		if (date_to != '') {
			restriction += " AND wr_other.date_status_changed <= "+restLiteral(date_to);
		}
	}

    var reportView = View.panels.get("reportPanel");
    reportView.addParameter('consoleRest', restriction);
    reportView.refresh();
}

function restLiteral(value) {
	return "'"+value.replace(/'/g, "'")+"'";
}


function literalOrNull(val, emptyString) {
    if(val == undefined || val == null)
        return "NULL";
    else if (!emptyString && val == "")
        return "NULL";
    else
        return "'" + val.replace(/'/g, "''") + "'";
}