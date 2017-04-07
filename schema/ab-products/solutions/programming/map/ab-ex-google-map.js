/**
 * This example uses Google Map JavaScript API.
 * Please note that the Google maps API comes with licensing restrictions for non-customer-facing sites. 
 * Please refer to http://code.google.com/apis/maps/terms.html
 *  
 **/

var mapExampleController = View.createController('mapExample', {

    /**
     * The map variable will hold the reference to the Google Map control
     */
    map: null,
    
    /**
     * Called when the view is loaded.
     * Initializes the Google Map control and sets the initial address to display.
     */
    afterViewLoad: function() {
    	var configObject = new Ab.view.ConfigObject();
    	this.map = new Ab.gmap.Map('htmlMap', 'mapContainer', configObject);
    	var address = "18 Tremont St, Boston, MA";
    	this.map.showAddress(address);  
    },
           
    /**
     * Displays the selected building on the map.
     */
    googleMap_buildingGrid_onShowOnMap: function(row, action) {
    	var record = row.getRecord();
    	var building_id = record.getValue('bl.bl_id');
    	var address = record.getValue('bl.address1') + ', ' + record.getValue('bl.address2') + ', ' + record.getValue('bl.ctry_id');
    	this.map.showAddress(address); 
    }
});

