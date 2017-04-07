var abFinanalAggregateForecastCostsEqCtrl = View.createController('abFinanalAggregateForecastCostsEqCtrl', {
	assetType: 'eq',
	blId: null,
	prId: null,
	eqId: null,
	subLoan: null,
	autoNumber: null,
	
	afterViewLoad: function() {
		this.abFinanalAggregateForecastCostsEq_tabs.enableTab('abFinanalAggregateForecastCosts_aggregateOpExTab', true);
		
		this.abFinanalAgregateForecastCostsEq_grid.addParameter('yes', getMessage('msg_yes'));
		this.abFinanalAgregateForecastCostsEq_grid.addParameter('no', getMessage('msg_no'));
	},
	
	abFinanalAgregateForecastCostsEq_grid_select_onClick: function(row) {
		if (row && row.getFieldValue('eq.bl_id')) {
			this.blId = row.getFieldValue('eq.bl_id');
		} else {
			this.blId = null;
		}
		
		if (row && row.getFieldValue('eq.pr_id')) {
			this.prId = row.getFieldValue('eq.pr_id');
		} else {
			this.prId = null;
		}
		
		if (row && row.getFieldValue('eq.eq_id')) {
			this.eqId = row.getFieldValue('eq.eq_id');
		} else {
			this.eqId = null;
		}
		
		if (row && row.getFieldValue('eq.vf_subLoan')) {
			this.subLoan = row.getFieldValue('eq.vf_subLoan');
		} else {
			this.subLoan = null;
		}
		
		if (row && row.getFieldValue('eq.vf_autoNumber')) {
			this.autoNumber = row.getFieldValue('eq.vf_autoNumber');
		} else {
			this.autoNumber = null;
		}
		
		if (valueExistsNotEmpty(this.blId)){
			this.onSelectAssetRow(this.blId);
		} else {
			this.onSelectAssetRow(this.prId);
		}
	},
	
	onSelectAssetRow: function(assetId) {
		if (valueExistsNotEmpty(this.blId)){
			var schedRestriction = new Ab.view.Restriction({'cost_tran_sched.bl_id': assetId});
		} else {
			var schedRestriction = new Ab.view.Restriction({'cost_tran_sched.pr_id': assetId});
		}
		
		var tabRestriction = {'abFinanalAggregateForecastCosts_eqTab': null, 
        		'abFinanalAggregateForecastCosts_aggregateOpExTab': null};
		
		var tabStatus = {'abFinanalAggregateForecastCosts_eqTab': true, 
        		'abFinanalAggregateForecastCosts_aggregateOpExTab': true};
		
		setSelectParameters(this.abFinanalAggregateForecastCostsEq_tabs.findTab('abFinanalAggregateForecastCosts_forecastCapitalTab'), this);
		this.abFinanalAggregateForecastCostsEq_tabs.selectTab('abFinanalAggregateForecastCosts_forecastCapitalTab', schedRestriction);
		
		this.enableTabs(tabStatus, tabRestriction);
	},
	
	/**
	 * Enable/disable tabs
	 * @param tabsStatus object with tabs status.
	 */
	enableTabs: function(tabsStatus, tabsRestriction) {
		for(var tab in tabsStatus){
			this.abFinanalAggregateForecastCostsEq_tabs.enableTab(tab, tabsStatus[tab]);
			if (valueExists(tabsRestriction[tab])) {
				this.abFinanalAggregateForecastCostsEq_tabs.setTabRestriction(tab, tabsRestriction[tab]);
			}
			setSelectParameters(this.abFinanalAggregateForecastCostsEq_tabs.findTab(tab), abFinanalAggregateForecastCostsEqCtrl);
		}
	}
});