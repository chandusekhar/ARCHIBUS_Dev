var abOndRptWrbyDaysOpenController = View.createController('abOndRptWrbyDaysOpenController', {
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
        /*
        var firstColumn = document.getElementById('reportPanel_column_c0');
        if (firstColumn != null){
            if(firstColumn.innerText == undefined
                    || firstColumn.innerText == 'undefined'){
                firstColumn.innerHTML = "N/A";
            }
        }
        */
    }
});

function onCrossTableClick(obj){
    var restrictionObj = obj.restriction;
    var restriction = "status NOT IN ('Clo','Com','FWC')";

    var trClause = restrictionObj.findClause("wr.tr_id");
    if (trClause != null) {
        restriction += " AND tr_id = '"+trClause.value.replace(/'/g,"''")+"'";
    }

    // if period restriction exists, add the date clauses
    var periodClause = restrictionObj.findClause("wr.period");
    if (periodClause != null) {
        var clauseValue = periodClause.value;
        switch (clauseValue) {
        case '365+ Days':
            restriction += " AND DATEDIFF(d, wr.date_requested, GETDATE()) > 365";
            break;
        case '181-365 Days':
            restriction += " AND DATEDIFF(d, wr.date_requested, GETDATE()) BETWEEN 181 AND 365";
            break;
        case '091-180 Days':
            restriction += " AND DATEDIFF(d, wr.date_requested, GETDATE()) BETWEEN 91 AND 180";
            break;
        case '060-90 Days':
            restriction += " AND DATEDIFF(d, wr.date_requested, GETDATE()) BETWEEN 61 AND 90";
            break;
        case '031-60 Days':
            restriction += " AND DATEDIFF(d, wr.date_requested, GETDATE()) BETWEEN 31 AND 60";
            //restriction.addClause('wr.date_requested', "DATEADD(d, -30, CAST( FLOOR( CAST( GETDATE() AS FLOAT ) ) AS DATETIME ))", "&gt;");
            break;
        case '021-30 Days':
            restriction += " AND DATEDIFF(d, wr.date_requested, GETDATE()) BETWEEN 21 AND 30";
            /*
            restriction.addClause('wr.date_requested', "DATEADD(d, -20, CAST( FLOOR( CAST( GETDATE() AS FLOAT ) ) AS DATETIME ))", "&gt;");
            restriction.addClause('wr.date_requested', "DATEADD(d, -30, CAST( FLOOR( CAST( GETDATE() AS FLOAT ) ) AS DATETIME ))", "&lt;=");
            */
            break;
        case '011-20 Days':
            restriction += " AND DATEDIFF(d, wr.date_requested, GETDATE()) BETWEEN 11 AND 20";
            //restriction.addClause('wr.date_requested', "DATEADD(d, -10, CAST( FLOOR( CAST( GETDATE() AS FLOAT ) ) AS DATETIME ))", "&gt;");
            //restriction.addClause('wr.date_requested', "DATEADD(d, -20, CAST( FLOOR( CAST( GETDATE() AS FLOAT ) ) AS DATETIME ))", "&lt;=");
            break;
        case '01-10 Days':
            restriction += " AND DATEDIFF(d, wr.date_requested, GETDATE()) <= 10";
            //restriction.addClause('wr.date_requested', "DATEADD(d, -10, CAST( FLOOR( CAST( GETDATE() AS FLOAT ) ) AS DATETIME ))", "&lt;=");
            break;
        case '':
            restriction += " AND date_requested IS NULL";
            break;
        }
    }

	if (abOndRptWrbyDaysOpenController.zone_restriction != null) {
		restriction += abOndRptWrbyDaysOpenController.zone_restriction;
	}


    View.openDialog("uc-ondemand-report-requests-open.axvw", restriction);

}

function apply_console_restriction() {
	var console = View.panels.get("requestConsole");
	var restriction = " 1 = 1 ";

	var zone_id = console.getFieldValue('wr.zone_id');
	if (zone_id != '') {
		restriction += " AND EXISTS (SELECT 1 FROM bl WHERE bl.bl_id = wr.bl_id AND zone_id =  "+restLiteral(zone_id) + ")";
		abOndRptWrbyDaysOpenController.zone_restriction = " AND EXISTS (SELECT 1 FROM bl WHERE bl.bl_id = wr.bl_id AND zone_id =  "+restLiteral(zone_id) + ")";
	}
	else {
		abOndRptWrbyDaysOpenController.zone_restriction = null;
	}

    var use1 = console.getFieldValue('bl.use1');
	if (use1 != '') {
		restriction += " AND EXISTS (SELECT 1 FROM bl WHERE bl.bl_id = wr.bl_id AND use1 =  "+restLiteral(use1) + ")";
		abOndRptWrbyDaysOpenController.zone_restriction += " AND EXISTS (SELECT 1 FROM bl WHERE bl.bl_id = wr.bl_id AND use1 =  "+restLiteral(use1) + ")";
	}


	var reportView = View.panels.get("reportPanel");
	reportView.refresh(restriction);
}

function restLiteral(value) {
	return "'"+value.replace(/'/g, "'")+"'";
}