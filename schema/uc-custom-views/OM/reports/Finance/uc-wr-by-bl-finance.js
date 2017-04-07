var ucLsExpire =  View.createController("ucLsExpire",{
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

    var console = View.panels.get("lsConsole");
    var restriction = " 1 = 1 ";

	var fiscalyear = console.getFieldValue('uc_wr_finance_charges_by_bl.FiscalYear');
	var is_pmp = console.getFieldValue('uc_wr_finance_charges_by_bl.is_pmp');
	var charge_type = console.getFieldValue('uc_wr_finance_charges_by_bl.charge_type');
	var bl_id = console.getFieldValue('uc_wr_finance_charges_by_bl.bl_id');


	
	if (fiscalyear != '') {
		restriction += " AND uc_wr_finance_charges_by_bl.FiscalYear = "+restLiteral(fiscalyear);
	}
	if (is_pmp != '') {
		restriction += " AND uc_wr_finance_charges_by_bl.is_pmp = "+restLiteral(is_pmp);
	}
	if (charge_type != '') {
		restriction += " AND uc_wr_finance_charges_by_bl.charge_type = "+restLiteral(charge_type);
	}
	if (bl_id != '') {
		restriction += " AND uc_wr_finance_charges_by_bl.bl_id  = "+restLiteral(bl_id);
	}

    var reportView = View.panels.get("abViewdefReport_detailsPanel");
    reportView.addParameter('dateRest', restriction);
    reportView.refresh();
}

function restLiteral(value) {
	return "'"+value.replace(/'/g, "'")+"'";
}