var abCbMyAbateReqsCtrl = View.createController('abCbMyAbateReqsCtrl', {
	// page mode - from where is opened.
	taskMode: "worker",
	
	/*
	 * Apply user restriction
	 * assessed_by --> user name
	 * assigned_to , hcm_abate_by --> person_id from cb_accredit_person table 
	 * = action item restriction + " OR " + service request restriction
	 */
	userRoleRestriction: "EXISTS(SELECT 1 FROM activity_log WHERE activity_log.activity_type LIKE 'HAZMAT -%' AND activity_log.project_id = project.project_id "
						+ "AND ( activity_log.assessed_by = ${sql.literal(user.name)}   OR activity_log.assigned_to IN (SELECT person_id FROM cb_accredit_person WHERE cb_accredit_person.em_id = ${sql.literal(user.employee.id)}) "
						+ "OR activity_log.hcm_abate_by IN (SELECT person_id FROM cb_accredit_person WHERE cb_accredit_person.em_id = ${sql.literal(user.employee.id)})))"
						+ " OR "
						+ "EXISTS(SELECT 1 FROM activity_log WHERE activity_log.activity_type = 'SERVICE DESK - MAINTENANCE' AND activity_log.project_id = project.project_id "
						+ "AND (activity_log.supervisor = ${sql.literal(user.employee.id)} "
						+ "OR (activity_log.supervisor IS NULL AND NOT activity_log.work_team_id IS NULL AND activity_log.work_team_id IN (SELECT work_team_id FROM cf WHERE email = '${user.email}'))))",
		
	// selected project id
	projectId: null,
	
	afterViewLoad: function(){
		// we must set task mode custom properties to main tabs
		for (var i = 0; i < this.abCbActivityItemsTabs.tabs.length; i++) {
			this.abCbActivityItemsTabs.tabs[i].taskMode = this.taskMode;
			this.abCbActivityItemsTabs.tabs[i].mainControllerId = "abCbMyAbateReqsCtrl";
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