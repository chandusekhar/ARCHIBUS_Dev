var allocWizScnController = View.createController('allocWizScn',{	
	allocWizScn_grid_onSelectScn:function(obj) {
		var scn_id = obj.restriction['portfolio_scenario.portfolio_scenario_id'];
		var restriction = new Ab.view.Restriction();
		restriction.addClause('gp.portfolio_scenario_id', scn_id);
		
		var allocWiz = View.getOpenerView().controllers.get('allocWiz');
		allocWiz.scn_id = scn_id;
		
		allocWiz.allocWizTabs.enableTab('allocWizEvts', true);
		allocWiz.allocWizTabs.enableTab('allocWizStack', true);
		allocWiz.allocWizTabs.enableTab('allocWizSpGap', true);
		
		allocWiz.setStackChartScenario();

		var nextTab = 'allocWizSpGap';
		var records = this.allocWizCommon_ds0.getRecords(restriction);
		if (records.length < 1) nextTab = 'allocWizStack';
		
		View.getOpenerView().setTitle(getMessage('viewTitle') + ' - ' + scn_id);
		allocWiz.allocWizTabs.setTabRestriction('allocWizEvts', restriction);
		allocWiz.allocWizTabs.setTabRestriction('allocWizSpGap', restriction);
		allocWiz.allocWizTabs.selectTab(nextTab, restriction);
	}
});

