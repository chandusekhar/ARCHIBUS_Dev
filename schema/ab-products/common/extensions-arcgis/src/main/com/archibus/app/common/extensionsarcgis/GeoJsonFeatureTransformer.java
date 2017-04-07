package com.archibus.app.common.extensionsarcgis;

import java.awt.geom.AffineTransform;
import java.util.*;

import org.apache.log4j.Logger;
import org.json.*;

/**
 * Provides methods for transforming GeoJSON features from CAD to local geographic coordinates.
 *
 * Used by the Extensions for Esri.
 *
 * @author knight
 */
public final class GeoJsonFeatureTransformer {

    /**
     * The Logger used to output debugging results.
     */
    @SuppressWarnings({ "PMD.AvoidStaticFields" })
    // See KB# 3051675
    private static Logger log = Logger.getLogger(GeoJsonFeatureTransformer.class);

    /**
     *
     * Constructor not called.
     */
    private GeoJsonFeatureTransformer() {

    }

    /**
     *
     * Transform features from Cartesian coordinates to local geographic coordinates.
     *
     * @param geoJson The feature collection to transform.
     * @param pubConfig The publishing configuration.
     * @return The transformed feature collection.
     */
    public static JSONObject transform(final JSONObject geoJson,
            final ArcgisPublishingConfiguration pubConfig) {

        log.info("Transforming features from cartesian to local geographic...");

        /*
         * Get the drawing properties.
         */

        final JSONObject drawingInfo =
                GeoJsonFeatureUtilities.getDrawingInfoFromCollection(geoJson);
        final Boolean isGeoreferenced =
                Boolean.valueOf(drawingInfo
                    .getString(ArcgisExtensionsConstants.JSON_ISGEOREFERENCED));
        final String dwgname = drawingInfo.getString(ArcgisExtensionsConstants.DWGNAME);

        /*
         * Get the georeference parameters.
         */
        final JSONObject geoInfo =
                GeoreferenceManager.getDrawingGeoreferenceParametersFromDatabase(dwgname);

        /*
         * Check to see if we have a complete set of georeference parameters.
         */
        final Boolean hasGeoreferenceParams =
                GeoJsonFeatureUtilities.checkGeoreferenceParams(geoInfo);

        /*
         * Transform the features.
         */
        final JSONArray geoJsonFeaturesXfrm =
                doTransformFeatures(geoJson, pubConfig, geoInfo, hasGeoreferenceParams,
                    isGeoreferenced);

        /*
         * Remove the georeference string from drawingInfo.
         */
        drawingInfo.remove(ArcgisExtensionsConstants.JSON_ISGEOREFERENCED);

        /*
         * Get the spatial reference system.
         */
        String geoSRS;
        final Boolean hasSpatialReferenceSystem =
                GeoJsonFeatureUtilities.checkSpatialReferenceSystem(geoInfo);
        if (hasSpatialReferenceSystem) {
            geoSRS = geoInfo.getString(ArcgisExtensionsConstants.JSON_GEOSRS);
        } else {
            geoSRS = "UNKNOWN";
        }
        /*
         * Create the transformed feature collection.
         */
        final JSONObject properties = new JSONObject();
        properties.put(ArcgisExtensionsConstants.JSON_DWGINFO, drawingInfo);
        final JSONObject geoJsonXfrm =
                AbstractGeoJsonFeatureFactory.createGeoJsonFeatureCollection(geoSRS, properties,
                    geoJsonFeaturesXfrm);

        log.debug("GeoJSON (LOCAL): " + geoJsonXfrm.toString());

        return geoJsonXfrm;
    }

    /**
     *
     * Transform features from Cartesian coordinates to local geographic coordinates.
     *
     * @param geoJson The GeoJSON feature collection.
     * @param pubConfig The publishing configuration.
     * @param geoInfo The georeference information.
     * @param hasGeoreferenceParams Has georeference parameters?
     * @param isGeoreferenced Is georeferenced?
     * @return The transformed GeoJSON features.
     */
    private static JSONArray doTransformFeatures(final JSONObject geoJson,
            final ArcgisPublishingConfiguration pubConfig, final JSONObject geoInfo,
            final Boolean hasGeoreferenceParams, final Boolean isGeoreferenced) {

        JSONArray geoJsonFeaturesXfrm = new JSONArray();

        if (hasGeoreferenceParams) {
            geoInfo.getString(ArcgisExtensionsConstants.JSON_GEOSRS);
        }

        /*
         * Get the features from the collection.
         */
        final JSONArray geoJsonFeatures =
                GeoJsonFeatureUtilities.getFeaturesFromCollection(geoJson);

        /*
         * If the assets are already georeferenced, don't apply the transformation.
         */
        if (isGeoreferenced) {
            geoJsonFeaturesXfrm = geoJsonFeatures;
        }

        /*
         * If the assets are not georeferenced and we have a georeference parameters, apply the
         * transformation.
         */
        if (!isGeoreferenced && hasGeoreferenceParams) {
            /*
             * Get the georeference parameters
             */
            final double geoX = geoInfo.getDouble(ArcgisExtensionsConstants.JSON_GEOX);
            final double geoY = geoInfo.getDouble(ArcgisExtensionsConstants.JSON_GEOY);
            final double geoRotate = geoInfo.getDouble(ArcgisExtensionsConstants.JSON_GEOROTATE);
            final double geoScale = geoInfo.getDouble(ArcgisExtensionsConstants.JSON_GEOSCALE);
            /*
             * Get the assets to publish from the publishing configuration.
             */
            final String[] publishAssetList = pubConfig.getPublishAssetTypes();

            /*
             * Transform each asset in the publish asset list.
             */
            for (final String assetType : publishAssetList) {
                /*
                 * transform the features.
                 */
                transformFeatures(geoJsonFeaturesXfrm, geoJsonFeatures, assetType, geoX, geoY,
                    geoScale, geoRotate);
            }

            /*
             * Transform the background graphics.
             */
            if (pubConfig.getPublishBackground()) {
                /*
                 * Transform the background features.
                 */
                transformFeatures(geoJsonFeaturesXfrm, geoJsonFeatures,
                    ArcgisExtensionsConstants.JSON_BACKGROUND, geoX, geoY, geoScale, geoRotate);
            }
        }

        return geoJsonFeaturesXfrm;
    }

    /**
     *
     * Transform features from Cartesian coordinates to local geographic coordinates.
     *
     * @param geoJsonFeaturesXfrm The transformed features.
     * @param geoJsonFeatures The features to transform.
     * @param assetType The ARCHIBUS asset type.
     * @param geoX The X coordinate of the transform.
     * @param geoY The Y coordinate of the transform.
     * @param geoScale The scale of the transform.
     * @param geoRotate The rotation of the transform.
     */
    private static void transformFeatures(final JSONArray geoJsonFeaturesXfrm,
            final JSONArray geoJsonFeatures, final String assetType, final double geoX,
            final double geoY, final double geoScale, final double geoRotate) {

        log.info("Transforming " + assetType + " features...");

        /*
         * Get the GeoJSON features.
         */

        final JSONArray filteredFeatures =
                ArcgisJsonUtilities.filterGeoJsonFeatures(geoJsonFeatures, assetType);

        /*
         * Get geometry type from feature layer.
         */
        String geometryType = null;
        if (assetType.equalsIgnoreCase(ArcgisExtensionsConstants.BACKGROUND)) {
            geometryType = ArcgisExtensionsConstants.LINE;
        } else {
            final ArcgisFeatureLayer featureLayer =
                    AbstractArcgisFeatureLayerFactory.createFeatureLayer(assetType,
                        ArcgisExtensionsConstants.SQL_ONE_EQUALS_ONE);
            geometryType = featureLayer.getGeometryType();
        }

        /*
         * Transform the feature geometry.
         */
        if (geometryType.equalsIgnoreCase(ArcgisExtensionsConstants.POLYGON)) {
            transformPolygonFeatures(geoJsonFeaturesXfrm, filteredFeatures, geoX, geoY, geoScale,
                geoRotate);
        } else if (geometryType.equalsIgnoreCase(ArcgisExtensionsConstants.POINT)) {
            transformPointFeatures(geoJsonFeaturesXfrm, filteredFeatures, geoX, geoY, geoScale,
                geoRotate);
        } else if (geometryType.equalsIgnoreCase(ArcgisExtensionsConstants.LINE)) {
            transformLineFeatures(geoJsonFeaturesXfrm, filteredFeatures, geoX, geoY, geoScale,
                geoRotate);
        } else {
            log.error("Geometry type not found for asset : " + assetType);
        }

    }

    /**
     *
     * Transform polygon features.
     *
     * @param geoJsonFeaturesXfrm The transformed polygon features.
     * @param geoJsonFeatures The polygon features to be transformed.
     * @param geoX The X coordinate of the transform.
     * @param geoY The Y coordinate of the transform.
     * @param geoScale The scale of the transform.
     * @param geoRotate The rotation of the transform.
     */
    private static void transformPolygonFeatures(final JSONArray geoJsonFeaturesXfrm,
            final JSONArray geoJsonFeatures, final double geoX, final double geoY,
            final double geoScale, final double geoRotate) {

        try {

            /*
             * Loop over the features.
             */
            for (int i = 0; i < geoJsonFeatures.length(); i++) {

                final JSONObject geoJsonFeature = geoJsonFeatures.getJSONObject(i);

                final String featureId =
                        geoJsonFeature.getString(ArcgisExtensionsConstants.JSON_ID);
                final JSONObject featureProperties =
                        geoJsonFeature.getJSONObject(ArcgisExtensionsConstants.JSON_PROPERTIES);
                final JSONObject featureGeometry =
                        geoJsonFeature.getJSONObject(ArcgisExtensionsConstants.JSON_GEOMETRY);
                featureGeometry.getString(ArcgisExtensionsConstants.JSON_TYPE);
                final JSONArray coordinates =
                        featureGeometry.getJSONArray(ArcgisExtensionsConstants.JSON_COORDINATES);
                final List<GeoJsonPoint> outerRing = (List<GeoJsonPoint>) coordinates.get(0);

                /*
                 * Create array list for transformed coordinates.
                 */
                final List<GeoJsonPoint> coordinatesXfrm = new ArrayList<GeoJsonPoint>();

                /*
                 * Loop over the coordinates associated with the individual asset.
                 */
                for (int j = 0; j < outerRing.size(); j++) {

                    /*
                     * Get the point.
                     */
                    final GeoJsonPoint point = outerRing.get(j);

                    /*
                     * Apply scale, rotation, translation.
                     */
                    final GeoJsonPoint xfrmPoint =
                            transformPoint(point, geoScale, geoRotate, geoX, geoY);

                    /*
                     * Add coordinate to transformed coordinate array.
                     */
                    GeoJsonFeatureUtilities.addPointToCoordinateArray(coordinatesXfrm, xfrmPoint);

                }
                final JSONArray polygonRings = new JSONArray();
                polygonRings.put(0, coordinatesXfrm);

                /*
                 * Create GeoJSON for the transformed feature.
                 */
                final JSONObject geoJsonFeatureXfrm =
                        AbstractGeoJsonFeatureFactory.createGeoJsonPolygonFeature(featureId,
                            featureProperties, polygonRings);

                /*
                 * Add the feature to the feature list.
                 */
                geoJsonFeaturesXfrm.put(geoJsonFeatureXfrm);
            }

        } catch (final NoSuchElementException error) {
            log.error(ArcgisExtensionsConstants.TRANSFORM_FAILED
                    + ArcgisExtensionsConstants.NO_SUCH_ELEMENT_EXCEPTION + error.getMessage());
        }

    }

    /**
     *
     * Transform point features.
     *
     * @param geoJsonFeaturesXfrm The transformed point features.
     * @param geoJsonFeatures The point features to be transformed.
     * @param geoX The X coordinate of the transform.
     * @param geoY The Y coordinate of the transform.
     * @param geoScale The scale of the transform.
     * @param geoRotate The rotation of the transform.
     */
    private static void transformPointFeatures(final JSONArray geoJsonFeaturesXfrm,
            final JSONArray geoJsonFeatures, final double geoX, final double geoY,
            final double geoScale, final double geoRotate) {

        try {
            /*
             * Loop over the list of assets.
             */
            for (int i = 0; i < geoJsonFeatures.length(); i++) {

                final JSONObject geoJsonFeature = geoJsonFeatures.getJSONObject(i);
                final String featureId =
                        geoJsonFeature.getString(ArcgisExtensionsConstants.JSON_ID);
                final JSONObject featureProperties =
                        geoJsonFeature.getJSONObject(ArcgisExtensionsConstants.JSON_PROPERTIES);
                final JSONObject featureGeometry =
                        geoJsonFeature.getJSONObject(ArcgisExtensionsConstants.JSON_GEOMETRY);
                featureGeometry.getString(ArcgisExtensionsConstants.JSON_TYPE);
                final GeoJsonPoint coordinate =
                        (GeoJsonPoint) featureGeometry
                        .get(ArcgisExtensionsConstants.JSON_COORDINATES);

                /*
                 * Apply scale, rotation, translation.
                 */
                final GeoJsonPoint xfrmPoint =
                        transformPoint(coordinate, geoScale, geoRotate, geoX, geoY);

                /*
                 * Create GeoJSON for the transformed feature.
                 */

                final JSONObject geoJsonFeatureXfrm =
                        AbstractGeoJsonFeatureFactory.createGeoJsonPointFeature(featureId,
                            featureProperties, xfrmPoint);

                /*
                 * Add the feature to the feature list.
                 */
                geoJsonFeaturesXfrm.put(geoJsonFeatureXfrm);
            }

        } catch (final NoSuchElementException error) {
            log.error(ArcgisExtensionsConstants.PROJECTION_FAILED
                    + ArcgisExtensionsConstants.NO_SUCH_ELEMENT_EXCEPTION + error.getMessage());
        }

    }

    /**
     *
     * Transform line features.
     *
     * @param geoJsonFeaturesXfrm The transformed line features.
     * @param geoJsonFeatures The line features to be transformed.
     * @param geoX The X coordinate of the transform.
     * @param geoY The Y coordinate of the transform.
     * @param geoScale The scale of the transform.
     * @param geoRotate The rotation of the transform.
     */
    private static void transformLineFeatures(final JSONArray geoJsonFeaturesXfrm,
            final JSONArray geoJsonFeatures, final double geoX, final double geoY,
            final double geoScale, final double geoRotate) {

        try {

            /*
             * Loop over the list of assets.
             */
            for (int i = 0; i < geoJsonFeatures.length(); i++) {
                final JSONObject geoJsonFeature = geoJsonFeatures.getJSONObject(i);
                // TODO (we dont want this for backgrounds, but we need it for linear assets)
                // featureObj.getString(ArcgisConstants.JSON_ID);
                final String featureId = "";

                final JSONObject featureProperties =
                        geoJsonFeature.getJSONObject(ArcgisExtensionsConstants.JSON_PROPERTIES);
                final JSONObject featureGeometry =
                        geoJsonFeature.getJSONObject(ArcgisExtensionsConstants.JSON_GEOMETRY);
                featureGeometry.getString(ArcgisExtensionsConstants.JSON_TYPE);
                final List<GeoJsonPoint> coordinates =
                        (List<GeoJsonPoint>) featureGeometry
                        .get(ArcgisExtensionsConstants.JSON_COORDINATES);

                /*
                 * Create array list for transformed coordinates.
                 */
                final List<GeoJsonPoint> coordinatesXfrm = new ArrayList<GeoJsonPoint>();

                /*
                 * Loop over the coordinates associated with the individual asset.
                 */
                for (int j = 0; j < coordinates.size(); j++) {

                    /*
                     * Get the point.
                     */
                    final GeoJsonPoint point = coordinates.get(j);

                    /*
                     * Apply scale, rotation, translation.
                     */
                    final GeoJsonPoint xfrmPoint =
                            transformPoint(point, geoScale, geoRotate, geoX, geoY);

                    /*
                     * Add transformed coordinate to transformed coordinate array.
                     */
                    GeoJsonFeatureUtilities.addPointToCoordinateArray(coordinatesXfrm, xfrmPoint);

                }

                /*
                 * Create GeoJSON for the transformed feature.
                 */
                final JSONObject geoJsonFeatureXfrm =
                        AbstractGeoJsonFeatureFactory.createGeoJsonLineStringFeature(featureId,
                            featureProperties, coordinatesXfrm);

                /*
                 * Add the feature to the feature list.
                 */
                geoJsonFeaturesXfrm.put(geoJsonFeatureXfrm);
            }

        } catch (final NoSuchElementException error) {
            log.error(ArcgisExtensionsConstants.TRANSFORM_FAILED
                    + ArcgisExtensionsConstants.NO_SUCH_ELEMENT_EXCEPTION + error.getMessage());
        }

    }

    /**
     *
     * Apply scale, rotation, and translation parameters to a point.
     *
     * @param point The point to transform.
     * @param scale The scale factor.
     * @param rotation The rotation.
     * @param xTranslation The x translation.
     * @param yTranslation The y translation.
     * @return The transformed point.
     */
    @SuppressWarnings({ "PMD.UnusedFormalParameter" })
    /*
     * Justification: The geoScale parameter is a necessary georeferencing parameter. This parameter
     * will be re-enabled in a future release.
     */
    private static GeoJsonPoint transformPoint(final GeoJsonPoint point, final double scale,
            final double rotation, final double xTranslation, final double yTranslation) {

        /*
         * Apply Scale. Omit for now. See justification above.
         */
        // applyScale(point, geoScale);
        final GeoJsonPoint scalePoint = scalePoint(point, 1);

        /*
         * Apply Rotation.
         */
        final GeoJsonPoint rotatePoint = rotatePoint(scalePoint, rotation);

        /*
         * Apply Translation.
         */
        final GeoJsonPoint transPoint = translatePoint(rotatePoint, xTranslation, yTranslation);

        /*
         * Round coordinates.
         */
        final GeoJsonPoint newPoint =
                GeoJsonFeatureUtilities.roundPointCoordinates(transPoint,
                    ArcgisExtensionsConstants.EPSG_WEB_MERC);

        return newPoint;
    }

    /**
     *
     * Apply scale to a point.
     *
     * @param point The point to scale.
     * @param scale The scale factor.
     * @return The scaled point.
     */
    private static GeoJsonPoint scalePoint(final GeoJsonPoint point, final double scale) {

        final AffineTransform xfrmScale = AffineTransform.getScaleInstance(scale, scale);

        final GeoJsonPoint scalePoint = new GeoJsonPoint();
        xfrmScale.transform(point, scalePoint);

        return scalePoint;

    }

    /**
     *
     * Apply rotation to a point.
     *
     * @param point The point to rotate.
     * @param rotation The rotation.
     * @return The rotated point.
     */
    private static GeoJsonPoint rotatePoint(final GeoJsonPoint point, final double rotation) {

        final AffineTransform xfrmRotate =
                AffineTransform.getRotateInstance(Math.toRadians(rotation), 0.0, 0.0);

        final GeoJsonPoint srcPoint = new GeoJsonPoint(point.getX(), point.getY());
        final GeoJsonPoint rotatePoint = new GeoJsonPoint();
        xfrmRotate.transform(srcPoint, rotatePoint);

        return rotatePoint;
    }

    /**
     *
     * Apply translation to a point.
     *
     * @param point The point to translate.
     * @param xTranslation The x-translation.
     * @param yTranslation The y-translation.
     * @return The translated point.
     */
    private static GeoJsonPoint translatePoint(final GeoJsonPoint point, final double xTranslation,
            final double yTranslation) {

        final AffineTransform xfrmTranslate =
                AffineTransform.getTranslateInstance(xTranslation, yTranslation);

        final GeoJsonPoint srcPoint = new GeoJsonPoint(point.getX(), point.getY());
        final GeoJsonPoint transPoint = new GeoJsonPoint();
        xfrmTranslate.transform(srcPoint, transPoint);

        return transPoint;
    }

}
