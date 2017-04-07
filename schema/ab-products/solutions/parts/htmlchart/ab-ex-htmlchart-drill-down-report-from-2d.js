View.createController('test', {
	afterInitialDataFetch: function(){
		var year = '-1';
        var now = new Date();
        this.monthStart = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
        this.monthEnd = (now.getFullYear() + parseInt(year)) + '-' + (now.getMonth() + 1) + '-' + now.getDate();
        this.extDrillDownReportFrom2dChart_chart.addParameter('monthStart', this.monthStart);
        this.extDrillDownReportFrom2dChart_chart.addParameter('monthEnd', this.monthEnd);
		this.extDrillDownReportFrom2dChart_chart.refresh();
    },
});

function onDrillDown(item) {
	var restriction = new Ab.view.Restriction();
	var panel = View.panels.get("extDrillDownReportFrom2dChart_report");
	panel.addParameter('summaryValueForThisGroup', item.selectedChartData['afm_cal_dates.month']);
		
	for(var cat in item.selectedChartData){
		if(typeof cat != undefined && item.selectedChartData[cat] == item.values.value){
			panel.addParameter('restriction2Ctry', cat);
			break;
		}
	}
		
	panel.refresh();
    
	panel.showInWindow({
	            width: 300, 
	            height: 200
	        });
}


