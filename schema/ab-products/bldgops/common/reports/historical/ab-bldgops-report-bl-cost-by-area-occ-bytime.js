
var blcostByTimeController = View.createController('blcostByTimeController', {
	otherRes:' 1=1 ',
    blId: null,
    month: null,
	/**
	 * Search by console
	 */
    onShowChart: function(){
		this.otherRes = this.otherRes.replace(/wr/g, "wrhwr");
        this.costByTimeChart.addParameter('wrhwrRes', this.otherRes);
        this.costByTimeChart.refresh();
        this.costByTimeChart.show(true);
    },
	/**
	 * Clear restriction of console
	 */
    onClearChart: function(){
        this.costByTimeChart.show(false);
    }
})

	/**
	 * Show detailed work request grid
	 */
    function onChartClick(obj){
		View.controllers.get('blcostByTimeController').blId = obj.selectedChartData['wr.bl_id'];
		View.controllers.get('blcostByTimeController').month = obj.selectedChartData['wr.month'];
        View.openDialog('ab-bldgops-report-bl-cost-by-area-occ-details.axvw', null, false, {width:800, height:800});
    }
