// filter settings
var bldgAreaAvailabilityFilter = new Ext.util.MixedCollection();
bldgAreaAvailabilityFilter.addAll(
		{id: 'group_by', custom: true, columnName:null, visible: false, disabled: false, defaultValue: null, value: null, values: ['ctry', 'regn', 'state', 'city', 'site', 'bl', 'facility_type'], labelId: 'label_groupby', optionLabel: 'labelGroupBy_'},
		{id: 'ownership', custom: true, columnName:null, visible: true, disabled: false, defaultValue: 'all', value: null, values:['owned', 'leased', 'all'], restriction:{
			'owned': "EXISTS(SELECT 1 FROM ot WHERE ot.bl_id = bl.bl_id AND ot.status = 'Owned')",
			'leased': "EXISTS(SELECT 1 FROM ls WHERE ls.use_as_template = 0 AND ls.bl_id = bl.bl_id AND ls.ls_id = bl.ls_id AND ls.signed = 1 AND (ls.date_end >= ${sql.currentDate} OR ls.date_end IS NULL) AND ls.date_start <= ${sql.currentDate})",
			'all':''
		}, labelId: 'label_ownership', optionLabel: 'labelOwnership_'},
		{id: 'time_span', custom: true, columnName:null, visible: true, disabled: false, defaultValue: 'past1', value: null, values:['past5', 'past3', 'past1', 'next1', 'next3', 'next5'], labelId: 'label_timespan', optionLabel: 'labelTimeSpan_'},
		{id: 'bl.ctry_id', custom: false, columnName: 'bl.ctry_id',  visible: true, disabled: false, defaultValue: null, value: null, labelId: 'opt_ctry'},
		{id: 'bl.regn_id', custom: false, columnName: 'bl.regn_id', visible: true, disabled: false, defaultValue: null, value: null, labelId: 'opt_regn'},
		{id: 'bl.state_id', custom: false, columnName: 'bl.state_id', visible: true, disabled: false, defaultValue: null, value: null, labelId: 'opt_state'},
		{id: 'bl.city_id', custom: false, columnName: 'bl.city_id', visible: true, disabled: false, defaultValue: null, value: null, labelId: 'opt_city'},
		{id: 'bl.site_id', custom: false, columnName: 'bl.site_id', visible: true, disabled: false, defaultValue: null, value: null, labelId: 'opt_site'},
		{id: 'bl.pr_id', custom: false, columnName: 'bl.pr_id', visible: true, disabled: false, defaultValue: null, value: null, labelId: 'opt_property'}
	);


/**
 * Controller definition
 */
var abRplmBldgAreaAvailabilityController = View.createController('abRplmBldgAreaAvailabilityController', {
	
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
		this.chartEstAreaByOwnershipStatByLocation.controllerId = 'abRplmBldgAreaAvailabilityController';
		this.chartEstAreaByOwnershipStatByLocation.config.showLegendOnLoad = (!isInDashboard(this.view));
		this.crtFilter = bldgAreaAvailabilityFilter.clone();
		
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
	chartEstAreaByOwnershipStatByLocation_onFilter: function(){
		onOpenFilter(this);
	},
	
	chartEstAreaByOwnershipStatByLocation_onReport: function(){
		var gridPanel = this.reportEstAreaByOwnershipStatByLocation;
		// time span
		var timeSpanValue = this.crtFilter.get('time_span').value;
		var timeSpanInterval = getTimeSpanInterval(new Date(), 'year', timeSpanValue, 'month');
		gridPanel.addParameter("dateFrom", timeSpanInterval.dateFrom);
		gridPanel.addParameter("dateTo", timeSpanInterval.dateTo);
		var restriction = getRestrictionFromObject(this.crtFilter, "string", 'bl');
		//ownership
		var ownershipRestr = this.crtFilter.get("ownership").restriction[this.crtFilter.get("ownership").value];
		if (valueExistsNotEmpty(ownershipRestr)) {
			restriction += " AND " + ownershipRestr;
		}
		
		gridPanel.addParameter("filter", restriction);
		gridPanel.refresh();
		
		gridPanel.update();
		gridPanel.setTitle(getMessage("titleBldgAreaAvailability"));
		
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
		var chartPanel = this.chartEstAreaByOwnershipStatByLocation;

		// time span
		var timeSpanValue = this.crtFilter.get('time_span').value;
		var timeSpanInterval = getTimeSpanInterval(new Date(), 'year', timeSpanValue, 'month');
		chartPanel.addParameter("dateFrom", timeSpanInterval.dateFrom);
		chartPanel.addParameter("dateTo", timeSpanInterval.dateTo);
		// geography fields
		var restriction = getRestrictionFromObject(this.crtFilter, "string", 'bl');
		//ownership
		var ownershipRestr = this.crtFilter.get("ownership").restriction[this.crtFilter.get("ownership").value];
		if (valueExistsNotEmpty(ownershipRestr)) {
			restriction += " AND " + ownershipRestr;
		}
		
		chartPanel.addParameter("filter", restriction);
		chartPanel.refresh();
		
		if (isInDashboard(this.view)) {
			chartPanel.setTitle(getMessage("titleBldgAreaAvailability"));
			chartPanel.actions.get('filter').show(false);
			chartPanel.actions.get('report').show(false);
			chartPanel.actions.get('export').show(false);
		} else{
			this.view.setTitle(getMessage("titleBldgAreaAvailability"));
			chartPanel.title = getMessage("titleBldgAreaAvailability");
			chartPanel.setInstructions(getFilterAsText(this.crtFilter));
			chartPanel.actions.get('filter').show(true);
			chartPanel.actions.get('report').show(true);
			chartPanel.actions.get('export').show(true);
		}
		
	}
});


