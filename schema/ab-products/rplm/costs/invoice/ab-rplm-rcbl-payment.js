var paymentController = View.createController('paymentCtrl',{
	// invoice id
	invoice_id: null,
	
	// if is prepayment
	isPrepayment: false,
	
	// prepayment income
	prepaymentIncome: '',
	
	// payment record
	recPayment: null,
	
	// contact code
	contact_id:null,
	
	// cost wizard controller
	wizardController: null,
	
	// if VAT and MC is enabled
	isVATAndMCEnabled: false,
	
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
		var restriction = new Ab.view.Restriction();
		restriction.addClause("invoice.invoice_id", this.invoice_id, "=");
		this.formInvoice.refresh(restriction);
		this.formPayment.refresh(null, true);
	},
	
	/*
	 * Save event handler.
	 */
	formInvoice_onSave: function(){
		this.isPrepayment = false;
		if(this.formPayment.canSave()){
			// check if payment amount is greater than zero
			var paymentAmount = this.formPayment.getFieldValue('invoice_payment.amount_income');
			if(parseFloat(paymentAmount) <= 0){
				this.formPayment.addInvalidField('invoice_payment.amount_income', getMessage('msg_no_payment_amount'));
				this.formPayment.validationResult.valid = false;
				this.formPayment.displayValidationResult();
				return false;
			}
			// get contact id
			this.contact_id = this.formInvoice.getFieldValue('invoice.contact_id_send_to');
			// get payment record
			this.recPayment = this.formPayment.getOutboundRecord();
			// check invoice amount balance
			var invoiceBalance = null;
			if(this.isVATAndMCEnabled && this.formInvoice.fields.get('invoice.amount_balance').fieldDef.readOnly){
				// if is read only and is MC & VAT  will have currency sign
				invoiceBalance = this.formInvoice.record.getValue('invoice.amount_balance');
			}else{
				invoiceBalance = this.formInvoice.getFieldValue('invoice.amount_balance');
			}

			if(parseFloat(paymentAmount) > parseFloat(invoiceBalance)){
				var controller = this;
				View.confirm(getMessage('msg_new_prepayment'), function(button){
					if(button == 'yes'){
						controller.isPrepayment = true;
						controller.applyPayment();
					}else{
						return false;
					}
				});
			}else{
				this.applyPayment();
			}
		}
	},
	
	/*
	 * call WFR
	 */
	applyPayment: function(){
		try{
			var result = Workflow.callMethod('AbRPLMChargebackInvoice-InvoiceService-applyPayment', this.invoice_id, this.contact_id, this.recPayment);
			//refresh view 
			var restriction = new Ab.view.Restriction();
			restriction.addClause("invoice.invoice_id", this.invoice_id, "=");
			this.formInvoice.refresh(restriction);
			this.formPayment.refresh(null, true);
			// get prepayment record if exist
			var prepayment = null;
			if(this.isPrepayment){
				prepayment = result.dataSet;
			}
			this.showResult(prepayment);
		} catch (e) {
        	Workflow.handleError(e);
    	}
	},
	
	/*
	 * Display results.
	 */
	showResult: function(prepayment){
		var controller = this;
		var dataSource = this.formPayment.getDataSource();
		
		var invoiceBalance = null;
		if(this.isVATAndMCEnabled && this.formInvoice.fields.get('invoice.amount_balance').fieldDef.readOnly){
			// if is read only and is MC & VAT  will have currency sign
			invoiceBalance = this.formInvoice.record.getValue('invoice.amount_balance');
		}else{
			invoiceBalance = this.formInvoice.getFieldValue('invoice.amount_balance');
		}
		var invoiceStatus = this.formInvoice.getFieldValue('invoice.status');
		if(parseFloat(invoiceBalance) <= 0){
			if(invoiceStatus == 'CLOSED'){
				View.showMessage('message',getMessage('msg_invoice_closed'),null, null, function(){
					if(controller.isPrepayment && valueExists(prepayment)){
						var prepaymentId = prepayment.getValue("invoice_payment.payment_id");
						var prepaymentAmount = prepayment.getValue("invoice_payment.amount_income");
						var msg = getMessage('msg_prepayment_created');
						msg = msg.replace('{0}', dataSource.formatValue('invoice_payment.amount_income', prepaymentAmount, true));
						msg = msg.replace('{1}', prepaymentId);

						View.showMessage('message', msg, null, null, function(){
							controller.wizardController.applyRestriction();
							View.closeThisDialog();
						});
					}else{
						controller.wizardController.applyRestriction();
						View.closeThisDialog();
					}
				});
			}else{
				if(controller.isPrepayment && valueExists(prepayment)){
					var prepaymentId = prepayment.getValue("invoice_payment.payment_id");
					var prepaymentAmount = prepayment.getValue("invoice_payment.amount_income");
					var msg = getMessage('msg_prepayment_created');
					msg = msg.replace('{0}', dataSource.formatValue('invoice_payment.amount_income', prepaymentAmount, true));
					msg = msg.replace('{1}', prepaymentId);

					View.showMessage('message', msg, null, null, function(){
						controller.wizardController.applyRestriction();
						View.closeThisDialog();
					});
				}else{
					controller.wizardController.applyRestriction();
					View.closeThisDialog();
				}
			}
		}else{
			View.showMessage('message', getMessage('msg_payment_applied'),null,null, function(){
				controller.wizardController.applyRestriction();
				View.closeThisDialog();
			});
		}
	}
});


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
