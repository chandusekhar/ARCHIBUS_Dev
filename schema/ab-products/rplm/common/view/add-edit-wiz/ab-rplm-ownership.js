var rplmOwnershipController = View.createController('rplmOwnership',{
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
	afterViewLoad: function(){
		this.buildLabels();
	},
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
		//this.buildLabels();
		this.restoreSettings();
	},
	rplmOwnershipForm_onContinue: function(){
		if(this.itemIsOwned == null){
			View.showMessage(getMessage('error_noownershipselected'));
			return;
		}
		if(this.action == 'EDIT' && !this.contentDisabled &&
			(this.actionType =='BUILDING' || this.actionType == 'LAND' || this.actionType == 'STRUCTURE')){
			var controller = this;
			var openerPanel = this.openerPanel;
			var openerController = this.openerController;
			if(this.wizard.getItemIsOwned() && !this.itemIsOwned){
				var message = getMessage('confirm_own_to_lease_1');
				message += '\n'+getMessage('confirm_own_to_lease_2');
				message += '\n'+getMessage('confirm_own_to_lease_3');
				message += '\n'+getMessage('confirm_own_to_lease_4');
				message += '\n'+getMessage('confirm_own_to_lease_5');
				View.confirm(message, function(button){
					if(button == 'yes'){
						controller.wizard.setAction(controller.action);
						controller.wizard.setActionType(controller.actionType);
						controller.wizard.setItemId(controller.itemId);
						controller.wizard.setItemType(controller.itemType);
						controller.wizard.setItemIsOwned(controller.itemIsOwned);
						controller.wizard.setLeaseId(controller.leaseId);
						controller.wizard.setLeaseType(controller.leaseType);
						openerPanel.tabsStatus[openerPanel.selectedTabName] = true;
						openerController.checkTabs();
						openerController.navigate('forward');
					}
				});
			}else if(!this.wizard.getItemIsOwned() && this.itemIsOwned){
				var message = getMessage('confirm_lease_to_own_1');
				message += '\n'+getMessage('confirm_lease_to_own_2');
				message += '\n'+getMessage('confirm_lease_to_own_3');
				message += '\n'+getMessage('confirm_lease_to_own_4');
				message += '\n'+getMessage('confirm_lease_to_own_5');
				View.confirm(message, function(button){
					if(button == 'yes'){
						controller.wizard.setAction(controller.action);
						controller.wizard.setActionType(controller.actionType);
						controller.wizard.setItemId(controller.itemId);
						controller.wizard.setItemType(controller.itemType);
						controller.wizard.setItemIsOwned(controller.itemIsOwned);
						controller.wizard.setLeaseId(controller.leaseId);
						controller.wizard.setLeaseType(controller.leaseType);
						openerPanel.tabsStatus[openerPanel.selectedTabName] = true;
						openerController.checkTabs();
						openerController.navigate('forward');
					}
				});
			}else{
				this.wizard.setAction(this.action);
				this.wizard.setActionType(this.actionType);
				this.wizard.setItemId(this.itemId);
				this.wizard.setItemType(this.itemType);
				this.wizard.setItemIsOwned(this.itemIsOwned);
				this.wizard.setLeaseId(this.leaseId);
				this.wizard.setLeaseType(this.leaseType);
				this.openerPanel.tabsStatus[this.openerPanel.selectedTabName] = true;
				this.openerController.checkTabs();
				this.openerController.navigate('forward');
			}
		}else {
			this.wizard.setAction(this.action);
			this.wizard.setActionType(this.actionType);
			this.wizard.setItemId(this.itemId);
			this.wizard.setItemType(this.itemType);
			this.wizard.setItemIsOwned(this.itemIsOwned);
			this.wizard.setLeaseId(this.leaseId);
			this.wizard.setLeaseType(this.leaseType);
			this.openerPanel.tabsStatus[this.openerPanel.selectedTabName] = true;
			this.openerController.checkTabs();
			this.openerController.navigate('forward');
		}
	},
	rplmOwnershipForm_onBack: function(){
		this.openerController.navigate('backward');
	},
	rplmOwnershipForm_onCancel: function(){
		var tabsController = this.openerController;
		var tabsPanelId = (tabsController.id == 'portfAdminWizard' ? 'wizardTabs': 'leaseAdminTabs');
		View.confirm(getMessage('message_cancelconfirm'), function(button){
			if(button == 'yes'){
				tabsController.view.panels.get(tabsPanelId).tabs[0].loadView();
               	tabsController.afterInitialDataFetch();
               	tabsController.navigateToTab(0);
			}
		})
	},
	initVariables:function(openerPanel, openerController){
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
		this.contentDisabled = false;//this.openerPanel.tabsStatus[this.openerPanel.selectedTabName];
	},
	buildLabels: function(){
		$('select_label').innerHTML = getMessage('msgSelectLabel');
		$('radioItem_owned').innerHTML = getMessage('msgOwned');
		$('radioItem_leased').innerHTML = getMessage('msgLeased');
	},
	restoreSettings: function(){
		var radioItemObj = document.getElementsByName("radioItem");
		if(this.action == 'ADD' && this.actionType != 'LEASE' && this.itemIsOwned == null){
			radioItemObj[0].checked = false;
			radioItemObj[1].checked = false;
		}else if(this.itemIsOwned){
			radioItemObj[0].checked = true;
		}else if(!this.itemIsOwned){
			radioItemObj[1].checked = true;
		}
		radioItemObj[0].disabled = (this.actionType == 'LEASE' || this.contentDisabled);
		radioItemObj[1].disabled = (this.actionType == 'LEASE' || this.contentDisabled);
	}	
})

function setItem(){
	var radioItemObj = document.getElementsByName("radioItem");
	var itemType = null;
	for(var i=0;i<radioItemObj.length;i++){
		if(radioItemObj[i].checked){
			itemType = radioItemObj[i].value;
			break;
		}
	}
	switch(itemType){
		case 'OWN':{
			rplmOwnershipController.itemIsOwned = true;
			break;
		}
		case 'LEASE':{
			rplmOwnershipController.itemIsOwned = false;
			break;
		}
	}
}
