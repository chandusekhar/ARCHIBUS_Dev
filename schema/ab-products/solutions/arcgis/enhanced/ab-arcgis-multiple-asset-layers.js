View.createController('mapController', {
	
	// Ab.arcgis.ArcGISMap
	mapControl: null,

    // building layer options
    buildingLayerOptions: null,

    // parcel layer options
    parcelLayerOptions: null,
	
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
        this.mapControl.switchReferenceLayer('Land Base', null, referenceLayerLoadedCallback);
        
        // configure the asset menu
        this.configureAssetMenu();

        // configure building and parcel layer options
        this.configureLayerOptions();        
	},

    configureAssetMenu: function() {
        //console.log('MapController -> addAssetMenu...');

        // asset menu
        var assetLayerMenu = this.mapPanel.actions.get('assetLayerMenu');
        assetLayerMenu.clear();
        assetLayerMenu.addAction(0, 'None', this.switchFeatureLayer);

        var featureLayerList = this.mapControl.mapConfigObject.featureLayerList;
        for ( var i=0; i<featureLayerList.length; i++){
            assetLayerMenu.addAction(i+1, featureLayerList[i].name, this.switchFeatureLayer);
        }

    },

    configureLayerOptions: function() {

        // create the layer options
        this.buildingLayerOptions = {
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
            whereClause: "1=1" //this will be used against the feature service
            //whereClause: "1=1" 
        };        

        this.parcelLayerOptions = {
            renderer: 'simple',
            fillColor: [255,127,0], //[31,121,180],
            thematicDataSource: 'ARCGIS',
            //dataSource: 'blGridDs',
            //dataSourceParameters: parameters,
            //dataSourceRestriction: '1=1',
            //legendDataSuffix: '%',
            //keyField: 'bl_id',
            //thematicField: 'bl.use1',
            //thematicUniqueValues: thematicUniqueValues,
            //thematicColors: thematicColors,
            whereClause: "1=1" //this will be used against the feature service
            //whereClause: "1=1" 
        };
    },

    switchFeatureLayer: function(item){
        var mapController = View.controllers.get('mapController');
        if (item.text === 'Building'){
            mapController.mapControl.switchFeatureLayer(item.text, mapController.buildingLayerOptions, null);

            mapController.mapControl.setMapCenterAndZoom(-71.27017868536095, 42.527408328641876, 15);

        } else if (item.text === 'Parcel') {
            mapController.mapControl.switchFeatureLayer(item.text, mapController.parcelLayerOptions, null);
        } else {
            mapController.mapControl.clearFeatures();
        }
    },

    onFeatureLayerClick: function(assetId, assetType){
        //console.log('MapController -> onFeatureLayerClick...');
        //alert('You clicked on feature id : '  + id);
        var restriction; 
		
        switch (assetType)
        {
            case "parcel":
                var offsetX = $('mapDiv').offsetWidth - 420;
                var offsetY  = $('mapDiv').offsetHeight - 320;

                // highlight the asset
                var whereClause = "MAP_PAR_ID = '" + assetId + "'"; 
                this.mapControl.selectFeatures( 'Parcel', whereClause );

                // display the parcel form
                restriction = new Ab.view.Restriction();
                restriction.addClause('parcel.parcel_id', assetId, '=');

                // testing
                var ds = View.dataSources.get('parcelDs');
                var records = ds.getRecords(restriction);

                if (records.length > 0) {
                    var propertyId = records[0].values['parcel.pr_id'];
                    restriction.addClause('parcel.pr_id', propertyId, '=');
                }

                this.parcelForm.refresh(restriction);
                this.parcelForm.showInWindow({ 
                    width: 420, height: 320, 
                    x: offsetX, y: offsetY,
                    closeButton: false });
                break;
            case "bl":
                var offsetX = $('mapDiv').offsetWidth - 400;
                var offsetY  = $('mapDiv').offsetHeight - 250;

                // highlight the asset
                var whereClause = "bl_id = '" + assetId + "'"; 
                this.mapControl.selectFeatures( 'Building', whereClause );

                // display the building form
                restriction = new Ab.view.Restriction();
                restriction.addClause('bl.bl_id', assetId, '=');
                this.buildingForm.refresh(restriction);
                this.buildingForm.showInWindow({ 
                    width: 400, height: 250,
                    x: offsetX, y: offsetY, 
                    closeButton: false });
                break;
            default:
                View.alert('Unknown asset type : ' + assetType );
                break;
        }
    },

    onSaveBuildingForm: function() {

        // save and close the building form
        this.buildingForm.save();
        View.panels.get('buildingForm').closeWindow();

        // clear the feature selection
        this.mapControl.clearSelectedFeatures();

        // we could update the gis data by uncommenting the following 2 lines
        // the results wouldnt be 'visible' on the map however, since the 
        // buildings are not classified and we are using a tiled map service

        // get the gis object id
        //var geo_objectid = this.buildigForm.getFieldValue('bl.geo_objectid');

        // call the workflow rule with the gis object id to update the gis data
        //var result = Workflow.callMethod('AbCommonResources-ArcgisExtensionsService-updateArcgisBuildingFeatureDataByObjectId', geo_objectid);

    },

    onSaveParcelForm: function() {

        // save and close the building form
        this.parcelForm.save();
        View.panels.get('parcelForm').closeWindow();

        // clear the feature selection
        this.mapControl.clearSelectedFeatures();

        // we could update the gis data by uncommenting the following 2 lines
        // the results wouldnt be 'visible' on the map however, since the 
        // parcels are not classified and we are using a tiled map service

        // get the gis object id
        //var geo_objectid = this.blForm.getFieldValue('bl.geo_objectid');

        // call the workflow rule with the gis object id to update the gis data
        //var result = Workflow.callMethod('AbCommonResources-ArcgisExtensionsService-updateArcgisBuildingFeatureDataByObjectId', geo_objectid);


    },

    // the following event handlers are available, but are not used in this example

    onReferenceLayerLoaded: function() {
        //console.log('MapController -> onReferenceLayerLoaded...');
    },

    initFeatureLayer: function(){
        //console.log('MapController -> initFeatureLayer...');
    },

    onFeatureLayerInit: function(){
        //console.log('MapController -> onFeatureLayerInit...');
    },

    onFeatureLayerLoaded: function(){
        //console.log('MapController -> onFeatureLayerLoaded...')
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

function featureLayerLoadedCallback() {
    //console.log('FeatureLayerLoadedCallback...');
    var mapController = View.controllers.get('mapController');    
    mapController.onFeatureLayerLoaded();
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

function onSaveParcelForm(){
    var mapController = View.controllers.get('mapController');
    mapController.onSaveParcelForm();
}

function onCloseAssetForm(){
    var mapController = View.controllers.get('mapController');
    mapController.mapControl.clearSelectedFeatures();
}
