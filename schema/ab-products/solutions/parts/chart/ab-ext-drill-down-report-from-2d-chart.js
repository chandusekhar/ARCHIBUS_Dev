View.createController('test', {
	afterInitialDataFetch: function(){
		var year = '-1';
        var now = new Date();
        this.monthStart = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
        this.monthEnd = (now.getFullYear() + parseInt(year)) + '-' + (now.getMonth() + 1) + '-' + now.getDate();
        this.extDrillDownReportFrom2dChart_chart.addParameter('monthStart', this.monthStart);
        this.extDrillDownReportFrom2dChart_chart.addParameter('monthEnd', this.monthEnd);
		this.extDrillDownReportFrom2dChart_chart.refresh();
    }
});
function onClickEventBldEstArea(obj){
	var report = View.panels.get('extDrillDownReportFrom2dChart_report');
	report.addParameter('restriction2Ctry', obj.selectedChartData['bl.ctry_id']);
	report.addParameter('summaryValueForThisGroup', obj.selectedChartData['afm_cal_dates.month']);
	report.refresh();
	report.showInWindow({
            width: 300, 
            height: 200
        });
}
