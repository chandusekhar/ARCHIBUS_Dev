var addEditScheduledCostController = View.createController('addEditScheduledCost',{
	// opener controller object
	openerController:null,
	// input parameters that come from opener
	/*
	 * runtimeParameters = {
        		isNewRecord: isNew,
        		isBuilding: this.isBuilding,
        		isProperty: this.isProperty,
        		isLease: this.isLease,
        		isAccount: this.isAccount,
        		ls_id: this.ls_id,
				pr_id: this.pr_id,
				bl_id: this.bl_id,
				ac_id: this.ac_id,
				cost_tran_recur_id: costTranRecurId,
				openerController: this,
				gridPanel: this.recurringCostGrid,
				callbackAfterSave: controller.afterSaveScheduledCost,
				cam: true, // the cost to create should be a CAM cost?
				camDefaultCostCat: defaultCostCat // default cost category for CAM cost
        }
	 */
	runtimeParameters: null,
	
	// if VAT and MC is enabled
	isVATAndMCEnabled: false,
	
	formId: null,
	
	isVatExcluded: false,

	afterSelectListenerCostCateg: "",

	afterViewLoad: function(){
		// read runtime parameters
		if(valueExists(this.view.parameters.runtimeParameters)){
			this.runtimeParameters = this.view.parameters.runtimeParameters;
		}
		// check if multi currency is enabled
		this.isVATAndMCEnabled = View.activityParameters['AbCommonResources-EnableVatAndMultiCurrency'] == 1;
		if(this.isVATAndMCEnabled){
			this.formId = "scheduledCostFormVAT";
			View.panels.get("scheduledCostFormVAT").show(true, true);
			View.panels.get("scheduledCostForm").show(false, true);
		}else{
			this.formId = "scheduledCostForm";
			View.panels.get("scheduledCostFormVAT").show(false, true);
			View.panels.get("scheduledCostForm").show(true, true);
		}
		View.panels.get(this.formId).addEventListener("onAutoCompleteSelect", onAutoCompleteSelect);
	},

	afterInitialDataFetch: function(){
		// prepare form
		var objForm = View.panels.get(this.formId);
		var restriction = null;
		var title = null;
		if(this.runtimeParameters.isNewRecord) {
			title = getMessage('add_sched_cost');
		}else{
			title = getMessage('edit_sched_cost');
			restriction = new Ab.view.Restriction();
			restriction.addClause('cost_tran_sched.cost_tran_sched_id', this.runtimeParameters.cost_tran_sched_id);
		}
		// refresh form
		objForm.refresh(restriction, this.runtimeParameters.isNewRecord);
		if(this.runtimeParameters.isBuilding){
			objForm.setFieldValue("cost_tran_sched.bl_id", this.runtimeParameters.bl_id);
		}else if(this.runtimeParameters.isProperty){
			objForm.setFieldValue("cost_tran_sched.pr_id", this.runtimeParameters.pr_id);
		}else if(this.runtimeParameters.isLease){
			objForm.setFieldValue("cost_tran_sched.ls_id", this.runtimeParameters.ls_id);
			this.isVatExcluded = isVatExcludedForLease(this.runtimeParameters.ls_id);
			this.scheduledCostFormVAT.setFieldValue("ls.vat_exclude", this.isVatExcluded ? '1' : '0');
		}else if(this.runtimeParameters.isAccount){
			objForm.setFieldValue("cost_tran_sched.ac_id", this.runtimeParameters.ac_id);
		}
		var afterSelectListenerCtryId = "";
		if(this.isVATAndMCEnabled){
			this.afterSelectListenerCostCateg = 'afterSelectCostCategory';
			afterSelectListenerCtryId = 'afterSelectCountryId';

			if(this.runtimeParameters.isNewRecord){
				objForm.setFieldValue("cost_tran_sched.ctry_id", View.user.country);
				objForm.setFieldValue("cost_tran_sched.currency_payment", View.user.userCurrency.code);
			}
			setOverrideField("chk_vat_percent", this.formId, "cost_tran_sched.vat_percent_override", 0);
			setOverrideField("chk_vat_amount", this.formId, "cost_tran_sched.vat_amount_override", -1);
			setOverrideField("chk_exchange_rate", this.formId, "cost_tran_sched.exchange_rate_override", 1);
		}else{
			this.afterSelectListenerCostCateg = "setCamFieldValue";
		}
		// set title
		objForm.setTitle(title);

		objForm.showField("cost_tran_sched.bl_id", this.runtimeParameters.isBuilding);
		objForm.showField("cost_tran_sched.bl_id_fake", this.runtimeParameters.isBuilding);
		objForm.showField("cost_tran_sched.pr_id", this.runtimeParameters.isProperty);
		objForm.showField("cost_tran_sched.pr_id_fake", this.runtimeParameters.isProperty);
		objForm.showField("cost_tran_sched.ls_id", this.runtimeParameters.isLease);
		objForm.showField("cost_tran_sched.ls_id_fake", this.runtimeParameters.isLease);
		objForm.showField("cost_tran_sched.ac_id", this.runtimeParameters.isAccount);
		objForm.showField("cost_tran_sched.ac_id_fake", this.runtimeParameters.isAccount);
		
		var showCam = (this.runtimeParameters.isLandlord && !this.runtimeParameters.isAccount);
		objForm.showField("cost_tran_sched.cam_cost", showCam);
		
		this.makeCategoryType(this.formId, this.runtimeParameters.isBuilding, this.runtimeParameters.isProperty, this.runtimeParameters.isLease, this.runtimeParameters.isAccount, this.runtimeParameters.isNewRecord, this.afterSelectListenerCostCateg);
		
		var fieldCtry = objForm.fields.get('cost_tran_sched.ctry_id');
		if (valueExists(fieldCtry)) {
			var command = fieldCtry.actions.items[0].command.commands[0];
			if(valueExistsNotEmpty(afterSelectListenerCtryId)){
				command.actionListener = afterSelectListenerCtryId;
			}
			this.openerController = this.runtimeParameters.openerController;
		}
		
		// Initialization for CAM
		if(this.runtimeParameters.cam && objForm.newRecord){
			objForm.setFieldValue("cost_tran_sched.cam_cost", "CAM");
			objForm.setFieldValue("cost_tran_sched.cost_cat_id", this.runtimeParameters.camDefaultCostCat);
			setVatAndCalculateCosts(objForm.id);
		}
		
	},
	
	scheduledCostForm_onSave: function(){
		if (this.scheduledCostForm.save()) {
			if(this.runtimeParameters.gridPanel){
				this.runtimeParameters.gridPanel.refresh();
			}
			
			if(this.runtimeParameters.callbackAfterSave){
				// get new cost id
				var costId = this.scheduledCostForm.getFieldValue("cost_tran_sched.cost_tran_sched_id");
				this.runtimeParameters.callbackAfterSave(costId);
			}

			View.closeThisDialog();
		}
	},
	
	scheduledCostFormVAT_onSave: function(){
		
		if (calculateCosts('scheduledCostFormVAT', 'cost_tran_sched', 'chk_vat_amount') && this.scheduledCostFormVAT.save()) {
			// we must convert exchange rate costs
			try{
				// get new cost id 
				var costId = this.scheduledCostFormVAT.getFieldValue("cost_tran_sched.cost_tran_sched_id");
				// call convert cost WFR
				var result = Workflow.callMethod('AbCommonResources-CostService-convertCostForVATAndMC', [parseInt(costId)], ["cost_tran_sched"]);
				
				if(this.runtimeParameters.gridPanel){
					this.runtimeParameters.gridPanel.refresh();
				}
				if(this.runtimeParameters.callbackAfterSave){
					this.runtimeParameters.callbackAfterSave(costId);
				}
				View.closeThisDialog();
			}catch(e){
				Workflow.handleError(e);
				return false;
			}
		}
	},
	
	makeCategoryType: function(formId, isBuilding, isProperty, isLease, isAccount, isNew, afterSelectListener){
		var panel = View.panels.get(formId);
		var restriction = new Ab.view.Restriction();
		if(isLease){
			restriction.addClause('cost_cat.rollup_prorate', 'ALL%', 'LIKE');
			restriction.addClause('cost_cat.rollup_prorate', 'LEASE%', 'LIKE', 'OR');
		}else if(isBuilding){
			restriction.addClause('cost_cat.rollup_prorate', 'ALL%', 'LIKE');
			restriction.addClause('cost_cat.rollup_prorate', 'BLDG%', 'LIKE', 'OR');
		}else if(isProperty){
			restriction.addClause('cost_cat.rollup_prorate', 'ALL%', 'LIKE');
			restriction.addClause('cost_cat.rollup_prorate', 'PROP%', 'LIKE', 'OR');
		}else if(isAccount){
			restriction.addClause('cost_cat.rollup_prorate', 'ALL%', 'LIKE');
		}
		var field = panel.fields.get('cost_tran_sched.cost_cat_id');
		var command = field.actions.items[0].command.commands[0];
		if(valueExistsNotEmpty(afterSelectListener)){
			command.actionListener = afterSelectListener;
		}
		command.dialogRestriction = restriction;
	}
})

function afterSelectCostCategory(fieldName, selectedValue, previousValue){
	var objForm = View.panels.get('scheduledCostFormVAT');
	objForm.setFieldValue(fieldName, selectedValue);

	setVatAndCalculateCosts(objForm.id);
	setCamFieldValue(fieldName, selectedValue);
}

/**
 * When Cost Category is RENT - CAM ESTIMATE  or RENT - CAM RECONCILIATION
 * set CAM Cost? field to CAM
 */
function setCamFieldValue(fieldId, selectedValue){
	var panel = View.panels.get(addEditScheduledCostController.formId);
	var camEstimateCateg = "RENT - CAM ESTIMATE";
	if(valueExistsNotEmpty(View.activityParameters["AbRPLMCosts-CAM_Estimate"])){
		camEstimateCateg = View.activityParameters["AbRPLMCosts-CAM_Estimate"]; 
	}
	camEstimateCateg += ";";
	var camReconciliationCateg = "RENT - CAM RECONCILIATION";
	if(valueExistsNotEmpty(View.activityParameters["AbRPLMCosts-CAM_Reconciliation"])){
		camReconciliationCateg = View.activityParameters["AbRPLMCosts-CAM_Reconciliation"]; 
	}
	camReconciliationCateg += ";";
	selectedValue += ";";
	if(camEstimateCateg.indexOf(selectedValue) != -1 || camReconciliationCateg.indexOf(selectedValue) != -1) {
		panel.setFieldValue("cost_tran_sched.cam_cost", "CAM");
	} else {
		panel.setFieldValue("cost_tran_sched.cam_cost", "NON-CAM");
	}
}

function onAutoCompleteSelect(form, fieldName, selectedValue){
	if (fieldName == "cost_tran_sched.cost_cat_id" || fieldName == "cost_tran_sched.ctry_id") {
		setCamFieldValue(fieldName, selectedValue);
		if(getVATPercent(form.id, 'cost_tran_sched.ctry_id', 'cost_tran_sched.cost_cat_id', 'cost_tran_sched.ls_id' , 'cost_tran_sched.vat_percent_value')){
			// reset override vat percent field
			resetOverrideField("chk_vat_percent", 'scheduledCostFormVAT', "cost_tran_sched.vat_percent_override", 0);
			// reset override vat amount field
			resetOverrideField("chk_vat_amount", 'scheduledCostFormVAT', "cost_tran_sched.vat_amount_override", -1);
			// calculate costs
			calculateCosts('scheduledCostFormVAT', 'cost_tran_sched', 'chk_vat_amount');
		}
	}
}

/**
 * After select cost category event handler
 * @param fieldName
 * @param selectedValue
 * @param previousValue
 */
function afterSelectCountryId(fieldName, selectedValue, previousValue){
	var objForm = View.panels.get('scheduledCostFormVAT');
	objForm.setFieldValue(fieldName, selectedValue);

	setVatAndCalculateCosts(objForm.id);
}

function setVatAndCalculateCosts(formId){
	// get VAT percent for selected country and cost category
	if(getVATPercent(formId, 'cost_tran_sched.ctry_id', 'cost_tran_sched.cost_cat_id', 'cost_tran_sched.ls_id' , 'cost_tran_sched.vat_percent_value')){
		// reset override vat percent field
		resetOverrideField("chk_vat_percent", 'scheduledCostFormVAT', "cost_tran_sched.vat_percent_override", 0);
		// reset override vat amount field
		resetOverrideField("chk_vat_amount", 'scheduledCostFormVAT', "cost_tran_sched.vat_amount_override", -1);
		// calculate costs
		calculateCosts('scheduledCostFormVAT', 'cost_tran_sched', 'chk_vat_amount');
	}
}

/**
 * Enable / disable override field based on checkbox selection
 */
function onSelect_Override(chkId, formId, fieldId, defaultValue){
	var objCheckbox = document.getElementById(chkId);
	var objForm = View.panels.get(formId);
	if(objCheckbox){
		objForm.enableField(fieldId, objCheckbox.checked);
		var dataSource = objForm.getDataSource();
		if(objCheckbox.checked){
			if(chkId == "chk_vat_percent"){
				document.getElementById("chk_vat_amount").checked = false;
				objForm.setFieldValue("cost_tran_sched.vat_amount_override", dataSource.formatValue("cost_tran_sched.vat_amount_override", -1, true));
				objForm.enableField("cost_tran_sched.vat_amount_override", false);
			}else if(chkId == "chk_vat_amount"){
				document.getElementById("chk_vat_percent").checked = false;
				objForm.setFieldValue("cost_tran_sched.vat_percent_override", dataSource.formatValue("cost_tran_sched.vat_percent_override", 0, true));
				objForm.enableField("cost_tran_sched.vat_percent_override", false);
				getVATPercent('scheduledCostFormVAT', 'cost_tran_sched.ctry_id', 'cost_tran_sched.cost_cat_id', 'cost_tran_sched.ls_id' , 'cost_tran_sched.vat_percent_value');
			}
		}else{
			// we must reset field value
			if(valueExists(defaultValue)){
				var currentValue = objForm.getFieldValue(fieldId);
				if(parseFloat(currentValue) != defaultValue){
					objForm.setFieldValue(fieldId, dataSource.formatValue(fieldId, defaultValue, true));
					// get default VAT percent
					if(chkId == "chk_vat_percent"){
						getVATPercent('scheduledCostFormVAT', 'cost_tran_sched.ctry_id', 'cost_tran_sched.cost_cat_id', 'cost_tran_sched.ls_id' , 'cost_tran_sched.vat_percent_value');
					}
				}
			}
		}
	}
}

function beforeSelectCostCategory(command){
	var controller = addEditScheduledCostController;
	if(controller.runtimeParameters.cam){
		if(valueExistsNotEmpty(controller.view.activityParameters["AbRPLMCosts-CAM_Reconciliation"])){
        	var camCostCat = View.activityParameters['AbRPLMCosts-CAM_Reconciliation'].split(";");
        	command.dialogRestriction = " cost_cat.cost_cat_id IN ('" + camCostCat.join("','") + "') "; 
        }
	}
	
}

