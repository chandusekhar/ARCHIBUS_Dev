package com.archibus.app.common.extensionsarcgis;

import org.apache.log4j.Logger;
import org.json.*;

import com.archibus.app.common.connectors.domain.ConnectorConfig;
import com.archibus.controls.arcgis.ArcgisHttpClient;

/**
 *
 * Provides methods for querying and updating with ArcGIS feature services.
 *
 * @author knight
 *
 */
public final class ArcgisFeatureServiceManager {
    
    /**
     * Logger used to output non-fatal errors.
     */
    @SuppressWarnings({ "PMD.AvoidStaticFields" })
    // See KB# 3051675
    private static Logger log = Logger.getLogger(ArcgisFeatureServiceManager.class);
    
    /**
     * Constructor not called.
     */
    private ArcgisFeatureServiceManager() {
        
    }
    
    /**
     *
     * Add features to an ArcGIS feature layer.
     *
     * @param featureCollection An Esri feature collection containing the features to add.
     * @param assetType The ARCHIBUS asset type.
     * @param featureLayerUrl The ArcGIS feature layer URL.
     */
    public static void addFeatures(final JSONObject featureCollection,
            final String featureLayerUrl, final String assetType) {
        log.info("Adding ArcGIS features...");
        
        /*
         * Get the ARCHIBUS dwgname.
         */
        final String dwgname =
                featureCollection.getJSONObject(ArcgisExtensionsConstants.JSON_PROPERTIES)
                    .getJSONObject(ArcgisExtensionsConstants.JSON_DWGINFO)
                    .getString(ArcgisExtensionsConstants.DWGNAME);
        
        /*
         * Get the Esri features from the JSON Object.
         */
        final JSONArray features =
                featureCollection.getJSONArray(ArcgisExtensionsConstants.FIELD_FEATURES);
        
        /*
         * Filter the Esri features for asset type.
         */
        final JSONArray esriFeatures = ArcgisJsonUtilities.filterEsriFeatures(features, assetType);
        
        /*
         * First, delete the existing features in the feature layer for the drawing.
         */
        final String deleteParams =
                AbstractArcgisQueryStringFactory.constructDeleteParamsByDrawing(dwgname, assetType);
        final String deleteUrl =
                AbstractArcgisQueryStringFactory.constructDeleteUrl(featureLayerUrl);
        final JSONObject deleteResult = postToArcgisServer(deleteUrl, deleteParams);
        
        /*
         * Next, add new features to the feature layer for the drawing.
         */
        final String addParams = AbstractArcgisQueryStringFactory.constructAddParams(esriFeatures);
        final String addUrl = AbstractArcgisQueryStringFactory.constructAddUrl(featureLayerUrl);
        
        if (deleteResultSuccess(deleteResult)) {
            postToArcgisServer(addUrl, addParams);
        } else {
            log.error("Delete features failed. New features not added. " + deleteResult.toString());
        }
    }
    
    /**
     *
     * Query an ArcGIS feature service for OBJECTIDs.
     *
     * @param arcgisFeatureLayer the ArcGIS feature layer.
     * @param whereClause the where clause to use in the feature layer query.
     * @return the OBJECTIDs for the feature layer.
     */
    public static JSONObject queryFeatureServiceForObjectIds(
            final ArcgisFeatureLayer arcgisFeatureLayer, final String whereClause) {
        
        log.info("Querying feature layer for Object IDs...");
        
        final String idField = arcgisFeatureLayer.getIdField();
        final String objectIdField = arcgisFeatureLayer.getObjectIdField();
        final String featureLayerUrl = arcgisFeatureLayer.getUrl();
        
        final String queryUrl = AbstractArcgisQueryStringFactory.constructQueryUrl(featureLayerUrl);
        final String queryParams =
                AbstractArcgisQueryStringFactory.constructQueryParamsForObjectIds(whereClause,
                    idField, objectIdField);

        log.info("Query Url: " + queryUrl);
        log.info("Query parameters: " + queryParams);
        
        final JSONObject queryResult = postToArcgisServer(queryUrl, queryParams);
        
        return queryResult;
    }
    
    /**
     *
     * Update fields in the ArcGIS feature layer with values from fields in the ARCHIBUS asset
     * table. The ArcGIS Export connector runs this method as a post process.
     *
     * @param connectorConfig The connector configuration.
     *
     */
    public static void updateArcgisFeatureDataFromConnector(final ConnectorConfig connectorConfig) {

        /*
         * Get the json file.
         */
        final String filename = connectorConfig.getConnStringDb();
        
        /*
         * Read the feature data from file.
         */
        final JSONObject features = JsonReaderWriter.readFile(filename);

        /*
         * Get the asset type.
         */
        final String assetType = connectorConfig.getDestinationTbl();
        
        /*
         * Get the feature layer URL.
         */
        final ArcgisFeatureLayer featureLayer =
                AbstractArcgisFeatureLayerFactory.createFeatureLayer(assetType,
                    ArcgisExtensionsConstants.SQL_ONE_EQUALS_ONE);
        final String featureUrl = featureLayer.getUrl();
        
        ArcgisExtensionsService.checkExtensionsForEsriLicense();
        
        ArcgisFeatureServiceManager.updateFeatureData(featureUrl, features);
    }
    
    /**
     *
     * Update the ARCHIBUS geo_objectid field for the asset with OBJECTIDs from the ArcGIS feature
     * layer.
     *
     * @param connectorConfig The connector configuration.
     */
    public static void updateGeoObjectIdsFromConnector(final ConnectorConfig connectorConfig) {
        
        /*
         * Check for Extensions for Esri license.
         */
        ArcgisExtensionsService.checkExtensionsForEsriLicense();

        /*
         * Get the asset type.
         */
        final String assetType = connectorConfig.getDestinationTbl();
        
        /*
         * Get the restriction.
         */
        final String whereClause = connectorConfig.getClause();

        /*
         * Get the feature layer URL.
         */
        final ArcgisFeatureLayer featureLayer =
                AbstractArcgisFeatureLayerFactory.createFeatureLayer(assetType, whereClause);

        /*
         * Query the feature layer for object ids.
         */
        final JSONObject featureData = queryFeatureServiceForObjectIds(featureLayer, whereClause);

        /*
         * Create the import filename.
         */
        final String geoJsonPath = ArchibusProjectUtilities.getGeoJsonPath();
        final String importFilename =
                geoJsonPath + assetType + ArcgisExtensionsConstants.FILENAME_IMPORT_ARCGIS_JSON;

        /*
         * Save the asset data for the import connector.
         */
        JsonReaderWriter.writeFile(featureData, importFilename);
        
        /*
         * Call the import connector to import the asset data.
         */
        final String importConnectorId = featureLayer.getImportConnectorId();
        ArcgisConnectorManager.runJsonImportConnector(importConnectorId, importFilename);

    }

    /**
     *
     * Update ArcGIS feature data with ARCHIBUS data generated from Connector.
     *
     * @param featureUrl the ArcGIS feature service URL.
     * @param features the ArcGIS features to update.
     */
    private static void updateFeatureData(final String featureUrl, final JSONObject features) {
        
        log.info("Updating feature data...");
        
        /*
         * Get the features.
         */
        final JSONArray featureData =
                features.getJSONArray(ArcgisExtensionsConstants.FIELD_FEATURES);
        /*
         * Create the update parameter URL.
         */
        final String updateParams =
                ArcgisExtensionsConstants.FIELD_FEATURES + ArcgisExtensionsConstants.EQUALS
                        + featureData.toString()
                + ArcgisExtensionsConstants.ARCGIS_URL_ADD_UPDATE_FEATURES_PARAM;
        final String updateUrl = featureUrl + ArcgisExtensionsConstants.ARCGIS_URL_UPDATE_FEATURES;
        
        /*
         * Post the update to ArcGIS.
         */
        ArcgisFeatureServiceManager.postToArcgisServer(updateUrl, updateParams);
        
        // TODO If success, the update result object is an array of feature ids that were updated.
        // If failure, the update result object is ???
        // if (updateResult.getBoolean("success") == true) {
        // LOG.info("Feature data updated successfully.");
        // } else {
        // LOG.info("Update feature url: " + updateUrl);
        // LOG.info("Update feature parameters: " + updateParams);
        // LOG.error("Feature data update failed. " + updateResult.toString());
        // }
        
    }
    
    /**
     * Post to ArcGIS Server.
     *
     * @param url The url for the ArcGIS Server service.
     * @param parameters The url parameters for the ArcGIS Server service.
     * @return The result from the ArcGIS Server service.
     */
    private static JSONObject postToArcgisServer(final String url, final String parameters) {
        
        log.info("Posting to ArcGIS Server...");
        
        /*
         * Execute the http post.
         */
        
        final JSONObject result = ArcgisHttpClient.executePost(url, parameters);
        
        return result;
    }

    /**
     *
     * Check the delete results for an error.
     * 
     * @param deleteResult The delete result from ArcGIS Server.
     * @return true if no error, false if error.
     */
    private static boolean deleteResultSuccess(final JSONObject deleteResult) {
        boolean result = true;
        
        if (deleteResult.has(ArcgisExtensionsConstants.ERROR)) {
            result = false;
        }
        
        return result;
    }
}
