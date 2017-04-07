
var allocWiz = View.createController('allocWiz',{
	scn_id:'',
	
	filter: null,
	
	lessFilterOptionHeight: 40,
	moreFilterOptionHeight: 80,

	tabsController: [{'tabName':'allocWizSpGap','controllerName':'allocWizSpGapController'},
	                 {'tabName':'allocWizStack','controllerName':'abAllocWizStackController'},
	                 {'tabName':'allocWizScn', 'controllerName':'allocWizScn'},
	                 {'tabName':'allocWizSb', 'controllerName':'abAllocDefSpReqEditCtrl'},
	                 {'tabName':'allocWizEvts', 'controllerName':'allocWizEvts'}
	                 ],
	
	afterViewLoad: function() {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('afm_flds.field_name', 'planning_bu_id');
		var records = this.allocWizDs0.getRecords(restriction);
		if (records.length == 0) View.loadView('ab-alloc-group.axvw');
	},
	
	afterInitialDataFetch: function() {
		this.allocWizTabs.enableTab('allocWizEvts', false);
		this.allocWizTabs.enableTab('allocWizStack', false);
		this.allocWizTabs.enableTab('allocWizSpGap', false);
		this.allocWizTabs.hideTab('allocWizSb');

		//kb#3049668: hide the button initially
		jQuery("#generatePPT").addClass("x-hide-display");
		this.allocWizTabs.addEventListener('beforeTabChange', this.beforeTabChange);
		this.allocWizTabs.addEventListener('afterTabChange', this.afterTabChange.createDelegate(this));
	},
	
    beforeTabChange: function(tabPanel,currentTabName,selectedTabName){
		//kb#3049668: only show the button for 'Stack Plan' tab
		if ( "allocWizStack"!=selectedTabName ){
			jQuery("#generatePPT").addClass("x-hide-display");
		}
		else {
			jQuery("#generatePPT").removeClass("x-hide-display");
		}
		//Very important!
		return true;
	},
	
	/**
	 * If the newTab is gap analysis, we need to refresh the tab.
	 */
	afterTabChange: function(tabPanel, newTab) {
		if (newTab == 'allocWizSpGap') {
			var tab = this.allocWizTabs.findTab(newTab);
			if(tab.hasView() && tab.isContentLoaded) {
				if(!tab.isContentLoading) {
					var iframe = tab.getContentFrame();
					var childView = iframe.View;
					if (valueExists(childView)) {
						var controller = childView.controllers.get("allocWizSpGapController");
						controller.refreshTab();
					}
				}
			}
		}
	},

	portfolioForcastWizFilterConsole_onGeneratePPT: function() {
		var tab = this.allocWizTabs.findTab("allocWizStack");
		if(tab.hasView() && tab.isContentLoaded) {
			if(!tab.isContentLoading) {
				var iframe = tab.getContentFrame();
				var childView = iframe.View;
				if (valueExists(childView)) {
					var controller = childView.controllers.get("abAllocWizStackController");
					controller.onGeneratePPT();
				}
			}
		}
		else {
			View.alert(getMessage("pptDisabled"));
		}
	},
	
	portfolioForcastWizFilterConsole_onMoreFilterOptions: function(panel, action) {
        this.moreOptionsConsole.toggleCollapsed();

	    var layoutManager = View.getLayoutManager('mainLayout');
		if ( this.moreOptionsConsole.collapsed ){
			this.moreOptionsConsole.show(false);
			action.setTitle( getMessage('moreOptions') );
			layoutManager.setRegionSize('north', this.lessFilterOptionHeight);
		} 
		else {
			this.moreOptionsConsole.show(true);
			action.setTitle( getMessage('lessOptions') );
			layoutManager.setRegionSize('north', this.moreFilterOptionHeight);
		}
	},
	
	portfolioForcastWizFilterConsole_onClearFilterConsole: function() {
		this.portfolioForcastWizFilterConsole.clear();
		this.moreOptionsConsole.clear();

		this.filter = {};
		this.filter['scn_id'] = this.scn_id;
		this.portfolioForcastWizFilterConsole_onFilterWizTabs();
	},
	
	portfolioForcastWizFilterConsole_onFilterWizTabs: function() {
		if(this.filter == null) {
			this.filter = {};
		}
		this.filter['site_id']   = this.portfolioForcastWizFilterConsole.getFieldValue('site_id');
		this.filter['bl_id']     = this.portfolioForcastWizFilterConsole.getFieldValue('gp.bl_id');
		this.filter['from_date'] = this.portfolioForcastWizFilterConsole.getFieldValue('gp.date_start');
		this.filter['end_date']  = this.portfolioForcastWizFilterConsole.getFieldValue('gp.date_end');
		this.filter['scn_id'] = this.scn_id;

		//kb#3050891: Add the ability to filter by organization	
		if (!this.moreOptionsConsole.collapsed){
			this.filter['dv_id']   = this.moreOptionsConsole.getFieldValue('gp.dv_id');
			this.filter['dp_id']   = this.moreOptionsConsole.getFieldValue('gp.dp_id');
			this.filter['planning_bu_id']   = this.moreOptionsConsole.getFieldValue('gp.planning_bu_id');
			this.filter['gp_function']   = this.moreOptionsConsole.getFieldValue('gp.gp_function');
		}

		for(var i = 0; i < this.tabsController.length; i++) {
			this.refreshWizardTab(this.tabsController[i]['tabName'], this.tabsController[i]['controllerName']);
		}
	},
	
	/**
	 * Refresh the tab according to the filter console.
	 * @param filter the json array of key:value parameter
	 */
	refreshWizardTab: function(tabName, controllerName) {
		var filterCopy =  jQuery.extend(true, {}, this.filter);
		var tab = this.allocWizTabs.findTab(tabName);
		if(tab.hasView() && tab.isContentLoaded) {
			if(!tab.isContentLoading) {
				var iframe = tab.getContentFrame();
				var childView = iframe.View;
				if (valueExists(childView)) {
					var controller = childView.controllers.get(controllerName);
					controller.refreshTab(filterCopy);
				}
			}
		}
	},
	
	/**
	 * Change the selected scenario. In order to reduce unnecessary refresh.
	 */
	changeSelectedScenario: function() {
		if(this.filter == null) {
			this.filter = {};
		}
		this.filter['scn_id'] = this.scn_id;
		for(var i = 0; i < this.tabsController.length; i++) {
			this.applyChangedScenario(this.tabsController[i]['tabName'], this.tabsController[i]['controllerName']);
		}
	},
	
	/**
	 * Apply the changed scenario to all tabs.
	 */
	applyChangedScenario: function(tabName,controllerName){
		var filterCopy =  jQuery.extend(true, {}, this.filter);
		var tab = this.allocWizTabs.findTab(tabName);
		if(tab.hasView() && tab.isContentLoaded) {
			if(!tab.isContentLoading) {
				var iframe = tab.getContentFrame();
				var childView = iframe.View;
				if (valueExists(childView)) {
					var controller = childView.controllers.get(controllerName);
					controller.applyChangedScenario(filterCopy);
				}
			}
		}
	}
});

