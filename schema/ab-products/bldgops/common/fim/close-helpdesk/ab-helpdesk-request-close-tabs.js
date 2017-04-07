var abOndemandWorkOrderArchiveTabsController =  View.createController("abOndemandWorkOrderArchiveTabsController",{
	
	 afterInitialDataFetch: function() {
		this.inherit();
 		var tabs = View.panels.get("abHpdReqCloseTabs");
 	 	tabs.addEventListener('afterTabChange',this.onTabsChange);	
  
 		var view = tabs.findTab("details");
 		view.enable(false);
 	},
 	
 	onTabsChange: function(tabPanel, selectedTabName, newTabName){
		//disable the view tabs.
		var tabs = View.panels.get("abHpdReqCloseTabs");
 	 	if(selectedTabName != 'details'){
		 	var view = tabs.findTab("details");
	 		view.enable(false);
	 	}
	}
});
