var invoiceWizardController = View.createController('invoiceWizard',{
	// invoice owner type - default value 'lease'
	ownerType: 'lease',
	
	// when owner type is lease (values bl, pr, all)
	ownerAssociatedWith: null,
	
	//cam charges filter field value 
	camCharges: null,
	
	afterInitialDataFetch: function(){
		this.initConsole();
	},
	
	/**
	 * On clear event handler.
	 */
	consoleInvoices_onClear:function(){
		this.initConsole();
	},
	
	/**
	 * Initialize filtering cos
	 */
	initConsole: function(){
		this.ownerType = 'lease';
		setRadioValue("radioConsole", this.ownerType);
		$('chkLsDesc_bl').checked = true;
		$('chkLsDesc_pr').checked = false;
		enableCheckbox(true);
		$('camChargesSelect').value = "ALL";
		this.applyRestriction();
	},
	
	/**
	 * On filter event handler
	 */
	consoleInvoices_onFilter:function(){
		this.applyRestriction();
	},
	
	/**
	 * Apply restriction to each tab.
	 */
	applyRestriction: function(){
		this.ownerType = getRadioValue('radioConsole');
		this.ownerAssociatedWith = this.getOwnerAssociatedWith();
		if(valueExistsNotEmpty($('camChargesSelect').value)){
			this.camCharges = $('camChargesSelect').value;
		}else{
			this.camCharges = null;
		}
		
		//Set ownerType to subview controller
		var assignCtrl = View.controllers.get('costUninvoicedCtrl');
		assignCtrl.ownerType = this.ownerType;
		
		this.filter();
	},
	
	/**
	 * Apply filter.
	 */
	filter: function(){
		var restriction = this.getRestriction("invoice");
		View.panels.get("gridInvoiceClosedInfo").refresh(restriction);
		View.panels.get("gridInvoiceIssuedInfo").refresh(restriction);
		View.panels.get("gridInvoiceUnissuedInfo").refresh(restriction);
		
		restriction = this.getRestriction("cost_tran");
		View.panels.get("gridCostUninvoicedInfo").refresh(restriction);
	},
	
	/**
	 * Get grid restriction as sql type because of VPA 
	 */
	getRestriction: function(tableName){
		var result = null;
		if (valueExistsNotEmpty(this.ownerType)) {
			var ownerField = getOwnerField(this.ownerType, tableName);
			switch (this.ownerType) {
				case 'lease':
				{
					result = ownerField + " IS NOT NULL ";
					if (this.ownerAssociatedWith == "bl" ) {
						result += "AND EXISTS(SELECT * FROM ls, bl WHERE ls.ls_id = " + tableName + ".ls_id AND bl.bl_id = ls.bl_id AND ${sql.getVpaRestrictionForTable('bl')}) ";
					}else if (this.ownerAssociatedWith == "pr" ){
						result += "AND EXISTS(SELECT * FROM ls, property WHERE ls.ls_id = " + tableName + ".ls_id AND property.pr_id = ls.pr_id AND ${sql.getVpaRestrictionForTable('property')}) ";
					}else {
						result += "AND ( EXISTS(SELECT * FROM ls, bl WHERE ls.ls_id = " + tableName + ".ls_id AND bl.bl_id = ls.bl_id AND ${sql.getVpaRestrictionForTable('bl')}) ";
						result += "OR EXISTS(SELECT * FROM ls, property WHERE ls.ls_id = " + tableName + ".ls_id AND property.pr_id = ls.pr_id AND ${sql.getVpaRestrictionForTable('property')})) ";
					}
					break;
				}
				case 'building':
				{
					result = ownerField + " IS NOT NULL ";
					result += "AND EXISTS(SELECT * FROM bl WHERE bl.bl_id = "+ tableName + ".bl_id AND ${sql.getVpaRestrictionForTable('bl')}) ";
					break;
				}
				case 'property':
				{
					result = ownerField + " IS NOT NULL ";
					result += "AND EXISTS(SELECT * FROM property WHERE property.pr_id = " + tableName + ".pr_id AND ${sql.getVpaRestrictionForTable('property')}) ";
					break;
				}
				case 'account':
				{
					result = ownerField + " IS NOT NULL ";
					break;
				}
			}
		}
		
		if(tableName == 'cost_tran' && valueExistsNotEmpty(this.camCharges) && this.camCharges != 'ALL'){
			result += " AND cost_tran.cam_cost = '" + this.camCharges + "'";
		}
		
		return result;
	},
	
	getOwnerAssociatedWith:function(){
		var result = null;
		if (this.ownerType == 'lease') {
			result = null;
			if ($('chkLsDesc_bl').checked) {
				result = "bl";
			}
			if ($('chkLsDesc_pr').checked) {
				if (result == "bl") {
					result = "all";
				}else{
					result = "pr";
				}
			}
		}
		return result;
	}
})
/**
 * Enable/disable checkboxes for "Show leases associated with"
 * @param enabled
 */
function enableCheckbox(enabled){
	$('chkLsDesc_bl').disabled = !enabled;
	$('chkLsDesc_pr').disabled = !enabled;
}

/**
 * Check specified radio option. 
 * 
 * @param name - element name
 * @param value - selected value
 */
function setRadioValue(name, value){
	var objRadio = document.getElementsByName(name);
	if(objRadio){
		for(var i=0;i<objRadio.length; i++){
			objRadio[i].checked = (objRadio[i].value == value);
		}
	}
}

/**
 * Get selected option for specified radio button object.
 * @param name
 */
function getRadioValue(name){
	var objRadio = document.getElementsByName(name);
	if(objRadio){
		for(var i=0;i<objRadio.length; i++){
			if(objRadio[i].checked){
				return objRadio[i].value;
			}
		}
	}
	return null;
}
/**
 * Common functions used in all tabs
 */

/**
 * Get asset field id.
 * @param type owner type
 * @param table name 
 */
function getOwnerField (type, table){
	var field = table;
	switch(type){
    	case 'lease':
		{
    		field += '.ls_id';
			break;
		}
    	case 'building':
		{
    		field += '.bl_id';
			break;
		}
    	case 'property':
		{
    		field += '.pr_id';
			break;
		}
    	case 'account':
		{
    		field += '.ac_id';
			break;
		}
		default:
			field = null;
	}
	return field;
}

/**
 * Get field values for selected grid rows.
 * @param grid grid object
 * @param fieldName field name
 * @param dataType field data type
 * @returns array of values
 */
function getValuesFromSelectedRows (grid, fieldName, dataType) {
    var selectedRecords = grid.getSelectedRecords();
    var values = [];
    for (var i = 0; i < selectedRecords.length; i++) {
    	var value = selectedRecords[i].getValue(fieldName);
    	if (dataType == 'integer') {
    		values.push(parseInt(value));
    	}else{
    		values.push(value);
    	}
    }
    return values;
}