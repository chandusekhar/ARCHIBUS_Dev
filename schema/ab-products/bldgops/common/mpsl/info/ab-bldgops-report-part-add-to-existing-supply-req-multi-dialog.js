var multipleAddToExsitingSupplyReqController=View.createController('multipleAddToExsitingSupplyReqController',{
	partStorageLocationFromCode: "",
	partList: [],
	
	afterViewLoad: function(){
		this.inventoryTransactionSelectedPartsPanel.sortEnabled=false;
	},
	
	afterInitialDataFetch: function(){
		var openerView=View.getOpenerView();
		if(valueExists(openerView.parameters)){
			//get storage location code from first tab.
			var tabs=openerView.panels.get('multipleSupplyReqTabs');
			var createSupplyReqTab=tabs.findTab('createMultipleSupplyReqTab');
			var partStoreLocId=createSupplyReqTab.getContentFrame().View.panels.get('inventoryTrasactionLocationPanel').getFieldValue('it.pt_store_loc_from');
			this.partList=openerView.parameters['partIdList'];
			this.afterTabSelect(partStoreLocId);
			
			var preRecords=createSupplyReqTab.getContentFrame().View.controllers.get('createMultiSupplyReqController').getSelectPartsRecords();
			this.setPreTabValueAfterTabChange(preRecords);
		}
	},
	
	afterTabSelect: function(storageLocId){
		//set storage location code to global various
		this.partStorageLocationFromCode=storageLocId;
		this.multipleExsitsSupplyReqListPanel.addParameter('fromStorageLocationRes',"(select distinct pt_store_loc_from from it where it.supply_req_id=supply_req.supply_req_id)='"+storageLocId+"'");
		this.multipleExsitsSupplyReqListPanel.refresh();
		this.setValueByPartCodeAndStoreLocInfo(storageLocId);
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
	 * This method call by supply requisition create dialog controller.
	 * Set values to current tab view grid field by pre selected tab.
	 */
	setPreTabValueAfterTabChange: function(records){
		var ds=View.dataSources.get('multipleExistPtDS');
		this.inventoryTransactionSelectedPartsPanel.gridRows.each(function(row){
			var rowIndex=row.record.index;
			var partId=row.getRecord().getValue('pt.part_id');
			var transQty=View.controllers.get('multipleAddToExsitingSupplyReqController').getTransQtyByPartId(partId,records);
			document.getElementById("row_trans_index_"+rowIndex).value=ds.formatValue('pt.qty_on_hand',transQty.toString(),true);
			var comments=View.controllers.get('multipleAddToExsitingSupplyReqController').getCommentsByPartId(partId,records);
			document.getElementById("row_comments_index_"+rowIndex).value=comments;

		});
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
	/**
	 * set form and grid field value by part code and storage location code.
	 * @param storageLocId Storage location code
	 */
	setValueByPartCodeAndStoreLocInfo: function(storageLocId){
		if(this.getExistingSupplyRequisitionListRowLength()==0){
			this.inventoryTransactionSelectedPartsPanel.show(false);
		}else{
			//Define restriction to refresh the part gird panel
			var partRes=new Ab.view.Restriction();
			if(this.partList.length>0){
				partRes.addClause('pt.part_id',this.partList,'IN');
			}
			this.inventoryTransactionSelectedPartsPanel.refresh(partRes);
			//set quantity available by storage location code
			setQuantityAvailableToRowsByPartAndStorageLocation(storageLocId);
		}
		
	},
	/**
	 * get grid row length of supply requisition grid panel.
	 */
	getExistingSupplyRequisitionListRowLength: function(){
		return this.multipleExsitsSupplyReqListPanel.gridRows.length;
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
		});
	},
	
	multipleExsitsSupplyReqListPanel_afterRefresh: function(){
		var controllerThis=this;
		this.multipleExsitsSupplyReqListPanel.gridRows.each(function(row){
			var supplyReqCheckRadio=row.actions.get('supplyReqCheckRadio');
			var index=row.record.index;
			var radioElement=document.getElementById('multipleExsitsSupplyReqListPanel_row'+index+'_supplyReqCheckRadio');
			radioElement.setAttribute("onchange", "javascript:onClickRadioButton("+index+")");
		});
		//reset the grid footer message after grid refresh.
		this.multipleExsitsSupplyReqListPanel.setFooter(getMessage('noMoreRecordToDisplayMsg'));
	},
	
	inventoryTransactionSelectedPartsPanel_onBtnSubmit: function(){
		var selectedRowIndex=this.multipleExsitsSupplyReqListPanel.selectedRowIndex;
		if(selectedRowIndex==-1){
			View.alert(getMessage('mustSelectARowMsg'));
			return;
		}
		var selectedRowRecord=this.multipleExsitsSupplyReqListPanel.gridRows.get(selectedRowIndex).getRecord();
		var supplyReqId=selectedRowRecord.getValue('supply_req.supply_req_id');
		
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
			//Check Quantity Number Validate
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
		//Do Add to existing supply requisition by supply requisition code.
		try{
			var result=Workflow.callMethod('AbBldgOpsBackgroundData-BldgopsPartInventoryService-addPartsToExistingSupplyReq',supplyReqId,itRecords);
			if(result.code=="executed"){
				View.getOpenerView().getOpenerView().panels.get('partInventoryListPanel').refresh();
				//Close dialog window 
				View.getOpenerView().getOpenerView().closeDialog();
			}
		}catch(e){
			Workflow.handleError(e);
		}
	},
	
	inventoryTransactionSelectedPartsPanel_onBtnCancel: function(){
		View.getOpenerView().getOpenerView().closeDialog();
	}
});

/**
 * Click radio button
 */
function onClickRadioButton(rowIndex){
	var selectRow=View.panels.get('multipleExsitsSupplyReqListPanel').gridRows.get(rowIndex);
	var selectedRowRecord=selectRow.getRecord();
	var ptStoreLocId=selectedRowRecord.getValue('supply_req.fromStorageLocation');
	var partList=multipleAddToExsitingSupplyReqController.partList;
	setQuantityAvailableToRowsByPartAndStorageLocation(ptStoreLocId);
}

/**
 * Set quantity available to row record by storage location code and part code.
 * 
 * @param ptStoreLocId Storage location code
 */
function setQuantityAvailableToRowsByPartAndStorageLocation(ptStoreLocId){
	var ptStorageLocationDs=View.dataSources.get('createMultiSupplyReqPartLocDs');
	
	//get Quantity Available from part storage location table by part storage location code and the array list of parts code
	//multipleAddToExsitingSupplyReqController.showSelectedRowsByParameterValue();
	View.panels.get('inventoryTransactionSelectedPartsPanel').gridRows.each(function(row){
		
		var partCode=row.getRecord().getValue('pt.part_id');
		var ptStoreRes=new Ab.view.Restriction();
		ptStoreRes.addClause('pt_store_loc_pt.pt_store_loc_id',ptStoreLocId,'=');
		ptStoreRes.addClause('pt_store_loc_pt.part_id',partCode,'=');
		
		var ptStoreRecord=ptStorageLocationDs.getRecord(ptStoreRes);
		var qtyAvailable=0;
		if(!ptStoreRecord.isNew){
			qtyAvailable=ptStoreRecord.getValue('pt_store_loc_pt.qty_on_hand');
		}
		
		row.cells.items[2].dom.innerHTML=ptStorageLocationDs.formatValue('pt_store_loc_pt.qty_on_hand',qtyAvailable,true);
	});
}