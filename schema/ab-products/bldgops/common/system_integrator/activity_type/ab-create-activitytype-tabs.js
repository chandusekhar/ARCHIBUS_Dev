var typeTabsController =  View.createController("typeTabsController",{
	
	 afterInitialDataFetch: function() {
 		var tabs = View.panels.get("typeTabs");
 	 	tabs.addEventListener('afterTabChange',this.onTabsChange);	
 		
 		var editTab = tabs.findTab("edit");
 		editTab.enable(false);
		var questTab = tabs.findTab("quest");
 		questTab.enable(false);
	},
 	
 	onTabsChange: function(tabPanel, selectedTabName, newTabName){
		//disable the view tabs.
		var tabs = View.panels.get("typeTabs");
 	 	
		if(selectedTabName == 'select'){
		 	var editTab = tabs.findTab("edit");
 			editTab.enable(false);
			var questTab = tabs.findTab("quest");
 			questTab.enable(false);
	 	}else if(selectedTabName == 'edit'){
			var questTab = tabs.findTab("quest");
 			questTab.enable(false);
			var selectTab = tabs.findTab("select");
	 		selectTab.enable(true);
 		}else if(selectedTabName == 'quest'){
			var editTab = tabs.findTab("edit");
 			editTab.enable(false);
			var selectTab = tabs.findTab("select");
	 		selectTab.enable(true);
 		}
	}
});