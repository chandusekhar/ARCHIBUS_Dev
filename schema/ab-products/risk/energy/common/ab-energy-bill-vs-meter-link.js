var energyBillVsMeterLinkController = View.createController('energyBillVsMeterLink',{
	afterInitialDataFetch: function() {
		this.energyBillVsMeterLink_grid_onShowGrid();
	},
	
	energyBillVsMeterLink_grid_onShowGrid: function() {
		if (View.parameters.vn_id) {
			var grid = this.energyBillVsMeterLink_grid;
			try { 
				var jobId = Workflow.startJob('AbRiskEnergyManagement-BillMeterReconciliationService-getLinkedMetersForGrid', View.parameters.vn_id, View.parameters.bill_id, "bill");					
				View.openJobProgressBar(getMessage('retrievingData'), jobId, '', function(status) {
					if (valueExists(status.dataSet.records)) {
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
		}
	},
	energyBillVsMeterLink_grid_onRemove:function() {
		var records = this.energyBillVsMeterLink_grid.getSelectedRecords();
		if (records.length == 0) {
			View.showMessage(getMessage('selectRecords'));
			return;
		}
		for (var i = 0; i < records.length; i++) {
			var record = records[i];
			record.setValue('bas_data_point.vn_id', '');
			record.setValue('bas_data_point.vn_ac_id', '');
			record.setValue('bas_data_point.vn_meter_id', '');
			this.energyBillVsMeterCommon_dsDataPoint.saveRecord(record);
		}
		this.energyBillVsMeterLink_grid_onShowGrid();
	},
	
	energyBillVsMeterLink_grid_onAdd: function() {
		this.energyBillVsMeterLink_console.clear();
		var restriction = new Ab.view.Restriction();
		restriction.addClause('bill.vn_id', View.parameters.vn_id);
		restriction.addClause('bill.bill_id', View.parameters.bill_id);
		var record = this.energyBillVsMeterCommon_dsBillBase.getRecord(restriction);
		var vn_ac_id = record.getValue('bill.vn_ac_id');
		this.energyBillVsMeterLink_console.show();
		this.energyBillVsMeterLink_console.setFieldValue('bas_data_point.vn_id', View.parameters.vn_id);
		this.energyBillVsMeterLink_console.setFieldValue('bas_data_point.vn_ac_id', vn_ac_id);
	},
	
	energyBillVsMeterLink_console_onAdd: function() {
		if (!this.energyBillVsMeterLink_console.canSave()) return;
		var restriction = new Ab.view.Restriction();
		restriction.addClause('bas_data_point.data_point_id', this.energyBillVsMeterLink_console.getFieldValue('bas_data_point.data_point_id'));
		var record = this.energyBillVsMeterCommon_dsDataPoint.getRecord(restriction);
		record.setValue('bas_data_point.vn_id', this.energyBillVsMeterLink_console.getFieldValue('bas_data_point.vn_id'));
		record.setValue('bas_data_point.vn_ac_id', this.energyBillVsMeterLink_console.getFieldValue('bas_data_point.vn_ac_id'));
		record.setValue('bas_data_point.vn_meter_id', this.energyBillVsMeterLink_console.getFieldValue('bas_data_point.vn_meter_id'));
		this.energyBillVsMeterCommon_dsDataPoint.saveRecord(record);
		this.energyBillVsMeterLink_grid_onShowGrid();
	}
});
