var abHpdWrReqIssueTabsController =  View.createController("abHpdWrReqIssueTabsController",{
	
	 afterInitialDataFetch: function() {
		this.inherit();
 		var tabs = View.panels.get("abHpdWorkReqIssueTabs");
 	 	tabs.addEventListener('afterTabChange',this.onTabsChange);	
 		
  
 		var view = tabs.findTab("issue");
 		view.enable(false);
 		var view = tabs.findTab("schedule");
 		view.enable(false);
	},
 	
 	onTabsChange: function(tabPanel, selectedTabName, newTabName){
		//disable the view tabs.
		var tabs = View.panels.get("abHpdWorkReqIssueTabs");
 	 	
		if(selectedTabName == 'select'){
		 	var view = tabs.findTab("issue");
	 		view.enable(false);
	 		var view = tabs.findTab("schedule");
	 		view.enable(false);
	 	}else if(selectedTabName == 'issue'){
 	 		var view = tabs.findTab("schedule");
	 		view.enable(false);
 		}else if(selectedTabName == 'schedule'){
 			var view = tabs.findTab("issue");
	 		view.enable(false);
		}
	}
});
