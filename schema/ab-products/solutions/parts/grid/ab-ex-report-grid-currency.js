
View.createController('extReportCurrency', {
	
	exCurrencyGrid_onShowNonUsd: function() {
		this.exCurrencyGrid.refresh("currency_payment != 'USD'");
	},

	exCurrencyGrid_onShowAll: function() {
		this.exCurrencyGrid.refresh("", false, true);
	}
});