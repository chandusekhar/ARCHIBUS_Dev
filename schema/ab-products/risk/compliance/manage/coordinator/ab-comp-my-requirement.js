
var abCompRegulationController = View.createController('abCompRegulationController', {
	/**
	 * check if it is new Record.
	 */
	newRecord: false,
	
	regulation: null,
	regprogram: null,
	notifyRestriction: '',
	/*
	 * tab 5 controller.
	 */
	commLogController: '',
	
	eventController: '',
	/**
	 * check if it is coordinator model, determine sub tab with or without function button and disable specified fields.
	 */
	isCoordinator: true,
	/**
	 * if it is report model, add below restriction as default.
	 */
	extraRestriction: "(regrequirement.em_id = ${sql.literal(user.employee.id)} or regprogram.em_id = ${sql.literal(user.employee.id)})",
    
	/**
	 * Object
	 * key: tab name
	 * value: refresh or not(1: refresh)
	 */
	tabNameRefresh: null,

    //----------------event handle--------------------
    afterViewLoad: function(){
    },
    
    afterInitialDataFetch: function(){
    	this.initTabRefreshObj();
			this.sbfDetailTabs.addEventListener('beforeTabChange', this.beforeTabChange.createDelegate(this));
			this.sbfDetailTabs.addEventListener('afterTabChange', this.afterTabChange.createDelegate(this));
    },
    initTabRefreshObj: function(){
    	var tabs = this.sbfDetailTabs.tabs;
    	var tabsArray = [];
    	var obj = new Object();
    	for(var i=0;i<tabs.length;i++){
    		obj[tabs[i].name] = 0;
    	}
    	this.tabNameRefresh = obj;
    },
    /**
     * update select tab to refresh status.
     */
    setTabRefreshObj: function(selectedTabName, status){
    	this.tabNameRefresh[selectedTabName] = status;
    },
    /**
     * update other select tab to refresh status.
     */
    setOthersTabRefreshObj: function(selectedTabName, status){
    	var tabNameRefresh = this.tabNameRefresh;
    	for(var prop in tabNameRefresh){
    		if(prop!=selectedTabName){
    			tabNameRefresh[prop] = status;
    		}
    	}
    },
    /**
     * when tab changed.
     */
    afterTabChange: function(tabPanel,selectedTabName){
    	var currentTab = tabPanel.findTab(selectedTabName);
    	if(this.tabNameRefresh[selectedTabName]==1){
    		if(currentTab.isContentLoaded){
    			var controller;
    			if (selectedTabName=='define') {
    			  controller = currentTab.getContentFrame().View.controllers.get('abCompDefineRequirementController');
    			}
    			else if (selectedTabName=='notifications') {
    			  controller = currentTab.getContentFrame().View.controllers.get('defNotificationController');
    			}
    			else {
    			  controller = currentTab.getContentFrame().View.controllers.get(0);
    			}
    			if (typeof(controller.afterTabChange)=='function') {
   				  controller.afterTabChange();
   				}
    		}
   			this.setTabRefreshObj(selectedTabName, 0);
		  }
    },
    
    beforeTabChange: function(tabPanel,currentTabName,selectedTabName){
    	var currentTab = tabPanel.findTab(selectedTabName);
    	if(this.tabNameRefresh[selectedTabName]==1){
    		if(currentTab.isContentLoaded){
    			var controller;
    			if (selectedTabName=='define') {
    			  controller = currentTab.getContentFrame().View.controllers.get('abCompDefineRequirementController');
    			}
    			else if (selectedTabName=='notifications') {
    			  controller = currentTab.getContentFrame().View.controllers.get('defNotificationController');
    			}
    			else {
    			  controller = currentTab.getContentFrame().View.controllers.get(0);
    			}
   				controller.afterInitialDataFetch();
    		}
    		return true;
		  }
    }
});