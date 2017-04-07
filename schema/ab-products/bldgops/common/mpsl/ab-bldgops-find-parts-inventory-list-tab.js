View.createController('inventoryListController',{
	/**
	 * Constructor
	 */
	afterCreate: function(){
		var parentController=View.getOpenerView().controllers.get('findPartsController');
		parentController.on("app:operation:express:mpiw:onShowButtonClicked",this.onShowPartsList);
		//on click clear button in console form.
		parentController.on("app:operation:express:mpiw:onClearButtonClicked",this.onShowPartsList);
		parentController.on("app:operation:express:mpiw:refreshGridWhenClickMapMarker",this.refreshGridWhenClickMapMarker);
	},
	
	refreshGridWhenClickMapMarker: function(ptStorePtId){
		var res=new Ab.view.Restriction();
		res.addClause('pt_store_loc_pt.pt_store_loc_id',ptStorePtId,'=');
		var inventoryListView=this.partInventoryLocationTabs.findTab('partInventoryListTab').getContentFrame().View;
		inventoryListView.panels.get('ptInventoryList').refresh(res);
	},
	/**
	 * Call function when click show button
	 * @param record Console form record
	 */
	onShowPartsList: function(record){
		//Get value from parameter record
		var partCode=record.getValue('pt.part_id');
		var partClass=record.getValue('pt.class');
		var partDescription=record.getValue('pt.description');
		var whCode=record.getValue('pt_store_loc_pt.pt_store_loc_id');
		var whSite=record.getValue('pt_store_loc.site_id');
		var blId=record.getValue('pt_store_loc.bl_id');
		var whQuatity=record.getValue('pt_store_loc_pt.qty_on_hand');
		//Define restriction to refresh the part inventory list panel
		var res=new Ab.view.Restriction();
		
		if(valueExistsNotEmpty(partCode)){
			res.addClause('pt_store_loc_pt.part_id',partCode,'=');
		}
		
		if(valueExistsNotEmpty(partClass)){
			res.addClause('pt.class',partClass,'=');
		}
		
		if(valueExistsNotEmpty(partDescription)){
			res.addClause('pt.description',partDescription,'=');
		}
		if(valueExistsNotEmpty(whCode)){
			res.addClause('pt_store_loc_pt.pt_store_loc_id',whCode,'=');
		}
		
		if(valueExistsNotEmpty(whSite)){
			res.addClause('pt_store_loc.site_id',whSite,'=');
		}
		
		if(valueExistsNotEmpty(blId)){
			res.addClause('pt_store_loc.bl_id',blId,'=');
		}
		
		if(valueExistsNotEmpty(whQuatity)){
			res.addClause('pt_store_loc_pt.qty_on_hand',whQuatity,'&gt;=');
		}
		//Get tab control
		var inventoryListTab=this.partInventoryLocationTabs.findTab('partInventoryListTab');
		//Refresh the part inventory list by the console form restriction.
		var inventoryListPanel=null;
		if (inventoryListTab.useFrame) {
			inventoryListPanel= inventoryListTab.getContentFrame().View.panels.get('ptInventoryList');
		}else {
			inventoryListPanel= View.panels.get('ptInventoryList')
		}
		//Refresh the part inventory list by the restriction
		inventoryListPanel.refresh(res);
	},
	/**
	 * Show form when add purchased parts to inventory.
	 */
	ptInventoryList_onBtnAddNewPart: function(){
		
		this.addNewPartToInventory.showInWindow({
			width: 500,
			height:300,
			title: getMessage('addPurchaseDialogTitle')
		});
		this.addNewPartToInventory.clear();
		this.addNewPartToInventory.show(true,true);
	},
	
	/**
	 * Close window when click the Cancel button.
	 */
	addNewPartToInventory_onBtnCancel: function(){
		this.addNewPartToInventory.closeWindow();
	},
	
	/**
	 * After clicking Save, the user is brought back to the Find Parts form, 
	 * with filter fields populated with the Part Code, Warehouse Code, and Quantity that the user chose in the Purchase form.
	 */
	addNewPartToInventory_onBtnSave: function(){
		if (!this.ValidatePartInventoryRecord()) {
			//Display validation result
			this.addNewPartToInventory.displayValidationResult();
			return;
		}
		var part_id=this.addNewPartToInventory.getFieldValue('pt_store_loc_pt.part_id');
		var partStorageLocationId=this.addNewPartToInventory.getFieldValue('pt_store_loc_pt.pt_store_loc_id');
		var Qty=parseFloat(this.addNewPartToInventory.getFieldValue('pt_store_loc_pt.qty_on_hand'));
		var Price=parseFloat(this.addNewPartToInventory.getFieldValue('pt_store_loc_pt.cost_unit_last'));
		var acId=this.addNewPartToInventory.getFieldValue('pt_store_loc_pt.acId');
		var invAction='Add_new';
		//Update the WFR to Add part storage location code
		try{ 
			var result = Workflow.callMethod("AbBldgOpsBackgroundData-calculateWorkResourceValues-updatePartsAndITForMPSL", part_id, Qty, Price, invAction,'',partStorageLocationId,acId);
			if(result.code='executed'){
				View.panels.get('addNewPartToInventory').closeWindow();
				View.panels.get('ptInventoryList').refresh();
			}
		}catch (e) {
			var message = "Save Parts and Inventory Transition failed";
			View.showMessage('error', message, e.message, e.data);
		}
		
		
	},
	
	/**
	 * When select a part inventory list row , then set part code and part store location code to the opener view.
	 */
	selectPartRow: function(){
		var selectedRowIndex=this.ptInventoryList.selectedRowIndex;
		//Get the selected row record.
		var selectRowRecord=this.ptInventoryList.gridRows.get(selectedRowIndex).getRecord();
		
		var partId=selectRowRecord.getValue('pt_store_loc_pt.part_id');
		
		var ptStoreLocId=selectRowRecord.getValue('pt_store_loc_pt.pt_store_loc_id');
		
		var openerPanel=View.getOpenerView().getOpenerView().parameterPanel;
		
		//If opener panel is exists ,then set part code and part store location code to the opener view
		if(valueExistsNotEmpty(openerPanel)){
			if(valueExistsNotEmpty(partId)){
				openerPanel.setFieldValue('wrpt.part_id',partId);
			}
			
			if(valueExistsNotEmpty(ptStoreLocId)){
				openerPanel.setFieldValue('wrpt.pt_store_loc_id',ptStoreLocId);
			}
			
			View.getOpenerView().getOpenerView().closeDialog();
		}
		
		
	},
	
	/**
	 * Helper method: Validates ID
	 * Check if field value exist in the data table.
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
	/**
	 * Validate Part Inventory Record.
	 */
	ValidatePartInventoryRecord: function() {
        var canSave = true;
        
        var part = this.addNewPartToInventory.getRecord();
        
		var form = this.addNewPartToInventory;
		//Clear validation result
		form.clearValidationResult();
        //part_id must be filled in and valid
        var part_id = part.getValue('pt_store_loc_pt.part_id');
        if (!valueExistsNotEmpty(part_id)) {        	
            form.fields.get('pt_store_loc_pt.part_id').setInvalid(getMessage('InvalidPartCodeMsg'));
            canSave = false;
        }
        else {
        	if(!this.valid_ID("pt","part_id",part_id)) {
	            form.fields.get('pt_store_loc_pt.part_id').setInvalid(getMessage('InvalidPartCodeMsg'));
        		
	            canSave = false;        		
        	}
        }
        
        var pt_store_loc_id=part.getValue('pt_store_loc_pt.pt_store_loc_id');
        if(!valueExistsNotEmpty(pt_store_loc_id)){
        	form.fields.get('pt_store_loc_pt.pt_store_loc_id').setInvalid(getMessage('StorageLocationCodeMustBeEnteredMsg'));
        	canSave=false;
        }else{
        	if(!this.valid_ID("pt_store_loc","pt_store_loc_id",pt_store_loc_id)) {
	            form.fields.get('pt_store_loc_pt.pt_store_loc_id').setInvalid(getMessage('InvalidPartStorageLocationCodeMsg'));
        		
	            canSave = false;        		
        	}
        }

        //quantity must be filled in and valid
        var quantity = part.getValue('pt_store_loc_pt.qty_on_hand');
        if (!valueExistsNotEmpty(quantity) || Number(quantity) < 0||isNaN(quantity)) {        	
            form.fields.get('pt_store_loc_pt.qty_on_hand').setInvalid(getMessage('InvalidPartQtyMsg'));
            canSave = false;
        }          
		
        //price must be filled in and valid
		var price = part.getValue('pt_store_loc_pt.cost_unit_last');	
        if (!valueExistsNotEmpty(price)) {   
            form.fields.get('pt_store_loc_pt.cost_unit_last').setInvalid(getMessage('PartPriceMustBeEnteredMsg'));
            canSave = false;
        }
        else {
        	if (isNaN(price)) {
	            form.fields.get('pt_store_loc_pt.cost_unit_last').setInvalid(getMessage('InvalidPartPriceMsg'));
	            canSave = false;	        		
        	}
        	else {
        		if (Number(price) < 0) {
		            form.fields.get('pt_store_loc_pt.cost_unit_last').setInvalid(getMessage('InvalidPartPriceMsg'));
		            canSave = false;	        		
        		}
        	}
        }
        
        return canSave;		
	}
});

/**
 * Part code selectvalue action listener.
 * @param fieldName Fields Name.
 * @param selectValue Selected Value.
 * @param previousValue Previous Value.
 */

function partCodeSelectListener(fieldName,selectValue,previousValue){
	if(fieldName=="pt_store_loc_pt.part_id"){
		var abBldgopsAdjustInvForm=View.panels.get('addNewPartToInventory');
		
		var partId=selectValue;

		//KB#3053036 automatically set unit of issue field by selected part code.
		getUnitsIssueByPartCode(partId);

		abBldgopsAdjustInvForm.setFieldValue('pt_store_loc_pt.part_id',partId);
		
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
	
	View.panels.get('addNewPartToInventory').setFieldValue('pt.units_issue',unitIssue);
		
}