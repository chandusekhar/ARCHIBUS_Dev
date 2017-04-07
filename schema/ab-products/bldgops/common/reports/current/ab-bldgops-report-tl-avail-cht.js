var tlAvailRptChtController = View.createController('tlAvailRptChtController', {
    afterInitialDataFetch: function(){
        var openerController = View.getOpenerView().controllers.get('tlAvailRptController');
        var selectedDate = openerController.clickedDate.substr(0,10);
        var title = getMessage('resavailReportTitle') + " " + selectedDate;
        setPanelTitle('abBldgopsReportTlAvailChtChart', title);
		var restriction = openerController.otherRes + " AND " + openerController.dateField + "=${sql.date('"+selectedDate+"')} ";
		this.abBldgopsReportTlAvailChtChart.addParameter('otherRes', restriction);
		this.abBldgopsReportTlAvailChtChart.refresh();
    }
});