var abHpdRequestViewController =  View.createController("abHpdRequestViewController",{
	
	 afterInitialDataFetch: function() {
		this.inherit();
 		var tabs = View.panels.get("abHpdRequestViewTabs");
 	 	tabs.addEventListener('afterTabChange',this.onTabsChange);	
 		
 		var viewArchivedTab = tabs.findTab("viewArchived");
 		viewArchivedTab.enable(false);
 		var view = tabs.findTab("view");
 		view.enable(false);
	 		
 		var activityLogId = window.location.parameters["activity_log_id"];
 		var stepCode = window.location.parameters["code"];
 		if(tabs != null){
 			//display the view panel.
 			if(valueExists(activityLogId) && activityLogId > 0){
 			
 				var activity_log_id = window.location.parameters["activity_log_id"];
	 			
				try {
					var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-checkUserForRequest', activity_log_id,'view');
				}catch(e){
					Workflow.handleError(e);
				}
				if(result.code == 'executed'){
					var res = eval('('+result.jsonExpression+')');
					if(res.check){
						var restriction = new Ab.view.Restriction();
						restriction.addClause("activity_log.activity_log_id",res.activity_log_id,"=");
						tabs.selectTab("view",restriction);
					} else if(res.archived){
						var restriction = new Ab.view.Restriction();
						restriction.addClause("hactivity_log.activity_log_id",res.activity_log_id,"=");
						tabs.selectTab("viewArchived",restriction);
					}
				} else {
					Workflow.handleError(result);
				}	
 			}else if(valueExists(stepCode) && stepCode != ''){
 				//display the view panel.
				try {
					var result = Workflow.callMethod('AbBldgOpsHelpDesk-StepService-getStepForCode', stepCode)
				}catch(e){
					Workflow.handleError(e);
				}
				if(result.code == 'executed'){
					res = eval('('+result.jsonExpression+')');
					var restriction = new Ab.view.Restriction();
					restriction.addClause("activity_log.activity_log_id",res.pkey_value,"=");
					tabs.selectTab("view",restriction);
				} else {
					Workflow.handleError(result);
				}
 			}
 		}
 	},
 	
 	onTabsChange: function(tabPanel, selectedTabName, newTabName){
		//disable the view tabs.
		var tabs = View.panels.get("abHpdRequestViewTabs");
 	 	
		if(selectedTabName != 'viewArchived' && selectedTabName != 'view'){
	 		var viewArchivedTab = tabs.findTab("viewArchived");
	 		viewArchivedTab.enable(false);
	 		var view = tabs.findTab("view");
	 		view.enable(false);
 		}else if(selectedTabName == 'view'){
 			var viewArchivedTab = tabs.findTab("viewArchived");
	 		viewArchivedTab.enable(false);
	 		var view = tabs.findTab("view");
	 		view.enable(true);
 		}else if(selectedTabName == 'viewArchived'){
 			var viewArchivedTab = tabs.findTab("viewArchived");
	 		viewArchivedTab.enable(true);
	 		var view = tabs.findTab("view");
	 		view.enable(false);
 		}
	}
});
