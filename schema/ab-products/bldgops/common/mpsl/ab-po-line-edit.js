var poLineEditController=View.createController('poLineEditController',{
	//Part code in console form.
	selectPartCode: "",
	//Receiving location.
	selectPoId: "",
	//Selected Vendor Code.
	selectVnId:"",
	selectReceivingLocation: "",
	//Po status when selected
	poStatus: "",
	//purchase order status dom
	statusOptionDom: null,
	
	afterViewLoad: function(){
		this.statusOptionDom = jQuery(this.purchaseOrderInfo.fields.get('po.status').dom);
		this.abPoLineEditForm.fields.get("po_line.catno").actions.get(0).command.commands[0].beforeSelect = this.beforeCatNoSelectCf.createDelegate(this);
		
	},
	afterInitialDataFetch: function(){
		this.purchaseOrderListPanel.addParameter('receiveOrNotParameter',"po.status not in('Received','Partially Received','Error')");
		this.purchaseOrderListPanel.refresh();
	},
	/**
     * Called before click select value of po_line.catno
     */
    beforeCatNoSelectCf : function(command) {
        var restriction = new Ab.view.Restriction();
        restriction.addClause('pv.vn_id',this.selectVnId,'=');
        restriction.addClause('pv.vn_pt_num',null,'IS NOT NULL');
        command.dialogRestriction = restriction;
    },
	purchaseOrderInfo_beforeRefresh: function(){
		var newStatusOption = this.statusOptionDom.clone();
		newStatusOption.replaceAll(this.purchaseOrderInfo.fields.get('po.status').dom);
		this.purchaseOrderInfo.fields.get('po.status').dom = newStatusOption.get(0);
	},
	purchaseOrderInfo_afterRefresh: function(){
		this.purchaseOrderInfo.setTitle(getMessage('poEditInfoTitle').replace('{0}',this.selectPoId));
	},
	
	/**
	 * Show or hide big bad filter
	 */
	consoleForm_onBtnMoreOrLess : function() {
		this.consoleMoreForm.toggleCollapsed();
		var action=this.consoleForm.actions.get('btnMoreOrLess');
		action.setTitle(this.consoleMoreForm.collapsed ? getMessage('filterMore') : getMessage('filterLess'));
	},
	/**
	 * Click Show button to refresh the purchase order list based on the filter criteria.
	 */
	consoleForm_onBtnShow: function(){
		
		if(!this.consoleMoreForm.collapsed){
			this.consoleMoreForm.toggleCollapsed();
			this.consoleForm.actions.get('btnMoreOrLess').setTitle(getMessage('filterMore'));
		}
		var poNumber=this.consoleForm.getFieldValue('po.po_number');
		var vnId=this.consoleForm.getFieldValue('po.vn_id');
		var receiveLoc=this.consoleForm.getFieldValue('po.receiving_location');
		var partCode=this.consoleForm.getFieldValue('po.partId');
		var dateRequestFrom=this.consoleMoreForm.getFieldValue('date_request_from');
		var dateRequestTo=this.consoleMoreForm.getFieldValue('date_request_to');
		var acId=this.consoleMoreForm.getFieldValue('po.ac_id');
		var poStatus=this.consoleMoreForm.getFieldValue('po.status');
		var isUnderstockedChecked=document.getElementById('receivedCkbx').checked;

		if(valueExistsNotEmpty(dateRequestFrom)&&valueExistsNotEmpty(dateRequestTo)){
			if (compareISODates(dateRequestTo, dateRequestFrom)){
				View.alert(getMessage('dateRequestedFromCannotEarlierThanDateRequestedToMsg'));
				return;
			}
		}

		var poRestriction=new Ab.view.Restriction();
		if(valueExistsNotEmpty(poNumber)){
			poRestriction.addClause('po.po_number',poNumber+'%','LIKE');
		}
		if(valueExistsNotEmpty(vnId)){
			poRestriction.addClause('po.vn_id',vnId+'%','LIKE');
		}
		if(valueExistsNotEmpty(receiveLoc)){
			poRestriction.addClause('po.receiving_location',receiveLoc+'%','LIKE');
		}
		if(valueExistsNotEmpty(partCode)){
			this.selectPartCode=partCode;
			this.purchaseOrderListPanel.addParameter('partIdParameter',"po.vn_id in (select vn_id from pv where pv.part_id='"+partCode+"' and pv.vn_pt_num in (select catno from po_line where po_line.po_id=po.po_id))");
		}else{
			this.purchaseOrderListPanel.addParameter('partIdParameter','1=1');
			this.selectPartCode="";
		}
		if(valueExistsNotEmpty(dateRequestFrom)){
			poRestriction.addClause('po.date_request',dateRequestFrom,'&gt;=');
		}
		if(valueExistsNotEmpty(dateRequestTo)){
			poRestriction.addClause('po.date_request',dateRequestTo,'&lt;=');
		}
		if(valueExistsNotEmpty(acId)){
			poRestriction.addClause('po.ac_id',acId+'%','LIKE');
		}
		if(valueExistsNotEmpty(poStatus)){
			poRestriction.addClause('po.status',poStatus,'=');
		}
		if(isUnderstockedChecked){
			this.purchaseOrderListPanel.addParameter('receiveOrNotParameter',"po.status not in('Received','Partially Received','Error')");
		}else{
			this.purchaseOrderListPanel.addParameter('receiveOrNotParameter','1=1');
		}
		
		this.purchaseOrderListPanel.refresh(poRestriction);
		
		//Hidden purchase order edit froms
		this.purchaseOrderInfo.show(false);
		this.purchaseOrderDetail.show(false);
		this.shippingAndBillingForm.show(false);
		
		//Hidden purchase order item edit forms
		this.abPoLineEditForm.show(false);
		
		this.abPoLineList.show(false);
		
	},
	
	consoleForm_onBtnClear: function(){
		this.consoleForm.clear();
		this.consoleMoreForm.clear();
		this.selectPartCode="";
		document.getElementById('receivedCkbx').checked=true;
	},
	
	onClickPurchaseOrderList: function(){
		var selectRowIndex=this.purchaseOrderListPanel.selectedRowIndex;
		var selectRowRecord=this.purchaseOrderListPanel.gridRows.get(selectRowIndex).getRecord();
		
		var poId=selectRowRecord.getValue('po.po_id');
		this.selectPoId=poId;
		var vnId=selectRowRecord.getValue('po.vn_id');
		this.selectVnId=vnId;
		var receiveLocation=selectRowRecord.getValue('po.receiving_location');
		//Set receiving location to global environment.
		this.selectReceivingLocation=receiveLocation;
		var poStatus=selectRowRecord.getValue('po.status');
		this.poStatus=poStatus;
		
		var poRes=new Ab.view.Restriction();
		poRes.addClause('po.po_id',poId,'=');
		
		var poLineRes=new Ab.view.Restriction();
		poLineRes.addClause('po_line.po_id',poId,'=');
		
		//Hidden purchase order item panel
		this.abPoLineEditForm.show(false);
		
		this.purchaseOrderInfo.refresh(poRes);
		this.purchaseOrderInfo.setTitle(getMessage('poEditInfoTitle').replace('{0}',poId));
		this.purchaseOrderDetail.refresh(poRes);
		this.shippingAndBillingForm.refresh(poRes);
		
		this.enablePurchaseOrderFormFields();
		if(valueExistsNotEmpty(this.selectPartCode)){
			this.abPoLineList.addParameter('partCodeParameter', "po_line.catno in (select vn_pt_num from pv where part_id='"+this.selectPartCode+"')");
		}else{
			this.abPoLineList.addParameter('partCodeParameter','1=1');
		}
		
		this.abPoLineList.addParameter('poId',poId);
		
		this.abPoLineList.refresh(poLineRes);
		this.abPoLineList.setTitle(getMessage('poLineListPanelTitle').replace('{0}',poId).replace('{1}',vnId).replace('{2}',receiveLocation));
	},
	/**
	 * Enable or disable purchase order form by purchase order status.
	 */
	enablePurchaseOrderFormFields: function(){
		var poStatus=this.purchaseOrderInfo.getFieldValue('po.status');
		this.purchaseOrderInfo.enableField('po.vn_id',false);
		this.purchaseOrderInfo.enableField('po.receiving_location',false);
		this.purchaseOrderInfo.enableField('po.status',false);
		this.purchaseOrderInfo.enableField('po.comments',false);
		
		
		this.purchaseOrderDetail.enableField('po.ac_id',false);
		this.purchaseOrderDetail.enableField('po.po_number',false);
		this.purchaseOrderDetail.enableField('po.source',false);
		this.purchaseOrderDetail.enableField('po.federal_tax',false);
		this.purchaseOrderDetail.enableField('po.em_id',false);
		this.purchaseOrderDetail.enableField('po.state_tax',false);
		this.purchaseOrderDetail.enableField('po.shipping',false);
		
		this.purchaseOrderDetail.actions.get('btnApproved').show(false);
		this.purchaseOrderDetail.actions.get('btnRejected').show(false);
		
		this.shippingAndBillingForm.enableField('po.shipping_em_id',false);
		this.shippingAndBillingForm.enableField('po.billing_em_id',false);
		this.shippingAndBillingForm.enableField('po.ship_address1',false);
		this.shippingAndBillingForm.enableField('po.bill_address1',false);
		this.shippingAndBillingForm.enableField('po.ship_address2',false);
		this.shippingAndBillingForm.enableField('po.bill_address2',false);
		this.shippingAndBillingForm.enableField('po.ship_city_id',false);
		this.shippingAndBillingForm.enableField('po.bill_city_id',false);
		this.shippingAndBillingForm.enableField('po.ship_state_id',false);
		this.shippingAndBillingForm.enableField('po.bill_state_id',false);
		this.shippingAndBillingForm.enableField('po.ship_zip',false);
		this.shippingAndBillingForm.enableField('po.bill_zip',false);
		
		
		this.abPoLineList.actions.get('btnAddNew').enable(false);
		
		if(poStatus=="Requested"||poStatus=="Rejected"){
			this.purchaseOrderInfo.enableField('po.vn_id',true);
			this.purchaseOrderInfo.enableField('po.receiving_location',true);
			
			this.purchaseOrderDetail.enableField('po.ac_id',true);
			this.purchaseOrderDetail.enableField('po.po_number',true);
			this.purchaseOrderDetail.enableField('po.source',true);
			
			this.purchaseOrderDetail.enableField('po.federal_tax',true);
			this.purchaseOrderDetail.enableField('po.state_tax',true);
			this.purchaseOrderDetail.enableField('po.shipping',true);
			this.purchaseOrderDetail.enableField('po.em_id',true);
			
			this.abPoLineList.actions.get('btnAddNew').enable(true);
			//Users who are in the “PO APPROVER” security group will have the ability to approve or reject purchase orders.
			//This is done in the Edit Purchase Order panel.  Buttons for Approve and Reject will appear if the Order Details panel if the status = Requested
			if(poStatus=="Requested"){
				if(View.user.isMemberOfGroup('PO APPROVER')){
					this.purchaseOrderDetail.actions.get('btnApproved').show(true);
					this.purchaseOrderDetail.actions.get('btnRejected').show(true);
				}
			}
		}else{
			//KB#3052063 The following fields should be editable if the purchase order status is Requested or Rejected, of if the user is in the PO APPROVER security group.
			if(View.user.isMemberOfGroup('PO APPROVER')){
				this.purchaseOrderDetail.enableField('po.ac_id',true);
				this.purchaseOrderDetail.enableField('po.po_number',true);
				this.purchaseOrderDetail.enableField('po.source',true);
			}
		}
		
		if(poStatus=="Rejected"||poStatus=="Approved"||poStatus=="Issued"){
			this.purchaseOrderInfo.enableField('po.status',true);
			if(poStatus=='Approved'){
				this.abPoLineList.actions.get('btnAddNew').enable(true);
			}
		}
		
		if(poStatus!="Received"&&poStatus!="Partially Received"&&poStatus!="Error"){
			
			this.purchaseOrderInfo.enableField('po.comments',true);
			
			this.shippingAndBillingForm.enableField('po.shipping_em_id',true);
			this.shippingAndBillingForm.enableField('po.billing_em_id',true);
			this.shippingAndBillingForm.enableField('po.ship_address1',true);
			this.shippingAndBillingForm.enableField('po.bill_address1',true);
			this.shippingAndBillingForm.enableField('po.ship_address2',true);
			this.shippingAndBillingForm.enableField('po.bill_address2',true);
			this.shippingAndBillingForm.enableField('po.ship_city_id',true);
			this.shippingAndBillingForm.enableField('po.bill_city_id',true);
			this.shippingAndBillingForm.enableField('po.ship_state_id',true);
			this.shippingAndBillingForm.enableField('po.bill_state_id',true);
			this.shippingAndBillingForm.enableField('po.ship_zip',true);
			this.shippingAndBillingForm.enableField('po.bill_zip',true);
		}
		
		//Remove purchase order status of 'Received' or 'Partially Received' or 'Error'
		var poStatusField=this.purchaseOrderInfo.fields.get('po.status').dom;
		
		for(var i=poStatusField.length-1;i>0;i--){
			if(poStatusField[i].value=='Received'||poStatusField[i].value=='Partially Received'||poStatusField[i].value=='Error'){
				if(this.poStatus!='Received'&&this.poStatus!='Partially Received'&&this.poStatus!='Error'){
					poStatusField.remove(i);
				}
				
			}else{
				//If po status is 'Rejected' , 'Issued' status should not display in PO status field.
				if(poStatusField[i].value=='Issued'){
					if(this.poStatus=="Rejected"){
						poStatusField.remove(i);
					}
				}else if(poStatusField[i].value=='Rejected'){
					if(this.poStatus!="Rejected"){
						poStatusField.remove(i);
					}
				}else if(poStatusField[i].value=='Approved'){
					if(this.poStatus!="Approved"){
						poStatusField.remove(i);
					}
				}	
				
			}
			
		}
		
	},
	
	
	onClickPurchaseOrderListItem: function(){
		var selectRowIndex=this.abPoLineList.selectedRowIndex;
		var selectRowRecord=this.abPoLineList.gridRows.get(selectRowIndex).getRecord();
		
		var poId=selectRowRecord.getValue('po_line.po_id');
		var poLineId=selectRowRecord.getValue('po_line.po_line_id');
		
		var poLineRes=new Ab.view.Restriction();
		poLineRes.addClause('po_line.po_id',poId,'=');
		poLineRes.addClause('po_line.po_line_id',poLineId,'=');
		
		//Hidden purchase order edit froms
		this.purchaseOrderInfo.show(false);
		this.purchaseOrderDetail.show(false);
		this.shippingAndBillingForm.show(false);
		//add parameter poId to purchase order line edit form.
		this.abPoLineEditForm.addParameter('poId',poId);
		//Show purchase order item edit forms
		this.abPoLineEditForm.refresh(poLineRes,false);
		
		//this.enablePurchaseOrderItemFormFields();
		
	},
	
	abPoLineEditForm_afterRefresh: function(){
		this.enablePurchaseOrderItemFormFields();
	},
	
	enablePurchaseOrderItemFormFields: function(){
		var status=this.abPoLineEditForm.getFieldValue('po_line.status');
		
		this.abPoLineEditForm.actions.get('btnSave').enable(false);
		this.abPoLineEditForm.actions.get('btnDelete').enable(false);
		
		this.abPoLineEditForm.enableField('po_line.status',false);
		this.abPoLineEditForm.enableField('po_line.catno',false);
		this.abPoLineEditForm.enableField('po_line.description',false);
		this.abPoLineEditForm.enableField('po_line.quantity',false);
		this.abPoLineEditForm.enableField('po_line.unit_cost',false);
		this.abPoLineEditForm.enableField('po_line.em_id',false);
		
		if(status!='Received'&&status!='Error'){
			this.abPoLineEditForm.actions.get('btnSave').enable(true);
			
			this.abPoLineEditForm.enableField('po_line.em_id',true);
			this.abPoLineEditForm.enableField('po_line.status',true);
			if(status=='Not Yet Issued'){
				this.abPoLineEditForm.actions.get('btnDelete').enable(true);
				this.abPoLineEditForm.enableField('po_line.catno',true);
				this.abPoLineEditForm.enableField('po_line.description',true);
				this.abPoLineEditForm.enableField('po_line.quantity',true);
				this.abPoLineEditForm.enableField('po_line.unit_cost',true);
			}
		}
	},
	
	onclickPurchaseOrderItemReceivedButton: function(){
		var selectRowIndex=this.abPoLineList.selectedRowIndex;
		var selectRowRecord=this.abPoLineList.gridRows.get(selectRowIndex).getRecord();
		var poId=selectRowRecord.getValue('po_line.po_id');
		var poLineId=selectRowRecord.getValue('po_line.po_line_id');
		var partCode=selectRowRecord.getValue('po_line.partId');
		var receivingLocation=this.selectReceivingLocation;
		var transQty=selectRowRecord.getValue('po_line.quantity');
		var unitCost=selectRowRecord.getValue('po_line.unit_cost');
		//get shipping and tax
		var shippingAndTax=selectRowRecord.getValue('po_line.cfShippingTaxes');
		//get per quantity shipping and Tax
		var perShippingAndTax=0;
		if(parseFloat(transQty)==0){
			perShippingAndTax=(parseFloat(shippingAndTax)/99999999.999999).toFixed(2);
		}else{
			perShippingAndTax=(parseFloat(shippingAndTax)/parseFloat(transQty)).toFixed(2);
		}
		
		if(!valueExistsNotEmpty(transQty)){
			transQty=0;
		}
		transQty=parseFloat(transQty);
		
		if(!valueExistsNotEmpty(unitCost)){
			unitCost=0;
		}
		unitCost=parseFloat(unitCost);
		View.openProgressBar();
		//setPurchaseOrderTobeReceivedOrError(poId, poLineId, partCode,transQty, status);
		try{
			//add shipping and tax to current unit cost
			unitCost=parseFloat(unitCost)+parseFloat(perShippingAndTax);
			var result = Workflow.callMethod("AbBldgOpsBackgroundData-BldgopsPartInventoryService-setPurchaseOrderTobeReceivedOrError", poId, poLineId,partCode,receivingLocation,transQty,unitCost,"Received");
			if(result.code=="executed"){
				View.panels.get('abPoLineList').refresh();
				View.panels.get('purchaseOrderListPanel').refresh();
				
				//Hidden purchase order edit froms
				this.purchaseOrderInfo.show(false);
				this.purchaseOrderDetail.show(false);
				this.shippingAndBillingForm.show(false);
				
				//Hidden purchase order item edit forms
				this.abPoLineEditForm.show(false);
				
				this.hiddePanelIfNotExistPurchaseOrderItemNotReceived(poId);
				View.closeProgressBar();
			}
		}catch (e) {
			var message = "Save Purchase Order failed";
			View.showMessage('error', message, e.message, e.data);
			View.closeProgressBar();
		}
		
	},
	
	/**
	 * Hidden Purchase Order item panel if do not exists purchase order item in('Received','Error').
	 */
	hiddePanelIfNotExistPurchaseOrderItemNotReceived: function(poId){
		var poLineDs=View.dataSources.get('abPoLineEditPoLineDeleteDs');
		var poLineRes=new Ab.view.Restriction();
			poLineRes.addClause('po_line.po_id',poId,'=');
			poLineRes.addClause('po_line.status',['Received','Error'],'NOT IN');

		var itRecordLength=poLineDs.getRecords(poLineRes).length;
		
		if(itRecordLength==0){
			this.abPoLineList.show(false);
			this.abPoLineEditForm.show(false);
		}
	},
	
	abPoLineEditForm_onBtnSave: function(){
		
		var poId=this.abPoLineEditForm.getFieldValue('po_line.po_id');
		var poLineId=this.abPoLineEditForm.getFieldValue('po_line.po_line_id');
		var partCode=this.abPoLineEditForm.getFieldValue('po_line.partId');
		var receivingLocation=this.selectReceivingLocation;
		var status=this.abPoLineEditForm.getFieldValue('po_line.status');
		var transQty=this.abPoLineEditForm.getFieldValue('po_line.quantity');
		var unitCost=this.abPoLineEditForm.getFieldValue('po_line.unit_cost');
		var catNo=this.abPoLineEditForm.getFieldValue('po_line.catno');
		
		if(!valueExistsNotEmpty(transQty)){
			transQty=0;
		}
		transQty=parseFloat(transQty);
		if(!valueExistsNotEmpty(unitCost)){
			unitCost=0;
		}
		unitCost=parseFloat(unitCost);
		
		if(this.abPoLineEditForm.canSave()){
			
			var checkResult=this.checkCatNotExistsInPvTable(catNo);
			if(!checkResult){
				View.alert(getMessage('catNoMustExsitsInPvMsg'));
				return;
			}
			
			if(transQty<=0||unitCost<=0){
				View.alert(getMessage('quantityAndCostMustGreaterThan0Msg'));
				return;
			}
			
			var poLineRecord=this.abPoLineEditForm.getRecord();
			poLineRecord.removeValue('po_line.partId');
			poLineRecord.removeValue('po_line.lineCost');
			var formSaved=this.abPoLineEditPoLineDeleteDs.saveRecord(poLineRecord);
			//get per quantity shipping and tax from P.O Line record.
			var perShippingAndTax=this.getPerShippingAndTaxFromPoLine(poId,poLineId,transQty);
			//var formSaved=this.abPoLineEditForm.save();
			this.abPoLineEditForm.refresh();
			try{ 
				View.openProgressBar();
				//add shipping and tax to current unit cost
				unitCost=parseFloat(unitCost)+parseFloat(perShippingAndTax);
				
				var result = Workflow.callMethod("AbBldgOpsBackgroundData-BldgopsPartInventoryService-setPurchaseOrderTobeReceivedOrError", poId, poLineId,partCode,receivingLocation,transQty,unitCost,status);
				if(result.code=="executed"){
					View.panels.get('abPoLineList').refresh();
					View.panels.get('purchaseOrderListPanel').refresh();

					this.hiddePanelIfNotExistPurchaseOrderItemNotReceived(poId);
					
					this.changePoStatusAndReCalculateAfterSave(poId);
					View.closeProgressBar();
				}
			}catch (e) {
				var message = "Save Purchase Order Item failed";
				View.showMessage('error', message, e.message, e.data);
				View.closeProgressBar();
			}
		}
		
	},
	
	getPerShippingAndTaxFromPoLine: function(poId,poLineId,transQty){
		var poLineDs=View.dataSources.get('abPoLineEditPoLineDs');
		var poLineRes=new Ab.view.Restriction();
			poLineRes.addClause('po_line.po_id',poId,'=');
			poLineRes.addClause('po_line.po_line_id',poLineId,'=');
		poLineDs.addParameter('poId',poId);
		var poLineRecord=poLineDs.getRecord(poLineRes);
		//get shipping and tax
		var shippingAndTax=poLineRecord.getValue('po_line.cfShippingTaxes');
		//get per quantity shipping and Tax
		var perShippingAndTax=0;
		if(parseFloat(transQty)==0){
			perShippingAndTax=(parseFloat(shippingAndTax)/99999999.999999).toFixed(2);
		}else{
			perShippingAndTax=(parseFloat(shippingAndTax)/parseFloat(transQty)).toFixed(2);
		}
		
		return perShippingAndTax;
		
	},
	/**
	 * Change Purchase Order status and re-calculate the Amount Approved value after saved is P.O. status is remaining 'Approved'
	 * 
	 */
	changePoStatusAndReCalculateAfterSave: function(poId){
		var poRes=new Ab.view.Restriction();
			poRes.addClause('po.po_id',poId,'=');
		var poRecord=this.abPoLineEditPoDs.getRecord(poRes);
		var poStatus=poRecord.getValue('po.status');
		var approvedBy=poRecord.getValue('po.approved_by');
		var loginUser=View.user.employee.id;
		
		var beforeStatus='';
		var afterStatus='';
		
		if(poStatus=='Approved'){
			if(View.user.isMemberOfGroup('PO APPROVER')){
				//If the user did approve that purchase order already, then the status will remain as Approved, but the system should automatically update the values of Date Approved and Amount Approved to the new date and Total Cost.
				if(approvedBy==loginUser){
					beforeStatus='Approved';
					afterStatus='Approved';
				}else{
					//If the user did not approve that purchase order, and the status is updated to Requested, then the values of Date Approved, Approved By, and Amount Approved should be set back to NULL or 0.
					beforeStatus='Approved';
					afterStatus='Requested';
				}
			}else{
				beforeStatus='Approved';
				afterStatus='Requested';
			}
			
			
			try{
				poId=parseInt(poId);
				
				var result=Workflow.callMethod("AbBldgOpsBackgroundData-BldgopsPartInventoryService-updatePurchaseOrderInfoByPoStatus", poId,beforeStatus,afterStatus);
				if(result.code=="executed"){
					View.panels.get('purchaseOrderListPanel').refresh();
				}
			}catch (e) {
				var message = "Update Purchase Order Status failed";
				View.showMessage('error', message, e.message, e.data);
			}
		}
	},
	
	checkCatNotExistsInPvTable: function(catNo){
		var result=false;
		var pvDs=View.dataSources.get('pvDs');
		var pvRes=new Ab.view.Restriction();
		pvRes.addClause('pv.vn_pt_num',catNo,'=');
		var pvRecordsLength=pvDs.getRecords(pvRes).length;
		
		if(pvRecordsLength>0){
			result=true;
		}
		return result;
	},
	
	abPoLineList_onBtnAddNew: function(){
		this.abPoLineEditForm.refresh(null,true);
		this.abPoLineEditForm.setFieldValue('po_line.po_id',this.selectPoId);
		this.abPoLineEditForm.enableField('po_line.status',false);
		
		var nextPoLineNumber=this.getNextPoLineNumberByPoId(this.selectPoId);
		this.abPoLineEditForm.setFieldValue('po_line.po_line_id',nextPoLineNumber);
		this.abPoLineEditForm.setFieldValue('po_line.em_id',View.user.employee.id);
		//Hidden purchase order edit froms
		this.purchaseOrderInfo.show(false);
		this.purchaseOrderDetail.show(false);
		this.shippingAndBillingForm.show(false);
		
	},
	
	abPoLineList_afterRefresh: function(){
		this.abPoLineList.setTitle(getMessage('poLineListPanelTitle').replace('{0}',this.selectPoId).replace('{1}',this.selectVnId).replace('{2}',this.selectReceivingLocation));
		this.abPoLineList.gridRows.each(function(row){
			var rowRecord=row.getRecord();
			var status=rowRecord.getValue('po_line.status');
			var poStatus=rowRecord.getValue('po.status');
			if(status=='Received'||status=='Error'){
				row.actions.get('btnReceived').enable(false);
			}else{
				if(poStatus!='Approved'&&poStatus!='Issued'){
					row.actions.get('btnReceived').enable(false);
				}else{
					row.actions.get('btnReceived').enable(true);
				}
			}
		});
	},
	
	abPoLineEditForm_onBtnDelete: function(){
		
		View.confirm(getMessage('makeSureDeletePoLineItemMsg'),function(button){
			if(button=='yes'){
				var poId=View.panels.get('abPoLineEditForm').getFieldValue('po_line.po_id');
				var poLineId=View.panels.get('abPoLineEditForm').getFieldValue('po_line.po_line_id');
				
				var poLineRes=new Ab.view.Restriction();
				poLineRes.addClause('po_line.po_id',poId,'=');
				poLineRes.addClause('po_line.po_line_id',poLineId,'=');
				
				var poLineDs=View.dataSources.get('abPoLineEditPoLineDeleteDs');
				
				var poLineRecord=poLineDs.getRecord(poLineRes);
				
				poLineDs.deleteRecord(poLineRecord);
				
				View.panels.get('abPoLineEditForm').show(false);
				View.panels.get('abPoLineList').refresh();
				//kb#3051929 When last item is deleted, we should automaticly delete the requisition/purchase order
				//delete purchase order if does not have purchase order item.
				var result=View.controllers.get('poLineEditController').checkIfExistPoLineDoNotDelete(poId);
				if(!result){
					
					var poRes=new Ab.view.Restriction();
					poRes.addClause('po.po_id',poId,'=');
					var poRecord=View.dataSources.get('abPoLineEditPoDetailDs').getRecord(poRes);
					
					View.dataSources.get('abPoLineEditPoDetailDs').deleteRecord(poRecord);
					View.panels.get('abPoLineList').show(false);
					View.panels.get('purchaseOrderListPanel').refresh();
				}else{
					View.controllers.get('poLineEditController').changePoStatusAfterDelete(poId);
				}
			}
		});
		
		
	},
	
	changePoStatusAfterDelete: function(poId){
		//get all supply requisition item
		var poDs=View.dataSources.get('abPoStatusDs');
		
		var poRes=new Ab.view.Restriction();
			poRes.addClause('po.po_id',poId,'=');
		var poRecord=poDs.getRecord(poRes);
		
		var poLineDs=View.dataSources.get('abPoLineEditPoLineDeleteDs');
		//check requisition have Received or Error status item
		var poLineRes=new Ab.view.Restriction();
			poLineRes.addClause('po_line.po_id',poId,'=');
			poLineRes.addClause('po_line.status','Received','=',')AND(');
			poLineRes.addClause('po_line.status','Error','=','OR');
		var poLineRecords=poLineDs.getRecords(poLineRes);

		if(poLineRecords.length>0){
			//check if exists status not in ('Received','Error')
			var poLineOtherStatusRes=new Ab.view.Restriction();
				poLineOtherStatusRes.addClause('po_line.po_id',poId,'=');
				poLineOtherStatusRes.addClause('po_line.status',['Received','Error'],'NOT IN');
			var poLineOtherStatusRecords=poLineDs.getRecords(poLineOtherStatusRes);
			if(poLineOtherStatusRecords.length==0){
				var poLineReceivedRes=new Ab.view.Restriction();
					poLineReceivedRes.addClause('po_line.po_id',poId,'=');
					poLineReceivedRes.addClause('po_line.status','Received','=');
				var poLineReceivedRecords=poLineDs.getRecords(poLineReceivedRes);
				
				var poLineErrorRes=new Ab.view.Restriction();
					poLineErrorRes.addClause('po_line.po_id',poId,'=');
					poLineErrorRes.addClause('po_line.status','Error','=');
				var poLineErrorRecords=poLineDs.getRecords(poLineErrorRes);
				
				var finalStatus="";
				if(poLineReceivedRecords.length>0&&poLineErrorRecords.length>0){
					finalStatus="Partially Received";
				}
				
				if(poLineReceivedRecords.length==0){
					finalStatus="Error";
				}
				
				if(poLineErrorRecords.length==0){
					finalStatus="Received";
				}
				
				poRecord.setValue('po.status',finalStatus,'=');
				poDs.saveRecord(poRecord);
				View.panels.get('purchaseOrderListPanel').refresh();
				var isUnderstockedChecked=document.getElementById('receivedCkbx').checked;
				if(isUnderstockedChecked){
					View.panels.get('abPoLineList').show(false);
				}
				
			}
		}
		
	},
	/**
	 * Check if exists po line item does not delete.
	 * @param poId Purchase order code
	 */
	checkIfExistPoLineDoNotDelete: function(poId){
		var result=true;
		var poLineDs=View.dataSources.get('abPoLineEditPoLineDeleteDs');
		var poLineRes=new Ab.view.Restriction();
			poLineRes.addClause('po_line.po_id',poId,'=');
			
		var length=poLineDs.getRecords(poLineRes).length;
		if(length==0){
			result=false;
		}
		
		return result;
	},
	
	abPoLineEditForm_onBtnCancel: function(){
		this.abPoLineEditForm.show(false);
	},
	
	
	purchaseOrderInfo_onBtnSave: function(){
		var isOrderInfoFormCanSave=this.purchaseOrderInfo.canSave();
		var isOrderDetailFormCanSave=this.purchaseOrderDetail.canSave();
		var isShippingAndBllingFormCanSave=this.shippingAndBillingForm.canSave();
		var beforeStatus=this.poStatus;
		var afterStatus=this.purchaseOrderInfo.getFieldValue('po.status');
		var poId=this.purchaseOrderInfo.getFieldValue('po.po_id');
		poId=parseInt(poId);
		if(isOrderInfoFormCanSave==true&&isOrderDetailFormCanSave==true&&isShippingAndBllingFormCanSave==true){
			//Copy field value from Order Detail form and Shipping And Billing form to Purchase Order form.
			this.copyFieldsToPurchaseOrderForm();
			
			var poSaved=this.purchaseOrderInfo.save();
			if(poSaved){
				this.poStatus=afterStatus;
				if(beforeStatus!=afterStatus){
					try{ 
						View.openProgressBar();
						var result = Workflow.callMethod("AbBldgOpsBackgroundData-BldgopsPartInventoryService-updatePurchaseOrderInfoByPoStatus", poId,beforeStatus,afterStatus);
						if(result.code=="executed"){
							var poRes=new Ab.view.Restriction();
							poRes.addClause('po.po_id',poId,'=');
							
							View.panels.get('purchaseOrderInfo').refresh(poRes);
							View.panels.get('purchaseOrderDetail').refresh(poRes);
							View.panels.get('shippingAndBillingForm').refresh(poRes);
							
							View.panels.get('purchaseOrderListPanel').refresh();
							View.panels.get('abPoLineList').refresh();
							
							this.enablePurchaseOrderFormFields();
							
							View.closeProgressBar();
						}
					}catch (e) {
						var message = "Save Purchase Order failed";
						View.showMessage('error', message, e.message, e.data);
						View.closeProgressBar();
					}
				}else{
					var poRes=new Ab.view.Restriction();
					poRes.addClause('po.po_id',poId,'=');
					
					View.panels.get('purchaseOrderInfo').refresh(poRes);
					View.panels.get('purchaseOrderDetail').refresh(poRes);
					View.panels.get('shippingAndBillingForm').refresh(poRes);
					
					View.panels.get('purchaseOrderListPanel').refresh();
					View.panels.get('abPoLineList').refresh();
					this.enablePurchaseOrderFormFields();
					
					
				
				}
			}
			
		}
	},
	
	/**
	 * Copy field value from Order Detail form and Shipping And Billing form to Purchase Order form.
	 */
	copyFieldsToPurchaseOrderForm: function(){
		var ac_id=this.purchaseOrderDetail.getFieldValue('po.ac_id');
		var po_number=this.purchaseOrderDetail.getFieldValue('po.po_number');
		var source=this.purchaseOrderDetail.getFieldValue('po.source');
		var federal_tax=this.purchaseOrderDetail.getFieldValue('po.federal_tax');
		var em_id=this.purchaseOrderDetail.getFieldValue('po.em_id');
		var state_tax=this.purchaseOrderDetail.getFieldValue('po.state_tax');
		var shipping=this.purchaseOrderDetail.getFieldValue('po.shipping');
		var shipping_em_id=this.shippingAndBillingForm.getFieldValue('po.shipping_em_id');
		var billing_em_id=this.shippingAndBillingForm.getFieldValue('po.billing_em_id');
		var ship_address1=this.shippingAndBillingForm.getFieldValue('po.ship_address1');
		var bill_address1=this.shippingAndBillingForm.getFieldValue('po.bill_address1');
		var ship_address2=this.shippingAndBillingForm.getFieldValue('po.ship_address2');
		var bill_address2=this.shippingAndBillingForm.getFieldValue('po.bill_address2');
		var ship_city_id=this.shippingAndBillingForm.getFieldValue('po.ship_city_id');
		var bill_city_id=this.shippingAndBillingForm.getFieldValue('po.bill_city_id');
		var ship_state_id=this.shippingAndBillingForm.getFieldValue('po.ship_state_id');
		var bill_state_id=this.shippingAndBillingForm.getFieldValue('po.bill_state_id');
		var ship_zip=this.shippingAndBillingForm.getFieldValue('po.ship_zip');
		var bill_zip=this.shippingAndBillingForm.getFieldValue('po.bill_zip');
		
		var ds=this.purchaseOrderInfo.getDataSource();
		this.purchaseOrderInfo.setFieldValue('po.ac_id',ac_id);
		this.purchaseOrderInfo.setFieldValue('po.po_number',po_number);
		this.purchaseOrderInfo.setFieldValue('po.source',source);
		this.purchaseOrderInfo.setFieldValue('po.federal_tax',ds.formatValue('po.federal_tax',federal_tax,true));
		this.purchaseOrderInfo.setFieldValue('po.em_id',em_id);
		this.purchaseOrderInfo.setFieldValue('po.state_tax',ds.formatValue('po.state_tax',state_tax,true));
		this.purchaseOrderInfo.setFieldValue('po.shipping',ds.formatValue('po.shipping',shipping,true));
		this.purchaseOrderInfo.setFieldValue('po.shipping_em_id',shipping_em_id);
		this.purchaseOrderInfo.setFieldValue('po.billing_em_id',billing_em_id);
		this.purchaseOrderInfo.setFieldValue('po.ship_address1',ship_address1);
		this.purchaseOrderInfo.setFieldValue('po.bill_address1',bill_address1);
		this.purchaseOrderInfo.setFieldValue('po.ship_address2',ship_address2);
		this.purchaseOrderInfo.setFieldValue('po.bill_address2',bill_address2);
		this.purchaseOrderInfo.setFieldValue('po.ship_city_id',ship_city_id);
		this.purchaseOrderInfo.setFieldValue('po.bill_city_id',bill_city_id);
		this.purchaseOrderInfo.setFieldValue('po.ship_state_id',ship_state_id);
		this.purchaseOrderInfo.setFieldValue('po.bill_state_id',bill_state_id);
		this.purchaseOrderInfo.setFieldValue('po.ship_zip',ship_zip);
		this.purchaseOrderInfo.setFieldValue('po.bill_zip',bill_zip);
		
	},
	purchaseOrderInfo_onBtnDelete: function(){
		var poId=View.panels.get('purchaseOrderInfo').getFieldValue('po.po_id');
		
		var checked=this.checkDoesHaveItemAlreadyReceived(poId);
		if(!checked){
			View.confirm(getMessage('makeSureDeletePoLineItemMsg'),function(button){
				if(button=='yes'){
					
					var poRes=new Ab.view.Restriction();
					poRes.addClause('po.po_id',poId,'=');
					var poDs=View.dataSources.get('abPoLineEditPoDetailDs');
					
					var poRecord=poDs.getRecord(poRes);
					poDs.deleteRecord(poRecord);
					
					View.panels.get('purchaseOrderInfo').show(false);
					View.panels.get('purchaseOrderDetail').show(false);
					View.panels.get('shippingAndBillingForm').show(false);
					
					
					View.panels.get('purchaseOrderListPanel').refresh();
					View.panels.get('abPoLineList').show(false);
					
				}
			});
		}else{
			View.alert(getMessage('purchaseOrderCantDeletedMsg'));
		}
		
		
	},
	/**
	 * Check weather exists item already received for selected supply requisition.
	 */
	checkDoesHaveItemAlreadyReceived: function(poId){
		var result=false;
		var poLineDs=View.dataSources.get('abPoLineEditPoLineDeleteDs');
		var poLineRes=new Ab.view.Restriction();
		poLineRes.addClause('po_line.po_id',poId,'=');
		poLineRes.addClause('po_line.status',['Received','Error'],'IN');
		var poLineRecords=poLineDs.getRecords(poLineRes);
		
		if(poLineRecords.length>0){
			result=true;
		}
		return result;
	},
	purchaseOrderInfo_onBtnCancel: function(){
		View.panels.get('purchaseOrderInfo').show(false);
		View.panels.get('purchaseOrderDetail').show(false);
		View.panels.get('shippingAndBillingForm').show(false);
	},
	/**
	 * Approve or Reject Purchase Order with purchase order status.
	 * @param beforeStatus Before Status
	 * @param afterStatus After Status
	 */
	approveOrRejectPurchaseOrder: function(beforeStatus,afterStatus){
		var isOrderInfoFormCanSave=this.purchaseOrderInfo.canSave();
		var isOrderDetailFormCanSave=this.purchaseOrderDetail.canSave();
		var isShippingAndBllingFormCanSave=this.shippingAndBillingForm.canSave();
		var beforeStatus=beforeStatus;
		var afterStatus=afterStatus;
		var poId=this.purchaseOrderInfo.getFieldValue('po.po_id');
		poId=parseInt(poId);
		
		if(isOrderInfoFormCanSave==true&&isOrderDetailFormCanSave==true&&isShippingAndBllingFormCanSave==true){
			
			//Copy field value from Order Detail form and Shipping And Billing form to Purchase Order form.
			this.copyFieldsToPurchaseOrderForm();
			
			var poSaved=this.purchaseOrderInfo.save();
			if(poSaved){
				
				this.poStatus=afterStatus;
				if(beforeStatus!=afterStatus){
					View.openProgressBar();
					try{
						
						var result = Workflow.callMethod("AbBldgOpsBackgroundData-BldgopsPartInventoryService-updatePurchaseOrderInfoByPoStatus", poId,beforeStatus,afterStatus);
						if(result.code=="executed"){
							var poRes=new Ab.view.Restriction();
							poRes.addClause('po.po_id',poId,'=');
							
							View.panels.get('purchaseOrderInfo').refresh(poRes);
							View.panels.get('purchaseOrderDetail').refresh(poRes);
							View.panels.get('shippingAndBillingForm').refresh(poRes);
							
							View.panels.get('purchaseOrderListPanel').refresh();
							View.panels.get('abPoLineList').refresh();
							
							this.enablePurchaseOrderFormFields();
							View.closeProgressBar();
							
						}
					}catch (e) {
						var message = "Save Purchase Order failed";
						View.showMessage('error', message, e.message, e.data);
						View.closeProgressBar();
					}
				}else{
					var poRes=new Ab.view.Restriction();
					poRes.addClause('po.po_id',poId,'=');
					
					View.panels.get('purchaseOrderInfo').refresh(poRes);
					View.panels.get('purchaseOrderDetail').refresh(poRes);
					View.panels.get('shippingAndBillingForm').refresh(poRes);
					
					View.panels.get('purchaseOrderListPanel').refresh();
					View.panels.get('abPoLineList').refresh();
					this.enablePurchaseOrderFormFields();
					
					
				
				}
			}
			
		}
	},
	
	/**
	 * Approved button click method.
	 */
	clickedApprovedButton: function(){
		this.approveOrRejectPurchaseOrder();
	},
	
	/**
	 * Approved button click method.
	 */
	clickedRejectButton: function(){
		View.alert('Clicked');
	},
	
	openExportPdfDialog: function(fileType){
		var selectRowRecords=this.purchaseOrderListPanel.getSelectedRecords();
		if(selectRowRecords.length==0){
			View.alert(getMessage("exportSupplyReqMsg"));
		}else{
			var poIdsInConditionClause="po.po_id in (";
			for(var i=0;i<selectRowRecords.length;i++){
				poIdsInConditionClause += selectRowRecords[i].getValue('po.po_id');
				if(i!=selectRowRecords.length-1){
					poIdsInConditionClause += ","
				}
				
			}
			poIdsInConditionClause +=")";
			var pdfParameters = {};
			pdfParameters['poIds']=poIdsInConditionClause;
			
			if(fileType=="pdf"){
				View.openPaginatedReportDialog("ab-po-line-edit-report-pdf.axvw", null, pdfParameters);
			}
			
			if(fileType=="docx"){
				View.openPaginatedReportDialog("ab-po-line-edit-report-docx.axvw", null, pdfParameters);
			}
			
		}
		
	},
	/**
	 * the field P.O. Line Number should be read-only and should be set to the next available number for that Purchase Order.
	 * @param poId Purchase Order Code
	 * @return nextPoLineNumber Next available number
	 */
	getNextPoLineNumberByPoId: function(poId){
		var nextPoLineNumber=1;
		var maxPoLineDs=View.dataSources.get('getMaxPoLineItemIdDs');
		maxPoLineDs.addParameter('poId',poId);
		var record=maxPoLineDs.getRecord();
		var maxPoLineNumber=record.getValue('po.maxItemId');
		
		if(valueExistsNotEmpty(maxPoLineNumber)){
			nextPoLineNumber=parseInt(maxPoLineNumber)+1;
		}
		
		return nextPoLineNumber;
	}
	
});

/**
 * Approved button click event handler
 */
function onclickBtnApproved(){
	View.controllers.get('poLineEditController').approveOrRejectPurchaseOrder('Requested','Approved');
}
/**
 * Reject button click event handler
 */
function onclickBtnReject(){
	View.controllers.get('poLineEditController').approveOrRejectPurchaseOrder('Requested','Rejected');
}

function calculateLineCost(){
	var totalCost=0;
	var quantity=View.panels.get('abPoLineEditForm').getFieldValue('po_line.quantity');
	if(!valueExistsNotEmpty(quantity)){
		quantity=0;
	}else{
		quantity=parseFloat(quantity);
	}
	
	
	var unitCost=View.panels.get('abPoLineEditForm').getFieldValue('po_line.unit_cost');
	if(!valueExistsNotEmpty(unitCost)){
		unitCost=0;
	}else{
		unitCost=parseFloat(unitCost);
	}
	
	totalCost=(quantity*unitCost).toFixed(2);
	var ds=View.dataSources.get('abPoLineEditPoLineDeleteDs');
	View.panels.get('abPoLineEditForm').setFieldValue('po_line.lineCost',ds.formatValue('po_line.unit_cost',totalCost,true));
}