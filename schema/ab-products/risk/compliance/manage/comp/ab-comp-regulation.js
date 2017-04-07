
var abCompRegulationController = View.createController('abCompRegulationController', {
	/**
	 * check if it is new Record.
	 */
	newRecord: false,
	
	regulation: null,
	/*
	 * tab 5 controller.
	 */
	commLogController: '',
	/**
	 * If Regulation = Egress or HAZMAT, disable Regulation field and Delete button.
	 */
	isEgressOrHAZMAT: false,
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
    			var controller = currentTab.getContentFrame().View.controllers.get(0);
    			if (typeof(controller.afterTabChange)=='function') {
   				  controller.afterTabChange();
   				}
    		}
   			this.setTabRefreshObj(selectedTabName, 0);
			}
    },
    
    beforeTabChange: function(tabPanel,currentTabName,selectedTabName){
    	
    	//close open window if change to another tab.
    	var tab = tabPanel.findTab(currentTabName);
    	if(currentTabName=="communicationsLog"){
    		var childController = tab.getContentFrame().View.controllers.get(0);
    		childController.commRpt.closeWindow();
    	}
    	
    	var currentTab = tabPanel.findTab(selectedTabName);
    	if(this.tabNameRefresh[selectedTabName]==1){
    		if(currentTab.isContentLoaded){
    			var controller = currentTab.getContentFrame().View.controllers.get(0);
    			controller.afterInitialDataFetch();
    		}
    		return true;
			}
    }

});    


