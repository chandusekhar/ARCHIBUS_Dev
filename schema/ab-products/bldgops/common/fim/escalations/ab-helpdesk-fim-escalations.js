var ababHpdFimEscalationsTabsController =  View.createController("ababHpdFimEscalationsTabsController",{
	
	 afterInitialDataFetch: function() {
		this.inherit();
 		var tabs = View.panels.get("abHpdFimEscalationsTabs");
 	 	tabs.addEventListener('afterTabChange',this.onTabsChange);	
  
 		var view = tabs.findTab("details");
 		view.enable(false);
 	},
 	
 	onTabsChange: function(tabPanel, selectedTabName, newTabName){
		//disable the view tabs.
		var tabs = View.panels.get("abHpdFimEscalationsTabs");
 	 	if(selectedTabName != 'details'){
		 	var view = tabs.findTab("details");
	 		view.enable(false);
	 	}
	}
});
