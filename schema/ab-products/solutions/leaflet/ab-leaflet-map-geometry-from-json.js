var mapController = View.createController('showMap', {

	//the Ab.leaflet.Map
	mapControl: null,

	// geoJson layer group
	geoJsonLayerGroup: null,

	//room category list
	roomsByCategoryList: null,

	afterViewLoad: function(){

		//this.map = new L.map('mapDiv').setView([40.91, -96.63], 4);
		var configObject = new Ab.view.ConfigObject();
    	configObject.mapImplementation = 'Esri';
    	configObject.mapCenter = [42.524567,-71.2745042];
    	configObject.mapZoom = 18;

    	//create map
    	this.mapControl = new Ab.leaflet.Map('mapPanel', 'mapDiv', configObject);

    	// create menu/ui actions
    	this.createMenuActions();

    	// build romo categeory list
    	this.buildRoomsByCategoryList();

    	// udapte legend content
 		this.updateLegendContent();

    	// create floor plan layers
    	this.createFloorPlanLayers();

    	// load defaul layer
    	this.loadFloorPlanJson(level1RmJson);

    	// override marker action listeners
	    var _mapControl = this;
	    this.mapControl.mapClass.map.on('popupopen', function(e) {
	      //console.log('Popup opened...');
	      var popupAction = document.getElementById('leafletPopupAction');
	      if (popupAction) {
	        popupAction.addEventListener('click', function(e) {
	          //console.log('Popup action clicked ('+ leafletPopupTitle +')...');
	          var leafletPopupTitle = document.getElementById('mapDiv_leafletPopupContentTitle').innerHTML;
	          _mapControl.showRoomDetails(leafletPopupTitle);
	        });
	      }
	  	});
    },
			
	afterInitialDataFetch: function() {

	},
	
	buildRoomsByCategoryList: function(){

		var roomsByCategoryList = new Ext.util.MixedCollection();

		roomsByCategoryList.add('100', {
			color: '#4DAF4A' , 
			description: 'CLASSROOMS' });
		roomsByCategoryList.add('200', {
			color: '#E41A1C' , 
			description: 'LABORATORIES' });		
		roomsByCategoryList.add('300', {
			color: '#377EB8' , 
			description: 'OFFICES' });
		roomsByCategoryList.add('400', {
			color: '#FF7F00' , 
			description: 'STUDY' });
		roomsByCategoryList.add('500', {
			color: '#984EA3' , 
			description: 'SPECIAL' });		
		roomsByCategoryList.add('600', {
			color: '#B2DF8A' , 
			description: 'GENERAL' });
		roomsByCategoryList.add('700', {
			color: '#FB9A99' , 
			description: 'SUPPORT' });
		roomsByCategoryList.add('800', {
			color: '#A6CEE3' , 
			description: 'HEALTHCARE' });		
		roomsByCategoryList.add('900', {
			color: '#FDBF6F' , 
			description: 'RESIDENTIAL' });
		roomsByCategoryList.add('WWW', {
			color: '#FFFFFF' , 
			description: 'CIRCULATION' });
		roomsByCategoryList.add('XXX', {
			color: '#CCCCCC' , 
			description: 'BLDG SERVICE' });		
		roomsByCategoryList.add('YYY', {
			color: '#9C9C9C' , 
			description: 'MECHANICAL' });

		this.roomsByCategoryList = roomsByCategoryList;

	},

  	createMenuActions: function(){
		// basemap layer menu
		var basemapLayerMenu = mapController.mapPanel.actions.get('basemapLayerMenu');
		basemapLayerMenu.clear();
		var basemapLayers = mapController.mapControl.getBasemapLayerList();
		for (var i=0; i<basemapLayers.length; i++){
			basemapLayerMenu.addAction(i, basemapLayers[i], this.switchBasemapLayer);
		} 

		// level menu
		var levelLayerMenu = mapController.mapPanel.actions.get('levelLayerMenu');
  		levelLayerMenu.clear();
  		levelLayerMenu.addAction(0, 'Level 0', this.switchMapLevel);
  		levelLayerMenu.addAction(1, 'Level 1', this.switchMapLevel);
  		levelLayerMenu.addAction(2, 'Level 2', this.switchMapLevel);
  		levelLayerMenu.addAction(3, 'Level 3', this.switchMapLevel);

		// legend menu
    	var legendObj = Ext.get('showLegend'); 
	    legendObj.on('click', this.showLegend, this, null); 
  	},

  	createFloorPlanLayers: function() {

  		this.geoJsonLayerGroup = L.layerGroup();
    	this.geoJsonLayerGroup.addTo(this.mapControl.mapClass.map);

  	},

  	loadFloorPlanJson: function(featureCollection) {

  		this.geoJsonLayerGroup.clearLayers();

  		var geoJsonLayer = L.geoJson(featureCollection, {
  			style: getStyle,
  			onEachFeature: onEachFeature
  		});
  		
  		function getStyle(feature)	{
			return style = {
				color: '#6C6C6C',
				fillColor: getFillColor(feature),
				fillOpacity: 0.75,
				stroke: true,
				weight: '1px'
			};
  		}

  		function getFillColor(feature){
  			//console.log(feature.properties.rm_cat);

  			//TODO gross fill color #E1E1E1
  			var color;

  			if (feature.properties.rm_cat) {
				color = mapController.roomsByCategoryList.get(feature.properties.rm_cat).color;
  			} else {
  				color = '#FFFFFF';
  			}
  			
  			return color;

  		}

		function onEachFeature(feature, layer) {
			
			// create popup content
			var popupContent = "", prop;
			if (feature.properties) {
	          var popupTitle = '<span class="leaflet-popup-content-title" id="leafletPopupContentTitle">';
	          popupTitle += feature.properties.bl_fl_rm_id + '</span>';
	          feature.properties.popupTitle = popupTitle;

		      popupContent = '<div class="leaflet-popup-content-fields" id="leafletPopupContentFields">';
			  popupContent += "<b>Building Code : </b>" + feature.properties.bl_id + "</br>";
			  popupContent += "<b>Floor Code : </b>" + feature.properties.fl_id + "</br>";
			  popupContent += "<b>Room Code : </b>" + feature.properties.rm_id + "</br>";
			  popupContent += "<b>Room Category : </b>" + feature.properties.rm_cat + "</br>";
			  popupContent += "<b>Category Description : </b>" + mapController.roomsByCategoryList.get(feature.properties.rm_cat).description + "</br>";
			  popupContent += "</div>";

			  //add marker action to popup
			  var popupAction = '<span class="leaflet-popup-action" id="leafletPopupAction"><a href="javascript: void(0);">';
			  popupAction += 'Show Details';
			  popupAction += '</a></span>';

			  popupContent += popupAction;

			  feature.properties.popupContent = popupContent;
			}
			layer.bindPopup(popupTitle + popupContent);

			// create mouse over event
            layer.on('mouseover', function(evt){
                //console.log('leaflet-map-marker-mouseover');

                // get title from marker
                var title = evt.target.feature.properties.bl_fl_rm_id;
                var fillOpacity = (evt.target.options.fillOpacity)*0.5;

                // update the marker tooltip
                document.getElementById("mapDiv_leafletMapMarkerTooltip").innerHTML = title; 

                // get the mouse location
                var px, py;        
                if (evt.containerPoint.x && evt.containerPoint.y) { 
                  px = evt.containerPoint.x;
                  py = evt.containerPoint.y;
                }
                //console.log('clientX:' + px + ",clientY: " + py);

                // show the tooltip at the mouse location
                var tooltipEl = document.getElementById("mapDiv_leafletMapMarkerTooltip");          
                tooltipEl.style.display = 'none';
                tooltipEl.style.position = '';
                tooltipEl.style.left = (px + 15) + "px";
                tooltipEl.style.top = (py) + "px";
                tooltipEl.style.display = '';  
                tooltipEl.style.position = '';

                // add marker highlight
                var marker = evt.target;
                // TODO save old marker styles
                marker.setStyle({
                    stroke: true,
                    weight: 3,
                    color: '#000',
                    fillOpacity: fillOpacity
                });    

            });
            layer.on('mouseout', function(evt){
                //console.log('leaflet-map-marker-mouseout');

                var fillOpacity = (evt.target.options.fillOpacity)*2.0;

                var tooltipEl = document.getElementById("mapDiv_leafletMapMarkerTooltip");          
                tooltipEl.innerHTML = ""; 
                tooltipEl.style.display = "none";

                // reset the marker style
                var marker = evt.target;
                marker.setStyle({
                    stroke: true,  //TODO
                    weight: 1,     //TODO
                    color: '#6C6C6C', //TODO
                    fillOpacity: fillOpacity
                });    
            });


		}

		this.geoJsonLayerGroup.addLayer(geoJsonLayer);

  	},

	roomForm_onCloseForm: function() {
		// close the form
		View.panels.get('roomForm').closeWindow();
	},

	roomForm_onSaveForm: function() {		
		// close the form
		View.panels.get('roomForm').closeWindow();
	},	

  	showLegend: function(){
		mapController.mapControl.showMarkerLegend();
	},

	showRoomDetails: function(assetKey) {
		//console.log('showRoomDetails...');
    	//parse asset_id for room keys
    	var roomKey = assetKey.split('_');
    	var bl_id = roomKey[0];
    	var fl_id = roomKey[1];
    	var rm_id = roomKey[2];
        //create restriction
        var restriction = new Ab.view.Restriction();
        restriction.addClause('rm.bl_id', bl_id, '=', 'AND');
        restriction.addClause('rm.fl_id', fl_id, '=', 'AND');
        restriction.addClause('rm.rm_id', rm_id, '=');
        //show the form
        this.roomForm.refresh(restriction);
        var offsetX = $(document).body.offsetWidth - 425;
        var offsetY = 75;
        this.roomForm.showInWindow({ 
            width: 400, height: 300, 
            x: offsetX, y: offsetY,
            closeButton: false });

	},

  	switchBasemapLayer: function(item) {
    	//switch the map layer based on the passed in layer name.
    	mapController.mapControl.switchBasemapLayer(item.text);
    },  

	switchMapLevel: function(item){

		switch(item.text) {
			case 'Level 0':
				mapController.loadFloorPlanJson(level0RmJson);
				break;
			case 'Level 1':
				mapController.loadFloorPlanJson(level1RmJson);
					break;
			case 'Level 2':
				mapController.loadFloorPlanJson(level2RmJson);
					break;	
			case 'Level 3':
				mapController.loadFloorPlanJson(level3RmJson);
					break;					
			default:
				mapController.loadFloorPlanJson(level1RmJson);
				//console.log('Undefined floor level specified -- loading level 1...');
				break;
		}

	},

	updateLegendContent: function() {

		var htmlContent;

        var title = 'Rooms by Category';
        htmlContent = "<table>";
        htmlContent += "<tr><td colspan='2' class='leafletLegendTitle'>" + title + "</td></tr>";
        
        for (i=0; i<this.roomsByCategoryList.length; i++) {
          var backgroundColor = this.roomsByCategoryList.get(i).color;
          var label = this.roomsByCategoryList.get(i).description;
          htmlContent += '<tr><td style=background-color:' + backgroundColor + '>&nbsp;&nbsp;&nbsp;</td><td class="leafletLegendLabel">' + label + '</td></tr>';          
        }
        
        htmlContent += '</table>';

    	document.getElementById('mapDiv_leafletLegendContent').innerHTML = htmlContent;

	}

 });