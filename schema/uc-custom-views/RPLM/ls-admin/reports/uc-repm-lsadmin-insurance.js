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

	var date_from = console.getFieldValue('ls.date_ins_end.before');
	var date_to = console.getFieldValue('ls.date_ins_end.after');
	var landlordtenant = console.getFieldValue('ls.landlord_tenant');
	var ins_verified = console.getFieldValue('ls.ins_verified');

	if(date_from != '' || date_to != ''){
		if (date_from != '') {
			restriction += " AND ls.date_ins_end <= "+restLiteral(date_from);
		}
		if (date_to != '') {
			restriction += " AND ls.date_ins_en >= "+restLiteral(date_to);
		}
	}

	
	if (landlordtenant != '') {
		restriction += " AND ls.landlord_tenant = "+restLiteral(landlordtenant);
	}
	if (ins_verified != '') {
		restriction += " AND ls.ins_verified = "+restLiteral(ins_verified);
	}
	

    var reportView = View.panels.get("abViewdefReport_detailsPanel");
    reportView.addParameter('dateRest', restriction);
    reportView.refresh();
}

function restLiteral(value) {
	return "'"+value.replace(/'/g, "'")+"'";
}