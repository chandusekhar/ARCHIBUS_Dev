var abBldgopsAdjustInvController = View.createController('abBldgopsAdjustInv', {
	
	validatorForThisForm: null, //Initialize validation object
	invAction: null,

	afterViewLoad: function() {
	    // attach event listeners to 'Inventory Action' radio buttons
	    this.addRadioButtonEventListeners('abBldgopsAdjustInvForm_invAction', this.onSelectInventoryAction);
    },

	afterInitialDataFetch:function(){
		this.abBldgopsAdjustInvForm.showField("pt.acc_prop_type",false);
		this.abBldgopsAdjustInvForm.enableField("pt.units_issue",false);
	},
    
    /**
     * Helper method: adds specified controller method as an event listener to all radio buttons
     * that have specified name.
     */
    addRadioButtonEventListeners: function(radioButtonName, method) {
	    var radioButtons = document.getElementsByName(radioButtonName);
        for (i = 0; i < radioButtons.length; i++) {
        	var radioButton = radioButtons[i];
        	Ext.get(radioButton).on('click', method.createDelegate(this, [radioButton]));
        }
    },    
    
	/**
	 * Helper method: returns value of the selected radio button.
	 * @param {name} Name attribute of the radio button HTML elements.
	 */
	getSelectedRadioButton: function(radioButtonName){
	    var radioButtons = document.getElementsByName(radioButtonName);
	    for (var i = 0; i < radioButtons.length; i++) {
	        if (radioButtons[i].checked == 1) {
	            return radioButtons[i].value;
	        }
	    }
	    return "";
	},    
    
    /**
     * Called when the user selects one of the 'Inventory Action' radio buttons
     */
    onSelectInventoryAction: function(radioButton) {
    	if (radioButton.checked) {
    	    invAction = radioButton.value;
    	    
    	    //enable & disable form fields based on radio button value
    	    var form = View.panels.get('abBldgopsAdjustInvForm');
			switch(invAction){
				case 'Add_new': {
					form.enableField("pt.part_id",true);
					form.enableField("pt.qty_on_hand",true);
					form.enableField("pt.cost_unit_last",true);
					form.enableField("pt.units_issue",false);
					form.showField("pt.acc_prop_type",false);
					break;
				}
				case 'Disburse': {
					form.enableField("pt.part_id",true);
					form.enableField("pt.qty_on_hand",true);
					form.enableField("pt.cost_unit_last",false);
					form.enableField("pt.units_issue",false);
					form.showField("pt.acc_prop_type",true);
					break;
				}
				case 'Return': {
					form.enableField("pt.part_id",true);
					form.enableField("pt.qty_on_hand",true);
					form.enableField("pt.cost_unit_last",false);
					form.enableField("pt.units_issue",false);
					form.showField("pt.acc_prop_type",true);
					break;
				}
				case 'Rectify': {
					form.enableField("pt.part_id",true);
					form.enableField("pt.qty_on_hand",true);
					form.enableField("pt.cost_unit_last",false);
					form.enableField("pt.units_issue",false);
					form.showField("pt.acc_prop_type",false);
					break;
				}    	    
	            default: {
					form.enableField("pt.part_id",false);
					form.enableField("pt.qty_on_hand",false);
					form.enableField("pt.cost_unit_last",false);
					form.enableField("pt.units_issue",false);	            
					form.showField("pt.acc_prop_type",false);
	        		break;
	            }
			}	
    	   
    	}
    },	
	
	abBldgopsAdjustInvForm_beforeSave: function() {
        var canSave = true;
        
        var part = this.abBldgopsAdjustInvForm.getRecord();
        
		var form = this.abBldgopsAdjustInvForm;
        //part_id must be filled in and valid
        var part_id = part.getValue('pt.part_id');
        if (part_id == '') {        	
            form.fields.get('pt.part_id').setInvalid(getMessage('InvalidPartCodeMsg'));
            canSave = false;
        }
        else {
        	if(!this.valid_ID("pt","part_id",part_id)) {
	            form.fields.get('pt.part_id').setInvalid(getMessage('InvalidPartCodeMsg'));
	            canSave = false;        		
        	}
        }

        //quantity must be filled in and valid
        var quantity = part.getValue('pt.qty_on_hand');
        if (quantity == '' || Number(quantity) < 0) {        	
            form.fields.get('pt.qty_on_hand').setInvalid(getMessage('InvalidPartQtyMsg'));
            canSave = false;
        }          
        
        invAction = this.getSelectedRadioButton("abBldgopsAdjustInvForm_invAction");
		switch(invAction){
			case 'Add_new': {
				//price must be filled in and valid
				var price = part.getValue('pt.cost_unit_last');	
		        if (price == '') {   
		            form.fields.get('pt.cost_unit_last').setInvalid(getMessage('PartPriceMustBeEnteredMsg'));
		            canSave = false;
		        }
		        else {
		        	if (isNaN(price)) {
			            form.fields.get('pt.cost_unit_last').setInvalid(getMessage('InvalidPartPriceMsg'));
			            canSave = false;	        		
		        	}
		        	else {
		        		if (Number(price) < 0) {
				            form.fields.get('pt.cost_unit_last').setInvalid(getMessage('InvalidPartPriceMsg'));
				            canSave = false;	        		
		        		}
		        	}
		        }				
				break;
			}
			case 'Disburse': {
			
				break;
			}
			case 'Return': {

				break;
			}
			case 'Rectify': {

				break;
			}    	    
			default: {
				
				break;
			}
		}        
        
        return canSave;		
	},

	abBldgopsAdjustInvForm_onSave: function() {
		if (!this.abBldgopsAdjustInvForm.canSave()) {
			return;
		}
		
		var part_id = this.abBldgopsAdjustInvForm.getFieldValue('pt.part_id');
		var Qty = parseFloat(this.abBldgopsAdjustInvForm.getFieldValue('pt.qty_on_hand'));
		var Price = parseFloat(this.abBldgopsAdjustInvForm.getFieldValue('pt.cost_unit_last')); 		
		var acId = this.abBldgopsAdjustInvForm.getFieldValue('pt.acc_prop_type');
		if(invAction=='Add_new' || invAction=='Rectify' )
			acId = null;
	    try{ 
			var result = Workflow.callMethod("AbBldgOpsBackgroundData-calculateWorkResourceValues-updatePartsAndIT", part_id, Qty, Price, invAction, acId);
		}
		catch (e) {
			var message = "Save Parts and Inventory Transition failed";
			View.showMessage('error', message, e.message, e.data);
		}
		var message = getMessage('formSaved');
		this.abBldgopsAdjustInvForm.displayTemporaryMessage(message);
	},
	
	/**
	 * Helper method: Validates ID
	 */
	valid_ID: function(tableName, fieldName, fieldValue){
		var isValid = false;
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause(tableName + "." + fieldName, fieldValue, '=');
   		var parameters = {
   			tableName: tableName,
   			fieldNames: "[" + tableName + '.' + fieldName + "]",
   			restriction: toJSON(restriction) 
   		};     		
     	var result = Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);     		
     	if (result.code == 'executed') {
     		if (result.data.records.length == 1) isValid = true;
     	}	
	    return isValid;
	}
		
})

function acListener(fieldName,selectedValue,previousValue){
	//alert(selectedValue);
	View.panels.get("abBldgopsAdjustInvForm").setFieldValue("pt.acc_prop_type", selectedValue);
	//$("acId").value = selectedValue;
}

/**
 * Part code selectvalue action listener.
 * @param fieldName Fields Name.
 * @param selectValue Selected Value.
 * @param previousValue Previous Value.
 */

function partCodeSelectListener(fieldName,selectValue,previousValue){
	if(fieldName=="pt.part_id"){
		var abBldgopsAdjustInvForm=View.panels.get('abBldgopsAdjustInvForm');
		
		var partId=selectValue;

		//KB#3053036 automatically set unit of issue field by selected part code.
		getUnitsIssueByPartCode(partId);

		abBldgopsAdjustInvForm.setFieldValue('pt.part_id',partId);
		
	}
}
/**
 * Get Units of Issue by part code.
 * @param partCode Part Code.
 */
function getUnitsIssueByPartCode(partCode){
	var partRes=new Ab.view.Restriction();
		partRes.addClause('pt.part_id',partCode,'=');
	var ptDs=View.dataSources.get('abBldgopsAdjustInvFormDS');
	var ptRecord=ptDs.getRecord(partRes);
	var unitIssue=ptRecord.getValue('pt.units_issue');
	
	View.panels.get('abBldgopsAdjustInvForm').setFieldValue('pt.units_issue',unitIssue);
		
}
