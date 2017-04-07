var addToExistPurchaseOrderMultipleController=View.createController('addToExistPurchaseOrderMultipleController',{
	partStorageLocationFromCode: "",
	partList: [],
	afterViewLoad: function(){
		this.inventoryTransactionSelectedPartsPanel.sortEnabled=false;
	},
	afterInitialDataFetch: function(){
		var openerView=View.getOpenerView();
		if(valueExists(openerView.parameters)){
			this.partStorageLocationFromCode=openerView.parameters['partStoreCode'];
			this.partList=openerView.parameters['partIdList'];

			
			//Define restriction to refresh the part gird panel
			var partRes=new Ab.view.Restriction();
			
			
			partRes.addClause('pt_store_loc_pt.pt_store_loc_id',this.partStorageLocationFromCode,'=');
			if(this.partList.length>0){
				partRes.addClause('pt_store_loc_pt.part_id',this.partList,'IN');
			}
			
			this.inventoryTransactionSelectedPartsPanel.refresh(partRes);
			var vnParam=this.getVnIdArrayResByPartsId();
			this.existsPurchaseOrdersList.addParameter('vnParamemter',vnParam);
			this.existsPurchaseOrdersList.addParameter('receivingLocationRes', "po.receiving_location='"+this.partStorageLocationFromCode+"'");
			this.existsPurchaseOrdersList.refresh();
			if(this.getExistingPurchaseOrderListRowLength()==0){
				this.inventoryTransactionSelectedPartsPanel.show(false);
			}else{
				this.setDafaultValueByReceivingLocation();
			}
		}
		
		var tabs=openerView.panels.get('PurchaseOrderMultipleTabs');
		var createPoTab=tabs.findTab('createPurchaseOrderMultiTab');
		var preRecords=createPoTab.getContentFrame().View.controllers.get('createMultiSupplyReqController').getSelectPartsRecords();
		this.setPreTabValueAfterTabChange(preRecords);
		
	},
	/**
	 * This method call by supply requisition create dialog controller.
	 * Set values to current tab view grid field by pre selected tab.
	 */
	setPreTabValueAfterTabChange: function(records){
		var ptLocDs=View.dataSources.get('createMultiSupplyReqPartLocDs');
		var poDs=View.dataSources.get('poLineDs');
		this.inventoryTransactionSelectedPartsPanel.gridRows.each(function(row){
			var rowIndex=row.record.index;
			var partId=row.getRecord().getValue('pt_store_loc_pt.part_id');
			var transQuantity=View.controllers.get('addToExistPurchaseOrderMultipleController').getTransQtyByPartId(partId,records);
			document.getElementById("row_trans_index_"+rowIndex).value=poDs.formatValue('po_line.quantity',transQuantity,true);
			var unitCost=View.controllers.get('addToExistPurchaseOrderMultipleController').getUnitCostByPartId(partId,records);
			document.getElementById("row_unitCost_index_"+rowIndex).value=ptLocDs.formatValue('pt_store_loc_pt.qty_on_hand',unitCost,true);
			var description=View.controllers.get('addToExistPurchaseOrderMultipleController').getCommentsByPartId(partId,records);
			document.getElementById("row_Description_index_"+rowIndex).value=description;
			
			calculateTotalCost(rowIndex);

		});
		
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
	 * Get unit cost by part code.
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
	 * get grid row length of purchase order grid panel.
	 */
	getExistingPurchaseOrderListRowLength: function(){
		return this.existsPurchaseOrdersList.gridRows.length;
	},
	
	setDafaultValueByReceivingLocation: function(){
		var storageLocId=View.controllers.get('addToExistPurchaseOrderMultipleController').partStorageLocationFromCode;
		var ds=View.dataSources.get('createMultiSupplyReqPartLocDs');
		this.inventoryTransactionSelectedPartsPanel.gridRows.each(function(row){
			var rowIndex=row.record.index;
			var partId=row.getRecord().getValue('pt_store_loc_pt.part_id');
			
			var unitCost=View.controllers.get('addToExistPurchaseOrderMultipleController').getUnitCostByStorageLocationAndPartId(storageLocId,partId);
			document.getElementById("row_unitCost_index_"+rowIndex).value=ds.formatValue('pt_store_loc_pt.qty_on_hand',unitCost,true);
			document.getElementById("row_trans_index_"+rowIndex).value=0;
			document.getElementById('row_totalCost_index_'+rowIndex).innerHTML=0;
		});
	},
	/**
	 * Get unit cost by storage location and part.
	 * 
	 * @param storageLocId Storage location code.
	 * @param partId Part Code.
	 * @return unitCost Unit cost.
	 */
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
			catLogNumcellDom.innerHTML="<span id='row_catLogNum_index_"+rowIndex+"' style='width: 80px;'/>";
			var TransferQtycellDom=row.cells.items[4].dom;
			TransferQtycellDom.innerHTML="<input type='text' id='row_trans_index_"+rowIndex+"' style='width: 80px;'/>";
			document.getElementById("row_trans_index_"+rowIndex).setAttribute("onchange", "javascript:calculateTotalCost("+rowIndex+")");;
			
			var UnitCostcellDom=row.cells.items[5].dom;
			UnitCostcellDom.innerHTML="<input type='text' id='row_unitCost_index_"+rowIndex+"' style='width: 80px;'/>";
			document.getElementById("row_unitCost_index_"+rowIndex).setAttribute("onchange", "javascript:calculateTotalCost("+rowIndex+")");
			
			var totalCostcellDom=row.cells.items[6].dom;
			totalCostcellDom.innerHTML="<span id='row_totalCost_index_"+rowIndex+"' style='width: 80px;'/>";
			var DescriptioncellDom=row.cells.items[7].dom;
			DescriptioncellDom.innerHTML="<input type='text' id='row_Description_index_"+rowIndex+"' style='width:100px'/>";
		})
	},
	/**
	 * Submit purchase order information
	 */
	inventoryTransactionSelectedPartsPanel_onBtnSubmit: function(){
		
		var selectedRowIndex=this.existsPurchaseOrdersList.selectedRowIndex;
		
		
		if(selectedRowIndex==-1){
			View.alert(getMessage('mustSelectARowMsg'));
			return;
		}
		var selectedRowRecord=this.existsPurchaseOrdersList.gridRows.get(selectedRowIndex).getRecord();
		var poId=selectedRowRecord.getValue('po.po_id');
			poId=parseInt(poId);
		var vnId=selectedRowRecord.getValue('po.vn_id');
		
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
			poLineRecords[arrayIndex]['po_line.catno']=View.controllers.get('addToExistPurchaseOrderMultipleController').getCatlogNoByVnIdAndPartId(vnId,partId);
			poLineRecords[arrayIndex]['po_line.quantity']=parseFloat(transQuantity);
			poLineRecords[arrayIndex]['po_line.unit_cost']=parseFloat(unitCost);
			poLineRecords[arrayIndex]['po_line.part_id']=partId;
			poLineRecords[arrayIndex]['po_line.description']=description;

			arrayIndex++;
		});
		
		try{
			var result=Workflow.callMethod('AbBldgOpsBackgroundData-BldgopsPartInventoryService-addToExistingPurchaseOrder',poId,vnId,poLineRecords);
			if(result.code=="executed"){
				View.getOpenerView().getOpenerView().panels.get('partInventoryListPanel').refresh();
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
		
		var ptStoreLocDs=View.dataSources.get('createMultiSupplyReqStorageDs');
		
		var ptStoreLocRecord=ptStoreLocDs.getRecord(ptStoreLocRes);
		if(!ptStoreLocRecord.isNew){
			isPtStoreLocExsits=true;
		}
		
		return isPtStoreLocExsits;
	},
	/**
	 * Get Catlog Number by Vendor Code and Part Code from pv table.
	 * @param vnId Vendor code
	 * @param partId Part Code
	 * @return catNo Catlog Number.
	 */
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
	/**
	 * Calculate total cost by Quantity and Unit Cost.
	 * Total Cost = Quantity * Unit Cost
	 * 
	 * @param quantity Quantity
	 * @param unitCost Unit Cost
	 * 
	 */
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
			unitCost=0.00;
		}
		
		totalCost=quntity*unitCost;
		
		return totalCost.toFixed(2);
	},
	
	/**
	 * Click cancel button to close the dialog view form
	 */
	inventoryTransactionSelectedPartsPanel_onBtnCancel: function(){
		View.getOpenerView().getOpenerView().closeDialog();
	},
	/**
	 * Get vendor restriction by selected part list.
	 */
	getVnIdArrayResByPartsId: function(){
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
		
		var selectValueRes="1=0";
		
		for(var m=0;m<pvRecords.length;m++){
			var vnId=pvRecords[m].getValue('pv.vnId');
			selectValueRes+=" or po.vn_id='"+vnId+"'";
		}
		
		return selectValueRes;
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
	}
	
	
});
/**
 * After click radio button to re-set catlog number field by selected Vendor Code and Part Code of every row.
 * @param rowIndex Grid row index.
 */
function onClickRadioButton(rowIndex){
	var vnId=View.panels.get('existsPurchaseOrdersList').gridRows.get(rowIndex).getRecord().getValue('po.vn_id');
	
	View.panels.get('inventoryTransactionSelectedPartsPanel').gridRows.each(function(row){
		var rowIndex=row.record.index;
		var partId=row.getRecord().getValue('pt_store_loc_pt.part_id');
		var catLogNum=View.controllers.get('addToExistPurchaseOrderMultipleController').getCatlogNoByVnIdAndPartId(vnId,partId);
		if(!valueExistsNotEmpty(catLogNum)){
			catLogNum=partId;
		}
		
		document.getElementById('row_catLogNum_index_'+rowIndex).innerHTML=catLogNum;
		
	});
}
/**
 * Calculate total cost of every row record and set value to Total Cost field element.
 * 
 * @param rowIndex Grid Row index.
 */
function calculateTotalCost(rowIndex){
	var ds=View.dataSources.get('createMultiSupplyReqPartLocDs');
	var quanity=replaceLocalizedDecimalSeparatorByDot(document.getElementById("row_trans_index_"+rowIndex).value);
	var unitCost=replaceLocalizedDecimalSeparatorByDot(document.getElementById("row_unitCost_index_"+rowIndex).value);
	
	var totalCost=View.controllers.get('addToExistPurchaseOrderMultipleController').calculateTotalCost(quanity,unitCost);
	
	document.getElementById('row_totalCost_index_'+rowIndex).innerHTML=ds.formatValue('pt_store_loc_pt.cost_unit_std',totalCost,true);
	
}

function isInt(str){
	var reg = /^(-|\+)?\d+$/ ;
	return reg.test(str);
}
