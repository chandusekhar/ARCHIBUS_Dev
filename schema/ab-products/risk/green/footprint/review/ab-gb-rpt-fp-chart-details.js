var abGbRptFpChartDetailsCtrl = View.createController('abGbRptFpChartDetailsCtrl', {
	restriction : null,
	selectionLabel: null,
	afterInitialDataFetch: function(){
		this.restriction = this.view.restriction;
		this.selectionLabel = this.view.parameters.selectionLabel;
		this.abGbRptFpChartDetails_scope1Chart.refresh(this.restriction);
		this.abGbRptFpChartDetails_scope2Chart.refresh(this.restriction);
		this.abGbRptFpChartDetails_otherChart.refresh(this.restriction);
	},
	abGbRptFpChartDetails_scope1Chart_afterRefresh: function(){
		this.abGbRptFpChartDetails_scope1Chart.setInstructions(this.selectionLabel);
	},
	abGbRptFpChartDetails_scope2Chart_afterRefresh: function(){
		this.abGbRptFpChartDetails_scope2Chart.setInstructions(this.selectionLabel);
	},
	abGbRptFpChartDetails_otherChart_afterRefresh: function(){
		this.abGbRptFpChartDetails_otherChart.setInstructions(this.selectionLabel);
	}
});