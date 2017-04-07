var commonEventController = View.createController('commonEventController', {
	
	//variables indicates current view is manage view or report view
	event: "",
	
	// kb 3036648 - For event docs and logs, set requirement
	regulation: null,
	regprogram: null,
	regrequirement: null,

	//variables indicates current view is manage view or report view
	mode: "manage",
 
	//variables indicates whether need to refresh Select Grid in first tab
	needRefreshSelectList: false, 

	//variables indicates whether need to refresh rest tabs
	needRefreshRestTab: false, 

	//variables indicates whether the sub tab is refreshed after select changed
	refreshedTab: {}, 

	//variables indicates whether need to refresh refresh rest tabs
	tabCtrl:{},

	afterViewLoad: function(){
		this.compTabs.eventType= "All";
		this.enableRestTabs(false);
		this.initialTabCtrl();
		this.compTabs.addEventListener('afterTabChange', afterTabChange);
	},

	/**
	 * Function to disable or enable tabs except first one
	 * @param enable: true/false 
	 */
   enableRestTabs: function(enable){
		for(var i=0; i<this.compTabs.tabs.length; i++){
			if(this.compTabs.tabs[i].name!="selectEvent"){
				this.compTabs.enableTab(this.compTabs.tabs[i].name,enable);
			}
		}
   },

   initialTabRefreshed: function(){
		this.refreshedTab['defineEvent'] = false;
		this.refreshedTab['documents'] = false;
		this.refreshedTab['communications'] = false;
		this.refreshedTab['workHistory'] = false;
		this.refreshedTab['notifications'] = false;
   },

   initialTabCtrl: function(){
		this.tabCtrl['selectEvent'] = 'abCompEventSelectController';
		this.tabCtrl['defineEvent'] = 'defineEvent';
		this.tabCtrl['documents'] = 'docController';
		this.tabCtrl['communications'] = 'commLogController';
		this.tabCtrl['workHistory'] = 'commonRptWorkHistoryController';
		this.tabCtrl['notifications'] = 'notificationTabController';
   },

   onSaveChange: function(){
		this.needRefreshSelectList = true;
		this.enableRestTabs(true);
		//need to rerefresh rest tabs since current event may be changed
		this.needRefreshRestTab = true;
		this.refreshedTab['documents'] = false;
		this.refreshedTab['communications'] = false;
		this.refreshedTab['workHistory'] = false;
		this.refreshedTab['notifications'] = false;
   }
});

/**
 * Event listener for 'afterTabChange'
 * @param tabPanel
 * @param currentTabName
 */
function afterTabChange(tabPanel, currentTabName){

	var currentTab = tabPanel.findTab(currentTabName);
	var controller = commonEventController;

	if(currentTab.isContentLoaded){	
		if(currentTabName=="selectEvent"){
			 //for first select tabs
			if(controller.needRefreshSelectList){
				 //refresh the select list in first tab
				var selectControl = currentTab.getContentFrame().View.controllers.get(controller.tabCtrl[currentTabName] );
				if(selectControl){
					selectControl.refreshGrid();
					controller.needRefreshSelectList = false;
				}
			}
		}

		else if(currentTabName!="defineEvent"){
			if(controller.needRefreshRestTab && !controller.refreshedTab[currentTabName]){
				var ctrlId = controller.tabCtrl[currentTabName];
				var ctrl = currentTab.getContentFrame().View.controllers.get(ctrlId);
				if(ctrl && ctrl.onRefresh){
					ctrl.onRefresh(controller);
				}
				controller.refreshedTab[currentTabName] = true;
			}
		}
	}
	//firstly loaded 
	else {
		controller.refreshedTab[currentTabName] = true;
	}
}