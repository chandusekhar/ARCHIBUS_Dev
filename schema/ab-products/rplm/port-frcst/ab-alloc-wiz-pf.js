
var allocWizController = View.createController('allocWiz',{
	scn_id:'',
	
	afterViewLoad: function() {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('afm_flds.field_name', 'planning_bu_id');
		var records = this.allocWizDs0.getRecords(restriction);
		if (records.length == 0) View.loadView('ab-alloc-group-pf.axvw');
	},
	
	afterInitialDataFetch: function() {
		this.allocWizTabs.addEventListener('beforeTabChange', this.allocWizTabs_beforeTabChange.createDelegate(this));
		this.allocWizTabs.addEventListener('afterTabChange', this.allocWizTabs_afterTabChange.createDelegate(this));
		
		this.allocWizTabs.enableTab('allocWizEvts', false);
		this.allocWizTabs.enableTab('allocWizStack', false);
		this.allocWizTabs.enableTab('allocWizSpGap', false);
	},
	
	allocWizTabs_beforeTabChange: function(tabPanel, currentTabName, newTabName) {
		if (currentTabName == 'allocWizSpGap') {
			this.setSpGapScenario();
		}
		if (newTabName == 'allocWizSpGap') {
			View.openProgressBar(getMessage('retrievingData'));
		}
		return true;
	},
	
	allocWizTabs_afterTabChange: function(tabPanel, newTabName) {
		if (newTabName == 'allocWizSpGap') {
			View.updateProgressBar(1);
			View.closeProgressBar();
		}
		return true;
	},
	
	setStackChartScenario: function() {
		var tab = this.allocWizTabs.findTab('allocWizStack');
		if (tab.hasView() && tab.isContentLoaded) {
			if (!tab.isContentLoading) {				 
				var iframe = tab.getContentFrame();				
				var childView = iframe.View;
				if (valueExists(childView)) {
					var allocWizStack = childView.controllers.get('allocWizStack');
					allocWizStack.changeScenario();
				}
			}
		}
	},
	
	setSpGapScenario: function() {
		var tab = this.allocWizTabs.findTab('allocWizSpGap');
		if (tab.hasView() && tab.isContentLoaded) {
			if (!tab.isContentLoading) {				 
				var iframe = tab.getContentFrame();				
				var childView = iframe.View;
				if (valueExists(childView)) {
					var allocWizSpGap = childView.controllers.get('allocWizSpGap');
					allocWizSpGap.allocWizSpGap_console.clear();
				}
			}
		}
	}
});

