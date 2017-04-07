var projFcpmWipChartItemsController = View.createController('projFcpmWipChartItems', {
	
	afterViewLoad: function() {        
		var dateRestriction = View.parameters.drilldownParameters.dateRestriction;
		var project_id = View.parameters.drilldownParameters.project_id;
		var work_pkg_id = View.parameters.drilldownParameters.work_pkg_id;
		var proj_forecast_id = View.parameters.drilldownParameters.proj_forecast_id;
		var fromDate = View.parameters.drilldownParameters.fromDate;
		var toDate = View.parameters.drilldownParameters.toDate;
		
		var strRestriction = "invoice.project_id = '" + getValidRestVal(project_id) + "'";
		if (work_pkg_id) {
			strRestriction += " AND invoice.work_pkg_id = '" + getValidRestVal(work_pkg_id) + "'";			
		}
		
		var dateValue = dateRestriction.clauses[0].value;
		var groupClause = "${sql.yearMonthOf";		
		
		if (true) {
			var dateRestriction = groupClause + "(\'invoice.date_sent\')} = \'" + dateValue + "\' ";
			dateRestriction += " AND date_sent <= ${sql.date(\'" + toDate + "\')} ";

			this.projFcpmWipChartItemsGridInv.addParameter('consoleRestriction', strRestriction);
			this.projFcpmWipChartItemsGridInv.addParameter('dateRestriction', dateRestriction);
		}
		
		strRestriction = "proj_forecast_item.project_id = '" + getValidRestVal(project_id) + "'";
		strRestriction += " AND proj_forecast_item.proj_forecast_id = '" + getValidRestVal(proj_forecast_id) + "'";
		if (work_pkg_id) {
			strRestriction += " AND proj_forecast_item.work_pkg_id = '" + getValidRestVal(work_pkg_id) + "'";			
		}
		if (true) {
			var dateRestriction = " (" + groupClause + "(\'proj_forecast_item.date_forecast\')} = \'" + dateValue + "\') ";	
			dateRestriction += " AND proj_forecast_item.date_forecast <= ${sql.date(\'" + toDate + "\')} ";
			this.projFcpmWipChartItemsGrid.addParameter('consoleRestriction', strRestriction);
			this.projFcpmWipChartItemsGrid.addParameter('dateRestriction', dateRestriction);
		}
               
	},
	
	afterInitialDataFetch:function() {
		if (this.projFcpmWipChartItemsGrid.rows.length < 1) this.projFcpmWipChartItemsTabs.selectTab('projFcpmWipChartItems_tabInv');
	}

});

function getValidRestVal(value)
{
	value = value.replace(/\'/g, "\'\'");
	value = value.replace(/&apos;/g, "\'\'");
	return value;
}
