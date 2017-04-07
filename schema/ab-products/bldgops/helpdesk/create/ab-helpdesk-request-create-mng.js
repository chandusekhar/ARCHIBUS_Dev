var abHpdReqCreateMngController = View.createController("abHpdReqCreateMngController",{
	basicRestriction: null,
	

	afterInitialDataFetch : function() {
		// specified tabs according to the request type
		var groupMoveTabs = {
			'requestType' : 'SERVICE DESK - GROUP MOVE',
			'tabs' : ['catalog', 'basic', 'gpMoveRequestInfoTab','groupMoveDetailTab', 'groupMoveResult']
		};
	
		var individualMoveTabs = {
			'requestType' : 'SERVICE DESK - INDIVIDUAL MOVE',
			'tabs' : ['catalog', 'basic', 'indvMoveRequestInfoTab',   'groupMoveResult']
		};
	
		var departmentSpaceTabs = {
			'requestType' : 'SERVICE DESK - DEPARTMENT SPACE',
			'tabs' : ['catalog', 'basic', 'question', 'assignments', 'departmentSpaceResult']
		};
	
		// add the tab setting to dynamicAssemblyTabsController
		var dynamicAssemblyTabsController = View.controllers.get('dynamicAssemblyTabsController');
		dynamicAssemblyTabsController.specifiedTabsByRequestType.push(groupMoveTabs);
		dynamicAssemblyTabsController.specifiedTabsByRequestType.push(individualMoveTabs);
		dynamicAssemblyTabsController.specifiedTabsByRequestType.push(departmentSpaceTabs);
	}
});