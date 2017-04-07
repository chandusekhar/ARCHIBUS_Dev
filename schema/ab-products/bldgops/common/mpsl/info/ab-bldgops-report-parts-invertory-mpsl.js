var partsInventoryMpiwController=View.createController('partsInventoryMpiwController',{
	//Define part code
	partCode: "",

	afterInitialDataFetch: function(){
		var panelTitleNode = this.abBldgopsReportPartsInvertoryGrid.getTitleEl().dom.parentNode.parentNode;
    	var cbxTdElement = Ext.DomHelper.append(panelTitleNode, {
    		tag : 'td',
    		id : 'understockedCbx'
    	});
    	
    	var cbxElement="<input type='checkbox' id='cbxUnderstocked' onclick='onclickCbx();'/>&nbsp;&nbsp;<b>"+getMessage('isUnderstocked')+"</b></input>";
    	Ext.DomHelper.append(cbxTdElement,cbxElement,true);
    	
    	//Ext.DomHelper.append(cbxTdElement,cbxElement,true);

	},
	/**
	 * Show and refresh part inventory storage location by part code
	 */
	showPartsInventoryStorageLocation: function(){
		var selectRowIndex=this.abBldgopsReportPartsInvertoryGrid.selectedRowIndex;
		var selectRowRecord=this.abBldgopsReportPartsInvertoryGrid.gridRows.get(selectRowIndex).getRecord();
		var partId=selectRowRecord.getValue('pt.part_id');
		
		if(valueExistsNotEmpty(partId)){
			this.partCode=partId;
			var partRes=new Ab.view.Restriction();
			partRes.addClause('pt_store_loc_pt.part_id',partId,'=');
			this.abBldgopsReportPartsInvertoryStorageLocationGrid.refresh(partRes);
			this.abBldgopsReportPartsInvertoryStorageLocationGrid.setTitle(getMessage('partInventoryStorageLocationTitle').replace('{0}',partId));
		}
	},
	abBldgopsReportPartsInvertoryGrid_onBtnUnderstocked: function(){
		this.abBldgopsReportPartsInvertoryGrid.addParameter('understockRes','pt.part_id in (select part_id from pt_store_loc_pt where pt_store_loc_pt.qty_to_order>0)');
		this.abBldgopsReportPartsInvertoryGrid.refresh();
		this.abBldgopsReportPartsInvertoryStorageLocationGrid.show(false);
	},
	
	abBldgopsReportPartsInvertoryStorageLocationGrid_afterRefresh: function(){
		//kb#3053972 hidden column title of radio button column.
		var grid=this.abBldgopsReportPartsInvertoryStorageLocationGrid;
		var columns = grid.columns;
		var headerRow=grid.headerRows[0];
		for(var i=0;i<columns.length;i++){
			if(columns[i].id=='pt_store_loc_pt.radioCheckItem'){
				headerRow.childNodes[i].innerHTML="";
			}
		}
		this.abBldgopsReportPartsInvertoryStorageLocationGrid.setTitle(getMessage('partInventoryStorageLocationTitle').replace('{0}',this.partCode));
	},
	
	/**
	 * Update physical count 
	 */
	abBldgopsReportPartsInvertoryStorageLocationGrid_onBtnUpdatePhsicalCount: function(){
		var selectRowIndex=this.getGridSelectedRowIndex();
		if(selectRowIndex!=-1){
			var selectRowRecord=this.abBldgopsReportPartsInvertoryStorageLocationGrid.gridRows.get(selectRowIndex).getRecord();
			//Show update physical count page in dialog
			var storageLocationCode=selectRowRecord.getValue('pt_store_loc_pt.pt_store_loc_id');
			var partId=selectRowRecord.getValue('pt_store_loc_pt.part_id');
			var physicalQuantityCount=selectRowRecord.getValue('pt_store_loc_pt.qty_physical_count');
			var physicalCountDialogRes=new Ab.view.Restriction();
				physicalCountDialogRes.addClause('pt_store_loc_pt.pt_store_loc_id',storageLocationCode,'=');
				physicalCountDialogRes.addClause('pt_store_loc_pt.part_id',partId,'=');
			
			this.partInventoryMpiwUpdatePhysicalCountDialog.refresh(physicalCountDialogRes);
			this.partInventoryMpiwUpdatePhysicalCountDialog.showInWindow({
				x: 400,
				y: 300,
				width: 800, 
	            height: 500,
	            closeButton:true
			});
			this.partInventoryMpiwUpdatePhysicalCountDialog.setFieldValue('pt_store_loc_pt.date_of_last_cnt',"");
			document.getElementById('chkBoxAdjust').checked=false;
		}else{
			View.alert(getMessage('mustSelectARowMsg'));
		}
	},
	/**
	 * Create Supply Requisition
	 */
	abBldgopsReportPartsInvertoryStorageLocationGrid_onBtnCreateSupplyRequisition: function(){
		var selectRowIndex=this.getGridSelectedRowIndex();
		if(selectRowIndex!=-1){
			var selectRowRecord=this.abBldgopsReportPartsInvertoryStorageLocationGrid.gridRows.get(selectRowIndex).getRecord();
			//Show create supply requisition page in dialog
			var partStoreCode=selectRowRecord.getValue('pt_store_loc_pt.pt_store_loc_id');
			var partId=selectRowRecord.getValue('pt_store_loc_pt.part_id');

			this.openCreateSupplyRequistionViewDialog(partStoreCode,partId);
			
		}else{
			View.alert(getMessage('mustSelectARowMsg'));
		}
	},
	/**
	 * Open create supply requisition view dialog.
	 */
	openCreateSupplyRequistionViewDialog: function(partStoreCode,partId){
		//Show supply requisition edit dialog form
		var dialogConfig = {
				width:1000,
				height:600,
				partStoreCode: partStoreCode,
				partId: partId,
				title: getMessage('supplyReqDialogTitle'),
				closeButton: false 
		};
		View.openDialog("ab-bldgops-report-parts-invertory-mpiw-dialog.axvw", null, false, dialogConfig);
	},
	/**
	 * Create Purchase Order.
	 */
	abBldgopsReportPartsInvertoryStorageLocationGrid_onBtnCreatePurchaseOrder: function(){
		var selectRowIndex=this.getGridSelectedRowIndex();
		if(selectRowIndex!=-1){
			var selectRowRecord=this.abBldgopsReportPartsInvertoryStorageLocationGrid.gridRows.get(selectRowIndex).getRecord();
			//Show create supply requisition page in dialog
			var partStoreCode=selectRowRecord.getValue('pt_store_loc_pt.pt_store_loc_id');
			var partId=selectRowRecord.getValue('pt_store_loc_pt.part_id');
			//get vendor code by selected part code.
			var partRes=new Ab.view.Restriction();
			partRes.addClause('pt.part_id',partId,'=');
			var partRecord=this.abBldgopsReportPartsInvertoryDS.getRecord(partRes);
			var vendorCode=partRecord.getValue('pt.vnCode');
			if(!valueExistsNotEmpty(vendorCode)){
				View.alert(getMessage('notHaveVendorForSingleMsg').replace('{0}',partId));
				return;
			}
			this.openCreatePurchaseOrderViewDialog(partStoreCode,partId);
			
		}else{
			View.alert(getMessage('mustSelectARowMsg'));
		}
	},
	/**
	 * Open create purchase order view dialog.
	 */
	openCreatePurchaseOrderViewDialog: function(partStoreCode,partId){
		//Show supply requisition edit dialog form
		var dialogConfig = {
				width:1000,
				height:600,
				partStoreCode: partStoreCode,
				partId: partId,
				title: getMessage('purchaseOrderDialogTitle'),
				closeButton: false
		};
		View.openDialog("ab-bldgops-report-purchase-orders-dialog.axvw", null, false, dialogConfig);
	},
	
	/**
	 * Update Physical Count
	 */
	doUpdatePhysicalCount: function(){
		var date =new Date();
			date=getIsoFormatDate(date);
		var time=getCurrentTimeIn24HourFormat();
		var partId=this.partInventoryMpiwUpdatePhysicalCountDialog.getFieldValue('pt_store_loc_pt.part_id');
		var partStorageLocationCode=this.partInventoryMpiwUpdatePhysicalCountDialog.getFieldValue('pt_store_loc_pt.pt_store_loc_id');
		var transferQty=this.partInventoryMpiwUpdatePhysicalCountDialog.getFieldValue('pt_store_loc_pt.qty_physical_count');
		//Get user employee Id
		var userName=View.user.employee.id;
		this.partInventoryMpiwUpdatePhysicalCountDialog.setFieldValue('pt_store_loc_pt.date_of_last_cnt',date);
		//Check Transfer Quantity field is number type and greater than 0
		var isQtyNaN=isNaN(parseFloat(transferQty));
		if(isQtyNaN){
			View.alert(getMessage('qtyTransferMustBeNumberTypeMsg'));
			return;
		}else{
			tansQty=parseFloat(transferQty);
			if(tansQty<=0){
				View.alert(getMessage("transactionQuantityGreaterThanZeroMsg"));
				return;
			}
		}
		var ptStorageLocationSaved=this.partInventoryMpiwUpdatePhysicalCountDialog.save();
		if(ptStorageLocationSaved){
			var isAdjustButtonChecked=document.getElementById('chkBoxAdjust').checked;
			

			//If checkbox is checked ,then adjust physical count to quantity available count 
			if(!isAdjustButtonChecked){
				//Add a record which type is 'Rectify with Physical Inventory' to IT table
				var itRecord=new Ab.data.Record();
				itRecord.isNew=true;
				itRecord.setValue('it.part_id',partId);
				itRecord.setValue('it.pt_store_loc_from',partStorageLocationCode);
				itRecord.setValue('it.performed_by',userName);
				itRecord.setValue('it.trans_type','Rectify');
				itRecord.setValue('it.trans_date',date);
				itRecord.setValue('it.trans_time',time);
				itRecord.setValue('it.trans_quantity',transferQty);

				View.dataSources.get('abBldgopsReportItDS').saveRecord(itRecord);
			}else{
				var ptArray=[];
				ptArray.push(partId);
				var exacuteResult=this.adjustQuantityAvailableFromPhysicalCount(ptArray,transferQty);
			}
			
			
			//Refresh part storage location by part code which clicked before
			var ptLocationPanelRes=new Ab.view.Restriction();
			ptLocationPanelRes.addClause('pt_store_loc_pt.part_id',this.partCode,'=');
			this.abBldgopsReportPartsInvertoryStorageLocationGrid.refresh(ptLocationPanelRes);
			this.abBldgopsReportPartsInvertoryGrid.refresh();
			//Close Dialog
			this.partInventoryMpiwUpdatePhysicalCountDialog.closeWindow();
			
		}
		
	},
	/**
	 * Get part description by part code
	 * @param partCode Part code
	 * @return partDescription Part description
	 */
	getPartDescriptionByPartCode: function(partCode){
		var partDescription="";
		var partDs=View.dataSources.get('abBldgopsReportPartsInvertoryDS');
		var partRes=new Ab.view.Restriction();
		partRes.addClause('pt.part_id',partCode,'=');
		var partRecord=partDs.getRecord(partRes);
		if(!partRecord.isNew){
			partDescription=partRecord.getValue('pt.description');
		}
		
		return partDescription;
	},
	
	
	/**
	 * Show edit part-storage location form
	 */
	showEditStorageLocationForm: function(){
		var selectRowIndex=this.abBldgopsReportPartsInvertoryStorageLocationGrid.selectedRowIndex;
		var selectRowRec=this.abBldgopsReportPartsInvertoryStorageLocationGrid.gridRows.get(selectRowIndex).getRecord();
		var partStoreLocId=selectRowRec.getValue('pt_store_loc_pt.pt_store_loc_id');
		var partId=selectRowRec.getValue("pt_store_loc_pt.part_id");
		View.openDialog('ab-bldgops-report-edit-part-in-storage-location-dialog.axvw', null, false, {
            width: 800,
            height: 600,
            partStoreLocId: partStoreLocId,
            partId: partId,
            partInventoryListPanel: 'abBldgopsReportPartsInvertoryStorageLocationGrid',
            actionType:'edit',
            closeButton: true
        });
	},
	
	/**
	 * Show edit part-storage location form
	 */
	addPartToStorageLocation: function(){
		var partId=this.partCode;
		View.openDialog('ab-bldgops-report-edit-part-in-storage-location-dialog.axvw', null, false, {
            width: 800,
            height: 600,
            partStoreLocId: '',
            partId: partId,
            partInventoryListPanel: 'abBldgopsReportPartsInvertoryStorageLocationGrid',
            actionType:'addnew-byPart',
            closeButton: true
        });
	},
	
	
	/**
	 * Run when we click adjustQuantityAvailableFromPhysicalCount button 
	 * @param ptArray Array of parts code to adjust
	 * @param physicalCount Quantity Physical Count to change.
	 */
	adjustQuantityAvailableFromPhysicalCount: function(ptArray,physicalCount){
		var ptDs=View.dataSources.get('abBldgopsReportPartsInvertoryDS');
		var ptStoreLocDs=View.dataSources.get('abBldgopsReportPtStorageLocationEditDS');
		var ptStorageLocationcode=this.partInventoryMpiwUpdatePhysicalCountDialog.getFieldValue('pt_store_loc_pt.pt_store_loc_id');
	    var excuteResult=false;
		var ptRecords = [];
		for(var i=0;i<ptArray.length;i++){
	    	var partCode=ptArray[i];
	    	var ptRes=new Ab.view.Restriction();
	    	ptRes.addClause('pt.part_id',partCode,'=');
	    	var ptRecord=ptDs.getRecord(ptRes);
	    	
	    	var ptStoreLocRes=new Ab.view.Restriction();
	    	ptStoreLocRes.addClause('pt_store_loc_pt.part_id',partCode,'=');
	    	ptStoreLocRes.addClause('pt_store_loc_pt.pt_store_loc_id',ptStorageLocationcode,'=');
	    	
	    	var ptStoreLocRecord=ptStoreLocDs.getRecord(ptStoreLocRes);
	    	//create new record
	    	ptRecords[i] = new Object();
	        ptRecords[i]['pt_store_loc_pt.qty_on_reserve'] = ptStoreLocRecord.getValue("pt_store_loc_pt.qty_on_reserve");
	        ptRecords[i]['pt_store_loc_pt.pt_store_loc_id'] = ptStorageLocationcode;
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
		var rowIndex=this.abBldgopsReportPartsInvertoryGrid.selectedRowIndex;
		var partId=this.abBldgopsReportPartsInvertoryGrid.gridRows.get(rowIndex).getRecord().getValue('pt.part_id');
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
	abBldgopsReportPartsInvertoryStorageLocationGrid_onBtnMap: function(){
		var controller=this;
		var partId=this.partCode;
		View.openDialog('ab-bldops-report-parts-inventory-mpsl-map-dialog.axvw', null, false, {
            width: 1100,
            height: 900,
            partId: partId,
            title: getMessage('storageLocationMapDialogTitle').replace('{0}',partId),
            closeButton: true,
            callback: function(partStoreCode,type){
            	View.closeDialog();
            	if(type=="Purchase"){
        			//call open create purchase order dialog form method in opener view.
            		controller.openCreatePurchaseOrderViewDialog(partStoreCode,partId);
        		}
        		if(type=="Requistion"){
        			//call open supply requisition edit dialog form method in opener view.
        			controller.openCreateSupplyRequistionViewDialog(partStoreCode,partId);
        		}
            }
        });
	},
	
	openEstimateAndNotReservedReport: function(){
		var rowIndex=this.abBldgopsReportPartsInvertoryStorageLocationGrid.selectedRowIndex;
		var partId=this.abBldgopsReportPartsInvertoryStorageLocationGrid.gridRows.get(rowIndex).getRecord().getValue('pt_store_loc_pt.part_id');
		var storageLocId=this.abBldgopsReportPartsInvertoryStorageLocationGrid.gridRows.get(rowIndex).getRecord().getValue('pt_store_loc_pt.pt_store_loc_id');
		
		View.openDialog("ab-bldgops-report-parts-inventory-estimate-notreserved.axvw",null,false,{
			width: 800,
            height: 500,
            partId:partId,
            storageLocId:storageLocId,
            title: getMessage('estimateAndNotReservedDialogTitle').replace('{0}',storageLocId).replace('{1}',partId)
		});
	},
	
	showQtyOnOrderGrid: function(){
		var rowIndex=this.abBldgopsReportPartsInvertoryStorageLocationGrid.selectedRowIndex;
		var partId=this.abBldgopsReportPartsInvertoryStorageLocationGrid.gridRows.get(rowIndex).getRecord().getValue('pt_store_loc_pt.part_id');
		var storageLocId=this.abBldgopsReportPartsInvertoryStorageLocationGrid.gridRows.get(rowIndex).getRecord().getValue('pt_store_loc_pt.pt_store_loc_id');
		this.poLineItemListForm.showInWindow({
			width:800,
			height:600
		});
		this.poLineItemListForm.show(true);
		this.poLineItemListForm.addParameter('receivingLocationParam',storageLocId);
		this.poLineItemListForm.addParameter('partCodeParam',partId);
		this.poLineItemListForm.refresh();
	},
	
	showQtyInTransitFromDialog: function(){
		var rowIndex=this.abBldgopsReportPartsInvertoryStorageLocationGrid.selectedRowIndex;
		var partId=this.abBldgopsReportPartsInvertoryStorageLocationGrid.gridRows.get(rowIndex).getRecord().getValue('pt_store_loc_pt.part_id');
		var storageLocId=this.abBldgopsReportPartsInvertoryStorageLocationGrid.gridRows.get(rowIndex).getRecord().getValue('pt_store_loc_pt.pt_store_loc_id');
		this.supplyReqItemListByFromGrid.showInWindow({
			width:800,
			height:600
		});
		this.supplyReqItemListByFromGrid.show(true);
		this.supplyReqItemListByFromGrid.addParameter('ptStoreLocFromParam',storageLocId);
		this.supplyReqItemListByFromGrid.addParameter('partCodeParam',partId);
		this.supplyReqItemListByFromGrid.refresh();
	},
	
	showQtyInTransitToDialog: function(){
		var rowIndex=this.abBldgopsReportPartsInvertoryStorageLocationGrid.selectedRowIndex;
		var partId=this.abBldgopsReportPartsInvertoryStorageLocationGrid.gridRows.get(rowIndex).getRecord().getValue('pt_store_loc_pt.part_id');
		var storageLocId=this.abBldgopsReportPartsInvertoryStorageLocationGrid.gridRows.get(rowIndex).getRecord().getValue('pt_store_loc_pt.pt_store_loc_id');
		this.supplyReqItemListByToGrid.showInWindow({
			width:800,
			height:600
		});
		this.supplyReqItemListByToGrid.show(true);
		this.supplyReqItemListByToGrid.addParameter('ptStoreLocToParam',storageLocId);
		this.supplyReqItemListByToGrid.addParameter('partCodeParam',partId);
		this.supplyReqItemListByToGrid.refresh();
	},
	
	/**
	 * Get radio button checked row index.
	 */
	getGridSelectedRowIndex: function(){
		var rowIndex=-1;
		var gridRows=this.abBldgopsReportPartsInvertoryStorageLocationGrid.gridRows.items;
		for(var i=0;i<gridRows.length;i++){
			var row=gridRows[i];
			var radioEle=document.getElementById('abBldgopsReportPartsInvertoryStorageLocationGrid_row'+i+'_pt_store_loc_pt.radioCheckItem');
			if(valueExistsNotEmpty(radioEle)){
				if(radioEle.checked){
					rowIndex=i;
					break;
				}
			}else{
				rowIndex=-1;
				break;
			}
			
		}
		
		return rowIndex;
	}
		
});

/**
 * Show understocked part list after Understocked checkBox checked.
 */
function onclickCbx(){
	
	var checkBoxChecked=document.getElementById('cbxUnderstocked').checked;
	if(checkBoxChecked){
		View.panels.get('abBldgopsReportPartsInvertoryGrid').addParameter('understockRes','pt.part_id in (select part_id from pt_store_loc_pt where pt_store_loc_pt.qty_to_order>0)');
		
	}else{
		View.panels.get('abBldgopsReportPartsInvertoryGrid').addParameter('understockRes','1=1');
		
	}
	
	View.panels.get('abBldgopsReportPartsInvertoryGrid').refresh();
	View.panels.get('abBldgopsReportPartsInvertoryStorageLocationGrid').show(false);
	
}


/**
 * Call workflow CalculateInventoryUsage for calculate part inventory
 */
function calculateInventoryUsage(){
	// kb 3042748 add Status bars and confirmation messages 
    var grid = View.panels.get('abBldgopsReportPartsInvertoryGrid');
    View.openProgressBar(View.getLocalizedString(this.z_PROGRESS_MESSAGE));  
	try {
		Workflow.callMethod('AbBldgOpsBackgroundData-calculateWorkResourceValues-CalculateInventoryUsageForMPSL');
		View.closeProgressBar();
		View.alert(getMessage('calculateAlertMessage'));
		grid.refresh();
		View.panels.get('abBldgopsReportPartsInvertoryStorageLocationGrid').show(false);
	}catch(e){
		Workflow.handleError(e);
		View.closeProgressBar();
		return;
	}
}