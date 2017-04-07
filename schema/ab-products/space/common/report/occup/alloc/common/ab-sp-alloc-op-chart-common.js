var abSpAllocOpChartCtrl = abSpAllocTrendMetricChartCommCtrl.extend({

	customOccupancyFillColors: ['0x808080','0x008000', '0x0000FF','0xFFFF00','0xFF0000'],

	setOccupancyTitleSqlParameters: function(){
		this.chart.addParameter('nonOccup', getMessage("nonOccup"));
		this.chart.addParameter('vacant', getMessage("vacant"));
		this.chart.addParameter('avail', getMessage("avail"));
		this.chart.addParameter('atCap', getMessage("atCap"));
		this.chart.addParameter('excCap', getMessage("excCap"));
	},

  	callWfrBeforeShowChart: function(){
		try{
			//workflow BldgopsExpressService-updateNecessaryData
			var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SpaceExpressService-updateRoomOccupancy', this.parentTabs.consoleRestrictionStr);
		}catch(e){
			Workflow.handleError(e);
		}
	}
})