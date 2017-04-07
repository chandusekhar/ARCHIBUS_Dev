var occupAndCapController = View.createController('occupAndCapController', {
  	locMetricDashCtrl:null,

	afterInitialDataFetch: function(){
		initialDashCtrl(this);
	},

	refreshChart:function(){
		var consoleCtrl = this.locMetricDashCtrl.consoleCtrl;
		var treeRes = this.locMetricDashCtrl.treeCtrl.treeRes;
		var groupLevel=this.locMetricDashCtrl.treeCtrl.groupLevel;
		var chart = this.occupancyAndCapicityStackedBar;
	
		if ( consoleCtrl.blId=='' ){
			chart.addParameter('blId',treeRes+" AND "+consoleCtrl.siteIdRes);
		} else {
			chart.addParameter('blId', treeRes+" AND "+getMultiSelectFieldRestriction(['fl.bl_id'], consoleCtrl.blId)+" AND "+consoleCtrl.siteIdRes);
		}
		
		chart.addParameter('dvdpParam',consoleCtrl.dvdpForRmpctRes );
		chart.addParameter('dvdpForRmParam',consoleCtrl.dvdpForRmRes );

		if ( groupLevel=="bl_id is not null" ) {
			chart.addParameter('groupby', "bl.bl_id");
		}
		else if ( groupLevel=="bl.bl_id" ) {
			chart.addParameter('groupby', 'fl.bl_id');
		}
		else if ( groupLevel=="fl.fl_id" ) {
			chart.addParameter('groupby', "RTRIM(fl.bl_id)${sql.concat}'-'${sql.concat}RTRIM(fl.fl_id)");
		}
		else {
			chart.addParameter('groupby', groupLevel);
		}

		chart.addParameter('occupForAreatype', getMessage('occupForAreatype'));
		chart.addParameter('maxOccupForAreatype', getMessage('maxOccupForAreatype'));

		chart.refresh();
	}
	
})
	
