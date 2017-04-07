var abOndRptWrOver31Controller = View.createController('abOndRptWrOver31Controller', {
    zone_restriction : null,

	afterViewLoad: function() {
		this.inherit();

		View.setToolbarButtonVisible('printButton', false);
		View.setToolbarButtonVisible('emailButton', false);
		View.setToolbarButtonVisible('alterButton', false);
		View.setToolbarButtonVisible('favoritesButton', false);
    },

    afterInitialDataFetch : function() {
        this.setNATitle();
    },

    setNATitle: function() {
        //var firstColumn = Ext.get('reportPanel_column_c0');
        var firstColumn = document.getElementById('reportPanel_column_c0');
        if (firstColumn != null){
            if(firstColumn.innerText == undefined
                    || firstColumn.innerText == 'undefined'){
                firstColumn.innerHTML = "N/A";
            }
        }
    }
});

function onCrossTableClick(obj){
    var restrictionObj = obj.restriction;
	var restriction = "wr.status NOT IN ('Com','Clo','FWC') AND DATEDIFF(d, wr.date_requested, GETDATE()) &gt; 30";

    var trClause = restrictionObj.findClause("wr.tr_id");
    if (trClause != null) {
        restriction += " AND tr_id = '"+trClause.value.replace(/'/g,"''")+"'";
    }

    var statusClause = restrictionObj.findClause("wr.status");
    if (statusClause != null) {
        restriction += " AND status = '"+statusClause.value.replace(/'/g,"''")+"'";
    }

	if (abOndRptWrOver31Controller.zone_restriction != null) {
		restriction += abOndRptWrOver31Controller.zone_restriction;
	}

/*
	//find date 30 back
	var currentDate = new Date();
	var dateminus30 = new Date(currentDate-30);

	var day= dateminus30.getDate();
	var year=dateminus30.getFullYear();
	var month= dateminus30.getMonth();

	var datestring = year + "-" + month + "-" + day;

	//add restriction clause for > 30 days old
	restriction.addClause(
		'wr.date_requested',
		datestring,
		'&lt;=');
*/

    View.openDialog("uc-ondemand-report-requests-open.axvw", restriction);
}

function apply_console_restriction() {
	var console = View.panels.get("requestConsole");
	var restriction = " 1 = 1 ";

	var zone_id = console.getFieldValue('wr.zone_id');
	if (zone_id != '') {
		restriction += " AND EXISTS (SELECT 1 FROM bl WHERE bl.bl_id = wr.bl_id AND zone_id =  "+restLiteral(zone_id) + ")";
		abOndRptWrOver31Controller.zone_restriction = " AND EXISTS (SELECT 1 FROM bl WHERE bl.bl_id = wr.bl_id AND zone_id =  "+restLiteral(zone_id) + ")";
	}
	else {
		abOndRptWrOver31Controller.zone_restriction = null;
	}

	var reportView = View.panels.get("reportPanel");
	reportView.refresh(restriction);
}

function restLiteral(value) {
	return "'"+value.replace(/'/g, "'")+"'";
}