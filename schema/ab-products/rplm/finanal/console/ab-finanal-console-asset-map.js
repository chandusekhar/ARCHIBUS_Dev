View.createController('financialAnalysisConsoleAssetMap', {

	// the Ab.arcgis.Map control
	mapControl: null,

	/**
	 * The selected analysis code.
	 */
	selectedAnalysisCode: null,

	/**
	 * The selected analysis name (analysis super group).
	 */
	selectedAnalysisSuperGroup: null,

    /**
     * Analysis field records (finanal_analyses_flds) to display in this panel.
     */
    analysisFields: null,

    /**
     * True if the map is filtered by the Asset Scorecard.
     */
    filterByScorecard: false,

    /**
     * The list of buildings displayed in the Asset Scorecard.
     */
    scorecardBuildings: null,

    /**
     * The asset restriction assembled from:
     * - [Filter to Scorecard] checkbox.
     * - Fiscal year selector.
     */
    restriction: null,

    /**
    *   The fields included in the analysis.
    */
    firstFieldName: null,
    firstTableName: null,
    secondFieldName: null,
    secondTableName: null,

    /**
     * Name of the active basemap, with default value.
     */
    activeBasemap: 'World Imagery with Labels', //'World Street Map'

    /**
     * True if the map view change was triggered by the onLocateBuilding event
     */
    mapViewChangeOnLocateBuilding: false,

    // Ext.util.DelayedTask that triggers selectBuildings events
    selectBuildingsTriggerTask: null,

    /**
     * Maps DOM events to controller methods.
     */
    events: {
        'change #filterOptions :input': function(e) {
            if (e.currentTarget.id == 'filterByScorecard') {
                this.onFilterByScorecard(true);
            } else {
                this.onFilterByScorecard(false);
            }
        },
        'click .leaflet-map-marker-infowindow': function(e) {
            this.onInfoWindowClick();
        }
    },

	afterViewLoad: function() {
     	this.restriction = new Ab.view.Restriction();
        this.selectBuildingsTriggerTask = new Ext.util.DelayedTask();

        try {
            /*
             * Leaflet map
             */
            var configObject = new Ab.view.ConfigObject();
            configObject.mapImplementation = 'Esri';
            configObject.basemap = View.getLocalizedString('World Imagery with Labels');
            configObject.mapCenter = [48, 7];
            configObject.mapZoom = 2;
            this.mapControl = new Ab.leaflet.Map('gisMapPanel', 'gisMapDiv', configObject);

            // create map event listeners
            this.mapControl.mapClass.addEventListener('mapViewChange', this.onMapViewChange, this);
            this.mapControl.mapClass.addEventListener('markerClick', this.onMarkerClick, this);
            this.mapControl.mapClass.addEventListener('mapClick', this.onMapClick, this);
            this.mapControl.mapClass.addEventListener('markerMouseOver', this.onMarkerMouseOver, this);
            this.mapControl.mapClass.addEventListener('markerMouseOut', this.onMarkerMouseOut, this);

            // create controller listeners
            this.on('app:rplm:sfa:selectAnalysis', this.onSelectAnalysis);
            this.on('app:rplm:sfa:selectAnalysisFields', this.selectAnalysisFields);
            this.on('app:rplm:sfa:selectFiscalYear', this.onSelectFiscalYear);
            this.on('app:rplm:sfa:filterByScorecard', this.onFilterByScorecard);
            this.on('app:rplm:sfa:mapBuildings', this.onMapBuildings);
            this.on('app:rplm:sfa:locateBuilding', this.onLocateBuilding);
            this.on('app:rplm:sfa:highlightBuilding', this.onHighlightBuilding);
            this.on('app:rplm:sfa:clearBuilding', this.onClearBuilding);
            this.on('app:rplm:sfa:afterSelectMetrics', this.afterSelectMetrics);
            this.on('app:rplm:sfa:toggleBasemap', this.onToggleBasemap);
            this.on('app:rplm:sfa:showMarkerLegend', this.onShowMarkerLegend);

        } catch (e) {
            View.log(e);
        }
	},

    /**
    * Called by the map control when the map is loaded and ready for action.
    */
    onMapLoad: function() {
    },

    /**
    * Called by the map control when the map view changes.
    */
    onMapViewChange: function() {
        
        // filter the markers if map view was not triggered from the locate building event
        if (this.mapViewChangeOnLocateBuilding === false) {
            var assetIds = this.mapControl.getMarkerIdsInMapView('analysisValuesDataSource');

            // Schedule a trigger to update the Asset Map. This cancels any previous scheduled trigger,
            // so that the map does not update multiple times while the user is zooming or panning.
            var controller = this;
            this.selectBuildingsTriggerTask.delay(1000, function() {
                controller.trigger('app:rplm:sfa:selectBuildings', assetIds);
            });
        }
        // reset the map view change flag
        this.mapViewChangeOnLocateBuilding = false;   

    },

    onMarkerClick: function(assetId, feature){
    
        // select the marker
        this.mapControl.clearSelectedMarkers();
        this.mapControl.selectMarkersByAssetIds([assetId], 'analysisValuesDataSource');

        // display the marker info window       
        this.displayMarkerInfoWindow(assetId);

    },

    onMapClick: function(){
        this.mapControl.clearSelectedMarkers();
        this.mapControl.hideMarkerInfoWindow();
    },

    onMarkerMouseOver: function(assetId) {
        this.trigger('app:rplm:sfa:highlightBuildingRow', assetId);
    },

    onMarkerMouseOut: function() {
        this.trigger('app:rplm:sfa:clearBuildingRows');
    },

    onToggleBasemap: function() {
        if (this.activeBasemap === 'World Street Map') {
            this.mapControl.switchBasemapLayer(View.getLocalizedString('World Imagery with Labels'));
            this.activeBasemap = 'World Imagery with Labels'; 
        } else if (this.activeBasemap === 'World Imagery with Labels') { 
            this.mapControl.switchBasemapLayer(View.getLocalizedString('World Light Gray Canvas'));
            this.activeBasemap = 'World Light Gray Canvas'; 
        } else if ( this.activeBasemap === 'World Light Gray Canvas') {
            this.mapControl.switchBasemapLayer(View.getLocalizedString('World Street Map'));
            this.activeBasemap = 'World Street Map'; 
        }
    },

    onShowMarkerLegend: function() {
        this.mapControl.showMarkerLegend();
    },

    /**
     * Called when the console loads the default analysis, or when the user selects an analysis.
     * Highlights analysis groups on the map.
     * @param analysis A record from the finanal_analyses table.
     */
	onSelectAnalysis: function(analysis) {
        this.analysis = analysis;
        this.selectedAnalysisCode = analysis.getValue('finanal_analyses.analysis_code');
        this.selectedAnalysisSuperGroup = analysis.getValue('finanal_analyses.analysis_super_group');
        this.analysisFields = FinancialAnalysisConfiguration.getAnalysisFields(this.selectedAnalysisCode, 'Asset Map');

        this.refreshAssetMap();
        this.mapControl.showMarkerLegend();

        // TODO: this code has to run after the initial refresh above - how can we move it to the master console controller?
        var mapName = analysis.getValue('finanal_analyses.map_name');
        if (mapName === 'Asset') {
            if (this.mapTabs.getSelectedTabName() !== 'assetMap') {
                this.mapTabs.selectTab('assetMap');
            }
            if (this.scorecardTabs.getSelectedTabName() !== 'asset') {
                this.scorecardTabs.selectTab('asset');
            }
        }
  	},

    /**
     * Displays analysisFields specified by the capital and expense matrix drill-down.
     * @param boxId The finanal_matrix_flds.box_id value.
     */
    selectAnalysisFields: function(boxId, selected) {
        if (selected) {
            this.analysisFields = FinancialAnalysisConfiguration.getAnalysisFieldsForBox(boxId, 'Asset Map');
        } else {
            this.analysisFields = FinancialAnalysisConfiguration.getAnalysisFields(this.selectedAnalysisCode, 'Asset Map');
        }
        this.refreshAssetMap();
    },

    /**
     * Sets the displayed fiscal year in the Asset Scorecard.
     * @param fiscalYear The fiscal year.
     */
    onSelectFiscalYear: function(fiscalYear) {
        this.restriction.removeClause('finanal_sum.fiscal_year');
        this.restriction.addClause('finanal_sum.fiscal_year', fiscalYear, '=');

        this.refreshAssetMap();
    },

    /**
     * Restricts the Asset Map to buildings visible in the Asset Scorecard.
     */
    onFilterByScorecard: function(option) {
        this.filterByScorecard = option;

        this.restriction.removeClause('finanal_sum.bl_id');
        if (this.filterByScorecard && this.scorecardBuildings && this.scorecardBuildings.length > 0) {
            this.restriction.addClause('finanal_sum.bl_id', this.scorecardBuildings, 'IN');
        }

        if (this.filterByScorecard) {
            this.refreshAssetMap();
        }
    },

    /**
     * Sets the buildings displayed in Asset Map.
     * @param scorecardBuildings
     */
    onMapBuildings: function(scorecardBuildings) {
        this.scorecardBuildings = scorecardBuildings;

        if (this.filterByScorecard && this.scorecardBuildings && this.scorecardBuildings.length > 0) {
            this.restriction.removeClause('finanal_sum.bl_id');
            this.restriction.addClause('finanal_sum.bl_id', this.scorecardBuildings, 'IN');
            this.refreshAssetMap();
        }
    },

    /**
     * Locates specified building on the map.
     * @param bl_id
     */
    onLocateBuilding: function(bl_id) {
        // select the marker
        this.mapControl.selectMarkersByAssetIds([bl_id], 'analysisValuesDataSource');
        
        // check zoom level of map
        var zoomLevel = this.mapControl.getZoom();
        // pan-zoom threshold
        var zoomToBuildingThreshold = 15;

        // set the mapViewChangeOnLocateBuilding flag
        this.mapViewChangeOnLocateBuilding = true;

        if (zoomLevel < zoomToBuildingThreshold) {
            //zoom to marker 
            this.mapControl.zoomToMarker(bl_id, 'analysisValuesDataSource', zoomToBuildingThreshold);   
        } else {
            //pan to the marker
            this.mapControl.panToMarker(bl_id, 'analysisValuesDataSource');            
        }
        
        // display marker info window
        this.displayMarkerInfoWindow(bl_id);
    },

    /**
     * Highlights specified building on the map, if it is visible.
     * @param bl_id
     */
    onHighlightBuilding: function(bl_id) {
        this.mapControl.selectMarkersByAssetIds([bl_id], 'analysisValuesDataSource');
    },

   /**
     * Clears building highlights from the map.
     * 
     */
    onClearBuilding: function() {
        this.mapControl.clearSelectedMarkers();
    },

    /**
     * Refreshes the Asset Scorecard.
     */
    refreshAssetMap: function() {

        // clean up
        this.mapControl.hideMarkerInfoWindow();
        this.mapControl.clearSelectedMarkers();
        this.firstFieldName = null;
        this.firstTableName = null;
        this.secondFieldName = null;
        this.secondTableName = null;

        // create the marker properties
        var markerProperties = this.createMarkerProperties(this.analysisFields);

        // apply parameters and restrictions to the marker data source
        var dataSource = this.analysisValuesDataSource;
        dataSource.addParameter('analysisSuperGroup', this.selectedAnalysisSuperGroup);
        dataSource.addParameter('restrictToAnalysisGroup', false);
        dataSource.restriction = this.restriction;

        // create the marker definition
        var dataSourceName = 'analysisValuesDataSource';
        var keyFields = ['finanal_sum.bl_id'];
        var geometryFields = ['bl.lon', 'bl.lat'];
        var titleField = 'bl.name';
        var contentFields = ['finanal_sum.bl_id', 'bl.name', 
            this.firstTableName + '.' + this.firstFieldName, this.secondTableName + '.' + this.secondFieldName];
      
        this.mapControl.createMarkers(
            dataSourceName,
            keyFields,
            geometryFields,
            titleField,
            contentFields,
            markerProperties
        );

        // display the markers
        this.mapControl.showMarkers(dataSourceName, this.restriction);
    },

    createMarkerProperties: function(analysisFields){
    
        var firstMarkerRenderer = 'simple';
        var markerCount = 0;

        // create default marker properties
        var markerProperties = {
            //default
            renderer: 'simple',
            radius: 7,
            fillColor: '#2166AC',
            fillOpacity: 0.90,
            stroke: true,
            strokeColor: '#fff',
            strokeWeight: 2.0,
            opacity: 0.9,
            usePopup: false
        };  

        // create marker properties for up to 2 metrics
        for (var i=0; i<analysisFields.length && markerCount<2; i++){
            
            // get the analysis field table and field name
            var analysisField = analysisFields[i];
            var tableName = analysisField.getValue('finanal_analyses_flds.analysis_table');
            var fieldName = analysisField.getValue('finanal_analyses_flds.analysis_field');

            // create the class breaks for the metric
            var classBreaksAndLegendLabels = this.createMarkerClassBreaksAndLegendLabels(fieldName);
           
            // get the metric display format
            var metricDisplayFormat = FinancialAnalysisConfiguration.getMetricDisplayFormat(fieldName); 

            if (classBreaksAndLegendLabels.classBreaks.length > 0) {
                // set the renderer/marker properties based on the metric display format
                if (metricDisplayFormat === 'P' && firstMarkerRenderer !== 'graduated-class-breaks') {
                    markerCount += 1;
                    if (markerCount === 1) {
                        firstMarkerRenderer = 'graduated-class-breaks';
                        markerProperties.renderer = 'graduated-class-breaks';
                        this.firstFieldName = fieldName;
                        this.firstTableName = tableName;
                    } else if (markerCount === 2) {
                        if (markerProperties.renderer === 'simple') {
                            markerProperties.renderer = 'graduated-class-breaks';
                        } else if (markerProperties.renderer ===  'thematic-class-breaks') {
                            markerProperties.renderer = 'thematic-graduated-class-breaks';
                        }
                        this.secondFieldName = fieldName;
                        this.secondTableName = tableName;
                    }
                    markerProperties.radius = 5;
                    markerProperties.graduatedField = tableName + '.' + fieldName;
                    markerProperties.graduatedClassBreaks = classBreaksAndLegendLabels.classBreaks;
                    markerProperties.graduatedLegendLabels = classBreaksAndLegendLabels.legendLabels;
                    markerProperties.radiusIncrement = 3;

                } else if ((metricDisplayFormat === 'B' || metricDisplayFormat === 'N') && firstMarkerRenderer !== 'thematic-class-breaks') {
                    markerCount += 1;
                    if (markerCount === 1) {
                        firstMarkerRenderer = 'thematic-class-breaks';
                        markerProperties.renderer = 'thematic-class-breaks';
                        this.firstFieldName = fieldName;
                        this.firstTableName = tableName;
                    } else if (markerCount === 2) {
                        if (markerProperties.renderer === 'simple') {
                            markerProperties.renderer = 'thematic-class-breaks';
                        } else if (markerProperties.renderer === 'graduated-class-breaks') {
                            markerProperties.renderer = 'thematic-graduated-class-breaks'
                        }
                        this.secondFieldName = fieldName;
                        this.secondTableName = tableName;
                    }
                    markerProperties.thematicField = tableName + '.' + fieldName;
                    markerProperties.thematicClassBreaks = classBreaksAndLegendLabels.classBreaks;
                    markerProperties.thematicLegendLabels = classBreaksAndLegendLabels.legendLabels;
                }

                var metric = FinancialAnalysisConfiguration.getMetricDefinition(fieldName);
                if (metric) {
                    var reportTrendDir = metric.getValue('afm_metric_definitions.report_trend_dir');
                    var colorBrewerClass = 'AbSet1';
                    if (reportTrendDir === '0') {
                        colorBrewerClass = 'AbStopLight0';
                    } else if (reportTrendDir === '1') {
                        colorBrewerClass = 'AbStopLight1';
                    } else if (reportTrendDir === '2') {
                        colorBrewerClass = 'AbStopLight2'
                    }
                    markerProperties.colorBrewerClass = colorBrewerClass;
                }

            } else {
                markerCount += 1;
                if (markerCount === 1) {
                    this.firstFieldName = fieldName;
                    this.firstTableName = tableName;
                } else if (markerCount === 2) {
                    this.secondFieldName = fieldName;
                    this.secondTableName = tableName;
                }
                
            }


        }

        return markerProperties;
    },

    createMarkerClassBreaksAndLegendLabels: function(fieldName){
        var result = {
            classBreaks: [],
            legendLabels: []
        };

        var addClassBreak = function(classBreak) {
            result.classBreaks.push(Number(classBreak));
        };

        var addLegendLabelLessThan = function(classBreak) {
            result.legendLabels.push(' < ' + FinancialAnalysisConfiguration.formatMetricValue(fieldName, classBreak));
        }

        var addLegendLabelMoreThan = function(classBreak) {
            result.legendLabels.push(' > ' + FinancialAnalysisConfiguration.formatMetricValue(fieldName, classBreak));
        }

        var addLegendLabelBetween = function(classBreak, nextClassBreak) {
            result.legendLabels.push(
                FinancialAnalysisConfiguration.formatMetricValue(fieldName, classBreak) + ' - ' +
                FinancialAnalysisConfiguration.formatMetricValue(fieldName, nextClassBreak));
        }

        var metric = FinancialAnalysisConfiguration.getMetricDefinition(fieldName);
        if (metric) {
            var reportTrendDir = metric.getValue('afm_metric_definitions.report_trend_dir');
            var reportLimitHighCritical = metric.getValue('afm_metric_definitions.report_limit_high_crit');
            var reportLimitHighWarning = metric.getValue('afm_metric_definitions.report_limit_high_warn');
            var reportLimitLowCritical = metric.getValue('afm_metric_definitions.report_limit_low_crit');
            var reportLimitLowWarning = metric.getValue('afm_metric_definitions.report_limit_low_warn');
            var reportLimitBenchmark = metric.getValue('afm_metric_definitions.report_benchmark_value');

            if (reportTrendDir === '0') {
                addClassBreak(reportLimitHighCritical);
                addClassBreak(reportLimitHighWarning);
                addLegendLabelLessThan(reportLimitHighWarning);
                addLegendLabelBetween(reportLimitHighWarning, reportLimitHighCritical);
                addLegendLabelMoreThan(reportLimitHighCritical);
            } else if (reportTrendDir === '1') {
                addClassBreak(reportLimitLowCritical);
                addClassBreak(reportLimitLowWarning);
                addLegendLabelLessThan(reportLimitLowCritical);
                addLegendLabelBetween(reportLimitLowCritical, reportLimitLowWarning);
                addLegendLabelMoreThan(reportLimitLowWarning);
            } else if (reportTrendDir === '2') {
                addClassBreak(reportLimitHighCritical);
                addClassBreak(reportLimitHighWarning);
                addClassBreak(reportLimitLowCritical);
                addClassBreak(reportLimitLowWarning);
                addLegendLabelLessThan(reportLimitLowCritical);
                addLegendLabelBetween(reportLimitLowCritical, reportLimitLowWarning);
                addLegendLabelBetween(reportLimitLowWarning, reportLimitHighWarning);
                addLegendLabelBetween(reportLimitHighWarning, reportLimitHighCritical);
                addLegendLabelMoreThan(reportLimitHighCritical);
            } else if (reportTrendDir === '3') {

            }
            result.classBreaks.sort(function(a,b){
                return a - b;
            });
            //TODO  what happens if there are no breaks?
        }

        return result;
    },

    displayMarkerInfoWindow: function(bl_id){

        // display the info window       
        var restriction = new Ab.view.Restriction();
        restriction.addClause('finanal_sum.bl_id', bl_id, '=');
        var dataRecords = this.mapControl.mapClass._getDataSourceRecords('analysisValuesDataSource', restriction);
       
        var title = dataRecords[0].getValue('bl.name');
        var bldgId = dataRecords[0].getValue('finanal_sum.bl_id');
        var bldgPhoto = dataRecords[0].getValue('bl.bldg_photo');
        var bldgKeys = {'bl_id': bldgId};

        var firstAnalysisValue = dataRecords[0].getValue(this.firstTableName + '.' + this.firstFieldName);
        var firstAnalysisTitle = this.mapControl.mapClass._getFieldTitle('analysisValuesDataSource', this.firstTableName + '.' + this.firstFieldName);
        firstAnalysisValue = FinancialAnalysisConfiguration.formatMetricValue(this.firstFieldName, firstAnalysisValue);
        var secondAnalysisValue = null;
        var secondAnalysisTitle = null;
        if (this.secondFieldName !== null) {
            var secondAnalysisValue = dataRecords[0].getValue(this.secondTableName + '.' + this.secondFieldName);
            var secondAnalysisTitle = this.mapControl.mapClass._getFieldTitle('analysisValuesDataSource', this.secondTableName + '.' + this.secondFieldName);
            secondAnalysisValue = FinancialAnalysisConfiguration.formatMetricValue(this.secondFieldName, secondAnalysisValue);
        }

        var htmlContent = this.createHtmlContentForMarkerInfoWindow(title, bldgId, firstAnalysisTitle, firstAnalysisValue, secondAnalysisTitle, secondAnalysisValue);
        this.mapControl.showMarkerInfoWindow(htmlContent);        

        if (bldgPhoto) {
            // show building image
            DocumentService.getImage(bldgKeys, "bl", 'bldg_photo', '1', true, {
                 callback: function(image) {
                     // update the info window image
                     var requestUrl = View.originalRequestURL;
                     var host = requestUrl.indexOf("/archibus/");
                     var imageUrl = requestUrl.slice(0,host) + image;

                     var photoEl = document.getElementById('markerInfoWindowPhoto');
                     photoEl.style.backgroundImage = "url('" + imageUrl + "')";
                 },
                 errorHandler: function(m, e) {
                     Ab.view.View.showException(e);
                 }
            });
        } else {
            // display default image
            var requestUrl = View.originalRequestURL;
            var host = requestUrl.indexOf("/archibus/");
            var imageUrl = requestUrl.slice(0,host) + '/archibus/schema/bldg-photo-25x25.jpg';
        }
    },

    /**
     * Creates the info window when the user clocks on a building marker, or when the user uses the Location action in Asset Scorecard.
     * @param title
     * @param blId
     * @param firstFieldTitle
     * @param firstFieldValue
     * @returns {string}
     */
    createHtmlContentForMarkerInfoWindow: function(title, blId, firstFieldTitle, firstFieldValue, secondFieldTitle, secondFieldValue ) {
        var htmlContent = "<table width='100%'>";
        htmlContent += "<tr><td rowspan='4' class='leaflet-map-marker-infowindow-photo' id='markerInfoWindowPhoto'></td><td colspan='2' class='leaflet-map-marker-infowindow-title'>" + title  + "</td></tr>";
        htmlContent += "<tr><td class='leaflet-map-marker-infowindow-text-title'>" + getMessage('building') + "</td><td class='leaflet-map-marker-infowindow-text'>" + blId + "</td></tr>";
        if (firstFieldTitle && firstFieldValue) {
            htmlContent += "<tr><td class='leaflet-map-marker-infowindow-text-title'>" + firstFieldTitle + " </td>";
            htmlContent += "<td class='leaflet-map-marker-infowindow-text'>" + firstFieldValue + "</td></tr>";
        } else {
            htmlContent += "<tr><td class='leaflet-map-marker-infowindow-text'>" + "</td><td class='leaflet-map-marker-infowindow-text'>" + "</td></tr>";
        }
        if (secondFieldTitle && secondFieldValue) {
            htmlContent += "<tr><td class='leaflet-map-marker-infowindow-text-title'>" + secondFieldTitle + " </td>";
            htmlContent += "<td class='leaflet-map-marker-infowindow-text'>" + secondFieldValue + "</td></tr>";
        } 
        htmlContent += "</table>";

        jQuery('.leaflet-map-marker-infowindow').data('buildingId', blId);

        return htmlContent;
    },

    /**
     * Called when the user clicks on the marker info window.
     */
    onInfoWindowClick: function() {
        var buildingId = jQuery('.leaflet-map-marker-infowindow').data('buildingId');
        View.openDialog('ab-profile-building.axvw?bl_id=' + buildingId, null, false, {
            closeButton: true,
            width: 1050,
            height: 650,
            modal: true,
            title: getMessage('buildingProfileTitle')
        });

    },

    /**
     * Updates the panel after the user changes the metrics.
     */
    afterSelectMetrics: function(panelName) {
        if (panelName == 'Asset Map') {
            this.onSelectAnalysis(this.analysis);
        }
    }
})

