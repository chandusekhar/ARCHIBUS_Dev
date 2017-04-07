var createMultiSupplyReqController=View.createController('createMultiSupplyReqController',{
	partStorageLocationFromCode: "",
	partList: [],
	afterViewLoad: function(){
		this.inventoryTransactionSelectedPartsPanel.sortEnabled=false;
		
		this.inventoryTrasactionLocationPanel.fields.get("po.vn_id").actions.get(0).command.commands[0].beforeSelect = this.beforeSelectVnIdByPartsId.createDelegate(this);
		
	},
	afterInitialDataFetch: function(){
		var openerView=View.getOpenerView();
		if(valueExists(openerView.parameters)){
			this.partStorageLocationFromCode=openerView.parameters['partStoreCode'];
			this.partList=openerView.parameters['partIdList'];
			//Clear inventory transaction form
			this.inventoryTrasactionLocationPanel.clear();
			
			//Define restriction to refresh the part gird panel
			var partRes=new Ab.view.Restriction();
			
			if(valueExistsNotEmpty(this.partStorageLocationFromCode)){
				partRes.addClause('pt_store_loc_pt.pt_store_loc_id',this.partStorageLocationFromCode,'=');
				
				this.inventoryTrasactionLocationPanel.setFieldValue('po.receiving_location',this.partStorageLocationFromCode);
			}
			
			if(this.partList.length>0){
				partRes.addClause('pt_store_loc_pt.part_id',this.partList,'IN');
			}
			
			this.inventoryTransactionSelectedPartsPanel.refresh(partRes);
			
			this.setDafaultValueByReceivingLocation();
			
			//If multiple records exist in the PV table for the selected Part Code, then default to the record with the lowest rank that is not 0
			this.setDefaultVnIdAndOtherInfor();
			//set requestor name to default login user.
			this.setDefaultRequestorName();
			
		}
	},
	/**
	 * This method call by supply requisition create dialog controller.
	 * Set values to current tab view grid field by pre selected tab.
	 */
	setPreTabValueAfterTabChange: function(records,hasExistingRecors){
		if(hasExistingRecors){
			var ptLocds=View.dataSources.get('createMultiSupplyReqPartLocDs');
			var poDs=View.dataSources.get('poLineDs');
			this.inventoryTransactionSelectedPartsPanel.gridRows.each(function(row){
				var rowIndex=row.record.index;
				var partId=row.getRecord().getValue('pt_store_loc_pt.part_id');
				var transQuantity=View.controllers.get('createMultiSupplyReqController').getTransQtyByPartId(partId,records);
				document.getElementById("row_trans_index_"+rowIndex).value=poDs.formatValue('po_line.quantity',transQuantity,true);
				var unitCost=View.controllers.get('createMultiSupplyReqController').getUnitCostByPartId(partId,records);
				document.getElementById("row_unitCost_index_"+rowIndex).value=ptLocds.formatValue('pt_store_loc_pt.qty_on_hand',unitCost,true);
				var description=View.controllers.get('createMultiSupplyReqController').getCommentsByPartId(partId,records);
				document.getElementById("row_Description_index_"+rowIndex).value=description;
				calculateTotalCost(rowIndex);
			});
		}
		
	},
	/**
	 * Get transfer quantity from records by part code.
	 */
	getTransQtyByPartId: function(partId,records){
		var transQty=0;
		for(var i=0;i<records.length;i++){
			var transPartId=records[i]['po_line.part_id'];
			if(partId==transPartId){
				transQty=records[i]['po_line.quantity'];
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
			var transPartId=records[i]['po_line.part_id'];
			if(partId==transPartId){
				comments=records[i]['po_line.description'];
				break;
			}
		}
		
		return comments;
	},
	/**
	 * Get unit cost from records by part code.
	 */
	getUnitCostByPartId: function(partId,records){
		var unitCost=0;
		for(var i=0;i<records.length;i++){
			var transPartId=records[i]['po_line.part_id'];
			if(partId==transPartId){
				unitCost=records[i]['po_line.unit_cost'];
				break;
			}
		}
		
		return unitCost;
	},
	
	/**
	 * Get selected parts record.
	 */
	getSelectPartsRecords: function(){
		//Create new inventory transaction record object
		//Do Submit
		//Create new inventory transaction record object
		var poLineRecords = [];
		var arrayIndex=0;
		this.inventoryTransactionSelectedPartsPanel.gridRows.each(function(row){
			var rowIndex=row.record.index;
			poLineRecords[arrayIndex]=new Object();
			var partId=row.getRecord().getValue('pt_store_loc_pt.part_id');
			var transQuantity=replaceLocalizedDecimalSeparatorByDot(document.getElementById("row_trans_index_"+rowIndex).value);
			var unitCost=replaceLocalizedDecimalSeparatorByDot(document.getElementById("row_unitCost_index_"+rowIndex).value);
			var description=document.getElementById("row_Description_index_"+rowIndex).value;
			poLineRecords[arrayIndex]['po_line.quantity']=parseFloat(transQuantity);
			poLineRecords[arrayIndex]['po_line.unit_cost']=parseFloat(unitCost);
			poLineRecords[arrayIndex]['po_line.part_id']=partId;
			poLineRecords[arrayIndex]['po_line.description']=description;

			arrayIndex++;
		});
		
		return poLineRecords;
	},
	/**
	 * set default form value by receiving location.
	 */
	setDafaultValueByReceivingLocation: function(){
		var storageLocId=View.controllers.get('createMultiSupplyReqController').partStorageLocationFromCode;
		var ds=View.dataSources.get('createMultiSupplyReqPartLocDs');
		this.inventoryTransactionSelectedPartsPanel.gridRows.each(function(row){
			var rowIndex=row.record.index;
			var partId=row.getRecord().getValue('pt_store_loc_pt.part_id');
			
			var unitCost=View.controllers.get('createMultiSupplyReqController').getUnitCostByStorageLocationAndPartId(storageLocId,partId);
			document.getElementById("row_unitCost_index_"+rowIndex).value=ds.formatValue('pt_store_loc_pt.qty_on_hand',unitCost,true);
			document.getElementById("row_trans_index_"+rowIndex).value=0;
			document.getElementById('row_totalCost_index_'+rowIndex).innerHTML=0;
		});
	},
	/**
	 * set requestor name to default login user.
	 */
	setDefaultRequestorName: function(){
		var currentUser=Ab.view.View.user.employee.id;
		this.inventoryTrasactionLocationPanel.setFieldValue('po.em_id',currentUser);
	},
	
	getUnitCostByStorageLocationAndPartId: function(storageLocId,partId){
		var unitCost=0;
		var ptStorageLocationDs=View.dataSources.get('createMultiSupplyReqPartLocDs');
		var res=new Ab.view.Restriction();
		res.addClause('pt_store_loc_pt.pt_store_loc_id',storageLocId,'=');
		res.addClause('pt_store_loc_pt.part_id',partId,'=');  
		
		var ptRecord=ptStorageLocationDs.getRecord(res);
		
		if(!ptRecord.isNew){
			unitCost=ptRecord.getValue('pt_store_loc_pt.cost_unit_std');
		}
		
		return unitCost;
	},
	/**
	 * Create text input when gird after refresh
	 */
	inventoryTransactionSelectedPartsPanel_afterRefresh: function(){
		
		this.inventoryTransactionSelectedPartsPanel.gridRows.each(function(row){
			var rowIndex=row.record.index;
			var catLogNumcellDom=row.cells.items[2].dom;
			catLogNumcellDom.innerHTML="<span id='row_catLogNum_index_"+rowIndex+"'/>";
			var TransferQtycellDom=row.cells.items[4].dom;
			TransferQtycellDom.innerHTML="<input type='text' id='row_trans_index_"+rowIndex+"' style='width: 80px;'/>";
			document.getElementById("row_trans_index_"+rowIndex).setAttribute("onchange", "javascript:calculateTotalCost("+rowIndex+")");;
			
			var UnitCostcellDom=row.cells.items[5].dom;
			UnitCostcellDom.innerHTML="<input type='text' id='row_unitCost_index_"+rowIndex+"' style='width: 80px;'/>";
			document.getElementById("row_unitCost_index_"+rowIndex).setAttribute("onchange", "javascript:calculateTotalCost("+rowIndex+")");
			
			var totalCostcellDom=row.cells.items[6].dom;
			totalCostcellDom.innerHTML="<span id='row_totalCost_index_"+rowIndex+"' style='width: 20px;align: left'/>";
			var DescriptioncellDom=row.cells.items[7].dom;
			DescriptioncellDom.innerHTML="<input type='text' id='row_Description_index_"+rowIndex+"' style='width:100px'/>";
		})
	},
	/**
	 * Submit supply requisition information
	 */
	inventoryTrasactionLocationPanel_onBtnSubmit: function(){
		var vnId=this.inventoryTrasactionLocationPanel.getFieldValue('po.vn_id');
		var receivingLocationCode=this.inventoryTrasactionLocationPanel.getFieldValue("po.receiving_location");
		var poComments=this.inventoryTrasactionLocationPanel.getFieldValue('po.comments');
		var acId=this.inventoryTrasactionLocationPanel.getFieldValue('po.ac_id');
		var poComments=this.inventoryTrasactionLocationPanel.getFieldValue('po.comments');
		var poNumber=this.inventoryTrasactionLocationPanel.getFieldValue('po.po_number');
		var source=this.inventoryTrasactionLocationPanel.getFieldValue('po.source');
		var emId=this.inventoryTrasactionLocationPanel.getFieldValue('po.em_id');
		var isFormCanSave=this.inventoryTrasactionLocationPanel.canSave();
		if(isFormCanSave){
			//Check To Storage Location
			if(valueExistsNotEmpty(receivingLocationCode)){
				if(!this.checkStorageLocationInDs(receivingLocationCode)){
					View.alert(getMessage('storageLocationMustExistsInStorageTableMsg').replace('{0}',receivingLocationCode));
					return;
				}
				
			}
			
			//Check part row's transaction quantity and unit cost field,not empty and must be a number type
			var qtyTransactionCheckResult=true;
			var unitCostCheckResult=true;
			this.inventoryTransactionSelectedPartsPanel.gridRows.each(function(row){
				var rowIndex=row.record.index;
				var transQuantity=replaceLocalizedDecimalSeparatorByDot(document.getElementById("row_trans_index_"+rowIndex).value);
				var unitCost=replaceLocalizedDecimalSeparatorByDot(document.getElementById("row_unitCost_index_"+rowIndex).value);
				if(!valueExistsNotEmpty(transQuantity)){
					qtyTransactionCheckResult=false;
				}else{
					var isNaNCheck=isNaN(transQuantity);
					if(isNaNCheck){
						qtyTransactionCheckResult=false;
					}else{
						if(!isInt(transQuantity)){
							qtyTransactionCheckResult=false;
						}else{
							var tansQty=parseFloat(transQuantity);
							if(tansQty<=0){
								qtyTransactionCheckResult=false;
							}
						}
						
					}
				}
				
				if(!valueExistsNotEmpty(unitCost)){
					unitCostCheckResult=false;
				}else{
					var isNaNCheck=isNaN(unitCost);
					if(isNaNCheck){
						unitCostCheckResult=false;
					}else{
						var unitCost=parseFloat(unitCost);
						if(unitCost<=0){
							unitCostCheckResult=false;
						}
					}
				}
			});
			
			if(!qtyTransactionCheckResult){
				View.alert(getMessage('transactionQuantityGreaterThanZeroMsg'));
				return;
			}
			
			if(!unitCostCheckResult){
				View.alert(getMessage('unitCostGreaterThanZeroMsg'));
				return;
			}
			
			//Create purchase order parameter.
			var poRecords=[];
			poRecords[0]=new Object();
			poRecords[0]['receivingLoc']=receivingLocationCode;
			poRecords[0]['vnId']=vnId;
			poRecords[0]['acId']=acId;
			poRecords[0]['poNumber']=poNumber;
			poRecords[0]['source']=source;
			poRecords[0]['comments']=poComments;
			poRecords[0]['emId']=emId;
			
			//Do Submit
			//Create new inventory transaction record object
			var poLineRecords = [];
			var arrayIndex=0;
			this.inventoryTransactionSelectedPartsPanel.gridRows.each(function(row){
				var rowIndex=row.record.index;
				poLineRecords[arrayIndex]=new Object();
				var partId=row.getRecord().getValue('pt_store_loc_pt.part_id');
				var transQuantity=replaceLocalizedDecimalSeparatorByDot(document.getElementById("row_trans_index_"+rowIndex).value);
				var unitCost=replaceLocalizedDecimalSeparatorByDot(document.getElementById("row_unitCost_index_"+rowIndex).value);
				var description=document.getElementById("row_Description_index_"+rowIndex).value;
				poLineRecords[arrayIndex]['po_line.catno']=View.controllers.get('createMultiSupplyReqController').getCatlogNoByVnIdAndPartId(vnId,partId);
				poLineRecords[arrayIndex]['po_line.quantity']=parseFloat(transQuantity);
				poLineRecords[arrayIndex]['po_line.unit_cost']=parseFloat(unitCost);
				poLineRecords[arrayIndex]['po_line.part_id']=partId;
				poLineRecords[arrayIndex]['po_line.description']=description;

				arrayIndex++;
			});
			
			try{
				var result=Workflow.callMethod('AbBldgOpsBackgroundData-BldgopsPartInventoryService-createNewPurchaseOrder',poRecords,poLineRecords);
				if(result.code=="executed"){
					View.getOpenerView().getOpenerView().panels.get('partInventoryListPanel').refresh();
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
		
		var ptStoreLocDs=View.dataSources.get('createMultiSupplyReqStorageDs');
		
		var ptStoreLocRecord=ptStoreLocDs.getRecord(ptStoreLocRes);
		if(!ptStoreLocRecord.isNew){
			isPtStoreLocExsits=true;
		}
		
		return isPtStoreLocExsits;
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
     	var catNo='';
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
	
	/**
	 * Click cancel button to close the dialog view form
	 */
	inventoryTrasactionLocationPanel_onBtnCancel: function(){
		View.getOpenerView().getOpenerView().closeDialog();
	},
	
	beforeSelectVnIdByPartsId: function(command){
		
		
		var selectValueRes="1=0";
		var pvRecords=this.getPvRecords();
		if(pvRecords.length>0){
			for(var m=0;m<pvRecords.length;m++){
				var vnId=pvRecords[m].getValue('pv.vnId');
				selectValueRes+=" or vn.vn_id='"+vnId+"'";
			}
		}

		command.dialogRestriction = selectValueRes;
	},
	
	getPvRecords: function(){
		var partIdList=this.partList;
		
		var vnDsParameter="1=0";
		
		for(var i=0;i<partIdList.length;i++){
			var partId=partIdList[i];
			if(i==0){
				vnDsParameter="";
				vnDsParameter+=" part_id='"+partId+"' "
			}else{
				vnDsParameter+=" intersect "
				vnDsParameter+=" select distinct vn_id as vnId from pv where part_id='"+partId+"'"
			}
		}
		
		View.dataSources.get('vnDs').addParameter('pvRes',vnDsParameter);
		
		var pvRecords=View.dataSources.get('vnDs').getRecords();
		
		return pvRecords;
	},
	
	
	/**
	 * If multiple records exist in the PV table for the selected Part Code, then default to the record with the lowest rank that is not 0.
	 */
	getDefaultVnId: function(){
		var vnId="";
		
		
		var pvRecords=this.getPvRecords();
		var selectValueRes="1=0";
		if(pvRecords.length>0){
			for(var m=0;m<pvRecords.length;m++){
				var vnId=pvRecords[m].getValue('pv.vnId');
				selectValueRes+=" or pv.vn_id='"+vnId+"'";
			}
		}
		
		this.pvLowestDs.addParameter('pvParameter',selectValueRes);

		var pvRecord=this.pvLowestDs.getRecord();
		
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
			this.inventoryTrasactionLocationPanel.setFieldValue('po.vn_id',vnId);
			View.panels.get('inventoryTransactionSelectedPartsPanel').gridRows.each(function(row){
				var rowIndex=row.record.index;
				var partId=row.getRecord().getValue('pt_store_loc_pt.part_id');
				
				var catLogNumber=View.controllers.get('createMultiSupplyReqController').getCatlogNoByVnIdAndPartId(vnId,partId);
				
				if(!valueExistsNotEmpty(catLogNumber)){
					catLogNumber=partId;
				}
				
				document.getElementById('row_catLogNum_index_'+rowIndex).innerHTML=catLogNumber;
			});
		}
	}
});


function calculateTotalCost(rowIndex){
	var ds=View.dataSources.get('createMultiSupplyReqPartLocDs');
	var quanity=replaceLocalizedDecimalSeparatorByDot(document.getElementById("row_trans_index_"+rowIndex).value);
	var unitCost=replaceLocalizedDecimalSeparatorByDot(document.getElementById("row_unitCost_index_"+rowIndex).value);
	
	var totalCost=View.controllers.get('createMultiSupplyReqController').calculateTotalCost(quanity,unitCost);
	
	document.getElementById('row_totalCost_index_'+rowIndex).innerHTML=ds.formatValue('pt_store_loc_pt.cost_unit_std',totalCost,true);
	
}

/**
 * Vendor select value action listener.
 * 
 * @param fieldName Field name
 * @param selectValue Select value
 * @param previousValue Previous value
 */
function vnSelectListener(fieldName,selectValue,previousValue){
	if(fieldName=='po.vn_id'){
		View.panels.get('inventoryTrasactionLocationPanel').setFieldValue('po.vn_id',selectValue);
		View.panels.get('inventoryTransactionSelectedPartsPanel').gridRows.each(function(row){
			var rowIndex=row.record.index;
			var partId=row.getRecord().getValue('pt_store_loc_pt.part_id');
			
			var catLogNumber=View.controllers.get('createMultiSupplyReqController').getCatlogNoByVnIdAndPartId(selectValue,partId);
			
			if(!valueExistsNotEmpty(catLogNumber)){
				catLogNumber=partId;
			}
			
			document.getElementById('row_catLogNum_index_'+rowIndex).innerHTML=catLogNumber;
		});
	}
}

function isInt(str){
	var reg = /^(-|\+)?\d+$/ ;
	return reg.test(str);
}