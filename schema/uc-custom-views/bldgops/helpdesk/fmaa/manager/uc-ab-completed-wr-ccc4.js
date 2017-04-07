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

    restriction += " AND status_new = 'Com' AND afm_user_name IN(select user_name from afm_users where role_name = 'UC-CSC')";

    var reportView = View.panels.get("abViewdefSummaryGrid");
    var chartView = View.panels.get("abViewdefSummaryChart_detailsPanel");
    reportView.refresh(restriction);
    chartView.refresh(restriction);
}

function showSummaryChartPopup(obj) {
    var console = View.panels.get("requestConsole");
    var str = "";
    var restriction = " 1=1 ";

    var date_from = console.getFieldValue('uc_wr_audit.date_modified.from');
    if (date_from != '') {
        restriction += " AND date_modified >= " + restLiteral(date_from);
    }

    var date_to = console.getFieldValue('uc_wr_audit.date_modified.to');
    if (date_to != '') {
        restriction += " AND date_modified <= " + restLiteral(date_to);
    }

    for (var name in obj.selectedChartData) {
        str = str + obj.selectedChartData[name];
        str = str.replace(/[0-9]/g, '');
        str = str.replace(/no value/g, '');
        str = str.replace(/[{()}]/g, '');
    }
    
    var afm_user_name = str;
    
    if (afm_user_name != '') {
       restriction += " AND afm_user_name = " + restLiteral(afm_user_name);
    }

    restriction += " AND status_new = 'Com'";

    // apply restriction
    var chartView = View.panels.get("panel_abViewdefSummaryChart_popup");
    chartView.refresh(restriction);
}

function restLiteral(value) {
    return "'" + value.replace(/'/g, "'") + "'";
}