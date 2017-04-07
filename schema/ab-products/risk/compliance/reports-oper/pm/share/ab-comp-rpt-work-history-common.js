/**
* Added for 22.1 :  Compliance and Building Operations Integration: Work History tab 
* @author Zhang Yi
*/ 
var commonRptWorkHistoryController = View.createController('commonRptWorkHistoryController', {
	/**
	 * object store restrictions filter all tab panel grid.
	 */
	objRestrictions: {"regulation": null,"reg_program": null,"reg_requirement": null},
	/**
	 * object store titles for all panel grid.
	 */
	objPanelTitles: null,
	/**
	 * object store [key:tabname, value:gridPanelId] for all tabs.
	 */
	objTabAndGridPanelId: null,

	/**
	 * Track need refresh.  object store [key:tabname, value:1/0] for all tabs.
	 */
	tabNameRefresh: null,

	// Track first tab
	firstTabTable: null,   
	
	// Track controller of the first sub tab
	firstTabCtrl: null,
		
	/**
     * Update select tab to refresh status.
     */
    setTabRefreshObj: function(selectedTabName, status){
    	this.tabNameRefresh[selectedTabName] = status;
    },
    
    /**
     * Update other select tab to refresh status.
     */
    setAllSubTabRefreshStatus: function(status){
    	var tabNameRefresh = this.tabNameRefresh;
    	for(var prop in tabNameRefresh){
			tabNameRefresh[prop] = status;
    	}
    },
    
    refreshSubTabs: function(){
		this.setAllSubTabRefreshStatus(1);
		if ( 'workRequests'==this.workHistoryTabs.getSelectedTabName() ) {
			var selectCtrl = this.getTabCtrl('workRequests');
			if (selectCtrl)	{
				selectCtrl.refreshOnSelectParentTabs();
			}
		}	
		else {
			this.workHistoryTabs.selectTab('workRequests');
		}
	},

    getTabCtrl: function(tabName){
		var tabCtrl;
		var subTabView =  this.workHistoryTabs.findTab(tabName).getContentFrame().View;
		if (subTabView)	{
			tabCtrl = subTabView.controllers.get(this.firstTabCtrl);
		}
		return tabCtrl;
	},
	
	/**
     * When tab changed.
     * The afterSelect listener is also used, but only so that a proper refresh will happen the first time a tab is selected,
     * because beforeTabChange doesn't work for that first refresh.  After the first time, 
     * beforeTabChange takes care of all the refreshes, and afterSelect does nothing, 
     * since beforeTabChange has already done the refresh and set the flag to not need refresh.
     */
    afterTabChange: function(tabPanel,selectedTabName){
    	var currentTab = tabPanel.findTab(selectedTabName);
    	if(commonRptWorkHistoryController.tabNameRefresh[selectedTabName]==1){
    		if(!currentTab.isContentLoaded){
    			doAfterTabChange(currentTab, commonRptWorkHistoryController, selectedTabName);
    		}
    	}
    	commonRptWorkHistoryController.setTabRefreshObj(selectedTabName, 0);
    },
    
    beforeTabChange: function(tabPanel,currentTabName,selectedTabName){
    	//close open Dialog before change to another tab.
    	if(currentTabName!=commonRptWorkHistoryController.workHistoryTabs.tabs[0].name){
    		var childView = getChildView(commonRptWorkHistoryController, currentTabName);
    		if(childView){
    			childView.closeDialog();
    		}
    	}
    	
    	var currentTab = tabPanel.findTab(selectedTabName);
    	if(commonRptWorkHistoryController.tabNameRefresh[selectedTabName]==1){
    		if(currentTab.isContentLoaded){
    			doTabChange(commonRptWorkHistoryController, selectedTabName);
    		}
    		return true;
		}
    },
    
    /**
     * call after method 'beforeTableChange' or afterTabChange. refresh selected tab grid panel and reset title name. 
     * you can overwrite this method in child controller 'afterInitialDataFetch' method, e.g. :
     * this.doTabRefreshAndSetTitle = function(){ do things... }
     */
    doSubTabRefreshAndSetTitle: function(gridPanel, selectedTabName){
		var regulation = this.workHistoryTabs.regulation;
		var reg_program = this. workHistoryTabs.reg_program;
		var reg_requirement = this. workHistoryTabs.reg_requirement;
		var eventId = this. workHistoryTabs.eventId;
		
		if ( regulation!=null && reg_program!=null && reg_requirement!=null && !eventId) {
			gridPanel.addParameter("regulation", regulation);
			gridPanel.addParameter("reg_program", reg_program);
			gridPanel.addParameter("reg_requirement", reg_requirement);
			gridPanel.refresh();
			gridPanel.setTitle( ((getMessage("title2_"+selectedTabName).replace("<{0}>", reg_requirement)).replace("<{1}>", reg_program)).replace("<{2}>", regulation));
			gridPanel.show(true);
		} 
		else if (eventId){
			gridPanel.addParameter("eventId", eventId);
			gridPanel.refresh();
			//gridPanel.setTitle( ((getMessage("title2_"+selectedTabName).replace("<{0}>", reg_requirement)).replace("<{1}>", reg_program)).replace("<{2}>", regulation));
			gridPanel.show(true);
		}
    }
});

/**
 * Called when click change tab
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
 * Do refresh and set title.
 * @param controller
 * @param selectedTabName
 */	
function doTabChange(controller, selectedTabName){
	var childView = getChildView(controller, selectedTabName);
	var gridPanelName = controller.objTabAndGridPanelId[selectedTabName];
	if ('workRequests' == selectedTabName) {
		var selectCtrl = controller.getTabCtrl('workRequests');
		if (selectCtrl && selectCtrl.getActivePanelName) {
			gridPanelName = selectCtrl.getActivePanelName();
		}
	}
	if(gridPanelName){
		var gridPanel = childView.panels.get(gridPanelName);
		controller.doSubTabRefreshAndSetTitle(gridPanel, selectedTabName);
	}
}

/**
 * Recursivly get child View. 
 */
function getChildView(controller, selectedTabName){
	var tab = controller.workHistoryTabs.findTab(selectedTabName);
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