var createPurchaseOrderController=View.createController('createPurchaseOrderController',{
	partStoreLocationCode: "",
	partId: "",
	afterViewLoad: function(){
		this.PurchaseOrderCreateForm.fields.get("po.vn_id").actions.get(0).command.commands[0].beforeSelect = this.beforeSelectVnIdByPartId.createDelegate(this);
	},
	afterInitialDataFetch: function(){
		var openerView=View.getOpenerView();
		this.partStoreLocationCode=openerView.parameters['partStoreCode'];
		this.partId=openerView.parameters['partId'];
		this.setValueByPartCodeAndStoreLocInfo();
		//If multiple records exist in the PV table for the selected Part Code, then default to the record with the lowest rank that is not 0
		this.setDefaultVnIdAndOtherInfor();
		//set requestor name to default login user.
		this.setDefaultRequestorName();
	},
	
	/**
	 * KB#3051967
	 * Refilling items is not necessary whatever create new requisition or add to exsiting requisition
	 */
	resetFieldsValueAfterTabChange: function(transQty,unitCost,comments,hasExistingRecords){
		var ds=this.PurchaseOrderCreateForm.getDataSource();
		if(hasExistingRecords){
			this.PurchaseOrderCreateForm.setFieldValue('po_line.quantity',ds.formatValue('po_line.quantity',transQty,true));
			this.PurchaseOrderCreateForm.setFieldValue('po_line.unit_cost',ds.formatValue('po_line.unit_cost',unitCost,true));
			this.PurchaseOrderCreateForm.setFieldValue('po.comments',comments);
			calculateTotalCost()
		}
		
	},

	/**
	 * Set value to supply requisition edit form by part code and part storage location code
	 */
	setValueByPartCodeAndStoreLocInfo: function(){
		//Clear supply requisition form
		this.PurchaseOrderCreateForm.clear();
		
		//Set value to create supply requisition panel
		this.PurchaseOrderCreateForm.setFieldValue('po.receiving_location',this.partStoreLocationCode);
		this.PurchaseOrderCreateForm.setFieldValue('po_line.partCode',this.partId);
		this.PurchaseOrderCreateForm.setFieldValue('po_line.qtyUnderstocked',0);
		this.PurchaseOrderCreateForm.setFieldValue('po_line.quantity',0);
		this.PurchaseOrderCreateForm.setFieldValue('po_line.unit_cost',0);
		this.PurchaseOrderCreateForm.setFieldValue('po_line.totalCost',0);
		var isStoreLocExists=this.checkStorageLocationInDs(this.partStoreLocationCode);
		if(isStoreLocExists){
			this.setPartRecordByStorageLocationIdAndPartId(this.partStoreLocationCode,this.partId);
		}
		
	},
	/**
	 * set requestor name to default login user.
	 */
	setDefaultRequestorName: function(){
		var currentUser=Ab.view.View.user.employee.id;
		this.PurchaseOrderCreateForm.setFieldValue('po.em_id',currentUser);
	},
	/**
	 * Submit purchase order information
	 */
	PurchaseOrderCreateForm_onBtnSubmit: function(){
		var vnId=this.PurchaseOrderCreateForm.getFieldValue('po.vn_id');
		var receivingLoc=this.PurchaseOrderCreateForm.getFieldValue('po.receiving_location');
		var catNo=this.PurchaseOrderCreateForm.getFieldValue('po_line.catno');
		var tansQty=this.PurchaseOrderCreateForm.getFieldValue('po_line.quantity');
		var unitCost=this.PurchaseOrderCreateForm.getFieldValue('po_line.unit_cost');
		var comments=this.PurchaseOrderCreateForm.getFieldValue('po.comments');
		var acId=this.PurchaseOrderCreateForm.getFieldValue('po.ac_id');
		var poNumber=this.PurchaseOrderCreateForm.getFieldValue('po.po_number');
		var source=this.PurchaseOrderCreateForm.getFieldValue('po.source');
		var emId=this.PurchaseOrderCreateForm.getFieldValue('po.em_id');
		var isFormCanSave=this.PurchaseOrderCreateForm.canSave();
		if(isFormCanSave){
			if(valueExistsNotEmpty(receivingLoc)){
				if(!this.checkStorageLocationInDs(receivingLoc)){
					View.alert(getMessage('storageLocationMustExistsInStorageTableMsg').replace('{0}',receivingLoc));
					return;
				}
				
			}
			
			tansQty=parseFloat(tansQty);
			if(tansQty<1){
				View.alert(getMessage("transactionQuantityGreaterThanZeroMsg"));
				return;
			}
			
			var unitCost=parseFloat(unitCost);
			if(unitCost<=0){
				View.alert(getMessage("unitCostGreaterThanZeroMsg"));
				return;
			}
			//Create purchase order parameter.
			var poRecords=[];
			poRecords[0]=new Object();
			poRecords[0]['receivingLoc']=receivingLoc;
			poRecords[0]['vnId']=vnId;
			poRecords[0]['acId']=acId;
			poRecords[0]['poNumber']=poNumber;
			poRecords[0]['source']=source;
			poRecords[0]['comments']=comments;
			poRecords[0]['emId']=emId;
			
			//Do Submit
			////Create new inventory transaction record object
			var poLineRecords = [];
			
			poLineRecords[0]=new Object();
			poLineRecords[0]['po_line.catno']=catNo;
			poLineRecords[0]['po_line.quantity']=tansQty;
			poLineRecords[0]['po_line.unit_cost']=unitCost;
			poLineRecords[0]['po_line.part_id']=this.partId;
			poLineRecords[0]['po_line.description']="";
			try{
				var result=Workflow.callMethod('AbBldgOpsBackgroundData-BldgopsPartInventoryService-createNewPurchaseOrder',poRecords,poLineRecords);
				if(result.code=="executed"){
					View.getOpenerView().getOpenerView().panels.get('abBldgopsReportPartsInvertoryStorageLocationGrid').refresh();
					View.getOpenerView().getOpenerView().closeDialog();
				}
			}catch(e){
				Workflow.handleError(e);
			}
		}
		
	},
	/**
	 * Check Storage location is exists in the part storage location table.
	 * @param storagelocationcode Part storage location code
	 * @return isPtStoreLocExsits True if part storage location exists, else false
	 */
	checkStorageLocationInDs: function(storagelocationcode){
		var isPtStoreLocExsits=false;
		var ptStoreLocRes=new Ab.view.Restriction();
		ptStoreLocRes.addClause('pt_store_loc.pt_store_loc_id',storagelocationcode,'=');
		
		var ptStoreLocDs=View.dataSources.get('dialogCreatePurchaseOrderStorageLocationDs');
		
		var ptStoreLocRecord=ptStoreLocDs.getRecord(ptStoreLocRes);
		if(!ptStoreLocRecord.isNew){
			isPtStoreLocExsits=true;
		}
		
		return isPtStoreLocExsits;
	},
	/**
	 * Get part record by storage location id and part id.
	 * @param storageLocationId Storage Location Id.
	 * @param partId Part code.
	 */
	setPartRecordByStorageLocationIdAndPartId: function(storageLocationId,partId){
		var ptStorageLocationDs=View.dataSources.get('dialogCreatePurchaseOrderPtDS');
		var res=new Ab.view.Restriction();
		res.addClause('pt_store_loc_pt.pt_store_loc_id',storageLocationId,'=');
		res.addClause('pt_store_loc_pt.part_id',partId,'=');
		
		var ptRecord=ptStorageLocationDs.getRecord(res);
		
		if(!ptRecord.isNew){
			this.PurchaseOrderCreateForm.setFieldValue('po_line.partDescription',ptRecord.getValue('pt.description'));
			var qtyOnOrder=ptRecord.getValue('pt_store_loc_pt.qty_to_order');
			var unitCost=ptRecord.getValue('pt_store_loc_pt.cost_unit_std');
			if(!valueExistsNotEmpty(qtyOnOrder)){
				qtyOnOrder=0;
			}
			this.PurchaseOrderCreateForm.setFieldValue('po_line.qtyUnderstocked',ptStorageLocationDs.formatValue('pt_store_loc_pt.qty_to_order',qtyOnOrder,true));
			this.PurchaseOrderCreateForm.setFieldValue('po_line.unit_cost',ptStorageLocationDs.formatValue('pt_store_loc_pt.cost_unit_std',unitCost,true));
		}else{
			this.PurchaseOrderCreateForm.setFieldValue('po_line.qtyUnderstocked',0);
			this.PurchaseOrderCreateForm.setFieldValue('po_line.unit_cost',0);
			this.PurchaseOrderCreateForm.setFieldValue('po_line.totalCost',0);
		}
	},
	/**
	 * Click cancel button to close the dialog view form
	 */
	PurchaseOrderCreateForm_onBtnCancel: function(){
		View.getOpenerView().getOpenerView().closeDialog();
	},
	
	getCatlogNoByVnIdAndPartId: function(vnId,partId){
		var restriction = new Ab.view.Restriction();
		restriction.addClause("pv.vn_id", vnId, '=');
		restriction.addClause("pv.part_id", partId, '=');
   		var parameters = {
   			tableName: "pv",
   			fieldNames: "[pv.vn_id,pv.part_id,pv.vn_pt_num]",
   			restriction: toJSON(restriction) 
   		};     		
     	var result = Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters); 
     	var catNo="";
     	if (result.code == 'executed') {
     		if (result.data.records.length == 1){
     			if(valueExistsNotEmpty(result.data.records[0]['pv.vn_pt_num'])){
     				catNo=result.data.records[0]['pv.vn_pt_num'];
     			}else{
     				catNo=partId;
     			}
     			
     		}
     	}
     	
     	return catNo;
	},
	
	calculateTotalCost: function(quntity,unitCost){
		var totalCost=0;
		
		if(valueExistsNotEmpty(quntity)){
			if(!isNaN(quntity)){
				quntity=parseFloat(quntity);
			}
		}else{
			quntity=0;
		}
		
		if(valueExistsNotEmpty(unitCost)){
			if(!isNaN(quntity)){
				unitCost=parseFloat(unitCost);
			}
		}else{
			unitCost=0;
		}
		
		totalCost=quntity*unitCost;
		
		return totalCost.toFixed(2);
	},
	
	beforeSelectVnIdByPartId: function(command){
		var partId=this.partId;
		var selectValueRes="";
		
		selectValueRes="pv.part_id='"+partId+"'";
		
		command.dialogRestriction = selectValueRes;
	},
	
	/**
	 * If multiple records exist in the PV table for the selected Part Code, then default to the record with the lowest rank that is not 0.
	 */
	getDefaultVnId: function(){
		var vnId="";
		
		var pvDs=View.dataSources.get('pvLowestDs');
		var pvRes=new Ab.view.Restriction();
			pvRes.addClause('pv.part_id',this.partId,'=');
		
		var pvRecord=pvDs.getRecord(pvRes);
		
		if(!pvRecord.isNew){
			vnId=pvRecord.getValue('pv.vn_id');
		}
		
		return vnId;
	},
	/**
	 * Set Default Vendor code when view load.
	 */
	setDefaultVnIdAndOtherInfor: function(){
		var vnId=this.getDefaultVnId();
		if(valueExistsNotEmpty(vnId)){
			var catNo=this.getCatlogNoByVnIdAndPartId(vnId,this.partId);
			if(!valueExistsNotEmpty(catNo)){
				catNo=this.partId;
			}
			
			this.PurchaseOrderCreateForm.setFieldValue('po.vn_id',vnId);
			this.PurchaseOrderCreateForm.setFieldValue('po_line.catno',catNo);
		}
	}
	
	
});
/**
 * Vendor select value action listener.
 * 
 * @param fieldName Field name
 * @param selectValue Select value
 * @param previousValue Previous value
 */
function vnSelectListener(fieldName,selectValue,previousValue){
	if(fieldName=='po.vn_id'){
		var ptId=View.panels.get('PurchaseOrderCreateForm').getFieldValue('po_line.partCode');
		var catNo=View.controllers.get('createPurchaseOrderController').getCatlogNoByVnIdAndPartId(selectValue,ptId);
		if(!valueExistsNotEmpty(catNo)){
			catNo=ptId;
		}
		
		View.panels.get('PurchaseOrderCreateForm').setFieldValue('po.vn_id',selectValue);
		View.panels.get('PurchaseOrderCreateForm').setFieldValue('po_line.catno',catNo);
	}
}

function receivingLocSelectListener(fieldName,selectValue,previousValue){
	if(fieldName=="po.receiving_location"){
		var receivingLocation=selectValue;
		var partId=View.panels.get('PurchaseOrderCreateForm').getFieldValue('po_line.partCode');
		View.controllers.get('createPurchaseOrderController').setPartRecordByStorageLocationIdAndPartId(receivingLocation,partId);
	}
}

function calculateTotalCost(){
	var quanity=View.panels.get('PurchaseOrderCreateForm').getFieldValue('po_line.quantity');
	var unitCost=View.panels.get('PurchaseOrderCreateForm').getFieldValue('po_line.unit_cost');
	
	var totalCost=View.controllers.get('createPurchaseOrderController').calculateTotalCost(quanity,unitCost);
	var ds=View.dataSources.get('dialogCreatePurchaseOrderPtDS');
	View.panels.get('PurchaseOrderCreateForm').setFieldValue('po_line.totalCost',ds.formatValue('pt_store_loc_pt.cost_unit_std',totalCost,true));
}