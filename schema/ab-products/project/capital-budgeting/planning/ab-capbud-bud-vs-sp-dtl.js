var capbudBudVsSpDtlController = View.createController('capbudBudVsSpDtl', {
	
	afterInitialDataFetch:function() {
		var dateRestriction = View.parameters.drilldownParameters.dateRestriction;
		var consoleRestriction = View.parameters.drilldownParameters.consoleRestriction;
		var groupBy = View.parameters.drilldownParameters.groupBy;
		var toDate = View.parameters.drilldownParameters.toDate;
		var type = View.parameters.drilldownParameters.type;
		
		var dateValue = dateRestriction.clauses[0].value;
		var groupClause = "";
		switch (groupBy) {
			case "week": 
				groupClause = "${sql.yearWeekOf";
				break;
			case "quarter": 
				groupClause = "${sql.yearQuarterOf";
				break;
			case "month": 
				groupClause = "${sql.yearMonthOf";
				break;
			default: groupClause = "${sql.yearOf";
		}
		
		var calDateRestriction = " (" + groupClause + "(\'afm_cal_dates.cal_date\')} = \'" + dateValue + "\' ) ";
		calDateRestriction += " AND cal_date <= ${sql.date(\'" + toDate + "\')} ";
		calDateRestriction += " AND cal_date >= project.date_start AND cal_date <= project.date_end ";
		
		if (type == 'sp' || type == 'budSp') {
			var invDateRestriction = groupClause + "(\'invoice.date_sent\')} = \'" + dateValue + "\' ";
			invDateRestriction += " AND date_sent <= ${sql.date(\'" + toDate + "\')} ";

			this.capbudBudVsSpDtl_invoices.addParameter('invoicesRestriction', consoleRestriction);
			this.capbudBudVsSpDtl_invoices.addParameter('invDateRestriction', invDateRestriction);
			this.capbudBudVsSpDtl_invoices.refresh();
			this.capbudBudVsSpDtl_invoices.show(true);

			if (type == 'sp') {
				this.capbudBudVsSpDtlTabs.hideTab('capbudBudVsSpDtl_tabProj');
				this.capbudBudVsSpDtlTabs.selectTab('capbudBudVsSpDtl_tabInv');
			}
		}
		if (type == 'bud' || type == 'budSp') {
			var projDateRestriction = " (" + groupClause + "(\'project.date_start\')} <= \'" + dateValue + "\' AND " + groupClause + "(\'project.date_end\')} >= \'" + dateValue + "\') ";
			projDateRestriction += " AND date_start <= ${sql.date(\'" + toDate + "\')} ";
			
			var invDateRestriction = groupClause + "(\'invoice.date_sent\')} = \'" + dateValue + "\' ";
			invDateRestriction += " AND date_sent <= ${sql.date(\'" + toDate + "\')} ";

			this.capbudBudVsSpDtl_projects.addParameter('projectsRestriction', consoleRestriction);
			this.capbudBudVsSpDtl_projects.addParameter('projDateRestriction', projDateRestriction);
			this.capbudBudVsSpDtl_projects.addParameter('invDateRestriction', invDateRestriction);
			this.capbudBudVsSpDtl_projects.addParameter('calDateRestriction', calDateRestriction);
			this.capbudBudVsSpDtl_projects.refresh();
			this.capbudBudVsSpDtl_projects.show(true);
			
			if (type == 'bud') this.capbudBudVsSpDtlTabs.hideTab('capbudBudVsSpDtl_tabInv');
		}
		if (type == 'budSp' && this.capbudBudVsSpDtl_projects.rows.length < 1) this.capbudBudVsSpDtlTabs.selectTab('capbudBudVsSpDtl_tabInv');
	}

});
