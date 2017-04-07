var abBldgopsAdjustInvController = View.createController('abBldgopsAdjustInv', {
	
	validatorForThisForm: null, //Initialize validation object
	invAction: null,
	//Sum of Estimate quantity were selected
	qtyEstimateSum: 0,

	afterViewLoad: function() {
	    // attach event listeners to 'Inventory Action' radio buttons
	    this.addRadioButtonEventListeners('abBldgopsAdjustInvForm_invAction', this.onSelectInventoryAction);
	    this.wrptListPanel.addEventListener('onMultipleSelectionChange', this.multipleWorkRequestListSelectionChange);
    },

	afterInitialDataFetch:function(){
		this.abBldgopsAdjustInvForm.showField("pt.acc_prop_type",true);
		this.abBldgopsAdjustInvForm.showField('pt.fromStoreLocation',false);
		this.abBldgopsAdjustInvForm.showField('ptStoreQtyAvailable',false);
		this.abBldgopsAdjustInvForm.showField('ptStoreQtyOnReserve',false);
		this.abBldgopsAdjustInvForm.enableField("pt.units_issue",false);
		invAction='Add_new';
		
		//add edit icon to To Storage Location field.
		var imgNode=this.getImgNodeElement('toStoreLocation');
			imgNode.onclick=onclickToStoreLocEditImg;
		this.abBldgopsAdjustInvForm.getFieldElement('pt.toStoreLocation').parentElement.appendChild(imgNode);
		
		//add edit icon to From Storage Location field.
		var imgNode=this.getImgNodeElement('fromStoreLocation');
			imgNode.onclick=onclickFromStoreLocEditImg;
		this.abBldgopsAdjustInvForm.getFieldElement('pt.fromStoreLocation').parentElement.appendChild(imgNode);
	},
	/**
	 * Get edit icon image node element by field name.
	 * @param field name
	 * @return Icon element of the field
	 */
	getImgNodeElement: function(fieldName){
		var imgNode=document.createElement("img");
			imgNode.src="/archibus/schema/ab-core/graphics/icons/view/pencil.png";
			imgNode.id=fieldName+"_EditImg";
			imgNode.style.marginLeft="10px";
			imgNode.style.cursor="pointer";
			
		return imgNode;
	},
	/**
	 * Work request part list multiple selection change event handler
	 */
	multipleWorkRequestListSelectionChange: function(row){
		var wrptListPanel= View.panels.get('wrptListPanel');
		var controller=View.controllers.get('abBldgopsAdjustInv');
		var rows = View.panels.get('wrptListPanel').getSelectedRows();
		
		if(rows.length>=0){
			controller.qtyEstimateSum=0;
			var instructions ="<span font-style='italic' font-size='14'>"+getMessage("wrListHeaderInstruction")+": "+"</span>";
			for(var i=0;i<rows.length;i++){
				var rowRecord=rows[i].row.getRecord();
				var qtyEstimate=parseFloat(rowRecord.getValue('wrpt.qty_estimated'));
				controller.qtyEstimateSum+=qtyEstimate;
			}
			var ds=View.dataSources.get('abBldgopsAdjustInvPartStoreLocationDs');
			instructions+="<span>"+ds.formatValue('pt_store_loc_pt.qty_on_hand',controller.qtyEstimateSum.toFixed(2),true)+"</span>"
			//instructions +="<span style='background-color:#66FF00'>"+getMessage("wrListHeaderInstruction")+": "+this.currentAvailQty+"</span>";
			//wrptListPanel.setInstructions(instructions);
			View.panels.get('totalReservedSelectMsgPanel').show(true);
			document.getElementById('selectTotalMsgElement').innerHTML=instructions;
		}
		
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
    	    form.setFieldValue('pt.fromStoreLocation','');
    	    
    	    var wrptList=View.panels.get('wrptListPanel');
    	    var totalReservedSelectMsgPanel=View.panels.get('totalReservedSelectMsgPanel');
    	    form.showField('ptStoreQtyAvailable',false);
    	    form.showField('ptStoreQtyOnReserve',false);
    	    wrptList.show(false);
    	    totalReservedSelectMsgPanel.show(false);
			switch(invAction){
				case 'Add_new': {
					form.enableField("pt.part_id",true);
					form.enableField("pt.qty_on_hand",true);
					form.enableField("pt.cost_unit_last",true);
					form.enableField("pt.units_issue",false);
					form.showField("pt.acc_prop_type",true);
					form.showField('pt.toStoreLocation',true);
					form.showField('pt.fromStoreLocation',false);
					
					break;
				}
				case 'Disburse': {
					form.enableField("pt.part_id",true);
					form.enableField("pt.qty_on_hand",true);
					form.enableField("pt.cost_unit_last",false);
					form.enableField("pt.units_issue",false);
					form.showField("pt.acc_prop_type",true);
					form.showField('pt.toStoreLocation',false);
					form.showField('pt.fromStoreLocation',true);
					break;
				}
				case 'Return': {
					form.enableField("pt.part_id",true);
					form.enableField("pt.qty_on_hand",true);
					form.enableField("pt.cost_unit_last",false);
					form.enableField("pt.units_issue",false);
					form.showField("pt.acc_prop_type",true);
					form.showField('pt.toStoreLocation',true);
					form.showField('pt.fromStoreLocation',false);
					break;
				}
				case 'Rectify': {
					form.enableField("pt.part_id",true);
					form.enableField("pt.qty_on_hand",true);
					form.enableField("pt.cost_unit_last",false);
					form.enableField("pt.units_issue",false);
					form.showField("pt.acc_prop_type",false);
					form.showField('pt.toStoreLocation',true);
					form.showField('pt.fromStoreLocation',false);
					break;
				}
				case 'transfer': {
					form.enableField("pt.part_id",true);
					form.enableField("pt.qty_on_hand",true);
					form.enableField("pt.cost_unit_last",false);
					form.enableField("pt.units_issue",false);
					form.showField("pt.acc_prop_type",false);
					form.showField('pt.toStoreLocation',true);
					form.showField('pt.fromStoreLocation',true);
					form.showField('ptStoreQtyAvailable',true);
					form.showField('ptStoreQtyOnReserve',true);
					break;
				}
	            default: {
					form.enableField("pt.part_id",false);
					form.enableField("pt.qty_on_hand",false);
					form.enableField("pt.cost_unit_last",false);
					form.enableField("pt.units_issue",false);	            
					form.showField("pt.acc_prop_type",false);
					form.showField('pt.toStoreLocation',false);
					form.showField('pt.fromStoreLocation',false);
	        		break;
	            }
			}	
    	   
    	}
    },	
	
	AviableAdjustInventoryForm: function() {
        var canSave = true;
        
        var part = this.abBldgopsAdjustInvForm.getRecord();
        
		var form = this.abBldgopsAdjustInvForm;
		//Clear validation result
		form.clearValidationResult();
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
		        var toStoreLocaiton=part.getValue('pt.toStoreLocation');
		        if(!valueExistsNotEmpty(toStoreLocaiton)){
		        	form.fields.get('pt.toStoreLocation').setInvalid(getMessage('ToStoreLocationMustBeEnteredMsg'));
		        	canSave=false;
		        }else{
		        	if(!this.valid_ID("pt_store_loc","pt_store_loc_id",toStoreLocaiton)) {
			            form.fields.get('pt.toStoreLocation').setInvalid(getMessage('InvalidToPartStoreLocCodeMsg'));
		        		
			            canSave = false;        		
		        	}
		        }
				break;
			}
			case 'Disburse': {
				
				var fromStoreLocaiton=part.getValue('pt.fromStoreLocation');
				if(!valueExistsNotEmpty(fromStoreLocaiton)){
					form.fields.get('pt.fromStoreLocation').setInvalid(getMessage('FromStoreLocationMustBeEnteredMsg'));
		        	canSave=false;
				}else{
		        	if(!this.valid_ID("pt_store_loc","pt_store_loc_id",fromStoreLocaiton)) {
			            form.fields.get('pt.fromStoreLocation').setInvalid(getMessage('InvalidFromPartStoreLocCodeMsg'));
		        		
			            canSave = false;        		
		        	}
		        }
				break;
			}
			case 'Return': {
				var toStoreLocaiton=part.getValue('pt.toStoreLocation');
				if(!valueExistsNotEmpty(toStoreLocaiton)){
		        	form.fields.get('pt.toStoreLocation').setInvalid(getMessage('ToStoreLocationMustBeEnteredMsg'));
		        	canSave=false;
		        }else{
		        	if(!this.valid_ID("pt_store_loc","pt_store_loc_id",toStoreLocaiton)) {
			            form.fields.get('pt.toStoreLocation').setInvalid(getMessage('InvalidToPartStoreLocCodeMsg'));
		        		
			            canSave = false;        		
		        	}
		        }
				break;
			}
			case 'Rectify': {
				var toStoreLocaiton=part.getValue('pt.toStoreLocation');
				if(!valueExistsNotEmpty(toStoreLocaiton)){
		        	form.fields.get('pt.toStoreLocation').setInvalid(getMessage('ToStoreLocationMustBeEnteredMsg'));
		        	canSave=false;
		        }else{
		        	if(!this.valid_ID("pt_store_loc","pt_store_loc_id",toStoreLocaiton)) {
			            form.fields.get('pt.toStoreLocation').setInvalid(getMessage('InvalidToPartStoreLocCodeMsg'));
		        		
			            canSave = false;        		
		        	}
		        }
				break;
			}   
			case 'transfer': {
				
				var isSelectReservedParts=View.panels.get('wrptListPanel').getSelectedRows().length;
				
				var fromStoreLocaiton=part.getValue('pt.fromStoreLocation');
				var partId=part.getValue('pt.part_id');
				if(!valueExistsNotEmpty(fromStoreLocaiton)){
					form.fields.get('pt.fromStoreLocation').setInvalid(getMessage('FromStoreLocationMustBeEnteredMsg'));
		        	canSave=false;
				}else{
					if(!this.valid_ID("pt_store_loc","pt_store_loc_id",fromStoreLocaiton)) {
			            form.fields.get('pt.fromStoreLocation').setInvalid(getMessage('InvalidFromPartStoreLocCodeMsg'));
		        		
			            canSave = false;        		
		        	}
				}
				
				var toStoreLocaiton=part.getValue('pt.toStoreLocation');
				if(!valueExistsNotEmpty(toStoreLocaiton)){
		        	form.fields.get('pt.toStoreLocation').setInvalid(getMessage('ToStoreLocationMustBeEnteredMsg'));
		        	canSave=false;
		        }else{
		        	if(!this.valid_ID("pt_store_loc","pt_store_loc_id",toStoreLocaiton)) {
			            form.fields.get('pt.toStoreLocation').setInvalid(getMessage('InvalidToPartStoreLocCodeMsg'));
		        		
			            canSave = false;        		
		        	}
		        }
				//If the selected Inventory Action = Storage Location Transfer, require that the Quantity value is greater than or equal to the sum of the quantity of selected part reservations.  
				//If it is not, display this error message
				var transferAviable=part.getValue('pt.qty_on_hand');
				if(!valueExistsNotEmpty(transferAviable)){
					form.fields.get('pt.qty_on_hand').setInvalid(getMessage('quantityMustNotBeEmptyMsg'));
					canSave=false
				}else{
					if(parseFloat(transferAviable)<(this.qtyEstimateSum)){
						form.fields.get('pt.qty_on_hand').setInvalid(getMessage('quantityMustGreaterThanReservedMsg'));
						canSave=false;
					}
				}
				//o	If the selected Inventory Action = Storage Location Transfer, require that the Quantity value be less than or equal to the sum of the Quantity Available and the sum of the selected part reservations.  
				//If it is not, display this error message
				if(valueExistsNotEmpty(fromStoreLocaiton)&&valueExistsNotEmpty(partId)){
					var ptLocDS=View.dataSources.get('abBldgopsAdjustInvPartStoreLocationDs');
					var ptLocRes=new Ab.view.Restriction();
					ptLocRes.addClause('pt_store_loc_pt.pt_store_loc_id',fromStoreLocaiton,'=');
					ptLocRes.addClause('pt_store_loc_pt.part_id',partId,'=');
					var ptLocRecord=ptLocDS.getRecord(ptLocRes);
					var quantityAvaliable=0;
					if(!ptLocRecord.isNew){
						quantityAvaliable=parseFloat(ptLocRecord.getValue('pt_store_loc_pt.qty_on_hand'));
						
					}
					if(valueExistsNotEmpty(transferAviable)){
						if(transferAviable>(quantityAvaliable+this.qtyEstimateSum)){
							if(isSelectReservedParts>0){
								form.fields.get('pt.qty_on_hand').setInvalid(getMessage('quantityMustLessThanAvaliableAndReserved'));
							}else{
								form.fields.get('pt.qty_on_hand').setInvalid(getMessage('quantityMustLessThanAvaliable'));
							}
							
							canSave=false;
						}
					}
					
					
				}
				break;
			}  
			default: {
				
				break;
			}
		}        
        
        return canSave;		
	},

	abBldgopsAdjustInvForm_onSave: function() {
		if (!this.AviableAdjustInventoryForm()) {
			//Display validation result
			this.abBldgopsAdjustInvForm.displayValidationResult();
			return;
		}
		var wrptDs=View.dataSources.get('abBldgopsAdjustWrPtDS');
		var part_id = this.abBldgopsAdjustInvForm.getFieldValue('pt.part_id');
		var fromStorageLocation=this.abBldgopsAdjustInvForm.getFieldValue('pt.fromStoreLocation');
		var toStorageLocation=this.abBldgopsAdjustInvForm.getFieldValue('pt.toStoreLocation');
		if(invAction=='Disburse'){
			toStorageLocation='';
		}else{
			if(invAction!='transfer'){
				fromStorageLocation='';
			}
		}
		
		var Qty = parseFloat(this.abBldgopsAdjustInvForm.getFieldValue('pt.qty_on_hand'));
		var Price = parseFloat(this.abBldgopsAdjustInvForm.getFieldValue('pt.cost_unit_last')); 		
		var acId = this.abBldgopsAdjustInvForm.getFieldValue('pt.acc_prop_type');
		if(invAction=='Rectify'||invAction=='transfer'){
			acId = null;
		}
			
		if(invAction=='transfer'){
			var qtyReserved=this.qtyEstimateSum;
			var selectedWrptRecords = [];
			
			//Get selected row records from WRPT list panel
			var rows = View.panels.get('wrptListPanel').getSelectedRows();
			for(var i=0;i<rows.length;i++){
				var rowRecord=rows[i].row.getRecord();
				
				selectedWrptRecords[i]=new Object();
				selectedWrptRecords[i]['wrpt.part_id']=rowRecord.getValue('wrpt.part_id');
				selectedWrptRecords[i]['wrpt.pt_store_loc_id']=rowRecord.getValue('wrpt.pt_store_loc_id');
				selectedWrptRecords[i]['wrpt.date_assigned']=wrptDs.processOutboundRecord(rowRecord).values['wrpt.date_assigned'];
				selectedWrptRecords[i]['wrpt.time_assigned']=wrptDs.processOutboundRecord(rowRecord).values['wrpt.time_assigned'];
				selectedWrptRecords[i]['wrpt.wr_id']=rowRecord.getValue('wrpt.wr_id');
			}
			try{
				var result=Workflow.callMethod('AbBldgOpsBackgroundData-BldgopsPartInventoryService-transferPartsBetweenStorageLocationByAdjust',fromStorageLocation,toStorageLocation,part_id,Qty,qtyReserved,selectedWrptRecords);
				if(result.code=="executed"){
					//Refresh work request list.
					refreshWrPtListByPartIdAndFromStorageLocation(part_id,fromStorageLocation);
				}
			}catch(e){
				var message = "Save Parts and Inventory Transition failed";
				View.showMessage('error', message, e.message, e.data);
			}
		}else{
			try{ 
				var result = Workflow.callMethod("AbBldgOpsBackgroundData-calculateWorkResourceValues-updatePartsAndITForMPSL", part_id, Qty, Price, invAction,fromStorageLocation,toStorageLocation, acId);
			}catch (e) {
				var message = "Save Parts and Inventory Transition failed";
				View.showMessage('error', message, e.message, e.data);
			}
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
	},
	
	wrptListPanel_afterRefresh: function(){
		//format date-time column
		this.wrptListPanel.gridRows.each(function(row){
			var date= row.record['wrpt.date_assigned'];
			var time= row.record['wrpt.time_assigned'];
			var dateTime =   date+', '+time;
			row.setFieldValue("wrpt.date_time",dateTime );
		});
	}
	
	
		
});
/**
 * KB3040749 - Over write core API to open Add new dialog and close select value dialog.
 */

Ab.grid.SelectValue.prototype.onAddNew = function() {
	var parameters = Ab.view.View.selectValueParameters;
	View.closeDialog();
	View.openDialog(this.addNewDialog, null, false, {
		x : 100,
		y : 100,
		width : 800,
		height : 500,
		title : getAddNewDialogTitle(this.addNewDialog),
		useAddNewSelectVDialog : false,
		closeButton : false
	});
}

/**
 * KB3042553- avoid title concatenation.
 */
function getAddNewDialogTitle(addNewDialog){
	switch (addNewDialog){
		case 'ab-bldgops-add-part-dialog.axvw':
			return getMessage('addNewPartDialogTitle');
			break;
		default:
			return '';
	} 
}
function acListener(fieldName,selectedValue,previousValue){
	//alert(selectedValue);
	View.panels.get("abBldgopsAdjustInvForm").setFieldValue("pt.acc_prop_type", selectedValue);
	//$("acId").value = selectedValue;
}
/**
 * From Part Store Location select value action listener
 * if part code is exists,then add part code and from storage location as parameter to refresh the work request part list panel.
 * @param fieldName
 * @param selectValue
 * @param previousValue
 */
function afterSelectFromStoreLocation(fieldName,selectValue,previousValue){
	
	if(fieldName=="pt.fromStoreLocation"){
		var abBldgopsAdjustInvForm=View.panels.get('abBldgopsAdjustInvForm');
		
		var partId=abBldgopsAdjustInvForm.getFieldValue('pt.part_id');
		var fromStorageLocation=selectValue;
		if(invAction=='transfer'){
			//Refresh work request list by part code and from storage location
			refreshWrPtListByPartIdAndFromStorageLocation(partId,fromStorageLocation);
			setQuantityAvailableByStoreLocAndPart(fromStorageLocation,partId);
		}
		
		
		abBldgopsAdjustInvForm.setFieldValue('pt.fromStoreLocation',fromStorageLocation);
	}
}
/**
 * After select To Storage Location field.
 * @param fieldName Field Name.
 * @param selectValue Select Value.
 * @param previousValue Previous Value.
 */
function afterSelectToStoreLocation(fieldName,selectValue,previousValue){
	if(fieldName=="pt.toStoreLocation"){
		var abBldgopsAdjustInvForm=View.panels.get('abBldgopsAdjustInvForm');
		
		var partId=abBldgopsAdjustInvForm.getFieldValue('pt.part_id');
		var toStorageLocation=selectValue;
		if(invAction=='transfer'){
			setQuantityAvailableByStoreLocAndPart(toStorageLocation,partId);
		}
		
		
		abBldgopsAdjustInvForm.setFieldValue('pt.toStoreLocation',toStorageLocation);
	}
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
		
		var fromStorageLocation=abBldgopsAdjustInvForm.getFieldValue('pt.fromStoreLocation');
		if(invAction=='transfer'){
			//Refresh work request list by part code and from storage location
			refreshWrPtListByPartIdAndFromStorageLocation(partId,fromStorageLocation);
			setQuantityAvailableByStoreLocAndPart(fromStorageLocation,partId);
		}
		
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

/**
 * Refresh work request list by part code and from storage location
 * @param partId Part Code
 * @param fromStorageLocation From Storage Location Code
 */
function refreshWrPtListByPartIdAndFromStorageLocation(partId,fromStorageLocation){
	var wrptListPanel=View.panels.get('wrptListPanel');
	
	if(valueExistsNotEmpty(partId)&&valueExistsNotEmpty(fromStorageLocation)){
		wrptListPanel.show(true);
		wrptListPanel.addParameter('partCodeParam',"wrpt.part_id='"+partId+"'");
		wrptListPanel.addParameter('partStoreLocationCodeParam',"wrpt.pt_store_loc_id='"+fromStorageLocation+"'");
		
		wrptListPanel.refresh();
		wrptListPanel.setTitle(getMessage('wrListPanelTitle').replace('{0}',partId).replace('{1}',fromStorageLocation));
	}
}

/**
 * Get Quantity Available by Part Storage Location code and Part Code.
 * 
 * @param storageLocation Storage Location code.
 * @param partId Part Id.
 */
function setQuantityAvailableByStoreLocAndPart(storageLocation,partId){
	var qtyOnHand=0;
	var qtyOnReserve=0;
	var ptStoreLocDs=View.dataSources.get('abBldgopsAdjustInvPartStoreLocationDs');
	if(valueExistsNotEmpty(storageLocation)&&valueExistsNotEmpty(partId)){
		
		var restriction=new Ab.view.Restriction();
		restriction.addClause('pt_store_loc_pt.pt_store_loc_id',storageLocation,'=');
		restriction.addClause('pt_store_loc_pt.part_id',partId,'=');
		
		var ptStoreLocRecord=ptStoreLocDs.getRecord(restriction);
		
		if(!ptStoreLocRecord.isNew){
			qtyOnHand=ptStoreLocRecord.getValue('pt_store_loc_pt.qty_on_hand');
			qtyOnReserve=ptStoreLocRecord.getValue('pt_store_loc_pt.qty_on_reserve');
		}
	
	}
	
	View.panels.get('abBldgopsAdjustInvForm').setFieldValue('ptStoreQtyAvailable',ptStoreLocDs.formatValue('pt_store_loc_pt.qty_on_hand',qtyOnHand,true));
	View.panels.get('abBldgopsAdjustInvForm').setFieldValue('ptStoreQtyOnReserve',ptStoreLocDs.formatValue('pt_store_loc_pt.qty_on_reserve',qtyOnReserve,true));
}

/**
 * Click toStoreLocation field event handler.
 */
function onclickToStoreLocEditImg(){
	var form=View.panels.get('abBldgopsAdjustInvForm');
	var toStoreLoc=form.getFieldValue('pt.toStoreLocation');
	var partCode=form.getFieldValue('pt.part_id');
	//Clear validation result
	form.clearValidationResult();
	
	if(!valueExistsNotEmpty(partCode)){
		form.fields.get('pt.part_id').setInvalid(getMessage('InvalidPartCodeMsg'));
	}
	if(!valueExistsNotEmpty(toStoreLoc)){
		form.fields.get('pt.toStoreLocation').setInvalid(getMessage('ToStoreLocationMustBeEnteredMsg'));
	}
	
	if((!valueExistsNotEmpty(toStoreLoc))||(!valueExistsNotEmpty(partCode))){
		form.displayValidationResult();
	}else{
		var isExist=checkIfPartExistInStorage(toStoreLoc,partCode);
		var actionType="edit";
		if(!isExist){
			actionType="addnew-byAdjust";
		}
		
		View.openDialog('ab-bldgops-report-edit-part-in-storage-location-dialog.axvw', null, false, {
            width: 800,
            height: 600,
            partStoreLocId: toStoreLoc,
            partId: partCode,
            actionType:actionType,
            closeButton: true
        });
	}
}
/**
 * Click fromStoreLocation field event handler.
 */
function onclickFromStoreLocEditImg(){
	var form=View.panels.get('abBldgopsAdjustInvForm');
	var fromStoreLoc=form.getFieldValue('pt.fromStoreLocation');

	var partCode=form.getFieldValue('pt.part_id');
	//Clear validation result
	form.clearValidationResult();
	
	if(!valueExistsNotEmpty(partCode)){
		form.fields.get('pt.part_id').setInvalid(getMessage('InvalidPartCodeMsg'));
	}
	if(!valueExistsNotEmpty(fromStoreLoc)){
		form.fields.get('pt.fromStoreLocation').setInvalid(getMessage('FromStoreLocationMustBeEnteredMsg'));
	}
	
	if((!valueExistsNotEmpty(fromStoreLoc))||(!valueExistsNotEmpty(partCode))){
		form.displayValidationResult();
	}else{
		var isExist=checkIfPartExistInStorage(fromStoreLoc,partCode);
		var actionType="edit";
		if(!isExist){
			actionType="addnew-byAdjust";
		}
		
		View.openDialog('ab-bldgops-report-edit-part-in-storage-location-dialog.axvw', null, false, {
            width: 800,
            height: 600,
            partStoreLocId: fromStoreLoc,
            partId: partCode,
            actionType:actionType,
            closeButton: true
        });
	}
}


function checkIfPartExistInStorage(ptStoreLocId,partId){
	var result=true;
	var ptStoreLocDs=View.dataSources.get('abBldgopsAdjustInvPartStoreLocationDs');
	var ptStoreRes=new Ab.view.Restriction();
		ptStoreRes.addClause('pt_store_loc_pt.pt_store_loc_id',ptStoreLocId,'=');
		ptStoreRes.addClause('pt_store_loc_pt.part_id',partId,'=');
	
	var length=ptStoreLocDs.getRecords(ptStoreRes).length;
	if(length==0){
		result=false
	}
	
	return result;
}