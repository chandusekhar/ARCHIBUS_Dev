var ttAvailRptChtController = View.createController('ttAvailRptChtController', {
    afterInitialDataFetch: function(){
        var openerController = View.getOpenerView().controllers.get('ttAvailRptController');
        var selectedDate = openerController.clickedDate.substr(0,10);
        var title = getMessage('resavailReportTitle') + " " + selectedDate;
        setPanelTitle('abBldgopsReportTtAvailChtChart', title);
		var restriction = openerController.otherRes + " AND " + openerController.dateField + "=${sql.date('"+selectedDate+"')} ";
		this.abBldgopsReportTtAvailChtChart.addParameter('otherRes', restriction);
		this.abBldgopsReportTtAvailChtChart.refresh();
    }
});