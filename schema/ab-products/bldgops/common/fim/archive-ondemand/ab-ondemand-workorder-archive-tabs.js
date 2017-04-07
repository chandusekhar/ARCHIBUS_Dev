var abOndemandWorkOrderArchiveTabsController =  View.createController("abOndemandWorkOrderArchiveTabsController",{
	
	 afterInitialDataFetch: function() {
		this.inherit();
 		var tabs = View.panels.get("abOndemandWoArchiveTabs");
 	 	tabs.addEventListener('afterTabChange',this.onTabsChange);	
 		
  
 		var view = tabs.findTab("wo");
 		view.enable(false);
 		var view = tabs.findTab("wr");
 		view.enable(false);
	},
 	
 	onTabsChange: function(tabPanel, selectedTabName, newTabName){
		//disable the view tabs.
		var tabs = View.panels.get("abOndemandWoArchiveTabs");
 	 	
		if(selectedTabName == 'select'){
		 	var view = tabs.findTab("wo");
	 		view.enable(false);
	 		var view = tabs.findTab("wr");
	 		view.enable(false);
	 	}else if(selectedTabName == 'wo'){
 	 		var view = tabs.findTab("wr");
	 		view.enable(false);
 		}
	}
});
