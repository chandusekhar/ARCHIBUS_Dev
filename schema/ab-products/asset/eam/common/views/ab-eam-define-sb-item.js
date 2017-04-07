// global variables
var abEamDefSbItemsColumnsVisibilityDef =  new Ext.util.MixedCollection();
abEamDefSbItemsColumnsVisibilityDef.addAll(
	{id: 'sb_items.bu_id', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
	{id: 'sb_items.dv_id', visible: true, dfltVisible: true, hidden: false, sbLevels: ['dv', 'dp', 'fg']},
	{id: 'sb_items.dp_id', visible: true, dfltVisible: true, hidden: false, sbLevels: ['dp', 'fg']},
	{id: 'sb_items.fg_title', visible: true, dfltVisible: true, hidden: false, sbLevels: ['fg']},
	{id: 'sb_items.rm_std', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
	{id: 'sb_items.p00_value', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
	{id: 'sb_items.cost_of_baseline', visible: false, dfltVisible: false, hidden: false, sbLevels: null},
	{id: 'sb_items.area_of_baseline', visible: false, dfltVisible: false, hidden: false, sbLevels: null},
	{id: 'sb_items.p01_value', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
	{id: 'sb_items.p02_value', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
	{id: 'sb_items.p03_value', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
	{id: 'sb_items.p04_value', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
	{id: 'sb_items.p05_value', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
	{id: 'sb_items.p06_value', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
	{id: 'sb_items.p07_value', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
	{id: 'sb_items.p08_value', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
	{id: 'sb_items.p09_value', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
	{id: 'sb_items.p10_value', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
	{id: 'sb_items.p11_value', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
	{id: 'sb_items.p12_value', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
	{id: 'sb_items.cost_of_requirement', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
	{id: 'sb_items.area_of_requirement', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
	{id: 'sb_items.diff_req_base_count', visible: false, dfltVisible: false, hidden: false, sbLevels: null},
	{id: 'sb_items.diff_req_base_cost', visible: false, dfltVisible: false, hidden: false, sbLevels: null},
	{id: 'sb_items.diff_req_base_area', visible: false, dfltVisible: false, hidden: false, sbLevels: null},
	{id: 'space_location_desc', visible: true, dfltVisible: true, hidden: false, sbLevels: ['fg'], type: 'html'},
	{id: 'sb_items.bl_id', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
	{id: 'vf_bl_id', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
	{id: 'sb_items.fl_id', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
	{id: 'vf_fl_id', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
	{id: 'sb_items.cost_of_space', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
	{id: 'sb_items.cost_of_furn', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
	{id: 'sb_items.cost_of_move', visible: true, dfltVisible: true, hidden: false, sbLevels: null},
	{id: 'sb_items.rm_std_area', visible: true, dfltVisible: true, hidden: false, sbLevels: null}
);

/**
 * Controller def.
 */
var abEamDefSbItemController = View.createController('abEamDefSbItemController', {
	// sb_name is project id
	sbName: null,
	
	sbLevel: null,
	
	sbType: null,
	
	sbRecord: null,
	
	callbackMethod: null,
	
	afterViewLoad: function(){
		if (!valueExists(this.abEamDefSbItem_form.columnsVisibilityDef)){
			this.abEamDefSbItem_form.columnsVisibilityDef = abEamDefSbItemsColumnsVisibilityDef;
		}
		if(valueExists(this.view.parameters)
				&& valueExists(this.view.parameters.callback)){
			this.callbackMethod = this.view.parameters.callback;
		}
		this.abEamDefSbItem_form.addEventListener("onAutoCompleteSelect", onAutoCompleteSelect);
	},
	
	
	abEamDefSbItem_form_afterRefresh: function(){
		if(this.abEamDefSbItem_form.newRecord){
			this.abEamDefSbItem_form.setTitle(getMessage('titleAddReqItem'));
			this.abEamDefSbItem_form.setFieldValue('sb_items.rm_std_area', 1.0);
		}else{
			this.abEamDefSbItem_form.setTitle(getMessage('titleEditReqItem'));
		}
		var clause = this.abEamDefSbItem_form.restriction.findClause('sb_items.sb_name');
		if(clause){
			this.sbName = clause.value;
		}else{
			var value = this.abEamDefSbItem_form.getFieldValue('sb_items.sb_name');
			if(valueExistsNotEmpty(value)){
				this.sbName = value;
			}
		}
		this.initializeGlobals();
		this.displayColumnsVisibility(this.abEamDefSbItem_form, this.sbLevel);
		// set field title for p01_value
		if ('Space Requirements' == this.sbType) {
			this.abEamDefSbItem_form.setFieldLabel('sb_items.p01_value', getMessage('p01Title'));
			// set room standard required
			var rmStdField = this.abEamDefSbItem_form.fields.get('sb_items.rm_std');
			if (!rmStdField.hidden) {
				rmStdField.fieldDef.required = true;
				this.abEamDefSbItem_form.getFieldLabelElement('sb_items.rm_std').innerHTML +=  '<span class="required" name="sb_items.rm_std.required_star" id="sb_items.rm_std.required_star">*</span>'; 
			}
		}
		
		// Added for 22.1 Space Requirements, By ZY 
		if ( View.getOpenerView() && View.getOpenerView().controllers.get('abAllocDefSpReqEditCtrl') ) {
			this.initialFormForDefineSpaceRequirement();	
		} 
	},
	
	initialFormForDefineSpaceRequirement: function(){
		var sbType = View.getOpenerView().controllers.get('abAllocDefSpReqEditCtrl').sbType;
		if ('Space Forecast' != sbType){
			for ( var i=2; i<=12; i++ ) {
				this.abEamDefSbItem_form.showField("sb_items.p"+( i>9 ? i : ('0'+i) )+"_value", false);
			}
			$('abEamDefSbItem_form_sb_items.p01_value_labelCell').innerHTML=getMessage('p01Title'); 
		} 
		//set title specific for Space Forecast
		else {
			$('space_type_desc').textContent = getMessage("foreRmtsdText");
			$('space_units_desc').textContent = getMessage("foreInstructionText");
			if(this.abEamDefSbItem_form.newRecord){
				this.abEamDefSbItem_form.setTitle(getMessage('titleAddForeItem'));
			}else{
				this.abEamDefSbItem_form.setTitle(getMessage('titleEditForeItem'));
			}
		}
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
				this.sbType =  record.getValue('sb.sb_type');

				abEamDefSbItemsColumnsVisibilityDef.get('sb_items.p02_value').hidden = (this.sbType != 'Space Forecast');
				abEamDefSbItemsColumnsVisibilityDef.get('sb_items.p03_value').hidden = (this.sbType != 'Space Forecast');
				abEamDefSbItemsColumnsVisibilityDef.get('sb_items.p04_value').hidden = (this.sbType != 'Space Forecast');
				abEamDefSbItemsColumnsVisibilityDef.get('sb_items.p05_value').hidden = (this.sbType != 'Space Forecast');
				abEamDefSbItemsColumnsVisibilityDef.get('sb_items.p06_value').hidden = (this.sbType != 'Space Forecast');
				abEamDefSbItemsColumnsVisibilityDef.get('sb_items.p07_value').hidden = (this.sbType != 'Space Forecast');
				abEamDefSbItemsColumnsVisibilityDef.get('sb_items.p08_value').hidden = (this.sbType != 'Space Forecast');
				abEamDefSbItemsColumnsVisibilityDef.get('sb_items.p09_value').hidden = (this.sbType != 'Space Forecast');
				abEamDefSbItemsColumnsVisibilityDef.get('sb_items.p10_value').hidden = (this.sbType != 'Space Forecast');
				abEamDefSbItemsColumnsVisibilityDef.get('sb_items.p11_value').hidden = (this.sbType != 'Space Forecast');
				abEamDefSbItemsColumnsVisibilityDef.get('sb_items.p12_value').hidden = (this.sbType != 'Space Forecast');
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
	}
});

function onCallback(){
	var controller = View.controllers.get('abEamDefSbItemController');
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
		var form = View.panels.get('abEamDefSbItem_form');
		var bl_id = form.getFieldValue('sb_items.bl_id');
		var fl_id = form.getFieldValue('sb_items.fl_id');
		var currentValue = form.getFieldValue('sb_items.baseline_locations');
		if(valueExistsNotEmpty(currentValue)){
			currentValue = currentValue + ";";
		}else{
			currentValue = "";
		}
		if(valueExistsNotEmpty(bl_id) && valueExistsNotEmpty(fl_id)){
			form.setFieldValue('sb_items.baseline_locations', currentValue + bl_id +';'+ fl_id );
		}
		return true;
	} catch (e) {
		Workflow.handleError(e);
		return false;
	}
}

function afterSelectRoomStd(fieldName, newValue, oldValue){
	var form = View.panels.get('abEamDefSbItem_form');
	var dataSource = form.getDataSource();
	if(valueExistsNotEmpty(newValue)){
		var record = getRoomStandard(newValue);
		if(valueExists(record)){
			form.setFieldValue('sb_items.rm_std_area', dataSource.formatValue('sb_items.rm_std_area', record.getValue('rmstd.std_area')<=0 ? 1.0:record.getValue('rmstd.std_area') , true));
			form.setFieldValue('sb_items.unit_headcount', dataSource.formatValue('sb_items.unit_headcount', record.getValue('rmstd.std_em'), true));
			form.setFieldValue('sb_items.cost_of_space', dataSource.formatValue('sb_items.cost_of_space', record.getValue('rmstd.cost_of_space'), true));
			form.setFieldValue('sb_items.cost_of_furn', dataSource.formatValue('sb_items.cost_of_furn', record.getValue('rmstd.cost_of_furn'), true));
			form.setFieldValue('sb_items.cost_of_move', dataSource.formatValue('sb_items.cost_of_move', record.getValue('rmstd.cost_of_move'), true));
		}
	}
}

/**
 * Autocomplete select for romm standard
 * @param form form name
 * @param fieldName field name
 * @param selectedValue selected value
 */
function onAutoCompleteSelect(form, fieldName, selectedValue){
	if(fieldName == 'sb_items.rm_std'){
		afterSelectRoomStd(fieldName, selectedValue, null);
	}
}


/**
 * Get room standard record
 * @param rm_std room standard
 * @returns record object
 */
function getRoomStandard(rm_std){
	var params = {
			tableName: 'rmstd',
			fieldNames: toJSON(['rmstd.rm_std', 'rmstd.std_area', 'rmstd.std_em', 'rmstd.cost_of_space', 'rmstd.cost_of_furn', 'rmstd.cost_of_move']),
			restriction: toJSON({
				'rmstd.rm_std': rm_std
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

function validateForm(){
	var form = View.panels.get('abEamDefSbItem_form');
	var dataSource = form.getDataSource();
	var fields = ['sb_items.sb_name', 'sb_items.bu_id', 'sb_items.dv_id', 'sb_items.dp_id', 'sb_items.rm_std', 'sb_items.bl_id', 'sb_items.fl_id', 'sb_items.fg_title'];

	var restriction = new Ab.view.Restriction();
	restriction.addClause('sb_items.eq_std', null, 'IS NULL');
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

	if (checkNegativeValue()) {
		View.showMessage(getMessage('negativeValue'));
		return false;
	}

   //For 22.1 Define Space Requirement: if user edits bu_id,dv_id,dp_id,bl_id,fl_id,fg_title for a space requirement at FG level, then set this sb_items.gp_id to NULL if it has an value.
	if ( form.getFieldValue('sb_items.gp_id') && checkChangeOfFieldValuesForGroup() ){
		form.setFieldValue('sb_items.gp_id', "");		
	} 

	return true;
}

function checkNegativeValue(){
	var form = View.panels.get('abEamDefSbItem_form');
	for (var i=0; i<=12; i++ ) {
		var fieldName = 'p'+( i>9? i : ("0"+i) )+'_value';
		var fieldValue = form.getFieldValue('sb_items'+'.'+fieldName);
		if (fieldValue && fieldValue.substring(0,1)=='-')	{
			return true;
		}
	}
	return false;
}

function checkChangeOfFieldValuesForGroup(){
	var fields = ['bu_id','dv_id', 'dp_id','bl_id','fl_id', 'fg_title'];
	var form = View.panels.get('abEamDefSbItem_form');
	var oldValues = form.getOldFieldValues();
	for (var i=0; i<fields.length; i++ ) {
		var fieldName = 'sb_items'+'.'+fields[i];
		var newValue = form.getFieldValue(fieldName);
		var oldValue = oldValues[fieldName];
		if ( newValue != oldValue )	{
			return true;
		}
	}
	return false;
}