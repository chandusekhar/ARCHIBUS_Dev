var projMngController = View.createController('projMng',{	
	project_id: '',
	project_name: '',
	dialogView: null,
	alertsFilter: null,
	accessLevel: 'executive',
	
	queryParameterNames: ['bl_id', 'pr_id'],
	queryParameters: null,
	isDemoMode: false,
	
	afterViewLoad:function() {
        this.isDemoMode = isInDemoMode();
        this.queryParameters =  readQueryParameters(this.queryParameterNames);

        //check if we have project id on request parameters
		if (valueExists(View.restriction) && valueExists(View.restriction.findClause('project.project_id'))) {
			this.project_id = View.restriction.findClause('project.project_id').value;
		}
		this.projMngTabs.showTab('projMngPkg', false);
	},
	
	afterInitialDataFetch: function() {
		this.accessLevel = 'executive';
		var executeProcess = [{activityId: 'AbProjectManagement', processIds: ['Execute']}];
		this.isValidUserProcess = this.view.isProcessAssignedToUser(executeProcess);
		if (!this.isValidUserProcess) this.accessLevel = 'manager';
		this.projMngTabs.enableTab('projMngDash', false);
		this.projMngTabs.enableTab('projMngInvs', false);
		this.projMngTabs.enableTab('projMngActs', false);
		this.projMngTabs.enableTab('projMngGantt', false);
		
		this.projMngTabs.addEventListener('afterTabChange', this.projMngTabs_afterTabChange.createDelegate(this));
		this.projMngPkgTabs.addEventListener('afterTabChange', this.projMngPkgTabs_afterTabChange.createDelegate(this));
	},
	
	projMngTabs_afterTabChange : function(tabPanel, currentTabName) {
		if (this.dialogView && currentTabName == 'projMngPkg') {
			this.dialogView.closeThisDialog();
			this.dialogView = null;
			return true;
		}
	},
	
	projMngPkgTabs_afterTabChange : function(tabPanel, currentTabName) {
		if (this.dialogView && currentTabName == 'projMngPkgAct') {
			this.dialogView.closeThisDialog();
			this.dialogView = null;
			return true;
		}
	},
	
	setGanttRestrictions : function() {
		var tab = this.projMngTabs.findTab('projMngGantt');
		if (tab.hasView() && tab.isContentLoaded) {
			if (!tab.isContentLoading) {				 
				var iframe = tab.getContentFrame();				
				var childView = iframe.View;
				if (valueExists(childView)) {
					var projGanttChartController = childView.controllers.get('projGanttChart');
					projGanttChartController.projGanttChartConsole_statRefresh(this.project_id);
				}
			}
		}
	}
});

