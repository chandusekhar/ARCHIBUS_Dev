var abOndemandReportTradeChartPopupController = View.createController('abOndemandReportTradeChartPopupController', {

	afterViewLoad: function() {
        var openerController = View.getOpenerView().controllers.get(0);
        if (openerController) {
			this.abOndemandReportTradeChartPopup.addParameter('year' , openerController.yearValue);
			this.abOndemandReportTradeChartPopup.addParameter('trId' , openerController.trId);
			this.abOndemandReportTradeChartPopup.refresh();
        }
    }
})