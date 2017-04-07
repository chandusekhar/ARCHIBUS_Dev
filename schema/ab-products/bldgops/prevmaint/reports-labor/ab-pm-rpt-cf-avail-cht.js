var cfAvailChartController = View.createController('cfAvailChartController', {
    afterInitialDataFetch: function(){
        var openerController = View.getOpenerView().controllers.get('cfAvailController');
        var selectedDate = openerController.selectedDate;
        var title = getMessage('resavailReportTitle') + " " + selectedDate;
        setPanelTitle('cf_avail_chart', title);
    }
});
function showDetail(obj){
    var cfId = obj.selectedChartData['resavail.cf_id'];
    var openerController = View.getOpenerView().controllers.get('cfAvailController');
    var selectedDate = openerController.selectedDate;
    var restriction = new Ab.view.Restriction();
    restriction.addClause("wrcf.cf_id", cfId, "=");
    restriction.addClause("wrcf.date_assigned", selectedDate, "=");
    var detailPanel = View.panels.get('cf_avail_wrcf_report');
    detailPanel.refresh(restriction);
    detailPanel.show(true);
    detailPanel.showInWindow({
        width: 800,
        height: 600
    });
}
