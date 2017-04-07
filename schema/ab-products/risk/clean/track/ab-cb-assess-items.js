var abCbAssessItemsCtr = View.createController('abCbAssessItemsCtr', {
	// page mode - from where is opened.
	taskMode: "manager",
	
	// the Select Project's controller "abCbProjectCtrl"
	projectCtrl: null,
	
	// selected project id
	projectId: null,
	
	// project prob_type
	projProbType: null,
	
	// selected assessment item
	activityLogId: -100,
	
	isServiceRequestEnabled: true,
	
	assessmentRow: null,
	
	// activity log info object
	activityLogInfo: {
		activity_log_id: {value: '', label: ''},
		bl_id:  {value: '', label: ''},
		fl_id:  {value: '', label: ''},
		rm_id:  {value: '', label: ''},
		hcm_loc_typ_id:  {value: '', label: ''},
		hcm_id:  {value: '', label: ''},
		// reset info object
		reset: function(){
			var object = this;
			for (prop in object){
				if (prop != 'reset'){
					object[prop].value = '';
					object[prop].label = '';
				}
			}
		}
	},
	
	afterViewLoad: function(){
		var helpDeskProcess = [{activityId : 'AbBldgOpsHelpDesk', processIds: ['Create Service Request','Client']}];
		var isUserProcess = this.view.isProcessAssignedToUser(helpDeskProcess);
		
		var paramValue = getActivityParameter('AbRiskCleanBuilding', 'bldg_ops');
		var isActivityParam = true;
		if(valueExistsNotEmpty(paramValue) && (paramValue.toLowerCase() == "no" )){
			isActivityParam = false;
		}
		
		this.isServiceRequestEnabled = isActivityParam && isUserProcess;
		// we must set task mode custom properties to main tabs
		for (var i = 0; i < this.abCbAssessItemsTabs.tabs.length; i++) {
			this.abCbAssessItemsTabs.tabs[i].taskMode = this.taskMode;
			this.abCbAssessItemsTabs.tabs[i].mainControllerId = "abCbAssessItemsCtr";
		}
		// we must set this to child tabs also
		for (var i = 0; i < this.abCbAssessEditTabs.tabs.length; i++) {
			this.abCbAssessEditTabs.tabs[i].taskMode = this.taskMode;
			this.abCbAssessEditTabs.tabs[i].mainControllerId = "abCbAssessItemsCtr";
		}
		for (var i = 0; i < this.abCbAssessActivityTabs.tabs.length; i++) {
			this.abCbAssessActivityTabs.tabs[i].taskMode = this.taskMode;
			this.abCbAssessActivityTabs.tabs[i].mainControllerId = "abCbAssessItemsCtr";
		}
		
	},
	
	afterInitialDataFetch: function(){
		this.enableTabsFor();
	},
	
	/*
	 * Add/Edit Assessment Items
	 */
	addEditAssessment: function(pKey, isFromSample){
		if(!valueExists(isFromSample)){
			isFromSample = false;
		}
		this.activityLogId = pKey;
		if ( pKey >= 0 ){
			this.enableTabsFor('edit', 'abCbAssessItemsTab_1', isFromSample);
		}else{
			this.enableTabsFor('new', 'abCbAssessItemsTab_1', isFromSample);
		}
	},
	
	/**
	 * enable/disable tabs for action
	 * from here tabs refresh is controlled
	 * @param type : initForProject, edit, new, default 
	 */
	enableTabsFor: function(type, currentTab, isFromSample){
		if(!valueExists(isFromSample)){
			isFromSample = false;
		}
		switch(type){
			case 'new':
				{
					// main tabs
					this.abCbAssessItemsTabs.enableTab('abCbAssessItemsTab_2', true);
					this.abCbAssessItemsTabs.enableTab('abCbAssessItemsTab_3', false);
					this.abCbAssessItemsTabs.enableTab('abCbAssessItemsTab_4', false);
					
					// subtabs
					this.abCbAssessEditTabs.enableTab('abCbAssessEditTab_1', true);
					this.abCbAssessEditTabs.enableTab('abCbAssessEditTab_2', false);
					
					this.abCbAssessActivityTabs.enableTab('abCbAssessActivityTab_1', false);
					this.abCbAssessActivityTabs.enableTab('abCbAssessActivityTab_2', false);
					
					if(this.isServiceRequestEnabled){
						this.abCbAssessActivityTabs.enableTab('abCbAssessActivityTab_3', false);
					}else{
						this.abCbAssessActivityTabs.showTab('abCbAssessActivityTab_3', false);
					}
					
					// when is default we must reset some values
					this.activityLogId = -100;
					this.activityLogInfo.reset();
					// we must refresh some tabs
					if(currentTab == 'abCbAssessItemsTab_1'){
						this.abCbAssessItemsTabs.selectTab('abCbAssessItemsTab_2');

						var assessDetailsTab = this.abCbAssessEditTabs.selectTab('abCbAssessEditTab_1');
						if(assessDetailsTab.isContentLoaded){
							var assessDetailsController = assessDetailsTab.getContentFrame().View.controllers.get('abCbAssessEditCtrl');
							assessDetailsController.afterInitialDataFetch();
						}
					}

					break;
				}
			case 'edit':
				{
					this.view.log('EDIT : start');
					// main tabs
					this.abCbAssessItemsTabs.enableTab('abCbAssessItemsTab_2', true);
					this.abCbAssessItemsTabs.enableTab('abCbAssessItemsTab_3', true);
					this.abCbAssessItemsTabs.enableTab('abCbAssessItemsTab_4', true);
					// subtabs
					this.abCbAssessEditTabs.enableTab('abCbAssessEditTab_1', true);
					this.abCbAssessEditTabs.enableTab('abCbAssessEditTab_2', true);

					this.abCbAssessActivityTabs.enableTab('abCbAssessActivityTab_1', true);
					this.abCbAssessActivityTabs.enableTab('abCbAssessActivityTab_2', true);
					if(this.isServiceRequestEnabled){
						this.abCbAssessActivityTabs.enableTab('abCbAssessActivityTab_3', true);
					}else{
						this.abCbAssessActivityTabs.showTab('abCbAssessActivityTab_3', false);
					}
										
					// we need to SELECT AND refresh History tab
					try{
						var assessHistoryTab = this.abCbAssessItemsTabs.findTab('abCbAssessItemsTab_4');
						if (assessHistoryTab.isContentLoaded){
							this.abCbAssessItemsTabs.selectTab('abCbAssessItemsTab_4');
							var assessHistoryController = assessHistoryTab.getContentFrame().View.controllers.get('abCbAssessHistoryCtrl');
							assessHistoryController.afterInitialDataFetch();
						}
					} catch(e){}

					// select parent tab before selection of its sub-tab
					this.abCbAssessItemsTabs.selectTab('abCbAssessItemsTab_2');

					// refresh of Add/Edit Assessment's sub-tabs
					try{
						var assessDetailsTab = this.abCbAssessEditTabs.findTab('abCbAssessEditTab_1');
						if(assessDetailsTab.isContentLoaded){
							var assessDetailsController = assessDetailsTab.getContentFrame().View.controllers.get('abCbAssessEditCtrl');
							assessDetailsController.afterInitialDataFetch();
						}
					}catch(e){}

					// we need to SELECT AND refresh Samples tab
					try{
						var assessSampleTab = this.abCbAssessEditTabs.findTab('abCbAssessEditTab_2');		
						if (assessSampleTab.isContentLoaded) {
							this.abCbAssessEditTabs.selectTab('abCbAssessEditTab_2');
							var assessSampleController = assessSampleTab.getContentFrame().View.controllers.get('abCbAssessSampleCtrl');
							assessSampleController.afterInitialDataFetch();
						}
					} catch(e){}

					// select the sub-tab
					if (currentTab == 'abCbAssessItemsTab_1' && isFromSample){
						this.abCbAssessEditTabs.selectTab('abCbAssessEditTab_2');
					} else {
						this.abCbAssessEditTabs.selectTab('abCbAssessEditTab_1');
					}
					
					try{
						var assessComlogTab = this.abCbAssessActivityTabs.findTab('abCbAssessActivityTab_1');
						if(assessComlogTab.isContentLoaded){
							var assessComlogController = assessComlogTab.getContentFrame().View.controllers.get('abCbAssessComlogCtrl');
							assessComlogController.afterInitialDataFetch();
						}
					} catch(e){}
					
					try{
						var assessActivityItemsTab = this.abCbAssessActivityTabs.findTab('abCbAssessActivityTab_2');
						if (assessActivityItemsTab.isContentLoaded){
							var assessActivityItemsController = assessActivityItemsTab.getContentFrame().View.controllers.get('abCbAssessActionItemsCtrl');
							assessActivityItemsController.afterInitialDataFetch();
						}
					} catch(e){}
					
					try{
						var assessServReqTab = this.abCbAssessActivityTabs.findTab('abCbAssessActivityTab_3');
						if (assessServReqTab.isContentLoaded){
							var assessServReqController = assessServReqTab.getContentFrame().View.controllers.get('abCbAssessRequestCtrl');
							assessServReqController.afterInitialDataFetch();
						}
					} catch(e){}

					this.view.log('EDIT : end');
					break;
				}
			case 'initForProject':
				{
					// change title for the selected project
					View.setTitle(getMessage("viewTitle").replace("{0}", this.projectId));
				
					// main tabs:
					this.abCbAssessItemsTabs.enableTab('abCbAssessItemsTab_0', true);
					this.abCbAssessItemsTabs.enableTab('abCbAssessItemsTab_2', false);
					this.abCbAssessItemsTabs.enableTab('abCbAssessItemsTab_3', false);
					this.abCbAssessItemsTabs.enableTab('abCbAssessItemsTab_4', false);
					// when is default we must reset some values
					this.activityLogId = -100;
					this.activityLogInfo.reset();
					
					var assessItemsTab = this.abCbAssessItemsTabs.selectTab('abCbAssessItemsTab_1');
					
					if(currentTab != 'abCbAssessEditTab_1'){
						try{
							if(assessItemsTab.isContentLoaded){
								var assessItemsController = assessItemsTab.getContentFrame().View.controllers.get('abCbAssessItemsListCtrl');
								// do show the items, don't wait for the user to click on 'Show'
								assessItemsController.ifShowAssessmentItems = true;
								assessItemsController.afterInitialDataFetch();
							}
						}catch(e){}
					}
					
					break;
				}
			default:
				{
					// main tabs:
					this.abCbAssessItemsTabs.enableTab('abCbAssessItemsTab_1', false);
					this.abCbAssessItemsTabs.enableTab('abCbAssessItemsTab_2', false);
					this.abCbAssessItemsTabs.enableTab('abCbAssessItemsTab_3', false);
					this.abCbAssessItemsTabs.enableTab('abCbAssessItemsTab_4', false);
					// when is default we must reset some values
					this.activityLogId = -100;
					this.activityLogInfo.reset();
					
					this.abCbAssessItemsTabs.selectTab('abCbAssessItemsTab_0');
					
					break;
				}
		}
	}
});


