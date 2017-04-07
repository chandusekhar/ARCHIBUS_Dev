View.createController('mapController', {
	// the Ab.arcgis.MapExtensions control
	mapControl: null,

	// active asset type
	activeAssetType: null,

	// geo level (floor) for rm assets
	geoLevel: 1,   

	afterViewLoad: function() {
		//console.log('MapController -> afterViewLoad...');

		var configObject = new Ab.view.ConfigObject();
		this.mapControl = new Ab.arcgis.MapExtensions('mapPanel', 'mapDiv', configObject);
  	},

    afterInitialDataFetch: function() {
        //console.log('MapController -> afterInitialDataFetch...');
        //apply esri css to map panel
        var reportTargetPanel = document.getElementById("mapPanel");            
        reportTargetPanel.className = 'claro';

        this.configureMapUI();
    },

  	configureMapUI: function() {
      	var mapController = View.controllers.get('mapController');

        // basemap layer menu
 	    var basemapLayerMenu = mapController.mapPanel.actions.get('basemapLayerMenu');
		basemapLayerMenu.clear();
		var basemapLayers = mapController.mapControl.getBasemapLayerList();
		for (var i=0; i<basemapLayers.length; i++){
			basemapLayerMenu.addAction(i, basemapLayers[i], this.switchBasemapLayer);
		}

		// asset menu
		var assetLayerMenu = mapController.mapPanel.actions.get('assetLayerMenu');
		assetLayerMenu.clear();
		assetLayerMenu.addAction(0, 'None', this.onSwitchAssetLayer);
		assetLayerMenu.addAction(1, 'Buildings by Use', this.onSwitchAssetLayer);
		assetLayerMenu.addAction(2, 'Rooms by Category', this.onSwitchAssetLayer);
        assetLayerMenu.addAction(3, 'Rooms by Type', this.onSwitchAssetLayer);

		// level menu
		var levelLayerMenu = mapController.mapPanel.actions.get('levelLayerMenu');
  		levelLayerMenu.clear();
  		levelLayerMenu.addAction(0, 'Level 1', this.switchMapLevel);
  		levelLayerMenu.addAction(1, 'Level 2', this.switchMapLevel);
  		levelLayerMenu.addAction(2, 'Level 3', this.switchMapLevel);
        levelLayerMenu.addAction(3, 'Level 4', this.switchMapLevel);

    	// legend menu
    	var legendObj = Ext.get('showLegend'); 
	    legendObj.on('click', this.showLegend, this, null);

  	},


	/**
    * Common Map Methods
    */

	onMapLoaded: function() {
		//console.log('MapController -> onMapLoaded...');
	},

    switchBasemapLayer: function(item) {
    	//console.log('MapController -> switchBasemapLayer...');
    	//switch the map layer based on the passed in layer name.
        var mapController = View.controllers.get('mapController');
    	mapController.mapControl.switchBasemapLayer(item.text);
    },  

    showLegend: function(){
        var mapController = View.controllers.get('mapController');
        mapController.mapControl.showFeatureLayerLegend();
	},
	
    onFeatureLayerClick: function(assetId, assetType, assetGraphic){
        var mapController = View.controllers.get('mapController');

        switch(assetType)
        {
            case 'bl':
                var lat = assetGraphic.attributes.lat;
                var lon = assetGraphic.attributes.lon;
                // pan to building
                mapController.mapControl.setMapCenter(lon, lat);            
                // select the feature
                mapController.selectBuildingFeaturesById([assetId]);
                // show building info window
                mapController.showBuildingInfoWindow(assetId);              
                break;

            case 'rm':
                // pan to room
                //TODO
            
                var bldgId = assetGraphic.attributes.bl_id;
                var floorId = assetGraphic.attributes.fl_id;
                var roomId = assetGraphic.attributes.rm_id;
                var bldgFloorRoomId = bldgId + '_' + floorId + '_' + roomId;

                // select the feature
                mapController.selectRoomFeaturesById(bldgFloorRoomId);              

                // show building info window
                mapController.showRoomInfoWindow(bldgFloorRoomId);        
                break;

            case 'eq':
                var whereClause = "eq_id='" + assetId + "'";
                mapController.showAssetEditForm(assetId, assetType);
                break;
        }

    },

    switchMapLevel: function(item){
        var mapController = View.controllers.get('mapController');

        var level = item.text;     

        if (mapController.activeAssetType === 'rm_cat' || mapController.activeAssetType === 'rm_type') {
            switch(level)
                {
                    case 'Level 1':
                        mapController.loadRoomFeatures(1, mapController.activeAssetType);
                        break;

                    case 'Level 2':
                        mapController.loadRoomFeatures(2, mapController.activeAssetType);
                        break;

                    case 'Level 3':
                        mapController.loadRoomFeatures(3, mapController.activeAssetType);
                        break;

                    case 'Level 4':
                        mapController.loadRoomFeatures(4, mapController.activeAssetType);
                        break;

                    default :
                        break;
                }
        }

        if (mapController.activeAssetType == 'eq') {
            switch(_level)
                {
                    case 'Level 1':
                        mapController.geoLevel = 1;
                        mapController.visibleLayers = [8,9,10,11];
                        mapController.mapControl.switchReferenceLayer( 'eq', [8,9,10,11] );
                        var whereClause = "geo_level = 1";
                        mapController.mapControl.switchFeatureLayer( 'rm', whereClause );
                        break;

                    case 'Level 2':
                        mapController.geoLevel = 2;
                        mapController.visibleLayers = [4,5,6,7];
                        mapController.mapControl.switchReferenceLayer( 'eq', [4,5,6,7] );
                        var whereClause = "geo_level = 2";
                        mapController.mapControl.switchFeatureLayer( 'eq', whereClause );
                        break;

                    case 'Level 3':
                        mapController.geoLevel = 3;
                        mapController.visibleLayers = [0,1,2,3];
                        mapController.mapControl.switchReferenceLayer( 'eq', [0,1,2,3] );
                        var whereClause = "geo_level = 3";
                        mapController.mapControl.switchFeatureLayer( 'eq', whereClause );
                        break;

                    default :
                        break;
                }
        }

        if (mapController.activeAssetType == 'bl') {
            View.alert('Please select a room type asset layer.');
        }

    },  

	onSwitchAssetLayer: function(item){
		//console.log('MapController -> onSwitchAssetLayer...');
        var mapController = View.controllers.get('mapController');

		switch (item.text) {
			case 'None':
				mapController.activeAssetType = null;
				mapController.geoLevel = 1;   
				mapController.mapControl.removeReferenceLayer();
				mapController.mapControl.removeFeatureLayer();
				break;

			case 'Buildings by Use':
    			mapController.loadBuildingFeatures();
				break;

			case 'Rooms by Category':
				mapController.loadRoomFeatures(1, 'rm_cat');
				break;

			case 'Rooms by Type':
                mapController.loadRoomFeatures(1, 'rm_type');
				break;

			default:
				break;

		}

	},

    /**
    * Building Feature Methods  
    */

    loadBuildingFeatures: function(){
        var mapController = View.controllers.get('mapController');
        mapController.activeAssetType = 'bl';

        // clean up
        mapController.mapControl.clearMarkers();
        mapController.mapControl.removeReferenceLayer();
        mapController.mapControl.removeFeatureLayer();

        //set restriction
        var whereClause = "1=1";
        var restriction = new Ab.view.Restriction();
        restriction.addClause("bl.site_id", 'BEDFORD', "=");

        // set thematic colors/values
        var thematicUniqueValues = ['ACADEMIC', 'ADMINISTRATION', 'INDUSTRIAL', 'MANUFACTURING', 'MIXED USE', 'OFFICE', 'RESIDENCE HALL/DORMITORY', 'R+D', 'WAREHOUSE']
        var blUse = {
            9: ["#e41a1c","#4daf4a","#377eb8","#984ea3","#999999","#ff7f00","#ffff33","#a65628","#f781bf"]
        };
        colorbrewer.BuildingUse = blUse;
        var thematicColors = this.mapControl.colorbrewerToRGB(colorbrewer.Paired[10]);

        // create the layer options
        var layerOptions = {
            renderer: 'thematic-unique-values',
            thematicDataSource: 'WC_DATASOURCE',
            dataSource: 'buildingDs',
            //dataSourceParameters: parameters,
            dataSourceRestriction: restriction,
            //legendDataSuffix: '%',
            keyField: 'bl.bl_id',
            thematicField: 'bl.use1',
            thematicUniqueValues: thematicUniqueValues,
            thematicColors: thematicColors,
            whereClause: whereClause //this will be used against the feature service
        };

        // display the feature layer
        mapController.mapControl.switchFeatureLayer('bl', layerOptions, null);

    },
   
    selectBuildingFeaturesById: function(bldgId){
        var mapController = View.controllers.get('mapController');
        var objectIds = mapController.mapControl.getFeatureLayerObjectIdsByValue('bl_id', 'objectid', [bldgId]);
        mapController.mapControl.selectFeaturesByObjectIds(objectIds, true);
    },

    showBuildingInfoWindow: function(bldgId){
        var mapController = View.controllers.get('mapController');
        var restriction = new Ab.view.Restriction();
        restriction.addClause("bl.bl_id", bldgId, "=");
        var records = mapController.getRecordsFromDataSource('buildingDs', restriction);

        if (records.length > 0){
            var htmlContent = "<table width='100%'>";
            htmlContent += "<tr><td colspan='2' class='featureLayerInfoWindowTitle'>" + records[0].getValue('bl.name') +  "</td></tr>";
            htmlContent += "<tr><td class='featureLayerInfoWindowSubTitle'> ("  + records[0].getValue('bl.bl_id') + ") </td></tr>";

            htmlContent += "<tr><td class='featureLayerInfoWindowText'>Address: </td><td class='featureLayerInfoWindowText'>" + records[0].getValue('bl.address1') + "</td></tr>";
            htmlContent += "<tr><td class='featureLayerInfoWindowText'>City: </td><td class='featureLayerInfoWindowText'>" + records[0].getValue('bl.city_id') + "</td></tr>";
            htmlContent += "<tr><td class='featureLayerInfoWindowText'>State: </td><td class='featureLayerInfoWindowText'>" + records[0].getValue('bl.state_id') + "</td></tr>";
            //htmlContent += "<tr><td class='featureLayerInfoWindowText'>Country: </td><td class='featureLayerInfoWindowText'>" + records[0].getValue('bl.ctry_id') + "</td></tr>";
            htmlContent += "<tr><td class='featureLayerInfoWindowText'>Zip: </td><td class='featureLayerInfoWindowText'>" + records[0].getValue('bl.zip') + "</td></tr>";

            htmlContent += "<tr><td colspan='2' class='featureLayerInfoWindowAction'><a href='javascript:showBuildingForm(" + '"' + records[0].getValue('bl.bl_id') + '"' + ")'>Building Form</a></td></tr>";
            htmlContent += "</table>";

            mapController.mapControl.showFeatureLayerInfoWindow(htmlContent);
        }
    },

    showBuildingForm: function(bldgId){
        //console.log('MapController -> showBuildingForm...');
        
        //var divId = mapController.mapControl.divId;
        //var offsetX = $(divId).offsetWidth - 525;
        //var offsetY  = $(divId).offsetHeight - 325;
        var offsetX = 25; //$(document).body.offsetWidth - 425;
        var offsetY = $(document).body.offsetHeight - 375; //75;

        //create the restriction
        var restriction = new Ab.view.Restriction();
        restriction.addClause('bl.bl_id', bldgId, '=', 'AND');

        //show the form
        this.buildingForm.refresh(restriction);
        this.buildingForm.showInWindow({ 
            width: 400, height: 310, 
            x: offsetX, y: offsetY,
            closeButton: false 
        });
    },

    buildingForm_onSaveForm: function(){
        //console.log('MapController -> buildingForm_onSaveForm...');

        // get the bl id from the form
        var bl_id = this.buildingForm.getFieldValue('bl.bl_id')
        var geo_objectid = this.buildingForm.getFieldValue('bl.geo_objectid');

        // save the form
        this.buildingForm.save();

        // refresh the bl panel
        this.blPanel.refresh();
        
        // call the workflow rule with the where clause
        //TODO      
        //var result = Workflow.callMethod('AbCommonResources-ArcgisExtensionsService-updateArcgisFeatureDataByObjectId', geo_objectid);

        // close the form
        View.panels.get('buildingForm').closeWindow();

        // clear the query layer selection
        this.mapControl.clearSelectedFeatures();

        // refresh the feature layer
        //TODO
    },

    /**
    *   Room feature methods
    */

    loadRoomFeatures: function(geoLevel, rmType){
        var mapController = View.controllers.get('mapController');
        mapController.activeAssetType = rmType;
        mapController.geoLevel = geoLevel;

        // clean up
        mapController.mapControl.clearMarkers();
        mapController.mapControl.removeReferenceLayer();
        mapController.mapControl.removeFeatureLayer();

        // set where clause and restriction
        var whereClause = "geo_level = " + geoLevel + " AND asset_type = 'rm'";

        // TODO 
        var restriction = new Ab.view.Restriction();
        restriction.addClause("rm.fl_id", geoLevel, "=", "OR");
        if (geoLevel === 1) {
            restriction.addClause("rm.fl_id", '01', "=", "OR");
        }
        if (geoLevel === 2) {
            restriction.addClause("rm.fl_id", '02', "=", "OR");
        }
        if (geoLevel === 3) {
            restriction.addClause("rm.fl_id", '03', "=", "OR");
        }
        if (geoLevel === 4) {
            restriction.addClause("rm.fl_id", '04', "=", "OR");
        }

        var thematicUniqueValues;
        var thematicColors;
        var thematicField;

        if (rmType === 'rm_cat') {
            thematicUniqueValues = ['MEETING','LAB','OFFICE','WKSTN', 'OPENWKSTN', 'SUPPORT','PRIMCIRC','SECONDCIRC','SERV','VERT'];     

            var rmCatColors = {
                10: ["#33a02c","#e31a1c","#1f78b4","#a6cee3","#a6cee3","#b2df8a","#f7f7f7","#cccccc","#969696","#525252"]
            };
            colorbrewer.RoomCat = rmCatColors;
            thematicColors = mapController.mapControl.colorbrewerToRGB(colorbrewer.RoomCat[10]);
            thematicField = 'rm.rm_cat';
        }
        if (rmType === 'rm_type') {
            //thematicUniqueValues = ['100','200','300','400','500','600','700','800','900','WWW','XXX','YYY'];
            thematicUniqueValues = ['CLASS','LAB','OFFICE','STUDY','SPECIAL','GENERAL','SUPPORT','HEALTHCARE','RESIDENT','PRIMCIRC','SERV','MECH'];     
            
            var rmTypeColors = {
                12: ["#33a02c","#e31a1c","#1f78b4","#ff7f00","#6a3d9a","#b2df8a","#fb9a99","#a6cee3","#fdbf6f","#f7f7f7","#d9d9d9","#969696"]
            };  
            colorbrewer.RoomType = rmTypeColors;
            thematicColors = mapController.mapControl.colorbrewerToRGB(colorbrewer.RoomType[12]);
            thematicField = 'rm.rm_type';
            restriction.addClause('rm.bl_id', 'MC%', 'LIKE', 'AND');
        }

        // create the layer options
        var layerOptions = {
            renderer: 'thematic-unique-values',
            thematicDataSource: 'WC_DATASOURCE',
            dataSource: 'roomDs',
            //dataSourceParameters: parameters,
            dataSourceRestriction: restriction,
            //legendDataSuffix: '%',
            keyField: 'rm.geo_objectid',
            thematicField: thematicField,
            //thematicField: 'rm.rm_type',
            thematicUniqueValues: thematicUniqueValues,
            thematicColors: thematicColors,
            whereClause: whereClause //this will be used against the feature service
        };

        // display the feature layer
        mapController.mapControl.switchFeatureLayer('rm', layerOptions, null);

        // load ctry reference layer
        mapController.mapControl.switchReferenceLayer('gros');

        // override the legend content
        if (rmType === 'rm_type') {
            mapController.overrideLegendContent.defer(500, mapController); 
        }
    },

    selectRoomFeaturesById: function(bldgFloorRoomId){
        var mapController = View.controllers.get('mapController');
        var objectIds = mapController.mapControl.getFeatureLayerObjectIdsByValue('bl_fl_rm_id', 'objectid', [bldgFloorRoomId]);
        mapController.mapControl.selectFeaturesByObjectIds(objectIds, true);
    },

    showRoomInfoWindow: function(bldgFloorRoomId){
        var mapController = View.controllers.get('mapController');
        var roomKeys = bldgFloorRoomId.split("_");

        var restriction = new Ab.view.Restriction();
        restriction.addClause("rm.bl_id", roomKeys[0], "=", "AND");
        restriction.addClause("rm.fl_id", roomKeys[1], "=", "AND");
        restriction.addClause("rm.rm_id", roomKeys[2], "=", "AND");
        var records = mapController.getRecordsFromDataSource('roomDs', restriction);

        if (records.length > 0){
            var htmlContent = "<table width='100%'>";
            htmlContent += "<tr><td colspan='2' class='featureLayerInfoWindowTitle'>" + records[0].getValue('rm.bl_id') + "_" + records[0].getValue('rm.fl_id') + "_" + records[0].getValue('rm.rm_id') +  "</td></tr>";
            
            htmlContent += "<tr><td class='featureLayerInfoWindowText'>Building: </td><td class='featureLayerInfoWindowText'>" + records[0].getValue('rm.bl_id') + "</td></tr>";
            htmlContent += "<tr><td class='featureLayerInfoWindowText'>Floor: </td><td class='featureLayerInfoWindowText'>" + records[0].getValue('rm.fl_id') + "</td></tr>";
            htmlContent += "<tr><td class='featureLayerInfoWindowText'>Room: </td><td class='featureLayerInfoWindowText'>" + records[0].getValue('rm.rm_id') + "</td></tr>";
            htmlContent += "<tr><td class='featureLayerInfoWindowText'>Room Category: </td><td class='featureLayerInfoWindowText'>" + records[0].getValue('rm.rm_cat') + "</td></tr>";
            htmlContent += "<tr><td class='featureLayerInfoWindowText'>Room Type: </td><td class='featureLayerInfoWindowText'>" + records[0].getValue('rm.rm_type') + "</td></tr>";

            htmlContent += "<tr><td colspan='2' class='featureLayerInfoWindowAction'><a href='javascript:showRoomForm(" + '"' + bldgFloorRoomId + '"' + ")'>Room Form</a></td></tr>";
            htmlContent += "</table>";

            mapController.mapControl.showFeatureLayerInfoWindow(htmlContent);
        }
    },

    showRoomForm: function(bldgFloorRoomId){
        //console.log('MapController -> showRoomForm...');
        var mapController = View.controllers.get('mapController');

        var offsetX = 25; //$(document).body.offsetWidth - 425;
        var offsetY = $(document).body.offsetHeight - 375; //75;

        // set room keys
        var roomKeys = bldgFloorRoomId.split('_');
        var bl_id = roomKeys[0];
        var fl_id = roomKeys[1];
        var rm_id = roomKeys[2];

        //create restriction
        var restriction = new Ab.view.Restriction();
        restriction.addClause('rm.bl_id', bl_id, '=', 'AND');
        restriction.addClause('rm.fl_id', fl_id, '=', 'AND');
        restriction.addClause('rm.rm_id', rm_id, '=');
        //show the form
        this.roomForm.refresh(restriction);
        this.roomForm.showInWindow({ 
            width: 400, height: 310, 
            x: offsetX, y: offsetY,
            closeButton: false 
        });
    },

    overrideLegendContent: function(){

        var htmlContent = "<table>";
        htmlContent += "<tr><td colspan='2' class='featureLayerLegendTitle'>Room Type&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td></tr>";
        htmlContent += "<tr><td class='featureLayerLegendSwatch' style='background-color:#33A02C'>&nbsp;&nbsp;&nbsp;</td><td class='featureLayerLegendLabel'>100 Classrooms</td></tr>";
        htmlContent += "<tr><td class='featureLayerLegendSwatch' style='background-color:#E31A1C'>&nbsp;&nbsp;&nbsp;</td><td class='featureLayerLegendLabel'>200 Laboratories</td></tr>";
        htmlContent += "<tr><td class='featureLayerLegendSwatch' style='background-color:#1F78B4'>&nbsp;&nbsp;&nbsp;</td><td class='featureLayerLegendLabel'>300 Offices</td></tr>";
        htmlContent += "<tr><td class='featureLayerLegendSwatch' style='background-color:#FF7F00'>&nbsp;&nbsp;&nbsp;</td><td class='featureLayerLegendLabel'>400 Study</td></tr>";
        htmlContent += "<tr><td class='featureLayerLegendSwatch' style='background-color:#6A3D9A'>&nbsp;&nbsp;&nbsp;</td><td class='featureLayerLegendLabel'>500 Special</td></tr>";
        htmlContent += "<tr><td class='featureLayerLegendSwatch' style='background-color:#B2DF8A'>&nbsp;&nbsp;&nbsp;</td><td class='featureLayerLegendLabel'>600 General</td></tr>";
        htmlContent += "<tr><td class='featureLayerLegendSwatch' style='background-color:#FB9A99'>&nbsp;&nbsp;&nbsp;</td><td class='featureLayerLegendLabel'>700 Support</td></tr>";
        htmlContent += "<tr><td class='featureLayerLegendSwatch' style='background-color:#A6CEE3'>&nbsp;&nbsp;&nbsp;</td><td class='featureLayerLegendLabel'>800 Health Care</td></tr>";
        htmlContent += "<tr><td class='featureLayerLegendSwatch' style='background-color:#FDBF6F'>&nbsp;&nbsp;&nbsp;</td><td class='featureLayerLegendLabel'>900 Residential</td></tr>";
        htmlContent += "<tr><td class='featureLayerLegendSwatch' style='background-color:#FFFFFF'>&nbsp;&nbsp;&nbsp;</td><td class='featureLayerLegendLabel'>WWW Circulation</td></tr>";
        htmlContent += "<tr><td class='featureLayerLegendSwatch' style='background-color:#D9D9D9'>&nbsp;&nbsp;&nbsp;</td><td class='featureLayerLegendLabel'>XXX Bldg Service</td></tr>";
        htmlContent += "<tr><td class='featureLayerLegendSwatch' style='background-color:#969696'>&nbsp;&nbsp;&nbsp;</td><td class='featureLayerLegendLabel'>YYY Mechanical</td></tr>";   
        htmlContent += '</table>';

        document.getElementById('mapDiv_featureLayerLegendContent').innerHTML = htmlContent;
    },	


    /*
    *   Common Methods
    */

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

    getGeoLevelFromAfmDwgs: function(bldgId, floorId) {

        var mapController = View.controllers.get('mapController');          
        var geoLevel = "1";
        var spaceHierFieldValues = bldgId + ";" + floorId;

        var restriction = new Ab.view.Restriction();
        restriction.addClause('afm_dwgs.space_hier_field_values', spaceHierFieldValues, "=");

        var dataSource = View.dataSources.get('afmDwgsDs');
        var records = dataSource.getRecords(restriction);

        if (records.length > 0){
            geoLevel = records[0].getValue('afm_dwgs.geo_level');
        }

        return geoLevel;
    },

    getGeoObjectIdFromDataSource: function(dataSourceId, assetKey, assetGraphic){

        var geoObjectId,
            dataSource,
            restriction,
            records,
            assetKeys;

        switch (dataSourceId) {
            case 'buildingDs':
                dataSource = View.dataSources.get(dataSourceId);
                restriction = new Ab.view.Restriction();
                restriction.addClause ('bl.bl_id', assetKey, "=");
                records = dataSource.getRecords(restriction);
                if (records.length > 0){
                    geoObjectId = records[0].getValue('bl.geo_objectid');
                }
                break;

            case 'roomDs':
                assetKeys = assetKey.split(';');
                restriction = new Ab.view.Restriction;
                restriction.addClause ('rm.bl_id', assetKey[0], "=", "AND");
                restriction.addClause ('rm.fl_id', assetKey[1], "=", "AND");
                restriction.addClause ('rm.rm_id', assetKey[2], "=", "AND");
                records = dataSource.getRecords(restriction);
                if (records.length > 0){
                    geoObjectId = records[0].getValue('rm.geo_objectid');
                }               
                break;

            default:
                break;
        }

        return geoObjectId;
    },

    getRecordsFromDataSource: function(dataSourceId, restriction) {
        var dataSource = View.dataSources.get(dataSourceId);
        return dataSource.getRecords(restriction);
    },

    getBldgFloorRoomFromDataSource: function(geoObjectId) {
        var mapController = View.controllers.get('mapController');

        var restriction = new Ab.view.Restriction();
        restriction.addClause('rm.geo_objectid', geoObjectId, '=');

        var records = mapController.getRecordsFromDataSource('roomDs', restriction);
        var bl_id = records[0].getValue('rm.bl_id');
        var fl_id = records[0].getValue('rm.fl_id');
        var rm_id = records[0].getValue('rm.rm_id');

        return bl_id + '_' + fl_id + '_' + rm_id; 
    }



});

function mapLoadedCallback() {
    //console.log('mapLoadedCallback...');
    var mapController = View.controllers.get('mapController');
    mapController.onMapLoaded();
}

function featureLayerClickCallback(assetId, assetType, assetGraphic) {
    //console.log('featureLayerClickCallback...');
    var mapController = View.controllers.get('mapController');
    mapController.onFeatureLayerClick(assetId, assetType, assetGraphic);
}

function showBuildingForm(bldgId) {
    //console.log('showBuildingForm...');
    var mapController = View.controllers.get('mapController');
    mapController.showBuildingForm(bldgId); 
}

function showRoomForm(roomKeys) {
    //console.log('showRoomForm...');
    var mapController = View.controllers.get('mapController');
    mapController.showRoomForm(roomKeys);   
}

function closeEditForm(){
    //console.log('closeEditForm...');    
}




