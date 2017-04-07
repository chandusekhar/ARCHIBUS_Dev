package com.archibus.app.common.extensionsarcgis;

import java.util.List;

import org.apache.log4j.Logger;
import org.geotools.geometry.jts.JTSFactoryFinder;
import org.json.*;

import com.vividsolutions.jts.geom.*;

/**
 *
 * Provides methods to convert GeoJSON to EsriJSON format.
 *
 * Used by the Extensions for Esri.
 *
 * @author knight
 * @since 23.1
 *
 */
public final class GeoJsonConverter {

    /**
     * Logger used to output debugging results.
     */
    @SuppressWarnings({ "PMD.AvoidStaticFields" })
    // See KB# 3051675
    private static Logger log = Logger.getLogger(GeoJsonConverter.class);

    /**
     *
     * Constructor not called.
     */
    private GeoJsonConverter() {

    }

    /**
     *
     * Convert GeoJSON to EsriJSON format. Used by the Extensions for Esri.
     *
     * @param geoJson The GeoJSON Feature Collection.
     * @param pubConfig The publishing configuration.
     * @return The Esri JSON.
     */
    public static JSONObject convertToEsriJson(final JSONObject geoJson,
            final ArcgisPublishingConfiguration pubConfig) {

        log.info("Converting GeoJSON to Esri Json...");

        /*
         * Get features from collection.
         */
        final JSONArray geoJsonFeatures =
                geoJson.getJSONArray(ArcgisExtensionsConstants.FIELD_FEATURES);

        /*
         * Create the Esri feature list.
         */
        final JSONArray esriFeatures = new JSONArray();

        /*
         * Get the JSON and crs objects from the geoJson.
         */
        final JSONObject jsonProperties =
                geoJson.getJSONObject(ArcgisExtensionsConstants.JSON_PROPERTIES);
        final JSONObject crsObj = geoJson.getJSONObject(ArcgisExtensionsConstants.JSON_CRS);

        /*
         * Get the assets to publish from the publishing configuration.
         */
        final String[] publishAssetList = pubConfig.getPublishAssetTypes();

        /*
         * Convert each asset in the publish asset list.
         */
        for (final String assetType : publishAssetList) {
            /*
             * Convert the features.
             */
            convertFeatures(esriFeatures, geoJsonFeatures, crsObj, assetType);

        }

        /*
         * Convert the background graphics.
         */
        // TODO add this to publish asset list.

        if (pubConfig.getPublishBackground()) {
            /*
             * Convert the background features.
             */
            convertFeatures(esriFeatures, geoJsonFeatures, crsObj,
                ArcgisExtensionsConstants.JSON_BACKGROUND);
        }

        /*
         * Create the Esri JSON feature collection.
         */
        final JSONObject esriJson = new JSONObject();
        esriJson.put(ArcgisExtensionsConstants.JSON_TYPE,
            ArcgisExtensionsConstants.FEATURECOLLECTION);
        esriJson.put(ArcgisExtensionsConstants.JSON_PROPERTIES, jsonProperties);
        esriJson.put(ArcgisExtensionsConstants.FIELD_FEATURES, esriFeatures);

        log.debug("JSON (ESRI): " + esriJson.toString());

        return esriJson;
    }

    /**
     *
     * Convert GeoJSON to EsriJSON format.
     *
     * @param esriFeatures The converted EsriJSON features.
     * @param geoJsonFeatures The GeoJson features to convert.
     * @param crsObj The coordinate reference system object.
     * @param assetType The ARCHIBUS asset type to convert.
     *
     */
    private static void convertFeatures(final JSONArray esriFeatures,
            final JSONArray geoJsonFeatures, final JSONObject crsObj, final String assetType) {

        log.debug("Converting features...");

        /*
         * Get the GeoJson features.
         */

        final JSONArray filteredFeatures =
                ArcgisJsonUtilities.filterGeoJsonFeatures(geoJsonFeatures, assetType);

        if (filteredFeatures.length() > 0) {
            geoJsonToEsriJson(esriFeatures, filteredFeatures, crsObj, assetType);
        } else {
            log.info("No GeoJSON assets were found to convert to EsriJSON for asset type: "
                    + assetType);
        }
    }

    /**
     *
     * Convert GeoJSON to EsriJson.
     *
     * @param esriFeatures The converted EsriJSON features.
     * @param geoJsonFeatures The GeoJSON features to convert.
     * @param crsObj The coordinate reference system object.
     * @param assetType The ARCHIBUS asset type.
     */
    private static void geoJsonToEsriJson(final JSONArray esriFeatures,
            final JSONArray geoJsonFeatures, final JSONObject crsObj, final String assetType) {

        if (assetType.equalsIgnoreCase(ArcgisExtensionsConstants.ASSET_TYPE_RM)) {
            geoJsonPolygonFeaturesToEsriJson(esriFeatures, geoJsonFeatures, crsObj);
        } else if (assetType.equalsIgnoreCase(ArcgisExtensionsConstants.ASSET_TYPE_GROSS)) {
            geoJsonPolygonFeaturesToEsriJson(esriFeatures, geoJsonFeatures, crsObj);
        } else if (assetType.equalsIgnoreCase(ArcgisExtensionsConstants.ASSET_TYPE_EQ)) {
            geoJsonPointFeaturesToEsriJson(esriFeatures, geoJsonFeatures, crsObj);
        } else if (assetType.equalsIgnoreCase(ArcgisExtensionsConstants.ASSET_TYPE_BACKGROUND)) {
            geoJsonLineFeaturesToEsriJson(esriFeatures, geoJsonFeatures, crsObj);
        } else {
            log.error("Error converting GeoJSON to EsriJSON. Asset type not found: " + assetType);
        }
    }

    /**
     *
     * Convert GeoJSON polygon features to EsriJSON format.
     *
     * @param esriFeatures The converted EsriJSON features.
     * @param geoJsonFeatures The GeoJSON features to convert.
     * @param crsObj The coordinate reference system object.
     */
    private static void geoJsonPolygonFeaturesToEsriJson(final JSONArray esriFeatures,
            final JSONArray geoJsonFeatures, final JSONObject crsObj) {

        /*
         * Construct wkidObj object.
         */
        final JSONObject wkidObj = createWkidObjFromCrsObj(crsObj);

        /*
         * Loop over feature list
         */
        for (int i = 0; i < geoJsonFeatures.length(); i++) {

            /*
             * Get the feature.
             */
            final JSONObject feature = geoJsonFeatures.getJSONObject(i);

            /*
             * Prepare the geometry object.
             */
            final JSONArray rings =
                    feature.getJSONObject(ArcgisExtensionsConstants.JSON_GEOMETRY).getJSONArray(
                        ArcgisExtensionsConstants.JSON_COORDINATES);
            final JSONObject geometry = new JSONObject();
            geometry.put(ArcgisExtensionsConstants.JSON_RINGS, rings);
            geometry.put(ArcgisExtensionsConstants.JSON_SPATIALREFERENCE, wkidObj);

            /*
             * Prepare the attribute object.
             */
            // TODO add common fields, asset specific fields, and configurable fields
            final JSONObject featureProperties =
                    feature.getJSONObject(ArcgisExtensionsConstants.JSON_PROPERTIES);
            final JSONObject attributes = featureProperties;

            /*
             * Create the Esri feature.
             */
            final JSONObject esriFeature = createEsriFeature(geometry, attributes);

            /*
             * Add the feature to the Esri feature array.
             */
            esriFeatures.put(esriFeature);
        }
    }

    /**
     *
     * Convert GeoJSON point features to EsriJSON format.
     *
     * @param esriFeatures The converted EsriJSON features.
     * @param geoJsonFeatures The GeoJSON features to convert.
     * @param crsObj The coordinate reference system object.
     */
    private static void geoJsonPointFeaturesToEsriJson(final JSONArray esriFeatures,
            final JSONArray geoJsonFeatures, final JSONObject crsObj) {

        /*
         * Construct wkidObj object.
         */
        final JSONObject wkidObj = createWkidObjFromCrsObj(crsObj);

        /*
         * Loop over feature list.
         */
        for (int i = 0; i < geoJsonFeatures.length(); i++) {

            /*
             * Get the feature.
             */
            final JSONObject feature = geoJsonFeatures.getJSONObject(i);

            /*
             * Prepare geometry object.
             */
            final JSONObject featureGeometry =
                    feature.getJSONObject(ArcgisExtensionsConstants.JSON_GEOMETRY);
            final GeoJsonPoint coordinate =
                    (GeoJsonPoint) featureGeometry.get(ArcgisExtensionsConstants.JSON_COORDINATES);

            final double xCoord = coordinate.x;
            final double yCoord = coordinate.y;
            final JSONObject geometry = new JSONObject();
            geometry.put(ArcgisExtensionsConstants.JSON_X, xCoord);
            geometry.put(ArcgisExtensionsConstants.JSON_Y, yCoord);
            geometry.put(ArcgisExtensionsConstants.JSON_SPATIALREFERENCE, wkidObj);

            /*
             * Prepare attribute object.
             */
            // TODO add common fields, asset specific fields, and configurable fields
            final JSONObject featureProperties =
                    feature.getJSONObject(ArcgisExtensionsConstants.JSON_PROPERTIES);
            final JSONObject attributes = featureProperties;

            /*
             * Create the Esri feature.
             */
            final JSONObject esriFeature = createEsriFeature(geometry, attributes);

            /*
             * Add to feature list.
             */
            esriFeatures.put(esriFeature);
        }

    }

    /**
     *
     * Convert GeoJSON line features to EsriJSON format.
     *
     * @param esriFeatures The converted EsriJSON features.
     * @param geoJsonFeatures The GeoJSON features to convert.
     * @param crsObj The coordinate reference system object.
     */
    private static void geoJsonLineFeaturesToEsriJson(final JSONArray esriFeatures,
            final JSONArray geoJsonFeatures, final JSONObject crsObj) {

        /*
         * Construct wkidObj object.
         */
        final JSONObject wkidObj = createWkidObjFromCrsObj(crsObj);

        /*
         * Loop over feature list
         */
        for (int i = 0; i < geoJsonFeatures.length(); i++) {

            /*
             * Get the feature.
             */
            final JSONObject feature = geoJsonFeatures.getJSONObject(i);

            /*
             * Prepare the geometry object.
             */
            final List<GeoJsonPoint> coordinates =
                    (List<GeoJsonPoint>) feature.getJSONObject(
                        ArcgisExtensionsConstants.JSON_GEOMETRY).get(
                            ArcgisExtensionsConstants.JSON_COORDINATES);

            // If the coordinates are valid, create the esri feature.
            if (checkLineCoordinates(coordinates)) {
                
                final JSONArray paths = new JSONArray();
                paths.put(coordinates);
                final JSONObject geometry = new JSONObject();
                geometry.put(ArcgisExtensionsConstants.JSON_PATHS, paths);
                geometry.put(ArcgisExtensionsConstants.JSON_SPATIALREFERENCE, wkidObj);

                /*
                 * Prepare the attribute object.
                 */
                final JSONObject featureProperties =
                        feature.getJSONObject(ArcgisExtensionsConstants.JSON_PROPERTIES);
                final JSONObject attributes = featureProperties;

                /*
                 * Create the Esri feature.
                 */
                final JSONObject esriFeature = createEsriFeature(geometry, attributes);

                /*
                 * Add the Esri feature to Esri feature list.
                 */
                esriFeatures.put(esriFeature);
            }
        }
    }

    /**
     *
     * Create a WKID object from a CRS object.
     *
     * @param crsObj The CRS object.
     * @return The WKID object.
     */
    private static JSONObject createWkidObjFromCrsObj(final JSONObject crsObj) {
        /*
         * Get the epsg string.
         */
        final String[] epsg =
                crsObj.getJSONObject(ArcgisExtensionsConstants.JSON_PROPERTIES)
                .getString(ArcgisExtensionsConstants.JSON_NAME)
                .split(ArcgisExtensionsConstants.COLON);
        final int wkid = Integer.parseInt(epsg[1]);
        /*
         * Create the WKID object.
         */
        final JSONObject wkidObj = new JSONObject();
        wkidObj.put(ArcgisExtensionsConstants.JSON_WKID, wkid);

        return wkidObj;
    }

    /**
     *
     * Create an Esri feature from geometry and attributes.
     *
     * @param geometry The Esri feature geometry.
     * @param attributes The Esri feature attributes.
     * @return The Esri feature.
     */
    private static JSONObject createEsriFeature(final JSONObject geometry,
            final JSONObject attributes) {
        final JSONObject esriFeature = new JSONObject();
        esriFeature.put(ArcgisExtensionsConstants.JSON_GEOMETRY, geometry);
        esriFeature.put(ArcgisExtensionsConstants.JSON_ATTRIBUTES, attributes);
        return esriFeature;
    }
    
    /**
     *
     * Check line coordinates for valid geometry (length > 0.01).
     *
     * @param geoJsonPoints The line coordinates to check.
     * @return True if the coordinates are valid, false if the coordinates are invalid.
     */
    private static Boolean checkLineCoordinates(final List<GeoJsonPoint> geoJsonPoints) {
        Boolean coordinatesValid = false;

        final GeometryFactory geometryFactory = JTSFactoryFinder.getGeometryFactory(null);
        final GeoJsonPoint geoPoint1 = geoJsonPoints.get(0);
        final GeoJsonPoint geoPoint2 = geoJsonPoints.get(1);
        final Point point1 = geometryFactory.createPoint(new Coordinate(geoPoint1.x, geoPoint2.y));
        final Point point2 = geometryFactory.createPoint(new Coordinate(geoPoint2.x, geoPoint2.y));
        
        final Coordinate[] coordinates =
                new Coordinate[] { point1.getCoordinate(), point2.getCoordinate() };
        
        final LineString lineString = geometryFactory.createLineString(coordinates);
        final Double segmentLength = lineString.getLength();
        
        if (segmentLength > ArcgisExtensionsConstants.WEB_MERCATOR_LINE_SEGMENT_MIN_LENGTH) {
            coordinatesValid = true;
        }
        
        return coordinatesValid;
    }

}