var createMultiSupplyReqController=View.createController('createMultiSupplyReqController',{
	partStorageLocationFromCode: "",
	partList: [],
	//open select store location selectvalue field from 'it.pt_store_loc_from' or 'it.pt_store_loc_to'
	selectStoreLocType:"",
	
	afterViewLoad: function(){
		this.inventoryTransactionSelectedPartsPanel.sortEnabled=false;
	},
	afterInitialDataFetch: function(){
		var openerView=View.getOpenerView();
		if(valueExists(openerView.parameters)){
			var storageLocId=openerView.parameters['partStoreCode'];
			this.partList=openerView.parameters['partIdList'];
			//Clear inventory transaction form
			this.inventoryTrasactionLocationPanel.clear();
			this.setValueByPartCodeAndStoreLocInfo(storageLocId);
		}
		
	},
	/**
	 * This method call by supply requisition create dialog controller.
	 * Set values to current tab view grid field by pre selected tab.
	 */
	setPreTabValueAfterTabChange: function(records,hasExistingRecors){
		if(hasExistingRecors){
			var ds=View.dataSources.get('ptDs');
			this.inventoryTransactionSelectedPartsPanel.gridRows.each(function(row){
				var rowIndex=row.record.index;
				var partId=row.getRecord().getValue('pt.part_id');
				var transQty=View.controllers.get('createMultiSupplyReqController').getTransQtyByPartId(partId,records);
				document.getElementById("row_trans_index_"+rowIndex).value=ds.formatValue('pt.qty_on_hand',transQty.toString(),true);
				var comments=View.controllers.get('createMultiSupplyReqController').getCommentsByPartId(partId,records);
				document.getElementById("row_comments_index_"+rowIndex).value=comments;

			});
		}
		
	},
	/**
	 * Get transfer quantity from records by part code.
	 */
	getTransQtyByPartId: function(partId,records){
		var transQty=0;
		for(var i=0;i<records.length;i++){
			var transPartId=records[i]['it.part_id'];
			if(partId==transPartId){
				transQty=records[i]['it.trans_quantity'];
				break;
			}
		}
		
		return transQty;
	},
	/**
	 * Get comments from records by part code.
	 */
	getCommentsByPartId: function(partId,records){
		var comments=0;
		for(var i=0;i<records.length;i++){
			var transPartId=records[i]['it.part_id'];
			if(partId==transPartId){
				comments=records[i]['it.comments'];
				break;
			}
		}
		
		return comments;
	},
	
	getSelectPartsRecords: function(){
		//Create new inventory transaction record object
		var itRecords = [];
		var arrayIndex=0;
		this.inventoryTransactionSelectedPartsPanel.gridRows.each(function(row){
			var rowIndex=row.record.index;
			itRecords[arrayIndex]=new Object();
			itRecords[arrayIndex]['it.part_id']=row.getRecord().getValue('pt.part_id');
			itRecords[arrayIndex]['it.trans_quantity']=replaceLocalizedDecimalSeparatorByDot(document.getElementById("row_trans_index_"+rowIndex).value);
			itRecords[arrayIndex]['it.comments']=document.getElementById("row_comments_index_"+rowIndex).value;
			arrayIndex++;
		});
		
		return itRecords;
	},
	/**
	 * Set form value by storage location code.
	 */
	setValueByPartCodeAndStoreLocInfo: function(storageLocId){
		this.partStorageLocationFromCode=storageLocId;
		//Define restriction to refresh the part gird panel
		var partRes=new Ab.view.Restriction();
		var ds=View.dataSources.get('ptDs');
		if(valueExistsNotEmpty(this.partStorageLocationFromCode)){
			
			this.inventoryTrasactionLocationPanel.setFieldValue('it.pt_store_loc_from',this.partStorageLocationFromCode);
		}
		if(this.partList.length>0){
			partRes.addClause('pt.part_id',this.partList,'IN');
		}
		this.inventoryTransactionSelectedPartsPanel.refresh(partRes);
		this.inventoryTransactionSelectedPartsPanel.gridRows.each(function(row){
			var ptId=row.getRecord().getValue('pt.part_id');
			var qtyOnHand=View.controllers.get('createMultiSupplyReqController').getQtyByStoreLocIdAndPartId(storageLocId,ptId);
			row.cells.items[2].dom.innerHTML=ds.formatValue('pt.qty_on_hand',qtyOnHand,true);
		});
	},
	/**
	 * Get Quantity value from storage location
	 */
	getQtyByStoreLocIdAndPartId: function(storeLocId,partId){
		var qtyOnHand=0;
		var res=new Ab.view.Restriction();
		res.addClause('pt_store_loc_pt.pt_store_loc_id',storeLocId,'=');
		res.addClause('pt_store_loc_pt.part_id',partId,'=');
		
		var ptStoreDs=View.dataSources.get('createMultiSupplyReqPartLocDs');
		var record= ptStoreDs.getRecord(res);
		if(!record.isNew){
			qtyOnHand=record.getValue('pt_store_loc_pt.qty_on_hand');
		}
		
		return qtyOnHand;
	},
	/**
	 * Create text input when gird after refresh
	 */
	inventoryTransactionSelectedPartsPanel_afterRefresh: function(){
		
		this.inventoryTransactionSelectedPartsPanel.gridRows.each(function(row){
			var rowIndex=row.record.index;
			var TransferQtycellDom=row.cells.items[3].dom;
			TransferQtycellDom.innerHTML="<input type='text' id='row_trans_index_"+rowIndex+"' style='width: 80px;'/>";
			
			var TransferCommentscellDom=row.cells.items[4].dom;
			TransferCommentscellDom.innerHTML="<input type='text' id='row_comments_index_"+rowIndex+"' style='width:150px'/>";
		})
	},
	/**
	 * Submit supply requisition information
	 */
	inventoryTrasactionLocationPanel_onBtnSubmit: function(){
		var storageLocationTo=this.inventoryTrasactionLocationPanel.getFieldValue('it.pt_store_loc_to');
		var storageLocationFrom=this.partStorageLocationFromCode;
		var supplyReqComments=this.inventoryTrasactionLocationPanel.getFieldValue('it.comments');
		//Check To Storage Location
		if(valueExistsNotEmpty(storageLocationTo)){
			if(storageLocationFrom==storageLocationTo){
				View.alert(getMessage("storageLocationNameNotSameMsg"));
				return;
			}
		}else{
			View.alert(getMessage('storageLocationToNotEmptyMsg'));
			return;
		}
		
		//Check part row's transaction quantity,not empty and must be a number type
		var qtyTransactionCheckResult=true;
		//Check transfer quantity allow not greater than Quantity Available.
		var qtyLessThanAvailableCheckResult=true;
		
		this.inventoryTransactionSelectedPartsPanel.gridRows.each(function(row){
			var rowIndex=row.record.index;
			var qtyAvailable=replaceLocalizedDecimalSeparatorByDot(row.cells.items[2].dom.innerHTML);
			if(valueExistsNotEmpty(qtyAvailable)){
				qtyAvailable=parseFloat(qtyAvailable);
			}else{
				qtyAvailable=0;
			}
			var transQuantity=replaceLocalizedDecimalSeparatorByDot(document.getElementById("row_trans_index_"+rowIndex).value);
			if(!valueExistsNotEmpty(transQuantity)){
				qtyTransactionCheckResult=false;
			}else{
				var isNaNCheck=isNaN(transQuantity);
				if(isNaNCheck){
					qtyTransactionCheckResult=false;
				}else{
					var tansQty=parseFloat(transQuantity);
					if(tansQty<=0){
						qtyTransactionCheckResult=false;
					}else{
						if(tansQty>qtyAvailable){
							qtyLessThanAvailableCheckResult=false;
						}
					}
				}
			}
		});
		
		if(!qtyTransactionCheckResult){
			View.alert(getMessage('transactionQuantityGreaterThanZeroMsg'));
			return;
		}
		
		if(!qtyLessThanAvailableCheckResult){
			View.alert(getMessage('doNotTransferMoreThanAvailableMsg'));
			return;
		}
		//Do Submit
		//Create new inventory transaction record object
		var itRecords = [];
		var arrayIndex=0;
		this.inventoryTransactionSelectedPartsPanel.gridRows.each(function(row){
			var rowIndex=row.record.index;
			itRecords[arrayIndex]=new Object();
			itRecords[arrayIndex]['it.part_id']=row.getRecord().getValue('pt.part_id');
			itRecords[arrayIndex]['it.trans_quantity']=replaceLocalizedDecimalSeparatorByDot(document.getElementById("row_trans_index_"+rowIndex).value);
			itRecords[arrayIndex]['it.comments']=document.getElementById("row_comments_index_"+rowIndex).value;
			arrayIndex++;
		});
		
		try{
			var result=Workflow.callMethod('AbBldgOpsBackgroundData-BldgopsPartInventoryService-createSupplyReq',storageLocationFrom,storageLocationTo,supplyReqComments,itRecords);
			if(result.code=="executed"){
				View.getOpenerView().getOpenerView().panels.get('partInventoryListPanel').refresh();
				View.getOpenerView().getOpenerView().closeDialog();
			}
		}catch(e){
			Workflow.handleError(e);
		}
		
	},
	inventoryTrasactionLocationPanel_onBtnCancel: function(){
		View.getOpenerView().getOpenerView().closeDialog();
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
		
		var ptStoreLocDs=View.dataSources.get('createMultiSupplyReqStorageDs');
		
		var ptStoreLocRecord=ptStoreLocDs.getRecord(ptStoreLocRes);
		if(!ptStoreLocRecord.isNew){
			isPtStoreLocExsits=true;
		}
		
		return isPtStoreLocExsits;
	},
	
	/**
	 * From Storage Location Dialog
	 */
	openStorageLocFromSelectValueDialog: function(storeLocField){
		var fieldTitle=this.inventoryTrasactionLocationPanel.fields.get(storeLocField).fieldDef.title;
		
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
	
	selectStorageLocationFromSelectValueDialog: function(){
		var selectIndex=this.storageLocationDialog.selectedRowIndex;
		var selectRowRecord=this.storageLocationDialog.gridRows.get(selectIndex).getRecord();
		var storageLocId=selectRowRecord.getValue('pt_store_loc.pt_store_loc_id');
		if(this.selectStoreLocType=='it.pt_store_loc_from'){
			this.inventoryTrasactionLocationPanel.setFieldValue('it.pt_store_loc_from',storageLocId);
			//Re-set form value
			View.controllers.get('createMultiSupplyReqController').setValueByPartCodeAndStoreLocInfo(storageLocId);
		}else{
			this.inventoryTrasactionLocationPanel.setFieldValue('it.pt_store_loc_to',storageLocId);
		}
		this.storageLocationDialog.closeWindow();
	}
});