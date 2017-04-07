// Global variable
var abEamAssetIndividualColumnsVisibilityDef = new Ext.util.MixedCollection();
abEamAssetIndividualColumnsVisibilityDef.addAll(
		{id: 'eq_req_items.auto_number', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
		{id: 'eq_req_items.planning_id', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
		{id: 'eq_req_items.sb_name', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
		{id: 'eq_req_items.bu_id', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
		{id: 'eq_req_items.dv_id', visible: true, dfltVisible: true, hidden: false, sbLevels: ['dv', 'dp', 'fg']},
		{id: 'eq_req_items.dp_id', visible: true, dfltVisible: true, hidden: false, sbLevels: ['dp', 'fg']},
		{id: 'eq_req_items.description', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
		{id: 'eq_req_items.eq_id', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
		{id: 'eq_req_items.ta_id', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
		{id: 'eq_req_items.cost_est_baseline', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
		{id: 'eq_req_items.unit_area', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
		{id: 'eq_req_items.bl_id', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
		{id: 'eq_req_items.fl_id', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
		{id: 'eq_req_items.rm_id', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
		{id: 'eq_req_items.mfr', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
		{id: 'eq_req_items.modelno', visible: true, dfltVisible: true, hidden: false, sbLevels: null}
);

var abEamDefEqReqAssetController = View.createController('abEamDefEqReqAssetController', {
	// sb_name is project id
	sbName: null,
	
	sbLevel: null,
	
	sbRecord: null,
	
	isNewRecord: false,
	
	restriction: null,
	
	callbackMethod: null,
	
	isNewAsset: true,
	
	assetType: 'eq',
	
	visibleForm: null,
	
    /**
     * Maps DOM events to controller methods.
     */
    events: {
        'click input[type=radio]': function(input) {
            if (input.currentTarget.name === 'abDefEqReqItems_form_select_asset_type') {
                this.onSelectAssetType(input);
            }
            if (input.currentTarget.name === 'abDefEqReqItems_form_select_asset_new') {
                this.onSelectAssetNew(input);
            }
        }
    },
	
	afterViewLoad: function(){
		this.abDefEqReqItemsEq_form.addEventListener("onAutoCompleteSelect", onAutoCompleteSelect);
		this.abDefEqReqItemsTa_form.addEventListener("onAutoCompleteSelect", onAutoCompleteSelect);
		// set label style 
		this.setStyleLabel(this.abDefEqReqItems_form, 'eq_req_items.type_label');

	},
	
	afterInitialDataFetch: function(){

		if(valueExists(this.view.parameters)){
			if (valueExists(this.view.parameters.callback)) {
				this.callbackMethod = this.view.parameters.callback;
			}

			if (valueExists(this.view.parameters.isNewAsset)) {
				this.isNewAsset = this.view.parameters.isNewAsset;
			}
			
			if (valueExists(this.view.parameters.assetType)) {
				this.assetType = this.view.parameters.assetType;
			}
		}

		this.isNewRecord = this.view.newRecord;
		this.restriction = this.view.restriction;
		var clause = this.restriction.findClause('eq_req_items.sb_name');
		if(clause){
			this.sbName = clause.value;
		}
		this.initializeGlobals();

		this.displayAssetForm(this.assetType, this.isNewAsset, this.restriction, this.isNewRecord);
		
		if (this.isNewRecord) {
			this.abDefEqReqItems_form.setTitle(getMessage('titleAddEqReqAsset'));
		}else{
			this.abDefEqReqItems_form.setTitle(getMessage('titleEditEqReqAsset'));
		}
		this.abDefEqReqItems_form.setFieldValue('select_asset_type', this.assetType);
		this.abDefEqReqItems_form.setFieldValue('select_asset_new', this.isNewAsset.toString());
		// when is existing record disable radio buttons 
		for (var i = 0; i <  document.getElementsByName('abDefEqReqItems_form_select_asset_type').length; i++) {
			var objRadio = document.getElementsByName('abDefEqReqItems_form_select_asset_type')[i];
			objRadio.disabled = !this.isNewRecord;
		}
		for (var i = 0; i <  document.getElementsByName('abDefEqReqItems_form_select_asset_new').length; i++) {
			var objRadio = document.getElementsByName('abDefEqReqItems_form_select_asset_new')[i];
			objRadio.disabled = !this.isNewRecord;
		}

	},
	
	onSelectAssetType: function(input){
		this.assetType = this.abDefEqReqItems_form.getFieldValue('select_asset_type');
		this.displayAssetForm(this.assetType, this.isNewAsset, this.restriction, this.isNewRecord);
	},
	
	onSelectAssetNew: function(input){
		this.isNewAsset = this.abDefEqReqItems_form.getFieldValue('select_asset_new') == 'true';
		this.displayAssetForm(this.assetType, this.isNewAsset, this.restriction, this.isNewRecord);
	},
	
	displayAssetForm: function(assetType, isNewAsset, restriction, isNewRecord){
		if (valueExistsNotEmpty(this.visibleForm)) {
			View.panels.get(this.visibleForm).show(false, true);
		}
		if (assetType == 'eq') {
			if (isNewAsset) {
				this.visibleForm = 'abDefEqReqItemsEqNew_form';
			}else{
				this.visibleForm = 'abDefEqReqItemsEq_form';
			}
		} else {
			if (isNewAsset) {
				this.visibleForm = 'abDefEqReqItemsTaNew_form';
			}else{
				this.visibleForm = 'abDefEqReqItemsTa_form';
			}
		}
		var formObj = View.panels.get(this.visibleForm);
		if(formObj){
			if (!valueExists(formObj.columnsVisibilityDef)){
				formObj.columnsVisibilityDef = abEamAssetIndividualColumnsVisibilityDef;
			}
			formObj.refresh(restriction, isNewRecord);
			//formObj.show(true, true);
			this.setStyleLabel(formObj, 'eq_req_items.information_label');
		}
	},
	
	setStyleLabel: function(form, elemName){
		var fieldLabelEl = form.getFieldLabelElement(elemName);
		if (fieldLabelEl) {
			if (fieldLabelEl.parentElement) {
				fieldLabelEl.parentElement.bgColor = '#d9e3f1'; 
				fieldLabelEl.parentElement.style.backgroundColor = '#d9e3f1'; 
			}
			fieldLabelEl.style.textAlign = 'left';
			fieldLabelEl.style.fontWeight = 'bold';
		}
	},
	
	abDefEqReqItemsEqNew_form_afterRefresh: function(){
		this.isNewAsset = true;
		this.displayColumnsVisibility(this.abDefEqReqItemsEqNew_form, this.sbLevel);
	},
	
	abDefEqReqItemsEq_form_afterRefresh: function(){
		// enable / disable profile button
		var eqId = this.abDefEqReqItemsEq_form.getFieldValue('eq_req_items.eq_id');
		
		enableFieldAction('abDefEqReqItemsEq_form', 'eq_req_items.eq_id', 'abDefEqReqItemsEq_form_onEqProfile', valueExistsNotEmpty(eqId));

		if (valueExistsNotEmpty(eqId)) {
			afterSelectEqId('eq_req_items.eq_id', eqId);
		}
		this.displayColumnsVisibility(this.abDefEqReqItemsEq_form, this.sbLevel);

	},
	
	abDefEqReqItemsTaNew_form_afterRefresh: function(){
		this.isNewAsset = true;
		this.displayColumnsVisibility(this.abDefEqReqItemsTaNew_form, this.sbLevel);
	},
	
	abDefEqReqItemsTa_form_afterRefresh: function(){
		// enable / disable profile button
		var taId = this.abDefEqReqItemsTa_form.getFieldValue('eq_req_items.ta_id');
		
		enableFieldAction('abDefEqReqItemsTa_form', 'eq_req_items.ta_id', 'abDefEqReqItemsTa_form_onTaProfile', valueExistsNotEmpty(taId));

		if (valueExistsNotEmpty(taId)) {
			afterSelectTaId('eq_req_items.ta_id', taId);
		}
		this.displayColumnsVisibility(this.abDefEqReqItemsTa_form, this.sbLevel);

	},
	
	initializeGlobals: function(){
		if(valueExistsNotEmpty(this.sbName)){
			this.sbRecord = null;
			this.sbLevel = null;
			// get sb record for current sb_name
			var record = getSpaceBudgetRecord(this.sbName);
			if (!record.isNew) {
				this.sbRecord = record;
				this.sbLevel = record.getValue('sb.sb_level');
			}
		}
	},
	
	/**
	 * Evaluate hidden attribute in columns visibility
	 */
	displayColumnsVisibility: function(panel, sbLevel){
		if(valueExists(panel.columnsVisibilityDef)){
			panel.columnsVisibilityDef.each(function (column){
				if(valueExistsNotEmpty(column.sbLevels) && valueExistsNotEmpty(sbLevel)){
					column.hidden = column.sbLevels.indexOf(sbLevel) == -1;
				}
				if(panel.type == 'form'){
					// for form disable field to keep form layout
					//panel.showField(column.id, !column.hidden);
					panel.enableField(column.id, !column.hidden);
				} else if(panel.type == 'grid'){
					panel.showColumn(column.id, !column.hidden);
				}
			});
		}
	}
});


function onCallback(){
	var controller = View.controllers.get('abEamDefEqReqAssetController');
	if(valueExists(controller.callbackMethod)){
		controller.callbackMethod();
	}
}

/**
 * Autocomplete select for equipment id
 * @param form form name
 * @param fieldName field name
 * @param selectedValue selected value
 */
function onAutoCompleteSelect(form, fieldName, selectedValue){
	if(fieldName == 'eq_req_items.eq_id'){
		afterSelectEqId(fieldName, selectedValue, null);
	} else if (fieldName == 'eq_req_items.ta_id') {
		afterSelectTaId(fieldName, selectedValue, null);
	}
	
}

/**
 * After select equipment code.
 * @param fieldName
 * @param newValue
 * @param oldValue
 */
function afterSelectEqId(fieldName, newValue, oldValue){
	var form = View.panels.get('abDefEqReqItemsEq_form');
	var dataSource = form.getDataSource();
	if(valueExistsNotEmpty(newValue)){
		var recEq = getEquipmentRecord(newValue);
		if(valueExists(recEq)){
			var eq_std = recEq.getValue('eq.eq_std');
			var recEqStd = getEquipmentStandard(eq_std);
			var bl_id = recEq.getValue('eq.bl_id');
			var recBl = getBuilding(bl_id);
			var dv_id = recEq.getValue('eq.dv_id');
			var recDv = getDivision(dv_id);
			var cost_purchase = recEq.getValue('eq.cost_purchase');
			if (cost_purchase == 0.0 && valueExists(recEqStd)) {
				cost_purchase = recEqStd.getValue('eqstd.price');
			}
			form.setFieldValue('eq_std', eq_std);
			form.setFieldValue('eq_req_items.cost_est_baseline', dataSource.formatValue('eq_req_items.cost_est_baseline', cost_purchase, true));
			form.setFieldValue('eq_req_items.cost_moving',  dataSource.formatValue('eq_req_items.cost_moving', (valueExists(recEqStd)?recEqStd.getValue('eqstd.cost_moving'):'0'), true));
			form.setFieldValue('eq_req_items.unit_area', dataSource.formatValue('eq_req_items.unit_area', (valueExists(recEqStd)?recEqStd.getValue('eqstd.area'):'0'), true));
			if(valueExists(recBl) && valueExistsNotEmpty(recBl.getValue('bl.site'))){
				form.setFieldValue('eq_req_items.site_id', recBl.getValue('bl.site'));
			}
			form.setFieldValue('eq_req_items.bl_id', recEq.getValue('eq.bl_id'));
			form.setFieldValue('eq_req_items.fl_id', recEq.getValue('eq.fl_id'));
			form.setFieldValue('eq_req_items.rm_id', recEq.getValue('eq.rm_id'));
			if(valueExists(recDv) && valueExistsNotEmpty(recDv.getValue('dv.bu_id'))){
				form.setFieldValue('eq_req_items.bu_id', recDv.getValue('dv.bu_id'));
			}
			form.setFieldValue('eq_req_items.dv_id', recEq.getValue('eq.dv_id'));
			form.setFieldValue('eq_req_items.dp_id', recEq.getValue('eq.dp_id'));
			form.setFieldValue('eq_req_items.modelno', recEq.getValue('eq.modelno'));
			form.setFieldValue('eq_req_items.mfr', recEq.getValue('eq.mfr'));
			
			
		}
	} else {
		// reset read only fields
		//form.refresh(form.restriction);
		
	}
	enableFieldAction('abDefEqReqItemsEq_form', 'eq_req_items.eq_id', 'abDefEqReqItemsEq_form_onEqProfile', valueExistsNotEmpty(newValue));
}

/**
 * After select furniture code.
 * @param fieldName
 * @param newValue
 * @param oldValue
 */
function afterSelectTaId(fieldName, newValue, oldValue){
	var form = View.panels.get('abDefEqReqItemsTa_form');
	var dataSource = form.getDataSource();
	if(valueExistsNotEmpty(newValue)){
		var recTa = getFurnitureRecord(newValue);
		if(valueExists(recTa)){
			var fn_std = recTa.getValue('ta.fn_std');
			var recFnStd = getFurnitureStandard(fn_std);
			
			var bl_id = recTa.getValue('ta.bl_id');
			var recBl = getBuilding(bl_id);
			var dv_id = recTa.getValue('ta.dv_id');
			var recDv = getDivision(dv_id);
			
			var cost_purchase = recTa.getValue('ta.value_original');
			if (cost_purchase == 0.0 && valueExists(recFnStd)) {
				cost_purchase = recFnStd.getValue('fnstd.price');
			}
			form.setFieldValue('fn_std', fn_std);
			if(valueExists(recFnStd)){
				form.setFieldValue('ta_depth', dataSource.formatValue('eq_req_items.unit_area', recFnStd.getValue('fnstd.depth'), true));
				form.setFieldValue('ta_width', dataSource.formatValue('eq_req_items.unit_area', recFnStd.getValue('fnstd.width'), true));
				form.setFieldValue('eq_req_items.mfr', recFnStd.getValue('fnstd.mfr_id'));
				form.setFieldValue('eq_req_items.modelno', recFnStd.getValue('fnstd.catalog_id'));
			}
			
			form.setFieldValue('eq_req_items.cost_est_baseline', dataSource.formatValue('eq_req_items.cost_est_baseline', cost_purchase, true));
			if(valueExists(recBl) && valueExistsNotEmpty(recBl.getValue('bl.site'))){
				form.setFieldValue('eq_req_items.site_id', recBl.getValue('bl.site'));
			}
			form.setFieldValue('eq_req_items.bl_id', recTa.getValue('ta.bl_id'));
			form.setFieldValue('eq_req_items.fl_id', recTa.getValue('ta.fl_id'));
			form.setFieldValue('eq_req_items.rm_id', recTa.getValue('ta.rm_id'));
			if(valueExists(recDv) && valueExistsNotEmpty(recDv.getValue('dv.bu_id'))){
				form.setFieldValue('eq_req_items.bu_id', recDv.getValue('dv.bu_id'));
			}
			form.setFieldValue('eq_req_items.dv_id', recTa.getValue('ta.dv_id'));
			form.setFieldValue('eq_req_items.dp_id', recTa.getValue('ta.dp_id'));
			form.setFieldValue('eq_req_items.criticality', recTa.getValue('ta.criticality'));
			
		}
	} else {
		// reset read only fields
		//form.refresh(form.restriction);
		
	}
	enableFieldAction('abDefEqReqItemsTa_form', 'eq_req_items.ta_id', 'abDefEqReqItemsTa_form_onTaProfile', valueExistsNotEmpty(newValue));
}


/**
 * When equipment code is changed manually.
 */
function onChangeEquipmentCode(){
/*
	var form = View.panels.get('abDefEqReqItemsEq_form');
	var eqId = form.getFieldValue('eq_req_items.eq_id');
	afterSelectEqId('eq_req_items.eq_id', eqId, null);
*/	
}

/**
 * When furniture code is changed manually.
 */
function onChangeFurnitureCode(){
/*
	var form = View.panels.get('abDefEqReqItemsTa_form');
	var taId = form.getFieldValue('eq_req_items.ta_id');
	afterSelectTaId('eq_req_items.ta_id', taId, null);
*/	
}

/**
 * Enable/disable field action.
 */
function enableFieldAction(formId, fieldName, actionId, enabled){
	var objForm = View.panels.get(formId);
	if (objForm) {
		var objField = objForm.fields.get(fieldName);
		if (objField) {
			var objAction = objField.actions.get(actionId);
			if (objAction) {
				objAction.enable(enabled);
				objAction.enableButton(enabled);
				objAction.forceDisable(!enabled);
			}
		}
	}
}

/**
 * Get equipment record.
 * @param eq_id equipment code
 * @returns record object
 */
function getEquipmentRecord(eq_id){
	var params = {
			tableName: 'eq',
			fieldNames: toJSON(['eq.eq_id', 'eq.eq_std', 'eq.cost_purchase', 'eq.bl_id', 'eq.fl_id', 'eq.rm_id', 'eq.dv_id', 'eq.dp_id', 'eq.modelno', 'eq.mfr']),
			restriction: toJSON({
				'eq.eq_id': eq_id
			})
	};
	try {
		var result = Workflow.call('AbCommonResources-getDataRecord', params);
		if (result.code == 'executed') {
			return result.dataSet;
		} 
	} catch (e) {
		Workflow.handleError(e);
	}
}

/**
 * Get equipment standard record
 * @param eq_std room standard
 * @returns record object
 */
function getEquipmentStandard(eq_std){
	var params = {
			tableName: 'eqstd',
			fieldNames: toJSON(['eqstd.eq_std', 'eqstd.area', 'eqstd.price', 'eqstd.cost_moving']),
			restriction: toJSON({
				'eqstd.eq_std': eq_std
			})
	};
	try {
		var result = Workflow.call('AbCommonResources-getDataRecord', params);
		if (result.code == 'executed') {
			return result.dataSet;
		} 
	} catch (e) {
		Workflow.handleError(e);
	}
}

/**
 * Get dv record.
 * @param dv_id division code
 * @returns record object
 */
function getDivision(dv_id){
	var params = {
			tableName: 'dv',
			fieldNames: toJSON(['dv.dv_id', 'dv.bu_id']),
			restriction: toJSON({
				'dv.dv_id': dv_id
			})
	};
	try {
		var result = Workflow.call('AbCommonResources-getDataRecord', params);
		if (result.code == 'executed') {
			return result.dataSet;
		} 
	} catch (e) {
		Workflow.handleError(e);
	}
}

/**
 * Get building record.
 * @param bl_id building code
 * @returns record object
 */
function getBuilding(bl_id){
	var params = {
			tableName: 'bl',
			fieldNames: toJSON(['bl.bl_id', 'bl.site_id']),
			restriction: toJSON({
				'bl.bl_id': bl_id
			})
	};
	try {
		var result = Workflow.call('AbCommonResources-getDataRecord', params);
		if (result.code == 'executed') {
			return result.dataSet;
		} 
	} catch (e) {
		Workflow.handleError(e);
	}
}


/**
 * Get furniture record.
 * @param ta_id furniture code
 * @returns record object
 */
function getFurnitureRecord(ta_id){
	var params = {
			tableName: 'ta',
			fieldNames: toJSON(['ta.ta_id', 'ta.fn_std', 'ta.value_original', 'ta.bl_id', 'ta.fl_id', 'ta.rm_id', 'ta.dv_id', 'ta.dp_id', 'ta.criticality']),
			restriction: toJSON({
				'ta.ta_id': ta_id
			})
	};
	try {
		var result = Workflow.call('AbCommonResources-getDataRecord', params);
		if (result.code == 'executed') {
			return result.dataSet;
		} 
	} catch (e) {
		Workflow.handleError(e);
	}
}

/**
 * Get furniture standard record
 * @param fn_std furniture standard
 * @returns record object
 */
function getFurnitureStandard(fn_std){

	try {
		var dataSource = View.dataSources.get('abFnStd_ds');
		var record  = dataSource.getRecord(new Ab.view.Restriction({'fnstd.fn_std': fn_std}));
		return record;
	} catch (e) {
		Workflow.handleError(e);
	}
}

/**
 * Validate visible form.
 * 
 * @returns {Boolean}
 */
function validateForm(){
	var controller = View.controllers.get('abEamDefEqReqAssetController');
	var assetType = controller.assetType;
	var form = View.panels.get(controller.visibleForm);

	var dataSource = form.getDataSource();
	var fields = ['eq_req_items.sb_name', 'eq_req_items.eq_id'];
	if(assetType == 'ta') {
		fields = ['eq_req_items.sb_name', 'eq_req_items.ta_id'];
	}
	
	var restriction = new Ab.view.Restriction();
	var hasAllFields = true;
	for(var i=0; i < fields.length; i++){
		var field = fields[i];
		var fieldValue = form.getFieldValue(field);
		if(valueExistsNotEmpty(fieldValue)){
			restriction.addClause(field, fieldValue, '=');
		}else{
			hasAllFields = false;
			restriction.addClause(field, null, 'IS NULL');
		}
	}
	
	if(hasAllFields){
		var record = dataSource.getRecord(restriction);
		if(form.newRecord && !record.isNew){
			View.showMessage(getMessage('errDuplicateRecord'));
			return false;
		}
	}
	return true;
}

/**
 * Save visible form.
 * @returns {Boolean}
 */
function saveForm() {
	var controller = View.controllers.get('abEamDefEqReqAssetController');
	var assetType = controller.assetType;
	var form = View.panels.get(controller.visibleForm);
	
	if (form.canSave() && validateForm()) {
		var description = form.getFieldValue('eq_req_items.description');
		var assetStandard = assetType == 'eq'?form.getFieldValue('eq_std'):form.getFieldValue('fn_std');

		if (!valueExistsNotEmpty(description)) {
			form.setFieldValue('eq_req_items.description', assetStandard);
		}
		return form.save();
	}
	return false;
}

/**
 * Delete record

 * @returns {Boolean}
 */
function deleteRecord(){
	var controller = View.controllers.get('abEamDefEqReqAssetController');
	var visibleForm = View.panels.get(controller.visibleForm);
	var recordId = visibleForm.getFieldValue('eq_req_items.auto_number');
	var message = getMessage('confirmDeleteMessage').replace('{0}', recordId);
	View.confirm(message, function(button) {
	    if (button == 'yes') {
	    	try{
	    		if (visibleForm.deleteRecord()){
		    		onCallback();
		    		View.closeThisDialog();
	    		}
	    	}catch(e) {
	    		Workflow.handleError(e);
	    	}
	    }
	});
}


/**
 * On click equipment profile
 * @param context
 */
function onEqProfile(context){
	var form = View.panels.get('abDefEqReqItemsEq_form');
	var eqId = form.getFieldValue('eq_req_items.eq_id');
	if(valueExistsNotEmpty(eqId)){
		View.openDialog('ab-profile-equipment.axvw', new Ab.view.Restriction({'eq.eq_id': eqId}), false, {
			
		});
	}
}

/**
 * On click furniture profile
 * @param context
 */
function onTaProfile(context){
	var form = View.panels.get('abDefEqReqItemsTa_form');
	var taId = form.getFieldValue('eq_req_items.ta_id');
	if(valueExistsNotEmpty(taId)){
		View.openDialog('ab-profile-ta.axvw', new Ab.view.Restriction({'ta.ta_id': taId}), false, {
			
		});
	}
}
