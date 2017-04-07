var manageLocationMainController = View.createController('manageLocationMainController', {
	eventController:'',
	docController:'',
	commLogController:'',
	docController:'',
	treeController:'',
	regTreeController:'',
	
	callFromTab1:false,
	reglocArray:[],
	eventController:'',
	assignController:'',
	currentClicked:0,
	//mainController:'',
	disableTabsArrForDelete:new Array(['editLocation',false],['events',false],['docs',false],['commLogs',false]),
	
	/**
	 * Object
	 * key: tab name
	 * value: refresh or not(1: refresh)
	 */
	tabNameRefresh: null,
	
	disableTabsArr: new Array(['events',false],['docs',false],['commLogs',false]),
	afterInitialDataFetch: function() {
		this.initTabRefreshObj();
		enableAndDisableTabs(this.compLocationTabs,this.disableTabsArrForDelete);
		var tabs = View.panels.get("compLocationTabs");
    tabs.addEventListener('beforeTabChange', this.beforeTabChange.createDelegate(this));                
    tabs.addEventListener('afterTabChange', this.afterTabChange.createDelegate(this));
    this.tabNameRefresh['assignLocation'] = 1;                
	},
	
	initTabRefreshObj: function(){
    	var tabs = this.compLocationTabs.tabs;
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
    		if (prop!=selectedTabName[0] && prop!=selectedTabName[1]) {
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
    		else if (selectedTabName=="assignLocation") {
    			currentTab.refresh();
    	  }
   			this.setTabRefreshObj(selectedTabName, 0);
			}
    },
    
    beforeTabChange: function(tabPanel,currentTabName,selectedTabName){
    	
    	//close open window if change to another tab.
    	var tab = tabPanel.findTab(currentTabName);
    	if(currentTabName=="commLogs"){
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
})