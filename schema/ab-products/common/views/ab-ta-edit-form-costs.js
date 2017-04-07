var abFurnitureForm_tabCostsController = View.createController('abFurnitureForm_tabCostsController', {
	
	afterInitialDataFetch: function () {
		
		if(valueExists(View.getOpenerView())){
			var openerConsole = View.getOpenerView();
			var tabs = View.getOpenerView().panels.get("abFurnitureForm_tabs");
			
			if(tabs){
				var newRecord = tabs.parameters.newRecord;
				if(!newRecord){
					newRecord = View.newRecord;
				}
				var tabsRestriction = tabs.parameters.restriction;
				
				if (valueExists(newRecord) && newRecord == true) {
					this.abTaEditForm_Costs.newRecord = newRecord;
					this.abTaEditForm_Costs.refresh();
					
					this.abPuchaseInfo.newRecord = newRecord;
					this.abWarrantyInfo.newRecord = newRecord;
					this.abPuchaseInfo.refresh();
					this.abWarrantyInfo.refresh();
				} else if(newRecord == false) {
					this.abTaEditForm_Costs.newRecord = newRecord;
					this.abTaEditForm_Costs.refresh(tabsRestriction);
					
					var record = this.ds_abTaEditFormCosts.getRecord(tabsRestriction);
					var costsDataSource = this.abTaEditForm_Costs.getDataSource();
					
					if(valueExistsNotEmpty(record)){
						this.abPuchaseInfo.setFieldValue("ta.po_id", record.getValue('ta.po_id'));
						this.abPuchaseInfo.setFieldValue("ta.ta_lease_id", record.getValue('ta.ta_lease_id'));
						this.abPuchaseInfo.setFieldValue("ta.cost_purchase", costsDataSource.formatValue('ta.cost_purchase', record.getValue('ta.cost_purchase'), true));
						this.abPuchaseInfo.refresh(tabsRestriction, newRecord);
						
						this.abWarrantyInfo.setFieldValue("ta.warranty_id", record.getValue('ta.warranty_id'));
						this.abWarrantyInfo.setFieldValue("ta.policy_id", record.getValue('ta.policy_id'));
						this.abWarrantyInfo.refresh(tabsRestriction, newRecord);
					}
					
				}
		    }
		}
		
		if(View.activityParameters["AbCommonResources-EnableVatAndMultiCurrency"]==1){
			var localizedCurrencyDescription = getLocalizedCurrencyDescriptionFor(View.user.userCurrency.code);
    		this.abTaEditForm_Costs.setFieldLabel("ta.value_replace",getMessage("value_replace_title") + ", " + localizedCurrencyDescription);
    		this.abTaEditForm_Costs.setFieldLabel("ta.value_salvage",getMessage("value_salvage_title") + ", " + localizedCurrencyDescription);
    	}else{
    		this.abTaEditForm_Costs.setFieldLabel("ta.value_replace",getMessage("value_replace_title"));
    		this.abTaEditForm_Costs.setFieldLabel("ta.value_salvage",getMessage("value_salvage_title"));
    	}
				
	},
	
	abTaEditForm_Costs_onCancel: function(){
		var costsForm = this.abTaEditForm_Costs;
		var detailsPanel = View.getOpenerView().parentViewPanel;
		
		
		if(detailsPanel){
			detailsPanel.loadView('ab-blank.axvw', costsForm.restriction, null);
		}else{
			if(View.getOpenerView().getParentDialog() && View.getOpenerView().panels.get('abFurnitureForm_tabs')){
				View.getOpenerView().getParentDialog().close();
			}
		}
		
		
	},
	
	processPurchaseInformation: function(){
		var costsForm = this.abTaEditForm_Costs;
		var purchaseForm = this.abPuchaseInfo;
		var costsRecord = costsForm.getRecord();
		var purchaseRecord = purchaseForm.getRecord();
		var costsDataSource = costsForm.getDataSource();
		
		costsForm.setFieldValue('ta.po_id', purchaseRecord.getValue('ta.po_id'));
		costsForm.setFieldValue('ta.ta_lease_id', purchaseRecord.getValue('ta.ta_lease_id'));
		costsForm.setFieldValue('ta.value_original', costsDataSource.formatValue('ta.value_original', purchaseRecord.getValue('ta.value_original'), true));
	},
	
	processWarrantyInformation: function(){
		var costsForm = this.abTaEditForm_Costs;
		var warrantyForm = this.abWarrantyInfo;
		var costsRecord = costsForm.getRecord();
		var warrantyRecord = warrantyForm.getRecord();
		
		costsForm.setFieldValue('eq.warranty_id', warrantyRecord.getValue('eq.warranty_id'));
		costsForm.setFieldValue('eq.policy_id', warrantyRecord.getValue('eq.policy_id'));
	},
	
	abTaEditForm_Costs_beforeRefresh: function(){
		/*var restriction = new Ab.view.Restriction();

		var tabs = View.getOpenerView().panels.get("abFurnitureForm_tabs");
		if(tabs){
			var newRecord = tabs.parameters.newRecord;
			var tabsRestriction = tabs.parameters.restriction;
			
			if(valueExists(newRecord) && newRecord == true) {
				this.abTaEditForm_Costs.newRecord = newRecord;
				this.abPuchaseInfo.newRecord = newRecord;
				this.abWarrantyInfo.newRecord = newRecord;
				this.abPuchaseInfo.refresh();
				this.abWarrantyInfo.refresh();
			}else if(newRecord == false) {
				if(tabsRestriction){
					if(tabsRestriction["ta.ta_id"]) {
						restriction.addClause('ta.ta_id', tabsRestriction["ta.ta_id"]);
					} else if(tabsRestriction.clauses && tabsRestriction.clauses[0]){
						restriction.addClause('ta.ta_id', tabsRestriction.clauses[0].value);
					}
				}
				this.abTaEditForm_Costs.restriction = restriction;
				this.abTaEditForm_Costs.newRecord = newRecord;
				this.abPuchaseInfo.refresh(restriction, newRecord);
				this.abWarrantyInfo.refresh(restriction, newRecord);
			}
		}*/
		var restriction = new Ab.view.Restriction();
		var newRecord = null;
		var tabsRestriction = null;

		var tabs = View.getOpenerView().panels.get("abFurnitureForm_tabs");
		if(tabs){
			newRecord = tabs.parameters.newRecord;
			tabsRestriction = tabs.parameters.restriction;
			
			if(!valueExists(newRecord)){
				newRecord = View.parameters.newRecord;
				tabsRestriction = View.parameters.restriction;
			}
			
			if(valueExists(newRecord) && newRecord == true) {
				this.abTaEditForm_Costs.newRecord = newRecord;
				this.abPuchaseInfo.newRecord = newRecord;
				this.abWarrantyInfo.newRecord = newRecord;
				this.abPuchaseInfo.refresh();
				this.abWarrantyInfo.refresh();
			}else {
				if(tabsRestriction){
					if(tabsRestriction["ta.ta_id"]) {
						restriction.addClause('ta.ta_id', tabsRestriction["ta.ta_id"]);
					} else if(tabsRestriction.clauses && tabsRestriction.clauses[0]){
						restriction.addClause('ta.ta_id', tabsRestriction.clauses[0].value);
					}
					this.abTaEditForm_Costs.restriction = restriction;
					this.abTaEditForm_Costs.newRecord = newRecord;
					this.abPuchaseInfo.refresh(restriction, newRecord);
					this.abWarrantyInfo.refresh(restriction, newRecord);
			}
				
			}
		}
		
		
	},
	
	abTaEditForm_Costs_onSave: function() {
		var costsForm = this.abTaEditForm_Costs;
		var purchaseForm = this.abPuchaseInfo;
		var warrantyForm = this.abWarrantyInfo;
		
		var costsDataSource = this.ds_abTaEditFormCosts;
		var restriction = new Ab.view.Restriction();
		var tabs = View.getOpenerView().panels.get("abFurnitureForm_tabs");
		var primaryFieldValue = costsForm.getFieldValue("ta.ta_id");
		
		var recordPurchase = purchaseForm.getRecord();
		var recordWarranty = warrantyForm.getRecord();
		var message = getMessage('formSaved');
		
		try{
			costsForm.setFieldValue('ta.po_id', recordPurchase.getValue('ta.po_id'));
			costsForm.setFieldValue('ta.ta_lease_id', recordPurchase.getValue('ta.ta_lease_id'));
			costsForm.setFieldValue('ta.cost_purchase', costsDataSource.formatValue('ta.cost_purchase', recordPurchase.getValue('ta.cost_purchase'), true));
			
			
			costsForm.setFieldValue('ta.warranty_id', recordWarranty.getValue('ta.warranty_id'));
			costsForm.setFieldValue('ta.policy_id', recordWarranty.getValue('ta.policy_id'));
			  
			  var isSaved = costsForm.save();
				if(isSaved){
					costsForm.setFieldValue('ta.ta_id', primaryFieldValue);
					restriction.addClause("ta.ta_id", primaryFieldValue);
					this.abTaEditForm_Costs.restriction = restriction;
					
					afterSaveFurniture(abFurnitureForm_tabCostsController, costsForm);
					
					costsForm.refresh(restriction);
					var record = costsDataSource.getRecord(restriction);

					purchaseForm.setFieldValue('ta.po_id', record.getValue('ta.po_id'));
					purchaseForm.setFieldValue('ta.ta_lease_id', record.getValue('ta.ta_lease_id'));
					purchaseForm.setFieldValue('ta.cost_purchase', costsDataSource.formatValue('ta.cost_purchase', record.getValue('ta.cost_purchase'), true));
					

					warrantyForm.setFieldValue('eq.warranty_id', record.getValue('ta.warranty_id'));
					warrantyForm.setFieldValue('eq.policy_id', record.getValue('ta.policy_id'));
					
					costsForm.displayTemporaryMessage(message);
				}
			
		}
		catch(e){
			var errMessage = getMessage('errorSave').replace('{0}', primaryFieldValue)+ '<br>'+ e.message;
            View.showMessage('error', errMessage, e.message, e.data);
            return;
		}
		
	}
});


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