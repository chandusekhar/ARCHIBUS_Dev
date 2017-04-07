// define global object with custom chart properties
var abChartsCustomProperties = new Ext.util.MixedCollection();


var bldgByValues_dataAxisObject = new Ext.util.MixedCollection();
bldgByValues_dataAxisObject.addAll(
		{ id: 'geo_region_id', dataAxis: [{dataSourceId: 'abRplmPfadminGpdBldgValuesByGeoRegion_ds'}, {dataSourceId: 'abRplmPfadminGpdBldgValuesByGeoRegion_ds'}]},
		{ id: 'ctry_id', dataAxis: [{dataSourceId: 'abRplmPfadminGpdBldgValuesByCtry_ds'}, {dataSourceId: 'abRplmPfadminGpdBldgValuesByCtry_ds'}]},
		{ id: 'site_id', dataAxis: [{dataSourceId: 'abRplmPfadminGpdBldgValuesBySite_ds'}, {dataSourceId: 'abRplmPfadminGpdBldgValuesBySite_ds'}]},
		{ id: 'bl_id', dataAxis: [{dataSourceId: 'abRplmPfadminGpdBldgValuesByBl_ds'}, {dataSourceId: 'abRplmPfadminGpdBldgValuesByBl_ds'}]}
	);

var bldgByValues_groupingAxisObject = new Ext.util.MixedCollection();
bldgByValues_groupingAxisObject.addAll(
		{ id: 'geo_region_id', groupingAxis: [{field: 'geo_region_id', id: 'ctry.geo_region_id', table: 'ctry', 
			dataSourceId: 'abRplmPfadminGpdBldgValuesByGeoRegion_ds', title : "labelGeoRegion"}]},
		{ id: 'ctry_id', groupingAxis: [{field: 'ctry_id', id: 'bl.ctry_id', table: 'bl', 
			dataSourceId: 'abRplmPfadminGpdBldgValuesByCtry_ds', title : "labelCountry"}]},
		{ id: 'site_id', groupingAxis: [{field: 'site_id', id: 'bl.site_id', table: 'bl', 
			dataSourceId: 'abRplmPfadminGpdBldgValuesBySite_ds', title : "labelSite"}]},
		{ id: 'bl_id', groupingAxis: [{field: 'bl_id', id: 'bl.bl_id', table: 'bl', 
			dataSourceId: 'abRplmPfadminGpdBldgValuesByBl_ds', title : "labelBuilding"}]}
	);

var bldgByValues_dataSourcesObj = new Ext.util.MixedCollection();
bldgByValues_dataSourcesObj.addAll(
		{ id: 'geo_region_id', dataSourceId: 'abRplmPfadminGpdBldgValuesByGeoRegion_ds'},
		{ id: 'ctry_id', dataSourceId: 'abRplmPfadminGpdBldgValuesByCtry_ds'},
		{ id: 'site_id',  dataSourceId: 'abRplmPfadminGpdBldgValuesBySite_ds'},
		{ id: 'bl_id',  dataSourceId: 'abRplmPfadminGpdBldgValuesByBl_ds'}
	);

var bldgByValues_detailsPanelsObj = new Ext.util.MixedCollection();
bldgByValues_detailsPanelsObj.addAll(
		{ id: 'geo_region_id', panelId: 'abRplmPfadminGpdBldgValuesByGeoRegionDetails'},
		{ id: 'ctry_id', panelId: 'abRplmPfadminGpdBldgValuesByCtryDetails'},
		{ id: 'site_id',  panelId: 'abRplmPfadminGpdBldgValuesBySiteDetails'},
		{ id: 'bl_id',  panelId: 'abRplmPfadminGpdBldgValuesByBlDetails'}
	);


var occupancyBy_dataAxisObject = new Ext.util.MixedCollection();
occupancyBy_dataAxisObject.addAll(
		{ id: 'geo_region_id', dataAxis: [{dataSourceId: 'abRplmPfadminGpdOccupancyByGeoRegion_ds'}, {dataSourceId: 'abRplmPfadminGpdOccupancyByGeoRegion_ds'}]},
		{ id: 'ctry_id', dataAxis: [{dataSourceId: 'abRplmPfadminGpdOccupancyByCtry_ds'}, {dataSourceId: 'abRplmPfadminGpdOccupancyByCtry_ds'}]},
		{ id: 'site_id', dataAxis: [{dataSourceId: 'abRplmPfadminGpdOccupancyBySite_ds'}, {dataSourceId: 'abRplmPfadminGpdOccupancyBySite_ds'}]},
		{ id: 'bl_id', dataAxis: [{dataSourceId: 'abRplmPfadminGpdOccupancyByBl_ds'}, {dataSourceId: 'abRplmPfadminGpdOccupancyByBl_ds'}]}
	);

var occupancyBy_groupingAxisObject = new Ext.util.MixedCollection();
occupancyBy_groupingAxisObject.addAll(
		{ id: 'geo_region_id', groupingAxis: [{field: 'geo_region_id', id: 'ctry.geo_region_id', table: 'ctry', 
			dataSourceId: 'abRplmPfadminGpdOccupancyByGeoRegion_ds', title : "labelGeoRegion"}]},
		{ id: 'ctry_id', groupingAxis: [{field: 'ctry_id', id: 'bl.ctry_id', table: 'bl', 
			dataSourceId: 'abRplmPfadminGpdOccupancyByCtry_ds', title : "labelCountry"}]},
		{ id: 'site_id', groupingAxis: [{field: 'site_id', id: 'bl.site_id', table: 'bl', 
			dataSourceId: 'abRplmPfadminGpdOccupancyBySite_ds', title : "labelSite"}]},
		{ id: 'bl_id', groupingAxis: [{field: 'bl_id', id: 'bl.bl_id', table: 'bl', 
			dataSourceId: 'abRplmPfadminGpdOccupancyByBl_ds', title : "labelBuilding"}]}
	);

var occupancyBy_dataSourcesObj = new Ext.util.MixedCollection();
occupancyBy_dataSourcesObj.addAll(
		{ id: 'geo_region_id', dataSourceId: 'abRplmPfadminGpdOccupancyByGeoRegion_ds'},
		{ id: 'ctry_id', dataSourceId: 'abRplmPfadminGpdOccupancyByCtry_ds'},
		{ id: 'site_id',  dataSourceId: 'abRplmPfadminGpdOccupancyBySite_ds'},
		{ id: 'bl_id',  dataSourceId: 'abRplmPfadminGpdOccupancyByBl_ds'}
	);

var occupancyBy_detailsPanelsObj = new Ext.util.MixedCollection();
occupancyBy_detailsPanelsObj.addAll(
		{ id: 'geo_region_id', panelId: 'abRplmPfadminGpdOccupancyByGeoRegionDetails'},
		{ id: 'ctry_id', panelId: 'abRplmPfadminGpdOccupancyByCtryDetails'},
		{ id: 'site_id',  panelId: 'abRplmPfadminGpdOccupancyBySiteDetails'},
		{ id: 'bl_id',  panelId: 'abRplmPfadminGpdOccupancyByBlDetails'}
	);


var ownedBy_dataAxisObject = new Ext.util.MixedCollection();
ownedBy_dataAxisObject.addAll(
		{ id: 'geo_region_id', dataAxis: [{dataSourceId: 'abRplmPfadminGpdOwnedByGeoRegion_ds'},{dataSourceId: 'abRplmPfadminGpdOwnedByGeoRegion_ds'}]},
		{ id: 'ctry_id', dataAxis: [{dataSourceId: 'abRplmPfadminGpdOwnedByCtry_ds'}, {dataSourceId: 'abRplmPfadminGpdOwnedByCtry_ds'}]},
		{ id: 'site_id', dataAxis: [{dataSourceId: 'abRplmPfadminGpdOwnedBySite_ds'}, {dataSourceId: 'abRplmPfadminGpdOwnedBySite_ds'}]},
		{ id: 'bl_id', dataAxis: [{dataSourceId: 'abRplmPfadminGpdOwnedByBl_ds'}, {dataSourceId: 'abRplmPfadminGpdOwnedByBl_ds'}]}
	);

var ownedBy_groupingAxisObject = new Ext.util.MixedCollection();
ownedBy_groupingAxisObject.addAll(
		{ id: 'geo_region_id', groupingAxis: [{field: 'geo_region_id', id: 'ctry.geo_region_id', table: 'ctry', 
			dataSourceId: 'abRplmPfadminGpdOwnedByGeoRegion_ds', title : "labelGeoRegion"}]},
		{ id: 'ctry_id', groupingAxis: [{field: 'ctry_id', id: 'bl.ctry_id', table: 'bl', 
			dataSourceId: 'abRplmPfadminGpdOwnedByCtry_ds', title : "labelCountry"}]},
		{ id: 'site_id', groupingAxis: [{field: 'site_id', id: 'bl.site_id', table: 'bl', 
			dataSourceId: 'abRplmPfadminGpdOwnedBySite_ds', title : "labelSite"}]},
		{ id: 'bl_id', groupingAxis: [{field: 'bl_id', id: 'bl.bl_id', table: 'bl', 
			dataSourceId: 'abRplmPfadminGpdOwnedByBl_ds', title : "labelBuilding"}]}
	);

var ownedBy_dataSourcesObj = new Ext.util.MixedCollection();
ownedBy_dataSourcesObj.addAll(
		{ id: 'geo_region_id', dataSourceId: 'abRplmPfadminGpdOwnedByGeoRegion_ds'},
		{ id: 'ctry_id', dataSourceId: 'abRplmPfadminGpdOwnedByCtry_ds'},
		{ id: 'site_id',  dataSourceId: 'abRplmPfadminGpdOwnedBySite_ds'},
		{ id: 'bl_id',  dataSourceId: 'abRplmPfadminGpdOwnedByBl_ds'}
	);

//abRplmPfadminGpdOccupancyByLocation_chart
abChartsCustomProperties.addAll(
		{
			id: 'abRplmPfadminGpdBldgValuesByLocation_chart',
			controllerId: 'abRplmPfadminGpdBldgValuesByCtrl',
			dataAxisObject: bldgByValues_dataAxisObject,
			groupingAxisObject: bldgByValues_groupingAxisObject,
			dataSourcesObj: bldgByValues_dataSourcesObj,
			detailsPanelsObj: bldgByValues_detailsPanelsObj
		},
		{
			id: 'abRplmPfadminGpdOccupancyByLocation_chart',
			controllerId: 'abRplmPfadminGpdOccupancyByCtrl',
			dataAxisObject: occupancyBy_dataAxisObject,
			groupingAxisObject: occupancyBy_groupingAxisObject,
			dataSourcesObj: occupancyBy_dataSourcesObj,
			detailsPanelsObj: occupancyBy_detailsPanelsObj
		},
		{
			id: 'abRplmPfadminGpdOwnedByLocation_chart',
			controllerId: 'abRplmPfadminGpdOwnedByCtrl',
			dataAxisObject: ownedBy_dataAxisObject,
			groupingAxisObject: ownedBy_groupingAxisObject,
			dataSourcesObj: ownedBy_dataSourcesObj
		}
);


//overwrite chart control getParameters function
Ab.chart.ChartControl.prototype.getParameters = function(restriction){
	var chartLevel = null;
	var custDataSourceId = null;
	var customGroupingAxis = null;
	var customDataAxis = null;
	var customDetailsPanelId = null;
	
	// we must initialize some variables
	var chartCustomObject = abChartsCustomProperties.get(this.id);
	if (valueExists(chartCustomObject)) {
		// controller
		var controllerId = chartCustomObject.controllerId;
		chartLevel = View.controllers.get(controllerId).chartLevel;
		if (valueExistsNotEmpty(chartLevel)) {
			// data sources
			if (valueExists(chartCustomObject.dataSourcesObj)) {
				custDataSourceId = chartCustomObject.dataSourcesObj.get(chartLevel).dataSourceId;
			}
			// data axis
			if (valueExists(chartCustomObject.dataAxisObject)) {
				customDataAxis = chartCustomObject.dataAxisObject.get(chartLevel).dataAxis;
			}
			// grouping axis
			if (valueExists(chartCustomObject.groupingAxisObject)) {
				customGroupingAxis = chartCustomObject.groupingAxisObject.get(chartLevel).groupingAxis;
			}
			// details panel id
			if (valueExists(chartCustomObject.detailsPanelsObj)) {
				customDetailsPanelId = chartCustomObject.detailsPanelsObj.get(chartLevel).panelId;
			}
		}
		
	}
	
	var viewName = this.configObj.getConfigParameter('viewDef');
	/**
	 * Set custom properties for chart.
	 */
	if(valueExistsNotEmpty(custDataSourceId)){
		var custDataSourceObj = View.dataSources.get(custDataSourceId);

		this.configObj.dataSourceId = custDataSourceId;
		this.configObj.fieldDefs =  custDataSourceObj.fieldDefs.items;
		
		this.dataSourceId = custDataSourceId;
		this.fieldDefs =  custDataSourceObj.fieldDefs.items;
		// panel for click event
		if (valueExistsNotEmpty(customDetailsPanelId)) {
			for (var i= 0 ; i < this.events.length; i++){
				if (this.events[i].type == "onClickItem") {
					this.events[i].commands[0].panelId = customDetailsPanelId;
					this.configObj.events[i].commands[0].panelId = customDetailsPanelId;
				}
			}
		}
		
	}
	
	var groupingAxis = this.configObj.getConfigParameter('groupingAxis');
	
    if (valueExists(groupingAxis) && groupingAxis.length > 0) {
    	// customize grouping axis
    	this.groupingAxis = new Array();
    	for (var i = 0; i < groupingAxis.length; i++) {
    		if (valueExists(customGroupingAxis)) {
        		for(prop in customGroupingAxis[i]){
        			if (prop == "title") {
        				groupingAxis[i][prop] = getMessage(customGroupingAxis[i][prop]);
        			}else{
        				groupingAxis[i][prop] =  customGroupingAxis[i][prop];
        			}
        		}
    		}
    	}
    	// construct the grouping axis with the first of the groupingAxis JSON array
    	// since we only one and only one grouping axis
        this.groupingAxis[0] = new Ab.chart.ChartAxis(this.dataSourceId, groupingAxis[0]);
    }
	
	var dataAxis = this.configObj.getConfigParameter('dataAxis');
	// set custom property for dataAxis
	if (valueExists(customDataAxis)) {
		for(var i = 0; i< dataAxis.length; i++){
			for(prop in customDataAxis[i]){
				dataAxis[i][prop] =  customDataAxis[i][prop];
			}
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
	 
	 if (valueExists(secondaryGroupingAxis)) {
         parameters.secondaryGroupingAxis = toJSON(secondaryGroupingAxis);
     }
     
     if (valueExists(restriction)) {
         parameters.restriction = toJSON(restriction);
     }
	 
	 Ext.apply(parameters, this.parameters);
	 
     // we must load the new data into flash control
	// this.loadChartSWFIntoFlash();
	 
	 return parameters;
}
