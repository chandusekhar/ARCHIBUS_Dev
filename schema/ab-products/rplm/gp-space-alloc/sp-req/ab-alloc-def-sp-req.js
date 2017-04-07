/**
* Added for 22.1 :  Define Space Requirement view 
* @author Zhang Yi
* 2015-05-15
*/ 
var abAllocDefSpReqCtrl = View.createController('abAllocDefSpReqCtrl', {
	/**
	 * Restrictions for all other sub tabs excpet for the first select tab.
	 */
	tabRestrictions: {"sb_name": null},

	/**
	 * Store each sub tab's controller id.
	 */
	tabCtrls : {"editRequirement": "abAllocDefSpReqEditCtrl", "chart": "abAllocDefSpReqChartCtrl"}, 

	/**
	 * Track whether the sub tab need to refresh. 0: not refreshed; 1: already refreshed.
	 */
	tabRefreshStatus : {"editRequirement": 0,"chart": 0}, 

	// Track first tab
	firstTabName: 'selectRequirement',   
	
	// Track controller of the first sub tab
	firstTabCtrl: 'abAllocDefSpReqSelCtrl',

	selectedSbName:"",
		
	/**
     * Update select tab to refresh status.
     */
    setTabRefreshStatus: function(selectedTabName, status){
    	this.tabRefreshStatus[selectedTabName] = status;
    },
    
    /**
     * Update other select tab to refresh status.
     */
    setAllSubTabRefreshStatus: function(status){
    	var tabRefreshStatus = this.tabRefreshStatus;
    	for(var prop in tabRefreshStatus){
			tabRefreshStatus[prop] = status;
    	}
    },
    
    afterInitialDataFetch: function(){   	
		this.defSbTabs.addEventListener('beforeTabChange', this.beforeTabChange);
		this.defSbTabs.addEventListener('afterTabChange', this.afterTabChange);
	},
	
	/**
     * When tab changed.
     * The 'afterTabChange' is only used the first time a tab is selected,  because 'beforeTabChange' doesn't work for the first time a tab is selected.  
	  * After the first time, 'beforeTabChange' takes care of all the refreshes, and 'afterTabChange' does nothing.
     */
    afterTabChange: function(tabPanel,selectedTabName){
		if ( selectedTabName!== abAllocDefSpReqCtrl.firstTabName )	 {
			var currentTab = tabPanel.findTab(selectedTabName);
			if(!currentTab.isContentLoaded){
				doAfterTabLoaded(abAllocDefSpReqCtrl, currentTab, selectedTabName);
			}
			abAllocDefSpReqCtrl.setTabRefreshStatus(selectedTabName, 1);
		}
    },
    
    beforeTabChange: function(tabPanel,currentTabName,selectedTabName){
		if ( selectedTabName!== abAllocDefSpReqCtrl.firstTabName )	 {

			if ( abAllocDefSpReqCtrl.selectedSbName!=tabPanel.scnName) {
				abAllocDefSpReqCtrl.setAllSubTabRefreshStatus(0);
				abAllocDefSpReqCtrl.selectedSbName =  tabPanel.scnName;
			}

			//close open Dialog before change to another tab.
			var childView = getChildView(abAllocDefSpReqCtrl, currentTabName);
			if(childView){
				childView.closeDialog();
			}
			
			var currentTab = tabPanel.findTab(selectedTabName);
			if( currentTab.isContentLoaded && (abAllocDefSpReqCtrl.tabRefreshStatus[selectedTabName]==0 || (tabPanel.sbItemsChanged && 'chart'==selectedTabName) ) ) {
				doTabChange(abAllocDefSpReqCtrl, selectedTabName);
				abAllocDefSpReqCtrl.setTabRefreshStatus(selectedTabName, 1);
				tabPanel.sbItemsChanged = false;
			}
		}
		return true;
    }
});

/**
 * Called when click change tab
 * if tab grid panel show showOnLoad=false, use this method to make sure 'doTabChange' method invoke after grid hidden.
 * @param selectedTabName : selected Tab Name
 */
function doAfterTabLoaded(controller, currentTab, selectedTabName){
	if ( !currentTab.isContentLoaded ) {
		//	tab with iframe loading two times, invoke this method after waiting 1st make sure all the changing occur after tab second loading. 
		doAfterTabLoaded.defer(500, this, [controller, currentTab, selectedTabName]);
	} else {
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
	if (childView) {
		var childCtrl = childView.controllers.get(controller.tabCtrls[selectedTabName]);
		if (childCtrl) {
		 childCtrl.refreshAndShow();
		}
	}
}

/**
 * Recursivly get child View. 
 */
function getChildView(controller, selectedTabName){
	var tab = controller.defSbTabs.findTab(selectedTabName);
	var iframe = tab.getContentFrame();    
	if(!iframe) {
		getChildView.defer(500, controller, [controller,selectedTabName]);
	}
	var childView = iframe.View;
	if(!childView){
		getChildView.defer(500, controller, [controller,selectedTabName]);
	}else{
		return childView;
	}
}