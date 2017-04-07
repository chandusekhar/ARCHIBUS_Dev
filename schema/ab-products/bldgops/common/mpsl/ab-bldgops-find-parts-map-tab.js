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
	/**
	 * Constructor
	 */
	afterCreate : function() {
		var parentController=View.getOpenerView().controllers.get('findPartsController');
		parentController.on("app:operation:express:mpiw:onShowButtonClicked",this.onShowWarehouseMap);
		parentController.on("app:operation:express:mpiw:onClearButtonClicked",this.onShowWarehouseMap);
	},
	
	afterViewLoad : function() {
		var configObject = new Ab.view.ConfigObject();
		configObject.mapImplementation = 'Esri';
    	configObject.basemap = View.getLocalizedString('World Light Gray Canvas');
		this.mapControl = new Ab.leaflet.Map('mapPanel', 'mapDiv', configObject);
		
		
	},

	afterInitialDataFetch : function() {
		//set the console record to consoleRecord
		this.consoleRecord=View.getOpenerView().panels.get('consoleForm').getRecord();
		var workRequestIds=View.getOpenerView().getOpenerView().workRequestIds;
		this.mapControl.showMarkerLegend();
		
		//Show marker of work request by location and zoom in by work request id.
		mapController.markerActionByWorkRequestLocation(workRequestIds);
		
		this.showBlMarkers();
		
	},
	
	/**
	 * Show map control via the console form filter criteria
	 */
	onShowWarehouseMap : function(record) {
		var workRequestIds=View.getOpenerView().getOpenerView().workRequestIds;
		var whTab=this.partInventoryLocationTabs.findTab('warehouseMapTab');
		//whTab.loadView();
		var mapController=null;
		if (whTab.useFrame) {
			mapController= whTab.getContentFrame().View.controllers.get('mapController');
		}else {
			mapController= View.controllers.get('mapCtrl');
		}
		mapController.consoleRecord = record;
		//Show markers in the map control
		//Clear Markers
		mapController.mapControl.clearMarkers();
		mapController.mapControl.showMarkerLegend();
		
		mapController.markerActionByWorkRequestLocation(workRequestIds);
		mapController.showBlMarkers();
		
		
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
	showBlMarkers : function() {
		var partCode="";//Part Code
		var partClass=""; //Part Classfication
		var partDescription=""; //Part Description
		var whCode=""; // Part Store Location Code
		var whSite=""; //Part Store Location Site
		var blId=""; // Building Code
		var whQuatity="";// Quantity Avaliable
		
		if(valueExistsNotEmpty(this.consoleRecord)){
			partCode = this.consoleRecord.getValue('pt.part_id');
			partClass = this.consoleRecord.getValue('pt.class');
			partDescription=this.consoleRecord.getValue('pt.description');
			whCode = this.consoleRecord.getValue('pt_store_loc_pt.pt_store_loc_id');
			whSite = this.consoleRecord.getValue('pt_store_loc.site_id');
			blId = this.consoleRecord.getValue('pt_store_loc.bl_id');
			whQuatity = this.consoleRecord.getValue('pt_store_loc_pt.qty_on_hand');
		}
		
		//If value of parts exists, create marker and restriction from part storage location table.
		if(valueExistsNotEmpty(partCode)||valueExistsNotEmpty(partClass)||valueExistsNotEmpty(partDescription)){
			this.mapDataType="loc_pt";
			//Define Part Restriction
			var restriction=this.getPtStoreLocRestriction(this.consoleRecord);
			
			var ptStoreLocMapDs=View.dataSources.get('ptStoreLocMapDS');
			
			var ptStoreLocMapRecordsLength=ptStoreLocMapDs.getRecords(restriction).length;
			
			if(ptStoreLocMapRecordsLength>0){
				//create marker from part storage location table.
				this.createPtStoreLocMarkerProperty();
				this.mapControl.showMarkers('ptStoreLocMapDS', restriction);
			}
			
	        
		}else{
			this.mapDataType="loc";
			//this.mapControl.hideMarkerLegend();
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
        var ptStoreLocContentFields = [ 'pt_store_loc.pt_store_loc_id','pt_store_loc.pt_store_loc_name'];
        if(valueExistsNotEmpty(this.consoleRecord.getValue('pt.part_id'))||valueExistsNotEmpty(this.consoleRecord.getValue('pt.class'))||valueExistsNotEmpty(this.consoleRecord.getValue('pt.description'))){
        	ptStoreLocContentFields=['pt_store_loc.pt_store_loc_id','pt_store_loc.pt_store_loc_name', 'pt_store_loc.qtyOnHand'];
        }
        
		
		
		//Get locator color
		var locatorColor=this.getPtStoreLocatorColor(this.consoleRecord);
		//Get thematic Buckets 
		var thematicBuckets=this.getPtStoreThematicBuckets(this.consoleRecord);
		
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
				thematicField: 'pt_store_loc.qtyOnHand',
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
		var partDescription=""; //Part Description
		var whCode=""; // Part Store Location Code
		var whSite=""; //Part Store Location Site
		var blId=""; // Building Code
		var whQuatity="";// Quantity Avaliable
		if(valueExistsNotEmpty(consoleRecord)){
			partCode = this.consoleRecord.getValue('pt.part_id');
			partClass = this.consoleRecord.getValue('pt.class');
			partDescription=this.consoleRecord.getValue('pt.description');
			whCode = this.consoleRecord.getValue('pt_store_loc_pt.pt_store_loc_id');
			whSite = this.consoleRecord.getValue('pt_store_loc.site_id');
			blId = this.consoleRecord.getValue('pt_store_loc.bl_id');
			whQuatity = this.consoleRecord.getValue('pt_store_loc_pt.qty_on_hand');
		}
		
		if((valueExistsNotEmpty(partCode))||(valueExistsNotEmpty(partClass))||((valueExistsNotEmpty(partDescription)))){
			
			if(valueExistsNotEmpty(whCode)||(valueExistsNotEmpty(whSite))||((valueExistsNotEmpty(blId)))){
				
				if(valueExistsNotEmpty(whCode)){
					restriction.addClause('pt_store_loc.pt_store_loc_id',whCode,'=');
				}
				if(valueExistsNotEmpty(whSite)){
					restriction.addClause('pt_store_loc.site_id',whSite,'=');
				}
				if(valueExistsNotEmpty(blId)){
					restriction.addClause('bl.bl_id',blId,'=');
				}
				
			}
			var partRes="1=1";
			if(valueExistsNotEmpty(partCode)){
				partRes +=" and part_id='"+partCode+"'";
			}
			
			if(valueExistsNotEmpty(partClass)){
				partRes +=" and part_id in (select part_id from pt where class='"+partClass+"')";
			}
			
			if(valueExistsNotEmpty(partDescription)){
				partRes +=" and part_id in (select part_id from pt where description='"+partDescription+"')";
			}
			
			this.ptStoreLocMapDS.addParameter('partRes',partRes);
			
		}else{
			if(valueExistsNotEmpty(whCode)||(valueExistsNotEmpty(whSite))||((valueExistsNotEmpty(blId)))){
				if(valueExistsNotEmpty(whCode)){
					restriction.addClause('pt_store_loc.pt_store_loc_id',whCode,'=');
				}
				if(valueExistsNotEmpty(whSite)){
					restriction.addClause('pt_store_loc.site_id',whSite,'=');
				}
				
				if(valueExistsNotEmpty(blId)){
					restriction.addClause('bl.bl_id',blId,'=');
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
			whCode = this.consoleRecord.getValue('pt_store_loc_pt.pt_store_loc_id');
			whSite = this.consoleRecord.getValue('pt_store_loc.site_id');
			blId = this.consoleRecord.getValue('pt_store_loc.bl_id');
		}
		
		if(valueExistsNotEmpty(whCode)){
			restriction.addClause('pt_store_loc.pt_store_loc_id',whCode,'=');
		}
		if(valueExistsNotEmpty(whSite)){
			restriction.addClause('pt_store_loc.site_id',whSite,'=');
		}
		if(valueExistsNotEmpty(blId)){
			restriction.addClause('bl.bl_id',blId,'=');
		}
		
		return restriction;
	},
	/**
	 * Get part storage location color by console record.
	 * 
	 * @param consoleRecord Console record
	 * @return locatorsColor Locator color
	 */
	getPtStoreLocatorColor: function(consoleRecord){
		var locatorsColor=['#00ff00'];
		
		var partCode="";//Part Code
		var partClass=""; //Part Classfication
		var partDescription=""; //Part Description
		var whCode=""; // Part Store Location Code
		var whSite=""; //Part Store Location Site
		var blId=""; // Building Code
		var whQuatity="";// Quantity Avaliable
		if(valueExistsNotEmpty(consoleRecord)){
			partCode = this.consoleRecord.getValue('pt.part_id');
			partClass = this.consoleRecord.getValue('pt.class');
			partDescription=this.consoleRecord.getValue('pt.description');
			whCode = this.consoleRecord.getValue('pt_store_loc_pt.pt_store_loc_id');
			whSite = this.consoleRecord.getValue('pt_store_loc.site_id');
			blId = this.consoleRecord.getValue('pt_store_loc.bl_id');
			whQuatity = this.consoleRecord.getValue('pt_store_loc_pt.qty_on_hand');
		}
		
		if((valueExistsNotEmpty(partCode))||(valueExistsNotEmpty(partClass))||((valueExistsNotEmpty(partDescription)))){
			//#ff0000 Red Color
			//#00ff00 Green Color
			locatorsColor=["#ff0000","#00ff00"];
			//If quantity is not empty, then the thematic bucket is the quantity number of the console form field. 
			if(valueExistsNotEmpty(whQuatity)){
				//#ff0000 Red Color
				//#ffff00 Yellow Color
				//#00ff00 Green Color
				locatorsColor=["#ff0000","#ffff00","#00ff00"];
			}
		}else{
			if(valueExistsNotEmpty(whCode)||(valueExistsNotEmpty(whSite))||((valueExistsNotEmpty(blId)))){
				//#00ff00 Green Color
				locatorsColor=["#00ff00"];
			}
		}
		
		return locatorsColor;
	},
	/**
	 * get part storage location thematic buckets by console record.
	 * 
	 * @param consoleRecord Console record
	 * @return thematicBuckets Thematic buckets
	 */
	getPtStoreThematicBuckets: function(consoleRecord){
		var thematicBuckets=[];
		
		var partCode="";//Part Code
		var partClass=""; //Part Classfication
		var partDescription=""; //Part Description
		var whCode=""; // Part Store Location Code
		var whSite=""; //Part Store Location Site
		var blId=""; // Building Code
		var whQuatity="";// Quantity Avaliable
		if(valueExistsNotEmpty(consoleRecord)){
			partCode = this.consoleRecord.getValue('pt.part_id');
			partClass = this.consoleRecord.getValue('pt.class');
			partDescription=this.consoleRecord.getValue('pt.description');
			whCode = this.consoleRecord.getValue('pt_store_loc_pt.pt_store_loc_id');
			whSite = this.consoleRecord.getValue('pt_store_loc.site_id');
			blId = this.consoleRecord.getValue('pt_store_loc.bl_id');
			whQuatity = this.consoleRecord.getValue('pt_store_loc_pt.qty_on_hand');
			
			
		}
		
		if((valueExistsNotEmpty(partCode))||(valueExistsNotEmpty(partClass))||((valueExistsNotEmpty(partDescription)))){
			//By default, the thematic bucket is 0
			thematicBuckets = [0.01];
			//If quantity is not empty, then the thematic bucket is the quantity number of the console form field. 
			if(valueExistsNotEmpty(whQuatity)){
				whQuatity=parseFloat(whQuatity);
				thematicBuckets = [0.01,whQuatity];
			}
			
		}
		
		return thematicBuckets;
	},
	/**
	 * Locator work request location and center map by work request code.
	 */
	locateAndCenterMapByWrId: function(){
		var workRequestIds=View.getOpenerView().getOpenerView().workRequestIds;
		if(workRequestIds.length>0){
			var wrRes=new Ab.view.Restriction();
			wrRes.addClause('wr.wr_id',workRequestIds,'IN');
			var records=this.workRequestDS.getRecords(wrRes);
			var passWorResquestIds=[];
			for(var i=0;i<records.length;i++){
				var record=records[i];
				var lat=record.getValue('bl.lat');
				var lon=record.getValue('bl.lon');
				
				if(valueExistsNotEmpty(lat)&&valueExistsNotEmpty(lon)){
					passWorResquestIds.push(record.getValue('wr.wr_id'));
				}
			}
			if(passWorResquestIds.length>0){
				//Marker work request location by work request code with white color 
				this.markerActionByWorkRequestLocation(passWorResquestIds);
			}
		}
	},
	/**
	 * Marker work request location.
	 */
	markerActionByWorkRequestLocation: function(workRequestIds){
		if(workRequestIds.length>0){
			//Create map marker property.
			this.createWrMarkerProperty();
			var workRequestIdsToShow=this.wrRequestLocationIsSameWithStoreLoc(workRequestIds);
			if(workRequestIdsToShow.length>0){
				var wrRestriction=this.getWrRestrictionByWrId(workRequestIdsToShow);
				this.mapControl.showMarkers('workRequestDS', wrRestriction);
				
			}
			//this.mapControl.hideMarkerLegend();
		}
			
		
	},
	/**
	 * Check If work request location exists in visible part storage location on the map.
	 * @param workRequestIds WorkRequest Code.
	 * @return notDuplicateWorkRequestIds WorkRequest Array that do not contains the work request duplicate with storage location.
	 */
	wrRequestLocationIsSameWithStoreLoc: function(workRequestIds){
		var result=false;
		var wrDs=View.dataSources.get('workRequestDS');
		var wrRes=new Ab.view.Restriction();
			wrRes.addClause('wr.wr_id',workRequestIds,'IN');
		
		var wrRecords=wrDs.getRecords(wrRes);
		
		var notDuplicateWorkRequestIds=[];
		
		for(var i=0;i<wrRecords.length;i++){
			var wrRecord=wrRecords[i];
			
			var blId=wrRecord.getValue('wr.bl_id');
			
			if(this.mapDataType=="loc_pt"){
				//map data retrived from pt_store_loc_pt table.
				var ptStoreLocRes=this.getPtStoreLocRestriction(this.consoleRecord);
				ptStoreLocRes.addClause("pt_store_loc.bl_id",blId,'=');
				
				var ptStoreLocDs=View.dataSources.get('ptStoreLocMapDS');
				var lenth=ptStoreLocDs.getRecords(ptStoreLocRes).length;
				if(lenth>0){
					result=true;
				}
			}else{
				//map data retrived from pt_store_loc table.
				//map data retrived from pt_store_loc_pt table.
				var storeLocRes=this.getStoreLocRestriction(this.consoleRecord)
				storeLocRes.addClause("pt_store_loc.bl_id",blId,'=');
				
				var ptStoreLocDs=View.dataSources.get('storeLocMapDs');
				var lenth=ptStoreLocDs.getRecords(storeLocRes).length;
				if(lenth>0){
					result=true;
				}
			}
			
			if(!result){
				notDuplicateWorkRequestIds.push(wrRecord.getValue('wr.wr_id'));
			}
		}
		return notDuplicateWorkRequestIds;
	},
	/**
	 * Get work request marker property
	 */
	createWrMarkerProperty: function(){
		// create property markers
        var wrDataSource = 'workRequestDS';
        var wrKeyFields = ['wr.wr_id'];
        var wrGeometryFields = ['bl.lon', 'bl.lat'];
        var wrTitleField = 'wr.bl_id';
        var wrContentFields = ['wr.wr_id'];
        
		var wrMarkerProperties = {
			renderer: 'simple',
			radius: 10,
			fillColor: '#4a86e8',
			//stroke properties
			stroke: true,
			strokeColor: '#fff',
			strokeWeight: 1.0
		}; 
		
		this.mapControl.createMarkers(
			wrDataSource, 
			wrKeyFields,
			wrGeometryFields,
			wrTitleField,
			wrContentFields,
			wrMarkerProperties
	    );
	},
	
	getWrRestrictionByWrId: function(workRequestIds){
		var wrMarkerRestriction=new Ab.view.Restriction();
		wrMarkerRestriction.addClause('wr.wr_id',workRequestIds,'IN');
		
		return wrMarkerRestriction;
	},
	
	/**
	 * The behavior of the Select link in the pop-up will depend on the filter criteria. 
	 * (1). If the user filtered on a Part Code, then the Select link will close the Find Parts window and will populate the Add Part form with the Part Code and the Storage Location Code. 
	 * 	 If the user had also filtered on a quantity available, that value will also be copied to the Add Part form.
	 * (2). If the user had not filtered on a Part Code, then the Select link will switch the view back to the Parts Inventory tab, and also filter on the selected Storage Location Code.
	 *   The user can the choose one of the Parts available in that storage location from the grid.
	 *
	 */
	showSelectLocationAction : function(keyValue) {
		//Get part store location code
		var ptStorePtId=keyValue;
		//Get part code from the console form in the opener view
		var partId=View.getOpenerView().panels.get('consoleForm').getFieldValue('pt.part_id');
		var qtyOnHand=View.getOpenerView().panels.get('consoleForm').getFieldValue('pt_store_loc_pt.qty_on_hand');
		//If the user filtered on a Part Code, then the Select link will close the Find Parts window and will populate the Add Part form with the Part Code and the Storage Location Code
		if(valueExistsNotEmpty(partId)){
			var openerPanel=View.getOpenerView().getOpenerView().parameterPanel;
			//Check if opener view panel is exists
			if(valueExistsNotEmpty(openerPanel)){
				openerPanel.setFieldValue('wrpt.part_id',partId);
				openerPanel.setFieldValue('wrpt.pt_store_loc_id',ptStorePtId);
				if(valueExistsNotEmpty(qtyOnHand)){
					openerPanel.setFieldValue('wrpt.qty_estimated',qtyOnHand);
				}
				//mapController.mapControl.map.infoWindow.hide();
				//Close dialog
				View.getOpenerView().getOpenerView().closeDialog();
			}

		}else{
			var consoleForm=View.getOpenerView().panels.get('consoleForm');
			consoleForm.clear();
			consoleForm.setFieldValue('pt_store_loc_pt.pt_store_loc_id',ptStorePtId);
			var partInventoryLocationTabs=View.getOpenerView().controllers.get('findPartsController').partInventoryLocationTabs;
			partInventoryLocationTabs.selectTab('partInventoryListTab');
			View.getOpenerView().controllers.get('findPartsController').trigger("app:operation:express:mpiw:refreshGridWhenClickMapMarker",ptStorePtId);
			/*
			var partInventoryLocationTabs=View.getOpenerView().controllers.get('findPartsController').partInventoryLocationTabs;
			var inventoryListRestriction=new Ab.view.Restriction();
			inventoryListRestriction.addClause('pt_store_loc_pt.pt_store_loc_id',ptStorePtId,'=');
			partInventoryLocationTabs.selectTab('partInventoryListTab',inventoryListRestriction,false,false,false);*/
		}

	}
});
/**
 * Marker action event listener.
 * @param keyValue Key Value
 */
function markerActionEvent(keyValue){
	//Replace keyValue by inner HTML of pop-up content title.
	View.controllers.get('mapController').showSelectLocationAction(keyValue);
}


Ab.leaflet.Base.prototype._recordsToGeoJson = function(dataSource, records) {
    var markerData=null; 
	if(dataSource=='workRequestDS'){
		markerData=getMarkerDataIfDataSourceIsWorkRequest(dataSource, records,this);
    }else{
    	markerData=getMarkerDataIfDataSourceIsStorageLocation(dataSource, records,this);
    }
	
	return markerData;
}

Ab.leaflet.Base.prototype._updateLegendContent=function(markerProperties) {
	//console.log('updateLegendContent...');  

    var htmlContent;
    htmlContent = "<table>";
    //legend dynamically changed by parent console filter.
    var controller=View.controllers.get('mapController');
    
    if(controller.mapDataType=='loc'){
    	htmlContent += '<tr><td style="background-color:#00ff00; width:25px"></td><td class="leafletLegendLabel"><b>&nbsp;&nbsp;&nbsp;'+getMessage('mapAvailableLabel')+'</b></td></tr>';   
        htmlContent += '<tr><td></td><td></td></tr>';
        htmlContent += '<tr><td style="background-color:#4a86e8; width:25px"></td><td class="leafletLegendLabel"><b>&nbsp;&nbsp;&nbsp;'+getMessage('workRequestLabel')+'</b></td></tr>';
        
    }else{
    	
        htmlContent += '<tr><td style="background-color:#00ff00; width:25px"></td><td class="leafletLegendLabel"><b>&nbsp;&nbsp;&nbsp;'+getMessage('mapAvailableLabel')+'</b></td></tr>';   
        htmlContent += '<tr><td></td><td></td></tr>';
        htmlContent += '<tr><td style="background-color:#ffff00; width:25px"></td><td class="leafletLegendLabel"><b>&nbsp;&nbsp;&nbsp;'+getMessage('mapPartlyAvailableLabel')+'</b></td></tr>';          
        htmlContent += '<tr><td></td><td></td></tr>';
        htmlContent += '<tr><td style="background-color:#ff0000; width:25px"></td><td class="leafletLegendLabel"><b>&nbsp;&nbsp;&nbsp;'+getMessage('mapUnavailableLabel')+'</b></td></tr>'; 
        htmlContent += '<tr><td></td><td></td></tr>';
        htmlContent += '<tr><td style="background-color:#4a86e8; width:25px"></td><td class="leafletLegendLabel"><b>&nbsp;&nbsp;&nbsp;'+getMessage('workRequestLabel')+'</b></td></tr>';
        
    }
    
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
        
        //If pt_store_loc_id exits in console form , only show storage location
        var ptStoreLocIdInConsole=View.controllers.get('mapController').consoleRecord.getValue('pt_store_loc_pt.pt_store_loc_id');
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
              if(contentFields[j]=="pt_store_loc.qtyOnHand"){
            	  var quantityValue=ptStoreRecords[m].values["pt_store_loc.qtyOnHandToShow"];
            	  popupContent += '<b>' + fieldTitle + '</b>: ' + quantityValue + '</br>'; 
              }else{
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
            
          
            
            var popupAction = '<span class="leaflet-popup-action" id="PopupAction"><a href="javascript: void(0);" onclick="markerActionEvent(\''+storageLocId+'\')">'+getMessage('selectLinkTitle')+'</a></span>';
            
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


/**
 * get marker data from dataSource and records if dataSource is workrequest.
 * @param dataSource DataSource
 * @param records Records
 * @param scope Scope
 */
function getMarkerDataIfDataSourceIsWorkRequest(dataSource, records,scope) {
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
        var popupContent = '<div class="leaflet-popup-content-fields" id="leafletPopupContentFields">';

        for (j=0; j<contentFields.length; j++) {
          var fieldTitle = scope._getFieldTitle(dataSource, contentFields[j]);
          var fieldValue = records[i].values[contentFields[j]];
          popupContent += '<b>' + fieldTitle + '</b>: ' + fieldValue + '</br>';
          properties[contentFields[j]] = fieldValue;
        }
        popupContent += "</div>";
        feature.properties = properties;
        
        // format the title based on the title field and/or its lookup field
        var titleFieldValue = records[i].values[markerProperties.titleField];
        titleFieldValue = View.dataSources.get(dataSource).formatLookupValue(
            markerProperties.titleField, titleFieldValue, records[i].values);

        var popupTitle = '<span class="leaflet-popup-content-title" id="leafletPopupContentTitle">';
        popupTitle += titleFieldValue + '</span>';
        feature.properties.popupTitle = popupTitle;
        
        //add marker action to popup
        if (markerProperties.markerOptions.markerActionTitle && markerProperties.markerOptions.markerActionCallback) {
          //<a class="action" id="actionLink" href="javascript: void(0);">Show Details</a>
          var popupAction = '<span class="leaflet-popup-action" id="leafletPopupAction"><a href="javascript: void(0);">';
          popupAction += markerProperties.markerOptions.markerActionTitle;
          popupAction += '</a></span>';

          popupContent += popupAction;
        }
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