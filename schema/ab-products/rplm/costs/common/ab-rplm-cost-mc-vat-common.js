//Common functions that are used in add/edit costs for Multi-Currency and VAT


/**
 * Check if VAT is excluded for specified lease.
 * 
 * @param lsId lease code
 * @returns boolean value
 */
function isVatExcludedForLease(lsId){
	var isVatExcluded = false;
	var wfrParams = {
		tableName: "ls",
		fieldNames: toJSON(["ls.vat_exclude"]),
		restriction: toJSON(new Ab.view.Restriction({"ls.ls_id": lsId}))
	};
	try{
		var wfrResult = Workflow.call('AbCommonResources-getDataRecord', wfrParams);
		if (wfrResult.code == 'executed'){
			if(valueExists(wfrResult.dataSet) 
					&& valueExistsNotEmpty(wfrResult.dataSet.getValue("ls.vat_exclude"))){
				var vatExcluded = wfrResult.dataSet.getValue("ls.vat_exclude");
				isVatExcluded = (vatExcluded == "1" || vatExcluded == "Yes");
			}
		}
	}catch(e){
		Workflow.handleError(e);
	}
	return isVatExcluded;
}

/**
 * Set override field (checkbox and input field).
 * 
 * @param checkboxId - check box id
 * @param formId - form id
 * @param fieldId - input field id
 * @param defaultValue - default value
 */
function setOverrideField(checkboxId, formId, fieldId, defaultValue){
	var objCheckbox = document.getElementById(checkboxId);
	var objForm = View.panels.get(formId);
	// we need to check current value if this was specified
	if(objCheckbox){
		if(valueExists(defaultValue)){
			var currentValue = objForm.getFieldValue(fieldId);
			if(parseFloat(currentValue) != defaultValue){
				objCheckbox.checked = true;
			}
		}
		objForm.enableField(fieldId, objCheckbox.checked);
	}
}

/**
 * Reset override field (checkbox and input field).
 * 
 * @param checkboxId - check box id
 * @param formId - form id
 * @param fieldId - input field id
 * @param defaultValue - default value
 */
function resetOverrideField(checkboxId, formId, fieldId, defaultValue){
	var objCheckbox = document.getElementById(checkboxId);
	var objForm = View.panels.get(formId);
	var ds = objForm.getDataSource();
	// we need to check current value if this was specified
	if(objCheckbox){
		if(valueExists(defaultValue)){
			objForm.setFieldValue(fieldId, ds.formatValue(fieldId, defaultValue));
			objCheckbox.checked = false;
		}
		objForm.enableField(fieldId, objCheckbox.checked);
	}
}


/**
 * Get Vat percent value from database and set to form field.
 * 
 * @param formId - form id
 * @param ctryField- country code field
 * @param costCatField - cost category field
 * @param leaseField - lease code field 
 * @param vatPercentField - vat percent field
 * @param showMessage show warning message (boolean)
 */
function getVATPercent(formId, ctryField, costCatField, leaseField,  vatPercentField, showMessage){
	if(!valueExists(showMessage)){
		showMessage = true;
	}
	var objForm = View.panels.get(formId);
	var objDs = objForm.getDataSource();
	
	removeFieldError(objForm, vatPercentField);
	
	var ctryId = objForm.getFieldValue(ctryField);
	var costCategId = objForm.getFieldValue(costCatField);
	var leaseId = "";
	if(valueExistsNotEmpty(leaseField)){
		leaseId = objForm.getFieldValue(leaseField);
	}
	var vatPercent = 0.0;
	
	if(valueExistsNotEmpty(ctryId) && valueExistsNotEmpty(costCategId)){
		try{
			var result = Workflow.callMethod("AbCommonResources-CostService-getVatPercentValue", costCategId, ctryId, leaseId);
			vatPercent = result.value;
			var localizedVatPercent = objDs.formatValue(vatPercentField, vatPercent, true);
			objForm.setFieldValue(vatPercentField, localizedVatPercent);
			return true;
		}catch(e){
			if (valueExistsNotEmpty(e.detailedMessage)) {
				//View.showMessage(e.detailedMessage);
				addFieldError(objForm, vatPercentField, convertFromXMLValue(e.detailedMessage));
			} else if (valueExistsNotEmpty(e.message)) {
				addFieldError(objForm, vatPercentField, convertFromXMLValue(e.message));
			} else {
				Workflow.handleError(e);
			}
			var localizedVatPercent = objDs.formatValue(vatPercentField, vatPercent, true);
			objForm.setFieldValue(vatPercentField, localizedVatPercent);
			return false;
		}
	}else{
		return false;
	}
}

/**
 * Remove field error from specified field
 * @param form form object
 * @param fieldName field name
 */
function removeFieldError(form, fieldName){
	var fieldInput = form.getFieldElement(fieldName);
	if (valueExists(fieldInput)) { 
	    var fieldInputTd = fieldInput.parentNode;
	    Ext.fly(fieldInputTd).removeClass('formError');

	    // remove per-field error messages
	    var errorTextElements = Ext.query('.formErrorText', fieldInputTd);
	    for (var e = 0; e < errorTextElements.length; e++) {
	        fieldInputTd.removeChild(errorTextElements[e]);
	    }
	}
	var fieldLabel = form.getFieldLabelElement(fieldName);
	if (fieldLabel) {
	    Ext.fly(fieldLabel).removeClass('formError');
	}
}

/**
 * Display error message on field.
 * @param form form object
 * @param fieldName field name
 * @param message error message
 */
function addFieldError(form, fieldName, message){
	
    var fieldInput = form.getFieldElement(fieldName);
    if (fieldInput) {
        Ext.fly(fieldInput.parentNode).addClass('formError');
    }

    var fieldLabel = form.getFieldLabelElement(fieldName);
    if (fieldLabel) {
        Ext.fly(fieldLabel).addClass('formError');
    }

    var fieldInputTd = fieldInput.parentNode;

    var errorBreakElement = document.createElement('br');
    errorBreakElement.className = 'formErrorText';
    fieldInputTd.appendChild(errorBreakElement);
    
    var errorTextElement = document.createElement('span');
    errorTextElement.className = 'formErrorText';
    errorTextElement.appendChild(document.createTextNode(message));
    fieldInputTd.appendChild(errorTextElement);
}

/**
 * On VAT percent override event handler.
 * 
 * @param formId - form id
 * @param checkboxId - checkbox id
 * @param vatPercentId - vat percent field id
 * @param vatPercentOverrideId -- vat percent override field id
 */
function onVatPercentOverride(formId, checkboxId, vatPercentId, vatPercentOverrideId, leaseId, defaultValue){
	var objForm = View.panels.get(formId);
	if(objForm){
		var objCheckbox = document.getElementById(checkboxId);
		if(objCheckbox && objCheckbox.checked){
			var vatPercentOverride = objForm.getFieldValue(vatPercentOverrideId);
			var leaseId = objForm.getFieldValue(leaseId);
			if(valueExistsNotEmpty(leaseId) && isVatExcludedForLease(leaseId)){
				vatPercentOverride = 0;
			}
			if(valueExistsNotEmpty(vatPercentOverride) && parseFloat(vatPercentOverride) != defaultValue){
				var dataSource = objForm.getDataSource();
				objForm.setFieldValue(vatPercentId, dataSource.formatValue(vatPercentId, vatPercentOverride, true));
				removeFieldError(objForm, vatPercentId);
			}
		}
	}
}


/**
 * Calculate cost values.
 * 
 * @param formId
 * @param costTable
 * @param chkVatAmount
 * @returns {Boolean}
 */
function calculateCosts(formId, costTable, chkVatAmount){
	var objForm = View.panels.get(formId);
	var dataSource = objForm.getDataSource();
	
	var incomeBase = objForm.getFieldValue(costTable + ".amount_income_base_payment");
	var expenseBase = objForm.getFieldValue(costTable + ".amount_expense_base_payment");
	
	if (valueExistsNotEmpty(incomeBase) || valueExistsNotEmpty(expenseBase)) {
		// we can calculate some values
		var isVatExcluded = false;
		var leaseId = objForm.getFieldValue(costTable + ".ls_id");
		if (valueExistsNotEmpty(leaseId)){
			isVatExcluded = isVatExcludedForLease(leaseId);
			if (isVatExcluded) {
				removeFieldError(objForm, costTable + ".vat_percent_value");
			}
		}
		
		var isVatAmountOverride = document.getElementById(chkVatAmount).checked;
		if (isVatAmountOverride) {
			removeFieldError(objForm, costTable + ".vat_percent_value");
		}
		
		// get cost values
		var costValues = {
				"amount_income_base_payment": incomeBase,
				"amount_expense_base_payment": expenseBase,
				"vat_amount_override": objForm.getFieldValue(costTable + ".vat_amount_override"),
				"vat_percent_value": objForm.getFieldValue(costTable + ".vat_percent_value"),
				"amount_income_vat_payment": objForm.getFieldValue(costTable + ".amount_income_vat_payment"),
				"amount_expense_vat_payment": objForm.getFieldValue(costTable + ".amount_expense_vat_payment"), 
				"amount_income_total_payment": objForm.getFieldValue(costTable + ".amount_income_total_payment"),
				"amount_expense_total_payment": objForm.getFieldValue(costTable + ".amount_expense_total_payment")
		};
		
		try {
			var result = Workflow.callMethod('AbCommonResources-CostService-calculateCostRuntimeValues', costTable, costValues, isVatAmountOverride, isVatExcluded);
			var calculatedValues = result.data;
			
			if (valueExistsNotEmpty(calculatedValues["displayValues"]) && calculatedValues["displayValues"] == "0") {
				return false;
			}
			
			// set new values
			if (valueExistsNotEmpty(calculatedValues["amount_income_vat_payment"])) {
				var parsedValue = new Number(dataSource.parseValue(costTable + ".amount_income_vat_payment", calculatedValues["amount_income_vat_payment"], false));
				objForm.setFieldValue(costTable + ".amount_income_vat_payment", dataSource.formatValue(costTable + ".amount_income_vat_payment", parsedValue, true));
			}
			if (valueExistsNotEmpty(calculatedValues["amount_expense_vat_payment"])) {
				var parsedValue =  new Number(dataSource.parseValue(costTable + ".amount_expense_vat_payment", calculatedValues["amount_expense_vat_payment"], false));
				objForm.setFieldValue(costTable + ".amount_expense_vat_payment", dataSource.formatValue(costTable + ".amount_expense_vat_payment", parsedValue, true));
			}

			if (valueExistsNotEmpty(calculatedValues["amount_income_total_payment"])) {
				var parsedValue =  new Number(dataSource.parseValue(costTable + ".amount_income_total_payment", calculatedValues["amount_income_total_payment"], false));
				objForm.setFieldValue(costTable + ".amount_income_total_payment", dataSource.formatValue(costTable + ".amount_income_total_payment", parsedValue, true));
			}
			if (valueExistsNotEmpty(calculatedValues["amount_expense_total_payment"])) {
				var parsedValue =  new Number(dataSource.parseValue(costTable + ".amount_expense_total_payment", calculatedValues["amount_expense_total_payment"], false));
				objForm.setFieldValue(costTable + ".amount_expense_total_payment", dataSource.formatValue(costTable + ".amount_expense_total_payment", parsedValue, true));
			}
			
		} catch (e){
			Workflow.handleError(e);
		}
	}
	return true;
}

