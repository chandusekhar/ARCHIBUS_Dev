View.createController('mapController', {
  
  //the Ab.arcgis.ArcGISMap
  mapControl: null,
  
  afterViewLoad: function(){
      var configObject = new Ab.view.ConfigObject();
      this.mapControl = new Ab.arcgis.MapExtensions('mapPanel', 'mapDiv', configObject);
  },
  
  afterInitialDataFetch: function() {
    var reportTargetPanel = document.getElementById("mapPanel");            
    reportTargetPanel.className = 'claro';
  },

  onMapLoaded: function() {
    //console.log('MapController -> onMapLoaded...');
    
    // load the reference layer
    this.mapControl.switchReferenceLayer('Land Base', null, this.onReferenceLayerLoaded);
    
    // load the building feature layer
    this.loadBuildingsFeatureLayer();
  },

  onReferenceLayerLoaded: function() {
    //console.log('MapController -> onReferenceLayerLoaded...');

  },

  loadBuildingsFeatureLayer: function(){
    
    //console.log('MapController -> loadBuildingsFeatureLayer...');

    var layerWhereClause = '1=1';
    var thematicColors = [];
    var thematicUniqueValues = '';

    // create the layer options
    var layerOptions = {
        renderer: 'simple',
        fillColor: [31,121,180],
        thematicDataSource: 'ARCGIS',
        //dataSource: 'blGridDs',
        //dataSourceParameters: parameters,
        //dataSourceRestriction: '1=1',
        //legendDataSuffix: '%',
        //keyField: 'bl_id',
        //thematicField: 'bl.use1',
        //thematicUniqueValues: thematicUniqueValues,
        //thematicColors: thematicColors,
        whereClause: layerWhereClause //this will be used against the feature service
        //whereClause: "1=1" 
    };

    // display the feature layer
    this.mapControl.switchFeatureLayer('Buildings', layerOptions, null);

  },

  onFeatureLayerInit: function(){
    //console.log('MapController -> onFeatureLayerInit...');
    
  },

  onFeatureLayerLoaded: function(){
    //console.log('MapController -> onFeatureLayerLoaded...');
  },

  onFeatureLayerClick: function(assetId, assetType){
    //console.log('MapController -> onFeatureLayerClick...');
    //console.log('...Asset id: ' + assetId);

    // create where clause and highlight the selected feature
    var whereClause = "bl_id = '" + assetId + "'"; 
    this.mapControl.selectFeatures( 'Buildings', whereClause );


    // create restriction and show the building form
    var restriction = new Ab.view.Restriction();
    restriction.addClause('bl.bl_id', assetId, '=');

    var offsetX = $('blGrid').offsetWidth + $('mapDiv').offsetWidth - 425;
    var offsetY  = $('mapDiv').offsetHeight - 325;

    this.blForm.refresh(restriction);
    this.blForm.showInWindow({ 
        width: 400, height: 300,
        x: offsetX, y: offsetY, 
        closeButton: false });
  },

  onSaveBuildingForm: function() {

    // save and close the building form
    this.blForm.save();
    View.panels.get('blForm').closeWindow();

    // refresh the building grid
    this.blGrid.refresh();

    // clear the feature selection
    this.mapControl.clearSelectedFeatures();

    // we could update the gis data by uncommenting the following 2 lines
    // the results wouldnt be 'visible' on the map however, since the 
    // buildings are not classified and we are using a tiled map service

    // get the gis object id
    //var geo_objectid = this.blForm.getFieldValue('bl.geo_objectid');

    // call the workflow rule with the gis object id to update the gis data
    //var result = Workflow.callMethod('AbCommonResources-ArcgisExtensionsService-updateArcgisBuildingFeatureDataByObjectId', geo_objectid);


  },

  blGrid_onShowBuildings: function(rows) {   
      
    // get the asset ids from the rows 
    var assetIds = this.getAssetIdsFromSelection();
    
    // construct where clause 
    if ( assetIds !== null) {
      var whereClause = 'bl_id in (' + assetIds + ')';
    }
    //console.log( whereClause );

    // select/highlight the features
    this.mapControl.selectFeatures('Buildings', whereClause);
    
  },

  blGrid_onClearBuildings: function() {
    // clear the features from the map
    this.mapControl.clearSelectedFeatures();

    // clear the selection from the grid
    this.blGrid.setAllRowsUnselected();
  },

  getAssetIdsFromSelection: function() {

    var assetIds = null;
  
    var assetIdsObject = this.blGrid.getPrimaryKeysForSelectedRows();
    for (i=0; i<assetIdsObject.length; i++) {
      var assetIdObject = assetIdsObject[i];
      if (i==0){
        assetIds = "'" + assetIdsObject[i]['bl.bl_id'] + "'";
      } else {
        assetIds += ",'" + assetIdsObject[i]['bl.bl_id'] + "'";
      }
    }

    return assetIds;
  }


});

function mapLoadedCallback() {
    //console.log('MapLoadedCallback...');
    var mapController = View.controllers.get('mapController');
    mapController.onMapLoaded();
}

function referenceLayerLoadedCallback() {
    //console.log('ReferenceLayerLoadedCallback...');
    var mapController = View.controllers.get('mapController');
    mapController.onReferenceLayerLoaded();
}

function featureLayerClickCallback(featureId, featureType) {
    //console.log('FeatureLayerClickCallback...');
    var mapController = View.controllers.get('mapController');
    mapController.onFeatureLayerClick(featureId, featureType);
}

function onSaveBuildingForm(){
  var mapController = View.controllers.get('mapController');
  mapController.onSaveBuildingForm();
}

function onCloseBuildingForm(){
  var mapController = View.controllers.get('mapController');
  mapController.mapControl.clearSelectedFeatures();
}