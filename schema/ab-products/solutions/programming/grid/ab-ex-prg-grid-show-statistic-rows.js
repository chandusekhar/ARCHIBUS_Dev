/**
 * Show statistic rows for grid with non-grouping data source.
 * Show statistic and total rows for grid with grouping data source. 
 */
var abExStatisticRowsCtrl = View.createController('abExStatisticRowsCtrl', {
	
	/*
	 * Statistic config object.
	 * showStatisticData order define the display order
	 * For non grouping data source axvw field attribute showTotals must be used.
	 * showStatisticData array support 'sum' element just to define on what position totals are displayed 
	 * 			ex:  ["avg", "sum", "min", "max"] 
	 * If 'sum' is not defined here  and field attribute is set to true - totals are displayed on last position. 
	 * 
	 */
	nonGroupingFlds_statConfig: {
			formulas: ["avg", "min", "max"],
			fields: ["bl.value_book", "bl.value_market"]
		},
	
	/*
	 *  Statistic config object.
	 *  showStatisticData order define the display order
	 */
	groupingFlds_statConfig: {
			formulas: ["avg", "min", "max", "sum"],
			fields: ["bl.value_book_sum", "bl.value_market_sum"]
		},
	
	afterViewLoad: function(){
		// set new attributes to panel and datasource
		// non grouping  
		this.setParameters("abExStatisticRowsNonGrouping_grid", this.nonGroupingFlds_statConfig);
		// grouping
		this.setParameters("abExStatisticRowsGrouping_grid", this.groupingFlds_statConfig);
	},
	
	/**
	 * Set statistic attributes to grid object.
	 */
	setParameters: function(panelId, configObject) {
		var objPanel = View.panels.get(panelId);
		if (objPanel) {
			objPanel.setStatisticAttributes(configObject);
		}
	}
	
});