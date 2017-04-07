var abBldgopsReportArchivedWrCostByProbtypeSumaryDashController = View.createController('abBldgopsReportArchivedWrCostByProbtypeSumaryDashController', {
	afterViewLoad: function() {
		var panel=this.abBldgopsReportArchivedWrCostByProbtypeCrosstable;
		var openCtrl = getDashMainController("dashCostAnalysisMainController");
		var chartCtrl = View.getOpenerView().controllers.get("abBldgopsReportArchivedWrCostByProbtypeDashController"); 
		if (!openCtrl) {
			openCtrl = chartCtrl;  
		}
		panel.addParameter('monthStart', openCtrl.dateStart);
		panel.addParameter('monthEnd', openCtrl.dateEnd);
		panel.addParameter('otherRes', chartCtrl.otherRes);
		panel.refresh();      
		panel.show(true); 
    }
})