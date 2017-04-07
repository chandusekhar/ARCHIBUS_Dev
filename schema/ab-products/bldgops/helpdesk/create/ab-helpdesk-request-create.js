/**
 * @author Guo Jiangtao
 */
var abHpdReqCreateController = View.createController("abHpdReqCreateController", {
	basicRestriction : null,
	
	afterInitialDataFetch : function() {
		ABHDC_getTabsSharedParameters()["fromIncident"] = false;
		ABHDC_getTabsSharedParameters()["calledFrom"] = null;

		/*
		 * EC - add callback method to perform additional work on created service request
		 * (e.g. attach redlined drawing to service request)
		 */
		if(valueExists(View.getOpenerView()) && valueExists(View.getOpenerView().dialogConfig)){
			var callbackMethod = View.getOpenerView().dialogConfig.callback;
			if(valueExists(callbackMethod) && typeof(callbackMethod) == "function"){
				ABHDC_getTabsSharedParameters()["callbackMethod"] = callbackMethod;
			}
			var redlining = View.getOpenerView().dialogConfig.redlining;
			if(valueExists(redlining) && redlining){
				ABHDC_getTabsSharedParameters()["redlining"] = true;
			} else {
				ABHDC_getTabsSharedParameters()["redlining"] = false;
			}
			
			// if called from from Incident, set the fromIncident parameter
			var fromIncident = View.getOpenerView().dialogConfig.fromIncident;
			if(valueExists(fromIncident) && fromIncident){
				ABHDC_getTabsSharedParameters()["fromIncident"] = true;
			}

			if (valueExists(View.getOpenerView().dialogConfig.calledFrom)) {
				ABHDC_getTabsSharedParameters()["calledFrom"] = View.getOpenerView().dialogConfig.calledFrom;
			}
			
			
		} else {	
			ABHDC_getTabsSharedParameters()["callbackMethod"] = null;
		}

		/*
		 * If request created from an Incident, pass the restriction to Basic tab
		 */
		if(ABHDC_getTabsSharedParameters()["fromIncident"] && this.helpDeskRequestTabs.restriction){
			var clause = this.helpDeskRequestTabs.restriction.findClause("activity_log.incident_id");
			if(valueExists(clause)){
				ABHDC_getTabsSharedParameters()["condAssessmentRestrication"] = this.helpDeskRequestTabs.restriction;
			}
		}
		//IOAN: when is called from EAM. Need to review entire view and refactor 
		if (ABHDC_getTabsSharedParameters()["calledFrom"] 
				&& ABHDC_getTabsSharedParameters()["calledFrom"] == 'EAM'
					&& this.helpDeskRequestTabs.restriction) {

			ABHDC_getTabsSharedParameters()["condAssessmentRestrication"] = this.helpDeskRequestTabs.restriction;
		}

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