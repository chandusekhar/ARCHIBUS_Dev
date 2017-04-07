var ucPartsCycleTimeByTr =  View.createController("ucPartsCycleTimeByTr",{
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
	var date_to = console.getFieldValue('wrhwr.date_requested.to');
	var tr_id = obj.restriction.clauses[0].value;
	
	if(date_from != '' || date_to != '' || tr_id != ''){
		restriction = " EXISTS(select 1 from wrhwr where wrhwr.wr_id=wrotherhwrother.wr_id AND 1=1 AND (other_rs_type LIKE 'PARTS%' OR other_rs_type LIKE 'MISC')";
		
		if (date_from != '') {
			restriction += " AND wrhwr.date_requested >= "+restLiteral(date_from);
		}		
		if (date_to != '') {
			restriction += " AND wrhwr.date_requested <= "+restLiteral(date_to);
		}
		if (tr_id != '') {
			restriction += " AND wrhwr.tr_id = "+restLiteral(tr_id);
		}
		restriction += " ) ";
	}

    View.openDialog("uc-report-parts-dialog.axvw", restriction);
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

    var reportView = View.panels.get("reportPanel");
    reportView.refresh(restriction);
}

function restLiteral(value) {
	return "'"+value.replace(/'/g, "'")+"'";
}