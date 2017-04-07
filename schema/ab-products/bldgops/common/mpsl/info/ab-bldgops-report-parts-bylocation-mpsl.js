var partByLocationMpiwController=View.createController('partByLocationMpiwController',{
	//Get console form record when click Show button in the console form
	consoleRecord: null,
	//Get understocked field's check status.
	isUnderstockedChecked: false,
	//Get part storage location code when click part storage location list rows link.
	ptStorageLocationcode: "",
	
	selectedPartCodeArray: [],
	afterInitialDataFetch: function(){
		//Disable Quantity Avaliable default value
		var qtyOnHandFieldElement=this.consoleForm.fields.get('pt_store_loc_pt.qty_on_hand');
		qtyOnHandFieldElement.fieldDef.defaultValue='';
	},
	/**
	 * Event handler when click Show button in console form
	 */
	consoleForm_onBtnShow: function(){
		//Get console form record
		this.consoleRecord=this.consoleForm.getRecord();
		
		var partId=this.consoleForm.getFieldValue('pt.part_id');
		var partClass=this.consoleForm.getFieldValue('pt.class');
		var partStoreLocId=this.consoleForm.getFieldValue('pt_store_loc.pt_store_loc_id');
		var siteId=this.consoleForm.getFieldValue('pt_store_loc.site_id');
		var quantityAvaliable=this.consoleForm.getFieldValue('pt_store_loc_pt.qty_on_hand');
		
		var vnCode=this.consoleForm.getFieldValue('pt_store_loc_pt.vnCode');
		
		this.isUnderstockedChecked=document.getElementById('understockedCheckbox').checked;

		//Define a parameter to get part storage location by part information.
		var consoleParameter="1=1";
		//Set parameter by console form field value.
		if(valueExistsNotEmpty(partId)){
			consoleParameter +=" and pt_store_loc.pt_store_loc_id in (select pt_store_loc_id from pt_store_loc_pt where pt_store_loc_pt.part_id='"+partId+"')";
		}
		if(valueExistsNotEmpty(partClass)){
			consoleParameter +=" and pt_store_loc.pt_store_loc_id in (select pt_store_loc_id from pt_store_loc_pt where pt_store_loc_pt.part_id in (select part_id from pt where pt.class='"+partClass+"'))";
		}
		if(valueExistsNotEmpty(partStoreLocId)){
			consoleParameter +=" and pt_store_loc.pt_store_loc_id='"+partStoreLocId+"'";
		}
		if(valueExistsNotEmpty(siteId)){
			consoleParameter +=" and pt_store_loc.site_id='"+siteId+"'";
		}
		if(valueExistsNotEmpty(quantityAvaliable)){
			consoleParameter +=" and pt_store_loc.pt_store_loc_id in (select pt_store_loc_id from pt_store_loc_pt where pt_store_loc_pt.qty_on_hand >="+quantityAvaliable+")";
		}
		if(valueExistsNotEmpty(vnCode)){
			consoleParameter +=" and pt_store_loc.pt_store_loc_id in (select pt_store_loc_id from pt_store_loc_pt where pt_store_loc_pt.part_id in (select part_id from pv where pv.vn_id='"+vnCode+"'))"
		}
		//If understock checkbox is checked,then select storage location where Quantity Understocked >0
		if(this.isUnderstockedChecked){
			consoleParameter +=" and pt_store_loc.pt_store_loc_id in (select pt_store_loc_id from pt_store_loc_pt where pt_store_loc_pt.qty_to_order>0)";
		}
		
		this.partStorageLocationListPanel.addParameter('consoleParameter',consoleParameter);
		this.partInventoryListPanel.show(false);
		this.partStorageLocationListPanel.refresh();
		
	},
	/**
	 * Show parts inventory list by storage location
	 */
	showPartsInventoryByStorageLocation: function(){
		var selectRowIndex=this.partStorageLocationListPanel.selectedRowIndex;
		var selectRowRecord=this.partStorageLocationListPanel.gridRows.get(selectRowIndex).getRecord();
		var ptStoreLocId=selectRowRecord.getValue('pt_store_loc.pt_store_loc_id');
		var vnCode=this.consoleForm.getFieldValue('pt_store_loc_pt.vnCode');
		
		this.showPartInventory(ptStoreLocId,vnCode);
	},
	/**
	 * Show part by storage location and vendor.
	 * @param ptStoreLocId Storage Location code
	 * @param vnCode Vendor Code.
	 */
	showPartInventory: function(ptStoreLocId,vnCode){
		//Set part storage location code to controller variable.
		this.ptStorageLocationcode=ptStoreLocId;
		var ptRes=new Ab.view.Restriction();
		//Get field from  console form record
		var partId="";//part code
		var partClass="";//part classification
		var quantityAvaliable=""; // quantity available
		if(valueExistsNotEmpty(this.consoleRecord)){
			partId=this.consoleRecord.getValue('pt.part_id');
			partClass=this.consoleRecord.getValue('pt.class');
			quantityAvaliable=this.consoleRecord.getValue('pt_store_loc_pt.qty_on_hand');
			
		}
		//Define part inventory list parameter
		var ptParameter="1=1";
		//Set parameter by console form field value
		if(valueExistsNotEmpty(ptStoreLocId)){
			ptParameter+=" and pt_store_loc_pt.pt_store_loc_id='"+ptStoreLocId+"'";
		}
		if(valueExistsNotEmpty(partId)){
			ptParameter+=" and pt_store_loc_pt.part_id='"+partId+"'";
		}
		if(valueExistsNotEmpty(partClass)){
			ptParameter+=" and pt_store_loc_pt.part_id in (select part_id from pt where pt.class='"+partClass+"')";
		}
		if(valueExistsNotEmpty(quantityAvaliable)){
			ptParameter+=" and pt_store_loc_pt.qty_on_hand>="+quantityAvaliable+"";
		}
		if(valueExistsNotEmpty(vnCode)){
			ptParameter+=" and pt_store_loc_pt.part_id in (select part_id from pv where pv.vn_id='"+vnCode+"')";
		}
		if(this.isUnderstockedChecked){
			ptParameter +=" and pt_store_loc_pt.qty_to_order>0";
		}
		this.partInventoryListPanel.addParameter('ptParameter',ptParameter);
		this.partInventoryListPanel.show(true);
		this.partInventoryListPanel.refresh();
		//Set part inventory list panel's title by part storage location code
		this.partInventoryListPanel.setTitle(getMessage('partInventoryTitle').replace('{0}',ptStoreLocId));
	},
	
	partInventoryListPanel_afterRefresh: function(){
		this.partInventoryListPanel.setTitle(getMessage('partInventoryTitle').replace('{0}',this.ptStorageLocationcode));
	},
	/**
	 * Clear console form
	 */
	consoleForm_onBtnClear: function(){
		this.consoleForm.clear();
		document.getElementById('understockedCheckbox').checked=false;
		//filter should automatically run when the user clicks the Clear button
		this.consoleForm_onBtnShow();
		
	},
	/**
	 * Click Update physical count button
	 */
	partInventoryListPanel_onBtnUpdatePhsicalCount: function(){
		var selectRowRecords=this.partInventoryListPanel.getSelectedRecords();
		
		if(selectRowRecords.length<1){
			View.alert(getMessage('mustSelectARowMsg'));
			return;
		}
		//Reset selected part code array
		this.selectedPartCodeArray=[];
		for(var i=0;i<selectRowRecords.length;i++){
			var record=selectRowRecords[i];
			var partId=record.getValue('pt_store_loc_pt.part_id');
			this.selectedPartCodeArray.push(partId);
		}
		this.physicalQtyEditPanel.showInWindow({
			x: 400,
			y: 300,
			width: 800, 
            height: 300,
            closeButton:true
		});
		this.physicalQtyEditPanel.refresh(null,true);
		//Unchecked checkbox
		document.getElementById('chkBoxAdjust').checked=false;
	},
	/**
	 * Click create supply requisition button
	 */
	partInventoryListPanel_onBtnCreateSupplyRequisition: function(){
		var selectRowRecords=this.partInventoryListPanel.getSelectedRecords();

		if(selectRowRecords.length<1){
			View.alert(getMessage('mustSelectARowMsg'));
			return;
		}
		
		//Reset selected part code array
		this.selectedPartCodeArray=[];
		for(var i=0;i<selectRowRecords.length;i++){
			var record=selectRowRecords[i];
			var partId=record.getValue('pt_store_loc_pt.part_id');
			this.selectedPartCodeArray.push(partId);
		}
		
		var partStorageLocId=this.ptStorageLocationcode;
		var partList=this.selectedPartCodeArray;
		
		this.openCreateSupplyRequistionViewDialog(partStorageLocId,partList);
	},
	
	/**
	 * Open create supply requisition view dialog.
	 */
	openCreateSupplyRequistionViewDialog: function(partStorageLocId,partList){
		//Show supply requisition edit dialog form
		var dialogConfig = {
				width:1000,
				height:600,
				partStoreCode: partStorageLocId,
				partIdList: partList,
				title: getMessage('supplyReqDialogTitle'),
				closeButton: false
		};
		//Show create supply requisition view in dialog
		View.openDialog('ab-bldgops-report-part-create-supply-req-multi-tabs.axvw', null, false,dialogConfig );
	},
	/**
	 * Create Purchase Order.
	 */
	partInventoryListPanel_onBtnCreatePurchaseOrder: function(){
		var selectRowRecords=this.partInventoryListPanel.getSelectedRecords();

		if(selectRowRecords.length<1){
			View.alert(getMessage('mustSelectARowMsg'));
			return;
		}
		
		//check if selected parts have vendor.
		var allHaveVendor=true;
		//Get first part that does not have vendor code from selected parts list.
		var firstPartNotHaveVendor="";
		
		//Reset selected part code array
		this.selectedPartCodeArray=[];
		for(var i=0;i<selectRowRecords.length;i++){
			var record=selectRowRecords[i];
			var partId=record.getValue('pt_store_loc_pt.part_id');
			var vendorCode=record.getValue('pt_store_loc_pt.vnCode');
			if(!valueExistsNotEmpty(vendorCode)){
				allHaveVendor=false;
				//Get first part that does not have vendor code from selected parts list.
				if(!valueExistsNotEmpty(firstPartNotHaveVendor)){
					firstPartNotHaveVendor=partId;
				}
			}else{
				this.selectedPartCodeArray.push(partId);
			}
			
		}
		
		if(!allHaveVendor){
			if(selectRowRecords.length==1){
				View.alert(getMessage('notHaveVendorForSingleMsg').replace('{0}',selectRowRecords[0].getValue('pt_store_loc_pt.part_id')));
			}else{
				View.alert(getMessage('notHaveVendorForSingleMsg').replace('{0}',firstPartNotHaveVendor));
			}
			
			return;
			
		}
		
		var partStorageLocId=this.ptStorageLocationcode;
		var partList=this.selectedPartCodeArray;
		
		this.openCreatePurchaseOrderViewDialog(partStorageLocId,partList);
	},
	
	/**
	 * Open create purchase order view dialog.
	 */
	openCreatePurchaseOrderViewDialog: function(partStorageLocId,partList){
		
		//check if selected parts have common vendor code.
		var vnRecords=this.getVnIdArrayRecordsByPartsId(partList);
		if(vnRecords.length==0){
			var partsListString="";
			for(var i=0;i<this.selectedPartCodeArray.length;i++){
				partsListString+=this.selectedPartCodeArray[i];
				if(i!=(this.selectedPartCodeArray.length-1)){
					partsListString+=";";
				}
			}
			View.alert(getMessage('notHaveCommonVendorMsg').replace("{0}",partsListString));
			return;
		}
		//Show supply requisition edit dialog form
		var dialogConfig = {
				width:1200,
				height:600,
				partStoreCode: partStorageLocId,
				partIdList: partList,
				title: getMessage('purchaseOrderDialogTitle'),
				closeButton: false
		};
		//Show create supply requisition view in dialog
		View.openDialog('ab-bldgops-report-purchase-orders-dialog-multiple.axvw', null, false,dialogConfig );
	},
	/**
	 * Get common vendor by selected part list
	 * @param partList Selected part list
	 * @return pvRecords Records of common vendor
	 */
	getVnIdArrayRecordsByPartsId: function(partList){
		var partIdList=partList;
		
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
		
		return pvRecords
	},
	/**
	 * Update Physical Count
	 */
	doUpdatePhysicalCount: function(){
		var date =new Date();
			date=getIsoFormatDate(date);
		var time=getCurrentTimeIn24HourFormat();

		var partStorageLocationCode=this.ptStorageLocationcode;
		//Get user employee Id
		var userName=View.user.employee.id;
		//Part store location data source
		var ptStoreLocPtDs=View.dataSources.get('partByLocationPtStorageLocationEditDS');
		//this.partInventoryMpiwUpdatePhysicalCountDialog.setFieldValue('pt_store_loc_pt.date_of_last_cnt',date);
		var physicalQty=this.physicalQtyEditPanel.getFieldValue('pt_store_loc_pt.qty_physical_count');
		
		//Check Transfer Quantity field is number type and greater than 0
		var isQtyNaN=isNaN(parseFloat(physicalQty));
		if(isQtyNaN){
			View.alert(getMessage('qtyTransferMustBeNumberTypeMsg'));
			return;
		}else{
			tansQty=parseFloat(physicalQty);
			if(tansQty<=0){
				View.alert(getMessage("transactionQuantityGreaterThanZeroMsg"));
				return;
			}
		}
		//Get selected part code array list.
		var partCodeArray=this.selectedPartCodeArray;
		//Do adjust quantity available count from quantity physical count
		var isAdjustButtonChecked=document.getElementById('chkBoxAdjust').checked;
		
		
		for(var i=0;i<partCodeArray.length;i++){
			//Get part code from part code array.
			var partId=partCodeArray[i];
			
			//Update physical quantity count and date of last count field to part storage location table(pt_store_loc_pt)
			var ptStoreLocPtRes=new Ab.view.Restriction();
				ptStoreLocPtRes.addClause('pt_store_loc_pt.pt_store_loc_id',partStorageLocationCode,'=');
				ptStoreLocPtRes.addClause('pt_store_loc_pt.part_id',partId,'=');
				
			var ptStoreLocPtRecord=ptStoreLocPtDs.getRecord(ptStoreLocPtRes);
			if(!ptStoreLocPtRecord.isNew){
				ptStoreLocPtRecord.setValue('pt_store_loc_pt.qty_physical_count',physicalQty);
				ptStoreLocPtRecord.setValue('pt_store_loc_pt.date_of_last_cnt',date);
				
				ptStoreLocPtDs.saveRecord(ptStoreLocPtRecord);
				
				if(!isAdjustButtonChecked){
					//Save new record to it table
					var itRecord=new Ab.data.Record();
					itRecord.isNew=true;
					itRecord.setValue('it.part_id',partId);
					itRecord.setValue('it.pt_store_loc_from',partStorageLocationCode);
					itRecord.setValue('it.performed_by',userName);
					itRecord.setValue('it.trans_type','Rectify');
					itRecord.setValue('it.trans_date',date);
					itRecord.setValue('it.trans_time',time);
					
					View.dataSources.get('partByLocationItDS').saveRecord(itRecord);
				}
				
				
			}
				
		}
		
		
		if(isAdjustButtonChecked){
			this.adjustQuantityAvailableFromPhysicalCount(partCodeArray,physicalQty);
		}
		//Refresh part inventory list
		var patInvPanelRes=new Ab.view.Restriction();
		patInvPanelRes.addClause('pt_store_loc_pt.pt_store_loc_id',partStorageLocationCode,'=');
		this.partInventoryListPanel.refresh(patInvPanelRes);
		//Close dialog window
		this.physicalQtyEditPanel.closeWindow();
		
	},
	
	/**
	 * Show edit part-storage location form
	 */
	showEditStorageLocationForm: function(){
		var selectRowIndex=this.partInventoryListPanel.selectedRowIndex;
		var selectRowRec=this.partInventoryListPanel.gridRows.get(selectRowIndex).getRecord();
		var partStoreLocId=selectRowRec.getValue('pt_store_loc_pt.pt_store_loc_id');
		var partId=selectRowRec.getValue("pt_store_loc_pt.part_id");
		View.openDialog('ab-bldgops-report-edit-part-in-storage-location-dialog.axvw', null, false, {
            width: 800,
            height: 600,
            partStoreLocId: partStoreLocId,
            partId: partId,
            partInventoryListPanel: 'partInventoryListPanel',
            actionType:'edit',
            closeButton: true
        });
	},
	/**
	 * Show dialog of Add Parts To Storage Location
	 */
	addPartToStorageLocation: function(){
		var partStoreLocId=this.ptStorageLocationcode;
		View.openDialog('ab-bldgops-report-edit-part-in-storage-location-dialog.axvw', null, false, {
            width: 800,
            height: 600,
            partStoreLocId: partStoreLocId,
            partId: '',
            partInventoryListPanel: 'partInventoryListPanel',
            actionType:'addnew-byLocation',
            closeButton: true
        });
	},
	/**
	 * Run when we click adjustQuantityAvailableFromPhysicalCount button 
	 * @param ptArray Array of parts code to adjust
	 * @param physicalCount Quantity Physical Count to change.
	 */
	adjustQuantityAvailableFromPhysicalCount: function(ptArray,physicalCount){
		var ptDs=View.dataSources.get('partByLocationPtDS');
		var ptStoreLocDs=View.dataSources.get('partByLocationPtStorageLocationEditDS');
	    var excuteResult=false;
		var ptRecords = [];
		for(var i=0;i<ptArray.length;i++){
	    	var partCode=ptArray[i];
	    	var ptRes=new Ab.view.Restriction();
	    	ptRes.addClause('pt.part_id',partCode,'=');
	    	var ptRecord=ptDs.getRecord(ptRes);
	    	
	    	var ptStoreLocRes=new Ab.view.Restriction();
	    	ptStoreLocRes.addClause('pt_store_loc_pt.part_id',partCode,'=');
	    	ptStoreLocRes.addClause('pt_store_loc_pt.pt_store_loc_id',this.ptStorageLocationcode,'=');
	    	
	    	var ptStoreLocRecord=ptStoreLocDs.getRecord(ptStoreLocRes);
	    	//create new record
	    	ptRecords[i] = new Object();
	        ptRecords[i]['pt_store_loc_pt.qty_on_reserve'] = ptStoreLocRecord.getValue("pt_store_loc_pt.qty_on_reserve");
	        ptRecords[i]['pt_store_loc_pt.pt_store_loc_id'] = this.ptStorageLocationcode;
	        ptRecords[i]['pt_store_loc_pt.qty_physical_count'] =physicalCount;
	        ptRecords[i]['pt_store_loc_pt.part_id'] = ptStoreLocRecord.getValue("pt_store_loc_pt.part_id");
	        ptRecords[i]['pt_store_loc_pt.qty_on_hand'] = ptStoreLocRecord.getValue("pt_store_loc_pt.qty_on_hand");
	        ptRecords[i]['pt_store_loc_pt.cost_unit_last'] = ptStoreLocRecord.getValue("pt_store_loc_pt.cost_unit_last");
	        ptRecords[i]['pt.acc_prop_type'] = ptRecord.getValue("pt.acc_prop_type");
	    }
	    
	    var result = {};
	    try {
	        result = Workflow.callMethod('AbBldgOpsBackgroundData-calculateWorkResourceValues-updateQuantityAvailableFromPhysicalCountForMPSL', ptRecords);
	    } 
	    catch (e) {
			if (e.code == 'ruleFailed'){
				View.showMessage(e.message);
			}else{
	            Workflow.handleError(e); 
	        }
	        return;
	    }
	    if (result.code == 'executed') {
	    	excuteResult=true;
	    }
	    else {
	        Workflow.handleError(result);
	    }
	    
	    return excuteResult;
	},
	
	/**
	 * show vendor code list by part code selected.
	 * @param partId Part Code.
	 */
	showVnCodeListByPartCode: function(){
		var rowIndex=this.partInventoryListPanel.selectedRowIndex;
		var partId=this.partInventoryListPanel.gridRows.get(rowIndex).getRecord().getValue('pt_store_loc_pt.part_id');
		var pvRes=new Ab.view.Restriction();
		pvRes.addClause('pv.part_id',partId,'=');
		
		View.panels.get('vendorCodeListDialog').showInWindow({
			width: 500,
			height:400,
			title: getMessage('vendorDialogTitle').replace('{0}',partId)
		});
		
		View.panels.get('vendorCodeListDialog').refresh(pvRes);
	},
	/**
	 * Open map view dialog when click Map button.
	 */
	partStorageLocationListPanel_onBtnMap: function(){
		var controller=this;
		var consoleRecord=this.consoleForm.getRecord();
		var partList=[];
		if(valueExistsNotEmpty(consoleRecord.getValue('pt.part_id'))){
			partList.push(consoleRecord.getValue('pt.part_id'));
		}
		View.openDialog('ab-bldgops-report-parts-bylocation-mpsl-map-dialog.axvw', null, false, {
            width: 1100,
            height: 900,
            consoleRecord: consoleRecord,
            title: getMessage('storageLocationMapDialogTitle'),
            closeButton: true,
            callback: function(partStoreCode,type){
            	View.closeDialog();
            	if(type=="Purchase"){
        			//call open create purchase order dialog form method in opener view.
            		controller.openCreatePurchaseOrderViewDialog(partStoreCode,partList);
        		}
        		if(type=="Requistion"){
        			//call open supply requisition edit dialog form method in opener view.
        			controller.openCreateSupplyRequistionViewDialog(partStoreCode,partList);
        		}
            }
        });
	},
	/**
	 * show dialog of Estimate and Not Reserved Report.
	 */
	openEstimateAndNotReservedReport: function(){
		var rowIndex=this.partInventoryListPanel.selectedRowIndex;
		var partId=this.partInventoryListPanel.gridRows.get(rowIndex).getRecord().getValue('pt_store_loc_pt.part_id');
		var storageLocId=this.partInventoryListPanel.gridRows.get(rowIndex).getRecord().getValue('pt_store_loc_pt.pt_store_loc_id');
		
		View.openDialog("ab-bldgops-report-parts-inventory-estimate-notreserved.axvw",null,false,{
			width: 800,
            height: 500,
            partId:partId,
            storageLocId:storageLocId,
            title: getMessage('estimateAndNotReservedDialogTitle').replace('{0}',storageLocId).replace('{1}',partId)
		});
	},
	/**
	 * show detail dialog of Qty On Order field.
	 */
	showQtyOnOrderGrid: function(){
		var rowIndex=this.partInventoryListPanel.selectedRowIndex;
		var partId=this.partInventoryListPanel.gridRows.get(rowIndex).getRecord().getValue('pt_store_loc_pt.part_id');
		var storageLocId=this.partInventoryListPanel.gridRows.get(rowIndex).getRecord().getValue('pt_store_loc_pt.pt_store_loc_id');
		this.poLineItemListForm.showInWindow({
			width:800,
			height:600
		});
		this.poLineItemListForm.show(true);
		this.poLineItemListForm.addParameter('receivingLocationParam',storageLocId);
		this.poLineItemListForm.addParameter('partCodeParam',partId);
		this.poLineItemListForm.refresh();
	},
	/**
	 * show detail dialog of Qty In Transit From field.
	 */
	showQtyInTransitFromDialog: function(){
		var rowIndex=this.partInventoryListPanel.selectedRowIndex;
		var partId=this.partInventoryListPanel.gridRows.get(rowIndex).getRecord().getValue('pt_store_loc_pt.part_id');
		var storageLocId=this.partInventoryListPanel.gridRows.get(rowIndex).getRecord().getValue('pt_store_loc_pt.pt_store_loc_id');
		this.supplyReqItemListByFromGrid.showInWindow({
			width:800,
			height:600
		});
		this.supplyReqItemListByFromGrid.show(true);
		this.supplyReqItemListByFromGrid.addParameter('ptStoreLocFromParam',storageLocId);
		this.supplyReqItemListByFromGrid.addParameter('partCodeParam',partId);
		this.supplyReqItemListByFromGrid.refresh();
	},
	/**
	 * show detail dialog of Qty In Transit To field.
	 */
	showQtyInTransitToDialog: function(){
		var rowIndex=this.partInventoryListPanel.selectedRowIndex;
		var partId=this.partInventoryListPanel.gridRows.get(rowIndex).getRecord().getValue('pt_store_loc_pt.part_id');
		var storageLocId=this.partInventoryListPanel.gridRows.get(rowIndex).getRecord().getValue('pt_store_loc_pt.pt_store_loc_id');
		this.supplyReqItemListByToGrid.showInWindow({
			width:800,
			height:600
		});
		this.supplyReqItemListByToGrid.show(true);
		this.supplyReqItemListByToGrid.addParameter('ptStoreLocToParam',storageLocId);
		this.supplyReqItemListByToGrid.addParameter('partCodeParam',partId);
		this.supplyReqItemListByToGrid.refresh();
	}
});