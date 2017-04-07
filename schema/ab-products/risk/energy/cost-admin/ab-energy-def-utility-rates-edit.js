var energyDefUtilityRatesEditController = View.createController('energyDefUtilityRatesEdit', {
	levels: 0,
	existingBlockRecords: [],
	
	getExistingBlockRecords: function(form) {
		if (!form.newRecord) {
			var vn_rate_id = form.getFieldValue('vn_rate.vn_rate_id');
			var restriction = new Ab.view.Restriction();
			restriction.addClause('vn_rate.block_ref', vn_rate_id);
			restriction.addClause('vn_rate.block', 0, '>');		
			this.existingBlockRecords = this.energyDefUtilityRatesEdit_ds1.getRecords(restriction);
		}
	},
	
	energyDefUtilityRatesEdit_form1_afterRefresh: function() {
		this.getExistingBlockRecords(this.energyDefUtilityRatesEdit_form1);
		
		if (!this.energyDefUtilityRatesEdit_form1.newRecord) {
			this.energyDefUtilityRatesEdit_form1.showField('vn_rate.vn_rate_id', true);
			var vn_rate_type = this.energyDefUtilityRatesEdit_form1.getFieldValue('vn_rate.vn_rate_type');
			if (vn_rate_type == 'SalesTax') {
				$('vnChgType_salesTax').checked = true;
				//this.energyDefUtilityRatesEdit_form1.showField('vn_rate.bill_unit_id', false);
			} else if (vn_rate_type == 'Other') {
				$('vnChgType_other').checked = true;
			} else if (vn_rate_type == 'Energy') {
				$('vnChgType_consumption').checked = true;
			} else if (vn_rate_type == 'Power') {
				$('vnChgType_demand').checked = true;
			} else if (vn_rate_type == 'Volume') {
				$('vnChgType_volume').checked = true;
			}
		} else {
			$('vnChgType_consumption').checked = false;
			this.energyDefUtilityRatesEdit_form1.showField('vn_rate.vn_rate_desc', false);
			this.energyDefUtilityRatesEdit_form1.showField('vn_rate.bill_unit_id', false);
			this.energyDefUtilityRatesEdit_form1.showField('vn_rate.description', false);
			this.energyDefUtilityRatesEdit_form1.showField('vn_rate.vn_rate_id', false);
		}
	},
	
	energyDefUtilityRatesEdit_form1_beforeSave: function() {
		if (!chargeTypeSelected()) {
			View.alert(getMessage('requiredFieldsNotFound'));
			return false;
		}
		this.saveBlockRecords(this.energyDefUtilityRatesEdit_form1);
	},
	
	saveBlockRecords: function(form) {
		for (var i = 1; i < this.existingBlockRecords.length; i++) {
			var record = this.existingBlockRecords[i];
			record.isNew = false;
			record.setValue('vn_rate.vn_rate_type', form.getFieldValue('vn_rate.vn_rate_type'));
			record.setValue('vn_rate.bill_type_id', form.getFieldValue('vn_rate.bill_type_id'));
			record.setValue('vn_rate.bill_unit_id', form.getFieldValue('vn_rate.bill_unit_id'));
			record.setValue('vn_rate.rollup_type', form.getFieldValue('vn_rate.rollup_type'));
			record.setValue('vn_rate.description', form.getFieldValue('vn_rate.description'));
			record.setValue('vn_rate.months', form.getFieldValue('vn_rate.months'));
			record.setValue('vn_rate.hours', form.getFieldValue('vn_rate.hours'));
			this.energyDefUtilityRatesEdit_ds1.saveRecord(record);
		}		
	},
	
	deleteBlockRecords: function(form) {
		for (var i = 1; i < this.existingBlockRecords.length; i++) {
			var record = this.existingBlockRecords[i];
			this.energyDefUtilityRatesEdit_ds1.deleteRecord(record);
		}		
	},
	
	energyDefUtilityRatesEdit_form1_onDelete: function() {
		var controller = this;
		View.confirm(getMessage('confirmDelete'), function(button){
            if (button == 'yes') {
            	if (!controller.energyDefUtilityRatesEdit_form1.deleteRecord()) return;
            	controller.deleteBlockRecords(controller.energyDefUtilityRatesEdit_form1);
        		refreshOpener(null);
            }
            else {
                
            }
        });
	},
	
	energyDefUtilityRatesEdit_form2_afterRefresh: function() {
		var form = this.energyDefUtilityRatesEdit_form2;
		
		this.hideAllBlockFields();
		this.getExistingBlockRecords(form);		
		
		var vn_rate_type = form.getFieldValue('vn_rate.vn_rate_type');
		if (vn_rate_type == 'SalesTax') {
			form.actions.get('finish').show(true);
			form.actions.get('next').show(false);
			
			Ext.get('decliningBlock1').dom.parentNode.parentNode.style.display = 'none';
		} else { 
			form.actions.get('finish').show(false);
			form.actions.get('next').show(true);
			
			form.showField('vn_rate.cost_unit', true);
			Ext.get('decliningBlock1').dom.parentNode.parentNode.style.display = '';
			$('decliningBlock1').checked = false;
		}	
		
		this.showExistingBlockRecords();
	},
	
	hideAllBlockFields: function() {
		for (var i = 1; i <= 5; i++ ) {
			showBlockLevel(i, false);
		}
	},
	
	showExistingBlockRecords: function() {
		this.levels = 0;
		for (var i = 1; i < this.existingBlockRecords.length; i++ ) {
			onAddDecliningBlock(i, this.existingBlockRecords);
		}
	},
	
	energyDefUtilityRatesEdit_form2_beforeSave: function() {
		this.deleteRemovedBlockRecords();
		
		var form = this.energyDefUtilityRatesEdit_form2;
		var vn_rate_type = form.getFieldValue('vn_rate.vn_rate_type');
		if (vn_rate_type == 'SalesTax') {
			form.setFieldValue('vn_rate.cost_unit', 0);
			form.setFieldValue('vn_rate.block', 0);
			form.setFieldValue('vn_rate.lower_threshold', '');
			form.setFieldValue('vn_rate.upper_threshold', '');
			form.setFieldValue('vn_rate.block_ref', '');				
		} else {
			if (this.levels < 2) {
				form.setFieldValue('vn_rate.tax_rate', 0);
				form.setFieldValue('vn_rate.block', 0);
				form.setFieldValue('vn_rate.upper_threshold', '');
				form.setFieldValue('vn_rate.lower_threshold', '');
				form.setFieldValue('vn_rate.block_ref', '');
			} else {
				if (!this.setDecliningBlocksRateStructure()) return false;
			}
		} 		
	},
	
	deleteRemovedBlockRecords: function() {
		for (var i = 2; i <= this.existingBlockRecords.length; i++) {
			if (i > this.levels) {
				this.energyDefUtilityRatesEdit_ds1.deleteRecord(this.existingBlockRecords[i-1]);
			}
		}
	},
	
	setDecliningBlocksRateStructure: function() {
		if (!this.validateBlockFields()) return false;
		
		var form = this.energyDefUtilityRatesEdit_form2;
		form.setFieldValue('vn_rate.tax_rate', 0);		
		form.setFieldValue('vn_rate.cost_unit', form.getFieldValue('vn_rate.cost_unit.level1'));
		form.setFieldValue('vn_rate.block', 1);
		form.setFieldValue('vn_rate.lower_threshold', form.getFieldValue('vn_rate.lower_threshold.level1'));
		form.setFieldValue('vn_rate.upper_threshold', form.getFieldValue('vn_rate.upper_threshold.level1'));
		form.setFieldValue('vn_rate.block_ref', form.getFieldValue('vn_rate.vn_rate_id'));
		
		var record = null;
		for (var i = 2; i <= this.levels; i++) {
			if (this.existingBlockRecords.length >= i) { // modify existing block record
				record = this.existingBlockRecords[i-1];
				record.isNew = false;
			} else { // create new duplicate record
				record = this.energyDefUtilityRatesEdit_ds1.getRecord(this.energyDefUtilityRatesEdit_form2.restriction);
				record.setValue('vn_rate.vn_rate_id', '');
				record.isNew = true;
			}
			record.setValue('vn_rate.cost_unit', form.getFieldValue('vn_rate.cost_unit.level' + i));
			record.setValue('vn_rate.block', i);
			record.setValue('vn_rate.vn_rate_desc', form.getFieldValue('vn_rate.vn_rate_desc.level' + i));
			record.setValue('vn_rate.lower_threshold', form.getFieldValue('vn_rate.lower_threshold.level' + i));
			record.setValue('vn_rate.upper_threshold', form.getFieldValue('vn_rate.upper_threshold.level' + i));
			record.setValue('vn_rate.block_ref', form.getFieldValue('vn_rate.vn_rate_id'));
			this.energyDefUtilityRatesEdit_ds1.saveRecord(record);
		}
		return true;
	},
	
	validateBlockFields: function() {
		var valid = true;
		var form = this.energyDefUtilityRatesEdit_form2;
		form.clearValidationResult();
		for (var i = 1; i <= this.levels; i++) {
			var cost_unit = form.getFieldValue('vn_rate.cost_unit.level' + i);
			var vn_rate_desc = form.getFieldValue('vn_rate.vn_rate_desc.level' + i);
			var lower_threshold = form.getFieldValue('vn_rate.lower_threshold.level' + i);
			var upper_threshold = form.getFieldValue('vn_rate.upper_threshold.level' + i);
			if (vn_rate_desc == '' && i > 1) {
				form.addInvalidField('vn_rate.vn_rate_desc.level' + i, '');				
				valid = false;
			}
			if (lower_threshold == '') {
				form.addInvalidField('vn_rate.lower_threshold.level' + i, '');				
				valid = false;
			}
			if (upper_threshold == '' && i < this.levels) {
				form.addInvalidField('vn_rate.upper_threshold.level' + i, '');
				valid = false;
			}
		}
		form.displayValidationResult('');
		if (!valid) View.alert(getMessage('requiredFieldsNotFound'));
		return valid;
	},
	
	energyDefUtilityRatesEdit_form3_afterRefresh: function() {
		this.getExistingBlockRecords(this.energyDefUtilityRatesEdit_form3);	
		
		var months = this.energyDefUtilityRatesEdit_form3.getFieldValue('vn_rate.months');
		var hours = this.energyDefUtilityRatesEdit_form3.getFieldValue('vn_rate.hours');
		if (months == '' && hours == '') {
			$('applyTimeOfUse_yes').checked = false;
			showTimeOfUseFields('none');
		} else {
			$('applyTimeOfUse_yes').checked = true;
			showTimeOfUseFields('');
			if (months) selectTimeOfUseFields(months, 'month');
			if (hours) selectTimeOfUseFields(hours, 'hour');
		}
	},
	
	energyDefUtilityRatesEdit_form3_beforeSave: function() {
		this.energyDefUtilityRatesEdit_form3.setFieldValue('vn_rate.months', getSelectedTimeOfUseFields('month', 12));
		this.energyDefUtilityRatesEdit_form3.setFieldValue('vn_rate.hours', getSelectedTimeOfUseFields('hour', 24));
		this.saveBlockRecords(this.energyDefUtilityRatesEdit_form3);
	}
});

function onChangeVnChgType() {
	var form = View.panels.get('energyDefUtilityRatesEdit_form1');
	form.showField('vn_rate.description', true);
	form.showField('vn_rate.vn_rate_desc', true);
	if ($('vnChgType_salesTax').checked) {
		form.setFieldValue('vn_rate.vn_rate_desc', getMessage('salesTax'));
		form.setFieldValue('vn_rate.bill_unit_id', 'NONE');
		form.showField('vn_rate.bill_unit_id', true);
		form.setFieldValue('vn_rate.rollup_type', 'None');
		form.setFieldValue('vn_rate.vn_rate_type', 'SalesTax');
	} else if ($('vnChgType_other').checked) {
		form.setFieldValue('vn_rate.vn_rate_desc', '');
		form.setFieldValue('vn_rate.bill_unit_id', '');
		form.showField('vn_rate.bill_unit_id', true);
		form.setFieldValue('vn_rate.rollup_type', 'None');
		form.setFieldValue('vn_rate.vn_rate_type', 'Other');
	} else if ($('vnChgType_consumption').checked) {
		form.setFieldValue('vn_rate.vn_rate_desc', '');
		form.showField('vn_rate.bill_unit_id', true);
		form.setFieldValue('vn_rate.bill_unit_id', '');
		form.setFieldValue('vn_rate.rollup_type', 'Energy');
		form.setFieldValue('vn_rate.vn_rate_type', 'Energy');
	} else if ($('vnChgType_demand').checked) {
		form.setFieldValue('vn_rate.vn_rate_desc', '');
		form.showField('vn_rate.bill_unit_id', true);
		form.setFieldValue('vn_rate.bill_unit_id', '');
		form.setFieldValue('vn_rate.rollup_type', 'Power');
		form.setFieldValue('vn_rate.vn_rate_type', 'Power');
	} else if ($('vnChgType_volume').checked) {
		form.setFieldValue('vn_rate.vn_rate_desc', '');
		form.showField('vn_rate.bill_unit_id', true);
		form.setFieldValue('vn_rate.bill_unit_id', '');
		form.setFieldValue('vn_rate.rollup_type', 'Volume');
		form.setFieldValue('vn_rate.vn_rate_type', 'Volume');
	}
}

function chargeTypeSelected() {
	var chargeTypeSelected = false;
	if ($('vnChgType_salesTax').checked) chargeTypeSelected = true;
	else if ($('vnChgType_other').checked) chargeTypeSelected = true;
	else if ($('vnChgType_consumption').checked) chargeTypeSelected = true;
	else if ($('vnChgType_demand').checked) chargeTypeSelected = true;
	else if ($('vnChgType_volume').checked) chargeTypeSelected = true;
	return chargeTypeSelected;
}

function onChangeApplyTimeOfUse() {
	if ($('applyTimeOfUse_yes').checked) {
		showTimeOfUseFields('');
	}
	else {
		showTimeOfUseFields('none');
	}
}

function showTimeOfUseFields(show) {
	var name = 'month';
	for (i = 1; i <= 12; i++) {
		Ext.get(name + i).dom.parentNode.parentNode.style.display = show;
		document.getElementById(name + i).checked = false;
	}
	
	name = 'hour';
	for (i = 1; i <= 24; i++) {
		Ext.get(name + i).dom.parentNode.parentNode.style.display = show;
		document.getElementById(name + i).checked = false;
	}
	View.panels.get("energyDefUtilityRatesEdit_form3").updateHeight();
}

function selectTimeOfUseFields(values, name) {
	var value = '';
	while (values.indexOf(';') > 0) {
		value = values.substring(0, values.indexOf(';'));
		value = Number(value);
		if (name == 'hour') {
			value += 1;
		}
		if (document.getElementById(name + value)) document.getElementById(name + value).checked = true;
		values = values.substring(values.indexOf(';') + 1);		
	}
	if (name == 'hour') {
		values = Number(values);
		values += 1;
	}
	if (document.getElementById(name + values)) document.getElementById(name + values).checked = true;
}

function getSelectedTimeOfUseFields(name, count) {
	var values = '';
	var value = 0;
	for (i = 1; i <= count; i++) {
		if (name == 'hour') {
			value = i - 1;
		} else {
			value = i;
		}
		if (document.getElementById(name + i).checked) values += (values?';':'') + value;
	}
	return values;
}

function onAddDecliningBlock(level, records) {
	var controller = View.controllers.get('energyDefUtilityRatesEdit');
	var form = View.panels.get('energyDefUtilityRatesEdit_form2');
		if (level == 1) {
			form.showField('vn_rate.cost_unit', false);
			form.showField('vn_rate.cost_unit.level1', true);
			form.showField('vn_rate.vn_rate_desc.level1', true);
			form.setFieldValue('vn_rate.cost_unit.level1',  form.getRecord().getLocalizedValue("vn_rate.cost_unit"));
			form.showField('vn_rate.lower_threshold.level1', true);
			form.showField('vn_rate.upper_threshold.level1', true);
			form.setFieldValue('vn_rate.lower_threshold.level1', 0);
			if (records) {
				var record = records[level-1];
				form.setFieldValue('vn_rate.lower_threshold.level1', record.getValue('vn_rate.lower_threshold'));
				form.setFieldValue('vn_rate.upper_threshold.level1', record.getValue('vn_rate.upper_threshold'));
			}			
		} else {
			form.fields.get('vn_rate.upper_threshold.level' + level).actions.get('delete_level' + level).show(false);
		}
		Ext.get('decliningBlock' + level).dom.parentNode.parentNode.style.display = 'none';
		var nextLevel = parseInt(level) + 1;
		controller.levels = nextLevel;
		showBlockLevel(nextLevel, true, records);
}

function deleteLevel(level) {
	var controller = View.controllers.get('energyDefUtilityRatesEdit');
	var form = View.panels.get('energyDefUtilityRatesEdit_form2');
	form.showField('vn_rate.cost_unit.level' + level, false);
	form.showField('vn_rate.vn_rate_desc.level' + level, false);
	form.showField('vn_rate.lower_threshold.level' + level, false);
	form.showField('vn_rate.upper_threshold.level' + level, false);
	if (Ext.get('decliningBlock' + level)) Ext.get('decliningBlock' + level).dom.parentNode.parentNode.style.display = 'none';
	var previousLevel = level - 1;
	controller.levels = previousLevel;
	if (Ext.get('decliningBlock' + previousLevel)) {
		Ext.get('decliningBlock' + previousLevel).dom.parentNode.parentNode.style.display = '';
		$('decliningBlock' + previousLevel).checked = false;
	}	
	if (previousLevel == 1) {
		form.showField('vn_rate.cost_unit', true);
		form.setFieldValue('vn_rate.cost_unit', form.getFieldValue('vn_rate.cost_unit.level1'));
		form.showField('vn_rate.cost_unit.level1', false);
		form.showField('vn_rate.vn_rate_desc.level1', false);
		form.showField('vn_rate.lower_threshold.level1', false);
		form.showField('vn_rate.upper_threshold.level1', false);
	} else {
		form.fields.get('vn_rate.upper_threshold.level' + previousLevel).actions.get('delete_level' + previousLevel).show(true);
	}
}

function showBlockLevel(level, show, records) {
	var form = View.panels.get('energyDefUtilityRatesEdit_form2');
	form.showField('vn_rate.cost_unit.level' + level, show);
	form.showField('vn_rate.vn_rate_desc.level' + level, show);
	form.showField('vn_rate.lower_threshold.level' + level, show);
	form.showField('vn_rate.upper_threshold.level' + level, show);
	if (Ext.get('decliningBlock' + level)) {
		Ext.get('decliningBlock' + level).dom.parentNode.parentNode.style.display = show?'':'none';
		$('decliningBlock' + level).checked = false;
	}
	if (show && records) {
		var record = records[level-1];
		form.setFieldValue('vn_rate.cost_unit.level' + level, record.getValue('vn_rate.cost_unit'));
		form.setFieldValue('vn_rate.vn_rate_desc.level' + level, record.getValue('vn_rate.vn_rate_desc'));
		form.setFieldValue('vn_rate.lower_threshold.level' + level, record.getValue('vn_rate.lower_threshold'));
		form.setFieldValue('vn_rate.upper_threshold.level' + level, record.getValue('vn_rate.upper_threshold'));
	}
	form.updateHeight();
}

function refreshOpener(record) {
	if(View.parameters.callback){
		View.parameters.callback(record);
	}
}