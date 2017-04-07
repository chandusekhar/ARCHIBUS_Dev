var abCbActivityItemCtrl = View.createController('abCbActivityItemCtrl', {
	// page mode - from where is opened.
	taskMode: "manager",
	
	// the Select Project's controller "abCbProjectCtrl"
	projectCtrl: null,

	afterViewLoad: function(){
		// we must set task mode custom properties to main tabs
		for (var i = 0; i < this.abCbActivityItemsTabs.tabs.length; i++) {
			this.abCbActivityItemsTabs.tabs[i].taskMode = this.taskMode;
			this.abCbActivityItemsTabs.tabs[i].mainControllerId = "abCbActivityItemCtrl";
		}
	},
	
	afterInitialDataFetch: function(){
		//check if service request is enabled
		var helpDeskProcess = [{activityId : 'AbBldgOpsHelpDesk', processIds: ['Create Service Request','Client']}];
		var isUserProcess = this.view.isProcessAssignedToUser(helpDeskProcess);

		var paramValue = getActivityParameter('AbRiskCleanBuilding', 'bldg_ops');
		if((valueExistsNotEmpty(paramValue) && paramValue.toLowerCase() == "no" ) || !isUserProcess){
			this.abCbActivityItemsTabs.showTab('abCbActivityItemsTab_3', false);
		}
		
		this.enableTabsFor();
	},
	
	/**
	 * enable/disable tabs for action
	 * from here tabs refresh is controlled
	 * @param type : initForProject, default 
	 */
	enableTabsFor: function(type, currentTab, isFromSample){
		switch(type){
			case 'initForProject':
				{
					// change title for the selected project
					View.setTitle(getMessage("viewTitle").replace("{0}", this.projectId));
				
					// main tabs:
					this.abCbActivityItemsTabs.enableTab('abCbActivityItemsTab_0', true);
					this.abCbActivityItemsTabs.enableTab('abCbActivityItemsTab_2', true);
					this.abCbActivityItemsTabs.enableTab('abCbActivityItemsTab_3', true);
					
					var commItemsTab = this.abCbActivityItemsTabs.selectTab('abCbActivityItemsTab_1');
					
					try{
						if(commItemsTab.isContentLoaded){
							var commItemsController = commItemsTab.getContentFrame().View.controllers.get('abCbActItemsCommlogCtrl');
							commItemsController.afterInitialDataFetch();
						}
					}catch(e){}
					
					try{
						var actionItemsTab = this.abCbActivityItemsTabs.findTab('abCbActivityItemsTab_2');
						if(actionItemsTab.isContentLoaded){
							var actionItemsController = actionItemsTab.getContentFrame().View.controllers.get('abCbActivityActionsCtrl');
							actionItemsController.afterInitialDataFetch();
						}
					}catch(e){}

					try{
						var reqItemsTab = this.abCbActivityItemsTabs.findTab('abCbActivityItemsTab_3');
						if(reqItemsTab.isContentLoaded){
							var reqItemsController = reqItemsTab.getContentFrame().View.controllers.get('abCbActivityReqCtrl');
							reqItemsController.afterInitialDataFetch();
						}
					}catch(e){}

					break;
				}
			default:
				{
					// main tabs:
					this.abCbActivityItemsTabs.enableTab('abCbActivityItemsTab_1', false);
					this.abCbActivityItemsTabs.enableTab('abCbActivityItemsTab_2', false);
					this.abCbActivityItemsTabs.enableTab('abCbActivityItemsTab_3', false);
					
					this.abCbActivityItemsTabs.selectTab('abCbActivityItemsTab_0');
					
					break;
				}
		}
	}
});