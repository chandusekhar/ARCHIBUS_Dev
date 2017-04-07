var abEnergyBillUnitDefineCtrl = View.createController('abEnergyBillUnitDefineCtrl', {
	oldValueIsDefault: null,
	
	abEnergyBillUnitDefine_detailsPanel_beforeSave: function(){
		this.oldValueIsDefault = this.abEnergyBillUnitDefine_detailsPanel.getOldFieldValues()[("bill_unit.is_dflt")];
	},
	
	/**
	 * if Default=1, then all other records in 'bill_unit' must be set to Default=0
	 */
	reSetDefaultValue: function(){
		var editPanel = this.abEnergyBillUnitDefine_detailsPanel;
		var isDefault = editPanel.getFieldValue('bill_unit.is_dflt');
		var bill_unit_id = editPanel.getFieldValue('bill_unit.bill_unit_id');
		var rollup_type = editPanel.getFieldValue('bill_unit.rollup_type');
		
		if (isDefault && isDefault == "1" && this.oldValueIsDefault != "1") {
			var grid = this.abEnergyBillUnitDefine_bottomPanel;
			var records = [];
			grid.gridRows.each(function(row){
				var record = row.getRecord();
				if (record.getValue("bill_unit.rollup_type") == rollup_type
						&& record.getValue("bill_unit.bill_unit_id") != bill_unit_id) {
					record.setValue("bill_unit.is_dflt","0");
					records.push(record);
				}
			});
	 		this.abEnergyBillUnitDefine_ds.saveRecords(records);
		}
	}
});
