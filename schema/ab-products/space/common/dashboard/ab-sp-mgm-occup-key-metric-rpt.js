var keyMetricController = View.createController('keyMetricController', {
	locMetricDashCtrl:null,

	afterInitialDataFetch: function(){
		initialDashCtrl(this);
	},

	refreshChart:function(){
		this.addParameterToChartPanel(this.keyTotalMetricForm);  
	},

	/**
	 * Show Cross-table report.
	 */
	keyTotalMetricForm_onMore:function(){
		this.addParameterToChartPanel(this.keyTotalMetricForm1);  
		this.keyTotalMetricForm1.showInWindow({
			width: 900,
			height: 600
         });
	},

	/**
	 * Maximize the chart.
	 */
	addParameterToChartPanel:function(chartPanel){
		var treeCtrl = this.locMetricDashCtrl.treeCtrl;
		var consoleCtrl = this.locMetricDashCtrl.consoleCtrl;

		var blIdRes =  treeCtrl.treeRes+" AND "+consoleCtrl.blIdForFlRes+" AND "+consoleCtrl.siteIdRes;
		chartPanel.addParameter('blId', blIdRes);
		chartPanel.addParameter('groupby', 'bl.bl_id');

		if (treeCtrl.groupLevel=="bl_id is not null") {
			chartPanel.addParameter ('groupby', "bl.bl_id");
		} else if (treeCtrl.groupLevel=="bl.bl_id") {
			chartPanel.addParameter ('groupby', 'bl.bl_id');
		}
		else if (treeCtrl.groupLevel=="fl.fl_id") {
			chartPanel.addParameter ('groupby', "RTRIM(fl.bl_id)${sql.concat}'-'${sql.concat}RTRIM(fl.fl_id)");
		} else {
			chartPanel.addParameter ('groupby', treeCtrl.groupLevel);
		}
		
		chartPanel.show(true);
		chartPanel.refresh();
	}
})
	
