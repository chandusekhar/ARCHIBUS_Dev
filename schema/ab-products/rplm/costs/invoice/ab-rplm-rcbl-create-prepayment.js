var createPrepaymentController = View.createController('createPrepaymentCtrl',{
	// if VAT and MC is enabled
	isVATAndMCEnabled: false,

	afterViewLoad: function(){
		// check if multi currency is enabled
		this.isVATAndMCEnabled = View.activityParameters['AbCommonResources-EnableVatAndMultiCurrency'] == 1;
		this.formCreatePrepayment.showField('invoice_payment.currency_invoice', this.isVATAndMCEnabled);
		
	},
	
	afterInitialDataFetch: function(){
		this.formCreatePrepayment.refresh(null, true);
		this.formCreatePrepayment.setFieldValue('invoice_payment.currency_invoice', View.user.userCurrency.code);
	},
	
	formCreatePrepayment_onSave: function(){
		if(parseFloat(this.formCreatePrepayment.getFieldValue('invoice_payment.amount_income'))<= 0){
			View.showMessage(getMessage('msg_no_amount'));
			return;
		}else if (this.formCreatePrepayment.save()) {
			var msg = getMessage('msg_save');
			/*
			 *04/08/2010 IOAN  KB 3023993   get localized values 
			 * for panel fields 
			 */
			var panel = this.formCreatePrepayment;
			var fieldData = getFieldData(panel, 'invoice_payment.payment_id');
			msg = msg + '<br>' + fieldData['title'] + ': ' + fieldData['value'];
			fieldData = getFieldData(panel, 'invoice_payment.contact_id');
			msg = msg + '<br>' + fieldData['title'] + ': ' + fieldData['value'];
			fieldData = getFieldData(panel, 'invoice_payment.payment_method');
			msg = msg + '<br>' + fieldData['title'] + ': ' + fieldData['value'];
			fieldData = getFieldData(panel, 'invoice_payment.check_number');
			msg = msg + '<br>' + fieldData['title'] + ': ' + fieldData['value'];
			fieldData = getFieldData(panel, 'invoice_payment.amount_income');
			msg = msg + '<br>' + fieldData['title'] + ': ' + fieldData['value'];
			if(this.isVATAndMCEnabled){
				fieldData = getFieldData(panel, 'invoice_payment.currency_invoice');
				msg = msg + '<br>' + fieldData['title'] + ': ' + fieldData['value'];
			}
			fieldData = getFieldData(panel, 'invoice_payment.date_paid');
			msg = msg + '<br>' + fieldData['title'] + ': ' + fieldData['value'];
			fieldData = getFieldData(panel, 'invoice_payment.description');
			msg = msg + '<br>' + fieldData['title'] + ': ' + fieldData['value'];
			
			View.showMessage('message', msg, null, null, function(){
				View.closeThisDialog();
			});
		}	
	}
});

/**
 * get localized data for panel fields
 * @param {Object} panel
 * @param {Object} field
 */
function getFieldData(panel, field){
	var objField = panel.fields.get(field);
	var objFieldDef = objField.fieldDef;
	var title = objFieldDef.title;
	var isEnum = objFieldDef.isEnum;
	var value = panel.getFieldValue(field);
	if(isEnum){
		value = objFieldDef.enumValues[value];
	}
	var result = {'title': title, 'value': value};
	return result;
}
