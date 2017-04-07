var rplmLeaseController = View.createController('rplmLease',{
	openerPanel:null,
	openerController:null,
	type:null,
	action:null,
	actionType:null,
	itemId:null,
	itemType:null,
	itemIsOwned:null,
	leaseId:null,
	leaseType:null,
	wizard:null,
	contentDisabled:null,
	selectedLeaseTemplate:null,
	landlord_tenant:null,
	afterInitialDataFetch: function(){
		
		
		if(View.getOpenerView().controllers.get('portfAdminWizard') != undefined){
			this.openerController = View.getOpenerView().controllers.get('portfAdminWizard');
			this.openerPanel = View.getOpenerView().panels.get('wizardTabs');
		}
		if(View.getOpenerView().controllers.get('leaseAdminWizard') != undefined){
			this.openerController = View.getOpenerView().controllers.get('leaseAdminWizard');
			this.openerPanel = View.getOpenerView().panels.get('leaseAdminTabs');
		}
		this.initVariables(this.openerPanel, this.openerController);
		this.restoreSettings();
	},
	leasesTenantGrid_afterRefresh: function(){
		this.leasesTenantGrid.enableSelectAll(false);
	},
	leasesLandlordGrid_afterRefresh: function(){
		this.leasesLandlordGrid.enableSelectAll(false);
	},
	leasesTenantGrid_multipleSelectionColumn_onClick: function(row){
		this.radioOnClick(row,this.leasesTenantGrid, this.leasesLandlordGrid);
	},
	leasesLandlordGrid_multipleSelectionColumn_onClick: function(row){
		this.radioOnClick(row, this.leasesLandlordGrid, this.leasesTenantGrid);
	},
	radioOnClick: function(row, gridPanel_1, gridPanel_2){	
		var selected = row.isSelected();
		//set default to null
		this.leaseId = null;
		this.leaseType = null;
		this.leaseRow = null;
		//set values by selected row
		if(selected){
			selected = true;
			this.leaseRow = row;
			this.leaseId = row.getFieldValue('ls.ls_id');
			this.leaseType = row.getFieldValue('ls.landlord_tenant');
		}
		gridPanel_1.setAllRowsSelected(false);
		gridPanel_2.setAllRowsSelected(false);
		row.select(selected);
	},
	leasesTenantGrid_editTenantLease_onClick: function(row){
		this.editOnClick(row);
	},
	leasesLandlordGrid_editLandlordLease_onClick: function(row){
		this.editOnClick(row);
	},
	leasesTenantGrid_onNewTenantLease: function(){
		/*
		 * check ownership information
		 * for selected item
		 */
		var parameters = {'itemId':this.itemId,'itemType':this.itemType};
		var itemId = this.itemId;
		var itemType = this.itemType;
		if(this.itemIsOwned){
			this.newOnClick(this.itemId, this.itemType, 'LANDLORD', getMessage('error_landlordnottenant'));
		}else{
			this.newOnClick(this.itemId, this.itemType, 'TENANT', null);
		}
	},
	leasesLandlordGrid_onNewLandlordLease: function(){
		this.newOnClick(this.itemId, this.itemType, 'LANDLORD', null);
	},
	leaseActionPanel_onCancel: function(){
		var tabsController = this.openerController;
		View.confirm(getMessage('message_cancelconfirm'), function(button){
			if(button == 'yes'){
				tabsController.afterInitialDataFetch();
				tabsController.navigateToTab('wizardTabs_0');
			}
		})
	},
	leaseActionPanel_onBack: function(){
		this.openerController.navigate('backward');
	},
	leaseActionPanel_onContinue: function(){
		if(this.leaseId == null){
			View.showMessage(getMessage('error_noleaseselected'));
			return;
		}
		this.wizard.setAction(this.action);
		this.wizard.setActionType(this.actionType);
		this.wizard.setItemId(this.itemId);
		this.wizard.setItemType(this.itemType);
		this.wizard.setItemIsOwned(this.itemIsOwned);
		this.wizard.setLeaseId(this.leaseId);
		this.wizard.setLeaseType(this.leaseType);
		this.openerPanel.tabsStatus[this.openerPanel.selectedTabName] = true;
		this.openerController.navigate('forward');
	},
	leaseActionPanel_onFinish: function(){
		this.openerPanel.tabs[0].loadView();
		this.openerController.afterInitialDataFetch();
		this.openerController.navigate('backward');
		
	},
	editOnClick: function(row){
		var itemType = this.itemType;
		var item = this.itemId;
		View.openDialog('ab-rplm-editlease.axvw',null, true, {
			width:1280,
			height:700, 
			closeButton:true,
				afterInitialDataFetch:function(dialogView){
					var dialogController = dialogView.controllers.get('editLease');
					dialogController.itemId = row.getFieldValue('ls.ls_id');
					dialogController.item = item;
					dialogController.itemType = itemType;
					dialogController.editLease.refresh({'ls.ls_id':row.getFieldValue('ls.ls_id')}, false);
					dialogController.editLease.enableField('ls.ls_id', false);
					dialogController.editLease.enableField('ls.landlord_tenant', false);
					dialogController.editLease.enableField('ls.bl_id', false);
					dialogController.editLease.enableField('ls.pr_id', false);
					dialogController.refreshPanels = new Array('leasesLandlordGrid', 'leasesTenantGrid');
					if(dialogController.editLease.getFieldValue('ls.lease_sublease') != 'SUBLEASE' ){
						dialogController.editLease.enableField('ls.ls_parent_id', false);
					}else{
						dialogController.editLease.enableField('ls.ls_parent_id', true);
					}
				}
		});
	},
	newOnClick: function(itemId, itemType, landlord_tenant, message){
		var itemIsOwned = this.itemIsOwned;
		View.openDialog('ab-rplm-addlease.axvw',null, true, {
			width:1280,
			height:700, 
			closeButton:true,
				afterInitialDataFetch:function(dialogView){
					var dialogController = dialogView.controllers.get('addNewLease');
					dialogController.itemId = itemId;
					dialogController.itemType = itemType;
					dialogController.newLease.setFieldValue('ls.signed', '1');
					dialogController.newLease.enableField('ls.landlord_tenant', false);
					dialogController.newLease.setFieldValue('ls.landlord_tenant', landlord_tenant);
					dialogController.newLease.enableField('ls.lease_sublease', false);
					
					
					if(itemIsOwned){
						dialogController.newLease.setFieldValue('ls.landlord_tenant', 'LANDLORD');
						dialogController.newLease.setFieldValue('ls.lease_sublease', 'LEASE');
						dialogController.newLease.setFieldValue('ls.ls_parent_id', '');
						dialogController.newLease.enableField('ls.ls_parent_id', false);
						if(message != null && message.length > 0){
							View.showMessage(message);
						}
					}else if(landlord_tenant == 'TENANT'){
						dialogController.newLease.enableField('ls.ls_parent_id', false);
						dialogController.newLease.setFieldValue('ls.lease_sublease', 'LEASE');
					}else{
						dialogController.newLease.enableField('ls.ls_parent_id', true);
						dialogController.newLease.setFieldValue('ls.lease_sublease', 'SUBLEASE');
					}
					dialogController.refreshPanels = new Array('leasesLandlordGrid', 'leasesTenantGrid');
				}
		});
	},
	
	initVariables: function(openerPanel, openerController){
		this.openerController = openerController;
		this.openerPanel = openerPanel;
		this.wizard = this.openerPanel.wizard;
		this.type = this.wizard.getType();
		this.action = this.wizard.getAction();
		this.actionType = this.wizard.getActionType();
		this.itemId = this.wizard.getItemId();
		this.itemType = this.wizard.getItemType();
		this.itemIsOwned = this.wizard.getItemIsOwned();
		this.leaseId = this.wizard.getLeaseId();
		this.leaseType = this.wizard.getLeaseType();
		this.contentDisabled = this.openerPanel.tabsStatus[this.openerPanel.selectedTabName];
	},
	restoreSettings: function(){
		var restriction = null;
		var restriction1 = null;
		if(this.itemType == 'BUILDING'){
			restriction = 'ls.bl_id = \'' + this.itemId+'\' and ls.landlord_tenant = \'TENANT\'';
			restriction1 = 'ls.bl_id = \'' + this.itemId+'\' and ls.landlord_tenant = \'LANDLORD\'';
		}else{
			restriction = 'ls.pr_id = \'' + this.itemId+'\' and ls.landlord_tenant = \'TENANT\'';
			restriction1 = 'ls.pr_id = \'' + this.itemId+'\' and ls.landlord_tenant = \'LANDLORD\'';
		}
		this.leasesTenantGrid.refresh(restriction);
		this.leasesLandlordGrid.refresh(restriction1);
		if(this.action == 'EDIT' && this.actionType == 'LEASE'){
			this.leasesTenantGrid.enableButton('new', true);
			this.leasesLandlordGrid.enableButton('new', true);
		}else{
			this.leasesTenantGrid.enableButton('new', true);
			this.leasesLandlordGrid.enableButton('new', true);
		}
		if(this.leaseId != null){
			var panel = null;
			if(this.leaseType == 'TENANT'){
				panel = this.leasesTenantGrid;
			}else if (this.leaseType == 'LANDLORD'){
				panel = this.leasesLandlordGrid;
			}
			for(var i=0;i<panel.gridRows.getCount();i++){
				if(this.leaseId == panel.gridRows.get(i).getFieldValue('ls.ls_id')){
					panel.gridRows.get(i).select(true);
					break;
				}
			}
		}
	},
	showSelection: function(){
		this.openerController.showSelection({'action':this.action,
						'type':this.actionType,
						'item':this.itemId, 
						'itemType':this.itemType,
						'lease':this.leaseId});
	}	
})

function setSelectedLeaseTemplate(row){
	rplmLeaseController.selectedLeaseTemplate = row['ls.ls_id'];	
}

function createNewLease(obj){
	
	var controller = rplmLeaseController;
    var newLsId = controller.newLsCode_form.getFieldValue('ls.ls_id');
	var itemType = (controller.itemType == 'BUILDING')?'building':'property';
    if (!newLsId) {
        View.showMessage(getMessage('err_no_lease'));
        return;
    }
    
    try {
        Workflow.callMethod("AbRPLMLeaseAdministration-LeaseAdministrationService-duplicateLease", newLsId, controller.selectedLeaseTemplate, '0', itemType , controller.itemId, controller.landlord_tenant, 'ls.ls_parent_id', 'ls.lease_sublease');
		controller.newLsCode_form.closeWindow();
		if (controller.landlord_tenant == "LANDLORD") {
			controller.leasesLandlordGrid.refresh();
		}
		else {
			controller.leasesTenantGrid.refresh();
		}
    } 
    catch (e) {
        if (e.detailedMessage == "ASA Error -193: Primary key for table &apos;ls&apos; is not unique") {
				View.showMessage(getMessage('err_lsId'));
			}
			else {
				Workflow.handleError(e);
			}
    }	
}

function setLandlordTenant(landlord_tenant){
	if(landlord_tenant == 'TENANT' && rplmLeaseController.itemIsOwned){
		View.showMessage(getMessage('error_landlordnottenant'));
		rplmLeaseController.landlord_tenant = "LANDLORD";
		return;
	}
	
	rplmLeaseController.landlord_tenant = landlord_tenant;
}
