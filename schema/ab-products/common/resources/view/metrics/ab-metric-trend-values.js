/**
 * Validate from / to dates
 */
function validateDates(){
	var form = View.panels.get("afmExMetricTrendValues_filter");
	var fromDate = form.getFieldValue("from_date");
	var toDate = form.getFieldValue("to_date");
	if (valueExistsNotEmpty(fromDate) && valueExistsNotEmpty(toDate) ) {
		var objFromDate = form.getDataSource().parseValue("afm_metric_trend_values.metric_date", fromDate, false);
		var objToDate = form.getDataSource().parseValue("afm_metric_trend_values.metric_date", toDate, false);
		if (objFromDate >= objToDate) {
			View.showMessage(getMessage("errFromDateGreaterThanEndDate"));
			return false;
		}
	}
	return true;
}