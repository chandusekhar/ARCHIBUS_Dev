
function testWorkflow(){
    var panel = View.panels.get('formPanel');
    var interval = panel.getFieldValue('uc_appa_report_data.interval');
    var period = panel.getFieldValue('uc_appa_report_data.period');
    var date_start = panel.getFieldValue('mo.date_start_req');
    var date_end = panel.getFieldValue('mo.date_end_req');

    try {
        if (interval != "" && period != "" && date_start != "" && date_end != "") {
            var result = Workflow.callMethod('AbCommonResources-ucAppaReportService-calculateAppaData', interval, period, "'"+date_start+"'", "'"+date_end+"'");
            View.showMessage(result.code);
        }
        else {
            View.showMessage("All Fields are required.");
            return;
        }
    }
    catch (e) {
        Workflow.handleError(e);
    }
}