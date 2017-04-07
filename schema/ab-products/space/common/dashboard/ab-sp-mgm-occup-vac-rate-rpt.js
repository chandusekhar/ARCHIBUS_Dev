var vacancyChartController = View.createController('vacancyChartController', {
	locMetricDashCtrl:null,

	afterInitialDataFetch: function(){
		initialDashCtrl(this);
	},

	refreshChart:function(){
		var consoleCtrl = this.locMetricDashCtrl.consoleCtrl;
		var treeRes = this.locMetricDashCtrl.treeCtrl.treeRes;
		var groupLevel=this.locMetricDashCtrl.treeCtrl.groupLevel;
		var chart = this.vacancyChart;

		var currdate = new Date();
		var currentDate= getIsoFormatDate(DateMath.add(currdate, DateMath.YEAR, 0));
		var lastYearDate= getIsoFormatDate(DateMath.add(currdate, DateMath.YEAR, -1));
		var lastTwoDate= getIsoFormatDate(DateMath.add(currdate, DateMath.YEAR, -2));

		chart.addParameter('dateRange', "${sql.date('"+currentDate+"')},${sql.date('"+lastYearDate+"')},${sql.date('"+lastTwoDate+"')}");

		if ( consoleCtrl.blId=='' ) {
			chart.addParameter('blId', treeRes+" AND "+consoleCtrl.siteIdRes);
		} else {
			chart.addParameter('blId', treeRes+" AND "+getMultiSelectFieldRestriction(['rm.bl_id'], consoleCtrl.blId)+" AND "+consoleCtrl.siteIdRes);
		}
		
		if ( groupLevel=="bl_id is not null" ) {
			chart.addParameter('groupby', "bl.bl_id");
		} 
		else if ( groupLevel=="bl.bl_id" ) {
			chart.addParameter('groupby', 'rm.bl_id');
		}
		else if ( groupLevel=="fl.fl_id" ) {
			chart.addParameter('groupby', "RTRIM(rm.bl_id)${sql.concat}'-'${sql.concat}RTRIM(rm.fl_id)");
		}
		else {
			chart.addParameter('groupby', groupLevel);
		}
		chart.addParameter('dvdpForRmParam',consoleCtrl.dvdpForRmRes);
		chart.addParameter('dvdpParam',consoleCtrl.dvdpForRmpctRes);

		chart.show(true);
		chart.refresh();
	}
})
	
