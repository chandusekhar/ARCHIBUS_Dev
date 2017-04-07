package com.archibus.app.common.extensionsarcgis;

import java.util.*;

import org.apache.log4j.Logger;
import org.geotools.factory.FactoryRegistryException;
import org.geotools.geometry.jts.*;
import org.geotools.referencing.CRS;
import org.json.*;
import org.opengis.geometry.MismatchedDimensionException;
import org.opengis.referencing.*;
import org.opengis.referencing.crs.*;
import org.opengis.referencing.operation.*;

import com.vividsolutions.jts.geom.*;

/**
 * Provides methods for projecting GeoJSON features between two geographic coordinate systems.
 * projection.
 *
 * Used by the Extensions for Esri.
 *
 * @author knight
 */
public final class GeoJsonFeatureProjector {

    /**
     * Allow for some error due to different datums.
     */
    private static final boolean LENIENT = false;

    /**
     * The Logger used to output debugging results.
     */
    @SuppressWarnings({ "PMD.AvoidStaticFields" })
    // See KB# 3051675
    private static Logger log = Logger.getLogger(GeoJsonFeatureProjector.class);

    /**
     *
     * Constructor not called.
     */
    private GeoJsonFeatureProjector() {

    }

    /**
     *
     * Project GeoJSON features between two geographic coordinate systems.
     *
     * @param geoJson The feature collection to project.
     * @param outputSrs The output spatial reference system.
     * @param pubConfig The publishing configuration.
     * @return The projected feature collection.
     */
    public static JSONObject project(final JSONObject geoJson, final String outputSrs,
            final ArcgisPublishingConfiguration pubConfig) {

        log.info("Projecting features from local geographic to " + outputSrs + "...");

        /*
         * Get the projection parameters.
         */
        final JSONObject crsObj = geoJson.getJSONObject(ArcgisExtensionsConstants.JSON_CRS);
        final JSONObject crsProp = crsObj.getJSONObject(ArcgisExtensionsConstants.JSON_PROPERTIES);
        final String epsgSrc = crsProp.getString(ArcgisExtensionsConstants.JSON_NAME);
        String epsgDest = ArcgisExtensionsConstants.EPSG_WEB_MERC;
        if (outputSrs.equals(ArcgisExtensionsConstants.EPSG_LAT_LON)) {
            epsgDest = ArcgisExtensionsConstants.EPSG_LAT_LON;
        }

        /*
         * Get the features from the collection.
         */
        final JSONArray geoJsonFeatures =
                geoJson.getJSONArray(ArcgisExtensionsConstants.FIELD_FEATURES);
        geoJson.getJSONObject(ArcgisExtensionsConstants.JSON_PROPERTIES);

        /*
         * Create an array for the projected features.
         */
        final JSONArray geoJsonFeaturesProj = new JSONArray();

        /*
         * Get the assets to publish from the publishing configuration.
         */
        final String[] publishAssetList = pubConfig.getPublishAssetTypes();

        /*
         * Project each asset in the publish asset list.
         */
        for (final String assetType : publishAssetList) {
            /*
             * transform the features.
             */
            projectFeatures(geoJsonFeaturesProj, geoJsonFeatures, assetType, epsgSrc, epsgDest);
        }

        /*
         * Project the background graphics.
         */
        if (pubConfig.getPublishBackground()) {
            /*
             * Transform the background features.
             */
            projectFeatures(geoJsonFeaturesProj, geoJsonFeatures,
                ArcgisExtensionsConstants.JSON_BACKGROUND, epsgSrc, epsgDest);
        }

        /*
         * Get the feature collection properties.
         */
        final JSONObject properties =
                geoJson.getJSONObject(ArcgisExtensionsConstants.JSON_PROPERTIES);

        /*
         * Create the projected feature collection.
         */
        final JSONObject geoJsonProj =
                AbstractGeoJsonFeatureFactory.createGeoJsonFeatureCollection(epsgDest, properties,
                    geoJsonFeaturesProj);

        return geoJsonProj;
    }

    /**
     *
     * Project features from between two geographic coordinate systems.
     *
     * @param geoJsonFeaturesProj The projected features.
     * @param geoJsonFeatures The features to project.
     * @param assetType The ARCHIBUS asset type.
     * @param epsgSrc The source spatial reference system.
     * @param epsgDest The destination spatial reference system.
     */
    private static void projectFeatures(final JSONArray geoJsonFeaturesProj,
            final JSONArray geoJsonFeatures, final String assetType, final String epsgSrc,
            final String epsgDest) {

        log.info("Projecting " + assetType + " features...");

        /*
         * Get the GeoJSON features.
         */

        final JSONArray filteredFeatures =
                ArcgisJsonUtilities.filterGeoJsonFeatures(geoJsonFeatures, assetType);

        if (filteredFeatures.length() > 0) {
            if (assetType.equalsIgnoreCase(ArcgisExtensionsConstants.ASSET_TYPE_RM)) {
                projectPolygonFeatures(geoJsonFeaturesProj, filteredFeatures, epsgSrc, epsgDest);
            } else if (assetType.equalsIgnoreCase(ArcgisExtensionsConstants.ASSET_TYPE_GROSS)) {
                projectPolygonFeatures(geoJsonFeaturesProj, filteredFeatures, epsgSrc, epsgDest);
            } else if (assetType.equalsIgnoreCase(ArcgisExtensionsConstants.ASSET_TYPE_EQ)) {
                projectPointFeatures(geoJsonFeaturesProj, filteredFeatures, epsgSrc, epsgDest);
            } else if (assetType.equalsIgnoreCase(ArcgisExtensionsConstants.ASSET_TYPE_BACKGROUND)) {
                projectLineFeatures(geoJsonFeaturesProj, filteredFeatures, epsgSrc, epsgDest);
            }

        } else {
            log.info("No GeoJSON assets were found to project for asset type: " + assetType);
        }

    }

    /**
     *
     * Project polygon features between two geographic coordinate systems.
     *
     * @param geoJsonFeaturesProj The projected polygon features.
     * @param geoJsonFeatures The polygon features to transform.
     * @param epsgSrc The source spatial reference system.
     * @param epsgDest The destination spatial reference system.
     */
    private static void projectPolygonFeatures(final JSONArray geoJsonFeaturesProj,
            final JSONArray geoJsonFeatures, final String epsgSrc, final String epsgDest) {

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
                 * Create array list for projected coordinates.
                 */
                final List<GeoJsonPoint> coordinatesProj = new ArrayList<GeoJsonPoint>();

                /*
                 * Loop over the coordinates associated with the the individual asset.
                 */
                for (int j = 0; j < outerRing.size(); j++) {

                    /*
                     * Get source point from the polygon rings.
                     */
                    final GeoJsonPoint srcPoint = outerRing.get(j);

                    /*
                     * Project the point.
                     */
                    final GeoJsonPoint projPoint = projectPoint(srcPoint, epsgSrc, epsgDest);

                    /*
                     * Add the projected point to the projected coordinate array.
                     */
                    GeoJsonFeatureUtilities.addPointToCoordinateArray(coordinatesProj, projPoint);

                }
                final JSONArray polygonRings = new JSONArray();
                polygonRings.put(0, coordinatesProj);

                final JSONObject geoJsonFeatureProj =
                        AbstractGeoJsonFeatureFactory.createGeoJsonPolygonFeature(featureId,
                            featureProperties, polygonRings);

                /*
                 * Add feature to feature list.
                 */
                geoJsonFeaturesProj.put(geoJsonFeatureProj);
            }
        } catch (final NoSuchElementException error) {
            log.error(ArcgisExtensionsConstants.PROJECTION_FAILED
                    + ArcgisExtensionsConstants.NO_SUCH_ELEMENT_EXCEPTION + error.getMessage());
        }

    }

    /**
     *
     * Project point features between two geographic coordinate systems.
     *
     * @param geoJsonFeaturesProj The projected point features.
     * @param geoJsonFeatures The point features to transform.
     * @param epsgSrc The source spatial reference system.
     * @param epsgDest The destination spatial reference system.
     */
    private static void projectPointFeatures(final JSONArray geoJsonFeaturesProj,
            final JSONArray geoJsonFeatures, final String epsgSrc, final String epsgDest) {

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

                /*
                 * Get the source point.
                 */
                final GeoJsonPoint srcPoint =
                        (GeoJsonPoint) featureGeometry
                        .get(ArcgisExtensionsConstants.JSON_COORDINATES);

                /*
                 * Project the point.
                 */
                final GeoJsonPoint projPoint = projectPoint(srcPoint, epsgSrc, epsgDest);

                /*
                 * Create the JSON for the projected feature.
                 */
                final JSONObject geoJsonFeatureProj =
                        AbstractGeoJsonFeatureFactory.createGeoJsonPointFeature(featureId,
                            featureProperties, projPoint);

                /*
                 * Add the feature to the feature list.
                 */
                geoJsonFeaturesProj.put(geoJsonFeatureProj);
            }

        } catch (final NoSuchElementException error) {
            log.error(ArcgisExtensionsConstants.PROJECTION_FAILED
                    + ArcgisExtensionsConstants.NO_SUCH_ELEMENT_EXCEPTION + error.getMessage());
        }

    }

    /**
     *
     * Project line features between two geographic coordinate systems.
     *
     * @param geoJsonFeaturesProj The projected line features.
     * @param geoJsonFeatures The line features to transform.
     * @param epsgSrc The source spatial reference system.
     * @param epsgDest The destination spatial reference system.
     */

    private static void projectLineFeatures(final JSONArray geoJsonFeaturesProj,
            final JSONArray geoJsonFeatures, final String epsgSrc, final String epsgDest) {

        try {

            /*
             * Loop over the list of assets.
             */
            for (int i = 0; i < geoJsonFeatures.length(); i++) {
                /*
                 * Get the feature.
                 */
                final JSONObject geoJsonFeature = geoJsonFeatures.getJSONObject(i);

                /*
                 * Get the feature properties.
                 */
                // TODO (we dont want this for backgrounds, but we need it for linear assets)
                // featureObj.getString(ArcgisConstants.JSON_ID);
                final String featureId = "";
                final JSONObject featureProperties =
                        geoJsonFeature.getJSONObject(ArcgisExtensionsConstants.JSON_PROPERTIES);
                final JSONObject featureGeometry =
                        geoJsonFeature.getJSONObject(ArcgisExtensionsConstants.JSON_GEOMETRY);
                featureGeometry.getString(ArcgisExtensionsConstants.JSON_TYPE);

                /*
                 * Get the array of coordinates for the line.
                 */
                final List<GeoJsonPoint> coordinates =
                        (List<GeoJsonPoint>) featureGeometry
                        .get(ArcgisExtensionsConstants.JSON_COORDINATES);

                /*
                 * Create a new array list for the projected coordinates.
                 */
                final List<GeoJsonPoint> coordinatesProj = new ArrayList<GeoJsonPoint>();

                /*
                 * Loop over the coordinates of the line.
                 */
                for (int j = 0; j < coordinates.size(); j++) {

                    /*
                     * Get the point from the line.
                     */
                    final GeoJsonPoint srcPoint = coordinates.get(j);

                    /*
                     * Project the point.
                     */
                    final GeoJsonPoint projPoint = projectPoint(srcPoint, epsgSrc, epsgDest);

                    /*
                     * Add the projected point to the coordinate array.
                     */
                    coordinatesProj.add(projPoint);

                }

                /*
                 * Create the GeoJSON for the projected feature.
                 */
                final JSONObject geoJsonFeatureProj =
                        AbstractGeoJsonFeatureFactory.createGeoJsonLineStringFeature(featureId,
                            featureProperties, coordinatesProj);

                /*
                 * Add feature to feature list.
                 */
                geoJsonFeaturesProj.put(geoJsonFeatureProj);
            }
        } catch (final NoSuchElementException error) {
            log.error(ArcgisExtensionsConstants.PROJECTION_FAILED
                    + ArcgisExtensionsConstants.NO_SUCH_ELEMENT_EXCEPTION + error.getMessage());
        }

    }

    /**
     *
     * Project a point.
     *
     * @param srcPoint The source point.
     * @param epsgSrc The source ESPG code.
     * @param epsgDest The destination EPSG code.
     * @return The projected point.
     */
    private static GeoJsonPoint projectPoint(final GeoJsonPoint srcPoint, final String epsgSrc,
            final String epsgDest) {

        GeoJsonPoint finalPoint = new GeoJsonPoint();

        try {
            /*
             * Create the source and destination coordinate systems.
             */
            final CoordinateReferenceSystem crsSrc = createCoordinateReferenceSystem(epsgSrc);
            final CoordinateReferenceSystem crsDst = createCoordinateReferenceSystem(epsgDest);

            /*
             * Create the transform.
             */
            final MathTransform transform = CRS.findMathTransform(crsSrc, crsDst, LENIENT);

            /*
             * Create the geometry factory.
             */
            final GeometryFactory geometryFactory = JTSFactoryFinder.getGeometryFactory(null);

            /*
             * Create the source coordinate.
             */
            final Point srcGeo =
                    geometryFactory.createPoint(new Coordinate(srcPoint.getX(), srcPoint.getY()));
            /*
             * Do the projection.
             */
            Geometry dstGeo = null;
            try {
                dstGeo = JTS.transform(srcGeo, transform);
            } catch (final MismatchedDimensionException error) {
                log.error(ArcgisExtensionsConstants.PROJECTION_FAILED + error.getMessage());
            } catch (final TransformException error) {
                log.error(ArcgisExtensionsConstants.PROJECTION_FAILED + error.getMessage());
            }
            /*
             * Create the projected point.
             */
            final GeoJsonPoint projPoint =
                    new GeoJsonPoint(dstGeo.getCoordinate().x, dstGeo.getCoordinate().y);

            /*
             * Round the point coordinates.
             */
            finalPoint = GeoJsonFeatureUtilities.roundPointCoordinates(projPoint, epsgDest);

        } catch (final FactoryException error) {
            log.error(ArcgisExtensionsConstants.PROJECTION_FAILED
                    + ArcgisExtensionsConstants.FACTORY_EXCEPTION + error.getMessage());
        } catch (final FactoryRegistryException error) {
            log.error(ArcgisExtensionsConstants.PROJECTION_FAILED
                    + ArcgisExtensionsConstants.FACTORY_REGISTRY_EXCEPTION + error.getMessage());
        }

        return finalPoint;

    }

    /**
     *
     * Create a Coordinate Reference System object for the Projection.
     *
     * @param epsgCode The EPSG code.
     * @return The Coordinate Reference System object.
     */
    private static CoordinateReferenceSystem createCoordinateReferenceSystem(final String epsgCode) {

        final CRSAuthorityFactory crsFactory = CRS.getAuthorityFactory(true);
        CoordinateReferenceSystem coordinateReferenceSystem = null;

        try {
            coordinateReferenceSystem = crsFactory.createCoordinateReferenceSystem(epsgCode);
        } catch (final NoSuchAuthorityCodeException error) {
            log.error(ArcgisExtensionsConstants.PROJECTION_FAILED
                    + ArcgisExtensionsConstants.NO_SUCH_AUTHORITY_CODE_EXCEPTION
                    + error.getMessage());
        } catch (final FactoryException error) {
            log.error(ArcgisExtensionsConstants.PROJECTION_FAILED
                    + ArcgisExtensionsConstants.FACTORY_EXCEPTION + error.getMessage());
        }

        return coordinateReferenceSystem;

    }
}
