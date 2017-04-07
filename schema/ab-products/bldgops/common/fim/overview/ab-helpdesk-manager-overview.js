var abHpdMgrOverTabsController =  View.createController("abHpdMgrOverTabsController",{
	
	 afterInitialDataFetch: function() {
		this.inherit();
 		var tabs = View.panels.get("abHpdManagerOverviewTabs");
 	 	tabs.addEventListener('afterTabChange',this.onTabsChange);	
  
 		var view = tabs.findTab("details");
 		view.enable(false);
 		
 		var view = tabs.findTab("detailsAll");
 		view.enable(false);
 		
 		var view = tabs.findTab("wrdetails");
 		view.enable(false);
 	},
 	
 	onTabsChange: function(tabPanel, selectedTabName, newTabName){
		//disable the view tabs.
		var tabs = View.panels.get("abHpdManagerOverviewTabs");
 	 	if(selectedTabName == 'details'){
		 	var view = tabs.findTab("detailsAll");
	 		view.enable(false);
	 		
	 		var view = tabs.findTab("wrdetails");
	 		view.enable(false);
	 	
	 	}else if(selectedTabName == 'detailsAll'){
	 		var view = tabs.findTab("details");
		 	view.enable(false);
		 		
		 	var view = tabs.findTab("wrdetails");
		 	view.enable(false);
	 	}else if(selectedTabName == 'wrdetails'){
	 		var view = tabs.findTab("details");
	 		view.enable(false);
	 		
	 		var view = tabs.findTab("detailsAll");
	 		view.enable(false);
	 	}else{
	 		var view = tabs.findTab("details");
	 		view.enable(false);
	 		
	 		var view = tabs.findTab("detailsAll");
	 		view.enable(false);
	 		
	 		var view = tabs.findTab("wrdetails");
	 		view.enable(false);
	 	}
	}
});