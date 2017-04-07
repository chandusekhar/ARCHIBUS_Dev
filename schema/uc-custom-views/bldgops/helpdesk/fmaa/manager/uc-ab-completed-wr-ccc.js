function apply_console_restriction() {
    var console = View.panels.get("requestConsole");
    var restriction = " 1=1 ";

    var date_from = console.getFieldValue('uc_wr_audit.date_modified.from');
    if (date_from != '') {
        restriction += " AND date_modified >= " + restLiteral(date_from);
    }

    var date_to = console.getFieldValue('uc_wr_audit.date_modified.to');
    if (date_to != '') {
        restriction += " AND date_modified <= " + restLiteral(date_to);
    }

    var reportView = View.panels.get("abViewdefSummaryGrid");
    reportView.refresh(restriction);
    var chartView = View.panels.get("abViewdefSummaryChart_detailsPanel");
    chartView.show();
    chartView.refresh(restriction);
}

function showRecords() {

    var console = View.panels.get("abViewdefSummaryChart_detailsPanel");
    var restriction = " 1=1 ";

    var afm_user_name = console.getFieldValue('uc_wr_audit.afm_user_name');
    if (afm_user_name != '') {
        restriction += " AND afm_user_name = " + restLiteral(afm_user_name);
    }

    // apply restriction 
    View.panels.get("abViewdefSummaryChart_detailsPanel").refresh(restriction);
}

function restLiteral(value) {
    return "'" + value.replace(/'/g, "'") + "'";
}