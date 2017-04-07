/*
 *   This control defines the Geocoder 
 *   The Geocoder converts an address to geographic coordinates (latitude and longitude)
 *   This class uses the ESRI JS API and the ArcGIS Online World Geocoding Service
 */
Ab.namespace('arcgis');
 
Ab.arcgis.Geocoder = Base.extend({  

	// @begin_translatable
    z_MESSAGE_GEOCODE_FINISHED: 'The Geocode Operation is finished.',
	z_MESSAGE_GEOCODE_FINISHED_WITHOUT_MATCH: 'The Geocode Operation is finished. Cannot find a match for item(s): {0}',
	z_MESSAGE_GEOCODE_CONTROL_NOT_CREATED: 'The Geocoder could not be created. Cannot get an access token.',
	// @end_translatable
	
	//the data records returned from datasource
	initRecords: null,
	
	//the data records that need geocode operation
	//the difference between initRecords and targetRecords is determined by whether the existing
	//geometry information needs to be replaced.
	targetRecords: null,
	
	// records that were not geocoded
	notGeocodedRecords: null,
	
	// the esri.tasks.Locator
	locator: null,

	// the locator service url 	
	locatorUrl: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",

	// the access token for the arcgis online locator service
	accessToken: null,

	//the information needed for geocode  --- records, address, geometry, etc. 
	dataSourceName: null,
	tableName: null,
	restriction: null,
	pkField: null,
	geometryFields: null,
	addressFields: null,
	replace: null,
	
	// callback function to perfom aditional task when geocode is done
	callbackMethod: null,
	
	/*
     *  The geocoder constructor
     */
	constructor: function() {

    	//import the esri ibraries
		dojo.require("esri.tasks.locator");

		this.initLocator();
	},

    /**
     *  This function initializes the esri.locator 
     *  The esri.locator is the service which performs the geocode operation
     */
	initLocator: function() {

		if (this.accessToken == null) {
			// request arcgis access token
			this.requestAccessToken();
		}

		if ( this.accessToken && this.locator == null) {
			// create esri.tasks.Locator		
			this.locator = new esri.tasks.Locator( this.locatorUrl + "?token=" + this.accessToken );

			// call this.onAddressToLocationsComplete after the completion of AddressToLocations operation
			var geocodeControl = this;
			// dojo.connect(this.locator, "onAddressToLocationsComplete", function(candidates){
			// 	geocodeControl.onAddressToLocationsComplete(candidates);
			// });
		}
	},
    
    /**
     *  This function calls the WFR to get an access token from ArcGIS Online
     */
	requestAccessToken: function(){

		var result = Ab.workflow.Workflow.call('AbCommonResources-ArcgisService-requestArcgisOnlineAccessToken');

		if (result.code != 'executed') {
			Ab.workflow.Workflow.handleError(result);
		} else {
			this.accessToken = result.message;
		}

	},

    /**
     *  This function get all records which need Geocoding operation, process them, and send information to the Geocode operation.
     *	@param dataSourceName. The dataSource to get records.
     * 	@param restriction. The restriction needed when get dataRecords from dataSource.
     * 	@param tableName. The tableName in which the records's geometry information will be added.
     * 	@param pkField.  The primary key field for tableName.
     * 	@param geometryFields.  The geometryFields for tableName.
     *  @param addressFields.  The fields whose value hold the actual address.
     *  @param replace.  Boolean.  Whether replace the existing geometry information.
     */

    // legacy case 
	geoCode: function(dataSourceName, restriction, tableName, pkField, geometryFields, addressFields, replace){
		this.geocode(dataSourceName, restriction, tableName, pkField, geometryFields, addressFields, replace);	
	},

	// updated case
   	geocode: function(dataSourceName, restriction, tableName, pkField, geometryFields, addressFields, replace){
		
		this.dataSourceName = dataSourceName;
		this.tableName = tableName;
		this.restriction = restriction;
		this.pkField = pkField;
		this.geometryFields = geometryFields;
		this.addressFields = addressFields;
		this.replace = replace;
	
		// clear all markers on the map.
		// this.abMap.map.graphics.clear(); // gk 07302012
		// this throws an error in the fl version. we would need a callback to get the message over to the map control.
		// in general, this feels misplaced -- as a geocode function shouldnt be touching map graphcis. a geocoder should geocode.
		// if we want to clear the map graphics, we can do that from the view controller.  
      
      	//get all the data records returned from datasource
		this.initRecords = this.getDataSourceRecords(this.dataSourceName, this.restriction);
		
		//prepare target records based on whether to replace the existing geometry information.
		this.targetRecords = new Array();
		this.notGeocodedRecords = new Array();
		
		for (var i = 0; i < this.initRecords.length; i++) {
			
			var recordLat = this.initRecords[i].getValue(this.geometryFields[0]);
   			var recordLon = this.initRecords[i].getValue(this.geometryFields[1]);
   			
   			//geocode if replace is true OR lat or lon is null
   			if( this.replace || ( recordLat == null || recordLon == null || recordLat == "" || recordLon == "") ) {
   				this.targetRecords.push(this.initRecords[i]);
   			}
		}
		

   			
   		//prepare the addresses for each target record
        var finalAddresses = new Array();
   		for (var i = 0; i < this.targetRecords.length; i++) {
  		
    		//The address argument is data object that contains properties representing 
    		//the various address fields accepted by the corresponding geocode service. 
    		//These fields are listed in the addressFields property of the associated 
    		//geocode service resource. 
    		//The World Geocoding Service accepts: 
    		//Address (Street), City, Region (State), Postal (Zip code, and Country. 
    		//The address argument is of the form:
    		//{
 			//	Address: "<bl.address1>",
 			//	City   : "<bl.city_id>",
 			//	Region : "<bl.state_id>",
 			//	Postal : "<bl.zip>"
 			//	CountryCode : "<bl.ctry_id>"
			//} 			
   			//use explicit field references, if possible, else use indexed fields
            var finalAddress = new Object();    
            finalAddress['OBJECTID'] =  i;
			finalAddress["Address"] = this.targetRecords[i].getValue(this.addressFields[0]);
			finalAddress["City"] = this.targetRecords[i].getValue(this.addressFields[1]);
   			finalAddress["Region"] = this.targetRecords[i].getValue(this.addressFields[2]);
   			finalAddress["Postal"] = this.targetRecords[i].getValue(this.addressFields[3]);	
        	finalAddress["CountryCode"] = this.targetRecords[i].getValue(this.addressFields[4]);

            finalAddresses.push(finalAddress);
        }

        // the forStorage parameter allows us to persist (or store) the geocode result
        var params = {
            addresses: finalAddresses,
            forStorage: true
        };

        //call the esri locator service 
        var me = this;
        this.locator.addressesToLocations(params, 
            function(results) {
                me.onAddressToLocationsComplete(results); 
            },
            function(error){
                me.onAddressToLocationsError(error); 
            }
        );
  	},

   	/**
   	 * 	get data records
   	 *  @param dataSourceName. The dataSourceName.
     *  @param restriction. The Restriction.
     *  @return. The dataRecords.
   	 */
   	getDataSourceRecords: function(dataSourceName, restriction){
   		var ds = View.dataSources.get(dataSourceName);
   		return ds.getRecords(restriction);
   	},
	
   	/**
     *  This is the callback function after the completion of each AddressToLocations operation.
     *	@param candidates. All the possible candidates returned from AddressToLocations operation.
     */	
  	onAddressToLocationsComplete: function(results) {
        
        // process results     		
    	for (var j = 0; j < results.length; j++) {
    	   
            candidate = results[j];           
            var isMatch = false;
            var resultId = candidate.attributes.ResultID;   

     		if (
     			candidate.score > 80 &&
     			candidate.location.x &&
     			candidate.location.y) 
     		{
			
				var lon = candidate.location.x;
				var lat = candidate.location.y;
				
				//prepare the new record
				var record = {};
                record[this.pkField] = this.targetRecords[resultId].getValue(this.pkField);
                record[this.geometryFields[0]] = lat;
				record[this.geometryFields[1]] = lon;
				
				//call WFR to save record
				var parameters = {
					tableName: this.tableName,
					fields: toJSON(record)
				}
				
				var result = Ab.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-saveRecord', parameters);
				if (result.code != 'executed') {
					Ab.workflow.Workflow.handleError(result);
				}
				isMatch = true;
			} else {
                this.notGeocodedRecords.push(this.targetRecords[resultId].getValue(this.pkField));
            }
		}
		
		var msg = View.getLocalizedString(this.z_MESSAGE_GEOCODE_FINISHED	);
		if(this.notGeocodedRecords.length > 0){
			msg = View.getLocalizedString(this.z_MESSAGE_GEOCODE_FINISHED_WITHOUT_MATCH	);
			msg = msg.replace('{0}', this.notGeocodedRecords.toString());
		}
		
        View.showMessage(msg);
		
        if(this.callbackMethod != null){
			this.callbackMethod.call();
		}
	}

});

