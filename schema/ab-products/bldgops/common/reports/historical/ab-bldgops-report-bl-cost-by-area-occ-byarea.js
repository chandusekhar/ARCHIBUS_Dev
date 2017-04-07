
var blcostByAreaController = View.createController('blcostByAreaController', {
	otherRes:' 1=1 ',
    blId: null,
	/**
	 * Search by console
	 */
    onShowChart: function(){
		this.otherRes = this.otherRes.replace(/wr/g, "wrhwr");
        this.costByAreaChart.addParameter('wrhwrRes', this.otherRes);
        this.costByAreaChart.refresh();
        this.costByAreaChart.show(true);
    },
	/**
	 * Clear restriction of console
	 */
    onClearChart: function(){
        this.costByAreaChart.show(false);
    }
})

	/**
	 * Show detailed work request grid
	 */
    function onChartClick(obj){
		View.controllers.get('blcostByAreaController').blId = obj.selectedChartData['wr.bl_id'];
        View.openDialog('ab-bldgops-report-bl-cost-by-area-occ-details.axvw', null, false, {width:800, height:800});
    }
