/*
 * chart sepecific objects with settinsg for 
 * drill down levels
 */
var dataAxisObj = new Ext.util.MixedCollection();
dataAxisObj.addAll(
	{ id: 'ctry', dataAxis: [{dataSourceId: 'bldgEstAreaByCountry_DataAxis_ds'}]},
	{ id: 'regn', dataAxis: [{dataSourceId: 'bldgEstAreaByRegion_DataAxis_ds'}]},
	{ id: 'state', dataAxis: [{dataSourceId: 'bldgEstAreaByState_DataAxis_ds'}]},
	{ id: 'city', dataAxis: [{dataSourceId: 'bldgEstAreaByCity_DataAxis_ds'}]},
	{ id: 'site', dataAxis: [{dataSourceId: 'bldgEstAreaBySite_DataAxis_ds'}]},
	{ id: 'bl', dataAxis: [{dataSourceId: 'bldgEstAreaByBuilding_DataAxis_ds'}]}
);

var secondaryGroupingAxisObj = new Ext.util.MixedCollection();
secondaryGroupingAxisObj.addAll(
	{ id: 'ctry', secondaryGroupingAxis: [{field: 'ctry_id', id: 'bl.ctry_id', table: 'bl'}]},
	{ id: 'regn', secondaryGroupingAxis: [{field: 'regn_id', id: 'bl.regn_id', table: 'bl'}]},
	{ id: 'state', secondaryGroupingAxis: [{field: 'state_id', id: 'bl.state_id', table: 'bl'}]},
	{ id: 'city', secondaryGroupingAxis: [{field: 'city_id', id: 'bl.city_id', table: 'bl'}]},
	{ id: 'site', secondaryGroupingAxis: [{field: 'site_id', id: 'bl.site_id', table: 'bl'}]},
	{ id: 'bl', secondaryGroupingAxis: [{field: 'bl_id', id: 'bl.bl_id', table: 'bl'}]}
);

var dataSourcesObj = new Ext.util.MixedCollection();
dataSourcesObj.addAll(
	{ id: 'ctry', dataSourceId: 'bldgEstAreaByCountry_DataAxis_ds'},
	{ id: 'regn', dataSourceId: 'bldgEstAreaByRegion_DataAxis_ds'},
	{ id: 'state',  dataSourceId: 'bldgEstAreaByState_DataAxis_ds'},
	{ id: 'city',  dataSourceId: 'bldgEstAreaByCity_DataAxis_ds'},
	{ id: 'site',  dataSourceId: 'bldgEstAreaBySite_DataAxis_ds'},
	{ id: 'bl',  dataSourceId: 'bldgEstAreaByBuilding_DataAxis_ds'}
);


// overwrite chart control getParameters function
Ab.chart.ChartControl.prototype.getParameters = function(restriction){
	var chartLevel = View.controllers.get('ctrlBldgEstArea').chartLevel;
	var viewName = this.configObj.getConfigParameter('viewDef');
	
	// set chart dataSourceId based on chart level
	var custDataSourceId = dataSourcesObj.get(chartLevel).dataSourceId;
	
	if(valueExists(custDataSourceId)){
		this.configObj.dataSourceId = custDataSourceId;
		this.dataSourceId = custDataSourceId;
		var custDataSourceObj = View.dataSources.get(custDataSourceId);
		this.configObj.fieldDefs =  custDataSourceObj.fieldDefs.items;
		this.fieldDefs =  custDataSourceObj.fieldDefs.items;
	}
	
	var groupingAxis = this.configObj.getConfigParameter('groupingAxis');
    if (valueExists(groupingAxis) && groupingAxis.length > 0) {
    	this.groupingAxis = new Array();
    	// construct the grouping axis with the first of the groupingAxis JSON array
    	// since we only one and only one grouping axis
        this.groupingAxis[0] = new Ab.chart.ChartAxis(this.dataSourceId, groupingAxis[0]);
    }
	
	var dataAxis = this.configObj.getConfigParameter('dataAxis');
	// set custom property for dataAxis
	var custDataAxis = dataAxisObj.get(chartLevel).dataAxis;
	for(var i = 0; i< dataAxis.length; i++){
		for(prop in custDataAxis[i]){
			dataAxis[i][prop] =  custDataAxis[i][prop];
		}
	}
	// update chart dataAxis
	this.dataAxis = new Ext.util.MixedCollection();
    if (valueExists(dataAxis) && dataAxis.length > 0) {
   		for (var i = 0; i < dataAxis.length; i++) {
   			var _dataAxis = new Ab.chart.ChartAxis(this.dataSourceId, dataAxis[i]);
            this.dataAxis.add(_dataAxis.id, _dataAxis);
	    }
    }
	
	var  parameters = {
	           version: '2',
	           viewName: viewName,
	           groupingAxis: toJSON(groupingAxis),
	           dataAxis: toJSON(dataAxis),
	           type: 'chart'
	 };
	 
	 var secondaryGroupingAxis = this.configObj.getConfigParameter('secondaryGroupingAxis');
	 var custSecondaryGroupingAxis = secondaryGroupingAxisObj.get(chartLevel).secondaryGroupingAxis;
	 if (valueExists(secondaryGroupingAxis)) {
	 	// set custom property for secondaryGroupingAxis
		for(var i = 0; i< secondaryGroupingAxis.length; i++){
			for(prop in custSecondaryGroupingAxis[i]){
				secondaryGroupingAxis[i][prop] =  custSecondaryGroupingAxis[i][prop];
			}
		}
         parameters.secondaryGroupingAxis = toJSON(secondaryGroupingAxis);
		 this.secondaryGroupingAxis = new Ab.chart.ChartAxis(this.dataSourceId, secondaryGroupingAxis[0]);
     }
     
     if (valueExists(restriction)) {
         parameters.restriction = toJSON(restriction);
     }
	 
	 Ext.apply(parameters, this.parameters);
	 
     // we must load the new data into flash control
	// this.loadChartSWFIntoFlash();
	 
	 return parameters;
}

var bldgEstAreaController = View.createController('ctrlBldgEstArea', {
	// crt chart level
	chartLevel: null,
	
	// crt filter group by value
	filterChartLevel: null,

	// filter restriction
	restriction: null,
	
	// filter default values for custom fields
	defaultFilter: {
		filter: true,
		fields: [
			{id: 'ownership', type: 'radio', value: 'all'},
			{id: 'time_span', type: 'radio', value: 'past_1'},
			{id: 'group_by', type: 'radio', value: 'ctry'}
		]
	},
	
	// used to store drill down restrictions for each level
	drillDownRestriction: ['', '', '', '', '', ''],
	
	// used to store drill down links for each level
	drillDownLinks: ['', '', '', '', '', ''],

	// array with drill down level - in the correct order
	drillDownTree: ['ctry', 'regn', 'state', 'city', 'site', 'bl'],
	
	afterViewLoad: function(){
		this.setLabels();
		this.setFilter(this.defaultFilter);
	},
	
	afterInitialDataFetch: function(){
		this.setChartLevel();
		this.refreshChart();
	},
	
	// clear console panel
	console_panel_onClear: function(filterConf){
		this.console_panel.clear();
		if (filterConf.filter) {
			this.setFilter(filterConf);
		}
		else {
			this.setFilter(this.defaultFilter);
		}
	},
	
	//get default chart level
	setChartLevel: function(){
		var objGroupBy = document.getElementsByName('radiogroup_by');
		if(objGroupBy){
			var crtLevel = "";
			for( var i = 0; i < objGroupBy.length; i++ ){
				var optGroupBy = objGroupBy[i];
				if(optGroupBy.checked){
					crtLevel = optGroupBy.value;
					break;
				}
			}
			if(crtLevel != this.filterChartLevel){
				// reset drill down information
				for(var i=0; i< this.drillDownTree.length; i++){
					this.drillDownRestriction[i] = '';
					this.drillDownLinks[i] = '';
				}
				this.chartLevel = crtLevel;
				this.filterChartLevel = crtLevel;
			}
		}
	},
	
	// on filter 
	console_panel_onFilter: function(){
		this.setChartLevel();
		this.refreshChart();
	},
	
	// refresh chart 
	refreshChart: function(){
		var panelChart = this.chartBldgEstArea;
		var restriction = this.getConsoleRestriction();
		restriction += this.getDrillDownRestriction();		
		// time_span restriction
		var startDate = "";
		var endDate = "";
		// time_span
		var objTimeSpan = document.getElementsByName('radiotime_span');
		if(objTimeSpan){
			var value = "";
			for( var i = 0; i < objTimeSpan.length; i++ ){
				var optTimeSpan = objTimeSpan[i];
				if(optTimeSpan.checked){
					value = optTimeSpan.value;
					break;
				}
			}
			var addValue = -1;
			switch (value){
				case 'past_5': { addValue = -5; break; }
				case 'past_3':{ addValue = -3; break; }
				case 'past_1':{ addValue = -1; break; }
				case 'next_1':{ addValue = 1; break; }
				case 'next_3':{ addValue = 3; break; }
				case 'next_5':{ addValue = 5; break; }
				default: addValue = -1;
			}
			
			var refDate = new Date();
			var startDate = "";
			var endDate = "";
			if(addValue > 0){
				startDate = getCustomDate(refDate, 'year',0,'month');
				endDate = getCustomDate(refDate, 'year', parseInt(addValue), 'month');	
			}else{
				startDate = getCustomDate(refDate, 'year',parseInt(addValue),'month');
				endDate = getCustomDate(refDate, 'year', 0, 'month');	
			}
		}
		
		panelChart.addParameter('startDate',startDate);
		panelChart.addParameter('endDate',endDate);
		panelChart.addParameter('consoleRestriction',restriction);
		//panelChart.loadChartSWFIntoFlash();
		// refresh chart
		panelChart.refresh();
		//update panel title
		panelChart.setTitle(getMessage('title_by')+ ' '+ getMessage('level_'+ this.chartLevel));
		// update chart instructions - add drill down links 
		panelChart.setInstructions(this.drillDownLinks.join(" ")+(valueExistsNotEmpty(this.drillDownLinks.join(" ")) ? '<span style="margin-left: 25px;">' + getMessage('msg_instruction_text')+'</span>':""));
	},
	
	/**
	 * set filter labels for custom fields
	 */
	setLabels: function(){
		$('title_ownership_owned').innerHTML = getMessage('msg_title_ownership_owned');
		$('title_ownership_leased').innerHTML = getMessage('msg_title_ownership_leased');
		$('title_ownership_all').innerHTML = getMessage('msg_title_ownership_all');
	
		$('title_time_span_past_5').innerHTML = getMessage('msg_title_time_span_past_5');
		$('title_time_span_past_3').innerHTML = getMessage('msg_title_time_span_past_3');
		$('title_time_span_past_1').innerHTML = getMessage('msg_title_time_span_past_1');
		$('title_time_span_next_1').innerHTML = getMessage('msg_title_time_span_next_1');
		$('title_time_span_next_3').innerHTML = getMessage('msg_title_time_span_next_3');
		$('title_time_span_next_5').innerHTML = getMessage('msg_title_time_span_next_5');

		$('title_group_by_ctry').innerHTML = getMessage('level_ctry');
		$('title_group_by_regn').innerHTML = getMessage('level_regn');
		$('title_group_by_state').innerHTML = getMessage('level_state');
		$('title_group_by_city').innerHTML = getMessage('level_city');
		$('title_group_by_site').innerHTML = getMessage('level_site');
		$('title_group_by_bl').innerHTML = getMessage('level_bl');

	},
	
	/**
	 * set filter values
	 * @param {Object} filter
	 */
	setFilter: function(filter){
		for(var i = 0; i < filter.fields.length; i++){
			var field = filter.fields[i];
			var id = field.id;
			var type = field.type;
			var value  = field.value;
			switch (type){
				case 'radio':{
					var objRadio = document.getElementsByName('radio'+id);
					if(objRadio){
						for(var j = 0; j < objRadio.length; j++){
							var optRadio = objRadio[j];
							optRadio.checked = (optRadio.value == value);
						}
					}
					break;
				}
				default:
					break;
			}
		}
	},
	
	// read filter restriction and return the coresponding sql string
	getConsoleRestriction: function(){
		var sql = [];
		var console = this.console_panel;
		// ctry_id
		if(console.hasFieldMultipleValues('bl.ctry_id')){
			var values = console.getFieldMultipleValues('bl.ctry_id');
			sql[sql.length] = " AND bl.ctry_id IN ('" + values.join("','") + "') ";
		}else if (valueExistsNotEmpty(console.getFieldValue('bl.ctry_id'))){
			sql[sql.length] = " AND bl.ctry_id = '" + console.getFieldValue('bl.ctry_id') + "' ";
		}
		// regn_id
		if(console.hasFieldMultipleValues('bl.regn_id')){
			var values = console.getFieldMultipleValues('bl.regn_id');
			sql[sql.length] = " AND bl.regn_id IN ('" + values.join("','") + "') ";
		}else if (valueExistsNotEmpty(console.getFieldValue('bl.regn_id'))){
			sql[sql.length] = " AND bl.regn_id = '" + console.getFieldValue('bl.regn_id') + "' ";
		}
		// state_id
		if(console.hasFieldMultipleValues('bl.state_id')){
			var values = console.getFieldMultipleValues('bl.state_id');
			sql[sql.length] = " AND bl.state_id IN ('" + values.join("','") + "') ";
		}else if (valueExistsNotEmpty(console.getFieldValue('bl.state_id'))){
			sql[sql.length] = " AND bl.state_id = '" + console.getFieldValue('bl.state_id') + "' ";
		}
		// city_id
		if(console.hasFieldMultipleValues('bl.city_id')){
			var values = console.getFieldMultipleValues('bl.city_id');
			sql[sql.length] = " AND bl.city_id IN ('" + values.join("','") + "') ";
		}else if (valueExistsNotEmpty(console.getFieldValue('bl.city_id'))){
			sql[sql.length] = " AND bl.city_id = '" + console.getFieldValue('bl.city_id') + "' ";
		}
		// site_id
		if(console.hasFieldMultipleValues('bl.site_id')){
			var values = console.getFieldMultipleValues('bl.site_id');
			sql[sql.length] = " AND bl.site_id IN ('" + values.join("','") + "') ";
		}else if (valueExistsNotEmpty(console.getFieldValue('bl.site_id'))){
			sql[sql.length] = " AND bl.site_id = '" + console.getFieldValue('bl.site_id') + "' ";
		}
		// pr_id
		if(console.hasFieldMultipleValues('bl.pr_id')){
			var values = console.getFieldMultipleValues('bl.pr_id');
			sql[sql.length] = " AND bl.pr_id IN ('" + values.join("','") + "') ";
		}else if (valueExistsNotEmpty(console.getFieldValue('bl.pr_id'))){
			sql[sql.length] = " AND bl.pr_id = '" + console.getFieldValue('bl.pr_id') + "' ";
		}
		
		// ownership
		var objOwnership = document.getElementsByName('radioownership');
		if(objOwnership){
			var value = "";
			for( var i = 0; i < objOwnership.length; i++ ){
				var optOwnerhip = objOwnership[i];
				if(optOwnerhip.checked){
					value = optOwnerhip.value;
					break;
				}
			}
			switch(value){
				case 'owned':
					sql[sql.length] = " AND EXISTS(SELECT 1 FROM ot WHERE ot.bl_id = bl.bl_id AND ot.status = 'Owned') ";
					break;
				case 'leased':
					sql[sql.length] = " AND EXISTS(SELECT 1 FROM ls WHERE ls.bl_id = bl.bl_id AND ls.ls_id = su.ls_id AND ls.signed = 1 AND (ls.date_end >= ${sql.currentDate} OR ls.date_end IS NULL) AND ls.date_start <= ${sql.currentDate})";
					break;
				default:
					break;
			}
		}
		
		return sql.join("");
	},
	
	// get restriction from drill down part
	getDrillDownRestriction: function(){
		var restriction = [];
		
		for(var i=0; i < this.drillDownTree.length; i++){
			var crtLevel = this.drillDownTree[i];
			var crtRestriction = this.drillDownRestriction[i];
			if (crtLevel == this.level) {
				break;
			}
			else if(valueExistsNotEmpty(crtRestriction)){
				for (prop in crtRestriction) {
					restriction[restriction.length] = "AND " + prop + " = '" + crtRestriction[prop] + "'";
				}
			}
		}
		return restriction.join("");
	} 
	
	
})


/**
 * click on drill down links from intructions
 * @param {Object} level
 */
function onClickLink(level){
	var controller = View.controllers.get('ctrlBldgEstArea');
	// we need to remove some drill down information
	var index = controller.drillDownTree.indexOf(level);
	for(var i=index; i< controller.drillDownTree.length; i++){
		controller.drillDownRestriction[i] = '';
		controller.drillDownLinks[i] = '';
	}
	
	controller.chartLevel = level;
	var filterConf = copyObject(controller.defaultFilter);
	for (var i = 0; i < filterConf.fields.length; i++) {
		if(filterConf.fields[i].id == 'group_by'){
			filterConf.fields[i].value = level;
		}
	}
	controller.console_panel_onClear(filterConf);
	controller.refreshChart();
	controller.chartBldgEstArea.instructionsCollapsed = true;
}


/**
 * drill down click event
 * @param {Object} context
 */
function onDrillDown(context){
	var controller = View.controllers.get('ctrlBldgEstArea');
	var selectedChartData = context.selectedChartData;
	switch(controller.chartLevel){
		case 'ctry':
			controller.drillDownRestriction[controller.drillDownTree.indexOf(controller.chartLevel)] = {'bl.ctry_id':selectedChartData['bl.ctry_id']};
			controller.drillDownLinks[controller.drillDownTree.indexOf(controller.chartLevel)] = '<a href="javascript:void(0);" onclick="onClickLink(\'ctry\');">[ <font color="green">'+getMessage('level_ctry')+'</font>: <b>'+ selectedChartData['bl.ctry_id'] +'</b> ]</a>';
			break;
		case 'regn':
			controller.drillDownRestriction[controller.drillDownTree.indexOf(controller.chartLevel)] = {'bl.regn_id':selectedChartData['bl.regn_id']};
			controller.drillDownLinks[controller.drillDownTree.indexOf(controller.chartLevel)] = '<a href="javascript:void(0);" onclick="onClickLink(\'regn\');">[ <font color="green">'+getMessage('level_regn')+'</font>: <b>'+ selectedChartData['bl.regn_id'] +'</b> ]</a>';
			break;
		case 'state':
			controller.drillDownRestriction[controller.drillDownTree.indexOf(controller.chartLevel)] = {'bl.state_id':selectedChartData['bl.state_id']};
			controller.drillDownLinks[controller.drillDownTree.indexOf(controller.chartLevel)] = '<a href="javascript:void(0);" onclick="onClickLink(\'state\');">[ <font color="green">'+getMessage('level_state')+'</font>: <b>'+ selectedChartData['bl.state_id'] +'</b> ]</a>';
			break;
		case 'city':
			controller.drillDownRestriction[controller.drillDownTree.indexOf(controller.chartLevel)] = {'bl.city_id':selectedChartData['bl.city_id']};
			controller.drillDownLinks[controller.drillDownTree.indexOf(controller.chartLevel)] = '<a href="javascript:void(0);" onclick="onClickLink(\'city\');">[ <font color="green">'+getMessage('level_city')+'</font>: <b>'+ selectedChartData['bl.city_id'] +'</b> ]</a>';
			break;
		case 'site':
			controller.drillDownRestriction[controller.drillDownTree.indexOf(controller.chartLevel)] = {'bl.site_id':selectedChartData['bl.site_id']};
			controller.drillDownLinks[controller.drillDownTree.indexOf(controller.chartLevel)] = '<a href="javascript:void(0);" onclick="onClickLink(\'site\');">[ <font color="green">'+getMessage('level_site')+'</font>: <b>'+ selectedChartData['bl.site_id'] +'</b> ]</a>';
			break;
		case 'bl':
			return;
		default:
			break;
	}
	// set the new chart level
	controller.chartLevel = controller.drillDownTree[controller.drillDownTree.indexOf(controller.chartLevel)+1];
	controller.refreshChart();
}

/**
 * Return a date in specified format. Result is calculated adding 
 * specified interval value to reference date.
 * 
 * @param {Object} date - reference date, Date object
 * @param {Object} interval - interval to add; 'day', 'month', 'year'
 * @param {Object} value - number 
 * @param {Object} format - specify result format. Valid values 'day'(year-month-day), 'month' (year-month), 'year'
*/
function getCustomDate(reference, interval, value, format){
	var calcDate = reference;
	switch(interval){
		case 'day': { calcDate = reference.add(Date.DAY, value); break; }
		case 'month': {calcDate = reference.add(Date.MONTH, value); break;}
		case 'year': {calcDate = reference.add(Date.YEAR, value); break;}
	}
	var result = calcDate.getFullYear();
	if(format == 'month' || format == 'day'){
		result += '-'+((calcDate.getMonth()+1 < 10)?'0':'')+ (calcDate.getMonth()+1);
	}
	if(format == 'day'){
		result += '-'+((calcDate.getDate()<10)?'0':'') + calcDate.getDate();
	}
	return(result);
}

/**
 * copy object
 * @param {Object} object
 */
function copyObject(object){
	var tmp = (object instanceof Array) ? [] : {};
	for(prop in object){
		//if(prop == 'clone') continue;
		if (object[prop] && typeof object[prop] == "object") {
			tmp[prop] = copyObject(object[prop]);
		}
		else {
			tmp[prop] = object[prop];
		} 
	}
	return tmp;
}
