var costUninvoicedController = View.createController('costUninvoicedCtrl', {
	// invoice owner type
	ownerType: null,
	
	// invoice owner id
	ownerId: null,
	
	// selected cost id's
	costIds: null,
	
	// selected invoice id
	invoice_id: null,
	
	// if VAT and MC is enabled
	isVATAndMCEnabled: false,
	
	// currency code for selected costs
	currencyCode: null,
	
	afterViewLoad: function(){
		// check if multi currency is enabled
		this.isVATAndMCEnabled = View.activityParameters['AbCommonResources-EnableVatAndMultiCurrency'] == 1;
	},
	
	gridCostUninvoicedInfo_onAutoAssign: function(){
		var rows = this.gridCostUninvoicedInfo.getSelectedRows();
		// no row selected
		if(rows.length == 0){
			View.showMessage(getMessage('err_no_selection'));
			return false;
		}

		this.costIds = getValuesFromSelectedRows(this.gridCostUninvoicedInfo, 'cost_tran.cost_tran_id', 'integer');
		
		try {
			var result = Workflow.callMethod('AbRPLMChargebackInvoice-InvoiceService-onAutoAssing', this.costIds);
			if(result.code == 'executed'){
				this.view.controllers.get('invoiceWizard').applyRestriction();
			}
		} 
		catch (e) {
			Workflow.handleError(e);
		}
	},
	
	/*
	 * Assign cost to new invoice.
	 */
	gridCostUninvoicedInfo_onAssignCostToNewInvoice:function()
	{
		if(!this.checkCondition()){
			return;
		}
		this.invoice_id = null;
		this.costIds = getValuesFromSelectedRows(this.gridCostUninvoicedInfo, 'cost_tran.cost_tran_id', 'integer');
		this.openInvoice();
	},
	
	/*
	 * Assign costs to existing invoice. 
	 */
	gridCostUninvoicedInfo_onAssignCostToInvoice:function()
	{
		if(!this.checkCondition()){
			return;
		}
		this.costIds = getValuesFromSelectedRows(this.gridCostUninvoicedInfo, 'cost_tran.cost_tran_id', 'integer');
		var restriction = new Ab.view.Restriction();
		var assetField = getOwnerField(this.ownerType, 'invoice');
		restriction.addClause(assetField, this.ownerId, '=');
		restriction.addClause('invoice.status','N/A', '=');
		restriction.addClause('invoice.project_id','', 'IS NULL');
		// add currency restriction
		if(this.isVATAndMCEnabled && valueExistsNotEmpty(this.currencyCode)){
			restriction.addClause('invoice.currency_invoice', this.currencyCode, '=', ')AND(');
			restriction.addClause('invoice.currency_invoice', '', 'IS NULL', 'OR');
		}
		
		View.openDialog('ab-rplm-rcbl-select-invoice.axvw', restriction, false,{
			width: 800,
			height: 400,
			closeButton: true,
			openerController: this
		});
	},
	
	/*
	 * Open invoice pop-up.
	 */
	openInvoice: function(){
		if(this.invoice_id != null){
			View.closeDialog();
		}
		View.openDialog('ab-rplm-rcbl-invoice.axvw', {'invoice.invoice_id':this.invoice_id}, (this.invoice_id == null),{
			width: 600,
			height: 450,
			closeButton: false,
			costIds: this.costIds,
			ownerType: this.ownerType,
			ownerId: this.ownerId,
			wizardController: this.view.controllers.get('invoiceWizard')
		});
	},
	
	/*
	 * Check selected cost conditions.
	 */
	checkCondition: function(){
		var rows = this.gridCostUninvoicedInfo.getSelectedRows();
		// no row selected
		if(rows.length == 0){
			View.showMessage(getMessage('err_no_selection'));
			return false;
		}
		// check asset id for selected costs
		var field = getOwnerField(this.ownerType, 'cost_tran');
		var fieldValue = this.checkFieldValueForRows(rows, field, 'err_selection');
		if(fieldValue.constructor == Boolean && !fieldValue){
			return false;
		}
		this.ownerId = fieldValue;
		
		if(this.isVATAndMCEnabled){
			// check currencies for selected rows
			var field = "cost_tran.currency_payment";
			var fieldValue = this.checkFieldValueForRows(rows, field, 'err_selection_currency');
			if(fieldValue.constructor == Boolean && !fieldValue){
				return false;
			}
			this.currencyCode = fieldValue;
		}
		
		return true;
	},
	
    /*
     * Check if specified field has the same value for rows collection.
     * Return false if there are different values or field value if is the same value. 
     */
    checkFieldValueForRows: function(rows, field, messageId){
    	var value = null;
    	for(var i = 0; i < rows.length; i++){
    		var row = rows[i];
    		var currentValue = row[field]
    		if(value == null){
    			value = currentValue;
    		}else {
    			if( value != currentValue){
    				View.showMessage(getMessage(messageId));
    				return false;
    			}else{
    				value = currentValue;
    			}
    		}
    	}
    	return value;
    }
})