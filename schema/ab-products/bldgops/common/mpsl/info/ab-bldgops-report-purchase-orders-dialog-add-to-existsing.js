var createPurchaseOrderController=View.createController('createPurchaseOrderController',{
	partStoreLocationCode: "",
	partId: "",
	selectedRowOrderValue: 0,
	afterViewLoad: function(){
		
	},
	afterInitialDataFetch: function(){
		var openerView=View.getOpenerView();
		
		this.partStoreLocationCode=openerView.parameters['partStoreCode'];
		this.partId=openerView.parameters['partId'];
		this.setValueByPartCodeAndStoreLocInfo();
		this.refreshPurchaseOrderList();
		if(valueExistsNotEmpty(this.partStoreLocationCode)&&valueExistsNotEmpty(this.partId)){
			this.setPartRecordByStorageLocationIdAndPartId(this.partStoreLocationCode,this.partId);
		}
		//if purchase order grid rows length is 0, then hidden form panel.
		if(this.getExistingPurchaseOrderListRowLength()==0){
			this.PurchaseOrderCreateForm.show(false);
		}
		
		var tabs=openerView.panels.get('PurchaseOrderTabs');
		var createPoTab=tabs.findTab('createPurchaseOrderTab');
		var purchaseOrderForm=createPoTab.getContentFrame().View.panels.get('PurchaseOrderCreateForm');
		var transQty=purchaseOrderForm.getFieldValue('po_line.quantity');
		var unitCost=purchaseOrderForm.getFieldValue('po_line.unit_cost');
		var comments=purchaseOrderForm.getFieldValue('po.comments');
		this.resetFieldsValueAfterTabChange(transQty,unitCost,comments);
	},
	
	/**
	 * KB#3051967
	 * Refilling items is not necessary whatever create new requisition or add to exsiting requisition
	 */
	resetFieldsValueAfterTabChange: function(transQty,unitCost,comments){
		var ds=this.PurchaseOrderCreateForm.getDataSource();
		if(this.getExistingPurchaseOrderListRowLength()>0){
			this.PurchaseOrderCreateForm.setFieldValue('po_line.quantity',ds.formatValue('po_line.quantity',transQty,true));
			this.PurchaseOrderCreateForm.setFieldValue('po_line.unit_cost',ds.formatValue('po_line.unit_cost',unitCost,true));
			this.PurchaseOrderCreateForm.setFieldValue('po.comments',comments);
		}
		calculateTotalCost()
	},
	/**
	 * get grid row length of purchase order grid panel.
	 */
	getExistingPurchaseOrderListRowLength: function(){
		return this.existsPurchaseOrdersList.gridRows.length;
	},
	/**
	 * Set value to supply requisition edit form by part code and part storage location code
	 */
	setValueByPartCodeAndStoreLocInfo: function(){
		//Clear supply requisition form
		this.PurchaseOrderCreateForm.clear();
		
		this.PurchaseOrderCreateForm.setFieldValue('po_line.partCode',this.partId);
		this.PurchaseOrderCreateForm.setFieldValue('po_line.qtyUnderstocked',0);
		this.PurchaseOrderCreateForm.setFieldValue('po_line.quantity',0);
		this.PurchaseOrderCreateForm.setFieldValue('po_line.unit_cost',0);
		this.PurchaseOrderCreateForm.setFieldValue('po_line.totalCost',0);
		this.PurchaseOrderCreateForm.setFieldValue('po_line.updatedtotalCost',0);
		var isStoreLocExists=this.checkStorageLocationInDs(this.partStoreLocationCode);
		if(isStoreLocExists){
			this.setPartRecordByStorageLocationIdAndPartId(this.partStoreLocationCode,this.partId);
			
		}
		
	},
	refreshPurchaseOrderList: function(){
		var partStorageLocation=this.partStoreLocationCode;
		var partId=this.partId;
		var poRes="1=0";
		if(valueExistsNotEmpty(partStorageLocation)&&valueExistsNotEmpty(partId)){
			poRes="po.receiving_location='"+partStorageLocation+"' and po.vn_id in (select vn_id from pv where pv.part_id='"+partId+"')"
		}
		this.existsPurchaseOrdersList.addParameter('poRes',poRes);
		this.existsPurchaseOrdersList.refresh();
	},
	/**
	 * Submit purchase order information
	 */
	PurchaseOrderCreateForm_onBtnSubmit: function(){
		var selectedRowIndex=this.existsPurchaseOrdersList.selectedRowIndex;
		if(selectedRowIndex==-1){
			View.alert(getMessage('mustSelectARowMsg'));
			return;
		}
		var selectedRowRecord=this.existsPurchaseOrdersList.gridRows.get(selectedRowIndex).getRecord();
		var poId=selectedRowRecord.getValue('po.po_id');
			poId=parseInt(poId);
		var vnId=selectedRowRecord.getValue('po.vn_id');
		
		var receivingLoc=this.PurchaseOrderCreateForm.getFieldValue('po.receiving_location');
		var catNo=this.PurchaseOrderCreateForm.getFieldValue('po_line.catno');
		var tansQty=this.PurchaseOrderCreateForm.getFieldValue('po_line.quantity');
		var unitCost=this.PurchaseOrderCreateForm.getFieldValue('po_line.unit_cost');
		var comments=this.PurchaseOrderCreateForm.getFieldValue('po.comments');
		var isFormCanSave=this.PurchaseOrderCreateForm.canSave();
		if(isFormCanSave){
			
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
			
			//Do Submit
			////Create new inventory transaction record object
			var poLineRecords = [];
			
			poLineRecords[0]=new Object();
			poLineRecords[0]['po_line.catno']=catNo;
			poLineRecords[0]['po_line.quantity']=tansQty;
			poLineRecords[0]['po_line.unit_cost']=unitCost;
			poLineRecords[0]['po_line.part_id']=this.partId;
			poLineRecords[0]['po_line.description']=comments;
			try{
				var result=Workflow.callMethod('AbBldgOpsBackgroundData-BldgopsPartInventoryService-addToExistingPurchaseOrder',poId,vnId,poLineRecords);
				if(result.code=="executed"){
					View.getOpenerView().getOpenerView().panels.get('abBldgopsReportPartsInvertoryStorageLocationGrid').refresh();
					View.getOpenerView().getOpenerView().closeDialog();
				}
			}catch(e){
				Workflow.handleError(e);
			}
		}
		
	},
	existsPurchaseOrdersList_afterRefresh: function(){
		var controllerThis=this;
		this.existsPurchaseOrdersList.gridRows.each(function(row){
			var poCheckRadio=row.actions.get('poCheckRadio');
			var index=row.record.index;
			var radioElement=document.getElementById('existsPurchaseOrdersList_row'+index+'_poCheckRadio');
			radioElement.setAttribute("onchange", "javascript:onClickRadioButton("+index+")");
		});
		//reset the grid footer message after grid refresh.
		this.existsPurchaseOrdersList.setFooter(getMessage('noMoreRecordToDisplayMsg'));
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
	}
	
	
});

function onClickRadioButton(rowIndex){
	var vnId=View.panels.get('existsPurchaseOrdersList').gridRows.get(rowIndex).getRecord().getValue('po.vn_id');
	
	var ptId=View.panels.get('PurchaseOrderCreateForm').getFieldValue('po_line.partCode');
	var catNo=View.controllers.get('createPurchaseOrderController').getCatlogNoByVnIdAndPartId(vnId,ptId);
	if(!valueExistsNotEmpty(catNo)){
		catNo=ptId;
	}
	
	View.panels.get('PurchaseOrderCreateForm').setFieldValue('po_line.catno',catNo);
	
	//calculate updated total 
	var orderValue=View.panels.get('existsPurchaseOrdersList').gridRows.get(rowIndex).getRecord().getValue('po.orderValue');

	var totalCost=View.panels.get('PurchaseOrderCreateForm').getFieldValue('po_line.totalCost');
	
	if(valueExistsNotEmpty(orderValue)){
		orderValue=parseFloat(orderValue);
	}else{
		orderValue=0;
	}
	View.controllers.get('createPurchaseOrderController').selectedRowOrderValue=orderValue;
	
	if(valueExistsNotEmpty(totalCost)){
		totalCost=parseFloat(totalCost);
	}else{
		totalCost=0;
	}
	
	var updatedTotalCost=(orderValue+totalCost).toFixed(2);
	var ds=View.dataSources.get('dialogCreatePurchaseOrderPtDS');
	View.panels.get('PurchaseOrderCreateForm').setFieldValue('po_line.updatedtotalCost',ds.formatValue('pt_store_loc_pt.cost_unit_std',updatedTotalCost,true));
}


function calculateTotalCost(){
	var quanity=View.panels.get('PurchaseOrderCreateForm').getFieldValue('po_line.quantity');
	var unitCost=View.panels.get('PurchaseOrderCreateForm').getFieldValue('po_line.unit_cost');
	var ds=View.dataSources.get('dialogCreatePurchaseOrderPtDS');
	var totalCost=View.controllers.get('createPurchaseOrderController').calculateTotalCost(quanity,unitCost);

	View.panels.get('PurchaseOrderCreateForm').setFieldValue('po_line.totalCost',ds.formatValue('pt_store_loc_pt.cost_unit_std',totalCost,true));
	
	var selectedOrderValue=View.controllers.get('createPurchaseOrderController').selectedRowOrderValue;
	
	var updatedTotalCost=(parseFloat(totalCost)+parseFloat(selectedOrderValue)).toFixed(2);
	
	View.panels.get('PurchaseOrderCreateForm').setFieldValue('po_line.updatedtotalCost',ds.formatValue('pt_store_loc_pt.cost_unit_std',updatedTotalCost,true));
}