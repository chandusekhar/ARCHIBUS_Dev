var abOndemandReportTradeChartController = View.createController('abOndemandReportTradeChartController', {
	yearValue:'',
	restriction: '',

	afterViewLoad: function() {
        var openerController = View.getOpenerView().controllers.get(0);
        if (openerController) {
			this.abOndemandReportTradeChart.addParameter('year' , openerController.yearValue);
			this.abOndemandReportTradeChart.refresh();
			this.restriction = openerController.restriction;
			this.yearValue = openerController.yearValue;
        }
    }
})


/**
 * Call when we click the bar chart,the file is 'ab-ondemand-report-tabs-chart.axvw'
 * @param {Object} obj
 */
function onBarChartClick(obj){
	var groupOption = obj.selectedChartData['hwr.tr_id'];
	var nullValueTitle = obj.selectedChartData['nullValueTitle'];

	if(groupOption != nullValueTitle){
		abOndemandReportTradeChartController.trId = groupOption;
	}
	else{
		abOndemandReportTradeChartController.trId = "null";
	}

    View.openDialog('ab-ondemand-report-tr-chart-popup-chart.axvw', null, false, {
        width: 600,
        height: 400
    });
}
