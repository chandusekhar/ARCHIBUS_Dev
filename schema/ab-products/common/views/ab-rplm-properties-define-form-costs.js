var abPropertiesDefineForm_tabCostsController = View.createController('abPropertiesDefineForm_tabCostsController', {
	
	afterInitialDataFetch: function () {
		var restriction = new Ab.view.Restriction();
		var tabs = View.getOpenerView().panels.get("abPropertiesDefineForm_tabs");
		var newRecord = tabs.parameters.newRecord;
		var tabsRestriction = tabs.parameters.restriction;
		
		if(newRecord){
			this.abPropertiesDefineForm_costs.newRecord = newRecord;
			this.abPropertiesDefineForm_costs.show();
		}else{
			if(tabsRestriction){
				if(tabsRestriction["property.pr_id"]) {
					restriction.addClause('property.pr_id', tabsRestriction["property.pr_id"]);
				} else if(tabsRestriction.clauses && tabsRestriction.clauses[0]){
					restriction.addClause('property.pr_id', tabsRestriction.clauses[0].value);
				}
			}
			this.abPropertiesDefineForm_costs.refresh(restriction);
		}
		
		if(View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"]==1){
    		this.abPropertiesDefineForm_costs.setFieldLabel("property.value_book",getMessage("value_book_title") + ", " + View.user.userCurrency.description);
    		this.abPropertiesDefineForm_costs.setFieldLabel("property.value_market",getMessage("value_market_title") + ", " + View.user.userCurrency.description);
    	}else{
    		this.abPropertiesDefineForm_costs.setFieldLabel("property.value_book",getMessage("value_book_title"));
    		this.abPropertiesDefineForm_costs.setFieldLabel("property.value_market",getMessage("value_market_title"));
    	}
	},
	
	abPropertiesDefineForm_costs_beforeRefresh: function() {
		var restriction = new Ab.view.Restriction();
		var tabs = View.getOpenerView().panels.get("abPropertiesDefineForm_tabs");
		
		if(tabs) {
			var newRecord = tabs.parameters.newRecord;
			var tabsRestriction = tabs.parameters.restriction;
			
			if(valueExists(newRecord) && newRecord == true) {
				this.abPropertiesDefineForm_costs.newRecord = newRecord;
			}else if(newRecord == false) {
				if(tabsRestriction){
					if(tabsRestriction["property.pr_id"]) {
						restriction.addClause('property.pr_id', tabsRestriction["property.pr_id"]);
					} else if(tabsRestriction.clauses && tabsRestriction.clauses[0]){
						restriction.addClause('property.pr_id', tabsRestriction.clauses[0].value);
					}
				}
				this.abPropertiesDefineForm_costs.restriction = restriction;
			}
		}
	},
	
	abPropertiesDefineForm_costs_onSave: function() {
		var propertyForm = this.abPropertiesDefineForm_costs;
		if (valueExistsNotEmpty(propertyForm.record.getValue("property.pr_id"))) {
			beforeSaveProperty(this);
			var isSaved = propertyForm.save();
			setTimeout(function(){
				if (isSaved){
					afterSaveProperty(abPropertiesDefineForm_tabCostsController, propertyForm);
					propertyForm.refresh();
				}
			}, 1000);
		} else {
			View.alert(getMessage("missingPrId"));
		}
	}
});