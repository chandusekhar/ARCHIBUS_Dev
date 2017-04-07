   /**
     * @Author MuLiang
	 */
// check GIS license
var isValidGisLicense = false;

var abWasteDefStorageTankController = View.createController('abWasteDefStorageTankController',
  {
					//Current Selected Node 
					curTreeNode : null,
					siteId : '',
					parentNode : '',
					selectedStorageLocation:'',	
					
					
					/**
					 * Control add new button status after refreshed
					 */
					afterInitialDataFetch : function() {
						isValidGisLicense = hasValidArcGisMapLicense();
						this.abWasteDefStorageTankTree1Panel.actions.get('addNew').forceDisable(true);
						//because of map initialization problems with showOnLoad=false, we show, but disable the map and details panel
						this.abWasteDefStorageTankDetailsPanel.clear();
						this.abWasteDefStorageTankDetailsPanel.disable();
						this.mapPanel.disable();
					
					},
				    /**
				     * private method: find current tree node according to form data
				     */
				    getTreeNodeByCurEditData: function( fieldValue, parentNode){
				        	for (var i = 0; i < parentNode.children.length; i++) {
				                var node = parentNode.children[i];
				                if (node.data['site.site_id'] == fieldValue) {
				                    return node;
				                }
				            }
				        return null;
				    },
				    /**
				     * private method,refreshTree when data be changed.
				     */
				    refreshTreeNode: function(nodeBlId){
				    	if(nodeBlId){
				    		this.abWasteDefStorageTankTree1Panel.refreshNode(nodeBlId);
				    		nodeBlId.expand();
				    	}
				    },
				
				/* *
				 * set the edit panel's "waste_areas.site_id" field
				 * values be the same with lastNodeClicked
				 */ 
				abWasteDefStorageTankTree1Panel_onAddNew : function() {
					this.mapPanel.enable();
					this.abWasteDefStorageTankDetailsPanel.enable();					
					this.abWasteDefStorageTankDetailsPanel.clear();
					this.abWasteDefStorageTankDetailsPanel.newRecord = true;
			     	this.abWasteDefStorageTankDetailsPanel.show(true);
			     	this.abWasteDefStorageTankDetailsPanel.refresh();
					this.abWasteDefStorageTankDetailsPanel.setFieldValue("waste_areas.site_id", this.siteId);
				},
				/**
				 * Update or save property record
				 */
				abWasteDefStorageTankDetailsPanel_onSave: function(){
                   if (this.abWasteDefStorageTankDetailsPanel.canSave()) {
                    
                            var rootNode = this.abWasteDefStorageTankTree1Panel.treeView.getRoot();
                    	    var oldFieldValue = this.abWasteDefStorageTankDetailsPanel.getOldFieldValues()[("waste_areas.site_id")];
                    		if ( this.abWasteDefStorageTankDetailsPanel.save()) {
                    			var oldNodeBlId = this.getTreeNodeByCurEditData(oldFieldValue,rootNode);
                    			this.refreshTreeNode(oldNodeBlId);
                    			var fieldValue = this.abWasteDefStorageTankDetailsPanel.getFieldValue('waste_areas.site_id');
                    			var nodeBlId = this.getTreeNodeByCurEditData(fieldValue,rootNode);
                    			this.refreshTreeNode(nodeBlId);
                            }
							this.selectedStorageLocation = this.abWasteDefStorageTankDetailsPanel.getFieldValue("waste_areas.storage_location");
                        
                    }
                },
                
			    abWasteDefStorageTankDetailsPanel_afterRefresh: function(){
			    	// disable Locate on Map button
			    	if (!isValidGisLicense) {
			    		this.abWasteDefStorageTankDetailsPanel.actions.get('locateOnMap').enable(false);
			    	}
                    this.selectedStorageLocation = this.abWasteDefStorageTankDetailsPanel.getFieldValue("waste_areas.storage_location");
                },
                
                abWasteDefStorageTankDetailsPanel_onCancel: function(){
                	this.abWasteDefStorageTankDetailsPanel.clear();
                	this.abWasteDefStorageTankDetailsPanel.disable();
    				this.mapPanel.disable();                    
                }
                
                
  });


 var mapController = View.createController('showMap', {
	// Ab.arcgis.ArcGISMap control instance
	// the mapControl is equiv to the mapPanel
	mapControl: null, 
	
	// Ab.arcgis.LocateAssetTool instance
	locateAssetTool: null, 
	
	// asset record
	assetRecord: null,
	assetRowIndex: null,
	
	// asset grid
	selectedAssetRows: [],
	checkBoxAllSelected: false,
	
	// asset map extent
	assetMapExtent: null,
	
	// map click handler handle
	dojoMapZoomHandle: null,
	
	afterViewLoad: function(){
    	var configObject = new Ab.view.ConfigObject();
    	this.mapControl = new Ab.arcgis.ArcGISMap('mapPanel', 'map', configObject);
		this.locateAssetTool = new Ab.arcgis.AssetLocator(this.mapControl);		
		
		// disable controls until selection	
		//mapController.toggleMapPanelControls(false);
				
		// overrides Grid.onChangeMultipleSelection
		/*this.assetPanel.addEventListener('onMultipleSelectionChange', function(row) {
			var selection = View.panels.get('assetPanel').getSelectedRows();
			if( selection[0] ){
				View.controllers.get('showMap').toggleAssetPanelControls(true);
			}
			else {
				View.controllers.get('showMap').toggleAssetPanelControls(false);
			}
		})
		*/
				
	},
			
	afterInitialDataFetch: function() {
      	var reportTargetPanel = document.getElementById("mapPanel");
      	var bodyElem = reportTargetPanel.parentNode;    
      	reportTargetPanel.className = 'claro';		
		
		//disable controls until selection
		mapController.toggleAssetPanelControls(false);
	},	
	
	prepareData: function(){
    	var blMarkerProperty = new Ab.arcgis.ArcGISMarkerProperty('abWasteDefStorageTankDetailsDS', ['waste_areas.lat', 'waste_ares.lon'],'waste_areas.storage_location',['waste_areas.storage_location','waste_areas.area_type','waste_areas.site_id','waste_areas.pr_id','waste_areas.bl_id','waste_areas.fl_id','waste_areas.rm_id']);
    	this.mapControl.updateDataSourceMarkerPropertyPair('abWasteDefStorageTankDetailsDS', blMarkerProperty);
    },
	
	/**
	 * Creates a restriction based on selected rows.
	 */
	getRestriction: function(rows) {
    	var selectedRows = this.assetPanel.getSelectedRows(rows);  
    	var restriction = new Ab.view.Restriction();
    	if(selectedRows.length !== 0 ) {
 			for (var i = 0; i < selectedRows.length; i++) {
 				restriction.addClause('bl.bl_id', selectedRows[i]['bl.bl_id'], "=", "OR");
 			}
    	}
    	else{
    		restriction.addClause('bl.bl_id', 'null', "=", "OR");
    	}
    	return restriction;
	},
	
	abWasteDefStorageTankDetailsPanel_onShowAssets: function() {   

    	var blMarkerProperty = this.mapControl.getMarkerPropertyByDataSource('abWasteDefStorageTankDetailsDS');
    	
    	if( blMarkerProperty == null ){
    		this.prepareData();
    		blMarkerProperty = this.mapControl.getMarkerPropertyByDataSource('abWasteDefStorageTankDetailsDS');
    	}
    	var restriction = this.abWasteDefStorageTankDetailsPanel.restriction;
    	blMarkerProperty.setRestriction(restriction);
    	this.mapControl.updateDataSourceMarkerPropertyPair('abWasteDefStorageTankDetailsDS', blMarkerProperty);
    	this.mapControl.refresh();
		
	}, 
	
	assetPanel_afterRefresh : function() {
		var grid = this.assetPanel;
		var selectedRows = this.selectedAssetRows;
		for(var i=0; i < selectedRows.length; i++) {
			var index = selectedRows[i].row.getIndex();
			grid.selectRowChecked(index, true);
		}

		if(this.checkAllBoxSelected){
			var checkAllEl = Ext.get('assetPanel_checkAll');
			checkAllEl.dom.checked = true;
		}
		
		// re-select active asset row
		if (this.assetRowIndex) {
			grid.selectRow(assetRowIndex);
		}
		
		this.selectedAssetRows = [];
		this.checkAllBoxSelected = false;
	},
	
	startLocateAsset: function() {		
		
		var restriction = this.abWasteDefStorageTankDetailsPanel.restriction;
		var assetRecord = this.abWasteDefStorageTankDetailsDS.getRecord(restriction);
		
		// if there is a ds restriction, a refresh will cause the map to zoom to the extent 
		// of the current restriction... undesireable under most circumstances
		// re-zoom map to location asset  
		var lon = assetRecord.getValue('waste_areas.lon');
		var lat = assetRecord.getValue('waste_areas.lat');
		if (!!lon && !!lat) {
			var point = esri.geometry.geographicToWebMercator(new esri.geometry.Point(lon, lat));
			var mapLevel = this.mapControl.map.getLevel();
			if ( mapLevel > 17 ) {
				this.mapControl.map.centerAt( point );
			}
			else {
				this.mapControl.map.centerAndZoom( point, 17 );
			}
		}
		else
		{
			// geometry doesnt exist -- just stay where we are and let the user navigate the map
		}
		
		// END traditional marker property approach
		
		// enable/disable various controls
		mapController.toggleMapPanelControls(true);
		mapController.toggleAssetPanelControls(false);
		mapController.toggleCheckBoxControls(true);
		
		// perform location
		//
		// parameters:
		// dataSourceName - the dataSource to get records from
		// restriction - the restriction to apply to the datasource
		// pkField - the primary key field for the table
		// geometry fields - an array of geometry fields for the table
		// infoFields - an array of fields to display in the infoWindow
		// 
		
		mapController.locateAssetTool.startLocate(
			'abWasteDefStorageTankDetailsDS',
			restriction,
			'waste_areas.storage_location',
			['waste_areas.lon', 'waste_areas.lat'],
			['waste_areas.storage_location','waste_areas.area_type','waste_areas.site_id','waste_areas.pr_id','waste_areas.bl_id','waste_areas.fl_id','waste_areas.rm_id']
		);	
	},

	mapPanel_onCancelLocateAsset: function() {
		mapController.toggleMapPanelControls(false);
		mapController.toggleCheckBoxControls(false);
		mapController.locateAssetTool.cancelLocate();
	},
	
	mapPanel_onFinishLocateAsset: function() {

		// get coords and save asset record
		var assetCoords = mapController.locateAssetTool.finishLocate();
		var lon = assetCoords[0];
		var lat = assetCoords[1];
		/*
		assetRecord.setValue('bl.lon', lon);
		assetRecord.setValue('bl.lat', lat);
		mapController.assetDS.saveRecord(assetRecord);
		*/
		//update details panel edit form field values only - allow user to click Save in that panel to commit to database
		this.abWasteDefStorageTankDetailsPanel.setFieldValue('waste_areas.lon',lon);
		this.abWasteDefStorageTankDetailsPanel.setFieldValue('waste_areas.lat',lat);
		
		// disable/enable panel actions
		mapController.toggleMapPanelControls(false);
		mapController.toggleAssetPanelControls(true);
		mapController.toggleCheckBoxControls(false);
		// refresh map graphics in case assets are showing
		var restriction = mapController.getRestriction();
		mapController.mapControl.refresh(restriction);			
		
		// if restriction -- reset map extent
		// should this be in the core ??? 
		dojoMapZoomHandle = dojo.connect(mapController.mapControl.map, 'onZoomEnd', mapController.zoomToAssetMapExtent);
						
	},
	
	zoomToAssetMapExtent: function(extent, zoomFactor, anchor, level) {
		// remove map listener
		dojo.disconnect( dojoMapZoomHandle );
		
		if ( mapController.assetMapExtent ) {
			mapController.mapControl.map.setExtent( mapController.assetMapExtent );
			mapController.assetMapExtent = null;		
		}		
	},
	
	toggleAssetPanelControls: function(value) {
		//this.assetPanel.actions.get('showAssets').forcedDisabled = false;
		//this.assetPanel.actions.get('geocodeAssets').forcedDisabled = false;
		//this.assetPanel.actions.get('showAssets').enable(value);
		//this.assetPanel.actions.get('geocodeAssets').enable(value);
	},
	
	toggleMapPanelControls: function(value) {
		//this.mapPanel.actions.get('cancelLocateAsset').forcedDisabled = false;
		//this.mapPanel.actions.get('finishLocateAsset').forcedDisabled = false;
		//this.mapPanel.actions.get('cancelLocateAsset').enable(value);
		//this.mapPanel.actions.get('finishLocateAsset').enable(value);
	},
	
	toggleCheckBoxControls: function(value) {
		// get all inputs
		var inputs = Ext.query('input');
		// disable checkboxes only
		for(i=0; i < inputs.length; i++) {
			if (inputs[i].type == 'checkbox') {
				inputs[i].disabled = value;
			}
		}
	}
});
 
  
  
/**
 * This event handler is called by 'Delete' button in Certification Levels Edit form. 
 */
function refreshTree(){
	var c=abWasteDefStorageTankController;
	var record = c.abWasteDefStorageTankDetailsPanel.getRecord();
	var siteIdPK = record.getValue('waste_areas.site_id');
	var rootNode = c.abWasteDefStorageTankTree1Panel.treeView.getRoot();
	var nodeBlId = c.getTreeNodeByCurEditData(siteIdPK,rootNode);
	c.refreshTreeNode(nodeBlId);
}

//set addNew button enable when any Tree level 1 node be clicked
function selectValueFromTreeSite(){
	var curTreeNode = View.panels.get("abWasteDefStorageTankTree1Panel").lastNodeClicked;
	curTreeNode.expand();
	abWasteDefStorageTankController.siteId = curTreeNode.data['site.site_id'];
	abWasteDefStorageTankController.abWasteDefStorageTankTree1Panel.actions.get('addNew').forceDisable(false);
	abWasteDefStorageTankController.curTreeNode = curTreeNode;
}
// set addNew button disable when any Tree level 2 node be clicked
function setAddNewButtonStatus() {
	var curTreeNode = View.panels.get("abWasteDefStorageTankTree1Panel").lastNodeClicked;
	var detailForm=abWasteDefStorageTankController.abWasteDefStorageTankDetailsPanel;
	abWasteDefStorageTankController.siteId = curTreeNode.parent.data['site.site_id'];
	abWasteDefStorageTankController.abWasteDefStorageTankTree1Panel.actions.get('addNew').forceDisable(false);
	abWasteDefStorageTankController.curTreeNode = curTreeNode;
	
	mapController.mapPanel.enable();
	detailForm.enable();
	detailForm.clear();
	detailForm.newRecord = false;
	var restriction = new Ab.view.Restriction();
	//restriction record which has been clicked apply to details panel 
	restriction.addClause('waste_areas.site_id', curTreeNode.parent.data['site.site_id']);
	restriction.addClause('waste_areas.storage_location', curTreeNode.data['waste_areas.storage_location']);
	detailForm.refresh(restriction);
	
}
/**
 * auto add related fields associated to the selected pr_id in the property table
 * @param fieldName
 * @param selectedValue
 * @param previousValue
 */
function onSelectProperty(fieldName,selectedValue,previousValue) {
	var editPanel =  View.panels.get("abWasteDefStorageTankDetailsPanel");
	if (fieldName == 'waste_areas.pr_id' && selectedValue != previousValue&&valueExists(selectedValue)) {
		editPanel.setFieldValue(fieldName,selectedValue);
		var dataSource = View.dataSources.get('abWasteDefStorageTankPropertyDS');
		var restriction = new Ab.view.Restriction();
		restriction.addClause("property.pr_id", selectedValue, "=", true);
		var record = dataSource.getRecord(restriction);
		editPanel.setFieldValue('waste_areas.site_id',record.getValue('property.site_id'));
		//if waste location does not yet have coordinate information, supply values from the property table
		if(editPanel.getFieldValue('waste_areas.lat')=='' || editPanel.getFieldValue('waste_areas.lon')==''){		
			//KB3031547 - get localized value for numer type field to avoid number format error in non-english locale(Guo 2011/06/07)
			editPanel.setFieldValue('waste_areas.lat',record.getLocalizedValue('property.lat'));
			editPanel.setFieldValue('waste_areas.lon',record.getLocalizedValue('property.lon'));
		}
	}
}
/**
 * auto add related fields associated to the selected bl_id in the bl table
 * @param fieldName
 * @param selectedValue
 * @param previousValue
 */
function onSelectBl(fieldName,selectedValue,previousValue) {
	var editPanel =  View.panels.get("abWasteDefStorageTankDetailsPanel");
	if (fieldName == 'waste_areas.bl_id' && selectedValue != previousValue&&valueExists(selectedValue)) {
		editPanel.setFieldValue(fieldName,selectedValue);
		var dataSource = View.dataSources.get('abWasteDefStorageTankBlDS');
		var restriction = new Ab.view.Restriction();
		restriction.addClause("bl.bl_id", selectedValue, "=", true);
		var record = dataSource.getRecord(restriction);
		editPanel.setFieldValue('waste_areas.site_id',record.getValue('bl.site_id'));
		//if waste location does not yet have coordinate information, supply values from the property table		
		if(editPanel.getFieldValue('waste_areas.lat')=='' || editPanel.getFieldValue('waste_areas.lon')==''){		
			//KB3031547 - get localized value for numer type field to avoid number format error in non-english locale(Guo 2011/06/07)
			editPanel.setFieldValue('waste_areas.lat',record.getLocalizedValue('bl.lat'));
			editPanel.setFieldValue('waste_areas.lon',record.getLocalizedValue('bl.lon'));
		}
	}
}
/**
 * auto add related fields associated to the selected site_id in the site table
 * @param fieldName
 * @param selectedValue
 * @param previousValue
 */
function onSelectSite(fieldName,selectedValue,previousValue) {
	var editPanel =  View.panels.get("abWasteDefStorageTankDetailsPanel");
	if (fieldName == 'waste_areas.site_id' && selectedValue != previousValue&&valueExists(selectedValue)) {
		editPanel.setFieldValue(fieldName,selectedValue);
		var dataSource = View.dataSources.get('abWasteDefStorageTankBlDS');
		var restriction = new Ab.view.Restriction();
		restriction.addClause("bl.site_id", selectedValue, "=", true);
		var record = dataSource.getRecord(restriction);		
		//if waste location does not yet have coordinate information, supply values from the property table		
		if(editPanel.getFieldValue('waste_areas.lat')=='' || editPanel.getFieldValue('waste_areas.lon')=='') {		
			//KB3031547 - get localized value for numer type field to avoid number format error in non-english locale(Guo 2011/06/07)
			editPanel.setFieldValue('waste_areas.lat',record.getLocalizedValue('bl.lat'));
			editPanel.setFieldValue('waste_areas.lon',record.getLocalizedValue('bl.lon'));
		}
	}
}

	/**
	 * Opens view with GIS map.
	 */
function openMapView(){
	View.openDialog('ab-waste-gis-map.axvw', null, false, {
	        width: 1000,
	        height: 800,
	        closeButton: false,
	        afterInitialDataFetch: function(dialogView){
	            var dialogController = dialogView.controllers.get('mapCtrl');
	    		var restriction = new Ab.view.Restriction();
	    		restriction.addClause('waste_areas.storage_location', abWasteDefStorageTankController.selectedStorageLocation);
	    		dialogController.parentRestriction = restriction; 
	    		dialogController.parentFormPanel = abWasteDefStorageTankController.abWasteDefStorageTankDetailsPanel;
	    		dialogController.showAssets();
	        }
	    });
}


function locateOnMap(){
	var mapController = View.controllers.get('showMap');		
	mapController.startLocateAsset();
}