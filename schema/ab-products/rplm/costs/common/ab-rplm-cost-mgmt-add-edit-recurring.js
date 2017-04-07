var addEditRecurringCostController = View.createController('addEditRecurringCost',{
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
				gridPanel: this.recurringCostGrid
        }
	 */
	runtimeParameters: null,
	
	// if VAT and MC is enabled
	isVATAndMCEnabled: false,
	
	formId: null,
	
	isVatExcluded: false,
	
	afterViewLoad: function(){
		// read runtime parameters
		if(valueExists(this.view.parameters.runtimeParameters)){
			this.runtimeParameters = this.view.parameters.runtimeParameters;
		}
		// check if multi currency is enabled
		this.isVATAndMCEnabled = View.activityParameters['AbCommonResources-EnableVatAndMultiCurrency'] == 1;
		if(this.isVATAndMCEnabled){
			this.formId = "recurringCostFormVAT";
			View.panels.get("recurringCostFormVAT").show(true, true);
			View.panels.get("recurringCostForm").show(false, true);
		}else{
			this.formId = "recurringCostForm";
			View.panels.get("recurringCostFormVAT").show(false, true);
			View.panels.get("recurringCostForm").show(true, true);
		}
		
		View.panels.get(this.formId).addEventListener("onAutoCompleteSelect", onAutoCompleteSelect);
	},
	
	afterInitialDataFetch: function(){
		// prepare form
		var objForm = View.panels.get(this.formId);
		var restriction = null;
		var title = null;
		if(this.runtimeParameters.isNewRecord) {
			title = getMessage('add_recur_cost');
		}else{
			title = getMessage('edit_recur_cost');
			restriction = new Ab.view.Restriction();
			restriction.addClause('cost_tran_recur.cost_tran_recur_id', this.runtimeParameters.cost_tran_recur_id);
		}
		// refresh form
		objForm.refresh(restriction, this.runtimeParameters.isNewRecord);
		
		//show the checkbox only for leases
		if(!this.runtimeParameters.isLease){
			document.getElementById("chk_cost_dates_span").style.display = "none";
			document.getElementById("chk_cost_dates_span_mc").style.display = "none";
		}
		
		if(this.runtimeParameters.isBuilding){
			objForm.setFieldValue("cost_tran_recur.bl_id", this.runtimeParameters.bl_id);
		}else if(this.runtimeParameters.isProperty){
			objForm.setFieldValue("cost_tran_recur.pr_id", this.runtimeParameters.pr_id);
		}else if(this.runtimeParameters.isLease){
			objForm.setFieldValue("cost_tran_recur.ls_id", this.runtimeParameters.ls_id);
			this.isVatExcluded = isVatExcludedForLease(this.runtimeParameters.ls_id);
			this.recurringCostFormVAT.setFieldValue("ls.vat_exclude", this.isVatExcluded ? '1' : '0');
		}else if(this.runtimeParameters.isParcel){
			objForm.setFieldValue("cost_tran_recur.parcel_id", this.runtimeParameters.parcel_id);
			objForm.setFieldValue("cost_tran_recur.pr_id", this.runtimeParameters.openerController.parentItemId);
		}else if(this.runtimeParameters.isAccount){
			objForm.setFieldValue("cost_tran_recur.ac_id", this.runtimeParameters.ac_id);
		}
		var afterSelectListenerCostCateg = "";
		var afterSelectListenerCtryId = "";
		if(this.isVATAndMCEnabled){
			afterSelectListenerCostCateg = 'afterSelectCostCategory';
			afterSelectListenerCtryId = 'afterSelectCountryId';
			if(this.runtimeParameters.isNewRecord){
				objForm.setFieldValue("cost_tran_recur.ctry_id", View.user.country);
				objForm.setFieldValue("cost_tran_recur.currency_payment", View.user.userCurrency.code);
			}
			setOverrideField("chk_vat_percent", this.formId, "cost_tran_recur.vat_percent_override", 0);
			setOverrideField("chk_vat_amount", this.formId, "cost_tran_recur.vat_amount_override", -1);
			setOverrideField("chk_exchange_rate", this.formId, "cost_tran_recur.exchange_rate_override", 1);
		}else{
			afterSelectListenerCostCateg = "setCamFieldValue";
		}
		// set title
		objForm.setTitle(title);

		objForm.showField("cost_tran_recur.bl_id", this.runtimeParameters.isBuilding);
		objForm.showField("cost_tran_recur.bl_id_fake", this.runtimeParameters.isBuilding);
		objForm.showField("cost_tran_recur.pr_id", this.runtimeParameters.isProperty);
		objForm.showField("cost_tran_recur.pr_id_fake", this.runtimeParameters.isProperty);
		objForm.showField("cost_tran_recur.ls_id", this.runtimeParameters.isLease);
		objForm.showField("cost_tran_recur.ls_id_fake", this.runtimeParameters.isLease);
		objForm.showField("cost_tran_recur.parcel_id", this.runtimeParameters.isParcel);
		objForm.showField("cost_tran_recur.parcel_id_fake", this.runtimeParameters.isParcel);
		objForm.showField("cost_tran_recur.ac_id", this.runtimeParameters.isAccount);
		objForm.showField("cost_tran_recur.ac_id_fake", this.runtimeParameters.isAccount);
		
		var showCam = (this.runtimeParameters.isLandlord && !this.runtimeParameters.isAccount);
		objForm.showField("cost_tran_recur.cam_cost", showCam);
		
		this.enableDisableCustomPeriod(this.formId);
		this.makeCategoryType(this.formId, this.runtimeParameters.isBuilding, this.runtimeParameters.isProperty, this.runtimeParameters.isLease, this.runtimeParameters.isAccount, this.runtimeParameters.isNewRecord, afterSelectListenerCostCateg);

		var fieldCtry = objForm.fields.get('cost_tran_recur.ctry_id');
		if (valueExists(fieldCtry)) {
			var command = fieldCtry.actions.items[0].command.commands[0];
			if(valueExistsNotEmpty(afterSelectListenerCtryId)){
				command.actionListener = afterSelectListenerCtryId;
			}
		}
		
		this.openerController = this.runtimeParameters.openerController;
		if (valueExists(this.runtimeParameters.costValues)) {
			var costValues = this.runtimeParameters.costValues;
			// we must populate some fields
			if (valueExistsNotEmpty(costValues['cost_tran_recur.currency_payment'])) {
				this.setFieldValue(objForm, "cost_tran_recur.currency_payment", costValues["cost_tran_recur.currency_payment"], true);
			}
			if (valueExistsNotEmpty(costValues['cost_tran_recur.cost_cat_id'])) {
				this.setFieldValue(objForm, "cost_tran_recur.cost_cat_id", costValues["cost_tran_recur.cost_cat_id"], false);
				if(this.isVATAndMCEnabled){
					getVATPercent('recurringCostFormVAT', 'cost_tran_recur.ctry_id', 'cost_tran_recur.cost_cat_id', 'cost_tran_recur.ls_id' , 'cost_tran_recur.vat_percent_value');
				}
				setCamFieldValue('cost_tran_recur.cost_cat_id', this.value);
			}
			
			if (valueExistsNotEmpty(costValues['cost_tran_recur.date_start'])) {
				this.setFieldValue(objForm, "cost_tran_recur.date_start", costValues["cost_tran_recur.date_start"], true);
			}
			if (valueExistsNotEmpty(costValues['cost_tran_recur.date_end'])) {
				this.setFieldValue(objForm, "cost_tran_recur.date_end", costValues["cost_tran_recur.date_end"], true);
			}
			if (valueExistsNotEmpty(costValues['cost_tran_recur.cam_cost'])) {
				this.setFieldValue(objForm, "cost_tran_recur.cam_cost", costValues["cost_tran_recur.cam_cost"], false);
			}
			if (valueExistsNotEmpty(costValues['cost_tran_recur.period'])) {
				this.setFieldValue(objForm, "cost_tran_recur.period", costValues["cost_tran_recur.period"], false);
			}
			if (valueExistsNotEmpty(costValues['cost_tran_recur.status_active'])) {
				this.setFieldValue(objForm, "cost_tran_recur.status_active", costValues["cost_tran_recur.status_active"], false);
			}
			if (valueExistsNotEmpty(costValues['cost_tran_recur.amount_income'])) {
				this.setFieldValue(objForm, "cost_tran_recur.amount_income", Math.round(costValues["cost_tran_recur.amount_income"]*100)/100, true);
			}
			if (valueExistsNotEmpty(costValues['cost_tran_recur.amount_expense'])) {
				this.setFieldValue(objForm, "cost_tran_recur.amount_expense", Math.round(costValues["cost_tran_recur.amount_expense"]*100)/100, true);
			}
			if (valueExistsNotEmpty(costValues['cost_tran_recur.amount_income_base_payment'])) {
				this.setFieldValue(objForm, "cost_tran_recur.amount_income_base_payment", Math.round(costValues["cost_tran_recur.amount_income_base_payment"]*100)/100, true);
			}
			if (valueExistsNotEmpty(costValues['cost_tran_recur.amount_expense_base_payment'])) {
				this.setFieldValue(objForm, "cost_tran_recur.amount_expense_base_payment", Math.round(costValues["cost_tran_recur.amount_expense_base_payment"]*100)/100, true);
			}
			// try to calculate costs
			if(this.isVATAndMCEnabled){
				calculateCosts('recurringCostFormVAT', 'cost_tran_recur', 'chk_vat_amount')
			}
		}
		
		if(this.isVATAndMCEnabled){
			checkIfDatesMatch('chk_cost_dates_mc', 'recurringCostFormVAT', 'cost_tran_recur.date_start', 'cost_tran_recur.date_end');
		}else{
			checkIfDatesMatch('chk_cost_dates', 'recurringCostForm', 'cost_tran_recur.date_start', 'cost_tran_recur.date_end');
		}
	},
	
	setFieldValue: function(form, fieldName, value, localizeValue){
		 var dataSource = form.getDataSource();
		 form.setFieldValue(fieldName, dataSource.formatValue(fieldName, value, localizeValue));
	},
	
	recurringCostForm_onSave: function(){
		if (compareDates('recurringCostForm', 'cost_tran_recur.date_start', 'cost_tran_recur.date_end', 'errEndGreaterThanStart') && this.recurringCostForm.save()) {
			this.runtimeParameters.gridPanel.refresh();
			
			if(this.view.parameters.callbackAfterSave){
				this.view.parameters.callbackAfterSave(this.openerController);
			}
			
			View.closeThisDialog();
		}
	},
	
	recurringCostFormVAT_onSave: function(){
		if (calculateCosts('recurringCostFormVAT', 'cost_tran_recur', 'chk_vat_amount')
				&& compareDates('recurringCostFormVAT', 'cost_tran_recur.date_start', 'cost_tran_recur.date_end', 'errEndGreaterThanStart')
				&& this.recurringCostFormVAT.save()) {
			// we must convert exchange rate costs
			try{
				// get new cost id 
				var costId = this.recurringCostFormVAT.getFieldValue("cost_tran_recur.cost_tran_recur_id");
				// call convert cost WFR
				var result = Workflow.callMethod('AbCommonResources-CostService-convertCostForVATAndMC', [parseInt(costId)],  ["cost_tran_recur"]);
				this.runtimeParameters.gridPanel.refresh();
				if(this.view.parameters.callbackAfterSave){
					this.view.parameters.callbackAfterSave(this.openerController);
				}

				View.closeThisDialog();
			}catch(e){
				Workflow.handleError(e);
				return false;
			}
		}
	},
	
	/*
	 * Set properties for cost category select value
	 * - restriction, afterSelectListener 
	 */
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
		var field = panel.fields.get('cost_tran_recur.cost_cat_id');
		var command = field.actions.items[0].command.commands[0];
		if(valueExistsNotEmpty(afterSelectListener)){
			command.actionListener = afterSelectListener;
		}
		command.dialogRestriction = restriction;
	},
	
	/*
	 * Enable/disable custom period field. 
	 */
	enableDisableCustomPeriod: function(panelId){
		var panel = View.panels.get(panelId);
		
		if(panel.getFieldValue("cost_tran_recur.period") == 'CUSTOM') {
			panel.enableField("cost_tran_recur.period_custom", true);
		} else {
			panel.setFieldValue("cost_tran_recur.period_custom", 0);
			panel.enableField("cost_tran_recur.period_custom", false);
		}
	}	
})

/**
 * After Select value event handler.
 * 
 * @param fieldName
 * @param selectedValue
 * @param previousValue
 */
function afterSelectCostCategory(fieldName, selectedValue, previousValue){
	var objForm = View.panels.get('recurringCostFormVAT');
	objForm.setFieldValue(fieldName, selectedValue);
	// get VAT percent for selected country and cost category
	if(getVATPercent(objForm.id, 'cost_tran_recur.ctry_id', 'cost_tran_recur.cost_cat_id', 'cost_tran_recur.ls_id' , 'cost_tran_recur.vat_percent_value')){
		// reset override vat percent field
		resetOverrideField("chk_vat_percent", 'recurringCostFormVAT', "cost_tran_recur.vat_percent_override", 0);
		// reset override vat amount field
		resetOverrideField("chk_vat_amount", 'recurringCostFormVAT', "cost_tran_recur.vat_amount_override", -1);
		// calculate costs
		calculateCosts('recurringCostFormVAT', 'cost_tran_recur', 'chk_vat_amount');
	}
	setCamFieldValue(fieldName, selectedValue);
}

/**
 * When Cost Category is �RENT � CAM ESTIMATE�  or �RENT � CAM RECONCILIATION�
 * set �CAM Cost?� field to �CAM�
 */
function setCamFieldValue(fieldId, selectedValue){
	var panel = View.panels.get(addEditRecurringCostController.formId);
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
		panel.setFieldValue("cost_tran_recur.cam_cost", "CAM");
	} else {
		panel.setFieldValue("cost_tran_recur.cam_cost", "NON-CAM");
	}
}

function onAutoCompleteSelect(form, fieldName, selectedValue){
	if (fieldName == "cost_tran_recur.cost_cat_id" || fieldName == "cost_tran_recur.ctry_id") {
		setCamFieldValue(fieldName, selectedValue);
		if(getVATPercent(form.id, 'cost_tran_recur.ctry_id', 'cost_tran_recur.cost_cat_id', 'cost_tran_recur.ls_id' , 'cost_tran_recur.vat_percent_value')){
			// reset override vat percent field
			resetOverrideField("chk_vat_percent", 'recurringCostFormVAT', "cost_tran_recur.vat_percent_override", 0);
			// reset override vat amount field
			resetOverrideField("chk_vat_amount", 'recurringCostFormVAT', "cost_tran_recur.vat_amount_override", -1);
			// calculate costs
			calculateCosts('recurringCostFormVAT', 'cost_tran_recur', 'chk_vat_amount');
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
	var objForm = View.panels.get('recurringCostFormVAT');
	objForm.setFieldValue(fieldName, selectedValue);
	// get VAT percent for selected country and cost category
	if(getVATPercent(objForm.id, 'cost_tran_recur.ctry_id', 'cost_tran_recur.cost_cat_id', 'cost_tran_recur.ls_id' , 'cost_tran_recur.vat_percent_value')){
		// reset override vat percent field
		resetOverrideField("chk_vat_percent", 'recurringCostFormVAT', "cost_tran_recur.vat_percent_override", 0);
		// reset override vat amount field
		resetOverrideField("chk_vat_amount", 'recurringCostFormVAT', "cost_tran_recur.vat_amount_override", -1);
		// calculate costs
		calculateCosts('recurringCostFormVAT', 'cost_tran_recur', 'chk_vat_amount');
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
				objForm.setFieldValue("cost_tran_recur.vat_amount_override", dataSource.formatValue("cost_tran_recur.vat_amount_override", -1, true));
				objForm.enableField("cost_tran_recur.vat_amount_override", false);
			}else if(chkId == "chk_vat_amount"){
				document.getElementById("chk_vat_percent").checked = false;
				objForm.setFieldValue("cost_tran_recur.vat_percent_override", dataSource.formatValue("cost_tran_recur.vat_percent_override", 0, true));
				objForm.enableField("cost_tran_recur.vat_percent_override", false);
				getVATPercent('recurringCostFormVAT', 'cost_tran_recur.ctry_id', 'cost_tran_recur.cost_cat_id', 'cost_tran_recur.ls_id' , 'cost_tran_recur.vat_percent_value', false);
			}
		}else{
			// we must reset field value
			if(valueExists(defaultValue)){
				var currentValue = objForm.getFieldValue(fieldId);
				if(parseFloat(currentValue) != defaultValue){
					objForm.setFieldValue(fieldId, dataSource.formatValue(fieldId, defaultValue, true));
					// get default VAT percent
					if(chkId == "chk_vat_percent"){
						getVATPercent('recurringCostFormVAT', 'cost_tran_recur.ctry_id', 'cost_tran_recur.cost_cat_id', 'cost_tran_recur.ls_id' , 'cost_tran_recur.vat_percent_value', false);
					}
				}
			}
		}
	}
}