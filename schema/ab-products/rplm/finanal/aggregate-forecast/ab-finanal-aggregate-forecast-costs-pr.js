var abFinanalAggregateForecastCostsPrCtrl = View.createController('abFinanalAggregateForecastCostsPrCtrl', {
	assetType: 'pr',
	prId: null,
	subLoan: null,
	autoNumber: null,
	
	afterViewLoad: function() {
		this.abFinanalAggregateForecastCostsPr_tabs.enableTab('abFinanalAggregateForecastCosts_aggregateOpExTab', true);
		
		this.abFinanalAgregateForecastCostsPr_grid.addParameter('yes', getMessage('msg_yes'));
		this.abFinanalAgregateForecastCostsPr_grid.addParameter('no', getMessage('msg_no'));
	},
	
	abFinanalAgregateForecastCostsPr_grid_select_onClick: function(row) {
		if (row && row.getFieldValue('property.pr_id')) {
			this.prId = row.getFieldValue('property.pr_id');
		} else {
			this.prId = null;
		}
		if (row && row.getFieldValue('property.vf_subLoan')) {
			this.subLoan = row.getFieldValue('property.vf_subLoan');
		} else {
			this.subLoan = null;
		}
		if (row && row.getFieldValue('property.vf_autoNumber')) {
			this.autoNumber = row.getFieldValue('property.vf_autoNumber');
		} else {
			this.autoNumber = null;
		}
		
		this.onSelectAssetRow(this.prId);
	},
	
	onSelectAssetRow: function(prId) {
		var schedRestriction = new Ab.view.Restriction({'cost_tran_sched.pr_id': prId});
		var recurRestriction = new Ab.view.Restriction({'cost_tran_recur.pr_id': prId});
		
		var tabRestriction = {'abFinanalAggregateForecastCosts_prTab': null, 
        		'abFinanalAggregateForecastCosts_aggregateOpExTab': null,
        		'abFinanalAggregateForecastCosts_forecastIncomeExpensesTab': recurRestriction};
		
		var tabStatus = {'abFinanalAggregateForecastCosts_prTab': true, 
        		'abFinanalAggregateForecastCosts_aggregateOpExTab': true,
        		'abFinanalAggregateForecastCosts_forecastIncomeExpensesTab': true};
	
		setSelectParameters(this.abFinanalAggregateForecastCostsPr_tabs.findTab('abFinanalAggregateForecastCosts_forecastCapitalTab'), this);
		this.abFinanalAggregateForecastCostsPr_tabs.selectTab('abFinanalAggregateForecastCosts_forecastCapitalTab', schedRestriction);
		this.enableTabs(tabStatus, tabRestriction);
	},
	
	/**
	 * Enable/disable tabs
	 * @param tabsStatus object with tabs status.
	 */
	enableTabs: function(tabsStatus, tabsRestriction) {
		for(var tab in tabsStatus){
			this.abFinanalAggregateForecastCostsPr_tabs.enableTab(tab, tabsStatus[tab]);
			if (valueExists(tabsRestriction[tab])) {
				this.abFinanalAggregateForecastCostsPr_tabs.setTabRestriction(tab, tabsRestriction[tab]);
			}
			setSelectParameters(this.abFinanalAggregateForecastCostsPr_tabs.findTab(tab), abFinanalAggregateForecastCostsPrCtrl);
		}
	}
});