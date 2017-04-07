var abOdCfUpdWrTabsController =  View.createController("abOdCfUpdWrTabsController",{
	
	 afterInitialDataFetch: function() {
		this.inherit();
 		var tabs = View.panels.get("abOdmdCfUpdWrTabs");
 	 	tabs.addEventListener('afterTabChange',this.onTabsChange);	
 		
 		var viewArchivedTab = tabs.findTab("updateWrLabor");
 		viewArchivedTab.enable(false);
 		var view = tabs.findTab("resources");
 		view.enable(false);
 		var view = tabs.findTab("details");
 		view.enable(false);
	},
 	
 	onTabsChange: function(tabPanel, selectedTabName, newTabName){
		//disable the view tabs.
		var tabs = View.panels.get("abOdmdCfUpdWrTabs");
 	 	
		if(selectedTabName == 'select'){
		 	var updateWrLabor = tabs.findTab("updateWrLabor");
	 		updateWrLabor.enable(false);
	 		var resources = tabs.findTab("resources");
	 		resources.enable(false);
	 		var details = tabs.findTab("details");
	 		details.enable(false);
	 	}else if(selectedTabName == 'updateWrLabor'){
 			var resources = tabs.findTab("resources");
	 		resources.enable(false);
	 		var details = tabs.findTab("details");
	 		details.enable(false);
 		}else if(selectedTabName == 'resources'){
 			var updateWrLabor = tabs.findTab("updateWrLabor");
	 		updateWrLabor.enable(false);
	 		var details = tabs.findTab("details");
	 		details.enable(false);
 		}else if(selectedTabName == 'details'){
 			var updateWrLabor = tabs.findTab("updateWrLabor");
	 		updateWrLabor.enable(false);
	 		var resources = tabs.findTab("resources");
	 		resources.enable(false);
 		}
	}
});
