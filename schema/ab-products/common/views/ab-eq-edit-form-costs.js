var abEquipmentForm_tabCostsController = View.createController('abEquipmentForm_tabCostsController', {

	afterInitialDataFetch: function () {
		
		if(valueExists(View.getOpenerView())){
			var openerConsole = View.getOpenerView();
			var tabs = View.getOpenerView().panels.get("abEquipmentForm_tabs");
			
			if(tabs){
				var newRecord = tabs.parameters.newRecord;
				if(!newRecord){
					newRecord = View.newRecord;
				}
				var tabsRestriction = tabs.parameters.restriction;
				
				if (valueExists(newRecord) && newRecord == true) {
					this.abEqEditForm_Costs.newRecord = newRecord;
					this.abEqEditForm_Costs.refresh();
					
					this.abPuchaseInfo.newRecord = newRecord;
					this.abWarrantyInfo.newRecord = newRecord;
					this.abPuchaseInfo.refresh();
					this.abWarrantyInfo.refresh();
				} else if(newRecord == false) {
					this.abEqEditForm_Costs.newRecord = newRecord;
					this.abEqEditForm_Costs.refresh(tabsRestriction);
					
					var record = this.ds_abEqEditFormCosts.getRecord(tabsRestriction);
					var costsDataSource = this.abEqEditForm_Costs.getDataSource();
					if(valueExistsNotEmpty(record)){
						this.abPuchaseInfo.setFieldValue("eq.num_po", record.getValue('eq.num_po'));
						this.abPuchaseInfo.setFieldValue("eq.vn_id", record.getValue('eq.vn_id'));
						this.abPuchaseInfo.setFieldValue("eq.po_line_id", record.getValue('eq.po_line_id'));
						this.abPuchaseInfo.setFieldValue("eq.cost_purchase", costsDataSource.formatValue("eq.cost_purchase", record.getValue('eq.cost_purchase'), true));
						this.abPuchaseInfo.setFieldValue("eq.num_lease", record.getValue('eq.num_lease'));
						
						this.abPuchaseInfo.setFieldValue("eq.date_purchased", costsDataSource.formatValue("eq.date_purchased", record.getValue('eq.date_purchased'), true));
						this.abPuchaseInfo.refresh(tabsRestriction, newRecord);
						
						this.abWarrantyInfo.setFieldValue("eq.warranty_id", record.getValue('eq.warranty_id'));
						this.abWarrantyInfo.setFieldValue("eq.servcont_id", record.getValue('eq.servcont_id'));
						this.abWarrantyInfo.setFieldValue("eq.date_warranty_exp", record.getValue('eq.date_warranty_exp'));
						this.abWarrantyInfo.setFieldValue("eq.policy_id", record.getValue('eq.policy_id'));
						this.abWarrantyInfo.refresh(tabsRestriction, newRecord);
					}
				}
					
			}
		  }
	},
	
	processPurchaseInformation: function(){
		var costsForm = this.abEqEditForm_Costs;
		var purchaseForm = this.abPuchaseInfo;
		var costsRecord = costsForm.getRecord();
		var purchaseRecord = purchaseForm.getRecord();
		var costsDataSource = costsForm.getDataSource();
		
		costsForm.setFieldValue('eq.num_po', purchaseRecord.getValue('eq.num_po'));
		costsForm.setFieldValue('eq.vn_id', purchaseRecord.getValue('eq.vn_id'));
		costsForm.setFieldValue('eq.po_line_id', purchaseRecord.getValue('eq.po_line_id'));
		costsForm.setFieldValue('eq.num_lease', purchaseRecord.getValue('eq.num_lease'));
		costsForm.setFieldValue('eq.cost_purchase', costsDataSource.formatValue('eq.cost_purchase', purchaseRecord.getValue('eq.cost_purchase'), true));
		
		var datePurchase = costsDataSource.parseValue('eq.date_purchased', purchaseRecord.getValue('eq.date_purchased'), false);
		var localizedDatePurchased = costsDataSource.formatValue('eq.date_purchased', datePurchase, true);
		costsForm.setFieldValue('eq.date_purchased', localizedDatePurchased);
	},
	
	processWarrantyInformation: function(){
		var costsForm = this.abEqEditForm_Costs;
		var warrantyForm = this.abWarrantyInfo;
		var costsRecord = costsForm.getRecord();
		var warrantyRecord = warrantyForm.getRecord();
		var costsDataSource = costsForm.getDataSource();
		
		costsForm.setFieldValue('eq.warranty_id', warrantyRecord.getValue('eq.warranty_id'));
		costsForm.setFieldValue('eq.servcont_id', warrantyRecord.getValue('eq.servcont_id'));
		costsForm.setFieldValue('eq.po_line_id', warrantyRecord.getValue('eq.po_line_id'));
		costsForm.setFieldValue('eq.num_lease', warrantyRecord.getValue('eq.num_lease'));
		costsForm.setFieldValue('eq.cost_purchase', costsDataSource.formatValue('eq.cost_purchase', warrantyRecord.getValue('eq.cost_purchase'), true));
		
		var dateWarranty = costsDataSource.parseValue('eq.date_warranty_exp', warrantyRecord.getValue('eq.date_warranty_exp'), false);
		var localizedDateWarranty = costsDataSource.formatValue('eq.date_warranty_exp', dateWarranty, true);
		costsForm.setFieldValue('eq.date_warranty_exp', localizedDateWarranty);
		
	},
	
	abEqEditForm_Costs_onCancel: function(){
		var costsForm = this.abEqEditForm_Costs;
		var detailsPanel = View.getOpenerView().parentViewPanel;
		
		if(detailsPanel){
			detailsPanel.loadView('ab-blank.axvw', costsForm.restriction, null);
		}else{
			if(View.getOpenerView().getParentDialog() && View.getOpenerView().panels.get('abEquipmentForm_tabs')){
				View.getOpenerView().getParentDialog().close();
			}
		}
	},
	
	abEqEditForm_Costs_beforeRefresh: function(){
		var restriction = new Ab.view.Restriction();
		var newRecord = null;
		var tabsRestriction = null;

		var tabs = View.getOpenerView().panels.get("abEquipmentForm_tabs");
		if(tabs){
			newRecord = tabs.parameters.newRecord;
			tabsRestriction = tabs.parameters.restriction;
			
			if(!valueExists(newRecord)){
				newRecord = View.parameters.newRecord;
				tabsRestriction = View.parameters.restriction;
			}
			
			if(valueExists(newRecord) && newRecord == true) {
				this.abEqEditForm_Costs.newRecord = newRecord;
				this.abPuchaseInfo.newRecord = newRecord;
				this.abWarrantyInfo.newRecord = newRecord;
				this.abPuchaseInfo.refresh();
				this.abWarrantyInfo.refresh();
			}else if(newRecord == false) {
				if(tabsRestriction){
					if(tabsRestriction["eq.eq_id"]) {
						restriction.addClause('eq.eq_id', tabsRestriction["eq.eq_id"]);
					} else if(tabsRestriction.clauses && tabsRestriction.clauses[0]){
						restriction.addClause('eq.eq_id', tabsRestriction.clauses[0].value);
					}
				}
				this.abEqEditForm_Costs.restriction = restriction;
				this.abEqEditForm_Costs.newRecord = newRecord;
				this.abPuchaseInfo.refresh(restriction, newRecord);
				this.abWarrantyInfo.refresh(restriction, newRecord);
			}
		}
	},
	
	abEqEditForm_Costs_onSave: function(afterSaveCallback) {
		var costsForm = this.abEqEditForm_Costs;
		var purchaseForm = this.abPuchaseInfo;
		var warrantyForm = this.abWarrantyInfo;
		
		var costsDataSource = this.ds_abEqEditFormCosts;
		var restriction = new Ab.view.Restriction();
		var tabs = View.getOpenerView().panels.get("abEquipmentForm_tabs");
		var primaryFieldValue = costsForm.getFieldValue("eq.eq_id");
		
		var recordPurchase = purchaseForm.getRecord();
		var recordWarranty = warrantyForm.getRecord();
		var message = getMessage('formSaved');
		
		try{
			costsForm.setFieldValue('eq.num_po', recordPurchase.getValue('eq.num_po'));
			costsForm.setFieldValue('eq.vn_id', recordPurchase.getValue('eq.vn_id'));
			costsForm.setFieldValue('eq.po_line_id', recordPurchase.getValue('eq.po_line_id'));
			costsForm.setFieldValue('eq.cost_purchase', costsDataSource.formatValue('eq.cost_purchase', recordPurchase.getValue('eq.cost_purchase'), true));
			costsForm.setFieldValue('eq.num_lease', recordPurchase.getValue('eq.num_lease'));
			
			
			costsForm.setFieldValue('eq.warranty_id', recordWarranty.getValue('eq.warranty_id'));
			costsForm.setFieldValue('eq.servcont_id', recordWarranty.getValue('eq.servcont_id'));
			costsForm.setFieldValue('eq.date_warranty_exp', recordWarranty.getValue('eq.date_warranty_exp'));
			costsForm.setFieldValue('eq.policy_id', recordWarranty.getValue('eq.policy_id'));
			  
			  var isSaved = costsForm.save();
				if(isSaved){
					costsForm.setFieldValue('eq.eq_id', primaryFieldValue);
					restriction.addClause("eq.eq_id", primaryFieldValue);
					this.abEqEditForm_Costs.restriction = restriction;
					
					afterSaveEquipment(abEquipmentForm_tabCostsController, costsForm);
					
					costsForm.refresh(restriction);
					var record = costsDataSource.getRecord(restriction);
					

					purchaseForm.setFieldValue('eq.num_po', record.getValue('eq.num_po'));
					purchaseForm.setFieldValue('eq.vn_id', record.getValue('eq.vn_id'));
					purchaseForm.setFieldValue('eq.po_line_id', record.getValue('eq.po_line_id'));
					purchaseForm.setFieldValue('eq.cost_purchase', costsDataSource.formatValue('eq.cost_purchase', record.getValue('eq.cost_purchase'), true));
					purchaseForm.setFieldValue('eq.num_lease', record.getValue('eq.num_lease'));
					
					warrantyForm.setFieldValue('eq.warranty_id', record.getValue('eq.warranty_id'));
					warrantyForm.setFieldValue('eq.servcont_id', record.getValue('eq.servcont_id'));
					warrantyForm.setFieldValue('eq.date_warranty_exp', record.getValue('eq.date_warranty_exp'));
					warrantyForm.setFieldValue('eq.policy_id', record.getValue('eq.policy_id'));
					
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

