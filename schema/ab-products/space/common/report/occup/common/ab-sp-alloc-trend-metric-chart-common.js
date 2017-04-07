/*
*	This object is the base of all individual chart controller.  Each chart controller will extend this js component.
* 	  @author Zhang Yi
*/
var abSpAllocTrendMetricChartCommCtrl = View.createController('abSpAllocTrendMetricChartCommCtrl', {

	//chart panel object
	chart: null,
	
	//parent chart Tabs
	parentTabs:null,

	afterInitialDataFetch: function() {
		//set parent Tabs
		this.parentTabs = View.getParentTab().parentPanel;

		//call real inheriter's initial method for setting themselves own properties
		this.initial();

		//call inheriter's method for setting default sql parameters
		this.chart.addParameter('consoleRes', this.parentTabs.consoleRestrictionStr);
		this.setSqlParameters();

		//call inheriter's function to run some necessary logics for showing current specified chart
		if(this.callWfrBeforeShowChart){
			this.callWfrBeforeShowChart();
		}

		//refresh and show the chart 
		this.chart.refresh();

		//Set tab's title from its chart's title.
		View.getParentTab().setTitle(this.chart.getTitle());
	},

	/*
	* Construct a restriction based on clicked object on chart plus parent restriction of tab.
	* @param obj: clicked object on chart
	*/
	constructClickRestriction: function(obj) {
		var restriction = new Ab.view.Restriction();
		if ( this.parentTabs.consoleRestrictionObj ) {
			restriction.addClauses(this.parentTabs.consoleRestrictionObj); 	
		}
		//add proper clauses from clicked object by calling inheriter's own function
		this.addRestriction(obj, restriction);
		return  restriction;
	},

	/*
	* Common function: add restriction clauses of division and department from clicked object on chart.
	*
	* @param obj: clicked object on chart
	* @param restriction: restirction object to add clauses
	*/
	addDepartmentClauses: function(obj, restriction) {
		var dv_dp = obj.selectedChartData['rm.dv_dp'].split(" - ");
		restriction.addClause("rm.dv_id", dv_dp[0], "=", true);
		restriction.addClause("rm.dp_id", dv_dp[1], "=", true);
	},

	/*
	* Common function: add restriction clauses of division from clicked object on chart.
	*
	* @param obj: clicked object on chart
	* @param restriction: restirction object to add clauses
	*/
	addDivisionClauses: function(obj, restriction) {
		var dv = obj.selectedChartData['rm.dv_id'];
		restriction.addClause("rm.dv_id", dv, "=", true);
	},

	/*
	* Common function: add restriction clauses of building from clicked object on chart.
	*
	* @param obj: clicked object on chart
	* @param restriction: restirction object to add clauses
	*/
	addBuildingClauses: function(obj, restriction) {
		var bl = obj.selectedChartData['rm.bl_id'];
        restriction.addClause("rm.bl_id", bl, "=", true);
	},

	/*
	* Common function: add restriction clauses of room catefory from clicked object on chart.
	*
	* @param obj: clicked object on chart
	* @param restriction: restirction object to add clauses
	*/
	addRoomCategoryClauses: function(obj, restriction) {
		var cat = obj.selectedChartData['rm.rm_cat'];
		if ( cat!="(no value)") {
			restriction.addClause("rm.rm_cat", cat, "=", true);
		}	else{
			restriction.addClause("rm.rm_cat", '', 'IS NULL', true);
		}
	},

	/*
	* Common function: add restriction clauses of floor from clicked object on chart.
	*
	* @param obj: clicked object on chart
	* @param restriction: restirction object to add clauses
	*/
	addFloorClauses: function(obj, restriction) {
		var bl_fl_id = obj.selectedChartData['rm.bl_fl_id'].split("-");
		restriction.addClause("rm.bl_id", bl_fl_id[0], "=", true);
		restriction.addClause("rm.fl_id", bl_fl_id[1], "=", true);
	},

	/*
	* Common function: add restriction clauses of site from clicked object on chart.
	*
	* @param obj: clicked object on chart
	* @param restriction: restirction object to add clauses
	*/
	addSiteClauses: function(obj, restriction) {
		var blSite = obj.selectedChartData['bl.site_id'];
		var rmSite = obj.selectedChartData['rm.site_id'];
		if (blSite) {
			restriction.addClause("bl.site_id", blSite, "=", true);
		} else {
			restriction.addClause("bl.site_id", rmSite, "=", true);
		}
	},

	/*
	* Common function: add restriction clauses of categories from clicked object on chart.
	*
	* @param obj: clicked object on chart
	* @param restriction: restirction object to add clauses
	*/
	addCategoryClauses: function(obj, restriction) {
		var category = obj.selectedChartData['rm.rm_cat'];
		restriction.addClause("rm.rm_cat", category, "=", true);
	},

	/*
	* Common function: add restriction clauses of super categories of room from clicked object on chart.
	*
	* @param obj: clicked object on chart
	* @param restriction: restirction object to add clauses
	*/
	addSuperCategoryClauses: function(obj, restriction) {
		var superCategory = obj.selectedChartData['rmcat.supercat'];
		restriction.addClause("rmcat.supercat", superCategory, "=", true);
	},

	/*
	* Common function: add restriction clauses of 'All Space Types' from clicked object on chart.
	*
	* @param obj: clicked object on chart
	* @param restriction: restirction object to add clauses
	*/
	addSpaceTypeClauses: function(obj, restriction) {
		var spaceType = obj.selectedChartData['rm.type'] ;
		if ( spaceType=="1 "+getMessage("nocat") ) {
			restriction.addClause("rm.rm_cat", '', " IS NULL ", true);
		} else if ( spaceType=="2 "+getMessage("vert") ) {
			restriction.addClause("rmcat.supercat", 'VERT', "=", true);
		} else if ( spaceType=="3 "+getMessage("serv") ) {
			restriction.addClause("rmcat.supercat", 'SERV', "=", true);
		}	else if ( spaceType=="4 "+getMessage("other") ) {
			restriction.addClause("rmcat.supercat", 'OTHR', "=", true);
		}	else if ( spaceType=="5 "+getMessage("prorate") ) {
			restriction.addClause("rm.dv_id", '', " IS NULL ", true);
			restriction.addClause("rm.dp_id", '', " IS NULL ", true);
			restriction.addClause("rmcat.supercat", 'USBL', "=", true);
			restriction.addClause("rm.prorate!", 'NONE', '!=', true);
		}	else if ( spaceType=="6 "+getMessage("noProrate") )  {
			restriction.addClause("rm.dv_id", '', " IS NULL ", true);
			restriction.addClause("rm.dp_id", '', " IS NULL ", true);
			restriction.addClause("rmcat.supercat", 'USBL', "=", true);
			restriction.addClause("rm.prorate!", 'NONE', '=', true);
		}	else if ( spaceType=="7 "+getMessage("remaining") )  {
			restriction.addClause("rm.rm_id", '', "IS NULL", true);
		}  else {
			var dv_dp = spaceType.split(" - ");
			restriction.addClause("rmcat.supercat", "USBL", "=", true);
			restriction.addClause("rm.dv_id", dv_dp[0], "=", true);
			if ( dv_dp.length>=2) {
				restriction.addClause("rm.dp_id", dv_dp[1], "=", true);
			}
		}
	},

	/*
	* Common function: add restriction clauses of 'Occupancy' from clicked object on chart.
	*
	* @param obj: clicked object on chart
	* @param restriction: restirction object to add clauses
	*/
	addOccupancyTypeClauses: function(obj, restriction) {
		var occupancyType = obj.selectedChartData['rm.op'];
		if ( occupancyType=="1 "+getMessage("nonOccup") ) {
			restriction.addClause("rm.rm_cat", '', "is not null", true);
			restriction.addClause("rmcat.occupiable", 0, "=", true);
		} else {
			restriction.addClause("rmcat.occupiable", 1, "=", ")AND(", true);
			restriction.addClause("rm.cap_em", 0, "&gt;", true);
			if ( occupancyType=="2 "+getMessage("vacant") ) {
				restriction.addClause("rm.count_em", 0, "=", true);
			} else if ( occupancyType=="3 "+getMessage("avail") ) {
				restriction.addClause("rm.count_em", 0, "&gt;", true);
				restriction.addClause("rm.count_em", "rm.cap_em", "&lt;", false);
			}	else if ( occupancyType=="4 "+getMessage("atCap") ) {
				restriction.addClause("rm.count_em", "rm.cap_em", "=", true);
			}	else if ( occupancyType=="5 "+getMessage("excCap")) {
				restriction.addClause("rm.count_em", "rm.cap_em", "&gt;", true);
			} else {
				restriction.addClause("rm.cap_em", 0, "=", true);
				restriction.addClause("rm.rm_cat", '', "IS NULL", "OR", true);
			}
		}
	},

	/*
	* Common function: add restriction clauses of 'Occupancy Rate' from clicked object on chart.
	*
	* @param obj: clicked object on chart
	* @param restriction: restirction object to add clauses
	*/
	addOccupancyRateClauses: function(obj, restriction) {
		var rateType = obj.selectedChartData['rm.rateType'];
		if ( rateType==getMessage("occuText") ||  rateType==getMessage("occuText")+":" ) {
			restriction.addClause("rm.count_em", 0, "&gt;", true);
		} else if ( rateType==getMessage("vacantText")  || rateType==getMessage("vacantText")+":" ) {
			restriction.addClause("rm.count_em", 0, "=", true);
		}
	}
})

function onPlanChartClick(obj) {
	var clickRestriction =	abSpAllocTrendMetricChartCommCtrl.constructClickRestriction(obj);
	View.openDialog('ab-sp-alloc-trend-metric-pop-details.axvw', clickRestriction);	
}
