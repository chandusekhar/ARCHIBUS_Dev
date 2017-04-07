var dialogAddExistingSupplyController=View.createController('dialogAddExistingSupplyController',{
	partStoreLocationCode: "",
	partId: "",
	afterInitialDataFetch: function(){
		var openerView=View.getOpenerView();
		var tabs=openerView.panels.get('SupplyReqTabs');
		var createSupplyReqTab=tabs.findTab('createSupplyReqTab');
		//get storage location from first tab.
		var ptStoreLocId= createSupplyReqTab.getContentFrame().View.panels.get('SupplyRequisitionCreateForm').getFieldValue('it.pt_store_loc_from');
		this.partId=openerView.parameters['partId'];
		//after tab selected
		this.afterTabSelect(ptStoreLocId);
		//reset fields value after tab changed.
		var transQty=createSupplyReqTab.getContentFrame().View.panels.get('SupplyRequisitionCreateForm').getFieldValue('it.trans_quantity');
		var comments=createSupplyReqTab.getContentFrame().View.panels.get('SupplyRequisitionCreateForm').getFieldValue('it.comments');
		this.resetFieldsValueAfterTabChange(transQty,comments);
	},
	/**
	 * re-filter existing supply requisition grid by From Storage Location field value of first tab. 
	 */
	afterTabSelect: function(storageLocId){
		//set storage location code and part code.
		this.partStoreLocationCode=storageLocId;
		//only display all supply requisition of selected From Storage Location.
		this.exsitsSupplyReqListPanel.addParameter('fromStorageLocationRes',"(select distinct pt_store_loc_from from it where it.supply_req_id=supply_req.supply_req_id)='"+storageLocId+"'");
		this.exsitsSupplyReqListPanel.refresh();
		//If supply requisition grid row length is 0, then hidden the form panel.
		if(this.getExistingSupplyRequisitionListRowLength()==0){
			this.existsSupplyReqTransForm.show(false);
		}else{
			this.existsSupplyReqTransForm.show(true);
			this.setValueByPartCodeAndStoreLocInfo(storageLocId,this.partId);
		}
	},
	/**
	 * KB#3051967
	 * Refilling items is not necessary whatever create new requisition or add to exsiting requisition
	 */
	resetFieldsValueAfterTabChange: function(transQty,comments){ 
		if(this.getExistingSupplyRequisitionListRowLength()>0){
			var ds=View.dataSources.get('dialogCreateSupplyReqPtDS');
			this.existsSupplyReqTransForm.setFieldValue('it.trans_quantity',ds.formatValue('pt_store_loc_pt.qty_on_hand',transQty,true));
			this.existsSupplyReqTransForm.setFieldValue('it.comments',comments);
		}
	},
	
	/**
	 * Set value to supply requisition edit form by part code and part storage location code
	 */
	setValueByPartCodeAndStoreLocInfo: function(storeLocId,partId){
		//Clear supply requisition form
		this.existsSupplyReqTransForm.clear();
		
		//Set value to create supply requisition panel
		var supplyReqPtDs=View.dataSources.get('dialogCreateSupplyReqPtDS');
		var res=new Ab.view.Restriction();
		res.addClause('pt_store_loc_pt.pt_store_loc_id',storeLocId,'=');
		res.addClause('pt_store_loc_pt.part_id',partId,'=');
		
		var supplyRecord=supplyReqPtDs.getRecord(res);
		if(!supplyRecord.isNew){
			var description=supplyRecord.getValue('pt.description');
			var qtyOnHand=supplyRecord.getValue('pt_store_loc_pt.qty_on_hand');

			this.existsSupplyReqTransForm.setFieldValue('it.part_id',partId);
			this.existsSupplyReqTransForm.setFieldValue('pt.description',description);
			this.existsSupplyReqTransForm.setFieldValue('pt.qty_on_hand',supplyReqPtDs.formatValue('pt_store_loc_pt.qty_on_hand',qtyOnHand,true));
			
		}
	},
	/**
	 * get grid row length of supply requisition grid panel.
	 */
	getExistingSupplyRequisitionListRowLength: function(){
		return this.exsitsSupplyReqListPanel.gridRows.length;
	},
	/**
	 * Submit
	 */
	existsSupplyReqTransForm_onBtnSubmit: function(){
		var selectedSupplyReqRowIndex=this.exsitsSupplyReqListPanel.selectedRowIndex;
		if(selectedSupplyReqRowIndex==-1){
			View.alert(getMessage('mustSelectAtLeastOneSupplyReqRowMsg'));
			return;
		}
		
		//Save a new record to Inventory Transfer table
		var selectedRowRecord=this.exsitsSupplyReqListPanel.gridRows.get(selectedSupplyReqRowIndex).getRecord();
		var supplyReqId=selectedRowRecord.getValue('supply_req.supply_req_id');
		var tansQty=this.existsSupplyReqTransForm.getFieldValue('it.trans_quantity');
		var qtyAvailable=this.existsSupplyReqTransForm.getFieldValue('pt.qty_on_hand');
		if(valueExistsNotEmpty(qtyAvailable)){
			qtyAvailable=parseFloat(qtyAvailable);
		}else{
			qtyAvailable=0;
		}
		var comments=this.existsSupplyReqTransForm.getFieldValue('it.comments');
		//Check Transfer Quantity field is number type and greater than 0
		var isQtyNaN=isNaN(parseFloat(tansQty));
		if(isQtyNaN){
			View.alert(getMessage('qtyTransferMustBeNumberTypeMsg'));
			return;
		}else{
			tansQty=parseFloat(tansQty);
			if(tansQty<=0){
				View.alert(getMessage("transactionQuantityGreaterThanZeroMsg"));
				return;
			}else{
				if(tansQty>qtyAvailable){
					View.alert(getMessage("doNotTransferMoreThanAvailableMsg"));
					return;
				}
			}
		}

		var itRecords = [];
		
		itRecords[0]=new Object();
		itRecords[0]['it.part_id']=this.partId;
		itRecords[0]['it.trans_quantity']=tansQty;
		itRecords[0]['it.comments']=comments;
		
		
		try{
			var result=Workflow.callMethod('AbBldgOpsBackgroundData-BldgopsPartInventoryService-addPartsToExistingSupplyReq',supplyReqId,itRecords);
			if(result.code=="executed"){
				View.getOpenerView().getOpenerView().panels.get('abBldgopsReportPartsInvertoryStorageLocationGrid').refresh();
				View.getOpenerView().getOpenerView().closeDialog();
			}
		}catch(e){
			Workflow.handleError(e);
		}
		
		
	},
	/**
	 * Click cancel button, and close dialog view
	 */
	existsSupplyReqTransForm_onBtnCancel: function(){
		View.getOpenerView().getOpenerView().closeDialog();
	},
	
	getDescriptionByPartId: function(partId){
		var description="";
		//get part information from part table
		var ptDs=View.dataSources.get('dialogExistSupplyReqPtDs');
		var ptRes=new Ab.view.Restriction();
		ptRes.addClause('pt.part_id',partId,'=');
		var ptRecord=ptDs.getRecord(ptRes);
		description=ptRecord.getValue('pt.description');
		return description;
	},
	/**
	 * reset the grid footer message after grid refresh.
	 */
	exsitsSupplyReqListPanel_afterRefresh: function(){
		this.exsitsSupplyReqListPanel.setFooter(getMessage('noMoreRecordToDisplayMsg'));
	}
	
});