var energyBillProrateDrilldownController = View.createController('energyBillProrateDrilldown',{
	
	afterInitialDataFetch: function() {
		if (this.energyBillProrateDrilldown_meters.gridRows.length == 1) {
			this.energyBillProrateDrilldown_meters_onSelect(this.energyBillProrateDrilldown_meters.gridRows.get(0));
		}
	},
	
	energyBillProrateDrilldown_meters_onSelect:function(row) {
		var record = row.getRecord();
		var date_service_start = record.getValue('bill.date_service_start');
		var date_service_end = record.getValue('bill.date_service_end');
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause('bas_data_clean_num.date_measured', FormattingDate(date_service_start.getDate(), date_service_start.getMonth()+1, date_service_start.getFullYear(), 'YYYY-MM-DD'), '>=');
		restriction.addClause('bas_data_clean_num.date_measured', FormattingDate(date_service_end.getDate(), date_service_end.getMonth()+1, date_service_end.getFullYear(), 'YYYY-MM-DD'), '<=');
		
		var data_point_id = record.getValue('bill_line.data_point_id');
		var meters_to_include = record.getValue('bill_line.meters_to_include');
		var meters_to_exclude = record.getValue('bill_line.meters_to_exclude');
		if (meters_to_include != "" && (isNaN(meters_to_include) || meters_to_exclude != "")) {
			View.alert(getMessage('virtualMeterMultiple'));
			return;
		} else if (meters_to_include != "") {
			restriction.addClause('bas_data_clean_num.data_point_id', meters_to_include);
		} else {
			restriction.addClause('bas_data_clean_num.data_point_id', data_point_id);
		}	
		
		var title = FormattingDate(date_service_start.getDate(), date_service_start.getMonth()+1, date_service_start.getFullYear(), strDateShortPattern) 
						+ '-' 
						+ FormattingDate(date_service_end.getDate(), date_service_end.getMonth()+1, date_service_end.getFullYear(), strDateShortPattern);
		var vn_rate_desc = record.getValue('vn_rate.vn_rate_desc');
		var months = record.getValue('vn_rate.months');
		var hours = record.getValue('vn_rate.hours');
		if (months != "") {
			months = months.replace(/;/g,",");
			this.energyBillProrateDrilldown_readings.addParameter('months', months);
			//title += " - " + getMessage('forMonths') + ": " + months;
		} else {
			this.energyBillProrateDrilldown_readings.addParameter('months', this.allMonths);
		}
		if (hours != "") {
			hours = hours.replace(/;/g,",");
			this.energyBillProrateDrilldown_readings.addParameter('hours', hours);
			title += " - " + vn_rate_desc;
			//title += " " + getMessage('forHours') + ": " + hours;
		} else {
			this.energyBillProrateDrilldown_readings.addParameter('hours', this.allHours);
		}
		
		this.energyBillProrateDrilldown_readings.refresh(restriction);
		this.energyBillProrateDrilldown_readings.appendTitle(title);
		
		var rollup_type = record.getValue('bill_unit.rollup_type');
		if (rollup_type == 'Power') this.energyBillProrateDrilldown_readings.showColumn('bas_data_clean_num.delta', false);
		else this.energyBillProrateDrilldown_readings.showColumn('bas_data_clean_num.delta', true);
		this.energyBillProrateDrilldown_readings.update();
		
	}
});
