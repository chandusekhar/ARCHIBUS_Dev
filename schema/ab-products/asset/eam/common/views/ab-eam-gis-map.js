/**
 * Map config object  global variable.
 */
var mapConfigObject = {
        "mapInitExtent": [-8885818, 4608861, -7650596, 5411144],
        "mapInitExtentWKID": 102100,
        "mapLoadedCallback": onMapLoaded
    };


/**
 * Show building and properties.
 */
var abEamGisMapController = View.createController('abEamGisMapController', {

    /**
     * Applied restriction for buildings.
     */
    blRestriction: null,

    /**
     * Applied restriction for properties.
     */
    propertyRestriction: null,

    //asset type
    assetType: null,

    // asset id
    assetId: null,

    selectedProjects: null,
    // the Ab.arcgis.ArcGISMap control
    mapControl: null,

    panelTitle: null,

    markerType: null,

    markerConfig: null,

    markerBlDataSourceId: null,

    markerPrDataSourceId: null,

    showMarkerLabels: true,

    afterViewLoad: function () {
        
        var configObject = {
            "mapInitExtent": [-8885818, 4608861, -7650596, 5411144],
            "mapInitExtentWKID": 102100,
            "mapLoadedCallback": onMapLoaded
        };
        
        this.mapControl = new Ab.arcgis.ArcGISMap('mapPanel', 'mapDiv', configObject);
    },

    afterInitialDataFetch: function () {
        /**
         * By default buildings are displayed.
         * TODO find a solution for properties
         */
        if (valueExists(this.view.restriction)) {
            this.blRestriction = this.view.restriction;
        }

        // get parameters
        var parameters = null;
        if (valueExists(this.view.parameters)) {
            parameters = this.view.parameters;
        } else if (valueExists(this.view.parentTab) && valueExists(this.view.parentTab.parameters)) {
            parameters = this.view.parentTab.parameters;
        } else if (valueExists(this.view.parentViewPanel) && valueExists(this.view.parentViewPanel.parameters)) {
            parameters = this.view.parentViewPanel.parameters;
        }

        if (valueExists(parameters) && valueExists(parameters['mapRestriction'])) {
        	this.view.restriction = parameters['mapRestriction'];
        	this.blRestriction = parameters['mapRestriction'];
        }

        if (valueExists(parameters) && valueExists(parameters['panelTitle'])) {
            this.panelTitle = parameters['panelTitle'];
        }

        if (valueExists(parameters) && valueExists(parameters['mapZoomLevel'])) {
            this.mapControl.autoZoomLevelLimit = parameters['mapZoomLevel'];
        }
        if (valueExists(parameters) && valueExists(parameters['showMarkerLabels'])) {
            this.showMarkerLabels = parameters['showMarkerLabels'];
        }

        if (valueExists(parameters) && valueExists(parameters['panelTitle'])) {
            this.panelTitle = parameters['panelTitle'];
        }

        if (valueExists(parameters) && valueExists(parameters['mapToolsActionConfig'])) {
            this.configureMapAction(parameters['mapToolsActionConfig']);
        }

        if (valueExists(parameters) && valueExists(parameters['selectedProjects'])) {
            this.selectedProjects = parameters['selectedProjects'];
        }

        var reportTargetPanel = document.getElementById('mapPanel');
        reportTargetPanel.className = 'claro';

        if (valueExists(this.panelTitle)) {
            this.mapPanel.setTitle(this.panelTitle);
        }

        // show markers
        onMapLoaded();
    },

    showMarkers: function () {
        // clear current markers
        this.showBuildings();
        this.showProperties();
    },

    clearMap: function () {
        this.mapControl.clear();
        this.mapControl.removeThematicLegend();
    },

    resetMapExtent: function () {
        this.mapControl.setMapExtent(-8885818, 4608861, -7650596, 5411144);
    },

    showBuildings: function () {
        if (!valueExists(this.blRestriction)) {
            return false;
            // reset building
//			this.blRestriction = new Ab.view.Restriction();
//			this.blRestriction.addClause('bl.bl_id', 'null', '=', 'OR');
        }

        var blMarkerProperty = this.getMarkerPropertyByType("bl", this.markerType);

        this.mapControl.removeThematicLegend();
        this.mapControl.buildThematicLegend(blMarkerProperty);
        this.mapControl.updateDataSourceMarkerPropertyPair(this.markerBlDataSourceId, blMarkerProperty);

        var sqlClauses = [];
        for (var i = 0; i < this.blRestriction.clauses.length; i++) {
            var clause = this.blRestriction.clauses[i];
            var sqlClause = '';
            if (clause.name == 'geo_region.geo_region_id') {
                sqlClause = "EXISTS(SELECT ctry.ctry_id FROM ctry WHERE ctry.ctry_id = bl.ctry_id AND ctry.geo_region_id " + getSqlClauseValue(clause.op, clause.value) + ")";
            } else {
                var field = clause.name.substr(clause.name.indexOf('.'));
                sqlClause = "bl" + field + " " + getSqlClauseValue(clause.op, clause.value);
            }
            sqlClauses.push(sqlClause);
        }
        var blMarkerPropertyClause = _.clone(sqlClauses);
        if (valueExists(this.selectedProjects) && this.selectedProjects.length > 0) {
            sqlClauses.push("project.project_id IN ('" + this.selectedProjects.join("', '") + "')");
            blMarkerPropertyClause.push("bl.project_id IN ('" + this.selectedProjects.join("', '") + "')");
        }

        var sqlTypeRestriction = sqlClauses.join(' AND ');
        var sqlBlMarkerPropertyRestriction = blMarkerPropertyClause.join(' AND ');

        var objDataSource = this.view.dataSources.get(this.markerBlDataSourceId);
        objDataSource.addParameter('sqlTypeRestriction', sqlTypeRestriction);

        blMarkerProperty.setRestriction(sqlBlMarkerPropertyRestriction);
        this.mapControl.updateDataSourceMarkerPropertyPair(this.markerBlDataSourceId, blMarkerProperty);


//    	if(valueExists(this.blRestriction) && this.blRestriction.findClause('geo_region.geo_region_id')){
//    		var geoRegionClause = this.blRestriction.findClause('geo_region.geo_region_id');
//    		var restriction = "EXISTS(SELECT ctry.ctry_id FROM ctry WHERE ctry.ctry_id = bl.ctry_id AND ctry.geo_region_id " + getSqlClauseValue(geoRegionClause.op, geoRegionClause.value) + ")";
//    		if(valueExists(this.selectedProjects) && this.selectedProjects.length > 0 ){
//    			restriction += " AND project.project_id IN ('" + this.selectedProjects.join("', '") + "')";
//    		}
//        	blMarkerProperty.setRestriction(restriction);
//    	}else{
//    		if(valueExists(this.selectedProjects) && this.selectedProjects.length > 0 ){
//    			this.blRestriction.addClause('project.project_id', this.selectedProjects , 'IN');
//    		}
//        	blMarkerProperty.setRestriction(this.blRestriction);
//    
        this.mapControl.refresh();
    },

    showProperties: function () {
        if (!valueExists(this.propertyRestriction)) {
            return false;
//			// reset properties
//			this.propertyRestriction = new Ab.view.Restriction();
//			this.propertyRestriction.addClause('property.pr_id', 'null', '=', 'OR');
        }

        var prMarkerProperty = this.getMarkerPropertyByType("property", this.markerType);
        this.mapControl.buildThematicLegend(prMarkerProperty);

        if (valueExists(this.propertyRestriction) && this.propertyRestriction.findClause('geo_region.geo_region_id')) {
            var geoRegionClause = this.propertyRestriction.findClause('geo_region.geo_region_id');
            var restriction = "EXISTS(SELECT ctry.ctry_id FROM ctry WHERE ctry.ctry_id = bl.ctry_id AND ctry.geo_region_id " + getSqlClauseValue(geoRegionClause.op, geoRegionClause.value) + ")";
            prMarkerProperty.setRestriction(restriction);
        } else {
            prMarkerProperty.setRestriction(this.propertyRestriction);
        }
        this.mapControl.updateDataSourceMarkerPropertyPair(this.markerPrDataSourceId, prMarkerProperty);

        this.mapControl.refresh();
    },

    /**
     * Used to refresh map.
     */
    refreshMap: function (blRestriction, propertyRestriction, assetId, assetType) {
        this.blRestriction = blRestriction;
        if (valueExists(propertyRestriction)) {
            this.propertyRestriction = propertyRestriction;
        } else {
            this.propertyRestriction = null;
        }

        if (valueExists(assetId)) {
            this.assetId = assetId;
        }

        if (valueExists(assetType)) {
            this.assetType = assetType;
        }

        this.showMarkers();
    },

    configureMapAction: function (actionConfig) {
        var mapPanel = this.view.panels.get('mapPanel');
        var controller = this;
        actionConfig.each(function (action) {
            var panelAction = mapPanel.actions.get(action.id);
            if (panelAction) {
                var actionConfig = action.actionConfig;
                if (valueExists(actionConfig.visible)) {
                    panelAction.show(actionConfig.visible);
                }

                if (valueExists(actionConfig.enabled)) {
                    panelAction.enable(actionConfig.visible);
                }

                if (valueExists(actionConfig.actions)) {
                    actionConfig.actions.each(function (menuAction) {
                        var id = menuAction.id;
                        var menuActionConfig = menuAction.actionConfig;
                        var title = getMessage('actionTitle_' + id);
                        var listener = window[menuActionConfig.listener];
                        if (menuActionConfig.visible) {
                            panelAction.addAction(id, title, function () {
                                listener(id, controller);
                            });
                        }
                        if (valueExists(menuActionConfig.selected) && menuActionConfig.selected) {
                            controller.markerType = id;
                            controller.markerConfig = menuActionConfig;
                        }
                    });
                    panelAction.createMenu();
                }
            }
        });
    },

    /**
     * Set selected projects value
     */
    setSelectedProjects: function (selectedProjects) {
        this.selectedProjects = selectedProjects;
    },

    getMarkerPropertyByType: function (assetType, markerType) {
        var markerProperty = null;
        if (assetType == 'bl') {
            markerProperty = this.getBuildingMarkerProperty(markerType);
        } else if (assetType == 'property') {
            markerProperty = this.getPropertyMarkerProperty(markerType);
        }
        return markerProperty;
    },

    getBuildingMarkerProperty: function (markerType) {
        var markerProperty = null;
        this.markerBlDataSourceId = this.markerConfig.dataSourceId;

        if (markerType == 'proposedProjectCost') {
            // create the marker property to specify building markers for the map
            markerProperty = new Ab.arcgis.ArcGISMarkerProperty(
                this.markerBlDataSourceId, 			// datasource
                ['bl.lat', 'bl.lon'], 						// geometry fields
                ['bl.bl_id'],							// datasource key
                ['project.project_id', 'bl.city_id', 'project.criticality', 'bl.project_cost', 'bl.project_area', 'bl.project_headcount', 'bl.site_id', 'site.count_em', 'site.area_usable'] 	// infowindow fields
            );
            var hexColors = colorbrewer.Paired2[12];
            var rgbColors = this.mapControl.colorbrewer2rgb(hexColors);
            markerProperty.symbolColors = rgbColors;

            // set up thematic graduated markers
            var thematicBuckets = this.selectedProjects;     // color -- empty buckets -- use unique value renderer
            var graduatedBuckets =        // size
                [{limit: 10000, size: 10},
                    {limit: 100000, size: 20},
                    {limit: 1000000, size: 30},
                    {limit: +Infinity, size: 40}
                ];
            markerProperty.setThematicGraduated('project.project_id', thematicBuckets, 'bl.project_cost', graduatedBuckets);

        } else if (markerType == 'proposedProjectAssetCost') {
            // create the marker property to specify building markers for the map
            markerProperty = new Ab.arcgis.ArcGISMarkerProperty(
                this.markerBlDataSourceId, 			// datasource
                ['bl.lat', 'bl.lon'], 						// geometry fields
                ['bl.bl_id'],							// datasource key
                ['project.project_id', 'bl.city_id', 'project.criticality', 'bl.project_cost', 'bl.project_area', 'bl.project_headcount', 'bl.site_id', 'site.count_em', 'site.area_usable'] 	// infowindow fields
            );
            var hexColors = colorbrewer.Paired2[12];
            var rgbColors = this.mapControl.colorbrewer2rgb(hexColors);
            markerProperty.symbolColors = rgbColors;

            var thematicBuckets = this.selectedProjects;
            var graduatedBuckets =        // size
                [{limit: 1000, size: 10},
                    {limit: 10000, size: 20},
                    {limit: 100000, size: 30},
                    {limit: +Infinity, size: 40}
                ];
            markerProperty.setThematicGraduated('project.project_id', thematicBuckets, 'bl.project_cost', graduatedBuckets);

        } else if (markerType == 'projectArea') {
            // create the marker property to specify building markers for the map
            markerProperty = new Ab.arcgis.ArcGISMarkerProperty(
                this.markerBlDataSourceId, 			// datasource
                ['bl.lat', 'bl.lon'], 						// geometry fields
                ['bl.bl_id'],							// datasource key
                ['project.project_id', 'bl.city_id', 'project.criticality', 'bl.project_area', 'bl.project_headcount', 'bl.site_id', 'site.count_em', 'site.area_usable'] 	// infowindow fields
            );
            var hexColors = colorbrewer.Paired2[12];
            var rgbColors = this.mapControl.colorbrewer2rgb(hexColors);
            markerProperty.symbolColors = rgbColors;

            var thematicBuckets = this.selectedProjects;
            var graduatedBuckets =        // size
                [{limit: 2000, size: 10},
                    {limit: 10000, size: 20},
                    {limit: 100000, size: 30},
                    {limit: +Infinity, size: 40}
                ];
            markerProperty.setThematicGraduated('project.project_id', thematicBuckets, 'bl.project_area', graduatedBuckets);

        } else if (markerType == 'projectHeadcount') {
            // create the marker property to specify building markers for the map
            markerProperty = new Ab.arcgis.ArcGISMarkerProperty(
                this.markerBlDataSourceId, 			// datasource
                ['bl.lat', 'bl.lon'], 						// geometry fields
                ['bl.bl_id'],							// datasource key
                ['project.project_id', 'bl.city_id', 'project.criticality', 'bl.project_area', 'bl.project_headcount', 'bl.site_id', 'site.count_em', 'site.area_usable'] 	// infowindow fields
            );
            var hexColors = colorbrewer.Paired2[12];
            var rgbColors = this.mapControl.colorbrewer2rgb(hexColors);
            markerProperty.symbolColors = rgbColors;

            var thematicBuckets = this.selectedProjects;
            var graduatedBuckets =        // size
                [{limit: 100, size: 10},
                    {limit: 500, size: 20},
                    {limit: 1000, size: 30},
                    {limit: +Infinity, size: 40}
                ];

            markerProperty.setThematicGraduated('project.project_id', thematicBuckets, 'bl.project_headcount', graduatedBuckets);

        } else if (markerType == 'costReplace' || markerType == 'costDepValue' || markerType == 'costValMarket') {
            // localize asset type
            this.localizeAssetType(this.markerBlDataSourceId);

            // create the marker property to specify building markers for the map
            markerProperty = new Ab.arcgis.ArcGISMarkerProperty(
                this.markerBlDataSourceId, 			// datasource
                ['bl.lat', 'bl.lon'], 						// geometry fields
                ['bl.asset_id'],							// datasource key
                ['bl.asset_id', 'bl.localized_asset_type', 'bl.owner', 'bl.cost_replace', 'bl.cost_dep_value', 'bl.cost_val_market'] 	// infowindow fields
            );
            markerProperty.showLabels = this.showMarkerLabels;

            markerProperty.setSymbolType('circle');
            var hexColors = ['#008000', '#ff0000', '#ffff00', '#800080'];
            var rgbColors = this.mapControl.colorbrewer2rgb(hexColors);
            markerProperty.symbolColors = rgbColors;

            //var thematicBuckets = [];     // color -- empty buckets -- use unique value renderer
            var thematicBuckets = [getMessage('assetStatus_active'), getMessage('assetStatus_inactive'), getMessage('assetStatus_disposed'), getMessage('assetStatus_proposed')];

            var graduatedBuckets =        // size
                [{limit: 10000, size: 10},
                    {limit: 100000, size: 20},
                    {limit: 1000000, size: 30},
                    {limit: +Infinity, size: 40}
                ];
            var graduatedFieldId = null;
            if (markerType == 'costReplace') {
                graduatedFieldId = 'bl.cost_replace';
            } else if (markerType == 'costDepValue') {
                graduatedFieldId = 'bl.cost_dep_value';
            } else if (markerType == 'costValMarket') {
                graduatedFieldId = 'bl.cost_val_market';
            }

            markerProperty.setThematicGraduated('bl.asset_status', thematicBuckets, graduatedFieldId, graduatedBuckets);
        }

        return markerProperty;
    },

    getPropertyMarkerProperty: function (markerType) {
        var markerProperty = null;
        this.markerPrDataSourceId = this.markerConfig.dataSourceId;
        if (markerType == 'costReplace' || markerType == 'costDepValue' || markerType == 'costValMarket') {
            // localize asset type
            this.localizeAssetType(this.markerBlDataSourceId);

            // create the marker property to specify building markers for the map
            var markerProperty = new Ab.arcgis.ArcGISMarkerProperty(
                this.markerBlDataSourceId, 			// datasource
                ['bl.lat', 'bl.lon'], 						// geometry fields
                ['bl.asset_id'],							// datasource key
                ['bl.asset_id', 'bl.owner', 'bl.cost_replace', 'bl.cost_dep_value', 'bl.cost_val_market'] 	// infowindow fields
            );
            markerProperty.setSymbolType('diamond');
            var hexColors = ['#008000', '#ff0000', '#ffff00', '#800080'];
            var rgbColors = this.mapControl.colorbrewer2rgb(hexColors);
            markerProperty.symbolColors = rgbColors;

            //var thematicBuckets = [];     // color -- empty buckets -- use unique value renderer
            var thematicBuckets = [getMessage('assetStatus_active'), getMessage('assetStatus_inactive'), getMessage('assetStatus_disposed'), getMessage('assetStatus_proposed')];

            var graduatedBuckets =        // size
                [{limit: 10000, size: 10},
                    {limit: 100000, size: 20},
                    {limit: 1000000, size: 30},
                    {limit: +Infinity, size: 40}
                ];
            var graduatedFieldId = null;
            if (markerType == 'costReplace') {
                graduatedFieldId = 'bl.cost_replace';
            } else if (markerType == 'costDepValue') {
                graduatedFieldId = 'bl.cost_dep_value';
            } else if (markerType == 'costValMarket') {
                graduatedFieldId = 'bl.cost_val_market';
            }

            markerProperty.setThematicGraduated('bl.asset_status', thematicBuckets, graduatedFieldId, graduatedBuckets);
        }

        return markerProperty;
    },
    /**
     * Localize asset type
     */
    localizeAssetType: function (dataSourceName) {
        var dataSource = View.dataSources.get(dataSourceName);
        //asset type
        dataSource.addParameter('localizedAsset_bl', getMessage('assetType_bl'));
        dataSource.addParameter('localizedAsset_eq', getMessage('assetType_eq'));
        dataSource.addParameter('localizedAsset_ta', getMessage('assetType_ta'));
        dataSource.addParameter('localizedAsset_property', getMessage('assetType_property'));
        //asset status thematic buckets
        dataSource.addParameter('assetStatusActive', getMessage('assetStatus_active'));
        dataSource.addParameter('assetStatusInactive', getMessage('assetStatus_inactive'));
        dataSource.addParameter('assetStatusDisposed', getMessage('assetStatus_disposed'));
        dataSource.addParameter('assetStatusProposed', getMessage('assetStatus_proposed'));
    }
});

function onMapLoaded() {
	var controller = View.controllers.get('abEamGisMapController');
	if (valueExists(controller.blRestriction) 
			|| valueExists(controller.propertyRestriction)){
		controller.showMarkers();
	}
}

