var areaPerSeatController = View.createController('areaPerSeatController', {

	locMetricDashCtrl:null,

	afterInitialDataFetch: function(){
		initialDashCtrl(this);
	},

	refreshChart:function() {
		var treeCtrl = this.locMetricDashCtrl.treeCtrl;
		var consoleCtrl = this.locMetricDashCtrl.consoleCtrl;
		var chart = this.areaPerSeatBar;

		chart.addParameter('dvdpForRmParam',consoleCtrl.dvdpForRmRes );
		chart.addParameter('dvdpParam',consoleCtrl.dvdpForRmpctRes);

		if ( treeCtrl.groupLevel=="bl_id is not null" ) {
			chart.addParameter('groupby', "bl.bl_id");
		} 
		else if ( treeCtrl.groupLevel=="bl.bl_id" ) {
			chart.addParameter('groupby', 'fl.bl_id');
		}
		else if ( treeCtrl.groupLevel=="fl.fl_id" ) {
			chart.addParameter('groupby', "RTRIM(fl.bl_id)${sql.concat}'-'${sql.concat}RTRIM(fl.fl_id)");
		}
		else {
			chart.addParameter('groupby', treeCtrl.groupLevel);
		}

	   var blIdRes;
		if ( treeCtrl.blId=='' ) {
			blIdRes =  treeCtrl.treeRes+" AND "+consoleCtrl.siteIdRes		
		}
		else {
			blIdRes = treeCtrl.treeRes+" AND "+getMultiSelectFieldRestriction(['fl.bl_id'], consoleCtrl.blId)+" AND "+consoleCtrl.siteIdRes;
		}
		chart.addParameter('blId', blIdRes);

		chart.show(true);
		chart.refresh();
	}
})
	
