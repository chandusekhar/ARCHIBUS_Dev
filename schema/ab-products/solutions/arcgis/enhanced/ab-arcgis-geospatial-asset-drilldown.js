View.createController('mapController', {
	// the Ab.arcgis.MapExtensions control
	mapControl: null,

	// active site id
	activeSiteId: null,

	// active asset type/id
	activeAssetType: null,
	
	// geo level (floor) for rm assets
	geoLevel: null,      


	afterViewLoad: function() {
		//console.log('MapController -> afterViewLoad...');

	    var configObject = new Ab.view.ConfigObject();
	    this.mapControl = new Ab.arcgis.MapExtensions('mapPanel', 'mapDiv', configObject);  	
  	},

  	afterInitialDataFetch: function() {
       	//console.log('MapController -> afterInitialDataFetch...');
		
  		if (this.mapControl.hasExtensionsForEsriLicense === true) {
	      	//apply esri css to map panel
    		var reportTargetPanel = document.getElementById("mapPanel");            
      		reportTargetPanel.className = 'claro';

	      	// basemap layer menu
	 	    var basemapLayerMenu = this.mapPanel.actions.get('switchBasemapLayer');
			basemapLayerMenu.clear();
			var basemapLayers = this.mapControl.getBasemapLayerList();
			for (var i=0; i<basemapLayers.length; i++){
				basemapLayerMenu.addAction(i, basemapLayers[i], this.switchBasemapLayer);
			}
	    	
	    	// legend menu
	    	var legendObj = Ext.get('showLegend'); 
		    legendObj.on('click', this.showLegend, this, null);  		
  		}

  	},

	/*
	* Grid Methods
	*/

	sitePanel_onClickItem: function(row){
		var mapController = View.controllers.get('mapController');

		//var city_id = row.record['site.city_id'];
		var site_id = row.record['site.site_id'];
		var lat = row.record['site.lat.raw'] || row.record['site.lat'];
		var lon = row.record['site.lon.raw'] || row.record['site.lon'];

		// clean up


		// zoom map to city
		var zoomLevel = 10;
		if (site_id === 'BEDFORD'){
			zoomLevel = 13;
		};
		mapController.mapControl.setMapCenterAndZoom(lon, lat, zoomLevel );

		// hide floor and room panels
		View.panels.get('flPanel').show(false);	
		View.panels.get('rmPanel').show(false);
		
		// 'clear' visible layer array
		mapController.visibleLayers = [0];	
		
		mapController.loadBuildingMarkers(site_id);	

	},


	blPanel_onClickItem: function(row){
		var mapController = View.controllers.get('mapController');

		var bldgId = row.record['bl.bl_id'];
		var siteId = row.record['bl.site_id'];
		var lat = row.record['bl.lat.raw'] || row.record['bl.lat'];
		var lon = row.record['bl.lon.raw'] || row.record['bl.lon'];

		// clean up


		// hide room panel
		View.panels.get('rmPanel').show(false);	
			
		if ( mapController.activeAssetType != 'bl_feature' && siteId === 'BEDFORD') {
			// zoom to building
			mapController.mapControl.setMapCenterAndZoom(lon, lat, 18);
			// load building features
			mapController.loadBuildingFeatures(bldgId);
			// show building info window
			mapController.showBuildingInfoWindow(bldgId);
		} else if (siteId === 'BEDFORD') {
			// pan to building
			mapController.mapControl.setMapCenter(lon, lat);	    	
			// select the feature
    		mapController.selectBuildingFeaturesById.defer(500, mapController, [bldgId]);
			// show building info window
			mapController.showBuildingInfoWindow(bldgId);
		}

	},

	flPanel_onClickItem: function(row){
		var mapController = View.controllers.get('mapController');

		var bldgId = row.record['fl.bl_id'];
		var floorId = row.record['fl.fl_id'];
		var lat = row.record['bl.lat.raw'] || row.record['bl.lat'];
		var lon = row.record['bl.lon.raw'] || row.record['bl.lon'];

		if ( mapController.activeAssetType !== 'rm') {
			// zoom to building
			mapController.mapControl.setMapCenterAndZoom(lon, lat, 19);
			// load room features
			mapController.loadRoomFeatures(bldgId, floorId);
		} else {
			// pan to building
			mapController.mapControl.setMapCenter(lon, lat);
			// load room features
			mapController.loadRoomFeatures(bldgId, floorId);
		}
			
	},

	rmPanel_onClickItem: function(row){

		var mapController = View.controllers.get('mapController');

		var bldgId = row.record['rm.bl_id'];
		var floorId = row.record['rm.fl_id'];
		var roomId = row.record['rm.rm_id'];
		var bldgFloorRoomId = bldgId + "_" + floorId + "_" + roomId;
		//var lat = row.record['bl.lat.raw'] || row.record['bl.lat'];
		//var lon = row.record['bl.lon.raw'] || row.record['bl.lon'];

		// clean up

	
		if ( mapController.activeAssetType !== 'rm') {
			// zoom to room
			// TODO 
			//mapController.mapControl.setMapCenterAndZoom(lon, lat, 19);
			
			// load room features
			mapController.loadRoomFeatures(bldgId, floorId);
	    	// select the feature
	    	mapController.selectRoomFeaturesById(bldgFloorRoomId);
			// show room info window
			mapController.showRoomInfoWindow(bldgFloorRoomId);	    	

		} else {
	    	// pan to room
	    	//TODO
	    	// select the feature
	    	mapController.selectRoomFeaturesById(bldgFloorRoomId);
			// show room info window
			mapController.showRoomInfoWindow(bldgFloorRoomId);
		}


	},

	/*
	*	Map Methods
	*/

	onMapLoaded: function() {
		//console.log('MapController -> onMapLoaded...');

		// load city markers
		this.loadSiteMarkers();

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
		}
	},

    switchBasemapLayer: function(item) {
    	var mapController = View.controllers.get('mapController');
    	mapController.mapControl.switchBasemapLayer(item.text);
    },  

    showLegend: function(){
		var mapController = View.controllers.get('mapController');
		mapController.mapControl.showFeatureLayerLegend();
	},

	/**
	* Site feature methods
	*/

	loadSiteMarkers: function() {
		var mapController = View.controllers.get('mapController');
		mapController.activeAssetType = 'site';

		// clean up
		mapController.mapControl.clearMarkers();
		mapController.mapControl.removeReferenceLayer();
		mapController.mapControl.removeFeatureLayer();

		//var infoWindowFields = ['city.city_id','city.state_id','city.ctry_id','ctry.name'];
		//var cityMarkerProperty = new Ab.arcgis.ArcGISMarkerProperty('cityDs', ['city.lat','city.lon'], 'city.city_id', infoWindowFields);

		var infoWindowFields = ['site.city_id','site.state_id','site.ctry_id','ctry.name'];
		var siteMarkerProperty = new Ab.arcgis.ArcGISMarkerProperty('siteDs', ['site.lat','site.lon'], 'site.site_id', infoWindowFields);

		siteMarkerProperty.showLabels = false;
		siteMarkerProperty.symbolSize = 12;
		var siteColors = [	
			// dark paried 
			[227,26,28],
			[31,120,180],
			[51,160,44]
			// light paired
			//[251,154,153],				
			//[166,206,227],
			//[178,223,138]
		];
		siteMarkerProperty.symbolColors = siteColors;
		var thematicBuckets = [];
		siteMarkerProperty.setThematic('ctry.geo_region_id', thematicBuckets);

		// add markers
		mapController.mapControl.updateDataSourceMarkerPropertyPair('siteDs', siteMarkerProperty);	

		// refresh map
		mapController.mapControl.refresh();

		// load ctry reference layer
		mapController.mapControl.switchReferenceLayer('ctry');

	    // set the view
	    this.mapControl.setMapCenterAndZoom(-10, 70, 2); 
	},

	/**
	* Building feature methods
	*/

	loadBuildingMarkers: function(site_id) {

		var mapController = View.controllers.get('mapController');
		mapController.activeAssetType = 'bl_marker';
		mapController.activeSiteId = site_id;

		// clean up
		mapController.mapControl.clearMarkers();
		mapController.mapControl.removeReferenceLayer();
		mapController.mapControl.removeFeatureLayer();

		// create markers
		var infoWindowFields = ['bl.name','bl.address1','bl.city_id','bl.state_id','bl.zip'];
		var blMarkerProperty = new Ab.arcgis.ArcGISMarkerProperty('blDs', ['bl.lat','bl.lon'], 'bl.bl_id', infoWindowFields);
		blMarkerProperty.showLabels = false;
		blMarkerProperty.symbolSize = 12;

		// create marker colors
		var blColors =  [ 	
			[227, 26, 28, 0.9], 
			[31, 120, 180, 0.9], 
			[51, 160, 44, 0.9],
			[255, 127, 0, 0.9],
			[106, 61, 154, 0.9],
			[251, 154, 153, 0.9],
			[166, 206, 227, 0.9],
			[178, 223, 138, 0.9],
			[253, 191, 111, 0.9],
			[202, 178, 214, 0.9]	
		];

		blMarkerProperty.symbolColors = blColors;
		// var thematicBuckets = [];
		// blMarkerProperty.setThematic('bl.use1', thematicBuckets);

		// set restriction
		var restriction = new Ab.view.Restriction();
		restriction.addClause('bl.site_id', site_id, "=", "OR");			
		blMarkerProperty.setRestriction(restriction);
		
		// add markers
		mapController.mapControl.updateDataSourceMarkerPropertyPair('blDs',blMarkerProperty);	

		// refresh map
		mapController.mapControl.refresh();	
	},

	loadBuildingFeatures: function(bldgId){
		var mapController = View.controllers.get('mapController');
		mapController.activeAssetType = 'bl_feature';

		// clean up
		mapController.mapControl.clearMarkers();
		mapController.mapControl.removeReferenceLayer();
		mapController.mapControl.removeFeatureLayer();

	    //TODO
	    //var blIds = this.getBuildingIdsFromDataSource();
	    //var whereClause = "bl_id IN (" + blIds + ")"; 
		var whereClause = "1=1";
		var restriction = new Ab.view.Restriction();
		restriction.addClause("bl.site_id", mapController.activeSiteId, "=");

		// set thematic colors/values
	    //var thematicUniqueValues = this.mapControl._getDistinctFieldValues('bl.use1', restriction);
        var thematicUniqueValues = ['ACADEMIC', 'ADMINISTRATION', 'INDUSTRIAL', 'MANUFACTURING', 'MIXED USE', 'OFFICE', 'RESIDENCE HALL/DORMITORY', 'R+D', 'WAREHOUSE']
	    var blUse = {
			9: ["#e41a1c","#4daf4a","#377eb8","#984ea3","#ff7f00","#ffff33","#a65628","#f781bf","#999999"]
		};
		colorbrewer.BuildingUse = blUse;
	    var thematicColors = this.mapControl.colorbrewerToRGB(colorbrewer.Paired[10]);

	    // create the layer options
	    var layerOptions = {
	        renderer: 'thematic-unique-values',
	        thematicDataSource: 'WC_DATASOURCE',
	        dataSource: 'blDs',
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

		// select the feature
    	mapController.selectBuildingFeaturesById.defer(500, mapController, [bldgId]);
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
		var records = mapController.getRecordsFromDataSource('blDs', restriction);

		if (records.length > 0){
			var htmlContent = "<table width='100%'>";
		    htmlContent += "<tr><td colspan='2' class='featureLayerInfoWindowTitle'>" + records[0].getValue('bl.name') +  "</td></tr>";
		    htmlContent += "<tr><td class='featureLayerInfoWindowSubTitle'> ("  + records[0].getValue('bl.bl_id') + ") </td></tr>";
		    
		    //https://upload.wikimedia.org/wikipedia/en/thumb/b/ba/Flag_of_Germany.svg/800px-Flag_of_Germany.svg.png
		    //htmlContent += "<tr><td class='featureLayerInfoWindowPhoto' id='featureLayerInfoWindowPhoto'></td></tr>";

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
		
        var offsetX = 25; 
        var offsetY = $(document).body.offsetHeight - 375;

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
	*	Room feature methods
	*/

	loadRoomFeatures: function(bldgId, floorId){
		var mapController = View.controllers.get('mapController');
		mapController.activeAssetType = 'rm';

		// clean up
		mapController.mapControl.clearMarkers();
		mapController.mapControl.removeReferenceLayer();
		mapController.mapControl.removeFeatureLayer();

		// set where clause and restriction
	    var geoLevel = mapController.getGeoLevelFromAfmDwgs(bldgId, floorId);
		var whereClause = "geo_level = " + geoLevel + " AND asset_type = 'rm'";

		// TODO
		var restriction = new Ab.view.Restriction();
		restriction.addClause("rm.fl_id", floorId, "=", "OR");
        if (floorId === '01') {
            restriction.addClause("rm.fl_id", '1', "=", "OR");
        }
        if (floorId === '02') {
            restriction.addClause("rm.fl_id", '2', "=", "OR");
        }
        if (floorId === '03') {
            restriction.addClause("rm.fl_id", '3', "=", "OR");
        }
        if (floorId === '04') {
            restriction.addClause("rm.fl_id", '4', "=", "OR");
        }
        if (floorId === '1') {
            restriction.addClause("rm.fl_id", '01', "=", "OR");
        }
        if (floorId === '2') {
            restriction.addClause("rm.fl_id", '02', "=", "OR");
        }
        if (floorId === '3') {
            restriction.addClause("rm.fl_id", '03', "=", "OR");
        }
        if (floorId === '4') {
            restriction.addClause("rm.fl_id", '04', "=", "OR");
        }

		// set thematic colors/values
        thematicUniqueValues = ['MEETING','LAB','OFFICE','WKSTN', 'OPENWKSTN', 'SUPPORT','PRIMCIRC','SECONDCIRC','SERV','VERT'];   

        var rmCat = {
            10: ["#33a02c","#e31a1c","#1f78b4","#a6cee3","#a6cee3","#b2df8a","#f7f7f7","#cccccc","#969696","#525252"]
        };
        colorbrewer.RoomCat = rmCat;
        var thematicColors = mapController.mapControl.colorbrewerToRGB(colorbrewer.RoomCat[10]);

	    // create the layer options
	    var layerOptions = {
	        renderer: 'thematic-unique-values',
	        thematicDataSource: 'WC_DATASOURCE',
	        dataSource: 'rmDs',
	        //dataSourceParameters: parameters,
	        dataSourceRestriction: restriction,
	        //legendDataSuffix: '%',
	        keyField: 'rm.geo_objectid',
	        //thematicField: 'rm.rm_cat',
	       	thematicField: 'rm.rm_cat',
	        thematicUniqueValues: thematicUniqueValues,
	        thematicColors: thematicColors,
	        whereClause: whereClause //this will be used against the feature service
	    };

	    // display the feature layer
    	mapController.mapControl.switchFeatureLayer('rm', layerOptions, null);

		// load ctry reference layer
		mapController.mapControl.switchReferenceLayer('gros');

    	// override the legend content
    	//mapController.overrideLegendContent.defer(1000, mapController);
	},

	selectRoomFeaturesById: function(bldgFloorRoomId){
		var mapController = View.controllers.get('mapController');
    	var objectIds = mapController.mapControl.getFeatureLayerObjectIdsByValue('bl_fl_rm_id', 'objectid', [bldgFloorRoomId]);
		mapController.mapControl.selectFeaturesByObjectIds(objectIds, true);
	},

	showRoomInfoWindow: function(bldgFloorRoomId){
		var mapController = View.controllers.get('mapController');
		var restriction = new Ab.view.Restriction();
        //restriction.addClause('rm.geo_objectid', geoObjectId, '=');		
		var roomKeys = bldgFloorRoomId.split("_");
		restriction.addClause("rm.bl_id", roomKeys[0], "=", "AND");
		restriction.addClause("rm.fl_id", roomKeys[1], "=", "AND");
		restriction.addClause("rm.rm_id", roomKeys[2], "=", "AND");

		var records = mapController.getRecordsFromDataSource('rmDs', restriction);

		if (records.length > 0){
			var htmlContent = "<table width='100%'>";
		    htmlContent += "<tr><td colspan='2' class='featureLayerInfoWindowTitle'>" + records[0].getValue('rm.bl_id') + "_" + records[0].getValue('rm.fl_id') + "_" + records[0].getValue('rm.rm_id') +  "</td></tr>";
		    
		    htmlContent += "<tr><td class='featureLayerInfoWindowText'>Building: </td><td class='featureLayerInfoWindowText'>" + records[0].getValue('rm.bl_id') + "</td></tr>";
		    htmlContent += "<tr><td class='featureLayerInfoWindowText'>Floor: </td><td class='featureLayerInfoWindowText'>" + records[0].getValue('rm.fl_id') + "</td></tr>";
		    htmlContent += "<tr><td class='featureLayerInfoWindowText'>Room: </td><td class='featureLayerInfoWindowText'>" + records[0].getValue('rm.rm_id') + "</td></tr>";
		    htmlContent += "<tr><td class='featureLayerInfoWindowText'>Room Category: </td><td class='featureLayerInfoWindowText'>" + records[0].getValue('rm.rm_cat') + "</td></tr>";
		    //htmlContent += "<tr><td class='featureLayerInfoWindowText'>Room Type: </td><td class='featureLayerInfoWindowText'>" + records[0].getValue('rm.rm_type') + "</td></tr>";

		    htmlContent += "<tr><td colspan='2' class='featureLayerInfoWindowAction'><a href='javascript:showRoomForm(" + '"' + bldgFloorRoomId + '"' + ")'>Room Form</a></td></tr>";
		    htmlContent += "</table>";

		    mapController.mapControl.showFeatureLayerInfoWindow(htmlContent);
		}
	},

	showRoomForm: function(bldgFloorRoomId){
	    //console.log('MapController -> showRoomForm...');

        var offsetX = 25; 
        var offsetY = $(document).body.offsetHeight - 375; 

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
		htmlContent += "<tr><td colspan='2' class='featureLayerLegendTitle'>Room Category&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td></tr>";
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
	*	Common Methods
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
  			case 'blDs':
  				dataSource = View.dataSources.get(dataSourceId);
  				restriction = new Ab.view.Restriction();
  				restriction.addClause ('bl.bl_id', assetKey, "=");
  				records = dataSource.getRecords(restriction);
  				if (records.length > 0){
  					geoObjectId = records[0].getValue('bl.geo_objectid');
  				}
  				break;

  			case 'rmDs':
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
