var abRplmSelectVATCtrl = View.createController('abRplmSelectVATCtrl', {
	
	// default option
	defaultVAT: "total",
	
	// selected option
	displayVAT: {
		type: null,
		isHidden: false
	},
	
	afterViewLoad: function(){
		this.getVATOption();
		setRadioValue("radioVAT", this.displayVAT.type);
	},
	
	/**
	 * On save event handler.
	 */
	abRplmSelectVat_onSave: function(){
		this.setVATOption();
		View.closeThisDialog();
	},
	
	/**
	 * Cancel event handler.
	 */
	abRplmSelectVat_onCancel: function(){
		View.closeThisDialog();
	},
	
	/**
	 * Get current VAT option from parent panel if exists. 
	 * If not exist use default value.
	 */
	getVATOption: function(){
		var openerView = this.view.getOpenerView();
		var dialogOpenerPanel = openerView.dialogOpenerPanel;
		if (valueExistsNotEmpty(dialogOpenerPanel.displayVAT)){
			var displayVAT = dialogOpenerPanel.displayVAT;
			this.displayVAT.type = displayVAT.type;
			if(valueExists(displayVAT.isHidden)){
				this.displayVAT.isHidden = displayVAT.isHidden;
			}else{
				this.displayVAT.isHidden = false;
			}
		}else{
			this.displayVAT.type = this.defaultVAT;
			this.displayVAT.isHidden = false;
		}
	},
	
	/**
	 * Set selected VAT option to opener panel.
	 */
	setVATOption: function(){
		this.displayVAT.type = getRadioValue("radioVAT");
		var openerView = this.view.getOpenerView();
		var dialogOpenerPanel = openerView.dialogOpenerPanel;
		dialogOpenerPanel.displayVAT = this.displayVAT;
	}
});


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