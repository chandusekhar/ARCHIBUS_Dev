/**
 * Custom validation for exchange rate.
 * @param form
 */
function validateForm(form){
	// check if exchange rate is greater than zero
	var exchangeRate = form.getFieldValue('afm_conversions.factor');
	if(parseFloat(exchangeRate) <= 0){
		form.addInvalidField(
	            'afm_conversions.factor',
	            getMessage('convFactorTooSmall'));
		return false;
	}
	return true;
}
/**
 * Verify if the currency code is a supported ISO 4217 code and 
 * if code is not valid it is added as invalid field to currency edit form object.
 * 
 * @param objFormCurrency currency edit form object
 * @returns {Boolean} true if the validation was performed without errors
 */
function validateCurrency(objFormCurrency){
	var currencyCode = objFormCurrency.getFieldValue('afm_currencies.currency_id');
	try {
		var isValidCurrency = Workflow.callMethod('AbCommonResources-CostService-isValidCurrency', currencyCode);
	} catch (e){
		Workflow.handleError(e);
		return false;
	}
	if(isValidCurrency.value==false){
		objFormCurrency.addInvalidField(
	            'afm_currencies.currency_id',
	            getMessage('invalidCurrencyCode'));
	} 
	return true;
}

/**
 * Save currency form.
 */
function saveCurrency(){
	var objFormCurrency = View.panels.get('abDefCurrencyEdit');
	var objFormBudget = View.panels.get('abDefCurrencyExchangeRateBudget');
	var objFormPayment = View.panels.get('abDefCurrencyExchangeRatePayment');
	
	if(objFormCurrency.canSave() && validateCurrency(objFormCurrency)){
		if(objFormCurrency.newRecord){
			// we must set currency to exchange rate forms
			var currentDate = new Date();
			var ds =  objFormBudget.getDataSource();
			var currencyCode = objFormCurrency.getFieldValue('afm_currencies.currency_id');
			objFormBudget.setFieldValue('afm_conversions.source_units', currencyCode);
			objFormPayment.setFieldValue('afm_conversions.source_units', currencyCode);
			
			objFormBudget.setFieldValue('afm_conversions.date_last_update', ds.formatValue('afm_conversions.date_last_update', currentDate, true));
			objFormPayment.setFieldValue('afm_conversions.date_last_update', ds.formatValue('afm_conversions.date_last_update', currentDate, true));
			
			if(objFormBudget.canSave() && objFormPayment.canSave()){
				return (objFormCurrency.save() && objFormBudget.save() && objFormPayment.save());
			}else{
				return false;
			}
		}else{
			return objFormCurrency.save();
		}
	}else{
		return false;
	}
}

/**
 * Reload all exchange rates.
 */
function reloadCurrencies(){
	
	try {
		Workflow.callMethod('AbSystemAdministration-ConfigHandlers-reloadCurrencyConversions');
	} catch (e){
		Workflow.handleError(e);
	}
}

