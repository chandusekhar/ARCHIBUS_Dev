var parInventoryMpiwDialogCreateSupplyReqController=View.createController('parInventoryMpiwDialogCreateSupplyReqController',{
	partStoreLocationCode: "",
	partId: "",
	//open select store location selectvalue field from 'it.pt_store_loc_from' or 'it.pt_store_loc_to'
	selectStoreLocType:"",
	
	afterInitialDataFetch: function(){
		var openerView=View.getOpenerView();
		var tabs=openerView.panels.get('SupplyReqTabs');
		var partStoreLocId=openerView.parameters['partStoreCode'];
		this.partId=openerView.parameters['partId'];
		this.setValueByPartCodeAndStoreLocInfo(partStoreLocId);
	},
	
	/**
	 * KB#3051967
	 * Refilling items is not necessary whatever create new requisition or add to exsiting requisition
	 */
	resetFieldsValueAfterTabChange: function(transQty,comments,hasExistingRecords){
		if(hasExistingRecords){
			var ds=View.dataSources.get('dialogCreateSupplyReqPtDS');
			this.SupplyRequisitionCreateForm.setFieldValue('it.trans_quantity',ds.formatValue('pt_store_loc_pt.qty_on_hand',transQty,true));
			this.SupplyRequisitionCreateForm.setFieldValue('it.comments',comments);
		}
		
	},
	
	SupplyRequisitionCreateForm_afterRefresh: function(){
		this.setValueByPartCodeAndStoreLocInfo(this.partStoreLocationCode);
	},
	/**
	 * Set value to supply requisition edit form by part code and part storage location code
	 */
	setValueByPartCodeAndStoreLocInfo: function(storageLocId){
		
		this.partStoreLocationCode=storageLocId;
		//Clear supply requisition form
		this.SupplyRequisitionCreateForm.clear();
		
		//Set value to create supply requisition panel
		var supplyReqPtDs=View.dataSources.get('dialogCreateSupplyReqPtDS');
		var res=new Ab.view.Restriction();
		res.addClause('pt_store_loc_pt.pt_store_loc_id',storageLocId,'=');
		res.addClause('pt_store_loc_pt.part_id',this.partId,'=');
		
		var supplyRecord=supplyReqPtDs.getRecord(res);
		if(!supplyRecord.isNew){
			var description=supplyRecord.getValue('pt.description');
			var qtyOnHand=supplyRecord.getValue('pt_store_loc_pt.qty_on_hand');

			this.SupplyRequisitionCreateForm.setFieldValue('it.pt_store_loc_from',storageLocId);
			this.SupplyRequisitionCreateForm.setFieldValue('it.part_id',this.partId);
			this.SupplyRequisitionCreateForm.setFieldValue('pt.description',description);
			this.SupplyRequisitionCreateForm.setFieldValue('pt.qty_on_hand',supplyReqPtDs.formatValue('pt_store_loc_pt.qty_on_hand',qtyOnHand,true));
			this.SupplyRequisitionCreateForm.setFieldValue('it.trans_quantity',0);
		}
	},
	/**
	 * Submit supply requisition information
	 */
	SupplyRequisitionCreateForm_onBtnSubmit: function(){
		var storageLocationFrom=this.SupplyRequisitionCreateForm.getFieldValue('it.pt_store_loc_from');
		var storageLocationTo=this.SupplyRequisitionCreateForm.getFieldValue('it.pt_store_loc_to');
		var partId=this.SupplyRequisitionCreateForm.getFieldValue('it.part_id');
		var tansQty=this.SupplyRequisitionCreateForm.getFieldValue('it.trans_quantity');
		var qtyAvailable=this.SupplyRequisitionCreateForm.getFieldValue('pt.qty_on_hand');
		if(valueExistsNotEmpty(qtyAvailable)){
			qtyAvailable=parseFloat(qtyAvailable);
		}else{
			qtyAvailable=0;
		}
		var comments=this.SupplyRequisitionCreateForm.getFieldValue('it.comments');
		if(!valueExistsNotEmpty(storageLocationFrom)){
			View.alert(getMessage("storageLocationFromNotEmptyMsg"));
			return;
		}
		if(valueExistsNotEmpty(storageLocationTo)){
			if(storageLocationFrom==storageLocationTo){
				View.alert(getMessage("storageLocationNameNotSameMsg"));
				return;
			}
		}else{
			View.alert(getMessage('storageLocationToNotEmptyMsg'));
			return;
		}
		
		if(valueExistsNotEmpty(tansQty)){
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
						View.alert(getMessage('doNotTransferMoreThanAvailableMsg'));
						return;
					}	
				}
				
				
			}
			
		}else{
			View.alert(getMessage("transactionQuantityGreaterThanZeroMsg"));
			return;
		}
		
		
		
		//Do Submit
		////Create new inventory transaction record object
		var itRecords = [];
		
		itRecords[0]=new Object();
		itRecords[0]['it.part_id']=partId;
		itRecords[0]['it.trans_quantity']=tansQty;
		itRecords[0]['it.comments']=comments;
		try{
			var result=Workflow.callMethod('AbBldgOpsBackgroundData-BldgopsPartInventoryService-createSupplyReq',storageLocationFrom,storageLocationTo,comments,itRecords);
			if(result.code=="executed"){
				View.getOpenerView().getOpenerView().panels.get('abBldgopsReportPartsInvertoryStorageLocationGrid').refresh();
				View.getOpenerView().getOpenerView().closeDialog();
			}
		}catch(e){
			Workflow.handleError(e);
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
		
		var ptStoreLocDs=View.dataSources.get('dialogCreateSupplyReqStorageLocationDs');
		
		var ptStoreLocRecord=ptStoreLocDs.getRecord(ptStoreLocRes);
		if(!ptStoreLocRecord.isNew){
			isPtStoreLocExsits=true;
		}
		
		return isPtStoreLocExsits;
	},
	/**
	 * Click cancel button to close the dialog view form
	 */
	SupplyRequisitionCreateForm_onBtnCancel: function(){
		View.getOpenerView().getOpenerView().closeDialog();
	},
	/**
	 * show From Storage Location Dialog to implement location field (Building Code-Floor Code-Room Code)
	 */
	openStorageLocFromSelectValueDialog: function(storeLocField){
		var fieldTitle=this.SupplyRequisitionCreateForm.fields.get(storeLocField).fieldDef.title;
		//KB#3053343 Select Value- From Storage Location should only give storages that have part code
		if(storeLocField=='it.pt_store_loc_from'){
			this.storageLocationDialog.addParameter('fromStorageLocParam',"pt_store_loc.pt_store_loc_id in (select distinct pt_store_loc_id from pt_store_loc_pt where part_id='"+this.partId+"')");
		}else{
			this.storageLocationDialog.addParameter('fromStorageLocParam','1=1');
		}
		this.storageLocationDialog.showInWindow({
			modal:true,
			width:600,
			height:400,
			title: getMessage('selectValueDialogTitle')+"-"+fieldTitle
		});
		var restriction=new Ab.view.Restriction();
		this.storageLocationDialog.clearAllFilterValues();
		this.storageLocationDialog.refresh(restriction);
		
		this.selectStoreLocType=storeLocField;
	},
	/**
	 * select storage location code from From Storage Location field dialog panel.
	 */
	selectStorageLocationFromSelectValueDialog: function(){
		var selectIndex=this.storageLocationDialog.selectedRowIndex;
		var selectRowRecord=this.storageLocationDialog.gridRows.get(selectIndex).getRecord();
		
		var storageLocId=selectRowRecord.getValue('pt_store_loc.pt_store_loc_id');
		
		if(this.selectStoreLocType=='it.pt_store_loc_from'){
			this.SupplyRequisitionCreateForm.setFieldValue('it.pt_store_loc_from',storageLocId);
			//Re-set form value
			View.controllers.get('parInventoryMpiwDialogCreateSupplyReqController').setValueByPartCodeAndStoreLocInfo(storageLocId);
		}else{
			this.SupplyRequisitionCreateForm.setFieldValue('it.pt_store_loc_to',storageLocId);
		}

		this.storageLocationDialog.closeWindow();
	}
});