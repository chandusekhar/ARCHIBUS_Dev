var abRplmLsadminOptionsByExpirationReportController = View.createController('abRplmLsadminOptionsByExpirationReportCtrl', {
	afterInitialDataFetch: function(){
		this.abRplmLeaseadminOpByDDateReport_filterPanel_onShow();
	},
	
	abRplmLeaseadminOpByDDateReport_filterPanel_onShow: function(){
		var inclExpOp = document.getElementById("ckbox_include_expired_options").checked;
		var select_date_range = document.getElementById("select_date_range");
		var dateRange = select_date_range.options[select_date_range.selectedIndex].value;
		var select_landlord_tenant = document.getElementById("select_landlord_tenant");
		var landlordTenant = select_landlord_tenant.options[select_landlord_tenant.selectedIndex].value;
		var restriction = "";
		
		var currentDate = new Date();
		var sqlCurrentDate = this.getSqlDate(currentDate);
		
		switch (dateRange) {
			case "coming_month":
				var nextMonth = DateMath.add(currentDate, DateMath.MONTH, 1);
				var nextMonthLastDate = DateMath.findMonthEnd(nextMonth);
				var sqlNextMonthLastDay = this.getSqlDate(nextMonthLastDate);
				restriction += "(op.date_option IS NOT NULL AND op.date_option >= " + sqlCurrentDate + " AND op.date_option < " + sqlNextMonthLastDay + ")";
				break;
	
			case "coming_three_months":
				var next3Months = DateMath.add(currentDate, DateMath.MONTH, 3);
				var next3MonthsLastDate = DateMath.findMonthEnd(next3Months);
				var sqlNext3MonthsLastDay = this.getSqlDate(next3MonthsLastDate);
				restriction += "(op.date_option IS NOT NULL AND op.date_option >= " + sqlCurrentDate + " AND op.date_option < " + sqlNext3MonthsLastDay + ")";
				break;
	
			case "coming_six_months":
				var next6Months = DateMath.add(currentDate, DateMath.MONTH, 6);
				var next6MonthsLastDate = DateMath.findMonthEnd(next6Months);
				var sqlNext6MonthsLastDay = this.getSqlDate(next6MonthsLastDate);
				restriction += "(op.date_option IS NOT NULL AND op.date_option >= " + sqlCurrentDate + " AND op.date_option < " + sqlNext6MonthsLastDay + ")";
				break;
	
			case "coming_year":
				var next12Months = DateMath.add(currentDate, DateMath.MONTH, 12);
				var next12MonthsLastDate = DateMath.findMonthEnd(next12Months);
				var sqlNext12MonthsLastDay = this.getSqlDate(next12MonthsLastDate);
				restriction += "(op.date_option IS NOT NULL AND op.date_option >= " + sqlCurrentDate + " AND op.date_option < " + sqlNext12MonthsLastDay + ")";
				break;
	
			case "all":
			default:
				break;
		}
		switch (landlordTenant) {
			case "landlord":
				restriction += (restriction != "") ? " AND " : "";
				restriction += "EXISTS (SELECT ls.ls_id FROM ls WHERE ls.ls_id = op.ls_id AND ls.landlord_tenant='LANDLORD' )";
				break;
	
			case "tenant":
				restriction += (restriction != "") ? " AND " : "";
				restriction += "EXISTS (SELECT ls.ls_id FROM ls WHERE ls.ls_id = op.ls_id AND ls.landlord_tenant='TENANT' )";
				break;
	
			case "all":
			default:
				break;
		}
		
		if(!inclExpOp){
			restriction += (restriction != "") ? " AND " : "";
			restriction += "(op.date_option IS NULL OR op.date_option >= ${sql.currentDate})";
			restriction += " AND EXISTS (SELECT ls.ls_id FROM ls WHERE ls.ls_id = op.ls_id AND ls.signed = 1 AND (ls.date_end IS NULL OR ls.date_end >= ${sql.currentDate}))";
		}
		
		this.abRplmLeaseadminOpByDDateReport_detailsPanel.refresh(restriction);
	},
	
	/**
	 * Returns an sql phrase like "${sql.date('yyyy-mm-dd')}" from the date parameter
	 */
	getSqlDate: function(date){
		var month = date.getMonth()+1;
		var day = date.getDate();
		var sqlYear = "" + date.getFullYear();
		var sqlMonth = "" + (month < 10 ? "0" + month : month);
		var sqlDay = "" + (day < 10 ? "0" + day : day);
		var sqlDate = "${sql.date('" + sqlYear	+ "-" + sqlMonth + "-" + sqlDay + "')}";
		
		return sqlDate;
	}
})
