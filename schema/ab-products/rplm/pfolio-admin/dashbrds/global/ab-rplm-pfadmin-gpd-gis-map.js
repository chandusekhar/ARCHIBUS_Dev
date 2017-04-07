function mapLoadedCallback(){
	// refresh the map control
	abRplmPfadminGpdGisCtrl.map.refresh(abRplmPfadminGpdGisCtrl.restriction);

	// basemap layer menu
	var basemapLayerMenu = abRplmPfadminGpdGisCtrl.mapPanel.actions.get('basemapLayerMenu');
	basemapLayerMenu.clear();
	var basemapLayers = abRplmPfadminGpdGisCtrl.map.getBasemapLayerList();
	for (var i=0; i<basemapLayers.length; i++){
		basemapLayerMenu.addAction(i, basemapLayers[i], abRplmPfadminGpdGisCtrl.switchBasemapLayer);
	}

}

function beforeTabChange(tabPanel, selectedTabName) {
	if (selectedTabName == 'abRplmPfadminGpdGisTabs_map') {
		// remove the map control
		abRplmPfadminGpdGisCtrl.map.remove();
	}
}

function afterTabChange(tabPanel, selectedTabName) {
	if (selectedTabName == 'abRplmPfadminGpdGisTabs_map') {
		// recreate/init the map control
		abRplmPfadminGpdGisCtrl.initMap();

		// refresh view from restriction
		abRplmPfadminGpdGisCtrl.map.refresh.defer(500, abRplmPfadminGpdGisCtrl.map, [abRplmPfadminGpdGisCtrl.restriction]);

	}
}

var mapConfigObject = {
	"mapLoadedCallback" : mapLoadedCallback
};

var abRplmPfadminGpdGisCtrl = View.createController('abRplmPfadminGpdGisCtrl', {
	
	objFilter: null,

	map: null,
	
	layerMenu: null,
	
	restriction: null,
	
	hasValidGisLicense: true,
	
	layer: null,

	mapLevelBeforeTabChange: null,
	
	afterViewLoad: function(){ 

    	var configObject = new Ab.view.ConfigObject();
		this.map = new Ab.arcgis.ArcGISMap('mapPanel', 'map', configObject);

		var blMarkerProperty = new Ab.arcgis.ArcGISMarkerProperty('abRplmPfadminGpdGis_ds', ['bl.lat', 'bl.lon'], ['bl.bl_id'], ['bl.address1', 'bl.name', 'bl.site_id', 'bl.city_id', 'bl.state_id', 'bl.ctry_id', 'bl.use1']);
		blMarkerProperty.showLabels = false;
		var thematicBuckets = [];	
		blMarkerProperty.setThematic('bl.use1', thematicBuckets); 		
		this.map.updateDataSourceMarkerPropertyPair('abRplmPfadminGpdGis_ds', blMarkerProperty);		

		this.map.addMarkerAction(getMessage("labelShowDetails"), showBuildingDetails);

		var detailsPanel = View.panels.get('abRplmPfadminGpdGis_report');
		var viewPanelObj = this.view.getOpenerView().panels.get('abGpdGis');
		viewPanelObj.addShowAsDialog(detailsPanel, viewPanelObj.fileName);
		
	},

	initMap: function(){
    	var configObject = new Ab.view.ConfigObject();
		this.map = new Ab.arcgis.ArcGISMap('mapPanel', 'map', configObject);

		var blMarkerProperty = new Ab.arcgis.ArcGISMarkerProperty('abRplmPfadminGpdGis_ds', ['bl.lat', 'bl.lon'], ['bl.bl_id'], ['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.ctry_id', 'bl.use1']);
		blMarkerProperty.showLabels = false;
		var thematicBuckets = [];	
		blMarkerProperty.setThematic('bl.use1', thematicBuckets); 		
		this.map.updateDataSourceMarkerPropertyPair('abRplmPfadminGpdGis_ds', blMarkerProperty);		

		this.map.addMarkerAction(getMessage("labelShowDetails"), showBuildingDetails);
	},
	
	afterInitialDataFetch: function(){
		// apply esri css to map panel
		document.getElementById("mapPanel").className = 'claro'            

		// add onTabChange handlers
		this.abRplmPfadminGpdGisTabs.addEventListener('beforeTabChange', beforeTabChange);
		this.abRplmPfadminGpdGisTabs.addEventListener('afterTabChange', afterTabChange);

		// try to get restriction object from current view or from opener
		if (View.restriction != null){
			this.objFilter = View.restriction;
		} else if (View.getOpenerView().restriction != null){
			this.objFilter = View.getOpenerView().restriction;
		}
		
		var instructionLabel = '';
		// try to get instructionLabel object from filter controller
		if (View.controllers.get('ctrlGpdFilter') != null){
			instructionLabel = View.controllers.get('ctrlGpdFilter').instructionLabel;
		} else if (View.getOpenerView().controllers.get('ctrlGpdFilter') != null){
			instructionLabel = View.getOpenerView().controllers.get('ctrlGpdFilter').instructionLabel;
		}
		
		// display filter restriction as an instruction for maximized view
		if(valueExistsNotEmpty(View.parameters)){
			if(View.parameters.maximize){
				this.mapPanel.setInstructions(instructionLabel);
				this.abRplmPfadminGpdGis_report.setInstructions(instructionLabel);
			}
		}
		
		this.restriction = this.getSqlRestriction(this.objFilter);
		if (this.hasValidGisLicense) {
			if (this.map.map != null) {
				this.map.refresh(" bl.lat IS NOT NULL AND bl.lon IS NOT NULL AND " + this.restriction);
			}
		}else{
			this.abRplmPfadminGpdGisTabs.showTab('abRplmPfadminGpdGisTabs_map', false);
			this.abRplmPfadminGpdGisTabs.selectTab('abRplmPfadminGpdGisTabs_report');
		}
		this.abRplmPfadminGpdGis_report.refresh(this.restriction);
		
	},
	
	switchBasemapLayer: function(item) {
    	//switch the map layer based on the passed in layer name.
    	abRplmPfadminGpdGisCtrl.map.switchBasemapLayer(item.text);
    },

	mapPanel_onShowMap: function(str, level) {
		
		var blMarkerProperty = new Ab.arcgis.ArcGISMarkerProperty('abRplmPfadminGpdGis_ds', ['bl.lat', 'bl.lon'], ['bl.bl_id'], ['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.ctry_id', 'bl.use1']);		
		blMarkerProperty.showLabels = false;

		if( blMarkerProperty == null ){
			blMarkerProperty = new Ab.arcgis.ArcGISMarkerProperty('abRplmPfadminGpdGis_ds', ['bl.lat', 'bl.lon'],'bl.bl_id',['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.ctry_id', 'bl.use1']);		
			this.map.updateDataSourceMarkerPropertyPair('abRplmPfadminGpdGis_ds', blMarkerProperty);
		}

		var thematicBuckets = [];	
		blMarkerProperty.setThematic('bl.use1', thematicBuckets); 	
		
		this.map.refresh('1=1 ' + str);
	},
		
	getSqlRestriction: function( objFilter ){
		var result = "";
		if (objFilter != null) {
			if (valueExists(objFilter.bu_id)) {
				// is organization
				if(valueExistsNotEmpty(objFilter.dp_id)){
					result += "AND rm.dp_id = '" + objFilter.dp_id + "' ";
				}
				if(valueExistsNotEmpty(objFilter.dv_id)){
					result += "AND rm.dv_id = '" + objFilter.dv_id + "' ";
				}
				if(valueExistsNotEmpty(objFilter.bu_id) && result.length == 0 ){
					result += "AND EXISTS(SELECT dv.dv_id FROM dv WHERE dv.dv_id = rm.dv_id AND dv.bu_id = '" + objFilter.bu_id + "')";
				}
				if (result.length > 0 ) {
					result = "AND EXISTS(SELECT rm.bl_id FROM rm WHERE rm.bl_id = bl.bl_id " + result + ") ";
				}
			}else {
				// is location
				if (valueExistsNotEmpty(objFilter.site_id)) {
					result += "AND bl.site_id = '"+ objFilter.site_id +"' ";
				}
				if (valueExistsNotEmpty(objFilter.ctry_id)) {
					result += "AND bl.ctry_id = '"+ objFilter.ctry_id +"' ";
				}
				if (valueExistsNotEmpty(objFilter.geo_region_id) && result.length == 0 ) {
					result += "AND EXISTS(SELECT ctry.ctry_id FROM ctry WHERE ctry.ctry_id = bl.ctry_id AND ctry.geo_region_id = '" + objFilter.geo_region_id + "') ";
				}
			}
			
			if (valueExistsNotEmpty(objFilter.use1)) {
				result += "AND bl.use1 = '" + objFilter.use1 + "' ";
			}
			
			if (result.length == 0) {
				result = " 1 = 1 ";
			}else {
				if (result.indexOf("AND") == 0) {
					result = result.slice(3);
				}
			}
			
		} else {
			result = " 1 = 1 ";
		}
		return result;
	},

	abRplmPfadminGpdGis_report_detail_onClick: function(row){
		var blId = row.getFieldValue('bl.bl_id');
		this.openDetailsPopUp(blId);
	},

	openDetailsPopUp: function(blId){

		View.openDialog('ab-rplm-pfadmin-leases-and-suites-by-building-base-report.axvw',null, true, {
			width:1280,
			height:600, 
			closeButton:true,
				afterInitialDataFetch:function(dialogView){
					var dialogController = dialogView.controllers.get('repLeaseSuitesByBldgBase');
					dialogController.bl_id = blId;
					dialogController.initializeView();
				}
		});
		
	}
		
});

/**
 * Marker click event handler.
 * @param title
 * @param attributes
 */
function showBuildingDetails(title,attributes){
  	var controller = View.controllers.get("abRplmPfadminGpdGisCtrl");
	var blId = title;
	controller.openDetailsPopUp(blId);
}

