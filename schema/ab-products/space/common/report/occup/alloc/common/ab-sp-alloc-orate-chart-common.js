var abSpAllocOrateChartCtrl = abSpAllocTrendMetricChartCommCtrl.extend({

	setOccupancyRateTitleSqlParameters: function(){
		this.chart.addParameter('vacantText', getMessage("vacantText"));
		this.chart.addParameter('occuText', getMessage("occuText"));
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