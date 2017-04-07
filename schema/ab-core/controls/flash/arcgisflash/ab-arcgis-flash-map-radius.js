Ab.flash.Map.RadiusMap = Ab.flash.Map.extend({
	bFillSymbolEnabled: true,
	
	constructor: function(panelId, divId, dataSourceId, showLabels, labelTextFormatProperties) {	
		this.inherit(panelId, divId, dataSourceId, showLabels, labelTextFormatProperties);	
	}	
});	
	

Ab.flash.ArcGISRadiusMarkerProperty = Ab.flash.ArcGISMarkerProperty.extend({	
	// heat map specific properties	
	radiusField: "",

	/*
     *  constructor
     *  @param dataSourceNameParam. The dataSource associated with these markers
     *  @param geometryFieldsParam. The geometryFields which define the geometry of markers.
     *  @param infoWindowTitleFieldParam. The data field which defines infoWindow Title.
     *  @param infoWindowAttributeParam.  The data Fields which define attributes for infoWindow 
     *  @param thematicFieldParam. 			The thematic field whose value determines the symbol color
     *  @param thematicBucketsParam.		The thematic color buckets
     *  @param sizeFieldParam.					The field whose value determines the symbol size
     *  @param sizeBucketsParam.			Size buckets		
     */
/*
	constructor: function(dataSourceNameParam, geometryFieldsParam, infoWindowTitleFieldParam, infoWindowAttributeParam, thematicFieldParam, thematicBucketsParam, sizeFieldParam, sizeBucketsParam) {
		this.radiusField = radiusFieldParam;
		this.thematicField = thematicFieldParam;
		this.thematicBuckets = thematicBucketsParam;
		this.sizeField = sizeFieldParam;
		this.sizeBuckets = sizeBucketsParam;

		this.inherit(dataSourceNameParam, geometryFieldsParam, infoWindowTitleFieldParam, infoWindowAttributeParam);
*/
	constructor: function(dataSourceNameParam, geometryFieldsParam, infoWindowTitleFieldParam, infoWindowAttributeParam, radiusField) {
		this.radiusField = radiusField;    	
		this.inherit(dataSourceNameParam, geometryFieldsParam, infoWindowTitleFieldParam, infoWindowAttributeParam); 	
	}
});		