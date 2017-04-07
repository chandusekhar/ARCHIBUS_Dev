
/**
 * Controller implementation.
 */
var abCurrencyDefConvRatesCtrl = View.createController('abCurrencyDefConvRatesCtrl', {
	//selected source currency
	sourceUnits: null,
	
	// if is new source currency
	isNewCurrency: false,
	
	afterViewLoad: function(){
		// set labels
		$('label_optUpdate_all').innerHTML = getMessage('msg_optUpdate_all');
		$('label_optUpdate_date').innerHTML = getMessage('msg_optUpdate_date');
		$('label_optConvert_all').innerHTML = getMessage('msg_optConvert_all');
		$('label_optConvert_date').innerHTML = getMessage('msg_optConvert_date');
	},
	
	/**
	 * Add new conversion rate handler.
	 */
	abCurrencyDefConvRatesDest_onNew: function(){
		// refresh edit form to new record applying selected source currency restriction
		var restriction = new Ab.view.Restriction();
		restriction.addClause("afm_conversions.source_units", this.sourceUnits, "=");
		//restriction.addClause("afm_conversions.destin_units", this.view.project.currency.code);
		this.isNewCurrency = false;
		this.abCurrencyDefConvRatesEdit.refresh(restriction, true);
		
	},
	
	/**
	 * Save current conversion rate handler.
	 */
	abCurrencyDefConvRatesEdit_onSave: function(){ 
		// save current record
		// refresh currencies and exchange rate list after save
		if(this.abCurrencyDefConvRatesEdit.canSave() && this.validateForm()){
			// KB3032488 - verify if conversion rate already exists for the specified date
			var convRecord = this.verifyExists();
			if(convRecord.isNew && this.abCurrencyDefConvRatesEdit.save()){
				this.refreshForms();
			}else{
				var controller = this;
				View.confirm(getMessage('conversionRateExists'),
						function(button){
				            if (button == 'yes') {
				               //update
				            	var factor = controller.abCurrencyDefConvRatesEdit.getFieldValue("afm_conversions.factor");
				            	convRecord.setValue("afm_conversions.factor", factor);
				            	
				            	var ds = controller.abCurrencyDefConvRates_ds;
				            	ds.saveRecord(convRecord);
				            	
				            	controller.refreshForms();
	
								controller.abCurrencyDefConvRatesEdit.displayTemporaryMessage(getMessage('msg_update_success'));
				            }  
						});
			}
		}
	},
	
	/**
	 * Refresh forms after save and reload currencies.
	 */
	refreshForms: function(){
		this.abCurrencyDefConvRatesSource.refresh();
		this.abCurrencyDefConvRatesDest.refresh(this.abCurrencyDefConvRatesDest.restriction);
		this.reloadCurrencies();
	},
	
	/**
	 * Validate edit form data before save.
	 */
	validateForm: function(){
		var isValid = true;
		// check if destination currency is same as source currency
		var sourceUnit = this.abCurrencyDefConvRatesEdit.getFieldValue("afm_conversions.source_units");
		var destUnit = this.abCurrencyDefConvRatesEdit.getFieldValue("afm_conversions.destin_units");
		if (destUnit == sourceUnit){
			View.showMessage(getMessage("err_source_dest_equal"));
			return false;
		}
		
		//check if source currency is valid
		var restriction = new Ab.view.Restriction();
		restriction.addClause("afm_currencies.currency_id", sourceUnit, "="); 
		var records = this.abCurrencyDefConvRatesCurrencies.getRecords(restriction);
		if(records.length<1){
			this.abCurrencyDefConvRatesEdit.addInvalidField(
		            'afm_conversions.source_units',
		            getMessage('invalidCurrency'));
			isValid = false;
		}
		
		//check if destination currency is valid
		restriction = new Ab.view.Restriction();
		restriction.addClause("afm_currencies.currency_id", destUnit, "="); 
		records = this.abCurrencyDefConvRatesCurrencies.getRecords(restriction);
		if(records.length<1){
			this.abCurrencyDefConvRatesEdit.addInvalidField(
		            'afm_conversions.destin_units',
		            getMessage('invalidCurrency'));
			isValid = false;
		}
		
		// check if exchange rate is greater than zero
		var exchangeRate = this.abCurrencyDefConvRatesEdit.getFieldValue('afm_conversions.factor');
		if(parseFloat(exchangeRate) <= 0){
			this.abCurrencyDefConvRatesEdit.addInvalidField(
		            'afm_conversions.factor',
		            getMessage('convFactorTooSmall'));
			isValid = false;
		}
		if(isValid){
			return true;
		}else{
			this.abCurrencyDefConvRatesEdit.displayValidationResult();
			return false;
		}
	},
	
	/**
	 * Verify if conversion rate already exists for the specified date.
	 */
	verifyExists: function(){
		var convDs = this.abCurrencyDefConvRates_ds;
		var restriction = new Ab.view.Restriction(); 
		restriction.addClause("afm_conversions.source_units", this.abCurrencyDefConvRatesEdit.getFieldValue("afm_conversions.source_units") , "="); 
		restriction.addClause("afm_conversions.destin_units", this.abCurrencyDefConvRatesEdit.getFieldValue("afm_conversions.destin_units") , "=");
		restriction.addClause("afm_conversions.date_conversion",this.abCurrencyDefConvRatesEdit.getFieldValue("afm_conversions.date_conversion") , "=");
		restriction.addClause("afm_conversions.exchange_rate_type", this.abCurrencyDefConvRatesEdit.getFieldValue("afm_conversions.exchange_rate_type") , "=");
		var convRecord = convDs.getRecord(restriction);
		return convRecord;
	},
	
	/**
	 * Delete current conversion rate handler.
	 */
	abCurrencyDefConvRatesEdit_onDelete: function(){
		// delete current record
		// refresh currencies and exchange rate list after delete
		var ds = this.abCurrencyDefConvRatesEdit.getDataSource();
		var rec = this.abCurrencyDefConvRatesEdit.getRecord();
		var controller = this;
		View.confirm(getMessage("msg_confirm_delete"), function (button){
			if(button ==  "yes"){
				try{
					ds.deleteRecord(rec);
					controller.abCurrencyDefConvRatesSource.refresh();
					controller.abCurrencyDefConvRatesDest.refresh(controller.abCurrencyDefConvRatesDest.restriction);
					controller.abCurrencyDefConvRatesEdit.show(false, true);
					controller.reloadCurrencies();
				}catch(e){
					Workflow.handleError(e);
					return false;
				}
			}
		});
	},
	
	/**
	 * Enable/disabled source currency based on what is displayed
	 * new currency or new conversion rate.
	 */
	abCurrencyDefConvRatesEdit_afterRefresh: function(){
		//this.abCurrencyDefConvRatesEdit.enableField("afm_conversions.source_units", this.isNewCurrency);
	},
	
	/**
	 * Update Converted Amounts handler.
	 * Call "AbCostAdminConvertCostsForVATandMC" WFR
	 */
	abCurrencyDefConvRatesUpdate_onUpdate: function(){
		// validate settings 
		// call AbCostAdminConvertCostsForVATandMC WFR for selected settings
		this.abCurrencyDefConvRatesUpdate.clearValidationResult();
		var optSelected = getRadioValue("radioUpdate");
		var dateSelected = this.abCurrencyDefConvRatesUpdate.getFieldValue("vf_update_date");
		
		if(optSelected == "date" && !valueExistsNotEmpty(dateSelected)){
			var message = getMessage("msg_field_mandatory").replace('{0}', this.abCurrencyDefConvRatesUpdate.fields.get("vf_update_date").fieldDef.title)
			this.abCurrencyDefConvRatesUpdate.validationResult.valid = false;
			this.abCurrencyDefConvRatesUpdate.validationResult.invalidFields['vf_update_date'] = "";
			this.abCurrencyDefConvRatesUpdate.displayValidationResult();
			View.showMessage(message);
			return false;
		}
		// call update wfr
		this.runJob((optSelected == "all"), false, dateSelected);
		
	},
	
	/**
	 * Convert new cost handler.
	 * Call "AbCostAdminConvertCostsForVATandMC" WFR
	 */
	abCurrencyDefConvRatesConvert_onUpdate: function(){
		// validate settings 
		// call AbCostAdminConvertCostsForVATandMC WFR for selected settings
		this.abCurrencyDefConvRatesUpdate.clearValidationResult();
		var optSelected = getRadioValue("radioConvert");
		var dateSelected = this.abCurrencyDefConvRatesConvert.getFieldValue("vf_convert_date");
		
		if(optSelected == "date" && !valueExistsNotEmpty(dateSelected)){
			var message = getMessage("msg_field_mandatory").replace('{0}', this.abCurrencyDefConvRatesConvert.fields.get("vf_convert_date").fieldDef.title)
			this.abCurrencyDefConvRatesConvert.validationResult.valid = false;
			this.abCurrencyDefConvRatesConvert.validationResult.invalidFields['vf_update_date'] = "";
			this.abCurrencyDefConvRatesConvert.displayValidationResult();
			View.showMessage(message);
			return false;
		}
		// call update wfr
		this.runJob((optSelected == "all"), true, dateSelected);
		
	},
	
	/**
	 * Run convert cost WFR
	 */
	runJob: function(allCosts, newCosts, date){
		var controller = this;
		var message = getMessage("msg_job_run");
		try{
    		var jobId  = Workflow.startJob('AbCommonResources-CostService-convertCostsForVATAndMC', allCosts, newCosts, date);
		    View.openJobProgressBar(message, jobId, '', function(status) {
		    	if(valueExists(status.jobProperties.noExchangeRate)){
		    		View.showMessage(status.jobProperties.noExchangeRate);
		    	}
		    });
		}catch(e){
    		Workflow.handleError(e);
    		return false;
		}
	}, 
	
	/**
	 * Reload all exchange rates.
	 */
	reloadCurrencies: function(){
		
		try {
			Workflow.callMethod('AbSystemAdministration-ConfigHandlers-reloadCurrencyConversions');
		} catch (e){
			Workflow.handleError(e);
		}
		
	},
	
	/**
	 * Apply currency updates to legacy data.
	 */
	abCurrencyDefConvRatesEdit_onUpdateLegacyData: function(){
		var confirmMessage = getMessage("confirm_job_run");
		var message = getMessage("msg_job_run");
		View.confirm(confirmMessage, function (button){
			if(button ==  "yes"){
				try{
					var jobId  = Workflow.startJob('AbCommonResources-CostService-applyMulticurrencyUpdatesToLegacyData');
				    View.openJobProgressBar(message, jobId, '', function(status) {
				    });
				}catch(e){
					Workflow.handleError(e);
					return false;
				}
			}
		});
	}
});

/**
 * Refresh conversion rates list applying source currency restriction.
 * 
 * @param row selected grid row
 */
function showDestinationCurrencies(row){
	var sourceUnits = row.row.getFieldValue("afm_conversions.source_units");
	var restriction = new Ab.view.Restriction();
	restriction.addClause("afm_conversions.source_units", sourceUnits, "=");
	var controller = View.controllers.get("abCurrencyDefConvRatesCtrl");
	controller.sourceUnits = sourceUnits;
	controller.abCurrencyDefConvRatesDest.refresh(restriction);
}

/**
 * Enable/disable date field based on radio button selection.
 */
function radioUpdate_onClick(){
	var optSelected = getRadioValue("radioUpdate");
	var form = View.panels.get("abCurrencyDefConvRatesUpdate");
	form.enableField("vf_update_date", (optSelected == "date"));
}

/**
 * Enable/disable date field based on radio button selection.
 */
function radioConvert_onClick(){
	var optSelected = getRadioValue("radioConvert");
	var form = View.panels.get("abCurrencyDefConvRatesConvert");
	form.enableField("vf_convert_date", (optSelected == "date"));
}

/**
 * Get radio button value.
 * @param name radio button name
 */
function getRadioValue(name){

	var objRadio = document.getElementsByName(name);
	if(objRadio){
		for( var i = 0; i < objRadio.length; i++ ){
			var optRadio = objRadio[i];
			if(optRadio.checked){
				return optRadio.value;
			}
		}
	}
	return "";
}

/**
 * Check specified radio option.
 * @param name element name
 * @param value current value
 */
function setRadioValue(name, value){
	var objRadio = document.getElementsByName(name);
	if(objRadio){
		for( var i = 0; i < objRadio.length; i++ ){
			var optRadio = objRadio[i];
			if(optRadio.value == value){
				optRadio.checked = true;
				break;
			}
		}
	}
}
