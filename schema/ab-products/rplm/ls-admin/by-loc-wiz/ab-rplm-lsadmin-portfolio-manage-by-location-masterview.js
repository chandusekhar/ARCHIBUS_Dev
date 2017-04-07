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
		this.type = 'LEASEADMIN';
		this.action='';
		this.actionType='LEASE';
		this.itemId=null;
		this.itemType=null;
		this.itemIsOwned=null;
		this.leaseId=null;
		this.leaseType=null;
	},
	reset: function(){
		this.type = 'LEASEADMIN';
		this.action='';
		this.actionType='LEASE';
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
var tabsLeaseAdminMngByLocationController = View.createController('tabsLeaseAdminMngByLocation',{
	afterInitialDataFetch:function(){
		this.tabsLeaseAdminMngByLocation.wizard = new Ab.portfAdminWizard.Wizard();
		this.tabsLeaseAdminMngByLocation.tabsStatus = new Array();
		this.tabsLeaseAdminMngByLocation.addEventListener('afterTabChange', afterTabChange);
		for(var i=0;i<this.tabsLeaseAdminMngByLocation.tabs.length;i++){
			this.tabsLeaseAdminMngByLocation.tabsStatus[this.tabsLeaseAdminMngByLocation.tabs[i].name] = false;
		}
		if(!hasValidArcGisMapLicense()){
			this.tabsLeaseAdminMngByLocation.hideTab("tabsLeaseAdminMngByLocation_0");
		}
		this.tabsLeaseAdminMngByLocation.selectTab('tabsLeaseAdminMngByLocation_4');
	},
	initTabs:function(lease_id){
		var params = {
			tableName: 'ls',
			fieldNames: toJSON(['ls.ls_id', 'ls.bl_id', 'ls.pr_id']),
			restriction: toJSON({'ls.ls_id':lease_id})
		}
		var result = Workflow.call('AbCommonResources-getDataRecords', params);
		if(result.code = 'executed'){
			if(result.data.records[0]['ls.bl_id'].length >0 ){
				this.tabsLeaseAdminMngByLocation.wizard.setItemId(result.data.records[0]['ls.bl_id']);
				this.tabsLeaseAdminMngByLocation.wizard.setItemType('BUILDING');
				this.tabsLeaseAdminMngByLocation.showTab('tabsLeaseAdminMngByLocation_1', true);
				this.tabsLeaseAdminMngByLocation.enableTab('tabsLeaseAdminMngByLocation_1', true);
			}else if(result.data.records[0]['ls.pr_id'].length >0 ){
				if(this.tabsLeaseAdminMngByLocation.selectedTabName == 'tabsLeaseAdminMngByLocation_1'){
					this.tabsLeaseAdminMngByLocation.selectTab('tabsLeaseAdminMngByLocation_2');
				}
				this.tabsLeaseAdminMngByLocation.hideTab('tabsLeaseAdminMngByLocation_1', true);
				this.tabsLeaseAdminMngByLocation.enableTab('tabsLeaseAdminMngByLocation_1', false);
				this.tabsLeaseAdminMngByLocation.wizard.setItemId(result.data.records[0]['ls.pr_id']);
				this.tabsLeaseAdminMngByLocation.wizard.setItemType('STRUCTURE');
			}
		}else{
			Workflow.handleError(result);
		}
		this.tabsLeaseAdminMngByLocation.wizard.setLeaseId(lease_id);
		refreshTabSettings(this.tabsLeaseAdminMngByLocation, this.tabsLeaseAdminMngByLocation.selectedTabName);
	}
})

function refreshTabSettings(tabPanel, selectedTabName){
	var controller = '';
	switch(selectedTabName){
		case 'tabsLeaseAdminMngByLocation_0':{
			controller = 'mapCtrl';
			break;
		}
		case 'tabsLeaseAdminMngByLocation_1':{
			controller = 'rplmSuite';
			break;
		}
		case 'tabsLeaseAdminMngByLocation_2':{
			controller = 'rplmDocuments';
			break;
		}
		case 'tabsLeaseAdminMngByLocation_3':{
			controller = 'abRepmContactsController';
			break;
		}
		case 'tabsLeaseAdminMngByLocation_4':{
			controller = 'rplmBaseRents';
			break;
		}
		case 'tabsLeaseAdminMngByLocation_5':{
			controller = 'rplmClauses';
			break;
		}
		case 'tabsLeaseAdminMngByLocation_6':{
			controller = 'rplmOptions';
			break;
		}
		case 'tabsLeaseAdminMngByLocation_7':{
			controller = 'rplmAmendments';
			break;
		}
	}
	var objController = null;
	var objTab = tabPanel.findTab(selectedTabName);
	if(objTab.useFrame){
		objController = objTab.getContentFrame().View.controllers.get(controller);
	}else{
		objController = View.controllers.get(controller);
	}
	if(selectedTabName != 'tabsLeaseAdminMngByLocation_0'){
		objController.initVariables(tabPanel, tabsLeaseAdminMngByLocationController);
		objController.restoreSettings();
	}else{
		objController.init();
		objController.htmlMap.actions.get('highlight').show(false);
		objController.htmlMap.actions.get('reports').show(false);
		if (tabPanel.wizard.getLeaseId() != null) {
			objController.showSelectedLease(new Array(tabPanel.wizard.getItemId()), tabPanel.wizard.getLeaseId(), tabPanel.wizard.getItemType(), false);
		}
	}
}
var tabsPanel = null;
var selected = null;
function afterTabChange(tabPanel, selectedTabName){
	tabsPanel = tabPanel;
	selected = selectedTabName;
	var objTab = tabPanel.findTab(selectedTabName);
	if (objTab.useFrame) {
		objTab.loadView();
	}
	else {
		delayedRefreshTabSettings();
	}
}

function delayedRefreshTabSettings(){
	var objTab = tabsPanel.findTab(selected);
	if (objTab.useFrame) {
		if (objTab.getContentFrame().View == undefined) {
			setTimeout('delayedRefreshTabSettings()', 500);
			return;
		}
	}
	else {
		refreshTabSettings(tabsPanel, selected);
	}
}
