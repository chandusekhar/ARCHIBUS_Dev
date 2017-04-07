
var programMapLocTabsController = View.createController('programMapLocTabsController', {
	/**
	 * Object
	 * key: tab name
	 * value: refresh or not(1: refresh)
	 */
	tabNameRefresh: null,
	
	res: null,
	
	// use for tab forward
	nextTabArr : new Array({
		panelName : 'regulationGrid',
		field : new Array([ "regloc.regulation", "regloc.regulation" ])
	}, {

		panelName : 'programGrid',
		field : new Array([ "regloc.regulation", "regloc.regulation" ],
				[ "regloc.reg_program", "regloc.reg_program" ])

	}),    

	afterInitialDataFetch : function() {
		View.usedInMapView = true;
		this.refreshTabs(View.restriction);

    	this.initTabRefreshObj();
		this.sbfDetailTabs.addEventListener('beforeTabChange', this.beforeTabChange.createDelegate(this));
		this.sbfDetailTabs.addEventListener('afterTabChange', this.afterTabChange.createDelegate(this));
	    
	},
	
	refreshTabs: function(restriction) {
		var tabs = this.sbfDetailTabs;
        //get restriction from the view object and refresh all tabs
		for(var i=0; i<tabs.tabs.length;i++){
			tabs.tabs[i].restriction = restriction;
			tabs.tabs[i].refresh();
		}
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
    setOthersTabRefreshObj: function(selectedTabName, status, res){
    	var tabNameRefresh = this.tabNameRefresh;
    	for(var prop in tabNameRefresh){
    		if(prop!=selectedTabName){
    			tabNameRefresh[prop] = status;
    		}
    	}
    	this.res = res;
    },
    /**
     * when tab changed.
     */
    afterTabChange: function(tabPanel,selectedTabName){
    	var currentTab = tabPanel.findTab(selectedTabName);
    	if(this.tabNameRefresh[selectedTabName]==1){
    		if(!currentTab.isContentLoaded){
    			doAfterTabChange(currentTab, programMapLocTabsController, selectedTabName);
    		} else {
    			doTabChange(programMapLocTabsController, selectedTabName);
    		}
   			this.setTabRefreshObj(selectedTabName, 0);
		}
    },
    
    beforeTabChange: function(tabPanel,currentTabName,selectedTabName){
    	
    	//close open window if change to another tab.
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

/**
 * called when click change tab
 * if tab grid panel show showOnLoad=false, use this method to make sure 'doTabChange' method invoke after grid hidden.
 * @param selectedTabName : selected Tab Name
 */
function doAfterTabChange(currentTab, controller,selectedTabName){
	if(!currentTab.isContentLoaded){
//		tab with iframe loading two times, invoke this method after waiting 1st make sure all the changing occur after tab second loading. 
		doAfterTabChange.defer(500, this, [currentTab, controller,selectedTabName]);
	}else{
		doTabChange(controller, selectedTabName);
	}
}


/**
 * do refresh and set title.
 * @param controller
 * @param selectedTabName
 */	
function doTabChange(controller, selectedTabName){

	var regulation = controller.objRestrictions["regulation"];
	var reg_program = controller.objRestrictions["reg_program"];
	var reg_requirement = controller.objRestrictions["reg_requirement"];
	
	var childView = getChildView(controller, selectedTabName);
	 if (selectedTabName=='programLocTab') {
		 childView.panels.get('programGrid').refresh("regulation.regulation  = '"+regulation+"'");
	}
    if (selectedTabName=='requireLocTab') {
    	childView.panels.get('requireGrid').refresh("regulation.regulation  = '"+regulation+"' and regprogram.reg_program = '"+reg_program+"'");
    }
}
/**
 * recursive get child View. 
 */
function getChildView(controller, selectedTabName){
	var tab = controller.sbfDetailTabs.findTab(selectedTabName);
	var iframe = tab.getContentFrame();    
	if(!iframe) {
		getChildView.defer(500, this, [controller,selectedTabName]);
	}
	var childView = iframe.View;
	if(!childView){
		getChildView.defer(500, this, [controller,selectedTabName]);
	}else{
		return childView;
	}
}