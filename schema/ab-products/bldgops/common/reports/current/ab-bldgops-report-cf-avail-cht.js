var cfAvailRptChtController = View.createController('cfAvailRptChtController', {
    afterInitialDataFetch: function(){
        var openerController = View.getOpenerView().controllers.get('cfAvailRptController');
        var selectedDate = openerController.clickedDate.substr(0,10);
        var title = getMessage('resavailReportTitle') + " " + selectedDate;
        setPanelTitle('abBldgopsReportCfAvailChtChart', title);
		var restriction = openerController.otherRes + " AND " + openerController.dateField + "=${sql.date('"+selectedDate+"')} ";
		this.abBldgopsReportCfAvailChtChart.addParameter('otherRes', restriction);
		this.abBldgopsReportCfAvailChtChart.refresh();
    }
});