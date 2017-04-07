/*
*   This class defines the Locate Asset tool
*   It is used to define asset locations by clicking on the map 
*/
Ab.arcgis.AssetLocator = Base.extend({
	
	// the Ab.arcgis.ArcGISMap associated with the control
	mapControl: null,             

	// the data record from datasource
	dataRecord: null,
	
	// has control been initialized
	controlInitialized: false,
	
	// map click handler handle
	dojoMapClickHandle: null,
	
	//the information needed for location --- records, geometry, etc. 
	dataSourceName: null,
	restriction: null,
	pkField: null,
	geometryFields: null,
	infoFields: null,
	
	// graphics layer and symbol
	locateGraphicsLayer: null,
	locateSimpleMarkerSymbol: null,
	
	// infoWindow title and content
	infoTemplate: null,
	infoWindowTitle: null,
	infoWindowContent: null,
	
	// asset location
	assetMapPoint: null,
	
	/*
	*  The constructor.
	*  @param mapParam. The Ab.arcgis.ArcGISMap associated with thie tool
	*/
	constructor: function(mapParam) {
		this.mapControl = mapParam;
	},
	
	/**
	*  This function gets the record for the asset that will be located, processes it, and initiates the locate operation.
	*        @param dataSourceName. The dataSource to get records.
	*        @param restriction. The restriction needed when get dataRecords from dataSource.
	*        @param pkField.  The primary key field for tableName.
	*        @param geometryFields.  The geometryFields for tableName.
	*  @param infoFields.  The fields to display in the infoWindow.
	*/      
	initLocate: function() {
		// create symbol
		var locateSimpleLineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,0,0,1]), 1);
		this.locateSimpleMarkerSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_DIAMOND, 15, 
			locateSimpleLineSymbol, new dojo.Color([255,215,0,0.75]));
		this.infoTemplate = new esri.InfoTemplate();
	},
	
	startLocate: function(dataSourceName, restriction, pkField, geometryFields, infoFields) {             
		// initialized?
		if (!(this.controlInitialized)) {
			this.initLocate();
		}
		
		// hide info window
		this.mapControl.map.infoWindow.hide();
		
		// get params
		this.dataSourceName = dataSourceName;
		this.restriction = restriction;
		this.pkField = pkField;
		this.geometryFields = geometryFields;
		this.infoFields = infoFields;
		
		// get the data record from the datasource
		this.dataRecord = this.mapControl.getDataSourceRecords(this.dataSourceName, this.restriction);
		
		// get geometry (lon,lat) from record
		// what values could this come back with? NULL? 
		var lon = this.dataRecord[0].getValue(this.geometryFields[0]);
		var lat = this.dataRecord[0].getValue(this.geometryFields[1]);
		
		// create info window title + content
		this.infoWindowTitle = this.dataRecord[0].getValue(this.pkField);
		this.infoWindowContent = '';
		for (var j = 0; j < infoFields.length; j++) {
			var fieldId = infoFields[j];
			var fieldTitle = this.mapControl.getFieldTitle(dataSourceName, fieldId);
			
			//var localizedValue = dataSourceName.formatValue(fieldId, value, true);
			var nonlocalizedValue = this.dataRecord[0].getValue(fieldId);
			
			this.infoWindowContent += "<b>" + fieldTitle + ":</b> " + nonlocalizedValue;
			if( j != infoFields.length - 1 ) {
				this.infoWindowContent += "<br />";
			}
		}
	
		this.infoTemplate.setTitle(this.infoWindowTitle);
		this.infoTemplate.setContent(this.infoWindowContent);
		
		// if geometry exists
		if (!!lon && !!lat) {
			this.assetMapPoint = esri.geometry.geographicToWebMercator(new esri.geometry.Point(lon, lat));                                                
		}
		// if no geometry exists - use current map location
		else {
			var yCoord = (this.mapControl.map.extent.ymax + this.mapControl.map.extent.ymin ) / 2;
			var xCoord = (this.mapControl.map.extent.xmax + this.mapControl.map.extent.xmin ) / 2;
			this.assetMapPoint = new esri.geometry.Point( xCoord, yCoord, this.mapControl.map.spatialReference );
		}

		var graphic = new esri.Graphic( this.assetMapPoint, this.locateSimpleMarkerSymbol, null, this.infoTemplate );
		graphic.id = "locateGraphic";
                              		
		// remove locate assset graphic
		this.clearLocateGraphics(this.mapControl.map);
		this.mapControl.map.graphics.add(graphic);
			
		// show info window
		this.mapControl.map.infoWindow.setTitle( this.infoWindowTitle );
		this.mapControl.map.infoWindow.setContent( this.infoWindowContent ) ;
		this.mapControl.map.infoWindow.show( this.assetMapPoint );
		
		// add mouse move handler and tooltip 
		var assetLocatorControl = this;
		this.dojoMapClickHandle = dojo.connect(this.mapControl.map, "onClick", function(evt) {
			assetLocatorControl.mapOnClickHandler(evt);
		});
	},
	
	finishLocate: function() {
		// remove map click handler
		dojo.disconnect( this.dojoMapClickHandle );
		
		// remove locate assset graphic
		this.clearLocateGraphics(this.mapControl.map);
		
		// prepare asset coordinates
		var assetMapPointLL = esri.geometry.webMercatorToGeographic( this.assetMapPoint );
		var lon = assetMapPointLL.x.toFixed(6);
		var lat = assetMapPointLL.y.toFixed(6);
		var assetCoords = [lon, lat];
		
		// show info window
		this.mapControl.map.infoWindow.setTitle( this.infoWindowTitle );
		this.mapControl.map.infoWindow.setContent( this.infoWindowContent ) ;
		this.mapControl.map.infoWindow.show( this.assetMapPoint );
		
		// return asset coordinates
		return assetCoords;
	},
	
	cancelLocate: function() {
		// remove map click handler
		dojo.disconnect( this.dojoMapClickHandle );
		
		// remove locate assset graphic
		this.clearLocateGraphics(this.mapControl.map);
		
		// hide info window
		this.mapControl.map.infoWindow.hide();    
	},
	
	mapOnClickHandler: function(evt) {
		// get mapPoint
		this.assetMapPoint = evt.mapPoint;
		
		// create graphic
		var graphic = new esri.Graphic( this.assetMapPoint, this.locateSimpleMarkerSymbol, null, this.infoTemplate );
		graphic.id = "locateGraphic";
		
		// remove existing / add new assset graphic
		this.clearLocateGraphics(this.mapControl.map);
		this.mapControl.map.graphics.add(graphic);
	},
	
	clearLocateGraphics: function(map) {
		dojo.forEach(map.graphics.graphics, function(g) {
			if( g && g.id === "locateGraphic" ) {
				map.graphics.remove(g);
			}
		}, map);
	}	
});