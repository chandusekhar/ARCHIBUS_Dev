/**
 * GIS-Map Controller
 * 
 * @author Jia Guoqiang
 */
var mapController = View.createController('mapController', {
	// Define Map Controller
	mapControl : null,
	//Define the Console form record
	consoleRecord : null,
	//marke map data from pt_store_loc or pt_store_loc_pt
	//if value='loc' , data retrive from pt_store_loc,
	// if value='loc_pt' , data retrive from pt_store_loc_pt
	mapDataType: "",
	
	afterViewLoad : function() {
		var configObject = new Ab.view.ConfigObject();
		configObject.mapImplementation = 'Esri';
    	configObject.basemap = View.getLocalizedString('World Light Gray Canvas');
		this.mapControl = new Ab.leaflet.Map('mapPanel', 'mapDiv', configObject);
		
	},

	afterInitialDataFetch : function() {
		//set the console record to consoleRecord
		this.consoleRecord=View.parameters['consoleRecord'];
		
		this.showStorageLocMarkers();
	},
	
	/**
	 * Show Marker legend
	 */
	showLegend: function(){
		mapController.mapControl.showMarkerLegend();
	},
	
	/**
	 * Show building map marker.
	 */
	showStorageLocMarkers : function() {
		var partCode="";//Part Code
		var partClass=""; //Part Classfication
		var whCode=""; // Part Store Location Code
		var whSite=""; //Part Store Location Site
		var whQuatity="";// Quantity Avaliable
		
		if(valueExistsNotEmpty(this.consoleRecord)){
			partCode = this.consoleRecord.getValue('pt.part_id');
			partClass = this.consoleRecord.getValue('pt.class');
			whCode = this.consoleRecord.getValue('pt_store_loc.pt_store_loc_id');
			whSite = this.consoleRecord.getValue('pt_store_loc.site_id');
			whQuatity = this.consoleRecord.getValue('pt_store_loc_pt.qty_on_hand');
		}
		//Clear Markers
		this.mapControl.clearMarkers();
		//If value of parts exists, create marker and restriction from part storage location table.
		if(valueExistsNotEmpty(partCode)||valueExistsNotEmpty(partClass)||valueExistsNotEmpty(whQuatity)){
			this.mapDataType="loc_pt";
			//Define Part Restriction
			var restriction=this.getPtStoreLocRestriction(this.consoleRecord);
			
			var ptStoreLocMapDs=View.dataSources.get('ptStoreLocMapDS');
			
			var ptStoreLocMapRecordsLength=ptStoreLocMapDs.getRecords(restriction).length;
			
			if(ptStoreLocMapRecordsLength>0){
				//create marker from part storage location table.
				this.createPtStoreLocMarkerProperty();
				this.mapControl.showMarkers('ptStoreLocMapDS', restriction);
		        
		        this.mapControl.showMarkerLegend();
			}
			
	        
		}else{
			this.mapDataType="loc";
			var restriction=this.getStoreLocRestriction(this.consoleRecord);
			var storeLocMapDs=View.dataSources.get('storeLocMapDs');
			
			var storeLocMapDsRecordsLength=storeLocMapDs.getRecords(restriction).length;
			
			if(storeLocMapDsRecordsLength>0){
				//create marker from storage location table.
				this.createStoreLocationMarkerproperty();
			
				this.mapControl.showMarkers('storeLocMapDs', restriction);
			}
			
		}
		
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
        var ptStoreLocKeyFields = ['pt_store_loc.pt_store_loc_id'];
        var ptStoreLocGeometryFields = ['bl.lon', 'bl.lat'];
        var ptStoreLocTitleField = 'pt_store_loc.bl_id';
        var ptStoreLocContentFields = ['pt_store_loc.pt_store_loc_id','pt_store_loc.pt_store_loc_name', 'pt_store_loc.qtyOnHand','pt_store_loc.qtyToOrder','pt_store_loc.locationType'];
        
		//Get locator color
		var locatorColor=this.getPtStoreLocatorColor();
		//Get thematic Buckets 
		var thematicBuckets=this.getPtStoreThematicBuckets();
		
		var ptStoreLocMarkerProperties=null;
		
		if(thematicBuckets.length==0){
			colorbrewer['FP-YRG']={1:[]};
			colorbrewer['FP-YRG'][1]=locatorColor;
			ptStoreLocMarkerProperties = {
				renderer: 'simple',
				radius: 10,
				fillColor: '#00ff00',
				//stroke properties
				stroke: true,
			    strokeColor: '#fff',
			    strokeWeight: 1.0,
			    //add marker action
			    //markerActionTitle: 'select',
			    //markerActionCallback: markerActionEvent,
				// enable marker clusters
				useClusters: false
			}; 
			
		}else{
			if(thematicBuckets.length==1){
				colorbrewer['FP-YRG']={2:[]};
				colorbrewer['FP-YRG'][2]=locatorColor;
			}
			if(thematicBuckets.length==2){
				colorbrewer['FP-YRG']={3:[]};
				colorbrewer['FP-YRG'][3]=locatorColor;
			}
			ptStoreLocMarkerProperties = {
		        radius: 10,
		        //stroke properties
				stroke: true,
			    strokeColor: '#fff',
			    strokeWeight: 1.0,
		        // required for thematic markers
				renderer: 'thematic-class-breaks',
				thematicField: 'pt_store_loc.locationType',
				thematicClassBreaks: thematicBuckets,
				colorBrewerClass: 'FP-YRG',
				 //add marker action
			    //markerActionTitle: 'select',
			    //markerActionCallback: markerActionEvent,
				// enable marker clusters
				useClusters: false
		   }; 
		} 

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
	 * Create map marker property by storage location table.
	 */
	createStoreLocationMarkerproperty: function(){
		var storeLocDataSource = 'storeLocMapDs';
        var storeLocKeyFields = ['pt_store_loc.pt_store_loc_id'];
        var storeLocGeometryFields = ['bl.lon', 'bl.lat'];
        var storeLocTitleField = 'pt_store_loc.bl_id';
        var storeLocContentFields = ['pt_store_loc.pt_store_loc_id','pt_store_loc.pt_store_loc_name'];
        
        var storeLocMarkerProperties = {
    		renderer: 'simple',
    		radius: 10,
    		fillColor: '#00ff00',
    		//stroke properties
    		stroke: true,
    		strokeColor: '#fff',
    		strokeWeight: 1.0
    		//add marker action
		    //markerActionTitle: 'select',
		    //markerActionCallback: markerActionEvent
    	};
        
        this.mapControl.createMarkers(
        	storeLocDataSource, 
        	storeLocKeyFields,
        	storeLocGeometryFields,
        	storeLocTitleField,
        	storeLocContentFields,
        	storeLocMarkerProperties
       );
	},
	/**
	 * Get part storage location 
	 */
	getPtStoreLocRestriction: function(consoleRecord){
		var restriction=new Ab.view.Restriction();
		var partCode="";//Part Code
		var partClass=""; //Part Classfication
		var whCode=""; // Part Store Location Code
		var whSite=""; //Part Store Location Site
		var whQuatity="";// Quantity Avaliable
		
		if(valueExistsNotEmpty(this.consoleRecord)){
			partCode = this.consoleRecord.getValue('pt.part_id');
			partClass = this.consoleRecord.getValue('pt.class');
			whCode = this.consoleRecord.getValue('pt_store_loc.pt_store_loc_id');
			whSite = this.consoleRecord.getValue('pt_store_loc.site_id');
			whQuatity = this.consoleRecord.getValue('pt_store_loc_pt.qty_on_hand');
		}
		
		if((valueExistsNotEmpty(partCode))||(valueExistsNotEmpty(partClass))||(valueExistsNotEmpty(whQuatity))){
			
			var partRes="1=1";
			var storageLocRes="1=1";
			
			if(valueExistsNotEmpty(whCode)||(valueExistsNotEmpty(whSite))){
				
				if(valueExistsNotEmpty(whCode)){
					partRes +=" and pt_store_loc_pt.pt_store_loc_id='"+whCode+"'";
					storageLocRes +=" and pt_store_loc.pt_store_loc_id='"+whCode+"'";
				}
				if(valueExistsNotEmpty(whSite)){
					partRes +=" and pt_store_loc_pt.pt_store_loc_id in (select pt_store_loc_id from pt_store_loc where pt_store_loc.site_id='"+whSite+"')";
					storageLocRes +=" and pt_store_loc.pt_store_loc_id in (select pt_store_loc_id from pt_store_loc where pt_store_loc.site_id='"+whSite+"')";
				}
				
			}
			if(valueExistsNotEmpty(whQuatity)){
				this.ptStoreLocMapDS.addParameter('qtyAvaliableParameter',parseFloat(whQuatity));
			}
			
			if(valueExistsNotEmpty(partCode)){
				partRes +=" and pt_store_loc_pt.part_id='"+partCode+"'";
				storageLocRes +=" and pt_store_loc.pt_store_loc_id in (select pt_store_loc_id from pt_store_loc_pt where part_id='"+partCode+"')";
			}
			
			if(valueExistsNotEmpty(partClass)){
				partRes +=" and pt_store_loc_pt.part_id in (select part_id from pt where class='"+partClass+"')";
				storageLocRes +=" and pt_store_loc.pt_store_loc_id in (select pt_store_loc_id from pt_store_loc_pt where part_id in (select part_id from pt where class='"+partClass+"'))";
			}
			
			this.ptStoreLocMapDS.addParameter('partRes',partRes);
			this.ptStoreLocMapDS.addParameter('storageLocRes',storageLocRes);
			
		}else{
			if(valueExistsNotEmpty(whCode)||(valueExistsNotEmpty(whSite))){
				if(valueExistsNotEmpty(whCode)){
					restriction.addClause('pt_store_loc.pt_store_loc_id',whCode,'=');
				}
				if(valueExistsNotEmpty(whSite)){
					restriction.addClause('pt_store_loc.site_id',whSite,'=');
				}
			}
		}
		
		return restriction;
	},
	/**
	 * Get storage location from storage location table fields.
	 * 
	 * @param consoleRecord Console form record.
	 */
	getStoreLocRestriction: function(consoleRecord){
		var restriction=new Ab.view.Restriction();
		var whCode=""; // Part Store Location Code
		var whSite=""; //Part Store Location Site
		var blId=""; // Building Code
		if(valueExistsNotEmpty(consoleRecord)){
			whCode = this.consoleRecord.getValue('pt_store_loc.pt_store_loc_id');
			whSite = this.consoleRecord.getValue('pt_store_loc.site_id');
		}
		
		if(valueExistsNotEmpty(whCode)){
			restriction.addClause('pt_store_loc.pt_store_loc_id',whCode,'=');
		}
		if(valueExistsNotEmpty(whSite)){
			restriction.addClause('pt_store_loc.site_id',whSite,'=');
		}
		
		return restriction;
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
	getPtStoreThematicBuckets: function(){
		var thematicBuckets=[1.5,2.5];
		return thematicBuckets;
	},
	
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
/**
 * Marker action event listener.
 * @param keyValue Key Value
 */
function markerSelectEvent(keyValue){
	//Replace keyValue by inner HTML of pop-up content title.
	var storageLocId=keyValue;

	View.getOpenerView().controllers.get('partByLocationMpiwController').consoleForm_onBtnClear();
	View.getOpenerView().panels.get('consoleForm').setFieldValue('pt_store_loc.pt_store_loc_id',storageLocId);
	View.getOpenerView().controllers.get('partByLocationMpiwController').consoleForm_onBtnShow();
	
	View.getOpenerView().controllers.get('partByLocationMpiwController').showPartInventory(storageLocId,"");
	
	View.getOpenerView().closeDialog();
}


Ab.leaflet.Base.prototype._recordsToGeoJson = function(dataSource, records) {
    var markerData=getMarkerDataIfDataSourceIsStorageLocation(dataSource, records,this);
	
	return markerData;
}

Ab.leaflet.Base.prototype._updateLegendContent=function(markerProperties) {
	//console.log('updateLegendContent...');  

    var htmlContent;
    //Discussed with Burke that if Quantity Available value in console form not empty, the legend similar with Find Parts Map legend. else , similar with The first tab Map legend.
    if(valueExistsNotEmpty(View.controllers.get('mapController').consoleRecord.getValue('pt_store_loc_pt.qty_on_hand'))){
    	htmlContent = "<table>";
        htmlContent += '<tr><td style="background-color:#00ff00; width:25px"></td><td class="leafletLegendLabel"><b>&nbsp;&nbsp;&nbsp;'+getMessage('mapAvailableLabel')+'</b></td></tr>';   
        htmlContent += '<tr><td></td><td></td></tr>';
        htmlContent += '<tr><td style="background-color:#ffff00; width:25px"></td><td class="leafletLegendLabel"><b>&nbsp;&nbsp;&nbsp;'+getMessage('mapPartlyAvailableLabel')+'</b></td></tr>';          
        htmlContent += '<tr><td></td><td></td></tr>';
        htmlContent += '<tr><td style="background-color:#ff0000; width:25px"></td><td class="leafletLegendLabel"><b>&nbsp;&nbsp;&nbsp;'+getMessage('mapUnavailableLabel')+'</b></td></tr>';   
        htmlContent += "</table>";
    }else{
    	htmlContent = "<table>";
        htmlContent += '<tr><td style="background-color:#00ff00; width:25px"></td><td class="leafletLegendLabel"><b>&nbsp;&nbsp;&nbsp;'+getMessage('mapGreenLabel')+'</b></td></tr>';   
        htmlContent += '<tr><td></td><td></td></tr>';
        htmlContent += '<tr><td style="background-color:#ffff00; width:25px"></td><td class="leafletLegendLabel"><b>&nbsp;&nbsp;&nbsp;'+getMessage('mapYellowLabel')+'</b></td></tr>';          
        htmlContent += '<tr><td></td><td></td></tr>';
        htmlContent += '<tr><td style="background-color:#ff0000; width:25px"></td><td class="leafletLegendLabel"><b>&nbsp;&nbsp;&nbsp;'+getMessage('mapRedLabel')+'</b></td></tr>';   
        htmlContent += "</table>";
    }
    
    
    
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
        
        var ptStoreLocDs=View.dataSources.get(dataSource);
        var blRes=new Ab.view.Restriction();
        blRes.addClause('pt_store_loc.bl_id',blId,'=');
        
        //If pt_store_loc_id exits in console form , only show storage location
        var ptStoreLocIdInConsole=View.controllers.get('mapController').consoleRecord.getValue('pt_store_loc.pt_store_loc_id');
        if(valueExistsNotEmpty(ptStoreLocIdInConsole)){
        	blRes.addClause('pt_store_loc.pt_store_loc_id',ptStoreLocIdInConsole,'=');
        }
        
        var ptStoreRecords=ptStoreLocDs.getRecords(blRes);
        var ptStoreCount=ptStoreRecords.length;
        var popupContent ="";
    	for(var m=0;m<ptStoreCount;m++){
    		var storageLocId=ptStoreRecords[m].getValue('pt_store_loc.pt_store_loc_id');
    		popupContent += '<div class="leaflet-popup-content-fields" id="leafletPopupContentFields">';
            for (j=0; j<contentFields.length; j++) {
              contentField=contentFields[j];
             
              var fieldTitle = scope._getFieldTitle(dataSource, contentField);
              var fieldValue = ptStoreRecords[m].values[contentField];
              if(contentField!='pt_store_loc.locationType'){
            	  if(contentField=='pt_store_loc.pt_store_loc_id'){
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
            var popupAction =null;
            if(valueExistsNotEmpty(View.controllers.get('mapController').consoleRecord.getValue('pt.part_id'))){
            	 popupAction = '<span class="leaflet-popup-action" id="PopupPurchaseAction"><a href="javascript: void(0);" onclick="markerPurchaseActionEvent(\''+storageLocId+'\')">'+getMessage('purchaseLinkTitle')+'</a></span>';
                 popupAction +='&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
                 popupAction += '<span class="leaflet-popup-action" id="PopupRequisitionAction"><a href="javascript: void(0);" onclick="markerRequisitionActionEvent(\''+storageLocId+'\')">'+getMessage('requisitionLinkTitle')+'</a></span>';
                 
            }else{
            	var popupAction = '<span class="leaflet-popup-action" id="PopupAction"><a href="javascript: void(0);" onclick="markerSelectEvent(\''+storageLocId+'\')">'+getMessage('selectLinkTitle')+'</a></span>';
            }
            
            
            
            popupContent += popupAction;
            
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


