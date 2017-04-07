// filter settings
var landEstAreaFilter = new Ext.util.MixedCollection();
landEstAreaFilter.addAll(
		{id: 'group_by', custom: true, columnName:null, visible: true, disabled: false, defaultValue: 'ctry', value: null, values: ['ctry', 'regn', 'state', 'city', 'site', 'property'], labelId: 'label_groupby', optionLabel: 'labelGroupBy_'},
		{id: 'ownership', custom: true, columnName:null, visible: true, disabled: false, defaultValue: 'all', value: null, values:['owned', 'leased', 'all'], restriction:{
			'owned': "EXISTS(SELECT 1 FROM ot WHERE ot.pr_id = property.pr_id AND ot.status = 'Owned')",
			'leased': "EXISTS(SELECT 1 FROM ls WHERE ls.use_as_template = 0 AND ls.pr_id = property.pr_id AND ls.signed = 1 AND (ls.date_end >= ${sql.currentDate} OR ls.date_end IS NULL) AND ls.date_start <= ${sql.currentDate})",
			'all':''
		}, labelId: 'label_ownership', optionLabel: 'labelOwnership_'},
		{id: 'time_span', custom: true, columnName:null, visible: true, disabled: false, defaultValue: 'past1', value: null, values:['past5', 'past3', 'past1', 'next1', 'next3', 'next5'], labelId: 'label_timespan', optionLabel: 'labelTimeSpan_'},
		{id: 'bl.ctry_id', custom: false, columnName: 'property.ctry_id',  visible: true, disabled: false, defaultValue: null, value: null, labelId: 'opt_ctry'},
		{id: 'bl.regn_id', custom: false, columnName: 'property.regn_id', visible: true, disabled: false, defaultValue: null, value: null, labelId: 'opt_regn'},
		{id: 'bl.state_id', custom: false, columnName: 'property.state_id', visible: true, disabled: false, defaultValue: null, value: null, labelId: 'opt_state'},
		{id: 'bl.city_id', custom: false, columnName: 'property.city_id', visible: true, disabled: false, defaultValue: null, value: null, labelId: 'opt_city'},
		{id: 'bl.site_id', custom: false, columnName: 'property.site_id', visible: true, disabled: false, defaultValue: null, value: null, labelId: 'opt_site'},
		{id: 'bl.pr_id', custom: false, columnName: 'property.pr_id', visible: true, disabled: false, defaultValue: null, value: null, labelId: 'opt_property'}
	);


/**
 * Controller definition
 */
var abRepmLandEstAreaController = View.createController('abRepmLandEstAreaController', {
	
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
		this.abRepmLandEstAreaChart.controllerId = 'abRepmLandEstAreaController';
		this.abRepmLandEstAreaChart.config.showLegendOnLoad = (!isInDashboard(this.view));
		// hide title when is in dashboard
		if (isInDashboard(this.view)) {
			// we must read some config parameters from dashboard view
			this.dashConfig = getDashboardConfigObject(this, 'abRepmLandEstAreaChart');
			if (valueExists(this.dashConfig)) {
				this.crtGroupBy = this.dashConfig.groupBy;
			}
		}else{
			// groupBy value can come as URL query parameter
			this.crtGroupBy = this.getGroupByParameter();
		}
		// when is called from drilldown in dasboard
		if (valueExists(this.view.parameters) && valueExists(this.view.parameters["crtFilter"]) ) {
			this.crtFilter = this.view.parameters["crtFilter"]
		} else{
			this.crtFilter = landEstAreaFilter.clone();
		}
		
		if(valueExistsNotEmpty(this.crtGroupBy)){
			this.crtFilter.get('group_by').value = this.crtGroupBy;
			if (valueExists(this.view.parameters) && valueExists(this.view.parameters["isDialogWindow"]) && this.view.parameters["isDialogWindow"]
				&& !valueExists(this.view.parameters["groupBy"]) && !valueExists(this.view.parameters["crtFilter"])) {
				// when is called from maximize button update default group by with existing value
				this.crtFilter.get('group_by').defaultValue = this.crtGroupBy;
			}
		} else {
			this.crtGroupBy = this.crtFilter.get('group_by').defaultValue;
		}
		this.objFilters = new Ext.util.MixedCollection();
		this.objFilters.add(this.crtGroupBy, this.crtFilter);
	},
	
	afterInitialDataFetch: function(){
		if(!valueExistsNotEmpty(this.crtFilter.get('group_by').value)){
			this.crtFilter.get('group_by').value = this.crtFilter.get('group_by').defaultValue;
		}
		if(!valueExistsNotEmpty(this.crtFilter.get('ownership').value)){
			this.crtFilter.get('ownership').value = this.crtFilter.get('ownership').defaultValue;
		}
		if(!valueExistsNotEmpty(this.crtFilter.get('time_span').value)){
			this.crtFilter.get('time_span').value = this.crtFilter.get('time_span').defaultValue;
		}
		this.refreshChart();
	},
	
	getGroupByParameter: function(){
		return getGroupByParameter(this);
	},

	/*
	 * Open filter dialog 
	 */
	abRepmLandEstAreaChart_onFilter: function(){
		onOpenFilter(this);
	},
	
	abRepmLandEstAreaChart_onReport: function(){
		var gridPanel = this.abRepmLandEstAreaReport;
		// get group by parameter
		this.crtGroupBy = this.crtFilter.get('group_by').value;
		var groupByField = getGroupByField(this.crtGroupBy, 'property');
		gridPanel.addParameter("groupBy", groupByField);
		// time span
		var timeSpanValue = this.crtFilter.get('time_span').value;
		var timeSpanInterval = getTimeSpanInterval(new Date(), 'year', timeSpanValue, 'month');
		gridPanel.addParameter("dateFrom", timeSpanInterval.dateFrom);
		gridPanel.addParameter("dateTo", timeSpanInterval.dateTo);
		// geography fields
		var restriction = getRestrictionFromObject(this.crtFilter, "string", 'property');
		//ownership
		var ownershipRestr = this.crtFilter.get("ownership").restriction[this.crtFilter.get("ownership").value];
		if (valueExistsNotEmpty(ownershipRestr)) {
			restriction += " AND " + ownershipRestr;
		}
		
		gridPanel.addParameter("filter", restriction);
		gridPanel.refresh();
		
		gridPanel.setFieldTitle("property.group_by", getGroupByFieldTitle(this.crtGroupBy));
		gridPanel.update();
		gridPanel.setTitle(getMessage("titleLandAreaBy").replace("{0}", getMessage("labelGroupBy_" +  this.crtGroupBy)));
		
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
		var chartPanel = this.abRepmLandEstAreaChart;
		// get group by parameter
		this.crtGroupBy = this.crtFilter.get('group_by').value;
		var groupByField = getGroupByField(this.crtGroupBy, 'property');
		chartPanel.addParameter("groupBy", groupByField);
		// time span
		var timeSpanValue = this.crtFilter.get('time_span').value;
		var timeSpanInterval = getTimeSpanInterval(new Date(), 'year', timeSpanValue, 'month');
		chartPanel.addParameter("dateFrom", timeSpanInterval.dateFrom);
		chartPanel.addParameter("dateTo", timeSpanInterval.dateTo);
		// geography fields
		var restriction = getRestrictionFromObject(this.crtFilter, "string", 'property');
		//ownership
		var ownershipRestr = this.crtFilter.get("ownership").restriction[this.crtFilter.get("ownership").value];
		if (valueExistsNotEmpty(ownershipRestr)) {
			restriction += " AND " + ownershipRestr;
		}
		
		chartPanel.addParameter("filter", restriction);
		chartPanel.refresh();
		
		if (isInDashboard(this.view)) {
			chartPanel.setTitle(getMessage("titleLandAreaBy").replace("{0}", getMessage("labelGroupBy_" +  this.crtGroupBy)));
			chartPanel.actions.get('filter').show(false);
			chartPanel.actions.get('report').show(false);
			chartPanel.actions.get('export').show(false);
		} else{
			this.view.setTitle(getMessage("titleLandAreaBy").replace("{0}", getMessage("labelGroupBy_" +  this.crtGroupBy)));
			chartPanel.title = getMessage("titleLandAreaBy").replace("{0}", getMessage("labelGroupBy_" +  this.crtGroupBy));
			chartPanel.setInstructions(getFilterAsText(this.crtFilter));
			chartPanel.actions.get('filter').show(true);
			chartPanel.actions.get('report').show(true);
			chartPanel.actions.get('export').show(true);
		}
		
	},
	
	onDrillDown: function(selectedChartData){
		var currentGroupBy = null;
		var currentFilter = null;
		// when is in dashboard we must read initial group by from dashboard view
		if (isInDashboard(this.view) && valueExists(this.dashConfig)) {
			currentGroupBy = this.dashConfig.groupBy;
			currentFilter = this.objFilters.get(currentGroupBy);
		}else{
			currentGroupBy = this.crtGroupBy;
			currentFilter = this.crtFilter;
		}

		var nextGroupByLevel = getNextGroupByForDrillDown(currentGroupBy, currentFilter.get('group_by').values);
		if (valueExistsNotEmpty(nextGroupByLevel))  {
			var nextFilterObject = currentFilter.clone();
			// reset geographical fields
//			nextFilterObject.each(function(field){
//				if (field.id != 'group_by' && field.id != 'ownership' && field.id != 'time_span'){
//					field.value = null;
//				}
//			});
			nextFilterObject.get('group_by').defaultValue = nextGroupByLevel;
			nextFilterObject.get('group_by').value = nextGroupByLevel;
			// get selected chart data
			var objSelectedChartData = getSelectedChartData(currentGroupBy, 'property', selectedChartData['property.group_by']);
			var drillDownFields = objSelectedChartData['fields'];
			var drillDownValues = objSelectedChartData['values'];
			for (var i = 0; i < drillDownFields.length; i++) {
				var field = drillDownFields[i];
				var drillDownValue = drillDownValues[i];
				nextFilterObject.get(field.replace('property.', 'bl.')).defaultValue = drillDownValue;
				nextFilterObject.get(field.replace('property.', 'bl.')).value = drillDownValue;
			}
			
			if (valueExistsNotEmpty(currentFilter.get('ownership').value)) {
				nextFilterObject.get('ownership').defaultValue = currentFilter.get('ownership').value;
				nextFilterObject.get('ownership').value = currentFilter.get('ownership').value;
			}
			if (valueExistsNotEmpty(currentFilter.get('time_span').value)) {
				nextFilterObject.get('time_span').defaultValue = currentFilter.get('time_span').value;
				nextFilterObject.get('time_span').value = currentFilter.get('time_span').value;
			}

			this.objFilters.add(currentGroupBy, currentFilter);
			
			if (!isInDashboard(this.view)){
				this.crtGroupBy = nextGroupByLevel;
				this.crtFilter = nextFilterObject;
				this.refreshChart();
			}else{
				var opener = (this.view.type == 'dashboard'?this.view:this.view.getOpenerView());
				opener.openDialog('ab-repm-pfadmin-land-est-area-by-chart.axvw', null, false, {
				    closeButton: true,
				    maximize: true,
				    groupBy: nextGroupByLevel,
				    crtFilter: nextFilterObject,
				    isDialogWindow: true
				});
			}
		}else{
			return false;
		}
	}
});


