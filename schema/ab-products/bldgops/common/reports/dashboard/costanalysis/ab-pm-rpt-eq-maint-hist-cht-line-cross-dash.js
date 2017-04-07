var eqHisByEqstdCrossController = View.createController('eqHisByEqstdCrossController', {

	afterViewLoad: function() {
		var panel=this.crosstablePanel;
		var openCtrl = getDashMainController("dashCostAnalysisMainController");
		var chartCtrl = View.getOpenerView().controllers.get("eqHisLineController"); 
		if (!openCtrl) {
			openCtrl = chartCtrl;  
		}
		panel.addParameter('monthStart', openCtrl.dateStart);
		panel.addParameter('monthEnd', openCtrl.dateEnd);
		panel.addParameter('otherRes', chartCtrl.res);
		panel.refresh();      
		this.crosstablePanel.show(true);
	}
})
