var abSpAllocAllTypeChartCtrl = abSpAllocTrendMetricChartCommCtrl.extend({

	setAllTypeTitleSqlParameters: function(){
		this.chart.addParameter('vert', getMessage("vert"));
		this.chart.addParameter('serv', getMessage("serv"));
		this.chart.addParameter('prorate', getMessage("prorate"));
		this.chart.addParameter('other', getMessage("other"));
		this.chart.addParameter('nocat', getMessage("nocat"));
		this.chart.addParameter('remaining', getMessage("remaining"));
		this.chart.addParameter('noProrate', getMessage("noProrate"));
	}
})