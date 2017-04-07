/**
 * This example uses Yahoo Map JavaScript API.
 * 
 * See http://developer.yahoo.com/maps/ajax/V2/reference.html.
 *  
 * Please note that The Yahoo! Maps AJAX API is limited to 50,000
 * queries per IP per day and to non-commercial use.
 **/

var mapExampleController = View.createController('mapExample', {

    /**
     * The map variable will hold the reference to the Yahoo Map control
     */
    map: null,
    
    /**
     * Called when the view is loaded.
     * Initializes the Yahoo Map control and sets the initial address to display.
     */
    afterViewLoad: function() {
        var address = "18 Tremont St, Boston, MA 02108";
        this.map = new YMap(document.getElementById('mapContainer')); 
        this.map.drawZoomAndCenter(address, 3);       
        this.map.geoCodeAddress(address);
        YEvent.Capture(this.map, EventsList.onEndGeoCode, setMarker);	
    },
    
    /**
     * Displays the selected building on the map.
     */
    yahooMap_buildingGrid_onShowOnMap: function(row, action) {
        var record = row.getRecord();        
        var building_id = record.getValue('bl.bl_id');
        var address = record.getValue('bl.address1') + ', ' + record.getValue('bl.address2') + ', ' + record.getValue('bl.ctry_id');
        this.map.removeMarkersAll();
        this.map.drawZoomAndCenter(address, 3);
        this.map.geoCodeAddress(address);       
    }
});

function setMarker(e){
	var map = e['ThisMap'];
	var geoPoint = e['GeoPoint'];
	
	var customImage = new YImage(); 
	customImage.src = View.getBaseUrl() +  '/schema/ab-system/graphics/ab-icon-rplm32.gif'; 
	//customImage.size = new YSize(20,20); 

	var marker = new YMarker(geoPoint, customImage);
	marker.addAutoExpand(e['Address']);
	map.addOverlay(marker);
}

