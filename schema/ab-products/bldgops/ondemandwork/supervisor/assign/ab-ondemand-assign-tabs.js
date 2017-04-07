var abOndemandAssignTabsController =  View.createController("abOndemandAssignTabsController",{
	
	 afterInitialDataFetch: function() {
		this.inherit();
 		var tabs = View.panels.get("tabs");
 	 	tabs.addEventListener('afterTabChange',this.onTabsChange);	
 		
  
 		var view = tabs.findTab("Details");
 		view.enable(false);
 	},
 	
 	onTabsChange: function(tabPanel, selectedTabName, newTabName){
		//disable the view tabs.
		var tabs = View.panels.get("tabs");
 	 	
		if(selectedTabName == 'select'){
		 	var view = tabs.findTab("Details");
	 		view.enable(false);
	 	}
	}
});
