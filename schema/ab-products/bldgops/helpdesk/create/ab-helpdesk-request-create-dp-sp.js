var abOndReqCreateController = View.createController("abOndReqCreateController",{
	basicRestriction: null,
	
	/**
	 * Load parameter after data fetched.
	 */
	afterInitialDataFetch: function() {
	      this.helpDeskRequestTabs.selectTab('basic',{"activitytype.activity_type": 'SERVICE DESK - DEPARTMENT SPACE'}, true);
	  	// specified tabs according to the request type

			var departmentSpaceTabs = {
				'requestType' : 'SERVICE DESK - DEPARTMENT SPACE',
				'tabs' : ['catalog', 'basic', 'question','assignments', 'departmentSpaceResult']
			};
			// add the tab setting to dynamicAssemblyTabsController
			var dynamicAssemblyTabsController = View.controllers.get('dynamicAssemblyTabsController');
			dynamicAssemblyTabsController.specifiedTabsByRequestType.push(departmentSpaceTabs);
	
	}
});