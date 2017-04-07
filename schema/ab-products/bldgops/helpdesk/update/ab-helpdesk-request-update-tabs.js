
var helpDeskRequesUpdateTabsController =  View.createController("helpDeskRequesUpdateTabsController", {
	afterInitialDataFetch: function() {
		this.inherit();
		//add  support for dynamic tabs in 20.1
		this.setSpecifiedTabsByRequestType();
		
 		var tabs = View.panels.get("hdrUpdTabs");
 		if(tabs != null){
 			if(valueExists(window.location.parameters["activity_log_id"])
 				&& window.location.parameters["activity_log_id"] > 0){
 			
 				var activity_log_id = window.location.parameters["activity_log_id"];
	 			
 				try {
					var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-checkUserForRequest', activity_log_id, 'update');
				} 
				catch (e) {
					Workflow.handleError(e);
				}
				
				if(result.code == 'executed'){
					var res = eval('('+result.jsonExpression+')');
					if(res.check){
						var restriction = new Ab.view.Restriction();
						restriction.addClause("activity_log.activity_log_id",res.activity_log_id,"=");
						//add  support for dynamic tabs in 20.1
						var requestType = this.abHelpdeskRequestUpdateTabs_activity_logDS.getRecords(restriction)[0].getValue('activity_log.activity_type');
						var dynamicAssemblyTabsController = View.controllers.get('dynamicAssemblyTabsController');
						dynamicAssemblyTabsController.showSpecifiedTabsByRequestType(requestType);
						dynamicAssemblyTabsController.selectNextTab(restriction);
					} 
				} else {
					Workflow.handleError(result);
				}	
 			}
 		}
 	},
 	
 	setSpecifiedTabsByRequestType: function(){

		// specified tabs according to the request type
		var groupMoveTabs = {
			'requestType' : 'SERVICE DESK - GROUP MOVE',
			'tabs' : ['select', 'groupMoveDetailTab','groupMoveAssignment']
		};

		var individualMoveTabs = {
			'requestType' : 'SERVICE DESK - INDIVIDUAL MOVE',
			'tabs' : ['select', 'groupMoveDetailTab','indvMoveEditApprove']
		};

		var departmentSpaceTabs = {
			'requestType' : 'SERVICE DESK - DEPARTMENT SPACE',
			'tabs' : ['select', 'departmentSpaceDetailTab','assignments']
		};

		// add the tab setting to dynamicAssemblyTabsController
		var dynamicAssemblyTabsController = View.controllers.get('dynamicAssemblyTabsController');
		dynamicAssemblyTabsController.defaultTabs = ['select', 'update'];
		dynamicAssemblyTabsController.specifiedTabsByRequestType.push(groupMoveTabs);
		dynamicAssemblyTabsController.specifiedTabsByRequestType.push(individualMoveTabs);
		dynamicAssemblyTabsController.specifiedTabsByRequestType.push(departmentSpaceTabs);
	}
});