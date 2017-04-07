var energyBillVsMeterReadingsController = View.createController('energyBillVsMeterReadings',{
	openerRecord: null,
	table_name: 'bill',
	allMonths:'1,2,3,4,5,6,7,8,9,10,11,12',
	allHours:'0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23',
		
	afterInitialDataFetch: function() {	
		this.table_name = View.parameters.tableName;
		var title = String.format(getMessage('titleView'), getMessage(this.table_name));
		View.setTitle(title);
		this.openerRecord = View.parameters.openerRecord;
		var vn_id = this.openerRecord.getValue('bill.vn_id');
		var bill_id = this.openerRecord.getValue('bill.bill_id');
		var bill_line_id = "";
		if (this.table_name == 'bill_line') {
			bill_line_id = this.openerRecord.getValue('bill_line.bill_line_id');
		}
		var groupField = "";
		var groupFieldValue = "";
		if (View.parameters.groupField) groupField = View.parameters.groupField;
		if (View.parameters.groupFieldValue) groupFieldValue = View.parameters.groupFieldValue;
		var controller = this;
		var grid = this.energyBillVsMeterReadings_gridMeters;
		try { 
			var jobId = Workflow.startJob('AbRiskEnergyManagement-BillMeterReconciliationService-getMeterReadingsForGrid', controller.table_name, vn_id, bill_id, bill_line_id, groupField, groupFieldValue);					
			View.openJobProgressBar(getMessage('retrievingData'), jobId, '', function(status) {
				if (valueExists(status.dataSet.records)) {
					var records = status.dataSet.records;
					if (records.length > 0) {
						grid.setRecords(records);
						grid.show(true);
						grid.removeSorting();
						if (grid.gridRows.length == 1) {
							var row = grid.gridRows.get(0);
							controller.energyBillVsMeterReadings_gridMeters_onShowReadings(row);
							var record = row.getRecord(); 		   
							var readingsAction = row.actions.get('showReadings');		  
							readingsAction.show(false);							
						} 
					} else grid.refresh("1=2");
				} 
			});
		} catch (e) {
		    Workflow.handleError(e);
		}
	},
	
	energyBillVsMeterReadings_gridMeters_onShowReadings:function(row) {
		var dataPointRecord = row.getRecord();

		var date_service_start = this.openerRecord.getValue('bill.date_service_start');
		var date_service_end = this.openerRecord.getValue('bill.date_service_end');
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause('bas_data_clean_num.date_measured', FormattingDate(date_service_start.getDate(), date_service_start.getMonth()+1, date_service_start.getFullYear(), 'YYYY-MM-DD'), '>=');
		restriction.addClause('bas_data_clean_num.date_measured', FormattingDate(date_service_end.getDate(), date_service_end.getMonth()+1, date_service_end.getFullYear(), 'YYYY-MM-DD'), '<=');
		
		var data_point_id = dataPointRecord.getValue('bas_data_point.data_point_id');
		var meters_to_include = dataPointRecord.getValue('bas_data_point.meters_to_include');
		var meters_to_exclude = dataPointRecord.getValue('bas_data_point.meters_to_exclude');
		if (meters_to_include != "" && (isNaN(meters_to_include) || meters_to_exclude != "")) {
			View.alert(getMessage('virtualMeterMultiple'));
			return;
		} else if (meters_to_include != "") {
			restriction.addClause('bas_data_clean_num.data_point_id', meters_to_include);
		} else {
			restriction.addClause('bas_data_clean_num.data_point_id', data_point_id);
		}	
		
		var title = "";
		var instructions = null;
		title += ' ' + FormattingDate(date_service_start.getDate(), date_service_start.getMonth()+1, date_service_start.getFullYear(), strDateShortPattern) 
 			+ '-' 
 			+ FormattingDate(date_service_end.getDate(), date_service_end.getMonth()+1, date_service_end.getFullYear(), strDateShortPattern);
		if (this.table_name == 'bill_line') {
			var vn_rate_desc = this.openerRecord.getValue('vn_rate.vn_rate_desc');
			
			var months = this.openerRecord.getValue('vn_rate.months');
			var hours = this.openerRecord.getValue('vn_rate.hours');
			if (months != "") {
				months = months.replace(/;/g,",");
				this.energyBillVsMeterReadings_gridReadings.addParameter('months', months);

				if (!instructions) instructions = String.format(getMessage('rateApplies'), vn_rate_desc);
				instructions += " " + getMessage('forMonths') + " " + months;
			} else {
				this.energyBillVsMeterReadings_gridReadings.addParameter('months', this.allMonths);
			}
			if (hours != "") {
				hours = hours.replace(/;/g,",");
				this.energyBillVsMeterReadings_gridReadings.addParameter('hours', hours);

				if (!instructions) instructions = String.format(getMessage('rateApplies'), vn_rate_desc);
				instructions += " " + getMessage('forHours') + " " + hours;
			} else {
				this.energyBillVsMeterReadings_gridReadings.addParameter('hours', this.allHours);
			}
		}
		this.energyBillVsMeterReadings_gridReadings.refresh(restriction);		
		this.energyBillVsMeterReadings_gridReadings.appendTitle(title);
		if (instructions) this.energyBillVsMeterReadings_gridReadings.setInstructions(instructions);
		else this.energyBillVsMeterReadings_gridReadings.setInstructions(null);
		
		var rollup_type = dataPointRecord.getValue('bas_data_point.rollup_type');
		if (rollup_type == 'Power') this.energyBillVsMeterReadings_gridReadings.showColumn('bas_data_clean_num.delta', false);
		else this.energyBillVsMeterReadings_gridReadings.showColumn('bas_data_clean_num.delta', true);
		this.energyBillVsMeterReadings_gridReadings.update();
		
	}
});
