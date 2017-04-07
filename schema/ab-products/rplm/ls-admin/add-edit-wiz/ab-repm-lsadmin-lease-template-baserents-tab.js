var rplmBaseRentsController = View.createController('rplmBaseRents',{
  	
	 leaseId: null,
	    
	 refreshPanels: new Array(),
	 
	 runtimeParameters: null,
		
	 // if VAT and MC is enabled
	 isVATAndMCEnabled: false,
		
	 formId: null,

	 isVatExcluded: false,
	
	 afterViewLoad: function(){
		// check if multi currency is enabled
		this.isVATAndMCEnabled = View.activityParameters['AbCommonResources-EnableVatAndMultiCurrency'] == 1;
		
	 },
	 
	 gridBaseRents_onNew: function(){
		 this.add_edit_item(null, getMessage('add_base_rent'));
	 },
	 
	 gridBaseRents_onEdit: function(row){
		 this.add_edit_item(row, getMessage('edit_base_rent'));
	 },
	 
	 add_edit_item: function(row , title){
			var cost_tran_recur_id = (row != null?row.getFieldValue('cost_tran_recur.cost_tran_recur_id'):null);
			var leaseId = null;
			if(row!=null){
				leaseId = row.getFieldValue('cost_tran_recur.ls_id');
			}else{
				var openerController = View.controllers.get('abRplmLsAdminLeaseTemplateSelectTab_ctrl');
				leaseId = openerController.selectedLease;
			}
			
			this.runtimeParameters = {
					cost_tran_recur_id: cost_tran_recur_id, 
					leaseId: leaseId,
					refreshPanels: new Array("gridBaseRents"),
					title: title
			};
			
			if(this.isVATAndMCEnabled){
				this.formId = "formBaseRentVAT";
				this.formBaseRent.show(false, true);
				this.formBaseRentVAT.showInWindow({
				    newRecord: false,
				    width:800,
					height:700, 
				    closeButton: false
				});
			}else{
				this.formId = "formBaseRent";
				this.formBaseRentVAT.show(false, true);
				this.formBaseRent.showInWindow({
				    newRecord: false,
				    width:800,
					height:700, 
				    closeButton: false
				});
			}
			this.initializeView();
		},
	
	 initializeView: function(){
		// initialize view variables
		this.leaseId = this.runtimeParameters.leaseId;
		this.refreshPanels = this.runtimeParameters.refreshPanels;
		
		// prepare form object
		var objForm = View.panels.get(this.formId);
		// refresh form
		if(valueExistsNotEmpty(this.runtimeParameters.cost_tran_recur_id)){
			var restriction = new Ab.view.Restriction();
			restriction.addClause("cost_tran_recur.cost_tran_recur_id", this.runtimeParameters.cost_tran_recur_id, "=");
			objForm.refresh(restriction, false);
		}else{
			objForm.refresh(null, true);
			objForm.setFieldValue("cost_tran_recur.cost_cat_id", "RENT - BASE RENT");
		}

		this.isVatExcluded = isVatExcludedForLease(this.leaseId);
		
		var afterSelectListenerCostCateg = "";
		var afterSelectListenerCtryId = "";
		if(this.isVATAndMCEnabled){
			afterSelectListenerCostCateg = 'afterSelectCostCategory';
			afterSelectListenerCtryId = 'afterSelectCountryId';
			
			if(objForm.newRecord){
				objForm.setFieldValue("cost_tran_recur.ctry_id", View.user.country);
				objForm.setFieldValue("cost_tran_recur.currency_payment", View.user.userCurrency.code);
			}
			
			setOverrideField("chk_vat_percent", this.formId, "cost_tran_recur.vat_percent_override", 0);
			setOverrideField("chk_vat_amount", this.formId, "cost_tran_recur.vat_amount_override", -1);
			setOverrideField("chk_exchange_rate", this.formId, "cost_tran_recur.exchange_rate_override", 1);

		}

		// set form title
		objForm.setTitle(this.runtimeParameters.title);
		this.enableDisableCustomPeriod(this.formId);
		// we must set event listener to cost category select value
		var fieldCostCateg = objForm.fields.get('cost_tran_recur.cost_cat_id');
		var command = fieldCostCateg.actions.items[0].command.commands[0];
		if(valueExistsNotEmpty(afterSelectListenerCostCateg)){
			command.actionListener = afterSelectListenerCostCateg;
		}

		var fieldCtryId = objForm.fields.get('cost_tran_recur.ctry_id');
		if (valueExists(fieldCtryId)) {
			var command = fieldCtryId.actions.items[0].command.commands[0];
			if(valueExistsNotEmpty(afterSelectListenerCtryId)){
				command.actionListener = afterSelectListenerCtryId;
			}
		}
		
		if(this.isVATAndMCEnabled && objForm.newRecord){
			getVATPercent('formBaseRentVAT', 'cost_tran_recur.ctry_id', 'cost_tran_recur.cost_cat_id', 'cost_tran_recur.ls_id' , 'cost_tran_recur.vat_percent_value');
		}
		
		if(objForm.newRecord){
			objForm.setFieldValue("cost_tran_recur.ls_id",this.leaseId);
		}
		
		if(this.isVATAndMCEnabled){
			checkIfDatesMatch('chk_cost_dates_mc', 'formBaseRentVAT', 'cost_tran_recur.date_start', 'cost_tran_recur.date_end');
		}else{
			checkIfDatesMatch('chk_cost_dates', 'formBaseRent', 'cost_tran_recur.date_start', 'cost_tran_recur.date_end');
		}
	},
	
	gridBaseRents_onDelete: function(row){
		var dataSource = this.dsBaseRents;
		var record = row.getRecord(["cost_tran_recur.cost_tran_recur_id"]);
		var reportPanel = this.gridBaseRents;
		View.confirm(getMessage('message_baserent_confirmdelete'), function(button){
			if(button == 'yes'){
                try {
					dataSource.deleteRecord(record);
					reportPanel.refresh(reportPanel.restriction);
                } catch (e) {
                    var message = String.format(getMessage('error_delete'));
                    View.showMessage('error', message, e.message, e.data);
                }
				
			}
		})
	},
	
	formBaseRent_onSave: function(){
    	var objForm = this.formBaseRent;
        if(!datesValidated(objForm)){
			return false;
		}
		if (!valueExistsNotEmpty(this.runtimeParameters.cost_tran_recur_id)) {
			objForm.setFieldValue("cost_tran_recur.ls_id", this.leaseId);
        }
    	
        if (objForm.save()) {
        	var refreshPanels = this.runtimeParameters.refreshPanels;
        	var openerView = View.getOpenerView();
        	
        	for(var i=0; i< this.refreshPanels.length; i++){
        		var panelId = this.refreshPanels[i];
        		var objGrid = View.panels.get(panelId);
        		if(objGrid){
        			objGrid.refresh(objGrid.restriction);
        		}
        	}
        	
        	this.formBaseRent.closeWindow();
        }
    },

    formBaseRentVAT_onSave: function(){
    	var objForm = this.formBaseRentVAT;
        if(!datesValidated(objForm)){
			return false;
		}
        
		if (!valueExistsNotEmpty(this.runtimeParameters.cost_tran_recur_id)) {
			objForm.setFieldValue("cost_tran_recur.ls_id", this.leaseId);
        }

		if (calculateCosts('formBaseRentVAT', 'cost_tran_recur', 'chk_vat_amount') && objForm.save()) {
			// we must convert exchange rate costs
			try{
				// get new cost id 
				var costId = objForm.getFieldValue("cost_tran_recur.cost_tran_recur_id");
				// call convert cost WFR
				var result = Workflow.callMethod('AbCommonResources-CostService-convertCostForVATAndMC', [parseInt(costId)],  ["cost_tran_recur"]);
				
	        	var refreshPanels = this.runtimeParameters.refreshPanels;
	        	var openerView = View.getOpenerView();
	        	
	        	for(var i=0; i< this.refreshPanels.length; i++){
	        		var panelId = this.refreshPanels[i];
	        		var objGrid = View.panels.get(panelId);
	        		if(objGrid){
	        			objGrid.refresh(objGrid.restriction);
	        		}
	        	}

	        	if (valueExistsNotEmpty(result.message)){
					View.showMessage(result.message);
				}else{
					this.formBaseRentVAT.closeWindow();
				}
			}catch(e){
				Workflow.handleError(e);
				return false;
			}
        }
    },
    
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
 * Refresh parent panels
 */
function refreshParentPanels(){
	var controller = View.controllers.get('rplmBaseRent');
	var arrPanels = controller.refreshPanels;
	var openerView = View.getOpenerView();
	for( var i=0; i < arrPanels.length; i++){
		var panelId = arrPanels[i];
		var objPanel = openerView.panels.get(panelId);
		if (objPanel){
			objPanel.refresh(objPanel.restriction);
		}
	}
	return true;
}


function setCustomPeriod(){
	if(rplmBaseRentController.formBaseRent.getFieldValue('cost_tran_recur.period')=='CUSTOM'){
		rplmBaseRentController.formBaseRent.enableField('cost_tran_recur.period_custom' ,true);
	}else {
		rplmBaseRentController.formBaseRent.enableField('cost_tran_recur.period_custom' ,false);
	}
}

/**
 * check if dateStart < dateEnd 
**/

function datesValidated(form){
	// get the string value from field stard date
	var date_start = form.getFieldValue('cost_tran_recur.date_start').split("-");
	//create Date object
	var dateStart = new Date(date_start[0],date_start[1],date_start[2]);
	
	// get the string value from field end date
	var date_end = form.getFieldValue('cost_tran_recur.date_end').split("-");
	//create Date object
	var dateEnd = new Date(date_end[0],date_end[1],date_end[2]);

	// get the string value from field start date
	var seasonal_date_start = form.getFieldValue('cost_tran_recur.date_seasonal_start').split("-");
	//create Date object
	var seasonalDateStart = new Date(seasonal_date_start[0],seasonal_date_start[1],seasonal_date_start[2]);
	
	// get the string value from field end date
	var seasonal_date_end = form.getFieldValue('cost_tran_recur.date_seasonal_end').split("-");
	//create Date object
	var seasonalDateEnd = new Date(seasonal_date_end[0],seasonal_date_end[1],seasonal_date_end[2]);

	
	if (seasonalDateEnd < seasonalDateStart) {
		View.showMessage(getMessage('error_seasonal_date_end_before_date_start'));
		return false;
	}
	if (dateEnd < dateStart) {
			View.showMessage(getMessage('error_date_end_before_date_start'));
			return false;
	}
	return true;	
}

/**
 * After select cost category event handler
 * @param fieldName
 * @param selectedValue
 * @param previousValue
 */
function afterSelectCostCategory(fieldName, selectedValue, previousValue){
	var objForm = View.panels.get('formBaseRentVAT');
	objForm.setFieldValue(fieldName, selectedValue);

	// get VAT percent for selected country and cost category
	if(getVATPercent(objForm.id, 'cost_tran_recur.ctry_id', 'cost_tran_recur.cost_cat_id', 'cost_tran_recur.ls_id' , 'cost_tran_recur.vat_percent_value')){
		// reset override vat percent field
		resetOverrideField("chk_vat_percent", 'formBaseRentVAT', "cost_tran_recur.vat_percent_override", 0);
		// reset override vat amount field
		resetOverrideField("chk_vat_amount", 'formBaseRentVAT', "cost_tran_recur.vat_amount_override", -1);
		// calculate costs
		calculateCosts('formBaseRentVAT', 'cost_tran_recur', 'chk_vat_amount');
	}
}

/**
 * After select cost category event handler
 * @param fieldName
 * @param selectedValue
 * @param previousValue
 */
function afterSelectCountryId(fieldName, selectedValue, previousValue){
	var objForm = View.panels.get('formBaseRentVAT');
	objForm.setFieldValue(fieldName, selectedValue);

	// get VAT percent for selected country and cost category
	if(getVATPercent(objForm.id, 'cost_tran_recur.ctry_id', 'cost_tran_recur.cost_cat_id', 'cost_tran_recur.ls_id' , 'cost_tran_recur.vat_percent_value')){
		// reset override vat percent field
		resetOverrideField("chk_vat_percent", 'formBaseRentVAT', "cost_tran_recur.vat_percent_override", 0);
		// reset override vat amount field
		resetOverrideField("chk_vat_amount", 'formBaseRentVAT', "cost_tran_recur.vat_amount_override", 0);
		// calculate costs
		calculateCosts('formBaseRentVAT', 'cost_tran_recur', 'chk_vat_amount');
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
				getVATPercent('formBaseRentVAT', 'cost_tran_recur.ctry_id', 'cost_tran_recur.cost_cat_id', 'cost_tran_recur.ls_id' , 'cost_tran_recur.vat_percent_value', false);
			}
		}else{
			// we must reset field value
			if(valueExists(defaultValue)){
				var currentValue = objForm.getFieldValue(fieldId);
				if(parseFloat(currentValue) != defaultValue){
					objForm.setFieldValue(fieldId, dataSource.formatValue(fieldId, defaultValue, true));
					// get default VAT percent
					if(chkId == "chk_vat_percent"){
						getVATPercent('formBaseRentVAT', 'cost_tran_recur.ctry_id', 'cost_tran_recur.cost_cat_id', 'cost_tran_recur.ls_id' , 'cost_tran_recur.vat_percent_value', false);
					}
				}
			}
		}
	}
}
