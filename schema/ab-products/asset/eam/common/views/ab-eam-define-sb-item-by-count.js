// global variables
var abEamDefAssetByCountColumnsVisibilityDef =  new Ext.util.MixedCollection();
abEamDefAssetByCountColumnsVisibilityDef.addAll(
		{id: 'sb_items.bu_id', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
		{id: 'sb_items.dv_id', visible: true, dfltVisible: true, hidden: false, sbLevels: ['dv', 'dp', 'fg']},
		{id: 'sb_items.dp_id', visible: true, dfltVisible: true, hidden: false, sbLevels: ['dp', 'fg']},
		{id: 'sb_items.fg_title', visible: true, dfltVisible: true, hidden: false, sbLevels: ['fg']},
		{id: 'sb_items.eq_std', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
		{id: 'sb_items.fn_std', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
		{id: 'sb_items.p00_value', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
		{id: 'sb_items.p01_value', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
		{id: 'sb_items.cost_of_assets', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
		{id: 'sb_items.area_of_assets', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
		{id: 'space_location_desc', visible: true, dfltVisible: true, hidden: false, sbLevels: ['fg'], type: 'html'},
		{id: 'sb_items.bl_id', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
		{id: 'vf_bl_id', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
		{id: 'sb_items.fl_id', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
		{id: 'vf_fl_id', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
		{id: 'sb_items.eq_cost', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
		{id: 'sb_items.cost_of_move', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
		{id: 'sb_items.cost_of_furn', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
		{id: 'sb_items.unit_area', visible: true, dfltVisible: true, hidden: false, sbLevels: null}
);

/**
 * Controller def.
 */
var abEamDefAssetByCountController = View.createController('abEamDefAssetByCountController', {
	// sb_name is project id
	sbName: null,
	
	sbLevel: null,
	
	sbRecord: null,
	
	callbackMethod: null,
	
	assetType: 'eq',
	
	isNewRecord: false,
	
	restriction: null,
	
	visibleForm: null,
	
	afterViewLoad: function(){

		if(valueExists(this.view.parameters)
				&& valueExists(this.view.parameters.callback)){
			this.callbackMethod = this.view.parameters.callback;
		}
		this.abEamDefAssetByCountEq_form.addEventListener("onAutoCompleteSelect", onAutoCompleteSelect);
		this.abEamDefAssetByCountTa_form.addEventListener("onAutoCompleteSelect", onAutoCompleteSelect);
	},
	
	afterInitialDataFetch: function(){
		this.isNewRecord = this.view.newRecord;
		this.restriction = this.view.restriction;
		var clause = this.restriction.findClause('sb_items.sb_name');
		if(clause){
			this.sbName = clause.value;
		}
		this.initializeGlobals();
		if (!this.isNewRecord) {
			var clause = this.restriction.findClause('sb_items.auto_number');
			var autoNumber = clause.value;
			this.assetType = this.getAssetType(autoNumber);
		}
		
		
		this.displayAssetForm(this.assetType, this.isNewAsset, this.restriction, this.isNewRecord);
		
		if(this.isNewRecord){
			this.abEamDefAssetByCount_form.setTitle(getMessage('titleAddAssetByCount'));
		}else{
			this.abEamDefAssetByCount_form.setTitle(getMessage('titleEditAssetByCount'));
		}
		
		$('abEamDefAssetByCount_form_vf_asset_type_eq').checked = this.assetType == 'eq';
		$('abEamDefAssetByCount_form_vf_asset_type_ta').checked = this.assetType == 'ta';
		
		$('abEamDefAssetByCount_form_vf_asset_type_eq').disabled = !this.isNewRecord;
		$('abEamDefAssetByCount_form_vf_asset_type_ta').disabled = !this.isNewRecord;
		
	},
	
	displayAssetForm: function(assetType, isNewAsset, restriction, isNewRecord){
		if (valueExistsNotEmpty(this.visibleForm)) {
			View.panels.get(this.visibleForm).show(false, true);
		}
		if (assetType == 'eq') {
			this.visibleForm = 'abEamDefAssetByCountEq_form';
		} else {
			this.visibleForm = 'abEamDefAssetByCountTa_form';
		}
		
		var formObj = View.panels.get(this.visibleForm);
		if(formObj){
			if (!valueExists(formObj.columnsVisibilityDef)){
				formObj.columnsVisibilityDef = abEamDefAssetByCountColumnsVisibilityDef;
			}
			formObj.refresh(restriction, isNewRecord);
			//formObj.show(true, true);
		}
	},
	
	abEamDefAssetByCountEq_form_afterRefresh: function(){
		this.displayColumnsVisibility(this.abEamDefAssetByCountEq_form, this.sbLevel);
	},
	
	abEamDefAssetByCountTa_form_afterRefresh: function(){
		this.displayColumnsVisibility(this.abEamDefAssetByCountTa_form, this.sbLevel);
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
					if(valueExists(column.type) && column.type == 'html'){
						document.getElementById(column.id).style.display = 'none';
					}else{
						panel.showField(column.id, !column.hidden);
					}
				} else if(panel.type == 'grid'){
					panel.showColumn(column.id, !column.hidden);
				}
			});
		}
	},
	
	getAssetType: function(auto_number){
		var params = {
				tableName: 'sb_items',
				fieldNames: toJSON(['sb_items.auto_number', 'sb_items.eq_std', 'sb_items.fn_std']),
				restriction: toJSON({
					'sb_items.auto_number': auto_number
				})
		};
		try {
			var result = Workflow.call('AbCommonResources-getDataRecord', params);
			if (result.code == 'executed') {
				var record = result.dataSet;
				var isEquipment =  valueExistsNotEmpty(record.getValue('sb_items.eq_std'));
				var isFurniture = valueExistsNotEmpty(record.getValue('sb_items.fn_std'));
				var assetType = null;
				if (isEquipment && !isFurniture) {
					assetType = 'eq';
				} else if (isFurniture && !isEquipment) {
					assetType = 'ta';
				}
				return assetType;
			} 
		} catch (e) {
			Workflow.handleError(e);
		}
		
	}
});

/**
 * On chaneg asset type
 * @param objInput input type radio
 */
function onChangeType(objInput){
	var controller = View.controllers.get('abEamDefAssetByCountController');
	if ( objInput.checked && valueExists(objInput.value)) {
		controller.assetType = objInput.value;
		controller.displayAssetForm(controller.assetType, controller.isNewAsset, controller.restriction, controller.isNewRecord);
	}
}

/**
 * Execute callback function if defined.
 */
function onCallback(){
	var controller = View.controllers.get('abEamDefAssetByCountController');
	if(valueExists(controller.callbackMethod)){
		controller.callbackMethod();
	}
}

/**
 * Update baseline locations field.
 * @returns {Boolean}
 */
function updateBaselineLocations(){
	try{
		var controller = View.controllers.get('abEamDefAssetByCountController');
		var form = controller.assetType == 'eq'?View.panels.get('abEamDefAssetByCountEq_form'):View.panels.get('abEamDefAssetByCountTa_form');
		var bl_id = form.getFieldValue('sb_items.bl_id');
		var fl_id = form.getFieldValue('sb_items.fl_id');
		if(valueExistsNotEmpty(bl_id) && valueExistsNotEmpty(fl_id)){
			form.setFieldValue('sb_items.baseline_locations', bl_id +';'+ fl_id );
		}
		return true;
	} catch (e) {
		Workflow.handleError(e);
		return false;
	}
}

/**
 * After select value listener.
 * 
 * @param fieldName
 * @param newValue
 * @param oldValue
 */
function afterSelectEqStd(fieldName, newValue, oldValue){
	var form = View.panels.get('abEamDefAssetByCountEq_form');
	var dataSource = form.getDataSource();
	if(valueExistsNotEmpty(newValue)){
		var record = getEquipmentStandard(newValue);
		if(valueExists(record)){
			form.setFieldValue('sb_items.unit_area', dataSource.formatValue('sb_items.unit_area', record.getValue('eqstd.area'), true));
			form.setFieldValue('sb_items.eq_cost', dataSource.formatValue('sb_items.eq_cost', record.getValue('eqstd.price'), true));
			form.setFieldValue('sb_items.cost_of_move', dataSource.formatValue('sb_items.cost_of_move', record.getValue('eqstd.cost_moving'), true));
		}
	}
}

/**
 * After select value listener.
 * 
 * @param fieldName
 * @param newValue
 * @param oldValue
 */
function afterSelectFnStd(fieldName, newValue, oldValue){
	var form = View.panels.get('abEamDefAssetByCountTa_form');
	var dataSource = form.getDataSource();
	if(valueExistsNotEmpty(newValue)){
		var record = getFurnitureStandard(newValue);
		if(valueExists(record)){
			var fnstdPrice = valueExistsNotEmpty(record.getValue('fnstd.price'))?record.getValue('fnstd.price'):0;
			form.setFieldValue('sb_items.unit_area', dataSource.formatValue('sb_items.unit_area', record.getValue('fnstd.vf_fn_std_unit_area'), true));
			form.setFieldValue('sb_items.cost_of_furn', dataSource.formatValue('sb_items.cost_of_furn', fnstdPrice, true));
			form.setFieldValue('sb_items.cost_of_move', dataSource.formatValue('sb_items.cost_of_move', record.getValue('fnstd.cost_moving'), true));
		}
	}
	
}

/**
 * Auto complete select for equipment standard
 * @param form form name
 * @param fieldName field name
 * @param selectedValue selected value
 */
function onAutoCompleteSelect(form, fieldName, selectedValue){
	if(fieldName == 'sb_items.eq_std'){
		afterSelectEqStd(fieldName, selectedValue, null);
	} else if (fieldName == 'sb_items.fn_std') {
		afterSelectFnStd(fieldName, selectedValue, null);
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
	var controller = View.controllers.get('abEamDefAssetByCountController');
	var form = null;
	var fields = [];
	
	if (controller.assetType == 'eq'){
		form = View.panels.get('abEamDefAssetByCountEq_form');
		fields = ['sb_items.sb_name', 'sb_items.bu_id', 'sb_items.dv_id', 'sb_items.dp_id', 'sb_items.eq_std', 'sb_items.bl_id', 'sb_items.fl_id'];
	} else{
		form = View.panels.get('abEamDefAssetByCountTa_form');
		fields = ['sb_items.sb_name', 'sb_items.bu_id', 'sb_items.dv_id', 'sb_items.dp_id', 'sb_items.fn_std', 'sb_items.bl_id', 'sb_items.fl_id'];
	}

	var dataSource = form.getDataSource();
	var restriction = new Ab.view.Restriction();
	restriction.addClause('sb_items.rm_std', null, 'IS NULL');
	
	for(var i=0; i < fields.length; i++){
		var field = fields[i];
		var fieldValue = form.getFieldValue(field);
		if(valueExistsNotEmpty(fieldValue)){
			restriction.addClause(field, fieldValue, '=');
		}else{
			restriction.addClause(field, null, 'IS NULL');
		}
	}
	var record = dataSource.getRecord(restriction);
	if(form.newRecord && !record.isNew){
		View.showMessage(getMessage('errDuplicateRecord'));
		return false;
	}
	return true;
}

/**
 * Delete record

 * @returns {Boolean}
 */
function deleteRecord(){
	var controller = View.controllers.get('abEamDefAssetByCountController');
	var visibleForm = View.panels.get(controller.visibleForm);
	var recordId = visibleForm.getFieldValue('sb_items.auto_number');
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
 * Save visible form.
 * @returns {Boolean}
 */
function saveForm() {
	var controller = View.controllers.get('abEamDefAssetByCountController');
	var assetType = controller.assetType;
	var form = View.panels.get(controller.visibleForm);
	
	if (form.canSave() 
			&& validateForm() 
			&& updateBaselineLocations()) {
		return form.save();
	}
	return false;
}

