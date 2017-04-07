package com.archibus.app.common.extensionsarcgis;

import org.json.JSONArray;

/**
 *
 * Provides methods to create query strings for ArcGIS feature services for the Extensions for Esri.
 *
 *
 * @author knight
 *
 */
public abstract class AbstractArcgisQueryStringFactory {

    /**
     *
     * Constructs the add parameters to add features from an ArcGIS feature layer.
     *
     * @param esriFeatures The Esri features to add.
     * @return The add parameters.
     */
    public static String constructAddParams(final JSONArray esriFeatures) {
        final String addParams =
                ArcgisExtensionsConstants.FIELD_FEATURES + ArcgisExtensionsConstants.EQUALS
                        + esriFeatures.toString()
                + ArcgisExtensionsConstants.ARCGIS_URL_ADD_UPDATE_FEATURES_PARAM;
        return addParams;
    }

    /**
     *
     * Constructs the add features url for an ArcGIS feature layer.
     *
     * @param featureLayerUrl The feature layer url.
     * @return The add string.
     */
    public static String constructAddUrl(final String featureLayerUrl) {
        return featureLayerUrl + ArcgisExtensionsConstants.ARCGIS_URL_ADD_FEATURES;
    }

    /**
     *
     * Constructs the delete parameters to delete features from an ArcGIS feature layer.
     *
     * @param dwgname The ARCHIBUS drawing name.
     * @param assetType The ARCHIBUS asset type.
     * @return The delete parameters.
     */
    public static String constructDeleteParamsByDrawing(final String dwgname, final String assetType) {
        String deleteParams =
                ArcgisExtensionsConstants.PARAMETER_OBJECTIDS + ArcgisExtensionsConstants.EQUALS
                + ArcgisExtensionsConstants.AMPERSAND + ArcgisExtensionsConstants.PARAMETER_WHERE
                + ArcgisExtensionsConstants.EQUALS
                + ArcgisExtensionsConstants.DWGNAME
                + ArcgisExtensionsConstants.EQUALS
                + ArcgisExtensionsConstants.ARCGIS_URL_SINGLE_QUOTE + dwgname
                + ArcgisExtensionsConstants.ARCGIS_URL_SINGLE_QUOTE;

        final ArcgisFeatureLayer featureLayer =
                AbstractArcgisFeatureLayerFactory.createFeatureLayer(assetType,
                    ArcgisExtensionsConstants.SQL_ONE_EQUALS_ONE);
        final String assetTypeField = featureLayer.getAssetTypeField();

        if (assetTypeField != null) {
            deleteParams += ArcgisExtensionsConstants.SQL_AND;
            deleteParams += assetTypeField + ArcgisExtensionsConstants.EQUALS;
            deleteParams += ArcgisExtensionsConstants.ARCGIS_URL_SINGLE_QUOTE + assetType;
            deleteParams += ArcgisExtensionsConstants.ARCGIS_URL_SINGLE_QUOTE;
        }

        deleteParams += ArcgisExtensionsConstants.ARCGIS_URL_DELETE_FEATURES_PARAM;

        return deleteParams;
    }

    /**
     *
     * Constructs the delete features url for an ArcGIS feature layer.
     *
     * @param featureLayerUrl The feature layer url.
     * @return The delete string.
     */
    public static String constructDeleteUrl(final String featureLayerUrl) {
        return featureLayerUrl + ArcgisExtensionsConstants.ARCGIS_URL_DELETE_FEATURES;
    }

    /**
     *
     * Constructs the query parameters to query ObjectIds from an ArcGIS feature layer.
     *
     * @param whereClause The query where clause to be applied to the feature layer.
     * @param idField The ArcGIS feature layer id field name.
     * @param objectIdField The ArcGIS feature layer object id field name.
     * @return The query parameters.
     */
    public static String constructQueryParamsForObjectIds(final String whereClause,
            final String idField, final String objectIdField) {
        final String queryParams =
                ArcgisExtensionsConstants.PARAMETER_WHERE + ArcgisExtensionsConstants.EQUALS + whereClause
                + ArcgisExtensionsConstants.ARCGIS_URL_QUERY_FEATURES_PARAM_1 + idField
                + ArcgisExtensionsConstants.COMMA + objectIdField
                + ArcgisExtensionsConstants.ARCGIS_URL_QUERY_FEATURES_PARAM_2;
        return queryParams;
    }

    /**
     *
     * Constructs the query parameters to query ObjectIds by drawing name from an ArcGIS feature
     * layer.
     *
     * @param dwgname The ARCHIBUS drawing name.
     * @param idField The ArcGIS feature layer id field name.
     * @param objectIdField The ArcGIS feature layer object id field name.
     * @return The query parameters.
     */
    public static String constructQueryParamsForObjectIdsByDrawing(final String dwgname,
            final String idField, final String objectIdField) {
        final String queryParams =
                ArcgisExtensionsConstants.PARAMETER_WHERE + ArcgisExtensionsConstants.EQUALS
                + ArcgisExtensionsConstants.DWGNAME
                + ArcgisExtensionsConstants.EQUALS
                + ArcgisExtensionsConstants.ARCGIS_URL_SINGLE_QUOTE + dwgname
                + ArcgisExtensionsConstants.ARCGIS_URL_SINGLE_QUOTE
                + ArcgisExtensionsConstants.ARCGIS_URL_QUERY_FEATURES_PARAM_1 + idField
                + ArcgisExtensionsConstants.COMMA + objectIdField
                + ArcgisExtensionsConstants.ARCGIS_URL_QUERY_FEATURES_PARAM_2;
        return queryParams;
    }

    /**
     *
     * Constructs the query parameters to query Room ObjectIds from an ArcGIS feature layer.
     *
     * @param dwgname The ARCHIBUS drawing name.
     * @param roomKey The ARCHIBUS room key.
     * @param idField The ArcGIS feature layer id field name.
     * @param objectIdField The ArcGIS feature layer object id field name.
     * @return The query parameters.
     */
    public static String constructQueryParamsForRoomObjectIds(final String dwgname,
            final String[] roomKey, final String idField, final String objectIdField) {
        final String queryParams =
                ArcgisExtensionsConstants.PARAMETER_WHERE + ArcgisExtensionsConstants.EQUALS
                + ArcgisExtensionsConstants.DWGNAME
                + ArcgisExtensionsConstants.EQUALS
                + ArcgisExtensionsConstants.ARCGIS_URL_SINGLE_QUOTE + dwgname
                + ArcgisExtensionsConstants.ARCGIS_URL_SINGLE_QUOTE
                + ArcgisExtensionsConstants.SQL_AND + roomKey[2] + " NOT IN ("
                        + ArcgisExtensionsConstants.ARCGIS_URL_SINGLE_QUOTE + "EXT"
                        + ArcgisExtensionsConstants.ARCGIS_URL_SINGLE_QUOTE
                        + ArcgisExtensionsConstants.COMMA
                        + ArcgisExtensionsConstants.ARCGIS_URL_SINGLE_QUOTE + "INT"
                        + ArcgisExtensionsConstants.ARCGIS_URL_SINGLE_QUOTE + ") "
                        + ArcgisExtensionsConstants.ARCGIS_URL_QUERY_FEATURES_PARAM_1 + idField
                        + ArcgisExtensionsConstants.COMMA + objectIdField
                        + ArcgisExtensionsConstants.ARCGIS_URL_QUERY_FEATURES_PARAM_2;
        return queryParams;
    }

    /**
     *
     * Constructs the query features url for an ArcGIS feature layer.
     *
     * @param featureLayerUrl The feature layer url.
     * @return The query string.
     */
    public static String constructQueryUrl(final String featureLayerUrl) {
        return featureLayerUrl + ArcgisExtensionsConstants.ARCGIS_URL_QUERY_FEATURES;
        
    }
}
