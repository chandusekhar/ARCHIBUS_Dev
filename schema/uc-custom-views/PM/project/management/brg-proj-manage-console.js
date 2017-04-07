var projManageConsoleController = View.createController('projManageConsole', {
	project_id : '',
	projectRestriction : null,
	selectedProjManageTab : '',

	afterViewLoad: function() {
		this.inherit();
		//turn off print icon and mail icon.
		View.setToolbarButtonVisible('printButton', false);
		View.setToolbarButtonVisible('emailButton', false);
	},

	afterInitialDataFetch : function() {
		this.projManageConsoleTabs.addEventListener('beforeTabChange', this.projManageConsoleTabs_beforeTabChange.createDelegate(this));

		this.projManageConsolePlanTabs.addEventListener('beforeTabChange', this.projManageConsolePlanTabs_beforeTabChange.createDelegate(this));
		this.projManageConsoleProcureTabs.addEventListener('beforeTabChange', this.projManageConsoleProcureTabs_beforeTabChange.createDelegate(this));
		this.projManageConsoleCommunicateTabs.addEventListener('beforeTabChange', this.projManageConsoleCommunicateTabs_beforeTabChange.createDelegate(this));
		this.projManageConsoleScheduleTabs.addEventListener('beforeTabChange', this.projManageConsoleScheduleTabs_beforeTabChange.createDelegate(this));
		this.projManageConsoleAdjustTabs.addEventListener('beforeTabChange', this.projManageConsoleAdjustTabs_beforeTabChange.createDelegate(this));
		this.projManageConsoleCostTabs.addEventListener('beforeTabChange', this.projManageConsoleCostTabs_beforeTabChange.createDelegate(this));
		this.projManageConsoleImportExportTabs.addEventListener('beforeTabChange', this.projManageConsoleImportExportTabs_beforeTabChange.createDelegate(this));

		this.projManageConsoleScheduleSummaryTabs.addEventListener('beforeTabChange', this.projManageConsoleScheduleSummaryTabs_beforeTabChange.createDelegate(this));
		this.projManageConsoleCostSummaryTabs.addEventListener('beforeTabChange', this.projManageConsoleCostSummaryTabs_beforeTabChange.createDelegate(this));

		var records = this.projManageConsoleDs0.getRecords();
		if (records.length == 0) {
			this.projManageConsoleTabs.enableTab('projManageConsolePlan', false);
			this.projManageConsoleTabs.enableTab('projManageConsoleProcure', false);
			this.projManageConsoleTabs.enableTab('projManageConsoleCommunicate', false);
			this.projManageConsoleTabs.enableTab('projManageConsoleSchedule', false);
			this.projManageConsoleTabs.enableTab('projManageConsoleAdjust', false);
			this.projManageConsoleTabs.enableTab('projManageConsoleCost', false);
			this.projManageConsoleTabs.enableTab('projManageConsoleImportExport', false);
			return;
		}
		var project_id = this.projManageConsoleDs0.getRecord().getValue('project.project_id');
		this.setProjectId(project_id);
		this.selectedProjManageTab = getMessage('selectedProjManageTab');
	},

	setProjectId : function(projectId) {
		this.project_id = projectId;
		var restriction = new Ab.view.Restriction();
		restriction.addClause('project.project_id', this.project_id);
		this.projectRestriction = restriction;
	},

	/**
	 *   Refreshes newly selected tab panel's selected tab page with project restriction
	 *   with certain exceptions.  Close non-main panels of currently-selected tab page.
	 *
	 * */

	projManageConsoleTabs_beforeTabChange : function(tabPanel, currentTabName, newTabName) {
		/* Close non-main panels of currently-selected tab page */
		var currentTabPanel = View.panels.get(currentTabName + 'Tabs');
		if (currentTabName == 'projManageConsoleSelectProject') {
			// do not close non-main panels of Select Project page
		}
		else if (currentTabPanel.getSelectedTabName() == 'projManageConsoleSchedulePage1') {
			var currentNestedTabPanel = View.panels.get('projManageConsoleScheduleSummaryTabs');
			this.closeNonMainPanels(currentNestedTabPanel, currentNestedTabPanel.getSelectedTabName());
		}
		else if (currentTabPanel.getSelectedTabName() == 'projManageConsoleCostPage1') {
			var currentNestedTabPanel = View.panels.get('projManageConsoleCostSummaryTabs');
			this.closeNonMainPanels(currentNestedTabPanel, currentNestedTabPanel.getSelectedTabName());
		}
		else this.closeNonMainPanels(currentTabPanel, currentTabPanel.getSelectedTabName());

		/* New tab is "Select Project" tab */
		if (newTabName == 'projManageConsoleSelectProject') {
			View.setTitle(getMessage('projManageViewTitle'));
			this.selectedProjManageTab = currentTabName;
			return true;
		}
		View.setTitle(this.project_id);

		/* The following tab pages do not receive the project restriction */
		var selectedTabPanel = View.panels.get(newTabName + 'Tabs');

		if (selectedTabPanel.getSelectedTabName() == 'projManageConsolePlanPage5') {
			this.reloadGantt(selectedTabPanel, selectedTabPanel.getSelectedTabName());
			return true;
		}
		if (selectedTabPanel.getSelectedTabName() == 'projManageConsoleProcurePage2') {
			this.setTabRestrictionAndRefresh(selectedTabPanel, selectedTabPanel.getSelectedTabName(), "");
			return true;
		}
		if (selectedTabPanel.getSelectedTabName() == 'projManageConsoleCommunicatePage5') {
			this.setTabRestrictionAndRefresh(selectedTabPanel, selectedTabPanel.getSelectedTabName(), "EXISTS (SELECT * FROM ls_comm WHERE ls_comm.comm_type = commtype.comm_type AND ls_comm.project_id = \'" + this.project_id + "\')");
			return true;
		}
		if (selectedTabPanel.getSelectedTabName() == 'projManageConsoleSchedulePage3') {
			this.setTabRestrictionAndRefresh(selectedTabPanel, selectedTabPanel.getSelectedTabName(), "EXISTS (SELECT * FROM activity_log WHERE activity_log.activity_type = activitytype.activity_type AND activity_log.project_id = '" + this.project_id + "\')");
			return true;
		}
		if (selectedTabPanel.getSelectedTabName() == 'projManageConsoleCostPage4') {
			this.setTabRestrictionAndRefresh(selectedTabPanel, selectedTabPanel.getSelectedTabName(), "work_pkgs.project_id = '" + this.project_id + "' AND EXISTS (SELECT 1 FROM invoice WHERE invoice.work_pkg_id = work_pkgs.work_pkg_id AND invoice.project_id = \'" + this.project_id + "\')");
			return true;
		}
		if (selectedTabPanel.getSelectedTabName() == 'projManageConsoleCostPage5') {
			this.setTabRestrictionAndRefresh(selectedTabPanel, selectedTabPanel.getSelectedTabName(), "EXISTS (SELECT * FROM invoice WHERE invoice.vn_id = vn.vn_id AND invoice.project_id = \'" + this.project_id + "\')");
			return true;
		}


		/* The following tab pages contain a nested tab panel whose selected tab page receives the project restriction */
		if (selectedTabPanel.getSelectedTabName() == 'projManageConsoleSchedulePage1') {
			var selectedNestedTabPanel = View.panels.get('projManageConsoleScheduleSummaryTabs');
			this.setTabRestrictionAndRefresh(selectedNestedTabPanel, selectedNestedTabPanel.getSelectedTabName(), this.projectRestriction);
			return true;
		}
		if (selectedTabPanel.getSelectedTabName() == 'projManageConsoleCostPage1') {
			var selectedNestedTabPanel = View.panels.get('projManageConsoleCostSummaryTabs');
			this.setTabRestrictionAndRefresh(selectedNestedTabPanel, selectedNestedTabPanel.getSelectedTabName(), this.projectRestriction);
			return true;
		}

		/* All other tab pages receive project restriction */
		this.setTabRestrictionAndRefresh(selectedTabPanel, selectedTabPanel.getSelectedTabName(), this.projectRestriction);
		return true;
	},

	/**
	 *   Refreshes newly selected nested tab page with project restriction
	 *   with certain exceptions.  Close non-main panels when navigating away
	 *   from a page.
	 *
	 * */

	projManageConsolePlanTabs_beforeTabChange: function(tabPanel, currentTabName, newTabName) {
		this.closeNonMainPanels(tabPanel, currentTabName);
		if (newTabName == 'projManageConsolePlanPage5') this.reloadGantt(tabPanel, newTabName);
		else this.setTabRestrictionAndRefresh(tabPanel, newTabName, this.projectRestriction);
		return true;
	},

	projManageConsoleProcureTabs_beforeTabChange: function(tabPanel, currentTabName, newTabName) {
		this.closeNonMainPanels(tabPanel, currentTabName);
		if (newTabName == 'projManageConsoleProcurePage2') {
			this.setTabRestrictionAndRefresh(tabPanel, newTabName, null);
			return true;
		}
		this.setTabRestrictionAndRefresh(tabPanel, newTabName, this.projectRestriction);
		return true;
	},

	projManageConsoleCommunicateTabs_beforeTabChange: function(tabPanel, currentTabName, newTabName) {
		this.closeNonMainPanels(tabPanel, currentTabName);
		if (newTabName == 'projManageConsoleCommunicatePage5') {
			this.setTabRestrictionAndRefresh(tabPanel, newTabName, "EXISTS (SELECT * FROM ls_comm WHERE ls_comm.comm_type = commtype.comm_type AND ls_comm.project_id = \'" + this.project_id + "\')");
			return true;
		}
		this.setTabRestrictionAndRefresh(tabPanel, newTabName, this.projectRestriction);
		return true;
	},

	projManageConsoleScheduleTabs_beforeTabChange: function(tabPanel, currentTabName, newTabName) {
		this.closeNonMainPanels(tabPanel, currentTabName);
		if (newTabName == 'projManageConsoleSchedulePage1') {
			var selectedNestedTabPanel = View.panels.get('projManageConsoleScheduleSummaryTabs');
			this.setTabRestrictionAndRefresh(selectedNestedTabPanel, selectedNestedTabPanel.getSelectedTabName(), this.projectRestriction);
			return true;
		}
		if (newTabName == 'projManageConsoleSchedulePage3') {
			this.setTabRestrictionAndRefresh(tabPanel, newTabName, "EXISTS (SELECT * FROM activity_log WHERE activity_log.activity_type = activitytype.activity_type AND activity_log.project_id = '" + this.project_id + "\')");
			return true;
		}
		this.setTabRestrictionAndRefresh(tabPanel, newTabName, this.projectRestriction);
		return true;
	},

	projManageConsoleAdjustTabs_beforeTabChange: function(tabPanel, currentTabName, newTabName) {
		this.closeNonMainPanels(tabPanel, currentTabName);
		this.setTabRestrictionAndRefresh(tabPanel, newTabName, this.projectRestriction);
		return true;
	},

	projManageConsoleCostTabs_beforeTabChange: function(tabPanel, currentTabName, newTabName) {
		this.closeNonMainPanels(tabPanel, currentTabName);
		if (newTabName == 'projManageConsoleCostPage1') {
			var selectedNestedTabPanel = View.panels.get('projManageConsoleCostSummaryTabs');
			this.setTabRestrictionAndRefresh(selectedNestedTabPanel, selectedNestedTabPanel.getSelectedTabName(), this.projectRestriction);
			return true;
		}
		if (newTabName == 'projManageConsoleCostPage4') {
			this.setTabRestrictionAndRefresh(tabPanel, newTabName, "work_pkgs.project_id = '" + this.project_id + "' AND EXISTS (SELECT * FROM invoice WHERE invoice.work_pkg_id = work_pkgs.work_pkg_id AND invoice.project_id = \'" + this.project_id + "\')");
			return true;
		}
		if (newTabName == 'projManageConsoleCostPage5') {
			this.setTabRestrictionAndRefresh(tabPanel, newTabName, "EXISTS (SELECT * FROM invoice WHERE invoice.vn_id = vn.vn_id AND invoice.project_id = \'" + this.project_id + "\')");
			return true;
		}
		this.setTabRestrictionAndRefresh(tabPanel, newTabName, this.projectRestriction);
		return true;
	},

	projManageConsoleImportExportTabs_beforeTabChange: function(tabPanel, currentTabName, newTabName) {
		this.closeNonMainPanels(tabPanel, currentTabName);
		this.setTabRestrictionAndRefresh(tabPanel, newTabName, this.projectRestriction);
		return true;
	},

	projManageConsoleScheduleSummaryTabs_beforeTabChange: function(tabPanel, currentTabName, newTabName) {
		this.closeNonMainPanels(tabPanel, currentTabName);
		this.setTabRestrictionAndRefresh(tabPanel, newTabName, this.projectRestriction);
		return true;
	},

	projManageConsoleCostSummaryTabs_beforeTabChange: function(tabPanel, currentTabName, newTabName) {
		this.closeNonMainPanels(tabPanel, currentTabName);
		this.setTabRestrictionAndRefresh(tabPanel, newTabName, this.projectRestriction);
		return true;
	},

	setTabRestrictionAndRefresh : function(tabPanel, newTabName, restriction) {
		tabPanel.setTabRestriction(newTabName, restriction);
		tabPanel.refreshTab(newTabName);
	},

	closeNonMainPanels : function(tabPanel, currentTabName) {
		var tab = tabPanel.findTab(currentTabName);
		if (tab.hasView()) {
			 if (!tab.isContentLoading) {
				var iframe = tab.getContentFrame();
				var childView = iframe.View;
				if (valueExists(childView)) {
					// hide all panels except main panel
					childView.panels.each(function(panel) {
					    if (panel.id != childView.mainPanelId)
					    	panel.show(false);
					});
				 }
			 }
		 }
	},

	reloadGantt : function(tabPanel, newTabName) {
		var tab = tabPanel.findTab(newTabName);
		if (tab.hasView() && tab.isContentLoaded) {
			 tab.loadView();
		}
	}
});