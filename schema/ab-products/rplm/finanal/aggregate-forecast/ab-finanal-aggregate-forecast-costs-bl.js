var abFinanalAggregateForecastCostsBlCtrl = View.createController('abFinanalAggregateForecastCostsBlCtrl',{
	assetType: 'bl',
	blId: null,
	subLoan: null,
	autoNumber: null,
	
	afterViewLoad: function(){
		this.abFinanalAggregateForecastCostsBl_tabs.enableTab('abFinanalAggregateForecastCosts_aggregateOpExTab', true);
		
		this.abFinanalAgregateForecastCostsBl_grid.addParameter('yes', getMessage('msg_yes'));
		this.abFinanalAgregateForecastCostsBl_grid.addParameter('no', getMessage('msg_no'));
	},
	
	abFinanalAgregateForecastCostsBl_grid_select_onClick: function(row) {
		if (row && row.getFieldValue('bl.bl_id')) {
			this.blId = row.getFieldValue('bl.bl_id');
		} else {
			this.blId = null;
		}
		if (row && row.getFieldValue('bl.vf_subLoan')) {
			this.subLoan = row.getFieldValue('bl.vf_subLoan');
		} else {
			this.subLoan = null;
		}
		if (row && row.getFieldValue('bl.vf_autoNumber')) {
			this.autoNumber = row.getFieldValue('bl.vf_autoNumber');
		} else {
			this.autoNumber = null;
		}
		
		this.onSelectAssetRow(this.blId);
	},
	
	onSelectAssetRow: function(blId) {
		var schedRestriction = new Ab.view.Restriction({'cost_tran_sched.bl_id': blId});
		var recurRestriction = new Ab.view.Restriction({'cost_tran_recur.bl_id': blId});
		
		var tabRestriction = {'abFinanalAggregateForecastCosts_blTab': null, 
        		'abFinanalAggregateForecastCosts_aggregateOpExTab': null,
        		'abFinanalAggregateForecastCosts_forecastIncomeExpensesTab': recurRestriction};
		
		var tabStatus = {'abFinanalAggregateForecastCosts_blTab': true, 
        		'abFinanalAggregateForecastCosts_aggregateOpExTab': true,
        		'abFinanalAggregateForecastCosts_forecastIncomeExpensesTab': true};
		
		setSelectParameters(this.abFinanalAggregateForecastCostsBl_tabs.findTab('abFinanalAggregateForecastCosts_forecastCapitalTab'), this);
		this.abFinanalAggregateForecastCostsBl_tabs.selectTab('abFinanalAggregateForecastCosts_forecastCapitalTab', schedRestriction);
		this.enableTabs(tabStatus, tabRestriction);
	},
	
	/**
	 * Enable/disable tabs
	 * @param tabsStatus object with tabs status.
	 */
	enableTabs: function(tabsStatus, tabsRestriction){
		for(var tab in tabsStatus){
			this.abFinanalAggregateForecastCostsBl_tabs.enableTab(tab, tabsStatus[tab]);
			if (valueExists(tabsRestriction[tab])) {
				this.abFinanalAggregateForecastCostsBl_tabs.setTabRestriction(tab, tabsRestriction[tab]);
			}
			setSelectParameters(this.abFinanalAggregateForecastCostsBl_tabs.findTab(tab), abFinanalAggregateForecastCostsBlCtrl);
		}
	}
});