var trAvailRptChtController = View.createController('trAvailRptChtController', {
    afterInitialDataFetch: function(){
        var openerController = View.getOpenerView().controllers.get('trAvailRptController');
        var selectedDate = openerController.clickedDate.substr(0,10);
        var title = getMessage('resavailReportTitle') + " " + selectedDate;
        setPanelTitle('abBldgopsReportTrAvailChtChart', title);
		var restriction = openerController.otherRes + " AND " + openerController.dateField + "=${sql.date('"+selectedDate+"')} ";
		this.abBldgopsReportTrAvailChtChart.addParameter('otherRes', restriction);
		this.abBldgopsReportTrAvailChtChart.refresh();
    }
});