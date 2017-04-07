var prepaymentController = View.createController('prepaymentCtrl',{
	// selected invoice id
	invoice_id: null,
	
	// invoice wizard controller
	wizardController: null,
	
	// contact code
	contact_id: null,
	
	// prepayment code
	payment_id: null,
	
	// if VAT and MC is enabled
	isVATAndMCEnabled: false,
	
	currencyCode: null,
	
	afterViewLoad: function(){
		
		if(valueExists(View.parameters['invoice_id'])){
			this.invoice_id = parseInt(View.parameters['invoice_id']);
		}

		if(valueExists(View.parameters['wizardController'])){
			this.wizardController = View.parameters['wizardController'];
		}
		
		// check if multi currency is enabled
		this.isVATAndMCEnabled = View.activityParameters['AbCommonResources-EnableVatAndMultiCurrency'] == 1;
		this.formInvoice.showField('invoice.currency_invoice', this.isVATAndMCEnabled);
		
		
	},
	
	afterInitialDataFetch: function(){
		// refresh invoice form
		var restriction = new Ab.view.Restriction();
		restriction.addClause('invoice.invoice_id', this.invoice_id, '=');
		this.formInvoice.refresh(restriction);
		// get contact and currency code
		this.contact_id = this.formInvoice.getFieldValue('invoice.contact_id_send_to');
		if(this.isVATAndMCEnabled){
			this.currencyCode = this.formInvoice.getFieldValue('invoice.currency_invoice');
		}
		// refresh payment form
		restriction =  new Ab.view.Restriction();
		restriction.addClause('invoice_payment.invoice_id', '', 'IS NULL');
		restriction.addClause('invoice_payment.contact_id', this.contact_id, '=');
		restriction.addClause('invoice_payment.amount_income', '0', '>');
		if(this.isVATAndMCEnabled && valueExistsNotEmpty(this.currencyCode)){
			restriction.addClause('invoice_payment.currency_invoice', this.currencyCode, '=');
		}
		this.formPayment.refresh(restriction, false);
		
	},
	
	/*
	 * After refresh event handler.
	 */
	formPayment_afterRefresh: function(){
		this.formPayment.getFieldElement('invoice_payment.payment_id').readOnly = true;
		// format currency sign
		formatCurrency(this.formPayment);
		// set payment amount to 0.0
		var formattedValue = this.formPayment.getDataSource().formatValue('invoice_payment.amount_expense', 0, true);
		this.formPayment.setFieldValue('invoice_payment.amount_expense', formattedValue);
		// set info message
		var paymentId = this.formPayment.getFieldValue('invoice_payment.payment_id');
		if(valueExistsNotEmpty(paymentId)){
			$('spanInfo').innerHTML = getMessage('msg_info');
		}else {
			$('spanInfo').innerHTML = getMessage('msg_no_prepayments');
		}
	},
	/*
	 * onSave event handler.
	 */
	formInvoice_onSave: function(){
		var paymentId = this.formPayment.getFieldValue('invoice_payment.payment_id');
		if(!valueExistsNotEmpty(paymentId)){
			View.showMessage(getMessage('msg_no_prepayment'));
			return false;
		}
		// check prepayment amount
		var prepaymentAmount = this.formPayment.getFieldValue('invoice_payment.amount_expense');
		// read only field - read value from record to get without currency sign
		var amountIncome = this.formPayment.record.getValue('invoice_payment.amount_income');
		var invoiceBalance = this.formInvoice.record.getValue('invoice.amount_balance');
		
		if(parseFloat(prepaymentAmount) <= 0){
			View.showMessage(getMessage('msg_no_amount'));
			return false;
		}
		
		if(parseFloat(prepaymentAmount)> parseFloat(amountIncome)){
			var formattedValue = this.formPayment.getDataSource().formatValue('invoice_payment.amount_income', amountIncome, true);
			View.showMessage(getMessage('msg_more_than_income') + " " + formattedValue);
			return false;
		}
		
		if(parseFloat(prepaymentAmount)> parseFloat(invoiceBalance)){
			var formattedValue = this.formInvoice.getDataSource().formatValue('invoice.amount_balance', invoiceBalance, true);
			View.showMessage(getMessage('msg_more_than_balance') + " " + formattedValue);
			return;
		}
		// apply payment
		try{
			var result = Workflow.callMethod('AbRPLMChargebackInvoice-InvoiceService-applyPaymentFromPrepayment', this.invoice_id, parseInt(paymentId), prepaymentAmount);
			var restriction = new Ab.view.Restriction();
			restriction.addClause('invoice.invoice_id', this.invoice_id, '=');
			this.formInvoice.refresh(restriction);
			restriction = new Ab.view.Restriction();
			restriction.addClause('invoice_payment.payment_id', paymentId, '=');
			this.formPayment.refresh(restriction);
			
			this.showResult();

		}catch (e){
			Workflow.handleError(e);
			return false;
		}
		
	},
	
	/*
	 * Display results.
	 */
	showResult: function(){
		var controller = this;
		var invoiceBalance = this.formInvoice.record.getValue('invoice.amount_balance');
		var invoiceStatus = this.formInvoice.getFieldValue('invoice.status');
		var message = null;

		if(parseFloat(invoiceBalance) <= 0){
			if(invoiceStatus == "CLOSED"){
				message = getMessage("msg_invoice_closed");
			}
		}else{
			message = getMessage("msg_payment_applied");
		}
		
		View.showMessage('message',message ,null, null, function(){
			controller.wizardController.applyRestriction();
			View.closeThisDialog();
		});
	}	
})

/**
 * Select value payment id.
 */
function selectPrepayment(){
	var controller = View.controllers.get('prepaymentCtrl');
	var restriction = new Ab.view.Restriction();
	restriction.addClause('invoice_payment.contact_id', controller.contact_id, '=');
	restriction.addClause('invoice_payment.invoice_id', '', 'IS NULL');
	restriction.addClause('invoice_payment.amount_income', '0', '>');
	
	var visibleFields = ['invoice_payment.payment_id','invoice_payment.contact_id', 'invoice_payment.amount_income','invoice_payment.date_paid' ];
	if(controller.isVATAndMCEnabled){
		restriction.addClause('invoice_payment.currency_invoice', controller.currencyCode, '=');
		visibleFields = ['invoice_payment.payment_id','invoice_payment.contact_id', 'invoice_payment.amount_income','invoice_payment.date_paid','invoice_payment.currency_invoice'];
	}
	
	Ab.view.View.selectValue(
	        'selectPrepayment', //formId
	        getMessage('title_prepayment'), //title
	        ['invoice_payment.payment_id'], //targetFieldNames
	        'invoice_payment', //selectTableName
	        ['invoice_payment.payment_id'],//selectFieldNames
	        visibleFields,//visibleFieldNames
	        restriction, //restriction
	        'refreshPayment', //actionListener 	String: name of the afterSelectValue event handler function.
	        false, //applyFilter 	Boolean: whether to apply form field values as initial filter.
	        false, //showIndex		Boolean: whether to show the index.
	        '', //workflowRuleId	String: workflow rule ID used to get data records for the dialog.
	        800,  //width			Number: dialog width.
	        500, //height			Number: dialog height.
	        'grid' //selectValueType	grid|tree|hierTree
	    );
}

/**
 * After select listener.
 * 
 * @param fieldName
 * @param newValue
 * @param oldValue
 */
function refreshPayment(fieldName, newValue, oldValue){
	var form = View.panels.get('formPayment');
	if(!valueExists(fieldName)){
		newValue = form.getFieldValue('invoice_payment.payment_id');
	}
	var restriction = new Ab.view.Restriction();
	restriction.addClause('invoice_payment.payment_id', newValue, '=');
	form.refresh(restriction, false);
}


/**
 * Format form field to show currency symbol when are read only.
 * @param form
 */
function formatCurrency(form){
	var dataSource = form.getDataSource();
	var fieldValues = form.record.values;
	var record = form.record;
	dataSource.fieldDefs.each(function(fieldDef){
		var fieldName = fieldDef.fullName;
		if(valueExistsNotEmpty(fieldDef.currencyField) 
				&& valueExists(form.fields.get(fieldName)) 
					&& form.fields.get(fieldName).fieldDef.readOnly){
			
			var neutralValue = record.getValue(fieldName);
			var localizedValue = record.getLocalizedValue(fieldName);
			if(valueExistsNotEmpty(localizedValue)){
				var formattedValue = dataSource.formatCurrencyValue(fieldName, localizedValue, fieldValues);
				form.setFieldValue(fieldName, formattedValue, neutralValue, false);
			}
		}else if(valueExistsNotEmpty(fieldDef.currency)
				&& valueExists(form.fields.get(fieldName)) 
					&& form.fields.get(fieldName).fieldDef.readOnly ){
			var neutralValue = record.getValue(fieldName);
			var localizedValue = record.getLocalizedValue(fieldName);
			if(valueExistsNotEmpty(localizedValue)){
				var formattedValue = dataSource.formatCurrencyValue(fieldName, localizedValue, fieldValues);
				form.setFieldValue(fieldName, formattedValue, neutralValue, false);
			}
		}
	});
}

