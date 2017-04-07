var abSpTrendChartCommCtrl = abSpAllocTrendMetricChartCommCtrl.extend({

	setSqlParameters: function(){
		if( this.parentTabs.fromYear ){
			this.chart.addParameter('fromYear', this.parentTabs.fromYear);
			this.chart.addParameter('toYear', this.parentTabs.toYear);
		}
		else {
			var currentYear = getCurrentYear();
			this.chart.addParameter('fromYear', currentYear);
			this.chart.addParameter('toYear', currentYear);
		}
	}
})

function	getCurrentYear() { 
	var systemDate = new Date();
	var x = systemDate.getYear();
	systemYear = x % 100;
	systemYear += (systemYear < 38) ? 2000 : 1900;
	return systemYear;	
}
