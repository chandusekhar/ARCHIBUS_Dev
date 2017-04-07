var ucAbatementIMPSummaryCtrl =  View.createController("ucAbatementIMPSummaryCtrl",{
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
    var probClause = restriction.findClause('wrhwr.prob_type');
    if(probClause != null && probClause.value != 'PREVENTIVE MAINT'){
        restriction.removeClause('wrhwr.prob_type');
        restriction.addClause("wrhwr.prob_type", 'PREVENTIVE MAINT', '<>',null ,true);
    }
    View.openDialog("", restriction);
}

function apply_console_restriction() {
    var console = View.panels.get("requestConsole");
    var restriction = " 1=1 ";

    var selectedType = $("summaryTypeSelect").value;

    switch(selectedType) {
    case "IMP":
        restriction = " PARSENAME(REPLACE(wrhwr.ac_id, '-IMP', '.IMP'), 1) LIKE 'IMP%' ";
        break;
    case "ASB":
        restriction = " wrhwr.tr_id = 'ASB - MGMT' "
        break;
    }

	var date_from = console.getFieldValue('wrhwr.date_requested.from');
	if (date_from != '') {
		restriction += " AND wrhwr.date_requested >= "+restLiteral(date_from);
	}

	var date_to = console.getFieldValue('wrhwr.date_requested.to');
	if (date_to != '') {
		restriction += " AND wrhwr.date_requested <= "+restLiteral(date_to);
	}

    var reportView = View.panels.get("reportPanel");
    reportView.addParameter("wr_rest", restriction);
    reportView.refresh();
}

function restLiteral(value) {
	return "'"+value.replace(/'/g, "'")+"'";
}