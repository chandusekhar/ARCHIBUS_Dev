// filter settings
var abLsadminLsExpiringFilter = new Ext.util.MixedCollection();
abLsadminLsExpiringFilter.addAll(
		{id: 'group_by', custom: true, columnName:null, visible: false, disabled: false, defaultValue: null, value: null, values: ['ctry', 'regn', 'state', 'city', 'site', 'bl', 'facility_type'], labelId: 'label_groupby', optionLabel: 'labelGroupBy_'},
		{id: 'ownership', custom: true, columnName:null, visible: true, disabled: false, defaultValue: 'all', value: null, values:['all', 'landlord', 'tenant'],  restriction:{
			'all': "1 = 1",
			'landlord': "ls.landlord_tenant = 'LANDLORD'",
			'tenant':"ls.landlord_tenant = 'TENANT'"
		}, labelId: 'label_landlord_tenant', optionLabel: 'labelOwnership_', filterLabel: 'label_landlord_tenant'},
		{id: 'time_span', custom: true, columnName:null, visible: true, disabled: false, defaultValue: 'all', value: null, values:['past5', 'past3', 'past1', 'next1', 'next3', 'next5', 'all'], labelId: 'label_timespan', optionLabel: 'labelTimeSpan_'},
		{id: 'bl.ctry_id', custom: false, columnName: 'ls.ctry_id',  visible: true, disabled: false, defaultValue: null, value: null, labelId: 'opt_ctry'},
		{id: 'bl.regn_id', custom: false, columnName: 'ls.regn_id', visible: true, disabled: false, defaultValue: null, value: null, labelId: 'opt_regn'},
		{id: 'bl.state_id', custom: false, columnName: 'ls.state_id', visible: true, disabled: false, defaultValue: null, value: null, labelId: 'opt_state'},
		{id: 'bl.city_id', custom: false, columnName: 'ls.city_id', visible: true, disabled: false, defaultValue: null, value: null, labelId: 'opt_city'},
		{id: 'bl.site_id', custom: false, columnName: 'ls.site_id', visible: true, disabled: false, defaultValue: null, value: null, labelId: 'opt_site'},
		{id: 'bl.pr_id', custom: false, columnName: 'ls.pr_id', visible: true, disabled: false, defaultValue: null, value: null, labelId: 'opt_property'}
	);


/**
 * Controller definition
 */
var abLsadminLsExpiringController = View.createController('abLsadminLsExpiringController', {
	
	// filter settings
	objFilters: null,
	
	// current group by level
	crtGroupBy: null,
	
	// current Filter
	crtFilter: null,
	
	// dashboard config object
	dashConfig: null,
	
	afterViewLoad: function(){
		// attach controller id to chart panel
		this.abRepmLsAdminLsExpireChart.controllerId = 'abLsadminLsExpiringController';
		this.abRepmLsAdminLsExpireChart.config.showLegendOnLoad = (!isInDashboard(this.view));
		this.crtFilter = abLsadminLsExpiringFilter.clone();
		
	},
	
	afterInitialDataFetch: function(){
		if(!valueExistsNotEmpty(this.crtFilter.get('ownership').value)){
			this.crtFilter.get('ownership').value = this.crtFilter.get('ownership').defaultValue;
		}
		if(!valueExistsNotEmpty(this.crtFilter.get('time_span').value)){
			this.crtFilter.get('time_span').value = this.crtFilter.get('time_span').defaultValue;
		}
		this.refreshChart();
	},

	/*
	 * Open filter dialog 
	 */
	abRepmLsAdminLsExpireChart_onFilter: function(){
		onOpenFilter(this);
	},
	
	abRepmLsAdminLsExpireChart_onReport: function(){
		var gridPanel = this.abRepmLsAdminLsExpireReport;
		
		var restriction = getRestrictionFromObject(this.crtFilter, "string", 'bl');
		//ownership
		var ownershipRestr = this.crtFilter.get("ownership").restriction[this.crtFilter.get("ownership").value];
		if (valueExistsNotEmpty(ownershipRestr)) {
			restriction += " AND " + ownershipRestr;
		}

		// time span
		var timeSpanValue = this.crtFilter.get('time_span').value;
		if(timeSpanValue == 'all'){
			var timeSpanRestriction = "EXISTS(SELECT ls.ls_id FROM  ";
			timeSpanRestriction += "(SELECT ls.ls_id ${sql.as} ls_id, ls.date_end ${sql.as} date_end, ";
			timeSpanRestriction += "(CASE WHEN ls.bl_id IS NOT NULL THEN bl.ctry_id ELSE property.ctry_id END) ${sql.as} ctry_id, ";
			timeSpanRestriction += "(CASE WHEN ls.bl_id IS NOT NULL THEN bl.regn_id ELSE property.regn_id END) ${sql.as} regn_id, ";
			timeSpanRestriction += "(CASE WHEN ls.bl_id IS NOT NULL THEN bl.state_id ELSE property.state_id END) ${sql.as} state_id, ";
			timeSpanRestriction += "(CASE WHEN ls.bl_id IS NOT NULL THEN bl.city_id ELSE property.city_id END) ${sql.as} city_id, ";
			timeSpanRestriction += "(CASE WHEN ls.bl_id IS NOT NULL THEN bl.site_id ELSE property.site_id END) ${sql.as} site_id,";
			timeSpanRestriction += "(CASE WHEN ls.bl_id IS NOT NULL THEN bl.pr_id ELSE property.pr_id END) ${sql.as} pr_id, ";
			timeSpanRestriction += "ls.bl_id ${sql.as} bl_id, ls.landlord_tenant ${sql.as} landlord_tenant ";
			timeSpanRestriction += "FROM ls ";
			timeSpanRestriction += "LEFT OUTER JOIN property ON ls.pr_id = property.pr_id AND ${sql.getVpaRestrictionForTable('property')} ";
			timeSpanRestriction += "LEFT OUTER JOIN bl ON ls.bl_id = bl.bl_id  AND ${sql.getVpaRestrictionForTable('bl')} ";
			timeSpanRestriction += "WHERE ls.use_as_template = 0 AND ${sql.vpaRestriction}) ${sql.as} ls ";
			timeSpanRestriction += "WHERE ls.date_end = afm_cal_dates.cal_date AND " + restriction + ")";
			
			gridPanel.addParameter("dateFrom", "1970");
			gridPanel.addParameter("dateTo", "2050");
			gridPanel.addParameter("customRestriction", timeSpanRestriction);
		}else{
			var timeSpanInterval = getTimeSpanInterval(new Date(), 'year', timeSpanValue, 'year');
			var addFrom = 0;
			var addTo = 0;
			if (timeSpanValue.indexOf('past') != -1) {
				addFrom = 0;
				addTo = -1;
			}else{
				addFrom = +1;
				addTo = 0;
			}
			gridPanel.addParameter("dateFrom", timeSpanInterval.dateFrom + addFrom);
			gridPanel.addParameter("dateTo", timeSpanInterval.dateTo + addTo);
			gridPanel.addParameter("customRestriction", "1=1");
		}
		
		gridPanel.addParameter("filter", restriction);
		gridPanel.refresh();
		
		gridPanel.update();
		gridPanel.setTitle(getMessage("titleLeaseExpiringPerYear"));
		
		var dialogConfig = {
				width: 600,
				height: 400,
				closeButton: true
			};
		gridPanel.showInWindow(dialogConfig);
	},
	
	/*
	 * Apply filter restriction
	 */
	onApplyFilter: function(tmpFilter) {
		copySettings(tmpFilter, this.crtFilter);
		this.refreshChart();
	},
	
	refreshChart: function() {
		var chartPanel = this.abRepmLsAdminLsExpireChart;

		// geography fields
		var restriction = getRestrictionFromObject(this.crtFilter, "string", 'ls');
		//ownership
		var ownershipRestr = this.crtFilter.get("ownership").restriction[this.crtFilter.get("ownership").value];
		if (valueExistsNotEmpty(ownershipRestr)) {
			restriction += " AND " + ownershipRestr;
		}

		// time span
		var timeSpanValue = this.crtFilter.get('time_span').value;
		if(timeSpanValue == 'all'){
			var timeSpanRestriction = "EXISTS(SELECT ls.ls_id FROM  ";
			timeSpanRestriction += "(SELECT ls.ls_id ${sql.as} ls_id, ls.date_end ${sql.as} date_end, ";
			timeSpanRestriction += "(CASE WHEN ls.bl_id IS NOT NULL THEN bl.ctry_id ELSE property.ctry_id END) ${sql.as} ctry_id, ";
			timeSpanRestriction += "(CASE WHEN ls.bl_id IS NOT NULL THEN bl.regn_id ELSE property.regn_id END) ${sql.as} regn_id, ";
			timeSpanRestriction += "(CASE WHEN ls.bl_id IS NOT NULL THEN bl.state_id ELSE property.state_id END) ${sql.as} state_id, ";
			timeSpanRestriction += "(CASE WHEN ls.bl_id IS NOT NULL THEN bl.city_id ELSE property.city_id END) ${sql.as} city_id, ";
			timeSpanRestriction += "(CASE WHEN ls.bl_id IS NOT NULL THEN bl.site_id ELSE property.site_id END) ${sql.as} site_id,";
			timeSpanRestriction += "(CASE WHEN ls.bl_id IS NOT NULL THEN bl.pr_id ELSE property.pr_id END) ${sql.as} pr_id, ";
			timeSpanRestriction += "ls.bl_id ${sql.as} bl_id, ls.landlord_tenant ${sql.as} landlord_tenant ";
			timeSpanRestriction += "FROM ls ";
			timeSpanRestriction += "LEFT OUTER JOIN property ON ls.pr_id = property.pr_id AND ${sql.getVpaRestrictionForTable('property')} ";
			timeSpanRestriction += "LEFT OUTER JOIN bl ON ls.bl_id = bl.bl_id  AND ${sql.getVpaRestrictionForTable('bl')} ";
			timeSpanRestriction += "WHERE ls.use_as_template = 0 AND ${sql.vpaRestriction}) ${sql.as} ls ";
			timeSpanRestriction += "WHERE ls.date_end = afm_cal_dates.cal_date AND " + restriction + ")";
			
			chartPanel.addParameter("dateFrom", "1970");
			chartPanel.addParameter("dateTo", "2050");
			chartPanel.addParameter("customRestriction", timeSpanRestriction);
		}else{
			var timeSpanInterval = getTimeSpanInterval(new Date(), 'year', timeSpanValue, 'year');
			var addFrom = 0;
			var addTo = 0;
			if (timeSpanValue.indexOf('past') != -1) {
				addFrom = 0;
				addTo = -1;
			}else{
				addFrom = +1;
				addTo = 0;
			}
			chartPanel.addParameter("dateFrom", timeSpanInterval.dateFrom + addFrom);
			chartPanel.addParameter("dateTo", timeSpanInterval.dateTo + addTo);
			chartPanel.addParameter("customRestriction", "1=1");
		}
		
		chartPanel.addParameter("filter", restriction);
		chartPanel.refresh();
		this.abRepmLsAdminLsExpireLeases.addParameter("filter", restriction);
		
		if (isInDashboard(this.view)) {
			chartPanel.setTitle(getMessage("titleLeaseExpiringPerYear"));
			chartPanel.actions.get('filter').show(false);
			chartPanel.actions.get('report').show(false);
			chartPanel.actions.get('export').show(false);
		} else{
			this.view.setTitle(getMessage("titleLeaseExpiringPerYear"));
			chartPanel.title = getMessage("titleLeaseExpiringPerYear");
			chartPanel.setInstructions(getFilterAsText(this.crtFilter));
			chartPanel.actions.get('filter').show(true);
			chartPanel.actions.get('report').show(true);
			chartPanel.actions.get('export').show(true);
		}
		
	},
	
	onDrillDown: function(selectedChartData){
		var year = selectedChartData['afm_cal_dates.year'];
		this.abRepmLsAdminLsExpireLeases.addParameter('year', year);
		this.abRepmLsAdminLsExpireLeases.refresh();
		
		var dialogConfig = {
				width: 800,
				height: 600,
				closeButton: true
			};
		this.abRepmLsAdminLsExpireLeases.showInWindow(dialogConfig);
		
	}
});


