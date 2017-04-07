var projFcpmCpsController = View.createController('projFcpmCps',{	
	project_id: '',
	project_name: '',
	dialogView: null,
	alertsFilter: null,
	
	afterViewLoad:function() {
		//check if we have project id on request parameters
		if (valueExists(View.restriction) && valueExists(View.restriction.findClause('project.project_id'))) {
			this.project_id = View.restriction.findClause('project.project_id').value;
		}
		
		//onCalcEndDatesForProject('');
	},
	
	afterInitialDataFetch: function() {
		this.projFcpmCpsTabs.enableTab('projFcpmCpsDash', false);
		this.projFcpmCpsTabs.enableTab('projFcpmCpsPkg', false);
		
		this.projFcpmCpsTabs.addEventListener('afterTabChange', this.projFcpmCpsTabs_afterTabChange.createDelegate(this));
		this.projFcpmCpsPkgTabs.addEventListener('afterTabChange', this.projFcpmCpsPkgTabs_afterTabChange.createDelegate(this));
	},
	
	projFcpmCpsTabs_afterTabChange : function(tabPanel, currentTabName) {
		if (this.dialogView && currentTabName == 'projFcpmCpsPkg') {
			this.dialogView.closeThisDialog();
			this.dialogView = null;
			return true;
		}
		var currentTab = tabPanel.findTab(currentTabName);
		if (currentTabName == 'projFcpmCpsGantt' && currentTab.isRefreshed) {
			this.reloadGantt(tabPanel, currentTab);
		}
	},
	
	projFcpmCpsPkgTabs_afterTabChange : function(tabPanel, currentTabName) {
		if (this.dialogView && currentTabName == 'projFcpmCpsPkgAct') {
			this.dialogView.closeThisDialog();
			this.dialogView = null;
			return true;
		}
	},
	
	reloadGantt : function(tabPanel, tab) {
		if (tab.hasView() && tab.isContentLoaded) {
			if (!tab.isContentLoading) {				 
				var iframe = tab.getContentFrame();				
				var childView = iframe.View;
				if (valueExists(childView)) {
					var projGanttChartController = childView.controllers.get('projGanttChart');
					projGanttChartController.projGanttChartConsole_statRefresh();
				}
			}
		}
	},
	
	closeNonMainPanels : function(tabPanel, tab) {
		if (tab.hasView()) {
			 if (!tab.isContentLoading) {				 
				var iframe = tab.getContentFrame();				
				var childView = iframe.View;
				if (valueExists(childView)) {
					childView.panels.each(function(panel) {
						if (panel.id != childView.mainPanelId)
					    	panel.show(false);
					    else panel.show(true);
					}); 
				 }
			 }
		 }
	}
});

