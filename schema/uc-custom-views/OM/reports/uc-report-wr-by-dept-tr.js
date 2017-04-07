var ucOnDemandReportByDepartmentWorkUnit =  View.createController("ucOnDemandReportByDepartmentWorkUnit",{
	afterViewLoad: function() {
		this.inherit();

		View.setToolbarButtonVisible('printButton', false);
		View.setToolbarButtonVisible('emailButton', false);
		View.setToolbarButtonVisible('alterButton', false);
		View.setToolbarButtonVisible('favoritesButton', false);

        this.reportPanel.getItemHtml = function(cellId, cellValue, clickable) {
            if (cellId.match(/_f3/) != null) {
                // blank line column
                cellValue = "";
            }

            var cellStyle = "";

            if (!valueExists(clickable)) {
                clickable = this.clickable;
            }
            if (clickable) {
                return ('<a id="' + cellId + '" '+cellStyle+'href="javascript: //">' + cellValue + '</a>');
            } else {
                return ('<span id="' + cellId + '"'+cellStyle+'>' + cellValue + '</span>');
            }
        }
    },

	afterInitialDataFetch: function(){
		//ABODC_populateYearConsole("wrhwr","date_requested","selectYear");
        this.userTrade = getUserTrade();
        this.requestConsole.setFieldValue('cf.tr_id', this.userTrade);
	}
});

function onCrossTableClick(obj){
    var clickedRestriction = obj.restriction;
    var viewRestriction = View.panels.get('reportPanel').restriction;
    var restriction = View.panels.get('reportPanel').restriction;

    // build restriction
    var dept = clickedRestriction.findClause('wrhwr.dept');
    if(dept != null){
        restriction += " AND SUBSTRING(ac_id, CHARINDEX('-', ac_id, CHARINDEX('-', ac_id, 0)+1)+1 , 5) = "+restLiteral(dept["value"]);
    }

    var trId = clickedRestriction.findClause('wrhwr.tr_id');
    if(trId != null){
        restriction += " AND tr_id = "+restLiteral(trId["value"]);
    }

    View.openDialog("uc-report-wr-by-dept-tr-details.axvw", restriction);
}

function apply_console_restriction() {
    var console = View.panels.get("requestConsole");
    var restriction = " 1 = 1 ";

	var date_from = console.getFieldValue('wrhwr.date_requested.from');
    var dateFromObj = new Date(date_from);
	if (date_from != '') {
		restriction += " AND wrhwr.date_requested >= "+restLiteral(date_from);
	}

	var date_to = console.getFieldValue('wrhwr.date_requested.to');
    var dateToObj;
	if (date_to != '') {
		restriction += " AND wrhwr.date_requested <= "+restLiteral(date_to);
        dateToObj = new Date(date_to);
	}

    var tr_id = console.getFieldValue('wrhwr.tr_id');
    if (tr_id != '') {
        restriction += " AND wrhwr.tr_id = "+restLiteral(tr_id);
    }

    var reportView = View.panels.get("reportPanel");
    reportView.refresh(restriction);
}

function restLiteral(value) {
	return "'"+value.replace(/'/g, "'")+"'";
}

function getUserTrade() {
    var tr_id = null;
    var email = View.user.email;
    if (email != "") {
        tr_id = UC.Data.getDataValue('cf', 'tr_id', "email="+restLiteral(email));
    }
    return tr_id;
}