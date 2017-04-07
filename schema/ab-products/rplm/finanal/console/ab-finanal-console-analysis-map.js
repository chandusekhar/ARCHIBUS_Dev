
View.createController('financialAnalysisConsoleAnalysisMap', {

    //Ab.arcgis.MapExtensions
    mapControl: null,

    // set to true when the map is loaded and ready
    mapLoaded: false,

    // set to true when an analysis is selected
    analysisSelected: false,

    // the records for analysis
    analysisRecords: null,

    // the selected analysis name (analysis super group)
    selectedAnalysisSuperGroup: null,

    // the selected analysis group
    selectedAnalysisGroup: null,

    // the list of selected countries
    selectedCountries: null,

    // the selection mode: 'group' or 'country'
    selectionMode: '',

    afterViewLoad: function() {
        this.selectionMode = 'group';
        this.selectedCountries = {};

        try {
            /*
             * Leaflet map
             */
            var configObject = new Ab.view.ConfigObject();
            configObject.mapCenter = [35, -6]
            configObject.mapZoom = 2
            configObject.mapImplementation = 'Esri';
            configObject.basemap = View.getLocalizedString('World Light Gray Canvas');
            var mapController = this;
            configObject.onMapLoad = function(){
                mapController.onMapLoad();
            }

            configObject.featureLayerList = [
                // countries
                {
                    name: 'ctry',
                    url: '//services3.arcgis.com/lq5SzPW1rLR0h1u9/arcgis/rest/services/ne_countries_110m/FeatureServer/0',
                    objectIdField: 'OBJECTID',
                    outFields: ['iso_a3','name','OBJECTID'],
                    toolTipField: 'name',
                    assetIdField: 'iso_a3'//,
                    //assetTypeField: 'ab_asset_type'
                }
            ];

            // create map
            this.mapControl = new Ab.leaflet.MapExtensions('geoMapPanel', 'geoMapDiv', configObject);

            // create map event listeners
            this.mapControl.mapClass.addEventListener('featureClick', this.onFeatureClick, this);
            this.mapControl.mapClass.addEventListener('featureMouseOver', this.onFeatureMouseOver, this);
            this.mapControl.mapClass.addEventListener('featureMouseOut', this.onFeatureMouseOut, this);

            // create controller listeners
            this.on('app:rplm:sfa:selectAnalysis', this.onSelectAnalysis);
            this.on('app:rplm:sfa:changeSelectionMode', this.onChangeSelectionMode);
            this.on('app:rplm:sfa:highlightMapAnalysisGroup', this.highlightAnalysisGroup);
            this.on('app:rplm:sfa:clearMapAnalysisGroupHighlight', this.clearAnalysisGroupHighlight);

        } catch (e) {
            View.log(e);
        }
    },

    /**
    * Called by the map control when the map is loaded and ready for action.
    */
    onMapLoad: function() {
        this.mapLoaded = true;

        if (this.analysisSelected===true){
            this.mapAnalysisGroups(this.analysisRecords);
        }
    },

    /*
    *  Called by the map control when a feature on the map is clicked.
    *  @param assetId The asset id.
    *  @param assetType The asset type.
    *  @param assetGraphic The asset graphic.
    */
    onFeatureClick: function(assetId, assetType, assetGraphic){
        this.mapControl.clearSelectedFeatures();

        if (this.selectionMode === 'country') {
            // country selection clears the analysis group selection
            this.selectedAnalysisGroup = null;

            // add/remove the country to/from the list of selected countries
            if (assetId in this.selectedCountries) {
                delete this.selectedCountries[assetId];
            } else {
                this.selectedCountries[assetId] = true;
            }

            // select countries on the map
            this.mapControl.selectFeaturesByAssetIds(_.keys(this.selectedCountries));

            // send an event to the scorecard
            this.trigger('app:rplm:sfa:selectCountries', _.keys(this.selectedCountries));

        } else {
            // analysis group selection clears the country selection
            this.selectedCountries = {};

            // get the analysis group for this country
            var selectedAnalysisGroup = FinancialAnalysisConfiguration.getAnalysisGroupForCountry(this.selectedAnalysisSuperGroup, assetId);
            if (selectedAnalysisGroup !== this.selectedAnalysisGroup) {
                this.selectedAnalysisGroup = selectedAnalysisGroup;
                if (selectedAnalysisGroup) {
                    var analysisGroup = selectedAnalysisGroup.getValue('finanal_loc_group.analysis_group');

                    // get all countries in the analysis group
                    var countries = FinancialAnalysisConfiguration.getCountriesForAnalysisGroup(this.selectedAnalysisSuperGroup, analysisGroup);

                    // select countries on the map
                    this.mapControl.selectFeaturesByAssetIds(countries);

                    // send an event to the scorecard
                    this.trigger('app:rplm:sfa:selectAnalysisGroup', analysisGroup);
                }
            } else {
                this.selectedAnalysisGroup = null;
            }
        }
    },
    
    /*
    *  Called by the map control when a feature on the map moused over.
    *  @param assetId The asset id.
    *  @param assetType The asset type.
    *  @param assetGraphic The asset graphic.
    */
    onFeatureMouseOver: function(assetId, assetType, assetGraphic) {
        var analysisGroup = FinancialAnalysisConfiguration.getAnalysisGroupForCountry(this.selectedAnalysisSuperGroup, assetId);
        if (analysisGroup) {
            this.trigger('app:rplm:sfa:highlightAnalysisGroup', analysisGroup.getValue('finanal_loc_group.analysis_group'));
        }
    },

    /*
    *  Called by the map control when a feature on the map is moused out.
    */
    onFeatureMouseOut: function(){
        this.trigger('app:rplm:sfa:unhighlightAnalysisGroup');
    },

    /**
     * Called when the console loads the default analysis, or when the user selects an analysis.
     * Highlights analysis groups on the map.
     * @param analysis A record from the finanal_analyses table.
     */
    onSelectAnalysis: function(analysis) {
        this.selectedAnalysisSuperGroup = analysis.getValue('finanal_analyses.analysis_super_group');

        var analysisGroups = FinancialAnalysisConfiguration.getAnalysisGroups(
            this.selectedAnalysisSuperGroup);

        if (this.mapLoaded===true) {
            this.mapAnalysisGroups(analysisGroups);
        } else {
            this.analysisSelected = true;
            this.analysisRecords = analysisGroups;
        }       

    },

    onChangeSelectionMode: function(selectionMode) {
        this.selectionMode = selectionMode;
    },

    /*
    *  Map the analysis groups.
    *  Highlights the regions for the analysis on the map.  
    */
    mapAnalysisGroups: function(analysisRecords){
        if (!analysisRecords || analysisRecords.length === 0) {
            return;
        }

        this.analysisRecords = null;
        
        var featurePropertiesId = 'ctry';
        var dataSourceType = 'WC_DATARECORDS';
        var keyField = 'finanal_loc_group.ctry_id';
        var titleField = 'ctry.name';
        var contentFields = ['finanal_loc_group.ctry_id','finanal_loc_group.analysis_group'];
        
        // get the unique values for the analysis group
        var thematicUniqueValues = this.getDistinctValuesFromDataRecords(analysisRecords, 'finanal_loc_group.analysis_group');
        
        // get asset ids from data source
        var assetIds = this.getAssetIdsFromDataRecords(analysisRecords, 'finanal_loc_group.ctry_id');
        // create the where clause for the feature layer
        var featureWhereClause = "1=1";
        if (assetIds.length > 0) {
            featureWhereClause = "iso_a3 IN (" + assetIds + ")";
        }

        // create the feature options
        var featureOptions = {
            //optional
            fillColor: '#e41a1c',
            fillOpacity: 0.9,
            stroke: true,
            strokeColor: '#fff',
            strokeWeight: 2.0,
            strokeOpacity: 1.0,
            // required for thematic markers
            renderer: 'thematic-unique-values',
            thematicField: 'finanal_loc_group.analysis_group',
            thematicUniqueValues: thematicUniqueValues,
            colorBrewerClass: 'AbSet1',
            whereClause: featureWhereClause
        };

        // create the feature properties
        this.mapControl.createFeatureProperties( 
          featurePropertiesId,
          dataSourceType,
          analysisRecords,
          keyField,
          titleField,
          contentFields,
          featureOptions
        );
      
        // display the countries
        this.mapControl.showFeatures('ctry', 'ctry');
    },

    highlightAnalysisGroup: function(analysisGroup){
        
        // get the list of countries
        var countries = FinancialAnalysisConfiguration.getCountriesForAnalysisGroup(this.selectedAnalysisSuperGroup, analysisGroup);

        //hightlight the countries
        this.mapControl.highlightFeaturesByAssetIds(countries);

    },

    clearAnalysisGroupHighlight: function(){
        this.mapControl.clearHighlightedFeatures();
    },

    /*
    *  Gets the asset ids from an array of data records.
    *  @param dataRecords The data records.
    *  @param keyField The asset id field for the records.
    *  return A string of asset ids for the feature layer where clause.
    */
    getAssetIdsFromDataRecords: function(dataRecords, keyField){
        var assetIdsString = '';

        for (var i=0; i<dataRecords.length; i++) {
          
          keyValue = dataRecords[i].values[keyField];
          if (assetIdsString.length === 0 && keyValue !== '') {
            assetIdsString = "'" + keyValue + "'";
          } else if (assetIdsString.length > 0 && keyValue !== '') {
            assetIdsString += ",'" + keyValue + "'";
          }
        } 

        return assetIdsString;
    },

    /*
    *  Gets the distinct values for a field from an array of data records.
    *  @param dataRecords The data records.
    *  @param fieldName The field for the distinct values.
    *  return A list of unique values.
    */
    getDistinctValuesFromDataRecords: function(dataRecords, fieldName){
        var valuesArray = [];

        for (var i=0; i<dataRecords.length; i++) {
          valuesArray.push(dataRecords[i].values[fieldName]);
        }
        var uniqueValues = _.uniq(valuesArray);
    
        return uniqueValues;
    } 

});
