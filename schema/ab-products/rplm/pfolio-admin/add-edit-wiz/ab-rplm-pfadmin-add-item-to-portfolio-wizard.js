Ab.namespace('portfAdminWizard');

Ab.portfAdminWizard.Wizard = Base.extend({
	type:null,
	action:null,
	actionType:null,
	itemId:null,
	itemType:null,
	itemIsOwned:null,
	leaseId:null,
	leaseType:null,
	constructor: function(){
		this.type = 'PORTFOLIO';
		this.action='ADD';
		this.actionType=null;
		this.itemId=null;
		this.itemType=null;
		this.itemIsOwned=null;
		this.leaseId=null;
		this.leaseType=null;
	},
	reset: function(){
		this.type = 'PORTFOLIO';
		this.action='ADD';
		this.actionType=null;
		this.itemId=null;
		this.itemType=null;
		this.itemIsOwned=null;
		this.leaseId=null;
		this.leaseType=null;
	},
	setType: function(type){
		this.type = type;
	},
	getType: function(){
		return (this.type);
	},
	setAction: function(action){
		this.action = action;
	},
	getAction: function(){
		return (this.action);
	},
	setActionType: function(actionType){
		this.actionType = actionType;
	},
	getActionType: function(actionType){
		return (this.actionType);
	},
	setItemId: function(itemId){
		this.itemId = itemId;
	},
	getItemId: function(){
		return (this.itemId);
	},
	setItemType: function(itemType){
		this.itemType = itemType;
	},
	getItemType: function(){
		return (this.itemType);
	},
	setItemIsOwned: function(itemIsOwned){
		this.itemIsOwned = itemIsOwned;
	},
	getItemIsOwned: function(){
		return (this.itemIsOwned);
	},
	setLeaseId: function(leaseId){
		this.leaseId = leaseId;
	},
	getLeaseId: function(){
		return (this.leaseId);
	},
	setLeaseType: function(leaseType){
		this.leaseType = leaseType;
	},
	getLeaseType: function(){
		return (this.leaseType);
	}
})

var portfAdminWizardController = View.createController('portfAdminWizard', {
	afterInitialDataFetch: function(){
		this.wizardTabs.wizard = new Ab.portfAdminWizard.Wizard();
		this.wizardTabs.tabsStatus = new Array();
		this.wizardTabs.addEventListener('afterTabChange', afterTabChange);
		this.wizardTabs.tabsStatus[this.wizardTabs.tabs[0].name] = false;
		for(var i=1;i<this.wizardTabs.tabs.length;i++){
			this.wizardTabs.tabsStatus[this.wizardTabs.tabs[i].name] = false;
			this.setTab(this.wizardTabs.tabs[i].name, true, false);
		}
		this.showSelection({'action':this.wizardTabs.wizard.getAction(),
							'type':this.wizardTabs.wizard.getActionType(),
							'item':this.wizardTabs.wizard.getItemId(),
							'itemType':this.wizardTabs.wizard.getItemType(),
							'lease':this.wizardTabs.wizard.getLeaseId()});
	},
	checkTabs: function(){
		this.setTab('wizardTabs_1', false, true);
		if(this.wizardTabs.wizard.getActionType() == 'BUILDING'){
			this.setTab('wizardTabs_2', false, true);
			this.wizardTabs.findTab('wizardTabs_2').setTitle(getMessage('title_building'));
			this.setTab('wizardTabs_3', true, false);
			if(this.wizardTabs.wizard.getAction()== 'ADD'){
				this.setTab('wizardTabs_5', true, false);
			}else if(this.wizardTabs.wizard.getAction()== 'EDIT'){
				this.setTab('wizardTabs_5', false, true);
			}
//			if(this.wizardTabs.wizard.getItemIsOwned() && this.wizardTabs.wizard.getAction()== 'ADD'){
//				this.setTab('wizardTabs_5', true, false);
//			}else if(!this.wizardTabs.wizard.getItemIsOwned() ||
//				(this.wizardTabs.wizard.getItemIsOwned() && this.wizardTabs.wizard.getAction()== 'EDIT')){
//				this.setTab('wizardTabs_5', false, true);
//			}
		}
		if(this.wizardTabs.wizard.getActionType() == 'STRUCTURE'){
			this.setTab('wizardTabs_2', true, false);
			this.setTab('wizardTabs_3', false, true);
			this.wizardTabs.findTab('wizardTabs_3').setTitle(getMessage('title_structure'));
			this.setTab('wizardTabs_5', true, false);
		}
		if(this.wizardTabs.wizard.getActionType() == 'LAND'){
			this.setTab('wizardTabs_2', true, false);
			this.setTab('wizardTabs_3', false, true);
			this.wizardTabs.findTab('wizardTabs_3').setTitle(getMessage('title_land'));
			this.setTab('wizardTabs_parcels', false, true);
			this.setTab('wizardTabs_5', true, false);
		}
		if(this.wizardTabs.wizard.getItemIsOwned()){
			this.setTab('wizardTabs_4', true, false);
		}else if(!this.wizardTabs.wizard.getItemIsOwned()){
			//this.setTab('wizardTabs_4', false, true);
			this.setTab('wizardTabs_4', true, false);
		}
		if(this.wizardTabs.wizard.getActionType() == 'LEASE'){
			if(this.wizardTabs.wizard.getItemType() == 'BUILDING'){
				this.setTab('wizardTabs_2', false, true);
				this.wizardTabs.findTab('wizardTabs_2').setTitle(getMessage('title_building'));
				this.setTab('wizardTabs_3', true, false);
				this.setTab('wizardTabs_4', false, true);
				this.setTab('wizardTabs_5', false, true);
			}else if(this.wizardTabs.wizard.getItemType() == 'STRUCTURE'){
				this.setTab('wizardTabs_2', true, false);
				this.setTab('wizardTabs_3', false, true);
				this.wizardTabs.findTab('wizardTabs_3').setTitle(getMessage('title_structure'));
				this.setTab('wizardTabs_4', false, true);
				this.setTab('wizardTabs_5', true, false);
			}else if(this.wizardTabs.wizard.getItemType() == 'LAND'){
				this.setTab('wizardTabs_2', true, false);
				this.setTab('wizardTabs_3', false, true);
				this.wizardTabs.findTab('wizardTabs_3').setTitle(getMessage('title_land'));
				this.setTab('wizardTabs_parcels', false, true);
				this.setTab('wizardTabs_4', false, true);
				this.setTab('wizardTabs_5', true, false);
			}
		}
		this.setTab('wizardTabs_6', false, true);
		this.setTab('wizardTabs_7', false, true);
	},
	navigate: function(direction){
		var tab = this.wizardTabs.findTab(this.wizardTabs.selectedTabName);
		var nextTab = null;
		var index = getIndexOf(this.wizardTabs.tabs, tab);
		if(direction == 'forward'){
			for(var i=index+1;i<this.wizardTabs.tabs.length;i++){
				if(this.wizardTabs.tabs[i].enabled){
					nextTab = this.wizardTabs.tabs[i].name;
					break;
				}
			}
		}
		if(direction == 'backward'){
			for(var i=index-1;i>-1;i--){
				if(this.wizardTabs.tabs[i].enabled){
					nextTab = this.wizardTabs.tabs[i].name;
					break;
				}
			}
		}
		if(nextTab != null){
			this.wizardTabs.selectTab(nextTab);
			//customAfterTabChange(this.wizardTabs, nextTab);
		}
	},
	navigateToTab:function(index){
		this.wizardTabs.selectTab(this.wizardTabs.tabs[index].name);
	},
	setTab: function(tab, hide, enable){
		if(hide){
			this.wizardTabs.hideTab(tab, true);
		}else{
			this.wizardTabs.showTab(tab, true);
		}
		this.wizardTabs.findTab(tab).enabled = enable;
		this.wizardTabs.enableTab(tab, enable);
	},
	showSelection: function(object){
		var strText = '';
		var itemType = '';
		var leaseItemType = '';
		if (object.type != 'LEASE') {
			switch (object.itemType) {
				case 'BUILDING':
					itemType = getMessage('itemType_building');
					break;
				case 'LAND':
					itemType = getMessage('itemType_land');;
					break;
				case 'STRUCTURE':
					itemType = getMessage('itemType_structure');;
					break;
			}
		}
		else {
			switch (object.itemType) {
				case 'BUILDING':
					leaseItemType = getMessage('label_type_building');
					break;
				case 'LAND':
					leaseItemType = getMessage('label_type_land');
					break;
				case 'STRUCTURE':
					leaseItemType = getMessage('label_type_structure');
					break;
				case 'PROPERTY':
					leaseItemType = getMessage('label_type_structure');
					break;
			}
		}
		if(object.action != null){

			strText +=''+getMessage('label_action')+' '+ getMessage('label_action_'+object.action.toLowerCase()) +' '+itemType+'; ';
		}
		if(object.type != null){
			strText +=getMessage('label_type_'+object.type.toLowerCase())+' '+leaseItemType+' ';
		}
		if(object.item != null){
			strText +=object.item+' ';
		}
		if(object.lease != null){
			strText +=getMessage('label_lease')+' '+object.lease+'  ';
		}
		View.setTitle(strText);
	}
})

function afterTabChange(tabPanel, selectedTabName){
	var controller = '';
	switch(selectedTabName){
		case 'wizardTabs_0':{
			controller = 'rplmType';
			break;
		}
		case 'wizardTabs_1':{
			controller = 'rplmOwnership';
			break;
		}
		case 'wizardTabs_2':{
			controller = 'rplmBuilding';
			break;
		}
		case 'wizardTabs_3':{
			controller = 'rplmProperty';
			break;
		}
        case 'wizardTabs_parcels':{
            controller = 'rplmParcels';
            break;
        }
		case 'wizardTabs_4':{
			controller = 'rplmLease';
			break;
		}
		case 'wizardTabs_5':{
			controller = 'rplmSuite';
			break;
		}
		case 'wizardTabs_6':{
			controller = 'rplmDocuments';
			break;
		}
		case 'wizardTabs_7':{
			controller = 'abRepmContactsController';
			break;
		}
	}
	portfAdminWizardController.showSelection({'action':portfAdminWizardController.wizardTabs.wizard.getAction(),
					'type':portfAdminWizardController.wizardTabs.wizard.getActionType(),
					'item':portfAdminWizardController.wizardTabs.wizard.getItemId(),
					'itemType':portfAdminWizardController.wizardTabs.wizard.getItemType(),
					'lease':portfAdminWizardController.wizardTabs.wizard.getLeaseId()});
	if(tabPanel.findTab(selectedTabName).isContentLoaded){
		tabPanel.findTab(selectedTabName).getContentFrame().View.controllers.get(controller).initVariables(tabPanel, portfAdminWizardController);
		tabPanel.findTab(selectedTabName).getContentFrame().View.controllers.get(controller).restoreSettings();
	}
}


function getIndexOf(collection , object){
	var result = -1;
	for(var i=0;i<collection.length;i++){
		if(collection[i] == object){
			result = i;
			break;
		}
	}
	return (result);
}
