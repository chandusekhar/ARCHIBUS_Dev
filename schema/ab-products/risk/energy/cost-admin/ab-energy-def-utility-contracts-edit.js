var energyDefUtilityContractsEditController = View.createController('energyDefUtilityContractsEdit', {
	templateContractId: '',
	
	afterViewLoad: function() {
		if (!this.energyDefUtilityContractsEdit_form1.newRecord) {
			this.energyDefUtilityContractsEditTabs.showTab('energyDefUtilityContractsEdit_tab2', false);
		} 
	},
	
	energyDefUtilityContractsEdit_form1_beforeSave: function() {
		var vn_id = this.energyDefUtilityContractsEdit_form1.getFieldValue('vn_svcs_contract.vn_id');
		var vn_ac_id = this.energyDefUtilityContractsEdit_form1.getFieldValue('vn_svcs_contract.vn_ac_id');
		var date_start = this.energyDefUtilityContractsEdit_form1.getFieldValue('vn_svcs_contract.date_start');
		var date_end = this.energyDefUtilityContractsEdit_form1.getFieldValue('vn_svcs_contract.date_end');
		if (vn_id == '' || vn_ac_id == '' || date_start == '') {
			View.alert(getMessage('requiredFieldsNotFound'));
			return false;
		}
		if (date_end != '' && date_start > date_end) {
			View.alert(getMessage('dateStartBeforeEnd'));
			return false;
		}
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause('vn_svcs_contract.vn_id', vn_id);
    	restriction.addClause('vn_svcs_contract.vn_ac_id', vn_ac_id);
    	var records = this.energyDefUtilityContractsEdit_ds1.getRecords(restriction);
    	var thisContractId = this.energyDefUtilityContractsEdit_form1.getFieldValue('vn_svcs_contract.vn_svcs_contract_id');
    	for (i = 0; i < records.length; i++) {
    		if (thisContractId && thisContractId == records[i].getValue('vn_svcs_contract.vn_svcs_contract_id')) continue;
    		if (checkDateOverlap(date_start, date_end, records[i])) {
    			View.alert(getMessage('duplicateContract'));
    			return false;
    		}
    	}
    	return true;
	},
	
	energyDefUtilityContractsEdit_form1_onSave: function() {
		if (!this.energyDefUtilityContractsEdit_form1.save()) return;
		var record = this.energyDefUtilityContractsEdit_form1.getRecord();
		refreshOpener(record);
	},
	
	energyDefUtilityContractsEdit_form1_onDelete: function() {
		var vn_svcs_contract_id = this.energyDefUtilityContractsEdit_form1.getFieldValue('vn_svcs_contract.vn_svcs_contract_id');
		var controller = this;
		View.confirm(getMessage('confirmDelete'), function(button){
            if (button == 'yes') {
            	var restriction = new Ab.view.Restriction();
            	restriction.addClause('vn_rate.vn_svcs_contract_id', vn_svcs_contract_id);
            	var records = controller.energyDefUtilityContractsEdit_ds3.getRecords(restriction);
            	for (var i = 0; i < records.length; i++) {
            		controller.energyDefUtilityContractsEdit_ds3.deleteRecord(records[i]);
            	}
            	if (!controller.energyDefUtilityContractsEdit_form1.deleteRecord()) return;
            	setTimeout(function() {
            		View.getOpenerView().panels.get('energyDefUtilityRates_contracts').refresh();
            		View.getOpenerView().panels.get('energyDefUtilityRates_rates').show(false);
            		View.closeThisDialog();
            	}, 500);        		
            }
            else {
                
            }
        });
	},
	
	energyDefUtilityContractsEdit_form1_onCopy: function() {
		this.templateContractId = this.energyDefUtilityContractsEdit_form1.getFieldValue('vn_svcs_contract.vn_svcs_contract_id');
		this.energyDefUtilityContractsEditTabs.showTab('energyDefUtilityContractsEdit_tab2', true);
		
		var vn_id = this.energyDefUtilityContractsEdit_form1.getFieldValue('vn_svcs_contract.vn_id');
		var vn_ac_id = this.energyDefUtilityContractsEdit_form1.getFieldValue('vn_svcs_contract.vn_ac_id');
		var date_start = this.energyDefUtilityContractsEdit_form1.getFieldValue('vn_svcs_contract.date_start');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('vn_svcs_contract.vn_id', vn_id);
		restriction.addClause('vn_svcs_contract.vn_ac_id', vn_ac_id);
		this.energyDefUtilityContractsEdit_form1.refresh(restriction, true);
		
		var day = date_start.substring(8, 11);
		var month = date_start.substring(5, 8);
		var year = date_start.substring(0, 4);
		date_start = FormattingDate(day, month, year, strDateShortPattern);
		var description = String.format(getMessage('copyDescription'), vn_id, vn_ac_id, date_start);
		this.energyDefUtilityContractsEdit_form1.setFieldValue('vn_svcs_contract.description', description);
		this.energyDefUtilityContractsEdit_form1.setInstructions(getMessage('copyInstructions'));
	},
	
	energyDefUtilityContractsEdit_form1_onSaveNewRecord: function() {
		if (!this.energyDefUtilityContractsEdit_form1.save()) return;
		var openerController = View.getOpenerView().controllers.get('energyDefUtilityRates');
		openerController.energyDefUtilityRates_contracts.refresh();
		openerController.energyDefUtilityRates_rates.show(false);
		
		var newContractId = this.energyDefUtilityContractsEdit_form1.getFieldValue('vn_svcs_contract.vn_svcs_contract_id');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('vn_svcs_contract.vn_svcs_contract_id', newContractId);
		this.energyDefUtilityContractsEditTabs.setTabRestriction('energyDefUtilityContractsEdit_tab2', restriction);
		this.energyDefUtilityContractsEditTabs.selectTab('energyDefUtilityContractsEdit_tab2');
		
		if (this.templateContractId != '') {
			if (View.parameters.copyContract){
				View.parameters.copyContract(this.templateContractId, newContractId);
			}
		}
		this.templateContractId = '';
			
	},
	
	energyDefUtilityContractsEdit_form2_onFinish: function() {
		var record = this.energyDefUtilityContractsEdit_form1.getRecord();
		refreshOpener(record);
	}
});

function checkDateOverlap(dateStart1, dateEnd1, record2) {
	var duplicateContract = false;
	var ds = View.dataSources.get('energyDefUtilityContractsEdit_ds2');
	var dateStart2 = record2.getValue('vn_svcs_contract.date_start');
	var dateEnd2 = record2.getValue('vn_svcs_contract.date_end');
	var dateEnd1Rest = '';
	var dateEnd2Rest = '';
	if (dateEnd1) dateEnd1Rest = " AND cal_date <= ${sql.date('" + dateEnd1 + "')}";
	if (dateEnd2) dateEnd2Rest = " AND cal_date <= ${sql.date('" + getISODate(dateEnd2) + "')}";
	var restriction = "(cal_date >= ${sql.date('" + dateStart1  + "')}" + dateEnd1Rest + ") AND (cal_date >= ${sql.date('" + getISODate(dateStart2) + "')}" + dateEnd2Rest + ")";
	ds.addParameter('dateRestriction', restriction);
	var record = ds.getRecord();
	if (record.getValue('afm_cal_dates.count_dates') > 0) duplicateContract = true;
	return duplicateContract;
}

function getISODate(date) {
	var month = date.getMonth()+1;
	var day = date.getDate();
	return date.getFullYear() + '-' + ((month<10)?'0'+month:month) + '-' + ((day<10)?'0'+day:day);
}

function refreshOpener(record) {
	if(View.parameters.callback){
		View.parameters.callback(record);
	}
}