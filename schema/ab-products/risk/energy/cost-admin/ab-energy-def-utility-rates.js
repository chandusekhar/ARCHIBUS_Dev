var energyDefUtilityRatesController = View.createController('energyDefUtilityRates', {
	selected_date_start: '',
	selected_vn_id: '',
	selected_vn_ac_id: '',
	
	energyDefUtilityRates_contracts_onViewRates: function(row, action) {
		var record = row.getRecord();
		setPanelTitleFields(record);
    	var restriction = getChargeRestriction(record);
    	this.energyDefUtilityRates_rates.refresh(restriction);
	},
	
	energyDefUtilityRates_rates_afterRefresh: function() {
		var date_start = this.selected_date_start;
		var day = date_start.substring(8, 10);
		var month = date_start.substring(5, 7);
		var year = date_start.substring(0, 4);
		date_start = FormattingDate(day, month, year, strDateShortPattern);
		var title = String.format(getMessage('vendorRatesTitle'), this.selected_vn_id, this.selected_vn_ac_id, date_start);
		this.energyDefUtilityRates_rates.appendTitle(title);
		
		if (this.energyDefUtilityRates_rates.rows.length == 0 && this.energyDefUtilityRates_rates.restriction) {
			this.energyDefUtilityRates_rates_onAddNew();
		}
	},
	
	energyDefUtilityRates_rates_onAddNew: function() {
		View.openDialog('ab-energy-def-utility-rates-edit.axvw', this.energyDefUtilityRates_rates.restriction, true, {
			width: 1000,
			closeButton: true,
	        callback: function(record) {// note: callback is necessary due to openDialog in energyDefUtilityRates_rates.afterRefresh
	        	vendorRatesEditDialogCallback(record);
	        }
	    });
	},
	
	energyDefUtilityRates_contracts_onAddNew: function() {
		View.openDialog('ab-energy-def-utility-contracts-edit.axvw', null, true, {
	        closeButton: true,
	        callback: function(record) {
	        	vendorRatesEditDialogCallback(record);
	        }
	    });
	},
	
	energyDefUtilityRates_contracts_onEditContract: function(row, action) {
		var record = row.getRecord();
		var restriction = getContractRestriction(record);
		View.openDialog('ab-energy-def-utility-contracts-edit.axvw', restriction, false, {
	        closeButton: true,
	        copyContract: function(templateContractId, newContractId) {
	        	View.controllers.get('energyDefUtilityRates').copyContractVendorRates(templateContractId, newContractId);
	        },
	        callback: function(record) {
	        	vendorRatesEditDialogCallback(record);
	        }
	    });
	},
	
	copyContractVendorRates: function(templateContractId, newContractId) {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('vn_rate.vn_svcs_contract_id', templateContractId);
		var records = this.energyDefUtilityRates_ds2.getRecords(restriction);
		for (i = 0; i < records.length; i++) {
			records[i].setValue('vn_rate.vn_svcs_contract_id', newContractId);
			records[i].setValue('vn_rate.vn_rate_id', '');
			this.energyDefUtilityRates_ds2.saveRecord(records[i]);
		}
	},
	
	energyDefUtilityRates_rates_onEditVendorCharge: function(obj) {
		var vn_rate_id = obj.restriction['vn_rate.vn_rate_id'];	
		var record = this.energyDefUtilityRates_ds2.getRecord(obj.restriction);
		var block_ref = record.getValue('vn_rate.block_ref');
		var restriction = new Ab.view.Restriction();
		if (block_ref && block_ref > 0) restriction.addClause('vn_rate.vn_rate_id', block_ref);
		else restriction.addClause('vn_rate.vn_rate_id', vn_rate_id);
		View.openDialog('ab-energy-def-utility-rates-edit.axvw', restriction, false, {
			width: 1000,
	        closeButton: true,
	        callback: function(record) {
	        	vendorRatesEditDialogCallback(record);
	        }
	    });
	}
});

function vendorRatesEditDialogCallback(record) {
	View.closeDialog();
	
	var controller = View.controllers.get('energyDefUtilityRates');
	controller.energyDefUtilityRates_contracts.refresh();	
	if (record != null) {
		setPanelTitleFields(record);
		var restriction = getChargeRestriction(record);
		controller.energyDefUtilityRates_rates.refresh(restriction);
	} else {
		controller.energyDefUtilityRates_rates.refresh();
	}
}

function setPanelTitleFields(record) {
	var controller = View.controllers.get('energyDefUtilityRates');
	var date_start = record.getValue('vn_svcs_contract.date_start');
	if (date_start) controller.selected_date_start = getISODate(date_start);
	var vn_id = record.getValue('vn_svcs_contract.vn_id');
	if (vn_id) controller.selected_vn_id = vn_id;
	var vn_ac_id = record.getValue('vn_svcs_contract.vn_ac_id');
	if (vn_ac_id) controller.selected_vn_ac_id = vn_ac_id;
}

function getContractRestriction(record) {
	var vn_svcs_contract_id = record.getValue('vn_svcs_contract.vn_svcs_contract_id');
	var vn_id = record.getValue('vn_svcs_contract.vn_id');
	var vn_ac_id = record.getValue('vn_svcs_contract.vn_ac_id');
	var bill_type_id = record.getValue('vn_ac.bill_type_id');
	var date_start = record.getValue('vn_svcs_contract.date_start');
	var restriction = new Ab.view.Restriction();
	restriction.addClause('vn_svcs_contract.vn_svcs_contract_id', vn_svcs_contract_id);
	restriction.addClause('vn_svcs_contract.vn_id', vn_id);
	restriction.addClause('vn_svcs_contract.vn_ac_id', vn_ac_id);
	restriction.addClause('vn_ac.bill_type_id', bill_type_id);
	if (date_start) restriction.addClause('vn_svcs_contract.date_start', getISODate(date_start));
	return restriction;
}

function getChargeRestriction(record) {
	var vn_svcs_contract_id = record.getValue('vn_svcs_contract.vn_svcs_contract_id');
	var bill_type_id = record.getValue('vn_ac.bill_type_id');
	var restriction = new Ab.view.Restriction();
	restriction.addClause('vn_rate.vn_svcs_contract_id', vn_svcs_contract_id);
	restriction.addClause('vn_rate.bill_type_id', bill_type_id);
	return restriction;
}

function getISODate(date) {
	var month = date.getMonth()+1;
	var day = date.getDate();
	return date.getFullYear() + '-' + ((month<10)?'0'+month:month) + '-' + ((day<10)?'0'+day:day);
}
