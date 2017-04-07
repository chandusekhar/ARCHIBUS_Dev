View.createController('mapController', {
  
  //the Ab.arcgis.ArcGISMap
  mapControl: null,
  
  afterViewLoad: function(){

      // wire up legend menu
      var legendObj = Ext.get('showLegend');
      legendObj.on('click', this.showLegend, this, null);

      // create map
      var configObject = new Ab.view.ConfigObject();
      this.mapControl = new Ab.arcgis.MapExtensions('mapPanel', 'mapDiv', configObject);
  },
  
  afterInitialDataFetch: function() {
    var reportTargetPanel = document.getElementById("mapPanel");            
    reportTargetPanel.className = 'claro';
  },

  onMapLoaded: function() {
    //console.log('MapController -> onMapLoaded...');

    // set the view
    this.mapControl.setMapCenterAndZoom(-10, 50, 2); 
    
    // load the reference layer
    //this.mapControl.switchReferenceLayer('Countries', null, referenceLayerLoadedCallback);

    // load the countries features
    this.loadCountriesFeatureLayer();

  },

  onReferenceLayerLoaded: function(){

  },

  loadCountriesFeatureLayer: function() {
    //console.log('MapController -> loadCountriesFeatureLayer...');

    //TODO move this to the core control
    var thematicUniqueValues = this.mapControl._getDistinctFieldValues('ctry.geo_region_id', '1=1');
    
    var thematicColors = this.mapControl.colorbrewerToRGB(colorbrewer.Set1[3]);
    // var thematicColors = [
    //        [55,126,184],  // blue
    //        [77,175,74],   // greeen
    //        [228,26,28]    // red
    // ];

    // get asset ids from data source
    var assetIds = this.getAllAssetIdsFromDataSource('ctryDs');
    var whereClause = "iso_a3 IN (" + assetIds + ")";

    // create the layer options
    var layerOptions = {
        renderer: 'thematic-unique-values',
        thematicDataSource: 'WC_DATASOURCE',
        dataSource: 'ctryDs',
        //dataSourceParameters: parameters,
        dataSourceRestriction: '1=1',
        //legendDataSuffix: '%',
        keyField: 'ctry.ctry_id',
        thematicField: 'ctry.geo_region_id',
        thematicUniqueValues: thematicUniqueValues,
        thematicColors: thematicColors,
        whereClause: whereClause //this will be used against the feature service
        //whereClause: "iso_a3 IN ('ARG','AUS','BEL','BRA','CAN','CHE','CHN','DEU','DNK','ESP','FRA','GBR','GRC','IND','ITA','JPN','KOR','MEX','MYS','NGA','NLD','POL','ROU','SAU','SGP','USA','ZAF')"  
        //whereClause: "1=1" 
    };

    // display the feature layer
    this.mapControl.switchFeatureLayer('Countries', layerOptions, null);

  },

  onFeatureLayerInit: function(){
    //console.log('MapController -> onFeatureLayerInit...');
    
  },

  onFeatureLayerLoaded: function(){
    //console.log('MapController -> onFeatureLayerLoaded...');

  },

  onFeatureLayerClick: function(assetId, assetType, assetGraphic){
    //console.log('MapController -> onFeatureLayerClick...');
    //console.log('...Asset id: ' + assetId);

    // select the feature 
    var  objectId = assetGraphic.attributes['objectid'];
    this.mapControl.selectFeaturesByObjectIds([objectId]);

    // create the info window content
    var htmlContent = this.createHtmlContentForInfoWindow(assetGraphic);

    // show the info window
    this.mapControl.showFeatureLayerInfoWindow(htmlContent);

  },

  onFeatureLayerMouseOver: function(assetId, assetType, assetGraphic){
    //console.log('MapController -> onFeatureLayerMouseOver...');
    //console.log('...Asset id: ' + assetId);
  },

  onFeatureLayerMouseOut: function(){
    //console.log('MapController -> onFeatureLayerMouseOut...');
  },


  showLegend: function () {
      this.mapControl.showFeatureLayerLegend();
  },

  createHtmlContentForInfoWindow: function(assetGraphic) {
    var attributes = assetGraphic.attributes;

    var htmlContent = "<table width='100%'>";
    htmlContent += "<tr><td colspan='2' class='featureLayerInfoWindowTitle'>" + attributes.name  + "   ("  + attributes.iso_a3 + ") </td></tr>";
    //htmlContent += "<tr><td class='featureLayerInfoWindowSubTitle'> ("  + attributes.iso_a3 + ") </td></tr>";
    
    //https://upload.wikimedia.org/wikipedia/en/thumb/b/ba/Flag_of_Germany.svg/800px-Flag_of_Germany.svg.png
    //htmlContent += "<tr><td class='featureLayerInfoWindowPhoto' id='featureLayerInfoWindowPhoto'></td></tr>";

    htmlContent += "<tr><td class='featureLayerInfoWindowText'>Continent: </td><td class='featureLayerInfoWindowText'>" + attributes.continent + "</td></tr>";
    htmlContent += "<tr><td class='featureLayerInfoWindowText'>Region: </td><td class='featureLayerInfoWindowText'>" + attributes.region_un + "</td></tr>";
    htmlContent += "<tr><td class='featureLayerInfoWindowText'>Sub_Region: </td><td class='featureLayerInfoWindowText'>" + attributes.subregion + "</td></tr>";
    htmlContent += "<tr><td class='featureLayerInfoWindowText'>OBJECTID: </td><td class='featureLayerInfoWindowText'>" + attributes.OBJECTID + "</td></tr>";
    htmlContent += "<tr><td class='featureLayerInfoWindowText'>objectid: </td><td class='featureLayerInfoWindowText'>" + attributes.objectid + "</td></tr>";
    
    //htmlContent += "<tr><td class='featureLayerInfoWindowText'>Economy: " + attributes.economy + "</td></tr>";
    //htmlContent += "<tr><td class='featureLayerInfoWindowText'>Income Group: " + attributes.income_grp + "</td></tr>";

    htmlContent += "<tr><td colspan='2' class='featureLayerInfoWindowAction'><a href='javascript:this.openWikipediaLink(" + '"' + attributes.name + '"' + ")'>Wikipedia</a></td></tr>";
    htmlContent += "</table>";

    return htmlContent;
  },

  openWikipediaLink: function(name) {
    var url = 'https://en.wikipedia.org/wiki/' + name;
    window.open(url);
  },

  ctryGrid_onShowCountries: function(rows) {   
    
    var assetIds = this.getAssetIdsFromSelection();

    var objectIds = this.mapControl.getFeatureLayerObjectIdsByValue( 'iso_a3', 'objectid', assetIds);

    // select the features on the map
    // mapControl.selectFeatures() wont with client-side feature layers 
    // we can use mapControl.selectFeaturesByObjectIds() instead
    this.mapControl.selectFeaturesByObjectIds(objectIds);
  },

  ctryGrid_onClearCountries: function() {
    // clear the features from the map
    this.mapControl.clearSelectedFeatures();

    // clear the selection from the grid
    this.ctryGrid.setAllRowsUnselected();

    // clear info window content
    //this.mapControl.showFeatureLayerInfoWindow("");

    // hide info window
    this.mapControl.hideFeatureLayerInfoWindow();

    //reset map view
    this.mapControl.map.centerAndZoom([0, 42], 2);
  },

  getAssetIdsFromSelection: function() {

    //var assetIds = null;
    var assetIds = [];

    var assetIdsObject = this.ctryGrid.getPrimaryKeysForSelectedRows();
    for (i=0; i<assetIdsObject.length; i++) {
      var assetIdObject = assetIdsObject[i];
      // if (i==0){
      //   //assetIds = "'" + assetIdsObject[i]['ctry.ctry_id'] + "'";
      // } else {
      //   assetIds += ",'" + assetIdsObject[i]['ctry.ctry_id'] + "'";
      // }
      assetIds.push(assetIdsObject[i]['ctry.ctry_id']);
    }

    return assetIds;
  },

  getAllAssetIdsFromDataSource: function(){

    var assetIdsString = '';
    var assetIdsArray = this.mapControl._getDistinctFieldValues('ctry.ctry_id', '1=1');

    for (i=0; i<assetIdsArray.length; i++) {
      if (i == 0) {
        assetIdsString = "'" + assetIdsArray[i] + "'";
      } else {
        assetIdsString += ",'" + assetIdsArray[i] + "'";
      }
    } 

    return assetIdsString;
  },

  getObjectIdsForSelection: function(){


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

function featureLayerClickCallback(featureId, featureType, featureGraphic) {
    //console.log('FeatureLayerClickCallback...');
    var mapController = View.controllers.get('mapController');
    mapController.onFeatureLayerClick(featureId, featureType, featureGraphic);
}

function featureLayerMouseOverCallback(featureId, featureType, featureGraphic) {
    //console.log('FeatureLayerMouseOverCallback...');
    var mapController = View.controllers.get('mapController');
    mapController.onFeatureLayerMouseOver(featureId, featureType, featureGraphic);
}

function featureLayerMouseOutCallback() {
    //console.log('FeatureLayerMouseOutCallback...');
    var mapController = View.controllers.get('mapController');
    mapController.onFeatureLayerMouseOut();
}

function openWikipediaLink(name) {
  var mapController = View.controllers.get('mapController');
  mapController.openWikipediaLink(name);
}
