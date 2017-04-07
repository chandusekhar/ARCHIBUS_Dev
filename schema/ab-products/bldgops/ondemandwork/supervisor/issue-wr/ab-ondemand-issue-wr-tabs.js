var abOndemandIssueWrTabsController =  View.createController("abOndemandIssueWrTabsController",{
	
	 afterInitialDataFetch: function() {
		this.inherit();
 		var tabs = View.panels.get("abOndemandIssueWrTabs");
 	 	tabs.addEventListener('afterTabChange',this.onTabsChange);	
 		
  
 		var view = tabs.findTab("issue");
 		view.enable(false);
 	},
 	
 	onTabsChange: function(tabPanel, selectedTabName, newTabName){
		//disable the view tabs.
		var tabs = View.panels.get("abOndemandIssueWrTabs");
 	 	
		if(selectedTabName == 'select'){
		 	var view = tabs.findTab("issue");
	 		view.enable(false);
	 	}
	}
});
