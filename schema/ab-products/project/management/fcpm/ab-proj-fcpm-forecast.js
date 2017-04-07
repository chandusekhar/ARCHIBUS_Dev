function getProjForecastId(project_id, work_pkg_id) {
	var proj_forecast_id = '';
	var forecastRestriction = new Ab.view.Restriction();
	forecastRestriction.addClause('proj_forecast.project_id', project_id);
	var forecastRecords = View.dataSources.get('projFcpmForecastDs3').getRecords(forecastRestriction);
	if (forecastRecords.length == 0) {
		proj_forecast_id = createProjection(project_id);
	}
	else proj_forecast_id = forecastRecords[forecastRecords.length-1].getValue('proj_forecast.proj_forecast_id');
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause('proj_forecast_item.project_id', project_id);
	if (work_pkg_id != '') restriction.addClause('proj_forecast_item.work_pkg_id', work_pkg_id);
		
	createProjectionItems(project_id, work_pkg_id, proj_forecast_id);
	return proj_forecast_id;
}

function createProjection(project_id) {
	var date = new Date();
	var isoDate = FormattingDate(date.getDate(), date.getMonth() + 1, date.getFullYear(), "YYYY-MM-DD");
	var proj_forecast_id = 'Forecast -' + isoDate;
	var record = View.dataSources.get('projFcpmForecastDs3').getDefaultRecord();
	record.setValue('proj_forecast.proj_forecast_id', proj_forecast_id);
	record.setValue('proj_forecast.project_id', project_id);
	record.setValue('proj_forecast.description', 'Project forecast auto-generated on ' + isoDate);
	View.dataSources.get('projFcpmForecastDs3').saveRecord(record);
	return proj_forecast_id;
}
	
function createProjectionItems(project_id, work_pkg_id, proj_forecast_id) {
	var restriction = new Ab.view.Restriction();
	restriction.addClause('work_pkgs.project_id', project_id);
	if (work_pkg_id != '') restriction.addClause('work_pkgs.work_pkg_id', work_pkg_id);

	/* Forecast items are created for any work pkgs that do not yet have forecast items */
	var records = View.dataSources.get('projFcpmForecastDs2').getRecords(restriction);
	if (records.length > 0) View.openProgressBar(getMessage('retrievingPjn'));
	for (var i=0; i < records.length; i++) {
		View.updateProgressBar(i/records.length);
		var record = records[i];
		var workPkgId = record.getValue('work_pkgs.work_pkg_id');
		var itemRestriction = new Ab.view.Restriction();
		itemRestriction.addClause('proj_forecast_item.proj_forecast_id', proj_forecast_id);
		itemRestriction.addClause('proj_forecast_item.project_id', project_id);
		itemRestriction.addClause('proj_forecast_item.work_pkg_id', workPkgId);
		var itemRecords = View.dataSources.get('projFcpmForecastDs1').getRecords(itemRestriction);
		if (itemRecords.length == 0) saveFcstRecords(record, proj_forecast_id);
	}
	if (records.length > 0) View.closeProgressBar();
}
	
function saveFcstRecords(record, proj_forecast_id) {
		var revised_cost = record.getValue('work_pkgs.revised_cost');
		var date_start = record.getValue('work_pkgs.date_start');
		var date_end = record.getValue('work_pkgs.date_end');
		date_start.setDate(1);
		date_end.setDate(1);
		var noMonths = 0;
		var date = new Date(date_start.getFullYear(), date_start.getMonth(), date_start.getDate());
		while (date_end >= date) {
			noMonths++;
			date.setMonth(date.getMonth() + 1);
		}
		if (noMonths > 0 && revised_cost > 0) {
			var costPerMonth = revised_cost/noMonths;
			var date_forecast = new Date(date_start.getFullYear(), date_start.getMonth(), date_start.getDate());
			for (var i=0; i < noMonths; i++) {
				var newRecord = getFcstRecord(record, date_forecast, costPerMonth, proj_forecast_id);
				View.dataSources.get('projFcpmForecastDs1').saveRecord(newRecord);
				date_forecast.setMonth(date_forecast.getMonth() + 1);
			}
		}
}
	
function getFcstRecord(record, date_forecast, costPerMonth, proj_forecast_id) {
		var project_id = record.getValue('work_pkgs.project_id');
		var work_pkg_id = record.getValue('work_pkgs.work_pkg_id');
		var revised_cost = record.getValue('work_pkgs.revised_cost');
		
		var newRecord = View.dataSources.get('projFcpmForecastDs1').getDefaultRecord();
		newRecord.setValue('proj_forecast_item.proj_forecast_id', proj_forecast_id);
		newRecord.setValue('proj_forecast_item.date_forecast', FormattingDate(date_forecast.getDate(), date_forecast.getMonth()+1, date_forecast.getFullYear(), 'YYYY-MM-DD'));
		newRecord.setValue('proj_forecast_item.cost_forecast', costPerMonth);
		newRecord.setValue('proj_forecast_item.project_id', project_id);
		newRecord.setValue('proj_forecast_item.work_pkg_id', work_pkg_id);
		newRecord.setValue('proj_forecast_item.created_by', View.user.employee.id);
		var date = new Date();
		newRecord.setValue('proj_forecast_item.date_created', FormattingDate(date.getDate(), date.getMonth()+1, date.getFullYear(), 'YYYY-MM-DD'));
		return newRecord;
}
