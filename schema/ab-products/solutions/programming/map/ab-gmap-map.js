/**
 * This example uses Google Map JavaScript API.
 * Please note that the Google Apps API is limited to development-use only and is free only for public-facing sites.  
 * Please refer to the Google Maps documentation for more information.
 *  
 **/
 
Ab.namespace('gmap');

//this is the map control itself.
var mapControl = null;

Ab.gmap.Map = Ab.view.Component.extend({
	
	//the Google Map
	map: null,
	
	// the panel that holds the div to the map
	panelId: '',
	
	//the div which holds the map
	divId: '',
	
	//the div which holds the map
	dataSourceId: '',
	
	//the graphic mouse click call back function passed in 
	mouseClickHandler: null,
	mouseClickEnabled: false,
	
	//the font of the text symbol
	textSymbolFont: 'BOLDER',
	
	//the color of the text symbol
	textSymbolColor: [255,215,0,1],
	
	// v3 api keeps track of markers instead of map
	markers: [],
	
	constructor: function(panelId, divId, dataSourceId) {
		mapControl = this;		
		this.divId = divId;	
		this.panelId = panelId;
		this.dataSourceId = dataSourceId;
	
		var mapOptions = {
				center: new google.maps.LatLng(0, -50),
                zoom: 2,
                mapTypeId: google.maps.MapTypeId.ROADMAP       		
        };
		
        this.map = new google.maps.Map(document.getElementById(this.divId),
        		mapOptions); 		      	
	},
	
	/*
	 *  Show address
	 *  @param string containing address
	 */ 
	showAddress: function(address) {
		if (this.map) {
			var map = this.map;
			var control = this;
			
			// delete overlays
			this.deleteOverlays();
			
			var geocoder = new google.maps.Geocoder();			
			geocoder.geocode( { 'address': address}, function(results, status) {
			    if (status == google.maps.GeocoderStatus.OK) {
				      map.setCenter(results[0].geometry.location);
				      map.setZoom(15);
				      var marker = new google.maps.Marker({
				          map: map,
				          position: results[0].geometry.location
				      });
				      control.markers.push(marker);
				      
				      var infowindow = new google.maps.InfoWindow({
				          content: address
				      });
				      infowindow.open(map, marker);
			    } else {
				      alert('Geocode was not successful for the following reason: ' + status);
			    }
			});		
		}
	},
	
	// private
	clearOverlays: function(){
		for (var i=0; i<this.markers.length; i++) {
			this.markers[i].setMap(null);
		}
	}, 

	// private
	deleteOverlays: function(){
		for (var i=0; i<this.markers.length; i++) {
			this.markers[i].setMap(null);
		}
		this.markers.length = 0;
	}, 
	
	/*
	 *   Show markers 
	 *   @param records json array of records
	 *   @param pkeyIDs array of pkeyIDs
	 *   @param infoFlds array of infofield ids
	 *   @param titles array of field titles
	 *   @param latitudeID	field name of latitutde
	 *   @param longitudeID field name of longitude
	*/ 
	showMarkers: function(records, pkeyIDs, infoFlds, titles, latitudeID, longitudeID) {
		if (this.map) {
			// switch to 2D
			this.switchMapLayer(google.maps.MapTypeId.ROADMAP);
			this.showInfoWindow();
			this.deleteOverlays();			    	
			var points = [];
			var map = this.map;
			this.map.setCenter(new google.maps.LatLng(0,0),0);
			var bounds = new google.maps.LatLngBounds(); 
			var control = this;
			
			// use event closures to control each marker's infowindow
			function createMarker(point, pkeyIDs, record) {
				var pkeys = getRecordValuesFromIDs(pkeyIDs, record, '-', [], false);
				var details = getRecordValuesFromIDs(infoFlds, record, '<br/>', titles, true);	
								
				// infowindow contents
				var iWindowDiv = document.createElement("div");
				var pkeyText = document.createTextNode(pkeys);
				var pkeyDiv = document.createElement("div");
				pkeyDiv.style.fontWeight = 'bold';				
				pkeyDiv.appendChild(pkeyText);
				pkeyDiv.innerHTML += '<hr/>';
				pkeyDiv.style.fontSize = '14px';
				//pkeyDiv.style.width = '200px';
																		
				var infoDiv = document.createElement("div");
				//infoDiv.style.width = '200px';
				infoDiv.innerHTML =  details;
				infoDiv.style.fontSize = '10px'; 		
				iWindowDiv.appendChild(pkeyDiv);					
				iWindowDiv.appendChild(infoDiv);
				
				// infowindow
				var content = iWindowDiv.innerHTML;
				var infowindow = new google.maps.InfoWindow({
					content: content
				});

				// marker
				var marker = new google.maps.Marker({
					map: map,
					title: pkeys,
					position: point
				});
				
				google.maps.event.addListener(marker,"mouseover", function() {
					infowindow.open(map, marker);
				});
				
				google.maps.event.addListener(marker, "click", mapControl.graphicsMouseClickHandler);								
				return marker;
			}
							
			for(var i=0; i<records.length; i++){
				var record = records[i].values;
				var point = new google.maps.LatLng(record[latitudeID], record[longitudeID]);
				points.push(point);
				bounds.extend(point);	
				var marker = createMarker(point, pkeyIDs, record)
				control.markers.push(marker);		     
			}

			// re-calculate centerpoint and zoom level for map according to markers
			this.map.fitBounds(bounds);			
		}
	},
	
	/*
	 *  Pass the custom marker click function out to this call back function	
	 */ 
	graphicsMouseClickHandler: function(evt) {  	
	  	if( mapControl.mouseClickEnabled ) {
	  		var marker = this;
	  		var attributes = this.getPosition();
	  		var title = this.getTitle();
	  		mapControl.mouseClickHandler(title, attributes);
	  	}
	},
	
	/*
	 *  Switch map layer
	 *  @param  valid options are:
	 *  		- google.maps.MapTypeId.ROADMAP displays the default road map view
	 *  		- google.maps.MapTypeId.SATELLITE displays Google Earth satellite images
	 *  		- google.maps.MapTypeId.HYBRID displays a mixture of normal and satellite views
	 *  		- google.maps.MapTypeId.TERRAIN displays a physical map based on terrain information. 
	 */	   
	switchMapLayer: function(layer) {
		this.map.setMapTypeId(layer);
	}, 	
	
	/*
	 *  @deprecated Enable information window	
	 */
	showInfoWindow: function() {		
		//this.map.enableInfoWindow();	
	},
	
	/*
	 *  @deprecated 
	 *  The default UI is on by default in v3. You can disable this by setting the disableDefaultUI property to true in the MapOptions object.
	 */
	showDefaultUI: function() {
	  	//this.map.setUIToDefault();
	},
		
	/*
	 *  define the graphic mouse click event call back function
	 *  @param {handler} Required.  The call back function name. 	
	 */
	addMouseClickEventHandler: function(handler) {
		this.mouseClickHandler = handler;
		this.mouseClickEnabled = true;
	},
	
	afterLayout: function() {
		if (Ext.isIE) {
			this.syncHeight.defer(500, this);
	    } else {
	    	this.syncHeight();
	    }
	},
	
	syncHeight: function() {
		var panelEl = Ext.get(this.panelId);
		var layoutEl = Ext.get(panelEl).parent().parent().parent();
		var panelHeight = layoutEl.getHeight();
		
		var mapEl = Ext.get(this.divId);
		if (Ext.isIE) {
			mapEl.setHeight(panelHeight - 46);
		} else {
			mapEl.setHeight(panelHeight - 28);
		}
	}
});

function getRecordValuesFromIDs(ids, record, delimiter, titles, bShowHeading){
	var str = "";
	for(var i=0; i<ids.length; i++){
		if(bShowHeading == true){
			str += '<i>' + titles[i] + ':&nbsp;&nbsp;&nbsp;&nbsp;</i>';
		}
		str += record[ids[i]] + delimiter;
	} 
	str = str.substring(0, str.length-1); 
	return str;
}