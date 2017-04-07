var supplyReqController=View.createController('supplyReqController',{
	//Define supply requisition code
	supplyReqCode: "",
	//Selected part code of supply requisition panel item
	partCode:'',
	//From storage location
	fromStorageLocation:"",
	//To storage location
	toStorageLocation:"",
	//Supply Requisition Status before
	supplyReqBeforeRecord: '',
	//supply requisition status dom
	statusOptionDom: null,
	afterViewLoad: function(){
		this.statusOptionDom = jQuery(this.supplyRequisitionEditForm.fields.get('supply_req.status').dom);
	},
	afterInitialDataFetch: function(){
		//By default, the supply requisition list only show Not Received supply requisition data.
		var restriction=new Ab.view.Restriction();
		restriction.addClause('supply_req.status',['Received','Partially Received','Error'],'NOT IN');
		this.supplyRequisitionListPanel.refresh(restriction);
	},
	/**
	 * Refresh other panels by console form restriction
	 */
	consoleForm_onBtnShow: function(){
		var supplyReqId=this.consoleForm.getFieldValue('supply_req.supply_req_id');
		var supplyReqStatus=this.consoleForm.getFieldValue('supply_req.status');
		var fromStorageLocation=this.consoleForm.getFieldValue('it.pt_store_loc_from');
		var toStorageLocation=this.consoleForm.getFieldValue('it.pt_store_loc_to');
		var dataCreateFrom=this.consoleForm.getFieldValue('data_created_from');
		var dataCreateTo=this.consoleForm.getFieldValue('data_created_to');
		var partCode=this.consoleForm.getFieldValue('it.part_id');
		
		var notReceivedChecked=document.getElementById('receivedCkbx').checked;
		
		//Check record field validation.
		if(valueExistsNotEmpty(fromStorageLocation)&&valueExistsNotEmpty(toStorageLocation)){
			if(fromStorageLocation==toStorageLocation){
				View.alert(getMessage('fromStorageLocCannotSameWithToStorageLocMsg'));
				return;
			}
		}
		
		if(valueExistsNotEmpty(dataCreateFrom)&&valueExistsNotEmpty(dataCreateTo)){
			if (compareISODates(dataCreateTo, dataCreateFrom)){
				// display the error message defined in AXVW as message element
				View.alert(getMessage('dateCreateFromCannotEarlierThanDateCreateToMsg'));
				return;
			}
		}
		var supplyReqRes=new Ab.view.Restriction();
		if(valueExistsNotEmpty(supplyReqId)){
			supplyReqRes.addClause('supply_req.supply_req_id',supplyReqId,'=');
		}
		
		if(valueExistsNotEmpty(supplyReqStatus)){
			supplyReqRes.addClause('supply_req.status',supplyReqStatus,'=');
		}
		
		if(valueExistsNotEmpty(fromStorageLocation)){
			this.supplyRequisitionListPanel.addParameter('fromStorageLocationParam',"(select distinct pt_store_loc_from from it where it.supply_req_id=supply_req.supply_req_id)='"+fromStorageLocation+"'");
		}else{
			this.supplyRequisitionListPanel.addParameter('fromStorageLocationParam','1=1');
		}
		
		if(valueExistsNotEmpty(toStorageLocation)){
			this.supplyRequisitionListPanel.addParameter('toStorageLocationParam',"(select distinct pt_store_loc_to from it where it.supply_req_id=supply_req.supply_req_id)='"+toStorageLocation+"'");
		}else{
			this.supplyRequisitionListPanel.addParameter('toStorageLocationParam',"1=1");
		}
		
		if(valueExistsNotEmpty(partCode)){
			this.partCode=partCode;
			this.supplyRequisitionListPanel.addParameter('partCodeParam',"supply_req.supply_req_id in (select supply_req_id from it where it.part_id='"+partCode+"')");
		}else{
			this.supplyRequisitionListPanel.addParameter('partCodeParam',"1=1");
		}
		
		if(valueExistsNotEmpty(dataCreateFrom)){
			supplyReqRes.addClause('supply_req.date_created',dataCreateFrom,'&gt;=');
		}
		
		if(valueExistsNotEmpty(dataCreateTo)){
			supplyReqRes.addClause('supply_req.date_created',dataCreateTo,'&lt;=');
		}
		
		if(notReceivedChecked){
			supplyReqRes.addClause('supply_req.status',['Received','Partially Received','Error'],'NOT IN');
		}
		
		
		this.supplyRequisitionListPanel.refresh(supplyReqRes);
		this.supplyRequisitionItemListPanel.show(false);
		this.supplyRequisitionEditForm.show(false);
		this.supplyReqItemEditPanel.show(false);
		
	},
	/**
	 * Clear console form
	 */
	consoleForm_onBtnClear: function(){
		this.consoleForm.clear();
		document.getElementById('receivedCkbx').checked=true;
		this.partCode='';
		
		
	},
	/**
	 * show supplyReqItemList
	 */
	showSupplyReqItemAndDetailList: function(){
		var selectedRowIndex=this.supplyRequisitionListPanel.selectedRowIndex;
		var selectRowRecord=this.supplyRequisitionListPanel.gridRows.get(selectedRowIndex).getRecord();
		if(!selectRowRecord.isNew){
			//Refresh supply requisition items list by supply requisition code.
			var supplyReqId=selectRowRecord.getValue('supply_req.supply_req_id');
			var supplyStatus=selectRowRecord.getValue('supply_req.status');
			//get supply requisition record as before record
			this.supplyReqBeforeRecord=selectRowRecord;
			var fromStorageLocation=selectRowRecord.getValue('supply_req.fromStorageLocation');
			this.fromStorageLocation=fromStorageLocation;
			var toStorageLocation=selectRowRecord.getValue('supply_req.toStorageLocation');
			this.toStorageLocation=toStorageLocation;
			
			
			if(valueExistsNotEmpty(supplyReqId)){
				this.supplyReqCode=supplyReqId;
				var supplyReqItemRes=new Ab.view.Restriction();
				supplyReqItemRes.addClause('it.supply_req_id',supplyReqId,'=');
				//If part code in console form exists,then add clause to the restriction of supply requisition panel
				if(valueExistsNotEmpty(this.partCode)){
					supplyReqItemRes.addClause('it.part_id',this.partCode,'=');
				}
				//Show and refresh supply requisition detail by supply requisition code
				var supplyReqRes=new Ab.view.Restriction();
				supplyReqRes.addClause('supply_req.supply_req_id',supplyReqId,'=');
				
				this.supplyRequisitionItemListPanel.refresh(supplyReqItemRes);
				this.supplyReqItemEditPanel.show(false);
				this.supplyRequisitionEditForm.refresh(supplyReqRes);
				
				this.supplyRequisitionItemListPanel.setTitle(getMessage('supplyReqItemTitle').replace('{0}',supplyReqId).replace('{1}',fromStorageLocation).replace('{2}',toStorageLocation));
				
				this.setDateReceivedFieldIsNullIfItNotReceived();
				
			}
		}
	},
	
	setDateReceivedFieldIsNullIfItNotReceived: function(){
		this.supplyRequisitionItemListPanel.gridRows.each(function(row){
			var status=row.getRecord().getValue('it.req_item_status');
			var transDate=row.getRecord().getValue('it.trans_date');
			transDate=View.controllers.get('supplyReqController').getIsoFormatDateCustom(transDate);
			if(status!='Received'){
				row.cells.items[4].dom.innerHTML="";
			}else{
				row.cells.items[4].dom.innerHTML=transDate;
			}
		});
	},
	/**
	 * Get supply requisition status by supply requisition code
	 * @param supplyReqId Supply requisition code
	 * @return status Supply requisition status
	 */
	getSupplyReqStatusBySupplyRequisitionCode: function(supplyReqId){
		var status="";
		var supplyReqDs=View.dataSources.get('abMpiwSupplyReqStatusDS');
		var supplyRes=new Ab.view.Restriction();
		supplyRes.addClause('supply_req.supply_req_id',supplyReqId,'=');
		var supplyReqRecord=supplyReqDs.getRecord(supplyRes);
		if(!supplyReqRecord.isNew){
			status=supplyReqRecord.getValue('supply_req.status');
		}
		
		return status;
	},
	supplyRequisitionEditForm_beforeRefresh: function(){
		var newStatusOption = this.statusOptionDom.clone();
		newStatusOption.replaceAll(this.supplyRequisitionEditForm.fields.get('supply_req.status').dom);
		this.supplyRequisitionEditForm.fields.get('supply_req.status').dom = newStatusOption.get(0);
	},
	/**
	 * After Supply Requisition edit form refresh.
	 */
	supplyRequisitionEditForm_afterRefresh: function(){
		
		this.enableFieldAndActionsBySupplyReqStatus();
		
	},
	/**
	 * Enable fields and actions by supply Requisition status in Supply Requisition edit panel.
	 */
	enableFieldAndActionsBySupplyReqStatus: function(){
		var supplyReqRecord=this.supplyRequisitionEditForm.getRecord();
		var supplyReqId=supplyReqRecord.getValue('supply_req.supply_req_id');
		var supplyReqStatus=supplyReqRecord.getValue('supply_req.status');
		
		this.supplyRequisitionEditForm.enableField('supply_req.fromStorageLocation',false);
		this.supplyRequisitionEditForm.enableField('supply_req.toStorageLocation',false);
		
		//Disable actions of the supply requisitions form
		this.supplyRequisitionEditForm.actions.get('btnSave').enable(false);
		this.supplyRequisitionEditForm.actions.get('btnDelete').enable(false);
		this.supplyRequisitionEditForm.actions.get('btnCancel').enable(false);
		
		
		
		if(supplyReqStatus=="Received"||supplyReqStatus=="Partially Received"||supplyReqStatus=="Error"){
			this.supplyRequisitionEditForm.enableField('supply_req.status',false);
			this.supplyRequisitionEditForm.enableField('supply_req.comments',false);
			this.supplyRequisitionEditForm.enableField('supply_req.doc',false);
			
		}else{
			if(supplyReqStatus=="New"||supplyReqStatus=='Ready for Transit'){
				//Check if exists 'Received' or 'Error' items, if exists, disable the storage location field.
				var checkResult=false;
				if(valueExistsNotEmpty(supplyReqId)){
					checkResult=this.checkIfExistsReceivedOrErrorItemsBySupplyReqId(supplyReqId);
				}
				if(!checkResult){
					this.supplyRequisitionEditForm.enableField('supply_req.fromStorageLocation',true);
					this.supplyRequisitionEditForm.enableField('supply_req.toStorageLocation',true);
				}
				
			}
			this.supplyRequisitionEditForm.enableField('supply_req.status',true);
			
			//If supply requisition status is not 'Received', enable the save/delete/cancel button.
			this.supplyRequisitionEditForm.actions.get('btnSave').enable(true);
			if(supplyReqStatus!='In Transit'){
				this.supplyRequisitionEditForm.enableField('supply_req.comments',true);
				this.supplyRequisitionEditForm.enableField('supply_req.doc',true);
				this.supplyRequisitionEditForm.actions.get('btnDelete').enable(true);
			}
			
			this.supplyRequisitionEditForm.actions.get('btnCancel').enable(true);
			
			//Remove Supply requisition status of 'Received' or 'Partially Received'
			var supplyReqStatusField=this.supplyRequisitionEditForm.fields.get('supply_req.status').dom;
			
			for(var i=supplyReqStatusField.length-1;i>0;i--){
				if(supplyReqStatusField[i].value=='Received'||supplyReqStatusField[i].value=='Partially Received'||supplyReqStatusField[i].value=='Error'){
					supplyReqStatusField.remove(i);
				}
			}
			
		}
	},
	
	
	/**
	 * Check if exists 'Received' or 'Error' items , if exists, return true,else, return false.
	 * @param supplyReqId Supply requisition code
	 * @return 
	 */
	checkIfExistsReceivedOrErrorItemsBySupplyReqId: function(supplyReqId){
		var checkResult=true;
		var supplyReqDs=View.dataSources.get('abMpiwItDS');
		var supplyReqRes=new Ab.view.Restriction();
		supplyReqRes.addClause('it.supply_req_id',supplyReqId,'=');
		supplyReqRes.addClause('it.req_item_status','Received','=',')AND(');
		supplyReqRes.addClause('it.req_item_status','Error','=','OR');
		var supplyRecord=supplyReqDs.getRecord(supplyReqRes);
		if(supplyRecord.isNew){
			checkResult=false;
		}
		
		return checkResult;

	},
	/**
	 * Supply Requisitions grid Save button click handler
	 */
	
	supplyRequisitionEditForm_onBtnSave: function(){
		var newRecord=this.supplyRequisitionEditForm.newRecord;
		//Get record from supply requisition edit form
		var supplyReqId=this.supplyRequisitionEditForm.getFieldValue('supply_req.supply_req_id');
		var supplyReqStatus=this.supplyRequisitionEditForm.getFieldValue('supply_req.status');
		var fromStorageLocation=this.supplyRequisitionEditForm.getFieldValue('supply_req.fromStorageLocation');
		var toStorageLocation=this.supplyRequisitionEditForm.getFieldValue('supply_req.toStorageLocation');

		
		var beforeRecord=this.supplyReqBeforeRecord;
		var beforeFromStorageLocation=beforeRecord.getValue('supply_req.fromStorageLocation');
		var beforeToStorageLocation=beforeRecord.getValue('supply_req.toStorageLocation');
		var beforeSupplyReqStatus=beforeRecord.getValue('supply_req.status');
		
		this.supplyRequisitionEditForm.clearValidationResult();
		
		var checkResult=this.checkStorageLocationValidate(fromStorageLocation,toStorageLocation);
		
		if(!checkResult){
			this.supplyRequisitionEditForm.displayValidationResult();
			return;
		}
		
		//KB# 3053052 Add quantity on available check when changing the From storage location in Manage Requisition task.
		if(fromStorageLocation!=beforeFromStorageLocation){
			var isQuantityEnough=this.checkPartsQuantityEnoughtByStoreLocId(fromStorageLocation,supplyReqId);
			if(!isQuantityEnough){
				View.alert(getMessage('quantityNotEnoughForChangedStorageLocFromMsg'));
				return;
			}
		}

		var supplyReqSaved=this.supplyRequisitionEditForm.save();
		if(supplyReqSaved){
			var supplyReqChangeRecords=[];
			supplyReqChangeRecords[0]=new Object();
			supplyReqChangeRecords[0]['supply_req_id']=supplyReqId;
			supplyReqChangeRecords[0]['before_from_store_loc']=beforeFromStorageLocation;
			supplyReqChangeRecords[0]['new_from_store_loc']=fromStorageLocation;
			supplyReqChangeRecords[0]['before_to_store_loc']=beforeToStorageLocation;
			supplyReqChangeRecords[0]['new_to_store_loc']=toStorageLocation;
			supplyReqChangeRecords[0]['before_status']=beforeSupplyReqStatus;
			supplyReqChangeRecords[0]['new_status']=supplyReqStatus;
			View.openProgressBar();
			try{
				var result=Workflow.callMethod('AbBldgOpsBackgroundData-BldgopsPartInventoryService-updateSupplyReqItemWhenPartStoreLocationChange',supplyReqChangeRecords);
				if(result.code=="executed"){
					//When change storage location from and storage location to field value, re-set global parameter value.
					View.controllers.get('supplyReqController').fromStorageLocation=fromStorageLocation;
					View.controllers.get('supplyReqController').toStorageLocation=toStorageLocation;
					
					//re-set before selected row record value
					this.supplyReqBeforeRecord.setValue('supply_req.fromStorageLocation',fromStorageLocation);
					this.supplyReqBeforeRecord.setValue('supply_req.toStorageLocation',toStorageLocation);
					
					
					this.supplyRequisitionListPanel.refresh();
					this.supplyRequisitionItemListPanel.refresh();
					this.enableFieldAndActionsBySupplyReqStatus();
					View.closeProgressBar();
				}
			}catch(e){
				Workflow.handleError(e);
				View.closeProgressBar();
			}
			
			
		}
	},
	/**
	 * Check if parts quantity available is enough for the changed storage location.
	 * @param fromStorageLocation From Storage Location code
	 * @param supplyReqId Supply requisition code
	 * @return if all parts quantity available enough, return true,else return false
	 */
	checkPartsQuantityEnoughtByStoreLocId: function(fromStorageLocation,supplyReqId){
		var result=false;
		var checkDs=View.dataSources.get('abCheckQuantityOfStorageLocDs');
			checkDs.addParameter('fromStorageLocationParam',fromStorageLocation);
			checkDs.addParameter('supplyReqIdParam',supplyReqId);
		var records=checkDs.getRecords();
		if(records.length==0){
			result=true;
		}
		
		return result;
	},
	
	checkStorageLocationValidate: function(fromStorageLocation,toStorageLocation){
		var checkResult=true;
		//From storage location and To storage location can not be empty
		if(!valueExistsNotEmpty(fromStorageLocation)){
			this.supplyRequisitionEditForm.fields.get('supply_req.fromStorageLocation').setInvalid(getMessage('fromStorageLocationCannotBeEmptyMsg'));
			checkResult=false;
		}
		if(!valueExistsNotEmpty(toStorageLocation)){
			this.supplyRequisitionEditForm.fields.get('supply_req.toStorageLocation').setInvalid(getMessage('toStorageLocationCannotBeEmptyMsg'));
			checkResult=false;
		}else if(fromStorageLocation==toStorageLocation){
			//From storage location and To Storage location can't be same.
			this.supplyRequisitionEditForm.fields.get('supply_req.toStorageLocation').setInvalid(getMessage('fromStorageCannotBeSameWithToStorageLocationMsg'));
			checkResult=false;
		}
		
		return checkResult;
	},
	/**
	 * Supply Requisition Items Edit form save button click event handler
	 */
	supplyReqItemEditPanel_onBtnSave: function(){
		var transQty=this.supplyReqItemEditPanel.getFieldValue('it.trans_quantity');
		var supplyReqId=this.supplyReqItemEditPanel.getFieldValue('it.supply_req_id');
		var transId=this.supplyReqItemEditPanel.getFieldValue('it.trans_id');
		var fromStorageLocation=this.supplyReqItemEditPanel.getFieldValue('it.pt_store_loc_from');
		var toStorageLocation=this.supplyReqItemEditPanel.getFieldValue('it.pt_store_loc_to');
		var partCode=this.supplyReqItemEditPanel.getFieldValue('it.part_id');
		
		var form = this.supplyReqItemEditPanel;
		//Clear validation result
		form.clearValidationResult();
		
		var qtyTransactionCheckResult=true;
		var isNaNCheck=isNaN(transQty);
		if(isNaNCheck){
			qtyTransactionCheckResult=false;
		}else{
			var tansQty=parseFloat(transQty);
			if(tansQty<=0){
				qtyTransactionCheckResult=false;
			}
		}
		
		if(qtyTransactionCheckResult){
			//get quantity available from part storage location.
			var qtyOnHand=getQuanityAvailableFromPtStore(fromStorageLocation,partCode);
			if(parseFloat(transQty)>parseFloat(qtyOnHand)){
				View.alert(getMessage('doNotTransferMoreThanAvailableMsg'));
				return;
			}
			var saved=this.supplyReqItemEditPanel.save();
			if(saved){
				var reqItemStatus=this.supplyReqItemEditPanel.getFieldValue('it.req_item_status');
				if(reqItemStatus=='Received'||reqItemStatus=='Error'){
					View.openProgressBar();
					try{
						
						var result=Workflow.callMethod('AbBldgOpsBackgroundData-BldgopsPartInventoryService-transferPartsBetweenStorageLocationBySupplyReq',supplyReqId,transId,fromStorageLocation,toStorageLocation,partCode,transQty,reqItemStatus);
						if(result.code=="executed"){
							
							View.closeProgressBar();
						}
					}catch(e){
						Workflow.handleError(e);
						View.closeProgressBar();
					}
				}
				
				//Refresh Supply Requisition list panel
				this.supplyRequisitionListPanel.refresh();
				this.supplyRequisitionItemListPanel.refresh();
				this.enableFieldAndActionsBySupplyReqItemStatus();
				this.hiddePanelIfNotExistSupplyRequistionNotReceived(supplyReqId);
			}
		}else{
			form.fields.get('it.trans_quantity').setInvalid(getMessage('QtyTransferMustBeNumberTypeAndGreaterThan0Msg'));
			form.displayValidationResult();
		}
		
	},

	/**
	 * Click supply requisitions list item event handler
	 */
	onClickSupplyReqListItem: function(){
		var selectedRowIndex=this.supplyRequisitionItemListPanel.selectedRowIndex;
		var selectRowRecord=this.supplyRequisitionItemListPanel.gridRows.get(selectedRowIndex).getRecord();
		
		if(!selectRowRecord.isNew){
			var transferId=selectRowRecord.getValue('it.trans_id');
			if(valueExistsNotEmpty(transferId)){
				var supplyReqItemRes=new Ab.view.Restriction();
				supplyReqItemRes.addClause("it.trans_id",transferId,'=');
				this.supplyRequisitionEditForm.show(false);
				//this.supplyReqItemEditPanel.show(true);
				this.supplyReqItemEditPanel.refresh(supplyReqItemRes,false);
			}
		}
	},
	/**
	 * event handler after refresh supply requisition item list panel 
	 */
	supplyRequisitionItemListPanel_afterRefresh: function(){
		//The Add New button is only available if the Supply Requisition status is New or Ready for Transit.
		var supplyReqStatus=this.getSupplyReqStatusBySupplyRequisitionCode(this.supplyReqCode);
		if(supplyReqStatus=='New'||supplyReqStatus=='Ready for Transit'){
			this.supplyRequisitionItemListPanel.actions.get('btnAddNewSupplyReqItem').forceDisable(false);
		}else{
			this.supplyRequisitionItemListPanel.actions.get('btnAddNewSupplyReqItem').forceDisable(true);
		}
		//set title of grid panel
		this.supplyRequisitionItemListPanel.setTitle(getMessage('supplyReqItemTitle').replace('{0}',this.supplyReqCode).replace('{1}',this.fromStorageLocation).replace('{2}',this.toStorageLocation));
		
		
		this.supplyRequisitionItemListPanel.gridRows.each(function(row){
			var supplyReqItemStatus=row.getRecord().getValue('it.req_item_status');
			var transDate=row.getRecord().getValue('it.trans_date');
				transDate=View.controllers.get('supplyReqController').getIsoFormatDateCustom(transDate);
			var receivedButton=row.actions.get('it.btnItemReceived');
			if(supplyReqItemStatus=='Received'||supplyReqItemStatus=='Error'){
				receivedButton.enable(false);
			}else{
				receivedButton.enable(true);
			}
			
			if(supplyReqItemStatus!='Received'){
				row.cells.items[4].dom.innerHTML="";
			}else{
				row.cells.items[4].dom.innerHTML=transDate;
			}
		});
		
		
	},
	
	/**
	 * event handler after refresh supply requisition item edit panel
	 */
	supplyReqItemEditPanel_afterRefresh: function(){
		if(!this.supplyReqItemEditPanel.newRecord){
			this.enableFieldAndActionsBySupplyReqItemStatus();
		}else{
			this.supplyReqItemEditPanel.enableField("it.part_id",true);
			this.supplyReqItemEditPanel.enableField("it.trans_quantity",true);
		}
		
		
	},
	
	/**
	 * Enable fields and actions by supply requisition status of supply requisition status panel.
	 */
	enableFieldAndActionsBySupplyReqItemStatus: function(){
		
		var supplyReqItemRecord=this.supplyReqItemEditPanel.getRecord();
		var supplyReqitemStatus=supplyReqItemRecord.getValue('it.req_item_status');
		//Disable actions of the supply requisitions form
		this.supplyReqItemEditPanel.actions.get('btnSave').enable(false);
		this.supplyReqItemEditPanel.actions.get('btnDelete').enable(false);
		this.supplyReqItemEditPanel.actions.get('btnCancel').enable(false);
		
		
		this.supplyReqItemEditPanel.enableField("it.part_id",false);
		this.supplyReqItemEditPanel.enableField("it.trans_quantity",false);
		this.supplyReqItemEditPanel.enableField("it.comments",false);
		
		if(supplyReqitemStatus=="Received"||supplyReqitemStatus=="Error"){
			this.supplyReqItemEditPanel.enableField("it.req_item_status",false);
			this.supplyReqItemEditPanel.enableField("it.comments",false);
		}else{
			if(supplyReqitemStatus=="New"||supplyReqitemStatus=="Ready for Transit"){
				this.supplyReqItemEditPanel.enableField("it.part_id",true);
				this.supplyReqItemEditPanel.enableField("it.trans_quantity",true);
				
			}
			
			this.supplyReqItemEditPanel.enableField("it.req_item_status",true);
			
			this.supplyReqItemEditPanel.actions.get('btnSave').enable(true);
			
			if(supplyReqitemStatus!='In Transit'){
				this.supplyReqItemEditPanel.actions.get('btnDelete').enable(true);
				this.supplyReqItemEditPanel.enableField("it.comments",true);
			}
			this.supplyReqItemEditPanel.actions.get('btnCancel').enable(true);
		}
		
		if(supplyReqitemStatus!='Received'){
			this.supplyReqItemEditPanel.showField('it.trans_date',false);
			this.supplyReqItemEditPanel.showField('it.trans_time',false);
		}
	},
	/**
	 * Click 'Received' button of part inventory list panel
	 */
	onClickReceivedButtonInPartListPanel: function(){
		var selectRowIndex=this.supplyRequisitionItemListPanel.selectedRowIndex;
		var selectRowRecord=this.supplyRequisitionItemListPanel.gridRows.get(selectRowIndex).getRecord();
		
		var supplyReqId=selectRowRecord.getValue('it.supply_req_id');
		var partCode=selectRowRecord.getValue('it.part_id');
		var transId=selectRowRecord.getValue('it.trans_id');
		var fromStorageLocation=selectRowRecord.getValue('it.pt_store_loc_from');
		var toStorageLocation=selectRowRecord.getValue('it.pt_store_loc_to');
		var TransQty=parseFloat(selectRowRecord.getValue('it.trans_quantity'));
		//call WFR to receive parts and re-caculate the part count
		View.openProgressBar();
		try{
			var supplyReqStatus='Received';
			var result=Workflow.callMethod('AbBldgOpsBackgroundData-BldgopsPartInventoryService-transferPartsBetweenStorageLocationBySupplyReq',supplyReqId,transId,fromStorageLocation,toStorageLocation,partCode,TransQty,supplyReqStatus);
			if(result.code=="executed"){
				this.supplyRequisitionListPanel.refresh();
				this.supplyRequisitionItemListPanel.refresh();
				this.supplyRequisitionEditForm.show(false);
				this.supplyRequisitionEditForm.show(false);
				
				this.hiddePanelIfNotExistSupplyRequistionNotReceived(supplyReqId);
				View.closeProgressBar();
			}
		}catch(e){
			Workflow.handleError(e);
			View.closeProgressBar();
		}
	},
	/**
	 * Hidden Supply Requisition item panel if all supply requisition item in('Received','Error').
	 */
	hiddePanelIfNotExistSupplyRequistionNotReceived: function(supplyReqId){
		var itDs=View.dataSources.get('abMpiwItDS');
		var itRes=new Ab.view.Restriction();
			itRes.addClause('it.supply_req_id',supplyReqId,'=');
			itRes.addClause('it.req_item_status',['Received','Error'],'NOT IN');

		var itRecordLength=itDs.getRecords(itRes).length;
		
		if(itRecordLength==0){
			this.supplyRequisitionItemListPanel.show(false);
			this.supplyReqItemEditPanel.show(false);
		}
	},
	/**
	 * Click Add New button of supply requisitions items panel
	 */
	supplyRequisitionItemListPanel_onBtnAddNewSupplyReqItem: function(){
		this.supplyRequisitionEditForm.show(false);
		this.supplyReqItemEditPanel.refresh(null,true);
		
		//Get current date and time 
		var currentDate =new Date();
			currentDate=getIsoFormatDate(currentDate);
		var currentTime=getCurrentTimeIn24HourFormat();
		
		//Get current user's ID
		var currentUser=View.user.employee.id;
		
		this.supplyReqItemEditPanel.setFieldValue('it.req_item_status','New');
		this.supplyReqItemEditPanel.enableField('it.req_item_status',false);
		this.supplyReqItemEditPanel.setFieldValue('it.supply_req_id',this.supplyReqCode);
		this.supplyReqItemEditPanel.setFieldValue('it.pt_store_loc_from',this.fromStorageLocation);
		this.supplyReqItemEditPanel.setFieldValue('it.pt_store_loc_to',this.toStorageLocation);
		this.supplyReqItemEditPanel.setFieldValue('it.trans_date',currentDate);
		this.supplyReqItemEditPanel.setFieldValue('it.trans_time',currentTime);
		this.supplyReqItemEditPanel.setFieldValue('it.performed_by',currentUser);
	},
	/**
	 * Delete supply requisition record.
	 */
	supplyRequisitionEditForm_onBtnDelete: function(){
		var supplyReqId=this.supplyRequisitionEditForm.getFieldValue('supply_req.supply_req_id');
		
		var checked=this.checkDoesHaveItemAlreadyReceived(supplyReqId);
		if(!checked){
			View.confirm(getMessage('RecordWillBeDeleteConfirmMsg').replace('{0}',supplyReqId),function(button){
				if(button=='yes'){
					var supplyReqRes=new Ab.view.Restriction();
					supplyReqRes.addClause('supply_req.supply_req_id',supplyReqId);
					var supplyReqDs=View.dataSources.get('abMpiwSupplyReqStatusDS');
					var supplyReqRecord=supplyReqDs.getRecord(supplyReqRes);
					supplyReqDs.deleteRecord(supplyReqRecord);
					
					View.panels.get('supplyRequisitionEditForm').show(false);
					View.panels.get('supplyRequisitionListPanel').refresh();
					View.panels.get('supplyRequisitionItemListPanel').show(false);
					
				}
			});
		}else{
			View.alert(getMessage('supplyReqCantbeDeleteMsg'));
		}
		
	},
	/**
	 * Check weather exists item already received for selected supply requisition.
	 */
	checkDoesHaveItemAlreadyReceived: function(supplyReqId){
		var result=false;
		var itDs=View.dataSources.get('abMpiwItDS');
		var itRes=new Ab.view.Restriction();
		itRes.addClause('it.supply_req_id',supplyReqId,'=');
		itRes.addClause('it.req_item_status',['Received','Error'],'IN');
		var itRecords=itDs.getRecords(itRes);
		
		if(itRecords.length>0){
			result=true;
		}
		return result;
	},
	
	supplyReqItemEditPanel_onBtnDelete: function(){
		var transId=this.supplyReqItemEditPanel.getFieldValue('it.trans_id');
		var supplyReqId=this.supplyReqItemEditPanel.getFieldValue('it.supply_req_id');
		var itDs=View.dataSources.get('abMpiwItDS');
		var itRes=new Ab.view.Restriction();
		itRes.addClause('it.trans_id',transId,'=');
		
		var itRecord=itDs.getRecord(itRes);
		
		var reqItemStatus=itRecord.getValue('req_item_status');
		
		if((reqItemStatus!='Received')&&(reqItemStatus!='Error')){
			View.confirm(getMessage('RecordWillBeDeleteConfirmMsg').replace('{0}',transId),function(button){
				if(button=='yes'){
					var panelRecord=View.panels.get('supplyReqItemEditPanel').getRecord();
					panelRecord.removeValue('it.QuanityAvailableFrom');
					View.dataSources.get('abMpiwItDetailDS').deleteRecord(panelRecord);
					View.panels.get('supplyReqItemEditPanel').show(false);
					View.panels.get('supplyRequisitionItemListPanel').refresh();
					
					//kb#3051929 When last item is deleted, we should automaticly delete the requisition/purchase order
					//delete purchase order if does not have purchase order item.
					var result=View.controllers.get('supplyReqController').checkIfExistSupplyReqItemDoNotDelete(supplyReqId);
					if(!result){
						
						var supplyReqRes=new Ab.view.Restriction();
							supplyReqRes.addClause('supply_req.supply_req_id',supplyReqId,'=');
						var supplyReqRecord=View.dataSources.get('abMpiwSupplyReqStatusDS').getRecord(supplyReqRes);
						
						View.dataSources.get('abMpiwSupplyReqStatusDS').deleteRecord(supplyReqRecord);
						View.panels.get('supplyRequisitionItemListPanel').show(false);
						View.panels.get('supplyRequisitionListPanel').refresh();
					}else{
						//change supply requisiton status if only exists Received or Error status of item.
						View.controllers.get('supplyReqController').changeSupplyReqStatusAfterDelete(supplyReqId);
					}
				}
			});
			
		}else{
			View.alert(getMessage('supplyReqItemDeleteErrorMsg'));
		}
		
		
	},
	
	changeSupplyReqStatusAfterDelete: function(supplyReqId){
		//get all supply requisition item
		var reqDs=View.dataSources.get('abMpiwSupplyReqStatusDS');
		var reqRes=new Ab.view.Restriction();
			reqRes.addClause('supply_req.supply_req_id',supplyReqId,'=');
		var reqRecord=reqDs.getRecord(reqRes);
		var reqItemDs=View.dataSources.get('abMpiwItDetailDS');
		//check requisition have Received or Error status item
		var itemRes=new Ab.view.Restriction();
			itemRes.addClause('it.supply_req_id',supplyReqId,'=');
			itemRes.addClause('it.req_item_status','Received','=',')AND(');
			itemRes.addClause('it.req_item_status','Error','=','OR');
		var itemRecords=reqItemDs.getRecords(itemRes);

		if(itemRecords.length>0){
			//check if exists status not in ('Received','Error')
			var itemOtherStatusRes=new Ab.view.Restriction();
				itemOtherStatusRes.addClause('it.supply_req_id',supplyReqId,'=');
				itemOtherStatusRes.addClause('it.req_item_status',['Received','Error'],'NOT IN');
			var itemOtherStatusRecords=reqItemDs.getRecords(itemOtherStatusRes);
			if(itemOtherStatusRecords.length==0){
				var itemReceivedRes=new Ab.view.Restriction();
					itemReceivedRes.addClause('it.supply_req_id',supplyReqId,'=');
					itemReceivedRes.addClause('it.req_item_status','Received','=');
				var itemReceivedRecords=reqItemDs.getRecords(itemReceivedRes);
				
				var itemErrorRes=new Ab.view.Restriction();
					itemErrorRes.addClause('it.supply_req_id',supplyReqId,'=');
					itemReceivedRes.addClause('it.req_item_status','Error','=');
				var itemErrorRecords=reqItemDs.getRecords(itemErrorRes);
				
				var finalStatus="";
				if(itemReceivedRecords.length>0&&itemErrorRecords.length>0){
					finalStatus="Partially Received";
				}
				
				if(itemReceivedRecords.length==0){
					finalStatus="Error";
				}
				
				if(itemErrorRecords.length==0){
					finalStatus="Received";
				}
				
				reqRecord.setValue('supply_req.status',finalStatus,'=');
				reqDs.saveRecord(reqRecord);
				View.panels.get('supplyRequisitionListPanel').refresh();
				var notReceivedChecked=document.getElementById('receivedCkbx').checked;
				if(notReceivedChecked){
					View.panels.get('supplyRequisitionItemListPanel').show(false);
				}
				
			}
		}
		
	},
	
	/**
	 * Check if exists supply requisition item does not delete.
	 * @param supplyReqId Supply requisition code
	 */
	checkIfExistSupplyReqItemDoNotDelete: function(supplyReqId){
		var result=true;
		var itDs=View.dataSources.get('abMpiwItDS');
		var itRes=new Ab.view.Restriction();
			itRes.addClause('it.supply_req_id',supplyReqId,'=');
			
		var length=itDs.getRecords(itRes).length;
		if(length==0){
			result=false;
		}
		
		return result;
	},
	
	/**
	 * Get ISO format date MM/DD/YYYY
	 * 
	 * @param date : Date, date object
	 */
	getIsoFormatDateCustom: function(date){
	    var month = date.getMonth() + 1;
	    if (month < 10) 
	        month = month; // bug error fixed
	    var day = date.getDate();
	    if (day < 10) 
	        day = day; // bug error fixed
	    // not valid before 1970
	    return  month + "/" + day+ "/"+date.getFullYear();
	},
	
	openExportPdfDialog: function(fileType){
		var selectRowRecords=this.supplyRequisitionListPanel.getSelectedRecords();
		if(selectRowRecords.length==0){
			View.alert(getMessage("exportSupplyReqMsg"));
		}else{
			var supplyReqIdsInConditionClause="supply_req.supply_req_id in (";
			for(var i=0;i<selectRowRecords.length;i++){
				supplyReqIdsInConditionClause += selectRowRecords[i].getValue('supply_req.supply_req_id');
				if(i!=selectRowRecords.length-1){
					supplyReqIdsInConditionClause += ","
				}
				
			}
			supplyReqIdsInConditionClause +=")";
			var pdfParameters = {};
			pdfParameters['supplyReqIds']=supplyReqIdsInConditionClause;
			
			if(fileType=="pdf"){
				View.openPaginatedReportDialog("ab-supply-req-edit-detail-report-pdf.axvw", null, pdfParameters);
			}
			
			if(fileType=="docx"){
				View.openPaginatedReportDialog("ab-supply-req-edit-detail-report-docx.axvw", null, pdfParameters);
			}
			
		}
		
	}
});

function afterSelectPart(fieldName, selectValue, preValue){
	if(fieldName=='it.part_id'){
		var storeLocId=View.controllers.get('supplyReqController').fromStorageLocation;
		var qtyOnHand=getQuanityAvailableFromPtStore(storeLocId,selectValue);
		var ds=View.dataSources.get('ptStoreLocDs');
		View.panels.get('supplyReqItemEditPanel').setFieldValue('it.QuanityAvailableFrom',ds.formatValue('pt_store_loc_pt.qty_on_hand',qtyOnHand,true));
		View.panels.get('supplyReqItemEditPanel').setFieldValue('part_id',selectValue);
	}
}
/**
 * get quantity available value from pt_store_loc_pt table.
 * @param storeLocId Storage location code
 * @param partId Part code
 * @returns {String} quantity Available.
 */
function getQuanityAvailableFromPtStore(storeLocId,partId){
	var qtyOnHand=0;
	var storeLocDs=View.dataSources.get('ptStoreLocDs');
	
	var storeLocRes=new Ab.view.Restriction();
		storeLocRes.addClause('pt_store_loc_pt.pt_store_loc_id',storeLocId,'=');
		storeLocRes.addClause('pt_store_loc_pt.part_id',partId,'=');
	
	var storeRecords=storeLocDs.getRecords(storeLocRes);
	
	if(storeRecords.length>0){
		qtyOnHand=storeRecords[0].getValue('pt_store_loc_pt.qty_on_hand');
	}
	
	qtyOnHand=parseFloat(qtyOnHand).toFixed(2);
	
	return qtyOnHand;
}