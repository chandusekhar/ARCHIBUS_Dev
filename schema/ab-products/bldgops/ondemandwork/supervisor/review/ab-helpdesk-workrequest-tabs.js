var reviewTabsController =  View.createController("reviewTabsController",{
	
	 afterInitialDataFetch: function() {
		this.inherit();
 		var tabs = View.panels.get("mainTabs");
 	 	tabs.addEventListener('afterTabChange',this.onTabsChange);	
 		
 		var reviewTab = tabs.findTab("review");
 		reviewTab.enable(false);
 		var estimateTab = tabs.findTab("estimate");
 		estimateTab.enable(false);
 		var scheduleTab = tabs.findTab("schedule");
 		scheduleTab.enable(false);
	},
 	
 	onTabsChange: function(tabPanel, selectedTabName, newTabName){
		//disable the view tabs.
		var tabs = View.panels.get("mainTabs");
 	 	
		if(selectedTabName == 'select'){
		 	var updateWrLabor = tabs.findTab("review");
	 		updateWrLabor.enable(false);
	 		var resources = tabs.findTab("estimate");
	 		resources.enable(false);
	 		var details = tabs.findTab("schedule");
	 		details.enable(false);
	 	}else if(selectedTabName == 'review'){
 			var scheduleTab = tabs.findTab("schedule");
	 		scheduleTab.enable(false);
	 		var estimateTab = tabs.findTab("estimate");
	 		estimateTab.enable(false);
			var selectTab = tabs.findTab("select");
	 		selectTab.enable(true);
 		}else if(selectedTabName == 'estimate'){
 			var reviewTab = tabs.findTab("review");
	 		reviewTab.enable(false);
	 		var scheduleTab = tabs.findTab("schedule");
	 		scheduleTab.enable(false);
			var selectTab = tabs.findTab("select");
	 		selectTab.enable(true);
 		}else if(selectedTabName == 'schedule'){
 			var reviewTab = tabs.findTab("review");
	 		reviewTab.enable(false);
	 		var estimateTab = tabs.findTab("estimate");
	 		estimateTab.enable(false);
			var selectTab = tabs.findTab("select");
	 		selectTab.enable(true);
 		}
	}
});