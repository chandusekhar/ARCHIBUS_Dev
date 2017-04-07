var energyBasEditPointController = View.createController('energyBasEditPoint', {
	multipleValueSeparator: Ab.form.Form.MULTIPLE_VALUES_SEPARATOR,
	metersToInclude: null,
	metersToExclude: null,
	virtualMeterMessage: '',
	
	events: {
		'change #energyBasEdit_dataPointForm_interval': function() {
			this.energyBasEdit_dataPointForm_onShowSelectedCheckboxValues();
		}
	},
	
	afterInitialDataFetch: function() {
		if (this.energyBasEdit_dataPointForm.newRecord) {
			this.energyBasEdit_scopeForm.show(false);
			this.energyBasEdit_vnForm.show(false);
			this.energyBasEdit_dataPointForm.enableField('bas_data_point.bill_unit_id', false);
			this.energyBasEdit_dataPointForm.enableFieldActions('bas_data_point.bill_unit_id', false);
			this.energyBasEdit_dataPointForm.setFieldValue('bas_data_point.sampling_interval', 900);
			this.energyBasEdit_dataPointForm.setFieldValue('bill_unit.rollup_type', '');
		}
		else {
			this.energyBasEdit_scopeForm.show(true);
			this.energyBasEdit_vnForm.show(true);
			var scope_data_point_id = this.energyBasEdit_scopeForm.getFieldValue('bas_measurement_scope.data_point_id');
			if (scope_data_point_id == '') this.refreshScopeFormWithNewId();
		}
		var interval = this.energyBasEdit_dataPointForm.getFieldValue('bas_data_point.sampling_interval');
		setSamplingIntervalOption(interval);

		var meters_to_include = this.energyBasEdit_dataPointForm.getFieldValue('bas_data_point.meters_to_include');
		if (meters_to_include) {
			$('isVirtualMeter_yes').checked = true;
			onChangeIsVirtualMeter();
			addZeroWidthDelimiter(this.energyBasEdit_dataPointForm, 'bas_data_point.meters_to_include');
			addZeroWidthDelimiter(this.energyBasEdit_dataPointForm, 'bas_data_point.meters_to_exclude');
		} else {
			$('isVirtualMeter_yes').checked = false;
			onChangeIsVirtualMeter();
		}
	},
	
	energyBasEdit_dataPointForm_afterRefresh: function() {
		addZeroWidthDelimiter(this.energyBasEdit_dataPointForm, 'bas_data_point.meters_to_include');
		addZeroWidthDelimiter(this.energyBasEdit_dataPointForm, 'bas_data_point.meters_to_exclude');		
	},
	
	refreshScopeFormWithNewId: function() {
		var id = this.energyBasEdit_dataPointForm.getFieldValue('bas_data_point.data_point_id');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('bas_measurement_scope.data_point_id', id);
		
		var treeController = View.getOpenerView().controllers.get('energyBasCommonTree');
		if (treeController) {
			restriction.addClause('bas_measurement_scope.site_id', treeController.site_id);
			restriction.addClause('bas_measurement_scope.bl_id', treeController.bl_id);			
		}		
		this.energyBasEdit_scopeForm.newRecord = true;
		this.energyBasEdit_scopeForm.refresh(restriction);	
		this.energyBasEdit_scopeForm_onSave();
	},
	
	energyBasEdit_dataPointForm_onSave: function() {
		var newRecord = false;
		if (this.energyBasEdit_dataPointForm.newRecord) newRecord = true;
		
		if (!this.validateVirtualFields()) return false;
		if (!this.energyBasEdit_dataPointForm.save()) return;
		
		addZeroWidthDelimiter(this.energyBasEdit_dataPointForm, 'bas_data_point.meters_to_include');
		addZeroWidthDelimiter(this.energyBasEdit_dataPointForm, 'bas_data_point.meters_to_exclude');
		
		var scope_data_point_id = this.energyBasEdit_scopeForm.getFieldValue('bas_measurement_scope.data_point_id');
		if (newRecord || scope_data_point_id == '') this.refreshScopeFormWithNewId();
		
		this.energyBasEdit_vnForm.refresh(this.energyBasEdit_dataPointForm.restriction, false);
		this.energyBasEdit_vnForm.show(true);
		
		refreshOpener();
		onChangeIsVirtualMeter();
	},
	
	energyBasEdit_dataPointForm_beforeSave: function() {
		removeZeroWidthDelimiter(this.energyBasEdit_dataPointForm, 'bas_data_point.meters_to_include');
		removeZeroWidthDelimiter(this.energyBasEdit_dataPointForm, 'bas_data_point.meters_to_exclude');
	},
	
	validateVirtualFields: function() {
		var form = this.energyBasEdit_dataPointForm;
		form.clearValidationResult();
		var meters_to_include = form.getFieldValue('bas_data_point.meters_to_include');
		var meters_to_exclude = form.getFieldValue('bas_data_point.meters_to_exclude');
		var billType = form.getFieldValue('bas_data_point.bill_type_id');
		var billUnit = form.getFieldValue('bas_data_point.bill_unit_id');
		var billRollupType = getRollupType(billType, billUnit);
		if ($('isVirtualMeter_yes').checked && !meters_to_include) {
			form.addInvalidField('bas_data_point.meters_to_include','');
			form.displayValidationResult('');
			View.alert(getMessage('requiredFieldsNotFound'));
			return false;
		}
		if ($('isVirtualMeter_yes').checked && meters_to_exclude && billRollupType == 'Power' && billType == 'ELECTRIC') {
			View.showMessage(getMessage('metersToExcludeNotAllowedForPower'));
			return false;
		}

		return true;
	},
	
	energyBasEdit_scopeForm_onSave: function() {
		if (!this.energyBasEdit_scopeForm.save()) return;
		this.populateAreaFromScope();
		
		this.energyBasEdit_dataPointForm.save();
		addZeroWidthDelimiter(this.energyBasEdit_dataPointForm, 'bas_data_point.meters_to_include');
		addZeroWidthDelimiter(this.energyBasEdit_dataPointForm, 'bas_data_point.meters_to_exclude');
		
		refreshOpener();
	},
	
	populateAreaFromScope: function() {
		var area = 0;
		
		var zone_id = this.energyBasEdit_scopeForm.getFieldValue('bas_measurement_scope.zone_id');
		var eq_id = this.energyBasEdit_scopeForm.getFieldValue('bas_measurement_scope.eq_id');		
		if (zone_id == '' && eq_id == '') {		
			var site_id = this.energyBasEdit_scopeForm.getFieldValue('bas_measurement_scope.site_id');
			var bl_id = this.energyBasEdit_scopeForm.getFieldValue('bas_measurement_scope.bl_id');	
			var fl_id = this.energyBasEdit_scopeForm.getFieldValue('bas_measurement_scope.fl_id');	
			var rm_id = this.energyBasEdit_scopeForm.getFieldValue('bas_measurement_scope.rm_id');	
			
			if (site_id != '') {
				area = this.getSiteArea(site_id);
			} 
			if (bl_id != '') {
				area = this.getBlArea(bl_id);
			}
			if (bl_id != '' && fl_id != '') {
				area = this.getFlArea(bl_id, fl_id);
			}
			if (bl_id != '' && fl_id != '' && rm_id != '') {
				area = this.getRmArea(bl_id, fl_id, rm_id);
			}
		}
		this.energyBasEdit_dataPointForm.setFieldValue('bas_data_point.area', area);
	},
	
	getSiteArea: function(site_id) {	
		var restriction = new Ab.view.Restriction();
		restriction.addClause('site.site_id', site_id);
		var record = this.energyBasEditPoint_dsSite.getRecord(restriction);
		return record.getValue('site.area_usable');
	},
	
	getBlArea: function(bl_id) {	
		var restriction = new Ab.view.Restriction();
		restriction.addClause('bl.bl_id', bl_id);
		var record = this.energyBasEditPoint_dsBl.getRecord(restriction);
		return record.getValue('bl.area_usable');
	},
	
	getFlArea: function(bl_id, fl_id) {	
		var restriction = new Ab.view.Restriction();
		restriction.addClause('fl.bl_id', bl_id);
		restriction.addClause('fl.fl_id', fl_id);
		var record = this.energyBasEditPoint_dsFl.getRecord(restriction);
		return record.getValue('fl.area_usable');
	},
	
	getRmArea: function(bl_id, fl_id, rm_id) {	
		var restriction = new Ab.view.Restriction();
		restriction.addClause('rm.bl_id', bl_id);
		restriction.addClause('rm.fl_id', fl_id);
		restriction.addClause('rm.rm_id', rm_id);
		var record = this.energyBasEditPoint_dsRm.getRecord(restriction);
		return record.getValue('rm.area');
	},
	
	energyBasEdit_scopeForm_onSelectZone: function(){
    	var controller = this;
    	var restriction = new Ab.view.Restriction();
    	var bl_id = this.energyBasEdit_scopeForm.getFieldValue('bas_measurement_scope.bl_id');
    	var fl_id = this.energyBasEdit_scopeForm.getFieldValue('bas_measurement_scope.fl_id');
    	if (bl_id) restriction.addClause('zone.bl_id', bl_id);
    	if (fl_id) restriction.addClause('zone.fl_id', fl_id);
    	View.openDialog('ab-energy-bas-select-add-zone.axvw', restriction, false, {
    		callback: function(record) {
    			var value = record.getValue('zone.zone_id');
    			var bl_id = record.getValue('zone.bl_id');
    			var fl_id = record.getValue('zone.fl_id');
    			controller.energyBasEdit_scopeForm.setFieldValue('bas_measurement_scope.zone_id', value);
    			if (bl_id) controller.energyBasEdit_scopeForm.setFieldValue('bas_measurement_scope.bl_id', bl_id);	
    			if (fl_id) controller.energyBasEdit_scopeForm.setFieldValue('bas_measurement_scope.fl_id', fl_id);	
    		}
    	});
    },
    
    energyBasEdit_vnForm_beforeSave: function() {
    	var duplicateLink = false;
    	var vn_id = this.energyBasEdit_vnForm.getFieldValue('bas_data_point.vn_id');
    	var vn_ac_id = this.energyBasEdit_vnForm.getFieldValue('bas_data_point.vn_ac_id');
    	var vn_meter_id = this.energyBasEdit_vnForm.getFieldValue('bas_data_point.vn_meter_id');
    	if (vn_id == '' && vn_ac_id == '' && vn_meter_id == '') return true;
    	else if (vn_id == '' || vn_ac_id == '' || vn_meter_id == '') {
    		View.showMessage(getMessage('allVnFieldsRequired'));
    		return false;
    	}
    		
    	var data_point_id = this.energyBasEdit_vnForm.getFieldValue('bas_data_point.data_point_id');
    	var rollup_type = this.energyBasEdit_vnForm.getFieldValue('bill_unit.rollup_type');
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause('bas_data_point.vn_id', vn_id);
    	restriction.addClause('bas_data_point.vn_ac_id', vn_ac_id);
    	restriction.addClause('bas_data_point.vn_meter_id', vn_meter_id);
    	restriction.addClause('bill_unit.rollup_type', rollup_type);
    	restriction.addClause('bas_data_point.data_point_id', data_point_id, '<>');
    	var records = this.energyBasEditPoint_ds0.getRecords(restriction);
    	if (records.length > 0) {
    		duplicateLink = true;
    		var message = '';
    		if (rollup_type == 'Power') message = getMessage('power');
    		else message = getMessage('consumption');
    		//View.showMessage(String.format(getMessage('meterAlreadyLinked'), message));
    	}
    	//return !duplicateLink;
    	return true;
    },
    
    energyBasEdit_dataPointForm_onShowSelectedCheckboxValues: function() {
        var interval = this.energyBasEdit_dataPointForm.getFieldValue('interval');
        setSamplingIntervalValue(interval);
    },
    
    energyBasEdit_dataPointForm_onMetersToIncludeSelval: function() {
    	View.selectValue({
    		formId: 'energyBasEdit_dataPointForm',
    		title: getMessage('titleMetersToIncludeSelval'),
    		fieldNames: ['bas_data_point.meters_to_include'],
    		selectTableName: 'bas_data_point',
    		selectFieldNames: ['bas_data_point.data_point_id'],
    		visibleFieldNames: ['bas_data_point.data_point_id', 'bas_data_point.name', 'bas_data_point.bill_type_id', 'bas_data_point.bill_unit_id', 'bill_unit.rollup_type', 'bas_data_point.sampling_interval', 'bas_data_point.meters_to_include', 'bas_data_point.meters_to_exclude', 'bas_data_point.vn_id', 'bas_data_point.vn_ac_id', 'bas_data_point.description'],
    		selectValueType: 'multiple',
    		actionListener: 'afterSelectMetersToIncludeExclude',
    		width: 1000,
    		height: 500
    	});
    },
    
    energyBasEdit_dataPointForm_onMetersToExcludeSelval: function() {
    	var billType = this.energyBasEdit_dataPointForm.getFieldValue('bas_data_point.bill_type_id');
		var billUnit = this.energyBasEdit_dataPointForm.getFieldValue('bas_data_point.bill_unit_id');
		var billRollupType = getRollupType(billType, billUnit);
		if (billType == 'ELECTRIC' && billRollupType == 'Power') {
			View.showMessage(getMessage('metersToExcludeNotAllowedForPower'));
			return;
		}
    	View.selectValue({
    		formId: 'energyBasEdit_dataPointForm',
    		title: getMessage('titleMetersToExcludeSelval'),
    		fieldNames: ['bas_data_point.meters_to_exclude'],
    		selectTableName: 'bas_data_point',
    		selectFieldNames: ['bas_data_point.data_point_id'],
    		visibleFieldNames: ['bas_data_point.data_point_id', 'bas_data_point.name', 'bas_data_point.bill_type_id', 'bas_data_point.bill_unit_id', 'bill_unit.rollup_type', 'bas_data_point.sampling_interval', 'bas_data_point.meters_to_include', 'bas_data_point.meters_to_exclude', 'bas_data_point.vn_id', 'bas_data_point.vn_ac_id', 'bas_data_point.description'],
    		selectValueType: 'multiple',
    		actionListener: 'afterSelectMetersToIncludeExclude',
    		width: 1000,
    		height: 500
    	});
    },
    
	setMeters: function(meters_to_include, meters_to_exclude) {
		this.metersToInclude = [];
		this.metersToExclude = [];
		var tempMetersToInclude = [];
		var tempMetersToExclude = [];
		if (meters_to_include) {
			tempMetersToInclude = meters_to_include.split(this.multipleValueSeparator);			
		}
		if (meters_to_exclude) {
			tempMetersToExclude = meters_to_exclude.split(this.multipleValueSeparator);			
		}
		for (var i = 0; i < tempMetersToInclude.length; i++) {
			this.addNestedMeters(tempMetersToInclude[i], 'INCLUDE')
		}
		for (var i = 0; i < tempMetersToExclude.length; i++) {
			this.addNestedMeters(tempMetersToExclude[i], 'EXCLUDE')
		}
		return true;
	},
	
	addNestedMeters: function(id, type) {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('bas_data_point.data_point_id', id);
		var record = this.energyBasEditPoint_ds0.getRecord(restriction);	
		
		var meters_to_include = record.getValue('bas_data_point.meters_to_include');
		if (meters_to_include) {
			var nestedMetersToInclude = meters_to_include.split(this.multipleValueSeparator);
			for (var i = 0; i < nestedMetersToInclude.length; i++) {
				if (type == 'INCLUDE') {
					this.metersToInclude.push(nestedMetersToInclude[i])
				} else this.metersToExclude.push(nestedMetersToInclude[i]);
			}
		} 
		var meters_to_exclude = record.getValue('bas_data_point.meters_to_exclude');
		if (meters_to_exclude) {
			var nestedMetersToExclude = meters_to_exclude.split(this.multipleValueSeparator);
			for (var i = 0; i < nestedMetersToExclude.length; i++) {
				if (type == 'INCLUDE') {
					this.metersToExclude.push(nestedMetersToExclude[i])
				} else this.metersToInclude.push(nestedMetersToExclude[i]);
			}
		}
		if (meters_to_include == "" && meters_to_exclude == "") {
			if (type == 'INCLUDE') {
				this.metersToInclude.push(id);
			} else this.metersToExclude.push(id);
		} else {
			var meterList = meters_to_include + (meters_to_exclude?') - (':'')+ meters_to_exclude;
			if (this.virtualMeterMessage == '') this.virtualMeterMessage = getMessage('virtualMeterSelected');
			this.virtualMeterMessage += '  ' + String.format(getMessage('virtualMeterToComponentMeters'), id, meterList);
		}
		return true;
	}
});

function afterSelectMetersToIncludeExclude(fieldName, selectedValue) {
	var controller = View.controllers.get('energyBasEditPoint');
	var form = View.panels.get('energyBasEdit_dataPointForm');
	var meters_to_include = "";
	var meters_to_exclude = "";
	
	if (fieldName == 'bas_data_point.meters_to_include') {		
		meters_to_include = selectedValue;
		meters_to_exclude = form.getFieldValue('bas_data_point.meters_to_exclude');
	} else {
		meters_to_include = form.getFieldValue('bas_data_point.meters_to_include');
		meters_to_exclude = selectedValue;
	}
		
	if (selectedValue) {			
		controller.setMeters(meters_to_include, meters_to_exclude);
		form.setFieldValue('bas_data_point.meters_to_include', getStrMeters(controller.metersToInclude));
		form.setFieldValue('bas_data_point.meters_to_exclude', getStrMeters(controller.metersToExclude));
	} else {
		form.setFieldValue(fieldName, '');
	}
	if (controller.virtualMeterMessage != '') View.showMessage(controller.virtualMeterMessage);
	controller.virtualMeterMessage = '';
	return false;
}

function getStrMeters(meters) {
	var controller = View.controllers.get('energyBasEditPoint');
	var strMeters = "";
	for (var i = 0; i < meters.length; i++) {
		if (strMeters != "") strMeters += controller.multipleValueSeparator;
		strMeters += meters[i];
	}
	return strMeters;
}

function onChangeBillType() {
	var form = View.panels.get('energyBasEdit_dataPointForm');
	if ($('selectBillType').value == 'CONSUMPTION') {
		form.setFieldValue('bas_data_point.bill_type_id', 'ELECTRIC');
		form.setFieldValue('bas_data_point.bill_unit_id', 'KWH');
	} else {
		form.setFieldValue('bas_data_point.bill_type_id', 'ELECTRIC');
		form.setFieldValue('bas_data_point.bill_unit_id', 'KW');
	}
}

function onChangeIsVirtualMeter() {
	var form = View.panels.get('energyBasEdit_dataPointForm');
	if ($('isVirtualMeter_yes').checked) {
		form.showField('bas_data_point.meters_to_include', true);
		form.showField('bas_data_point.meters_to_exclude', true);
		form.enableField('bas_data_point.meters_to_include', false);
		form.enableField('bas_data_point.meters_to_exclude', false);
		form.enableFieldActions('bas_data_point.meters_to_include', true);
		form.enableFieldActions('bas_data_point.meters_to_exclude', true);
	} else {
		form.showField('bas_data_point.meters_to_include', false);
		form.showField('bas_data_point.meters_to_exclude', false);
		form.setFieldValue('bas_data_point.meters_to_include', '');
		form.setFieldValue('bas_data_point.meters_to_exclude', '');
	}
}

function onChangeSelectUnit(fieldName,newValue,oldValue){
	var form = View.panels.get('energyBasEdit_dataPointForm');
	var value = '';
	if(valueExistsNotEmpty(newValue)){
		value = newValue;
	}else{
		value = form.getFieldValue('bas_data_point.bill_type_id');		
	}
	if (valueExistsNotEmpty(value)){
		form.enableField('bas_data_point.bill_unit_id', true);
		form.enableFieldActions("bas_data_point.bill_unit_id",true);
		form.setFieldValue('bas_data_point.bill_unit_id', '');
		form.setFieldValue('bill_unit.rollup_type', '');
	}else{
		form.setFieldValue('bas_data_point.bill_unit_id', '');
		form.setFieldValue('bill_unit.rollup_type', '');
		form.enableField('bas_data_point.bill_unit_id', false);
		form.enableFieldActions("bas_data_point.bill_unit_id",false);
	}
}

function setSamplingIntervalOption(samplingIntervalValue){
	var form = View.panels.get('energyBasEdit_dataPointForm');
	var selectedOption = 'other';
	if(parseInt(samplingIntervalValue) == 900){
		selectedOption = 'minute';
	}else if(parseInt(samplingIntervalValue) == 3600){
		selectedOption = 'hourly';	
	}else if(parseInt(samplingIntervalValue) == 86400){
		selectedOption = 'daily';	
	}else if(parseInt(samplingIntervalValue) == 604800){
		selectedOption = 'weekly';	
	}else if(parseInt(samplingIntervalValue) == 2592000){
		selectedOption = 'monthly';	
	}else if(parseInt(samplingIntervalValue) == 7776000){
		selectedOption = 'quarterly';	
	}else if(parseInt(samplingIntervalValue) == 31536000){
		selectedOption = 'yearly';
	}
	
	form.setFieldValue('interval', selectedOption);
	form.enableField('bas_data_point.sampling_interval', selectedOption == 'other');
}

function setSamplingIntervalValue(samplingIntervalOption){
	var form = View.panels.get('energyBasEdit_dataPointForm');
	form.enableField('bas_data_point.sampling_interval', false);
	switch(samplingIntervalOption){
	case "minute": 
		form.setFieldValue('bas_data_point.sampling_interval', 900);
		break;
	case "hourly": 
		form.setFieldValue('bas_data_point.sampling_interval', 3600);
		break;
	case "daily":
		form.setFieldValue('bas_data_point.sampling_interval', 86400);
		break;
	case "weekly": 
		form.setFieldValue('bas_data_point.sampling_interval', 604800);
		break;
	case "monthly": 
		form.setFieldValue('bas_data_point.sampling_interval', 2592000);
		break;
	case "quarterly":
		form.setFieldValue('bas_data_point.sampling_interval', 7776000);
		break;
	case "yearly": 
		form.setFieldValue('bas_data_point.sampling_interval', 31536000);
		break;
	case "other":
		form.enableField('bas_data_point.sampling_interval', true);
		form.setFieldValue('bas_data_point.sampling_interval', '');
		break;
	}
}

function refreshOpener() {
	View.getOpenerView().panels.get('energyBasEdit_select').refresh();
	var treePanel = View.getOpenerView().panels.get('energyBasCommonTree_ctryTree');
	if (treePanel) treePanel.refresh();
}

function energyBasEdit_vnForm_vnAcSelval() {
	var controller = View.controllers.get('energyBasEditPoint');
	var site_id = controller.energyBasEdit_scopeForm.getFieldValue('bas_measurement_scope.site_id');
	var bl_id = controller.energyBasEdit_scopeForm.getFieldValue('bas_measurement_scope.bl_id');
	if (site_id == '') site_id = '%'
	if (bl_id == '') bl_id = '%';
	var bill_type_id = controller.energyBasEdit_dataPointForm.getFieldValue('bas_data_point.bill_type_id');
	View.selectValue('energyBasEdit_vnForm',
			getMessage('vendorAccountCode'),
			['bas_data_point.vn_id','bas_data_point.vn_ac_id'],
			'vn_ac',
			['vn_ac.vn_id','vn_ac.vn_ac_id'],
			['vn_ac.vn_id','vn_ac.vn_ac_id','vn_ac.site_id','vn_ac.bl_id','vn_ac.bill_type_id'],
			"vn_ac.bill_type_id = '"+bill_type_id+"' AND (vn_ac.site_id LIKE '"+site_id+"' AND vn_ac.bl_id LIKE '"+bl_id+"')"
	);
}

function getRollupType(billType, billUnit) {
	var restriction = new Ab.view.Restriction();
	restriction.addClause('bill_unit.bill_type_id', billType);
	restriction.addClause('bill_unit.bill_unit_id', billUnit);
	var record = View.dataSources.get('energyBasEditPoint_dsUnit').getRecord(restriction);
	return record.getValue('bill_unit.rollup_type');
}

function removeZeroWidthDelimiter(form, fieldName) {
	var meters = form.getFieldValue(fieldName);
	var re = new RegExp(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR, 'g');
	meters = meters.replace(re, ',');
	form.setFieldValue(fieldName, meters);
}

function addZeroWidthDelimiter(form, fieldName) {
	var meters = form.getFieldValue(fieldName);
	if (meters.indexOf(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR) < 0) {
		meters = meters.replace(/,/g, Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
		form.setFieldValue(fieldName, meters);
	}
}