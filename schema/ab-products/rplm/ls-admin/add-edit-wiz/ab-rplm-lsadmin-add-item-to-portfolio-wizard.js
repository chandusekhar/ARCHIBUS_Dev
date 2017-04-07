Ab.namespace('leaseAdminWizard');

Ab.leaseAdminWizard.Wizard = Base.extend({
	type:null,
	action:null,
	actionType:null,
	itemId:null,
	itemType:null,
	itemIsOwned:null,
	leaseId:null,
	leaseType:null,
	constructor: function(){
		this.type = 'LEASE';
		this.action='ADD';
		this.actionType=null;
		this.itemId=null;
		this.itemType=null;
		this.itemIsOwned=null;
		this.leaseId=null;
		this.leaseType=null;
	},
	reset: function(){
		this.type = 'LEASE';
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

var leaseAdminWizardController = View.createController('leaseAdminWizard', {
	afterInitialDataFetch: function(){
		this.leaseAdminTabs.wizard = new Ab.leaseAdminWizard.Wizard();
		this.leaseAdminTabs.tabsStatus = new Array();
		this.leaseAdminTabs.addEventListener('afterTabChange', afterTabChange);
		this.leaseAdminTabs.tabsStatus[this.leaseAdminTabs.tabs[0].name] = false;
		for(var i=1;i<this.leaseAdminTabs.tabs.length;i++){
			this.leaseAdminTabs.tabsStatus[this.leaseAdminTabs.tabs[i].name] = false;
			this.setTab(this.leaseAdminTabs.tabs[i].name, true, false);
		}
		this.showSelection({'action':this.leaseAdminTabs.wizard.getAction(),
							'type':this.leaseAdminTabs.wizard.getActionType(),
							'item':this.leaseAdminTabs.wizard.getItemId(), 
							'itemType':this.leaseAdminTabs.wizard.getItemType(),
							'lease':this.leaseAdminTabs.wizard.getLeaseId()});
	},
	checkTabs: function(){
		this.setTab('leaseAdminTabs_1', false, true);
		if(this.leaseAdminTabs.wizard.getActionType() == 'BUILDING'){
			this.setTab('leaseAdminTabs_2', false, true);
			this.leaseAdminTabs.findTab('leaseAdminTabs_2').setTitle(getMessage('title_building'));
			this.setTab('leaseAdminTabs_3', true, false);
			if(this.leaseAdminTabs.wizard.getItemIsOwned() && this.leaseAdminTabs.wizard.getAction()== 'ADD'){
				this.setTab('leaseAdminTabs_5', true, false);
			}else if(!this.leaseAdminTabs.wizard.getItemIsOwned() ||
				(this.leaseAdminTabs.wizard.getItemIsOwned() && this.leaseAdminTabs.wizard.getAction()== 'EDIT')){
				this.setTab('leaseAdminTabs_5', false, true);
			}
		}
		if(this.leaseAdminTabs.wizard.getActionType() == 'STRUCTURE'){
			this.setTab('leaseAdminTabs_2', true, false);
			this.setTab('leaseAdminTabs_3', false, true);
			this.leaseAdminTabs.findTab('leaseAdminTabs_3').setTitle(getMessage('title_structure'));
			this.setTab('leaseAdminTabs_5', true, false);
		}
		if(this.leaseAdminTabs.wizard.getActionType() == 'LAND'){
			this.setTab('leaseAdminTabs_2', true, false);
			this.setTab('leaseAdminTabs_3', false, true);
			this.leaseAdminTabs.findTab('leaseAdminTabs_3').setTitle(getMessage('title_land'));
			this.setTab('wizardTabs_parcels', false, true);
			this.setTab('leaseAdminTabs_5', true, false);
		}
		if(this.leaseAdminTabs.wizard.getItemIsOwned()){
			this.setTab('leaseAdminTabs_4', true, false);
			this.setTab('leaseAdminTabs_8', true, false);
			this.setTab('leaseAdminTabs_9', true, false);
			this.setTab('leaseAdminTabs_10', true, false);
			this.setTab('leaseAdminTabs_11', true, false);
		}else if(!this.leaseAdminTabs.wizard.getItemIsOwned()){
//			this.setTab('leaseAdminTabs_4', false, true);
//			this.setTab('leaseAdminTabs_8', false, true);
//			this.setTab('leaseAdminTabs_9', false, true);
//			this.setTab('leaseAdminTabs_10', false, true);
//			this.setTab('leaseAdminTabs_11', false, true);
			this.setTab('leaseAdminTabs_4', true, false);
			this.setTab('leaseAdminTabs_8', true, false);
			this.setTab('leaseAdminTabs_9', true, false);
			this.setTab('leaseAdminTabs_10', true, false);
			this.setTab('leaseAdminTabs_11', true, false);
		}
		if(this.leaseAdminTabs.wizard.getActionType() == 'LEASE'){
			if(this.leaseAdminTabs.wizard.getItemType() == 'BUILDING'){
				this.setTab('leaseAdminTabs_2', false, true);
				this.leaseAdminTabs.findTab('leaseAdminTabs_2').setTitle(getMessage('title_building'));
				this.setTab('leaseAdminTabs_3', true, false);
				this.setTab('wizardTabs_parcels', true, false);
				this.setTab('leaseAdminTabs_4', false, true);
				this.setTab('leaseAdminTabs_5', false, true);
				this.setTab('leaseAdminTabs_8', false, true);
				this.setTab('leaseAdminTabs_9', false, true);
				this.setTab('leaseAdminTabs_10', false, true);
				this.setTab('leaseAdminTabs_11', false, true);
			}else if(this.leaseAdminTabs.wizard.getItemType() == 'STRUCTURE'){
				this.setTab('leaseAdminTabs_2', true, false);
				this.setTab('leaseAdminTabs_3', false, true);
				this.leaseAdminTabs.findTab('leaseAdminTabs_3').setTitle(getMessage('title_structure'));
				this.setTab('leaseAdminTabs_4', false, true);
				this.setTab('leaseAdminTabs_5', true, false);
				this.setTab('leaseAdminTabs_8', false, true);
				this.setTab('leaseAdminTabs_9', false, true);
				this.setTab('leaseAdminTabs_10', false, true);
				this.setTab('leaseAdminTabs_11', false, true);
			}else if(this.leaseAdminTabs.wizard.getItemType() == 'LAND'){
				this.setTab('leaseAdminTabs_2', true, false);
				this.setTab('leaseAdminTabs_3', false, true);
				this.leaseAdminTabs.findTab('leaseAdminTabs_3').setTitle(getMessage('title_land'));
				this.setTab('wizardTabs_parcels', false, true);
				this.setTab('leaseAdminTabs_4', false, true);
				this.setTab('leaseAdminTabs_5', true, false);
				this.setTab('leaseAdminTabs_8', false, true);
				this.setTab('leaseAdminTabs_9', false, true);
				this.setTab('leaseAdminTabs_10', false, true);
				this.setTab('leaseAdminTabs_11', false, true);
			}
		}
		this.setTab('leaseAdminTabs_6', false, true);
		this.setTab('leaseAdminTabs_7', false, true);
	},
	navigate: function(direction){
		var tab = this.leaseAdminTabs.findTab(this.leaseAdminTabs.selectedTabName);
		var nextTab = null;
		var index = getIndexOf(this.leaseAdminTabs.tabs, tab);
		if(direction == 'forward'){
			for(var i=index+1;i<this.leaseAdminTabs.tabs.length;i++){
				if(this.leaseAdminTabs.tabs[i].enabled){
					nextTab = this.leaseAdminTabs.tabs[i].name;
					break;
				}
			}
		}
		if(direction == 'backward'){
			for(var i=index-1;i>-1;i--){
				if(this.leaseAdminTabs.tabs[i].enabled){
					nextTab = this.leaseAdminTabs.tabs[i].name;
					break;
				}
			}
		}
		if(nextTab != null){
			this.leaseAdminTabs.selectTab(nextTab);
			//customAfterTabChange(this.leaseAdminTabs, nextTab);
		}
	},
	navigateToTab:function(index){
		this.leaseAdminTabs.selectTab(this.leaseAdminTabs.tabs[index].name);
	},
	setTab: function(tab, hide, enable){
		if(hide){
			this.leaseAdminTabs.hideTab(tab, true);
		}else{
			this.leaseAdminTabs.showTab(tab, true);
		}
		this.leaseAdminTabs.findTab(tab).enabled = enable;
		this.leaseAdminTabs.enableTab(tab, enable);
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
		case 'leaseAdminTabs_0':{
			controller = 'rplmType';
			break;
		}
		case 'leaseAdminTabs_1':{
			controller = 'rplmOwnership';
			break;
		}
		case 'leaseAdminTabs_2':{
			controller = 'rplmBuilding';
			break;
		}
		case 'leaseAdminTabs_3':{
			controller = 'rplmProperty';
			break;
		}
		case 'wizardTabs_parcels':{
            controller = 'rplmParcels';
            break;
        }
		case 'leaseAdminTabs_4':{
			controller = 'rplmLease';
			break;
		}
		case 'leaseAdminTabs_5':{
			controller = 'rplmSuite';
			break;
		}
		case 'leaseAdminTabs_6':{
			controller = 'rplmDocuments';
			break;
		}
		case 'leaseAdminTabs_7':{
			controller = 'abRepmContactsController';
			break;
		}
		case 'leaseAdminTabs_8':{
			controller = 'rplmBaseRents';
			break;
		}
		case 'leaseAdminTabs_9':{
			controller = 'rplmClauses';
			break;
		}
		case 'leaseAdminTabs_10':{
			controller = 'rplmOptions';	
			break;
		}
		case 'leaseAdminTabs_11':{
			controller = 'rplmAmendments';
			break;
		}
	}
	leaseAdminWizardController.showSelection({
					'action':leaseAdminWizardController.leaseAdminTabs.wizard.getAction(),
					'type':leaseAdminWizardController.leaseAdminTabs.wizard.getActionType(),
					'item':leaseAdminWizardController.leaseAdminTabs.wizard.getItemId(), 
					'itemType':leaseAdminWizardController.leaseAdminTabs.wizard.getItemType(),
					'lease':leaseAdminWizardController.leaseAdminTabs.wizard.getLeaseId()});
	if(tabPanel.findTab(selectedTabName).isContentLoaded){
		tabPanel.findTab(selectedTabName).getContentFrame().View.controllers.get(controller).initVariables(tabPanel, leaseAdminWizardController);
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
