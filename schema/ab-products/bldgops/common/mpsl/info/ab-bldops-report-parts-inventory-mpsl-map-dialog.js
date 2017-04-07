/**
 * GIS-Map Controller
 * 
 * @author Jia Guoqiang
 */
var mapController = View.createController('mapController', {
	// Define Map Controller
	mapControl : null,
	// Part Code passed from opener view.
	partId: "",
	
	afterViewLoad : function() {
		var configObject = new Ab.view.ConfigObject();
		configObject.mapImplementation = 'Esri';
		configObject.basemap=View.getLocalizedString("World Light Gray Canvas")
		this.mapControl = new Ab.leaflet.Map('mapPanel', 'mapDiv', configObject);
	},

	afterInitialDataFetch : function() {
		this.partId=View.parameters["partId"];
		this.showStorageLocationMarkers();
		
	},
	
	/**
	 * Show storage location map marker.
	 */
	showStorageLocationMarkers : function() {
		
		this.setPtStoreLocRestriction();
		
		var storageLocCount=this.ptStoreLocMapDS.getRecords().length;
		
		if(storageLocCount>0){
			this.createPtStoreLocMarkerProperty();
			
			this.mapControl.showMarkers('ptStoreLocMapDS', null);
			
			this.mapControl.showMarkerLegend();
		}
		
		
        
        //this.mapControl.showMarkerLegend();
		
	},
	/**
	 * Show Marker legend
	 */
	showLegend: function(){
		mapController.mapControl.showMarkerLegend();
	},
	/**
	 * Create Part storage location marker property by part store location table.
	 * 
	 * @param ptStoreLocDataSource Part storage location datasource
	 * @param ptStoreLocKeyFields Part storage location primary key fields
	 * @param ptStoreLocGeometryFields Part storage location geometry fields
	 * @param ptStoreLocTitleField Part storage location title fields
	 * @param ptStoreLocContentFields Part storage location content fields
	 */
	createPtStoreLocMarkerProperty: function(){
		//Create Part Store Location Marker
		// create property markers
        var ptStoreLocDataSource = 'ptStoreLocMapDS';
        var ptStoreLocKeyFields = ['pt_store_loc_pt.pt_store_loc_id'];
        var ptStoreLocGeometryFields = ['pt_store_loc_pt.lon', 'pt_store_loc_pt.lat'];
        var ptStoreLocTitleField = 'pt_store_loc.bl_id';
        var ptStoreLocContentFields = [ 'pt_store_loc_pt.pt_store_loc_id','pt_store_loc.pt_store_loc_name','pt_store_loc_pt.qty_on_hand','pt_store_loc_pt.qty_to_order','pt_store_loc_pt.locationType'];
        
		
		
		//Get locator color
		var locatorColor=this.getPtStoreLocatorColor();
		//Get thematic Buckets 
		var thematicBuckets=this.getPtStoreThematicBuckets();
		
		var ptStoreLocMarkerProperties=null;
		
		colorbrewer['FP-YRG']={3:[]};
		colorbrewer['FP-YRG'][3]=locatorColor;
		
		
		ptStoreLocMarkerProperties = {
	        radius: 10,
	        //stroke properties
			stroke: true,
		    strokeColor: '#fff',
		    strokeWeight: 1.0,
	        // required for thematic markers
			renderer: 'thematic-class-breaks',
			thematicField: 'pt_store_loc_pt.locationType',
			thematicClassBreaks: thematicBuckets,
			colorBrewerClass: 'FP-YRG',
			// enable marker clusters
			useClusters: false
	   };  

        this.mapControl.createMarkers(
        	ptStoreLocDataSource, 
        	ptStoreLocKeyFields,
        	ptStoreLocGeometryFields,
        	ptStoreLocTitleField,
        	ptStoreLocContentFields,
        	ptStoreLocMarkerProperties
        );
	},
	
	/**
	 * Get part storage location 
	 */
	setPtStoreLocRestriction: function(){
		var partRes="1=1";
		if(valueExistsNotEmpty(this.partId)){
			partRes +=" and pt_store_loc_pt.part_id='"+this.partId+"'";
		}
		
		this.ptStoreLocMapDS.addParameter('partRes',partRes);
	},

	/**
	 * Get part storage location color by console record.
	 * 
	 * @param consoleRecord Console record
	 * @return locatorsColor Locator color
	 */
	getPtStoreLocatorColor: function(){
		//Red: #ff0000
		//Yellow: #ffff00
		//Green: #00ff00
		var locatorsColor=["#00ff00","#ff0000","#ffff00"];
		
		return locatorsColor;
	},
	/**
	 * get part storage location thematic buckets by console record.
	 * 
	 * @param consoleRecord Console record
	 * @return thematicBuckets Thematic buckets
	 */
	getPtStoreThematicBuckets: function(consoleRecord){
		var thematicBuckets=[1.5,2.5];
		return thematicBuckets;
	},
	
	
	/**
	 * The behavior of the Select link in the pop-up will depend on the filter criteria. 
	 * (1). If the user filtered on a Part Code, then the Select link will close the Find Parts window and will populate the Add Part form with the Part Code and the Storage Location Code. 
	 * 	 If the user had also filtered on a quantity available, that value will also be copied to the Add Part form.
	 * (2). If the user had not filtered on a Part Code, then the Select link will switch the view back to the Parts Inventory tab, and also filter on the selected Storage Location Code.
	 *   The user can the choose one of the Parts available in that storage location from the grid.
	 *
	 */
	showSelectLocationAction : function(keyValue,type) {
		
		View.parameters.callback(keyValue,type);

	}
});
/**
 * Marker purchase action event listener.
 * @param keyValue Key Value
 */
function markerPurchaseActionEvent(keyValue){
	//Replace keyValue by inner HTML of pop-up content title.
	View.controllers.get('mapController').showSelectLocationAction(keyValue,'Purchase');
}

/**
 * Marker requisition action event listener.
 * @param keyValue Key Value
 */
function markerRequisitionActionEvent(keyValue){
	//Replace keyValue by inner HTML of pop-up content title.
	View.controllers.get('mapController').showSelectLocationAction(keyValue,'Requistion');
}


Ab.leaflet.Base.prototype._recordsToGeoJson = function(dataSource, records) {
    var markerData=getMarkerDataIfDataSourceIsStorageLocation(dataSource, records,this);
	return markerData;
}
Ab.leaflet.Base.prototype._updateLegendContent=function(markerProperties) {
	//console.log('updateLegendContent...');  

    var htmlContent;
    
    htmlContent = "<table>";
    htmlContent += '<tr><td style="background-color:#00ff00; width:25px"></td><td class="leafletLegendLabel"><b>&nbsp;&nbsp;&nbsp;'+getMessage('mapGreenLabel')+'</b></td></tr>';   
    htmlContent += '<tr><td></td><td></td></tr>';
    htmlContent += '<tr><td style="background-color:#ffff00; width:25px"></td><td class="leafletLegendLabel"><b>&nbsp;&nbsp;&nbsp;'+getMessage('mapYellowLabel')+'</b></td></tr>';          
    htmlContent += '<tr><td></td><td></td></tr>';
    htmlContent += '<tr><td style="background-color:#ff0000; width:25px"></td><td class="leafletLegendLabel"><b>&nbsp;&nbsp;&nbsp;'+getMessage('mapRedLabel')+'</b></td></tr>';   
    htmlContent += "</table>";
    
    document.getElementById(this.divId +'_leafletLegendContent').innerHTML = htmlContent;
}

/**
 * get marker data from dataSource and records if dataSource is storage location.
 * @param dataSource DataSource
 * @param records Records
 * @param scope Scope
 */
function getMarkerDataIfDataSourceIsStorageLocation(dataSource, records,scope) {
    var markerData = {};
    var features = [];
    var markerProperties = scope._getMarkerPropertiesByDataSource(dataSource);
    var xCoord = markerProperties.geometryFields[0];
    var yCoord = markerProperties.geometryFields[1];
    var keyFields = markerProperties.keyFields;
    var contentFields = markerProperties.contentFields;
    
    // TODO add try/catch here
    // create geoJson for each record
    for (i=0; i<records.length; i++) {

      if ( records[i].values[xCoord] && records[i].values[yCoord] ) {

        var feature = {};

        // type
        feature.type = 'Feature';

        // geometry
        var geometry = {};
        geometry.type = 'Point';
        
        var coordinates = [ 
          records[i].values[xCoord],
          records[i].values[yCoord]
        ];
        geometry.coordinates = coordinates;

        feature.geometry = geometry;
        
        // properties
        properties = {};
        
        //Get all storage location from building.
        var blId=records[i].getValue('pt_store_loc.bl_id');
        
        var ptStoreLocDs=View.dataSources.get('ptStoreLocMapDS');
        var blRes=new Ab.view.Restriction();
        blRes.addClause('pt_store_loc.bl_id',blId,'=');
        
        var ptStoreRecords=ptStoreLocDs.getRecords(blRes);
        var ptStoreCount=ptStoreRecords.length;
        var popupContent ="";
    	for(var m=0;m<ptStoreCount;m++){
    		var storageLocId=ptStoreRecords[m].getValue('pt_store_loc_pt.pt_store_loc_id');
    		popupContent += '<div class="leaflet-popup-content-fields" id="leafletPopupContentFields">';
            for (j=0; j<contentFields.length; j++) {
              contentField=contentFields[j];
             
              var fieldTitle = scope._getFieldTitle(dataSource, contentField);
              var fieldValue = ptStoreRecords[m].values[contentField];
              if(contentField!='pt_store_loc_pt.locationType'){
            	  if(contentField=='pt_store_loc_pt.pt_store_loc_id'){
            		  popupContent += '<b>' + fieldValue + '</b>'; 
            		  
            		  popupContent +='&nbsp;&nbsp;&nbsp;'
            	  }else if(contentField=='pt_store_loc.pt_store_loc_name'){
            		  popupContent += fieldValue + '</br>';
            	  }else{
            		  popupContent += '<b>' + fieldTitle + '</b>: '+fieldValue+'</br>';
            	  }

            	  
              }
              properties[contentFields[j]] = fieldValue;
            }
            
            popupContent += "</div>";
            
            
            // format the title based on the title field and/or its lookup field
            var titleFieldValue = records[i].values[markerProperties.titleField];
            titleFieldValue = View.dataSources.get(dataSource).formatLookupValue(
                markerProperties.titleField, titleFieldValue, records[i].values);

            var popupTitle = '<span class="leaflet-popup-content-title" id="leafletPopupContentTitle">';
            popupTitle += titleFieldValue + '</span>';
            
          
            
            var popupAction = '<span class="leaflet-popup-action" id="PopupPurchaseAction"><a href="javascript: void(0);" onclick="markerPurchaseActionEvent(\''+storageLocId+'\')">'+getMessage('purchaseLinkTitle')+'</a></span>';
            popupAction +='&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
            popupAction += '<span class="leaflet-popup-action" id="PopupRequisitionAction"><a href="javascript: void(0);" onclick="markerRequisitionActionEvent(\''+storageLocId+'\')">'+getMessage('requisitionLinkTitle')+'</a></span>';
            
            popupContent += popupAction;
            popupContent +='</br>';
            
    	}

        feature.properties = properties;
        
        feature.properties.popupTitle = popupTitle;
        
        feature.properties.popupContent = popupContent;

        var keyValues = '';
        for (k=0; k<keyFields.length; k++){
          var keyValue = records[k].values[keyFields[k]];
          if (k === 0) {
            keyValues = keyValue;
          } else if (k > 0) {
            keyValues += '|' + keyValue;
          }
        }
        feature.properties.keyValues = keyValues;

        // add to features
        features.push(feature);        
      } 
    }
    

    markerData.type = 'Feature Collection';
    markerData.features = features;

    return markerData;    
  }