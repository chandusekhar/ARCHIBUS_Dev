package com.archibus.app.common.extensionsarcgis;

/**
 *
 * Common constants used by Extensions for Esri (ArcGIS) classes.
 *
 * @author knight
 *
 */
public final class ArcgisExtensionsConstants {
    
    /**
     * The AbCommonResources string.
     */
    public static final String ABCOMMONRESOURCES = "AbCommonResources";
    
    /**
     * The ampersand character.
     */
    public static final String AMPERSAND = "&";

    /**
     * Arcgis string.
     */
    public static final String ARCGIS = "Arcgis";

    /**
     * The ArcGIS query feature URL parameter (1).
     */
    public static final String ARCGIS_URL_QUERY_FEATURES_PARAM_1 =
            "&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=";
    
    /**
     * The ArcGIS query feature URL parameter (2).
     */
    public static final String ARCGIS_URL_QUERY_FEATURES_PARAM_2 =
            "&returnGeometry=false&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&f=json";
    
    /**
     * The ArcGIS query features URL.
     */
    // public static final String ARCGIS_URL_QUERY_FEATURES = "/query?f=json";
    public static final String ARCGIS_URL_QUERY_FEATURES = "/query?";

    /**
     * The ArcGIS add or update features URL parameter.
     */
    public static final String ARCGIS_URL_ADD_UPDATE_FEATURES_PARAM =
            "&gdbVersion=&rollbackOnFailure=true&f=json";

    /**
     * The ArcGIS add features URL parameter.
     */
    public static final String ARCGIS_URL_ADD_FEATURES = "/addFeatures?f=json";
    
    /**
     * The ArcGIS update features URL.
     */
    public static final String ARCGIS_URL_UPDATE_FEATURES = "/updateFeatures?f=json";
    
    /**
     * The ArcGIS delete features URL parameter.
     */
    public static final String ARCGIS_URL_DELETE_FEATURES_PARAM =
            "&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&gdbVersion=&rollbackOnFailure=true&f=json";
    
    /**
     * The ArcGIS delete features URL.
     */
    public static final String ARCGIS_URL_DELETE_FEATURES = "/deleteFeatures?f=json";
    
    /**
     * The single quote HTML code.
     */
    public static final String ARCGIS_URL_SINGLE_QUOTE = "%27";
    
    /**
     * Asset string.
     */
    public static final String ASSETS = "Assets";
    
    /**
     * AssetType string.
     */
    public static final String ASSETTYPE = "AssetType";

    /**
     * Asset type background string.
     */
    // CHECKSTYLE:OFF
    // Justification: different fields with same values
    public static final String ASSET_TYPE_BACKGROUND = "background";

    // CHECKSTYLE:ON
    /**
     * Asset type building string.
     */
    public static final String ASSET_TYPE_BL = "bl";

    /**
     * Asset type gros string.
     */
    // CHECKSTYLE:OFF
    // Justification: different fields with same values
    public static final String ASSET_TYPE_GROSS = "gros";

    // CHECKSTYLE:ON

    /**
     * Asset type equipment string.
     */
    // CHECKSTYLE:OFF
    // Justification: different fields with same values
    public static final String ASSET_TYPE_EQ = "eq";
    
    // CHECKSTYLE:ON
    
    /**
     * Asset type property string.
     */
    public static final String ASSET_TYPE_PROPERTY = "property";
    
    /**
     * Asset type room string.
     */
    // CHECKSTYLE:OFF
    // Justification: different fields with same values
    public static final String ASSET_TYPE_RM = "rm";

    // CHECKSTYLE:ON
    
    /**
     * Background string.
     */
    public static final String BACKGROUND = "Background";
    
    /**
     * Building string.
     */
    public static final String BUILDING = "Building";

    /**
     * BuildingId string.
     */
    public static final String BUILDINGID = "BuildingId";
    
    /**
     * Comma string.
     */
    public static final String COMMA = ",";
    
    /**
     * Colon string.
     */
    public static final String COLON = ":";

    /**
     * DrawingName string.
     */
    public static final String DRAWINGNAME = "DrawingName";
    
    /**
     * Double forward slash string.
     */
    public static final String DOUBLE_FORWARD_SLASH = "//";
    
    /**
     * dwgname string.
     */
    public static final String DWGNAME = "dwgname";

    /**
     * Forward slash string.
     */
    public static final String FORWARD_SLASH = "/";
    
    /**
     * Equals.
     */
    public static final String EQUALS = "=";

    /**
     * Equipment string.
     */
    public static final String EQUIPMENT = "Equipment";
    
    /**
     * EquipmentId string.
     */
    public static final String EQUIPMENTID = "EquipmentId";
    
    /**
     * ExportConnectorId string.
     */
    public static final String EXPORTCONNECTORID = "ExportConnectorId";

    /**
     * ExtentsMax string.
     */
    public static final String EXTENTSMAX = "ExtentsMax";
    
    /**
     * ExtentsMin string.
     */
    public static final String EXTENTSMIN = "ExtentsMin";

    /**
     * Web Mercator EPSG code.
     */
    public static final String EPSG_WEB_MERC = "EPSG:3857";
    
    /**
     * Latitude-Longitude EPSG code.
     */
    public static final String EPSG_LAT_LON = "EPSG:4326";

    /**
     * Factory exception message.
     */
    public static final String FACTORY_EXCEPTION = "Factory Exception. ";

    /**
     * Factory registry exception message.
     */
    public static final String FACTORY_REGISTRY_EXCEPTION = "Factory Registry Exception. ";
    
    /**
     * Feature layer query parameter message.
     */
    public static final String FEATURE_LAYER_QUERY_PARAMETERS = "Feature layer query parameters: ";
    
    /**
     * asset_type field name.
     */
    public static final String FIELD_ASSET_TYPE = "asset_type";
    
    /**
     * bl_id field name.
     */
    public static final String FIELD_BL_ID = "bl_id";
    
    /**
     * dwg_name field name.
     */
    public static final String FIELD_DWG_NAME = "dwg_name";
    
    /**
     * eq_id field name.
     */
    public static final String FIELD_EQ_ID = "eq_id";
    
    /**
     * features JSON code.
     */
    public static final String FIELD_FEATURES = "features";
    
    /**
     * fl_id field name.
     */
    public static final String FIELD_FL_ID = "fl_id";
    
    /**
     * geo_objectid field name.
     */
    public static final String FIELD_GEO_OBJECTID = "geo_objectid";
    
    /**
     * geo_x field name.
     */
    public static final String FIELD_GEO_X = "geo_x";
    
    /**
     * geo_y field name.
     */
    public static final String FIELD_GEO_Y = "geo_y";
    
    /**
     * geo_rotate field name.
     */
    public static final String FIELD_GEO_ROTATE = "geo_rotate";
    
    /**
     * geo_scale field name.
     */
    public static final String FIELD_GEO_SCALE = "geo_scale";
    
    /**
     * geo_srs field name.
     */
    public static final String FIELD_GEO_SRS = "geo_srs";
    
    /**
     * geo_level field name.
     */
    public static final String FIELD_GEO_LEVEL = "geo_level";
    
    /**
     * rm_id field name.
     */
    public static final String FIELD_RM_ID = "rm_id";

    /**
     * space_hier_field_values field name.
     */
    public static final String FIELD_SPACE_HIER_FIELD_VALUES = "space_hier_field_values";

    /**
     * Export to ArgGIS JSON filename.
     */
    public static final String FILENAME_EXPORT_ARCGIS_JSON = "-export-arcgis.json";

    /**
     * Import from ArgGIS JSON filename.
     */
    public static final String FILENAME_IMPORT_ARCGIS_JSON = "-import-arcgis.json";
    
    /**
     * Feature string.
     */
    public static final String FEATURE = "Feature";
    
    /**
     * FeatureCollection string.
     */
    public static final String FEATURECOLLECTION = "FeatureCollection";
    
    /**
     * FloorId string.
     */
    public static final String FLOORID = "FloorId";
    
    /**
     * GeoLevel string.
     */
    public static final String GEOLEVEL = "GeoLevel";
    
    /**
     * GeometryType string.
     */
    public static final String GEOMETRYTYPE = "GeometryType";

    /**
     * -geo.json file suffix/extension.
     */
    public static final String GEO_JSON_FILE_SUFFIX_EXTENSION = "-geo.json";
    
    /**
     * ID string.
     */
    public static final String ID_STRING = "ID";
    
    /**
     * ImportConnectorId string.
     */
    public static final String IMPORTCONNECTORID = "ImportConnectorId";

    /**
     * IsGeoreferenced string.
     */
    public static final String ISGEOREFERENCED = "IsGeoreferenced";
    
    /**
     * The JSON string.
     */
    public static final String JSON = "JSON";
    
    /**
     * attribute JSON code.
     */
    public static final String JSON_ATTRIBUTES = "attributes";
    
    /**
     * background JSON code.
     */
    public static final String JSON_BACKGROUND = "background";

    /**
     * coordinates JSON code.
     */
    public static final String JSON_COORDINATES = "coordinates";
    
    /**
     * crs JSON code.
     */
    public static final String JSON_CRS = "crs";
    
    /**
     * dwgInfo JSON code.
     */
    public static final String JSON_DWGINFO = "dwgInfo";

    /**
     * eq JSON code.
     */
    public static final String JSON_EQ = "eq";

    /**
     * error JSON code.
     */
    public static final String ERROR = "error";
    
    /**
     * geoX JSON code.
     */
    public static final String JSON_GEOX = "geoX";
    
    /**
     * geoY JSON code.
     */
    public static final String JSON_GEOY = "geoY";
    
    /**
     * geoRotate JSON code.
     */
    public static final String JSON_GEOROTATE = "geoRotate";
    
    /**
     * geoScale JSON code.
     */
    public static final String JSON_GEOSCALE = "geoScale";
    
    /**
     * geoSRS JSON code.
     */
    public static final String JSON_GEOSRS = "geoSRS";
    
    /**
     * geoLevel JSON code.
     */
    public static final String JSON_GEOLEVEL = "geoLevel";
    
    /**
     * geometry JSON code.
     */
    public static final String JSON_GEOMETRY = "geometry";
    
    /**
     * gros JSON code.
     */
    public static final String JSON_GROS = "gros";
    
    /**
     * id JSON code.
     */
    public static final String JSON_ID = "id";
    
    /**
     * isGeoreferenced JSON code.
     */
    public static final String JSON_ISGEOREFERENCED = "isGeoreferenced";
    
    /**
     * layer JSON code.
     */
    public static final String JSON_LAYER = "layer";

    /**
     * name JSON code.
     */
    public static final String JSON_NAME = "name";

    /**
     * paths JSON code.
     */
    public static final String JSON_PATHS = "paths";
    
    /**
     * properties JSON code.
     */
    public static final String JSON_PROPERTIES = "properties";
    
    /**
     * rings JSON code.
     */
    public static final String JSON_RINGS = "rings";
    
    /**
     * rm JSON code.
     */
    public static final String JSON_RM = "rm";
    
    /**
     * spatialReference JSON code.
     */
    public static final String JSON_SPATIALREFERENCE = "spatialReference";
    
    /**
     * type JSON code.
     */
    public static final String JSON_TYPE = "type";
    
    /**
     * wkid JSON code.
     */
    public static final String JSON_WKID = "wkid";
    
    /**
     * x JSON code.
     */
    public static final String JSON_X = "x";
    
    /**
     * y JSON code.
     */
    public static final String JSON_Y = "y";
    
    /**
     * Key string.
     */
    public static final String KEY = "Key";

    /**
     * Layer string.
     */
    public static final String LAYER = "Layer";

    /**
     * LayerAssetTypeField string.
     */
    public static final String LAYERASSETYPEFIELD = "LayerAssetTypeField";

    /**
     * LayerUrl string.
     */
    public static final String LAYERURL = "LayerUrl";

    /**
     * LayerIdField string.
     */
    public static final String LAYERIDFIELD = "LayerIdField";
    
    /**
     * LayerObjectIdField string.
     */
    public static final String LAYEROBJECTIDFIELD = "LayerObjectIdField";

    /**
     * Line string.
     */
    public static final String LINE = "Line";
    
    /**
     * LineString string.
     */
    public static final String LINESTRING = "LineString";
    
    /**
     * No Such Element Exception message.
     */
    public static final String NO_SUCH_ELEMENT_EXCEPTION = "No Such Element Exception. ";

    /**
     * No Such Authority Code Exception message.
     */
    public static final String NO_SUCH_AUTHORITY_CODE_EXCEPTION =
            "No Such Authority Code Exception.";

    /**
     * N/A string.
     */
    public static final String N_A = "N/A";

    /**
     * The integer '1'.
     */
    public static final int INT_1 = 1;
    
    /**
     * The integer '4'.
     */
    public static final int INT_4 = 4;

    /**
     * The integer '5'.
     */
    public static final int INT_5 = 5;
    
    /**
     * The number '100.0'.
     */
    public static final double DOUBLE_ONE_HUNDRED_POINT_ZERO = 100.0;
    
    /**
     * The number '1000000.0'.
     */
    public static final double DOUBLE_ONE_MILLION_POINT_ZERO = 100000000.0;
    
    /**
     * geoInfo parameter.
     */
    public static final String PARAMETER_GEOINFO = "geoInfo";
    
    /**
     * methodName parameter.
     */
    public static final String PARAMETER_METHODNAME = "methodName";
    
    /**
     * objectIds parameter.
     */
    public static final String PARAMETER_OBJECTIDS = "objectIds";
    
    /**
     * where parameter.
     */
    public static final String PARAMETER_WHERE = "where";
    
    /**
     * whereClause parameter.
     */
    public static final String PARAMETER_WHERECLAUSE = "whereClause";

    /**
     * Parts string.
     */
    public static final String PARTS = "Parts";

    /**
     * Point string.
     */
    public static final String POINT = "Point";
    
    /**
     * Polygon string.
     */
    public static final String POLYGON = "Polygon";

    /**
     * Projection failed message.
     */
    public static final String PROJECTION_FAILED = "Projection failed. ";

    /**
     * Property string.
     */
    public static final String PROPERTY = "Property";
    
    /**
     * Room string.
     */
    public static final String ROOM = "Room";
    
    /**
     * RoomId string.
     */
    public static final String ROOMID = "RoomId";

    /**
     * afm_dwgs.space_hier_field_values table-field name.
     */
    public static final String RECORD_AFM_DWGS_SPACE_HIER_FIELD_VALUES =
            "afm_dwgs.space_hier_field_values";
    
    /**
     * afm_dwgs.geo_x table-field name.
     */
    public static final String RECORD_AFM_DWGS_GEO_X = "afm_dwgs.geo_x";
    
    /**
     * afm_dwgs.geo_y table-field name.
     */
    public static final String RECORD_AFM_DWGS_GEO_Y = "afm_dwgs.geo_y";
    
    /**
     * afm_dwgs.geo_rotate table-field name.
     */
    public static final String RECORD_AFM_DWGS_GEO_ROTATE = "afm_dwgs.geo_rotate";
    
    /**
     * afm_dwgs.geo_scale table-field name.
     */
    public static final String RECORD_AFM_DWGS_GEO_SCALE = "afm_dwgs.geo_scale";
    
    /**
     * afm_dwgs.geo_srs table-field name.
     */
    public static final String RECORD_AFM_DWGS_GEO_SRS = "afm_dwgs.geo_srs";

    /**
     * afm_dwgs.geo_level table-field name.
     */
    public static final String RECORD_AFM_DWGS_GEO_LEVEL = "afm_dwgs.geo_level";

    /**
     * Drive letter REGEX expression (e.g. 'C:\, D:\, Z:\, etc.')
     */
    public static final String REGEX_DRIVE_LETTER = "^[a-zA-Z]:\\\\.*";
    
    /**
     * Segments string.
     */
    public static final String SEGMENTS = "Segments";

    /**
     * Semicolon.
     */
    public static final String SEMICOLON = ";";

    /**
     * Shape string.
     */
    public static final String SHAPE = "Shape";

    /**
     * Single quote.
     */
    public static final String SINGLE_QUOTE = "'";
    
    /**
     * ' AND ' SQL expression.
     */
    public static final String SQL_AND = " AND ";

    /**
     * ' IS NOT NULL ' SQL expression.
     */
    public static final String SQL_IS_NOT_NULL = " IS NOT NULL ";

    /**
     * '1=1' SQL expression.
     */
    public static final String SQL_ONE_EQUALS_ONE = "1=1";

    /**
     * success string.
     */
    public static final String SUCCESS = "success";

    /**
     * afm_dwgs table name.
     */
    public static final String TABLE_AFM_DWGS = "afm_dwgs";
    
    /**
     * Transform failed message.
     */
    public static final String TRANSFORM_FAILED = "Transform failed. ";

    /**
     * Underscore character delimiter.
     */
    public static final String UNDERSCORE = "_";
    
    /**
     * Verticies string (Yes, it is incorrectly spelled in the ARCHIBUS published JSON).
     */
    public static final String VERTICES = "Verticies";

    /**
     * Web Mercator geometry precision.
     */
    public static final Double WEB_MERCATOR_LINE_SEGMENT_MIN_LENGTH = 0.0;
    
    /**
     * Upper case ARCGIS string.
     */
    public static final String UPPERCASE_ARCGIS = "ARCGIS";
    
    /**
     * P1 string.
     */
    public static final String UPPERCASE_P1 = "P1";

    /**
     * P2 string.
     */
    public static final String UPPERCASE_P2 = "P2";

    /**
     * X string.
     */
    public static final String UPPERCASE_X = "X";

    /**
     * Y string.
     */
    public static final String UPPERCASE_Y = "Y";
    
    /**
     *
     * Private default constructor: utility class is non-instantiable.
     */
    private ArcgisExtensionsConstants() {
        
    }
    
}
