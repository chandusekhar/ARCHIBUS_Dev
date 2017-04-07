/**
 * This file is included into 1D chart example views.
 */


/**
 * This function is called when the user clicks on the chart to drill-down.
 * It displays a dialog showing individual room records for selected department.
 * 
 * @param {chartItem} Object representing the chart item the user clicked on. Contains:
 *                    - chart: reference to the chart panel;
 *                    - restriction: Ab.view.Restriction for the chart item;
 *                    - selectedChartData: object containing data values for the chart item.
 */
function selectItem(chartItem) {
	if (chartItem.restriction.clauses[0]) {
		var chart_dv_and_dp = chartItem.restriction.clauses[0].value;
		View.openDialog('ab-ex-rm-dpstats-1d-drilldown.axvw', "chart_dv_and_dp = '" + chart_dv_and_dp + "'");
	} else {
		View.openDialog('ab-ex-rm-dpstats-1d-drilldown.axvw')
	}	
}

