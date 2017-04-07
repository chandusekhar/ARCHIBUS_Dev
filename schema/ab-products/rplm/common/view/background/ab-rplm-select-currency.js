var abRplmSelectCurrencyCtrl = View.createController('abRplmSelectCurrencyCtrl', {
	// default currency, values ('budget', 'user', 'custom'); 
	defaultCurrency: "budget",
	
	// default exchange rate type ('Payment', 'Budget')
	defaultExchangeRateType: "Budget",
	
	
	// selected currency
	selectedCurrency: null,
	
	// selected currency code
	selectedCurrencyCode: null,
	
	//selected exchange rate type
	selectedExchangeRateType: null,
	
	// if currency selection if visible or not
	isCurrencyHidden: false,
	
	// if exchange rate selection is visible or not
	isExchangeRateHidden: false,
	
	afterViewLoad: function (){
		this.getCurrencyOptions();
		this.hideElement("selectCurrency_label", this.isCurrencyHidden);
		this.hideElement("selectCurrency_elem", this.isCurrencyHidden);
		this.hideElement("selectExchangeRateType", this.isExchangeRateHidden);
		this.hideElement("selectExchangeRateType_elem", this.isExchangeRateHidden);
		this.setValues();
	},
	
	/**
	 * On save event handler.
	 */
	abRplmSelectCurrency_onSave: function(){
		this.saveCurrencyOptions();
		View.closeThisDialog();
	},
	
	/**
	 * Cancel event handler.
	 */
	abRplmSelectCurrency_onCancel: function(){
		View.closeThisDialog();
	},

	/**
	 * Read current option from parent panel if exists. If 
	 * don't exist use default values.
	 */
	getCurrencyOptions: function(){
		var openerView = this.view.getOpenerView();
		var dialogOpenerPanel = openerView.dialogOpenerPanel;
		if (valueExistsNotEmpty(dialogOpenerPanel.displayCurrency)){
			var displayCurrency = dialogOpenerPanel.displayCurrency;
			this.selectedCurrency = displayCurrency.type;
			this.selectedCurrencyCode = displayCurrency.code;
			this.selectedExchangeRateType = displayCurrency.exchangeRateType;
			if(valueExists(displayCurrency.isCurrencyHidden)){
				this.isCurrencyHidden =  displayCurrency.isCurrencyHidden;
			}
			if(valueExists(displayCurrency.isExchangeRateHidden)){
				this.isCurrencyHidden = displayCurrency.isExchangeRateHidden;
			}
			
		}else{
			this.selectedCurrency = this.defaultCurrency;
			this.selectedCurrencyCode = this.view.project.budgetCurrency.code;
			this.selectedExchangeRateType = this.defaultExchangeRateType;
			this.isCurrencyHidden = false;
			this.isExchangeRateHidden = false;
		}
	},
	
	/**
	 * Save current values to opener panel.
	 */
	saveCurrencyOptions: function(){
		this.readCurrentValues();
		var displayCurrency = {
				type: this.selectedCurrency,
				code: this.selectedCurrencyCode,
				exchangeRateType: this.selectedExchangeRateType
		};
		var openerView = this.view.getOpenerView();
		var dialogOpenerPanel = openerView.dialogOpenerPanel;
		dialogOpenerPanel.displayCurrency = displayCurrency;
	},
	
	/**
	 * read current values.
	 */
	readCurrentValues: function(){
		this.selectedCurrency = getRadioValue("radioCurrency");
		this.selectedExchangeRateType = getRadioValue("radioExchangeRateType");
		if(this.selectedCurrency == "custom"){
			var cboName = "selectCurrency_"+ this.selectedCurrency;
			this.selectedCurrencyCode = document.getElementById(cboName).value;
		}else if (this.selectedCurrency == "budget") {
			this.selectedCurrencyCode = this.view.project.budgetCurrency.code;
		}else if (this.selectedCurrency == "user") {
			this.selectedCurrencyCode = this.view.user.userCurrency.code;
		}
	},
	
	/**
	 * Set selected radio values and construct drop dopwn list.
	 */
	setValues: function(){
		// radio currency
		setRadioValue("radioCurrency", this.selectedCurrency);
		// exchange rate type
		setRadioValue("radioExchangeRateType", this.selectedExchangeRateType);
		/*
		 * exchange rate is enabled is  ( currency is hidden  OR (currency is visible AND currency type = "custom") 
		 */
		var exchangeRateEnabled = ((this.selectedCurrency == "custom" && !this.isCurrencyHidden) || this.isCurrencyHidden); 
		enableRadio("radioExchangeRateType", exchangeRateEnabled);
		
		var budgetCurrency = this.view.project.budgetCurrency.code;
		var userCurrency = this.view.user.userCurrency.code;
		var projectCurrencies = this.view.project.currencies;
		
		// construct drop down list - selectCurrency_budget
		var objSelect = document.getElementById("selectCurrency_budget");
		objSelect.innerHTML = "";
		var option = document.createElement('option');
        option.value = budgetCurrency;
        option.appendChild(document.createTextNode(budgetCurrency));
        objSelect.appendChild(option);
        if (valueExistsNotEmpty(this.selectedCurrencyCode)) {
        	objSelect.value = this.selectedCurrencyCode;
        }
        objSelect.disabled = (this.selectedCurrency != "budget");

		// construct drop down list - selectCurrency_user
		var objSelect = document.getElementById("selectCurrency_user");
		objSelect.innerHTML = "";
		var option = document.createElement('option');
        option.value = userCurrency;
        option.appendChild(document.createTextNode(userCurrency));
        objSelect.appendChild(option);
        if (valueExistsNotEmpty(this.selectedCurrencyCode)) {
        	objSelect.value = this.selectedCurrencyCode;
        }
        objSelect.disabled = (this.selectedCurrency != "user");

		var objSelect = document.getElementById("selectCurrency_custom");
		objSelect.innerHTML = "";
		for (var i=0; i < projectCurrencies.length; i++) {
			var currency = projectCurrencies[i];
			var option = document.createElement('option');
	        option.value = currency.code;
	        option.appendChild(document.createTextNode(currency.code));
	        objSelect.appendChild(option);
		}
        if (valueExistsNotEmpty(this.selectedCurrencyCode) && this.selectedCurrency == "custom") {
        	objSelect.value = this.selectedCurrencyCode;
        }
		objSelect.disabled = (this.selectedCurrency != "custom");
	},
	
	/**
	 * Hide specified element.
	 */
	hideElement: function(id, isHidden){
		var objElem = document.getElementById(id);
		if(objElem){
			if(isHidden){
				objElem.style.display = "none";
			}else{
				objElem.style.display = "";
			}
		}
	}
});

/**
 * Enable /disable currency drop down list.
 */
function enableDropDown(){
	var objRadio = document.getElementsByName("radioCurrency");
	if(objRadio){
		for( var i = 0; i < objRadio.length; i++ ){
			var optRadio = objRadio[i];
			var objSelect = document.getElementById("selectCurrency_" + optRadio.value);
			if(optRadio.checked){
				objSelect.disabled = false;
			}else{
				objSelect.disabled = true;
			}
		}
	}
}

/**
 * Enable / disable radio object
 * @param name
 * @param enabled
 */
function enableRadio(name, enabled){
	var objRadio = document.getElementsByName(name);
	if(objRadio){
		for( var i = 0; i < objRadio.length; i++ ){
			var optRadio = objRadio[i];
			optRadio.disabled = !enabled;
		}
	}
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
 * Set radio button value.
 * @param name radio button name
 * @param value selected option
 */
function setRadioValue(name, value){
	var objRadio = document.getElementsByName(name);
	if(objRadio){
		for( var i = 0; i < objRadio.length; i++ ){
			var optRadio = objRadio[i];
			if (optRadio.value == value){
				optRadio.checked = true;
				return true;
			}
		}
	}
}