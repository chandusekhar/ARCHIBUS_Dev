var abSpMetricHeadcountChartCtrl = View.createController('abSpMetricHeadcountChartCtrl', {
 	//parent chart Tabs
	parentTabs:null,

	afterInitialDataFetch: function() {
		//set parent Tabs
		this.parentTabs = View.getParentTab().parentPanel;

		this.chart.addParameter('consoleRes', this.parentTabs.consoleRestrictionStr);

		//refresh and show the chart 
		this.chart.refresh();

		//Set tab's title from its chart's title.
		View.getParentTab().setTitle(this.chart.getTitle());
	}
})

function onBarChartClick(obj){

	var restriction = new Ab.view.Restriction();
	if (abSpMetricHeadcountChartCtrl.parentTabs.consoleRestrictionObj) {
		restriction.addClauses(abSpMetricHeadcountChartCtrl.parentTabs.consoleRestrictionObj); 	
	}

	var bl = obj.selectedChartData['em.bl_id'];
	if(bl){
		if ( '(no value)'==bl )
			restriction.addClause("em.bl_id", '', " IS NULL", true);
		else 
			restriction.addClause("em.bl_id", bl, "=", true);
	}

	var cat = obj.selectedChartData['rm.rm_cat'];
	if(cat){
		if ( '(no value)'==cat )
			restriction.addClause("rm.rm_cat", '', " IS NULL", true);
		else 
			restriction.addClause("rm.rm_cat", cat, "=", true);
	}

	var blSite = obj.selectedChartData['bl.site_id'];
	if(blSite){
		if ( '(no value)'==blSite )
			restriction.addClause("bl.site_id", '', " IS NULL", true);
		else 
			restriction.addClause("bl.site_id", blSite, "=", true);
	}

	var dv_dp = obj.selectedChartData['em.dv_dp'];
	if( dv_dp ){
		if ( '(no value)'==dv_dp || ' -'==dv_dp ) {
			restriction.addClause("rm.dv_id", '', " IS NULL", true);
			restriction.addClause("rm.dp_id", '', " IS NULL", true);
		}
		else if ( !(dv_dp.split(" -")[1])  ) {
			restriction.addClause("rm.dv_id", dv_dp.split(" -")[0] , "=", true);
			restriction.addClause("rm.dp_id", '', " IS NULL", true);
		}
		else {
			restriction.addClause("rm.dv_id", dv_dp.split(" - ")[0], "=", true);
			restriction.addClause("rm.dp_id", dv_dp.split(" - ")[1], "=", true);
		}
	}

	var bl_fl_id = obj.selectedChartData['em.bl_fl_id'];
	if ( bl_fl_id ) {
		if ( '(no value)'==bl_fl_id ) {
			restriction.addClause("em.bl_id", '', " IS NULL", true);
			restriction.addClause("em.fl_id", '', " IS NULL", true);
		}
		else {
			restriction.addClause("em.bl_id", bl_fl_id.split("-")[0], "=", true);
			restriction.addClause("em.fl_id", bl_fl_id.split("-")[1], "=", true);
		}
	}

	View.openDialog('ab-sp-alloc-trend-metric-pop-em-details.axvw', restriction);	
}
