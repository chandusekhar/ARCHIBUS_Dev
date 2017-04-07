var abFinanalAggregateForecastCostsProjCtrl = View.createController('abFinanalAggregateForecastCostsProjCtrl', {
	assetType: 'proj',
	blId: null,
	prId: null,
	projId: null,
	subLoan: null,
	autoNumber: null,
	
	afterViewLoad: function() {
		this.abFinanalAggregateForecastCostsProj_tabs.enableTab('abFinanalAggregateForecastCosts_aggregateOpExTab', true);
		
		this.abFinanalAgregateForecastCostsProj_grid.addParameter('yes', getMessage('msg_yes'));
		this.abFinanalAgregateForecastCostsProj_grid.addParameter('no', getMessage('msg_no'));
	},
	
	abFinanalAgregateForecastCostsProj_grid_select_onClick: function(row) {
		if (row && row.getFieldValue('project.bl_id')) {
			this.blId = row.getFieldValue('project.bl_id');
		} else {
			this.blId = null;
		}
		
		if (row && row.getFieldValue('project.pr_id')) {
			this.prId = row.getFieldValue('project.pr_id');
		} else {
			this.prId = null;
		}
		
		if (row && row.getFieldValue('project.project_id')) {
			this.projId = row.getFieldValue('project.project_id');
		} else {
			this.projId = null;
		}
		
		if (row && row.getFieldValue('project.vf_subLoan')) {
			this.subLoan = row.getFieldValue('project.vf_subLoan');
		} else {
			this.subLoan = null;
		}
		
		if (row && row.getFieldValue('project.vf_autoNumber')) {
			this.autoNumber = row.getFieldValue('project.vf_autoNumber');
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
		
		var tabRestriction = {'abFinanalAggregateForecastCosts_projTab': null, 
        		'abFinanalAggregateForecastCosts_aggregateOpExTab': null,
        		'abFinanalAggregateForecastCosts_forecastCapitalTab': schedRestriction};
		
		var tabStatus = {'abFinanalAggregateForecastCosts_projTab': true, 
        		'abFinanalAggregateForecastCosts_aggregateOpExTab': true,
        		'abFinanalAggregateForecastCosts_forecastCapitalTab': true};
		
		setSelectParameters(this.abFinanalAggregateForecastCostsProj_tabs.findTab('abFinanalAggregateForecastCosts_forecastCapitalTab'), this);
		this.abFinanalAggregateForecastCostsProj_tabs.selectTab('abFinanalAggregateForecastCosts_forecastCapitalTab', schedRestriction);
		this.enableTabs(tabStatus, tabRestriction);
	},
	
	/**
	 * Enable/disable tabs
	 * @param tabsStatus object with tabs status.
	 */
	enableTabs: function(tabsStatus, tabsRestriction) {
		for(var tab in tabsStatus){
			this.abFinanalAggregateForecastCostsProj_tabs.enableTab(tab, tabsStatus[tab]);
			if (valueExists(tabsRestriction[tab])) {
				this.abFinanalAggregateForecastCostsProj_tabs.setTabRestriction(tab, tabsRestriction[tab]);
			}
			setSelectParameters(this.abFinanalAggregateForecastCostsProj_tabs.findTab(tab), abFinanalAggregateForecastCostsProjCtrl);
		}
	}
});