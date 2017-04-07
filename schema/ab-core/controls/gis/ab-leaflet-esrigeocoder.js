Ab.namespace('leaflet');

Ab.leaflet.EsriGeocoder = Base.extend({

	// @begin_translatable
    z_MESSAGE_GEOCODE_FINISHED: 'The geocode operation is finished.',
	z_MESSAGE_GEOCODE_ERROR: 'There was an error with the geocode operation.',
	z_MESSAGE_GEOCODE_CONTROL_NOT_CREATED: 'The Geocoder could not be created. Cannot get an access token.',
	// @end_translatable

	// a refererence to the ab.leaflet.map control
	mapControl: null,

	// L.esri.Geocoding.Services.Geocoding
	geocodeService: null,

	// the access token for the arcgis online locator service
	accessToken: null,

	//the information needed for geocode  --- records, address, geometry, etc. 
	dataSource: null,
	tableName: null,
	restriction: null,
	pkField: null,
	geometryFields: null,
	addressFields: [],
	replace: null,
	
	// the data record from the data source
	dataRecord: null,

	/*
	 *  The geocoder constructor
	 */
	constructor: function(mapControl) {
		this.mapControl = mapControl;

		this.initGeocodeService();
	},

	initGeocodeService: function() {
		
		// if (this.accessToken == null) {
		// 	// request arcgis access token
		// 	this.requestAccessToken(); //TODO
		// }

		//create geocoder
		this.geocodeService = new L.esri.Geocoding.Services.Geocoding();

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

  	geocode: function(dataSource, restriction, tableName, pkField, geometryFields, addressFields, replace){
		
		this.dataSource = dataSource;
		this.tableName = tableName;
		this.restriction = restriction;
		this.pkField = pkField;
		this.geometryFields = geometryFields;
		this.addressFields = addressFields;
		this.replace = replace;

		//get all the data records returned from datasource
		var record = this.getDataSourceRecords(this.dataSource, this.restriction);
		this.dataRecord = record;

		// convert address record values to address string
		var addressString = this.getAddressString(record);

		var _geocodeControl = this;
		this.geocodeService.geocode().text(addressString).run(
			function(error, response){
				if (error) {
					// handle error
				}
				if (response.results.length > 0) {
					_geocodeControl.onGeocodeComplete(response.results);
				}
			});
	},

	onGeocodeComplete: function(results){

	    // get location
	    var latlng = results[0].latlng;
	    var lat = latlng.lat;
	    var lon = latlng.lng;
	    var _dataRecord = this.dataRecord[0];

	    // prepare record
	    var record = {};
	    record[this.pkField] = _dataRecord.getValue(this.pkField);
	    record[this.geometryFields[0]] = lon;
	    record[this.geometryFields[1]] = lat;
	    
	    // save record
	    var parameters = {
	      tableName: this.tableName,
	      fields: toJSON(record)
	    }
	    var msg;
	    var result = Ab.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-saveRecord', parameters);
	    if (result.code != 'executed') {
	      Ab.workflow.Workflow.handleError(result);
	      msg = View.getLocalizedString(this.z_MESSAGE_GEOCODE_ERROR);	      
	    } else {
	      msg = View.getLocalizedString(this.z_MESSAGE_GEOCODE_FINISHED);
	    }

	    View.showMessage(msg);

	    //update map view
	    this.mapControl.mapClass.map.setView(latlng).setZoom(15);
	    this.mapControl.showMarkers(this.dataSource, this.restriction);

	    this.afterGeocodeCompete();
	},

	afterGeocodeCompete: function(){
		this.dataSource = null
		this.tableName = null;
		this.restriction = null;
		this.pkField = null;
		this.geometryFields = null;
		this.addressFields = null;
		this.replace = null;
		this.dataRecord = null;
	},

	getAddressString: function(record){
		var _addressString = '';
		var _record = record[0];
		var _addressFields = this.addressFields;

		for (i=0; i<_addressFields.length; i++){
			if (_addressFields[i].length > 0){
				if (_addressString.length > 0) {
					_addressString += ', ' + _record.getValue(_addressFields[i]);
				} else {
					_addressString += _record.getValue(_addressFields[i]);
				}
			}
		}

		return _addressString;
	},

   	/**
   	 * 	get data records
   	 *  @param dataSource. The dataSource.
     *  @param restriction. The Restriction.
     *  @return. The dataRecords.
   	 */
   	getDataSourceRecords: function(dataSource, restriction){
   		var ds = View.dataSources.get(dataSource);
   		return ds.getRecords(restriction);
   	},

	reverseGeocode: function(){

	},

	onReverseGeocodeComplete: function(){
		
	}

});