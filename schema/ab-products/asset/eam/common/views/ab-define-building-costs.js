var abDefineBuilding_tabCostsController = View.createController('abDefineBuilding_tabCostsController', {
	
	restriction : null,
	
	newRecord: null,
	
	afterInitialDataFetch: function () {
		this.refreshRestriction();
		
		if(View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"]==1){
			var currencyDescription = getLocalizedCurrencyDescriptionFor(View.user.userCurrency.code);
			this.abDefineBuilding_costs.setFieldLabel("bl.cost_sqft",getMessage("cost_sqft_title") + ", " + currencyDescription);
    		this.abDefineBuilding_costs.setFieldLabel("bl.value_book",getMessage("value_book_title") + ", " + currencyDescription);
    		this.abDefineBuilding_costs.setFieldLabel("bl.value_market",getMessage("value_market_title") + ", " + currencyDescription);
    	}else{
    		this.abDefineBuilding_costs.setFieldLabel("bl.cost_sqft",getMessage("cost_sqft_title"));
    		this.abDefineBuilding_costs.setFieldLabel("bl.value_book",getMessage("value_book_title"));
    		this.abDefineBuilding_costs.setFieldLabel("bl.value_market",getMessage("value_market_title"));
    	}
	},
	
	refreshRestriction: function() {
		var tabs = View.getOpenerView().panels.get("abDefineBuilding_tabs");
		if (tabs && valueExists(tabs.restriction)) {
			this.restriction = tabs.restriction;
		}
		if (tabs && valueExists(tabs.newRecord)) {
			this.newRecord = tabs.newRecord;
		}
		
		if (this.newRecord) {
			this.abDefineBuilding_costs.refresh(null, this.newRecord);
		} else {
			this.abDefineBuilding_costs.refresh(this.restriction);
		}
	}
});

function setNewRestrictionForTabs() {
	var form = abDefineBuilding_tabCostsController.abDefineBuilding_costs;
	setRestrictionForTabs(abDefineBuilding_tabCostsController, form);
}


/**
 * Get localized currency description for currency code.
 * @param code currency code
 */
function getLocalizedCurrencyDescriptionFor(code){
	var description = '';
	for (var i = 0; i < View.user.currencies.length; i++) {
		var currency = View.user.currencies[i];
		if (currency.code == code) {
			description = currency.description;
			break;
		}
	}
	return description;
}