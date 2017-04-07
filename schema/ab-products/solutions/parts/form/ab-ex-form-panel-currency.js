/**
 * Controller for the currency form example.
 */
View.createController('exFormCurrency', {
	
	afterInitialDataFetch: function() {	
		// Only for demo purpose due to no localization, show currency of the field in the field description area.
		var fieldDef = this.exCurrencyForm.getDataSource().fieldDefs.get("cost_tran.amount_expense_base_payment");
		var currency = fieldDef.currency;
		if (currency == 'USD') {
			currency = "US Dollars ("  + currency + ")";
		} else if (currency == 'EUR') {
			currency = "Euros ("  + currency + ")";
		}
		this.exCurrencyForm.showFieldDescription("cost_tran.amount_expense_base_payment", currency);
	}
});