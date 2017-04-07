var energyBillVsMeterController = View.createController('energyBillVsMeter', {
	allMonths: '1,2,3,4,5,6,7,8,9,10,11,12',
	allHours: '0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23',
	
	afterViewLoad:function() {		
		var grid = this.energyBillVsMeter_gridBillLines;
		var controller = View.controllers.get('energyBillVsMeterCommon');
		
		grid.afterCreateCellContent = function(row, column, cellElement) {
		    var discrepancy = Number(row[column.id + '.raw']);
			if (column.id.indexOf('bill_line.discrepancy') >= 0 && discrepancy != '')	{
				if (discrepancy <= controller.report_limit_low_crit || discrepancy >= controller.report_limit_high_crit) {
					cellElement.style.background = '#FF3333';
				}
				else if (discrepancy <= controller.report_limit_low_warn || discrepancy >= controller.report_limit_high_warn)	{
					//cellElement.style.background = '#47DA47';
					cellElement.style.background = '#FFD633';
				}
			}
		}
		
		var billGrid = this.energyBillVsMeter_gridBill;
		
		billGrid.afterCreateCellContent = function(row, column, cellElement) {
		    var discrepancy = Number(row[column.id + '.raw']);
			if (column.id.indexOf('bill.discrepancy') >= 0 && discrepancy != '')	{
				if (discrepancy <= controller.report_limit_low_crit || discrepancy >= controller.report_limit_high_crit) {
					cellElement.style.background = '#FF3333';
				}
				else if (discrepancy <= controller.report_limit_low_warn || discrepancy >= controller.report_limit_high_warn)	{
					//cellElement.style.background = '#47DA47';
					cellElement.style.background = '#FFD633';
				}
			}
		}
	},
	
	afterInitialDataFetch: function() {
		this.getBillAndBillLineData();
	},
	
	getBillAndBillLineData: function() {
		var vn_id = this.energyBillVsMeter_billVariances.restriction.findClause('bill.vn_id').value;
		var bill_id = this.energyBillVsMeter_billVariances.restriction.findClause('bill.bill_id').value;
		View.setTitle(getMessage('viewTitle') + ' - ' + vn_id + " - " + bill_id);
		
		var controller = this;
		try {
			var jobId = Workflow.startJob('AbRiskEnergyManagement-BillMeterReconciliationService-getBillDiscrepancyRecordsForGrid', vn_id, bill_id, "");
			View.openJobProgressBar(getMessage('retrievingData'), jobId, '', function(status) {
				if (valueExists(status.dataSet.records)) {
					var grid = controller.energyBillVsMeter_gridBill;
					var records = status.dataSet.records;
					if (records.length > 0) {						
						grid.setRecords(records);
						grid.show(true);
						grid.removeSorting();
						var record = grid.gridRows.get(0).getRecord();
						var qty_volume_billed = record.getValue('bill.qty_volume_billed');
						var qty_energy_billed = record.getValue('bill.qty_energy_billed');
						if (qty_volume_billed == 0 && qty_energy_billed > 0) {
							grid.showColumn('bill.qty_volume_billed', false);
							grid.showColumn('bill.qty_volume_measured', false);
							grid.showColumn('bill.discrepancy_volume', false);
							grid.showColumn('bill.qty_energy_billed', true);
							grid.showColumn('bill.qty_energy_measured', true);
							grid.showColumn('bill.discrepancy_energy', true);
							grid.update();
						}
						
						if (qty_energy_billed == 0 && qty_volume_billed > 0) {
							grid.showColumn('bill.qty_energy_billed', false);
							grid.showColumn('bill.qty_energy_measured', false);
							grid.showColumn('bill.discrepancy_energy', false);
							grid.showColumn('bill.qty_volume_billed', true);
							grid.showColumn('bill.qty_volume_measured', true);
							grid.showColumn('bill.discrepancy_volume', true);
							grid.update();
						}
					} else grid.refresh("1=2");
				}
			});
		} catch (e) {
		    Workflow.handleError(e);
		}
		
		try { 
			var jobId = Workflow.startJob('AbRiskEnergyManagement-BillMeterReconciliationService-getBillLineDiscrepancyRecordsForGrid', vn_id, bill_id);				
			View.openJobProgressBar(getMessage('retrievingData'), jobId, '', function(status) {
				if (valueExists(status.dataSet.records)) {
					var grid = controller.energyBillVsMeter_gridBillLines;
					var records = status.dataSet.records;
					if (records.length > 0) {
						grid.setRecords(records);
						grid.show(true);
						grid.removeSorting();
					} else grid.refresh("1=2");
				} 
			});
		} catch (e) {
		    Workflow.handleError(e);
		}
	},
	
	energyBillVsMeter_gridBill_onLink: function() {
		var restriction = this.energyBillVsMeter_billVariances.restriction;
		var vn_id = restriction.findClause('bill.vn_id').value;
		var bill_id = restriction.findClause('bill.bill_id').value;
		View.openDialog('ab-energy-bill-vs-meter-link.axvw', null, false, {
			width:1000, 
			closeButton:true, 
			vn_id: vn_id,
			bill_id: bill_id
		});
	},
	
	energyBillVsMeter_gridBill_onRefresh: function() {
		this.getBillAndBillLineData();
	},
	
	energyBillVsMeter_gridBill_onShowReadings: function(row) {
		var record = row.getRecord();
		View.openDialog('ab-energy-bill-vs-meter-readings.axvw', null, false, {
			width: 1200,
	        height: 800,
	        closeButton: true,
	        tableName: 'bill',
			openerRecord: record
		});
	},
	
	energyBillVsMeter_gridBillLines_onShowReadings: function(row) {
		var record = row.getRecord();
		View.openDialog('ab-energy-bill-vs-meter-readings.axvw', null, false, {
			width: 1200,
	        height: 800,
	        closeButton: true,
	        tableName: 'bill_line',
			openerRecord: record
		});
	}
});