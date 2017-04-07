package com.archibus.app.common.extensionsarcgis;

import org.apache.log4j.Logger;
import org.json.JSONObject;

import com.archibus.context.ContextStore;
import com.archibus.jobmanager.EventHandlerContext;

/**
 *
 * Provides methods to publish and update ARCHIBUS assets to GeoJSON and ArcGIS feature services.
 *
 * Used by the Extensions for Esri.
 *
 * @author knight
 *
 */
public final class ArcgisExtensionsPublisher {

    /**
     * Logger used to output debugging results.
     */
    @SuppressWarnings({ "PMD.AvoidStaticFields" })
    // See KB# 3051675
    private static Logger log = Logger.getLogger(ArcgisExtensionsPublisher.class);

    /**
     * Constructor not called.
     */
    private ArcgisExtensionsPublisher() {

    }

    /**
     * Publish drawing features to GeoJSON/ArcGIS. The context must include the drawing name.
     *
     */
    public static void publishFeatures() {

        log.info("Publishing features...");

        /*
         * Get the dwgname from the context.
         */
        String dwgname = null;
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        if (context.parameterExists(ArcgisExtensionsConstants.DWGNAME)) {
            dwgname = (String) context.getParameter(ArcgisExtensionsConstants.DWGNAME);
            publishFeaturesForDrawing(dwgname);
        } else {
            log.error("Could not publish room features. Could not get drawing name from context.");
        }

    }

    /**
     *
     * Publish features by drawing.
     *
     * @param dwgname the ARCHIBUS drawing name.
     */
    private static void publishFeaturesForDrawing(final String dwgname) {
        log.info("Publishing features for drawing: " + dwgname);

        /*
         * Create the publishing configuration object.
         */
        final ArcgisPublishingConfiguration pubConfig = new ArcgisPublishingConfiguration();

        /*
         * Publish to GeoJSON.
         */
        final JSONObject assets = publishToGeoJson(dwgname, pubConfig);

        /*
         * Publish to ArcGIS Server.
         */
        if (ArcgisExtensionsConstants.UPPERCASE_ARCGIS.equalsIgnoreCase(pubConfig
            .getPublishFormat())) {
            publishToArcgisServer(assets, pubConfig);
        }

    }

    /**
     *
     * Publish the drawing to GeoJSON format.
     *
     * @param dwgname The ARCHIBUS drawing name.
     * @param pubConfig The publishing configuration.
     * @return The published GeoJSON.
     */
    private static JSONObject publishToGeoJson(final String dwgname,
            final ArcgisPublishingConfiguration pubConfig) {

        /*
         * Create the asset file names.
         */
        final String assetsFilename = ArchibusProjectUtilities.getAssetsFilename(dwgname);
        log.info("Assets filename: " + assetsFilename);

        /*
         * Read the assets.
         */
        JSONObject assets = JsonReaderWriter.readFile(assetsFilename.toLowerCase());
        /*
         * Create the GeoJSON path.
         */
        final String geoJsonPath = ArchibusProjectUtilities.getGeoJsonPath();

        /*
         * Convert ArchibusJSON to GeoJSON.
         */
        assets = ArchibusJsonConverter.convertToGeoJson(assets, pubConfig);
        String outFilename = geoJsonPath + dwgname + "_CAD.json";
        JsonReaderWriter.writeFile(assets, outFilename);

        /*
         * Transform CAD coordinates to local geographic coordinates.
         */
        assets = GeoJsonFeatureTransformer.transform(assets, pubConfig);
        outFilename = geoJsonPath + dwgname + "_LOCAL.json";
        JsonReaderWriter.writeFile(assets, outFilename);

        /*
         * Project local geographic coordinates to Latitude-Longitude.
         */
        final JSONObject assetsLL =
                GeoJsonFeatureProjector.project(assets, ArcgisExtensionsConstants.EPSG_LAT_LON,
                    pubConfig);
        outFilename = geoJsonPath + dwgname + "_LL.json";
        JsonReaderWriter.writeFile(assetsLL, outFilename);

        /*
         * Project local geographic coordinates to Web Mercator
         */
        assets =
                GeoJsonFeatureProjector.project(assets, ArcgisExtensionsConstants.EPSG_WEB_MERC,
                    pubConfig);
        outFilename = geoJsonPath + dwgname + "_WM.json";
        JsonReaderWriter.writeFile(assets, outFilename);

        /*
         * Convert GeoJSON to EsriJSON.
         */
        assets = GeoJsonConverter.convertToEsriJson(assets, pubConfig);
        outFilename = geoJsonPath + dwgname + "_ESRI.json";
        JsonReaderWriter.writeFile(assets, outFilename);

        return assets;
    }

    /**
     *
     * Publish the drawing to ArcGIS.
     *
     * @param esriFeatureCollection The GeoJSON assets to publish.
     * @param pubConfig The publishing configuration.
     */
    private static void publishToArcgisServer(final JSONObject esriFeatureCollection,
            final ArcgisPublishingConfiguration pubConfig) {

        /*
         * Get the assets to publish from the publishing configuration.
         */
        final String[] publishAssetList = pubConfig.getPublishAssetTypes();

        /*
         * Publish each asset in the publish asset list.
         */
        for (final String assetType : publishAssetList) {
            /*
             * Get the feature layer URL.
             */
            final ArcgisFeatureLayer featureLayer =
                    AbstractArcgisFeatureLayerFactory.createFeatureLayer(assetType,
                        ArcgisExtensionsConstants.SQL_ONE_EQUALS_ONE);
            final String featureLayerUrl = featureLayer.getUrl();

            /*
             * Add the features to ArcGIS Server.
             */
            ArcgisFeatureServiceManager.addFeatures(esriFeatureCollection, featureLayerUrl,
                assetType);

            /*
             * Update the feature data.
             */
            // TODO set the where clause for the feature layer?
            updateFeatureDataForDrawing(assetType, featureLayer);

        }

        /*
         * Publish the background graphics.
         */

        if (pubConfig.getPublishBackground()) {

            /*
             * Get the feature layer URL.
             */
            final ArcgisFeatureLayer featureLayer =
                    AbstractArcgisFeatureLayerFactory.createFeatureLayer(
                        ArcgisExtensionsConstants.ASSET_TYPE_BACKGROUND,
                        ArcgisExtensionsConstants.SQL_ONE_EQUALS_ONE);
            final String featureLayerUrl = featureLayer.getUrl();

            /*
             * Add the features to ArcGIS Server.
             */
            ArcgisFeatureServiceManager.addFeatures(esriFeatureCollection, featureLayerUrl,
                ArcgisExtensionsConstants.ASSET_TYPE_BACKGROUND);

            /*
             * Done. Don't call any connectors for background graphics.
             */

        }

    }

    /**
     *
     * Update the feature data for a drawing. OBJECTID (required) and other configurable fields from
     * ArcGIS to ARCHIBUS. ARCHIBUS asset data (configurable) to ArcGIS.
     *
     * The context must include the drawing name.
     *
     * This is called as the last step in the Smart Client Extensions ArcGIS publishing process.
     *
     * @param assetType The ARCHIBUS asset type to update.
     * @param featureLayer The ArcGIS feature layer for the asset.
     */
    public static void updateFeatureDataForDrawing(final String assetType,
            final ArcgisFeatureLayer featureLayer) {

        /*
         * Get the dwgname from the context.
         */
        String dwgname = null;
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        if (context.parameterExists(ArcgisExtensionsConstants.DWGNAME)) {
            dwgname = (String) context.getParameter(ArcgisExtensionsConstants.DWGNAME);
        }
        
        /*
         * Create the where clause.
         */
        final String whereClause =
                ArcgisExtensionsConstants.DWGNAME + ArcgisExtensionsConstants.EQUALS
                + ArcgisExtensionsConstants.SINGLE_QUOTE + dwgname
                + ArcgisExtensionsConstants.SINGLE_QUOTE;

        /*
         * Update the feature data.
         */
        updateFeatureData(assetType, featureLayer, whereClause);
    }

    /**
     *
     * Update feature data by the ArcGIS OBJECTID.
     *
     * @param assetType The ARCHIBUS asset type.
     * @param objectId The OBJECTID of the ArcGIS feature to update.
     */
    public static void updateFeatureDataByObjectId(final String assetType, final String objectId) {

        // TODO
        // create the layer for the asset type
        // get the objectid field from the layer
        // create the where clause
        // update the layer with the where clause
        // update the feature data
        
        /*
         * Create the where clause.
         */
        final String whereClause =
                ArcgisExtensionsConstants.FIELD_GEO_OBJECTID + ArcgisExtensionsConstants.EQUALS
                + objectId;

        /*
         * Create the feature layer.
         */
        final ArcgisFeatureLayer featureLayer =
                AbstractArcgisFeatureLayerFactory.createFeatureLayer(assetType, whereClause);

        /*
         * Update the feature data.
         */
        updateFeatureData(assetType, featureLayer, whereClause);

    }

    /**
     *
     * Update feature data with a restriction.
     *
     * @param assetType The ARCHIBUS asset type.
     * @param whereClauseParam The SQL where clause to apply to the ArcGIS features.
     */

    public static void updateFeatureDataByRestriction(final String assetType,
            final String whereClauseParam) {

        /*
         * Create the where clause.
         */
        final String whereClause =
                whereClauseParam + ArcgisExtensionsConstants.SQL_AND
                + ArcgisExtensionsConstants.FIELD_GEO_OBJECTID
                + ArcgisExtensionsConstants.SQL_IS_NOT_NULL;

        /*
         * Create the feature layer.
         */
        final ArcgisFeatureLayer featureLayer =
                AbstractArcgisFeatureLayerFactory.createFeatureLayer(assetType, whereClause);

        /*
         * Update the feature data.
         */
        updateFeatureData(assetType, featureLayer, whereClause);

    }

    /**
     *
     * Update the feature data.
     *
     * This is called as the last step in the Smart Client Extensions ArcGIS publishing process.
     * This is also called as the last step from many of the asset connectors and/or via one of the
     * ArcgisExtensionsService#updateFeatureData methods.
     *
     * @param assetType The ARCHIBUS asset type to update.
     * @param featureLayer The ArcGIS feature layer for the asset.
     * @param whereClause The whereClause for the ARCGIS feature layer.
     */
    private static void updateFeatureData(final String assetType,
            final ArcgisFeatureLayer featureLayer, final String whereClause) {

        /*
         * Create the import/export filenames.
         */
        final String geoJsonPath = ArchibusProjectUtilities.getGeoJsonPath();
        final String importFilename =
                geoJsonPath + assetType + ArcgisExtensionsConstants.FILENAME_IMPORT_ARCGIS_JSON;
        final String exportFilename =
                geoJsonPath + assetType + ArcgisExtensionsConstants.FILENAME_EXPORT_ARCGIS_JSON;

        log.info("Import asset data filename: " + importFilename);
        log.info("Export asset data filename: " + exportFilename);

        /*
         * Query the feature layer for the object ids and asset ids.
         */
        final JSONObject importData =
                ArcgisFeatureServiceManager.queryFeatureServiceForObjectIds(featureLayer,
                    whereClause);

        /*
         * Save the asset data for the import connector.
         */
        JsonReaderWriter.writeFile(importData, importFilename);

        /*
         * Call the import connector to import the asset data.
         */
        final String importConnectorId = featureLayer.getImportConnectorId();
        ArcgisConnectorManager.runJsonImportConnector(importConnectorId, importFilename);

        /*
         * Call the export connector to export the asset data.
         */
        final String exportConnectorId = featureLayer.getExportConnectorId();
        final String exportWhereClause =
                whereClause + ArcgisExtensionsConstants.SQL_AND
                        + ArcgisExtensionsConstants.FIELD_GEO_OBJECTID
                        + ArcgisExtensionsConstants.SQL_IS_NOT_NULL;
        ArcgisConnectorManager.runJsonExportConnector(exportConnectorId, exportFilename,
            exportWhereClause);

        // The export connector post process will call
        // ArcgisExtensionsService#updateArcgisFeatureDataFromConnector method
        // to post the changes to the ArcGIS feature service.
    }

    /**
     * LEGACY METHODS FOLLOW -- TO BE DELETED AFTER TESTING CONNECTORS AND MAP API.
     */
    //
    //
    // /**
    // *
    // * Update building feature data.
    // *
    // * @param whereClauseParam the where clause for the update.
    // */
    // public static void updateBuildingFeatureData(final String whereClauseParam) {
    //
    // /*
    // * Create the where clause.
    // */
    // final String whereClause =
    // whereClauseParam + ArcgisExtensionsConstants.SQL_AND
    // + ArcgisExtensionsConstants.FIELD_GEO_OBJECTID
    // + ArcgisExtensionsConstants.SQL_IS_NOT_NULL;
    // log.info("Updating building feature data where : " + whereClause);
    //
    // /*
    // * Create the building layer.
    // */
    // final ArcgisFeatureLayer buildingLayer =
    // AbstractArcgisFeatureLayerFactory.createFeatureLayer(
    // ArcgisExtensionsConstants.ASSET_TYPE_BL, whereClause);
    //
    // final String geoJsonPath = ArchibusProjectUtilities.getGeoJsonPath();
    // final String importFilename =
    // geoJsonPath + ArcgisExtensionsConstants.FILENAME_BL_IMPORT_ARCGIS_JSON;
    // final String exportFilename =
    // geoJsonPath + ArcgisExtensionsConstants.FILENAME_BL_EXPORT_ARCGIS_JSON;
    //
    // log.info("Import building filename: " + importFilename);
    // log.info("Export building filename: " + exportFilename);
    //
    // /*
    // * Use the ArcGIS Feature Service Client to query the building layer for the object ids and
    // * asset ids.
    // */
    // final JSONObject buildingData =
    // ArcgisFeatureServiceManager.queryFeatureServiceForObjectIds(buildingLayer,
    // whereClause);
    //
    // /*
    // * Save the building data for the import connector.
    // */
    // JsonReaderWriter.writeFile(buildingData, importFilename);
    //
    // /*
    // * Call the import connector to import the building data.
    // */
    // final String importConnectorId = buildingLayer.getImportConnectorId();
    // ArcgisConnectorManager.runJsonImportConnector(importConnectorId, importFilename);
    //
    // /*
    // * Call the export connector to export the building data.
    // */
    // final String exportConnectorId = buildingLayer.getExportConnectorId();
    // ArcgisConnectorManager.runJsonExportConnector(exportConnectorId, exportFilename,
    // whereClause);
    //
    // // The export connector post process will call the
    // // ArcgisFeatureServiceClient.updateFeatures method
    // // to post the changes to the ArcGIS feature service.
    //
    // }
    //
    // /**
    // *
    // * Update building feature data by ArcGIS OBJECTID.
    // *
    // * @param objectId the OBJECTID of the ArcGIS building feature to update.
    // */
    // public static void updateBuildingFeatureDataByObjectId(final String objectId) {
    //
    // /*
    // * Create the where clause.
    // */
    // final String whereClause = ArcgisExtensionsConstants.SQL_GEO_OBJECTID_EQUALS + objectId;
    // log.info("Updating building feature data by objectId : " + objectId);
    //
    // /*
    // * Create the building layer.
    // */
    // final ArcgisFeatureLayer buildingLayer =
    // AbstractArcgisFeatureLayerFactory.createFeatureLayer(
    // ArcgisExtensionsConstants.ASSET_TYPE_BL, whereClause);
    //
    // /*
    // * Create the export file name.
    // */
    // final String geoJsonPath = ArchibusProjectUtilities.getGeoJsonPath();
    // final String exportFilename =
    // geoJsonPath + ArcgisExtensionsConstants.FILENAME_BL_EXPORT_ARCGIS_JSON;
    // log.info("Export building filename (by objectid): " + exportFilename);
    //
    // /*
    // * Call the export connector to export the building data.
    // */
    // final String exportConnectorId = buildingLayer.getExportConnectorId();
    // ArcgisConnectorManager.runJsonExportConnector(exportConnectorId, exportFilename,
    // whereClause);
    //
    // // The export connector post process will call the
    // // ArcgisFeatureServiceClient.updateFeatures method
    // // to post the changes to the ArcGIS feature service.
    //
    // }
    //
    // /**
    // *
    // * Update room feature data for a drawing. The context must include the drawing name.
    // *
    // */
    // public static void updateRoomFeatureData() {
    //
    // log.info("Updating room feature data...");
    //
    // /*
    // * Get the dwgname from the context.
    // */
    // String dwgname = null;
    // final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
    // if (context.parameterExists(ArcgisExtensionsConstants.DWGNAME)) {
    // dwgname = (String) context.getParameter(ArcgisExtensionsConstants.DWGNAME);
    // }
    //
    // /*
    // * Create the room layer.
    // */
    // final ArcgisFeatureLayer roomLayer =
    // AbstractArcgisFeatureLayerFactory.createFeatureLayer(
    // ArcgisExtensionsConstants.ASSET_TYPE_RM,
    // ArcgisExtensionsConstants.SQL_ONE_EQUALS_ONE);
    //
    // /*
    // * Create the input/output filenames.
    // */
    // final String geoJsonPath = ArchibusProjectUtilities.getGeoJsonPath();
    // final String importFilename =
    // geoJsonPath + ArcgisExtensionsConstants.FILENAME_RM_IMPORT_ARCGIS_JSON;
    // final String exportFilename =
    // geoJsonPath + ArcgisExtensionsConstants.FILENAME_RM_EXPORT_ARCGIS_JSON;
    // final String whereClause =
    // ArcgisExtensionsConstants.SQL_DWGNAME_EQUALS
    // + ArcgisExtensionsConstants.ARCGIS_URL_SINGLE_QUOTE + dwgname
    // + ArcgisExtensionsConstants.ARCGIS_URL_SINGLE_QUOTE
    // + ArcgisExtensionsConstants.SQL_AND
    // + ArcgisExtensionsConstants.FIELD_GEO_OBJECTID
    // + ArcgisExtensionsConstants.SQL_IS_NOT_NULL;
    //
    // log.info("Import room filename: " + importFilename);
    // log.info("Export room filename: " + exportFilename);
    //
    // /*
    // * Use the ArcGIS Feature Service Client to query the room layer for the object ids and
    // * asset ids.
    // */
    // final JSONObject roomData =
    // ArcgisFeatureServiceManager.queryRoomFeatureServiceForObjectIds(roomLayer, dwgname);
    //
    // /*
    // * Save the room data for the import connector.
    // */
    // JsonReaderWriter.writeFile(roomData, importFilename);
    //
    // /*
    // * Call the import connector to import the room data.
    // */
    // final String importConnectorId = roomLayer.getImportConnectorId();
    // ArcgisConnectorManager.runJsonImportConnector(importConnectorId, importFilename);
    //
    // /*
    // * Call the export connector to export the room data.
    // */
    // final String exportConnectorId = roomLayer.getExportConnectorId();
    // ArcgisConnectorManager.runJsonExportConnector(exportConnectorId, exportFilename,
    // whereClause);
    //
    // // The export connector post process will call the
    // // ArcgisFeatureServiceClient.updateFeatures method
    // // to post the changes to the ArcGIS feature service.
    // }
    //
    // /**
    // *
    // * Update room feature data by ArcGIS OBJECTID.
    // *
    // * @param objectId the OBJECTID of the ArcGIS room feature to update.
    // */
    // public static void updateRoomFeatureDataByObjectId(final String objectId) {
    //
    // /*
    // * Create the where clause.
    // */
    // final String whereClause = ArcgisExtensionsConstants.SQL_GEO_OBJECTID_EQUALS + objectId;
    // log.info("Updating room feature data by objectId : " + objectId);
    //
    // /*
    // * Create the building layer.
    // */
    // final ArcgisFeatureLayer roomLayer =
    // AbstractArcgisFeatureLayerFactory.createFeatureLayer(
    // ArcgisExtensionsConstants.ASSET_TYPE_RM,
    // ArcgisExtensionsConstants.SQL_ONE_EQUALS_ONE);
    //
    // /*
    // * Create the export file name.
    // */
    // final String geoJsonPath = ArchibusProjectUtilities.getGeoJsonPath();
    // final String exportFilename =
    // geoJsonPath + ArcgisExtensionsConstants.FILENAME_RM_EXPORT_ARCGIS_JSON;
    // log.info("Export room filename (by objectid): " + exportFilename);
    //
    // /*
    // * Call the export connector to export the building data.
    // */
    // final String exportConnectorId = roomLayer.getExportConnectorId();
    // ArcgisConnectorManager.runJsonExportConnector(exportConnectorId, exportFilename,
    // whereClause);
    //
    // // The export connector post process will call the
    // // ArcgisFeatureServiceClient.updateFeatures method
    // // to post the changes to the ArcGIS feature service.
    //
    // }
    //
    // /**
    // *
    // * Update equipment feature data for a drawing. The context must include the drawing name.
    // *
    // */
    // public static void updateEquipmentFeatureData() {
    //
    // log.info("Updating equipment feature data...");
    //
    // /*
    // * Get the dwgname from the context.
    // */
    // String dwgname = null;
    // final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
    // if (context.parameterExists(ArcgisExtensionsConstants.DWGNAME)) {
    // dwgname = (String) context.getParameter(ArcgisExtensionsConstants.DWGNAME);
    // }
    //
    // /*
    // * Create the room layer.
    // */
    // final ArcgisFeatureLayer equipmentLayer =
    // AbstractArcgisFeatureLayerFactory.createFeatureLayer(
    // ArcgisExtensionsConstants.ASSET_TYPE_EQ,
    // ArcgisExtensionsConstants.SQL_ONE_EQUALS_ONE);
    //
    // final String geoJsonPath = ArchibusProjectUtilities.getGeoJsonPath();
    // final String whereClause =
    // ArcgisExtensionsConstants.SQL_DWGNAME_EQUALS
    // + ArcgisExtensionsConstants.ARCGIS_URL_SINGLE_QUOTE + dwgname
    // + ArcgisExtensionsConstants.ARCGIS_URL_SINGLE_QUOTE + " AND "
    // + "geo_objectid" + " IS NOT NULL ";
    // final String importFilename =
    // geoJsonPath + ArcgisExtensionsConstants.FILENAME_EQ_IMPORT_ARCGIS_JSON;
    // final String exportFilename =
    // geoJsonPath + ArcgisExtensionsConstants.FILENAME_EQ_EXPORT_ARCGIS_JSON;
    //
    // log.info("Import equipment filename: " + importFilename);
    // log.info("Export equipment filename: " + exportFilename);
    //
    // /*
    // * Use the ArcGIS Feature Service Client to query the equipment layer for the object ids and
    // * asset ids.
    // */
    // final JSONObject equipmentData =
    // ArcgisFeatureServiceManager.queryFeatureServiceForObjectIdsByDrawing(
    // equipmentLayer, dwgname);
    //
    // /*
    // * Save the room data for the import connector.
    // */
    // JsonReaderWriter.writeFile(equipmentData, importFilename);
    //
    // /*
    // * Call the import connector to import the room data.
    // */
    // final String importConnectorId = equipmentLayer.getImportConnectorId();
    // ArcgisConnectorManager.runJsonImportConnector(importConnectorId, importFilename);
    //
    // /*
    // * Call the export connector to export the room data.
    // */
    // final String exportConnectorId = equipmentLayer.getExportConnectorId();
    // ArcgisConnectorManager.runJsonExportConnector(exportConnectorId, exportFilename,
    // whereClause);
    //
    // // The export connector post process will call the
    // // ArcgisFeatureServiceClient.updateFeatures method
    // // to post the changes to the ArcGIS feature service.
    // }
    //
    // /**
    // * Update equipment feature data by ArcGIS OBJECTID. +
    // *
    // * @param objectId the OBJECTID of the ArcGIS equipment feature to update.
    // */
    // public static void updateEquipmentFeatureDataByObjectId(final String objectId) {
    //
    // /*
    // * Create the where clause.
    // */
    // final String whereClause = ArcgisExtensionsConstants.SQL_GEO_OBJECTID_EQUALS + objectId;
    // log.info("Updating equipment feature data by objectId : " + objectId);
    //
    // /*
    // * Create the building layer.
    // */
    // final ArcgisFeatureLayer equipmentLayer =
    // AbstractArcgisFeatureLayerFactory.createFeatureLayer(
    // ArcgisExtensionsConstants.ASSET_TYPE_EQ,
    // ArcgisExtensionsConstants.SQL_ONE_EQUALS_ONE);
    //
    // /*
    // * Create the export file name.
    // */
    // final String geoJsonPath = ArchibusProjectUtilities.getGeoJsonPath();
    // final String exportFilename =
    // geoJsonPath + ArcgisExtensionsConstants.FILENAME_EQ_EXPORT_ARCGIS_JSON;
    //
    // log.info("Export equipment filename (by objectid): " + exportFilename);
    //
    // /*
    // * Call the export connector to export the building data.
    // */
    // final String exportConnectorId = equipmentLayer.getExportConnectorId();
    // ArcgisConnectorManager.runJsonExportConnector(exportConnectorId, exportFilename,
    // whereClause);
    //
    // // The export connector post process will call the
    // // ArcgisFeatureServiceClient.updateFeatures method
    // // to post the changes to the ArcGIS feature service.
    //
    // }
    //
    // /**
    // *
    // * Update property feature data.
    // *
    // * @param whereClauseParam the where clause to use in the update.
    // */
    // public static void updatePropertyFeatureData(final String whereClauseParam) {
    // /*
    // * Create the where clause.
    // */
    // final String whereClause =
    // whereClauseParam + ArcgisExtensionsConstants.SQL_AND
    // + ArcgisExtensionsConstants.FIELD_GEO_OBJECTID
    // + ArcgisExtensionsConstants.SQL_IS_NOT_NULL;
    // log.info("Updating property feature data where : " + whereClause);
    //
    // /*
    // * Create the property layer.
    // */
    // final ArcgisFeatureLayer propertyLayer =
    // AbstractArcgisFeatureLayerFactory.createFeatureLayer(
    // ArcgisExtensionsConstants.ASSET_TYPE_PROPERTY,
    // ArcgisExtensionsConstants.SQL_ONE_EQUALS_ONE);
    //
    // /*
    // * Create the import and export file names.
    // */
    // final String geoJsonPath = ArchibusProjectUtilities.getGeoJsonPath();
    // final String importFilename = geoJsonPath + "property-import-arcgis.json";
    // final String exportFilename = geoJsonPath + "property-export-arcgis.json";
    //
    // log.info("Import property filename: " + importFilename);
    // log.info("Export property filename: " + exportFilename);
    //
    // /*
    // * Use the ArcGIS Feature Service Client to query the building layer for the object ids and
    // * asset ids.
    // */
    // final JSONObject propertyData =
    // ArcgisFeatureServiceManager.queryFeatureServiceForObjectIds(propertyLayer,
    // whereClause);
    //
    // /*
    // * Save the building data for the import connector.
    // */
    // JsonReaderWriter.writeFile(propertyData, importFilename);
    //
    // /*
    // * Call the import connector to import the building data.
    // */
    // final String importConnectorId = propertyLayer.getImportConnectorId();
    // ArcgisConnectorManager.runJsonImportConnector(importConnectorId, importFilename);
    //
    // /*
    // * Call the export connector to export the building data.
    // */
    // final String exportConnectorId = propertyLayer.getExportConnectorId();
    // ArcgisConnectorManager.runJsonExportConnector(exportConnectorId, exportFilename,
    // whereClause);
    //
    // // The export connector post process will call the
    // // ArcgisFeatureServiceClient.updateFeatures method
    // // to post the changes to the ArcGIS feature service.
    //
    // }

}
