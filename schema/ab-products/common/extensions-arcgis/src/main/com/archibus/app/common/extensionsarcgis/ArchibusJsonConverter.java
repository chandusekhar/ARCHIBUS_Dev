package com.archibus.app.common.extensionsarcgis;

import java.util.*;

import org.apache.log4j.Logger;
import org.json.*;

import com.archibus.utility.StringUtil;

/**
 *
 * Provides methods to convert ARCHIBUS JSON to the standard GeoJSON format.
 *
 * Used by the Extensions for Esri.
 *
 * @author knight
 * @since 23.1
 *
 */
public final class ArchibusJsonConverter {
    
    /**
     * Logger used to output debugging results.
     */
    @SuppressWarnings({ "PMD.AvoidStaticFields" })
    // See KB# 3051675
    private static Logger log = Logger.getLogger(ArchibusJsonConverter.class);
    
    /**
     *
     * Constructor not called.
     */
    private ArchibusJsonConverter() {
        
    }
    
    /**
     *
     * Convert ArchibusJSON to GeoJSON format.
     *
     * @param archibusJson The ARCHIBUS JSON.
     * @param pubConfig The publishing configuration.
     * @return The GeoJSON.
     */
    public static JSONObject convertToGeoJson(final JSONObject archibusJson,
            final ArcgisPublishingConfiguration pubConfig) {
        
        log.info("Converting ArchibusJSON to GeoJSON...");
        
        /*
         * Get the assets to publish from the publishing configuration.
         */
        final String[] publishAssetList = pubConfig.getPublishAssetTypes();
        
        /*
         * Get the drawing name.
         */
        final String dwgname = ArchibusJsonUtilities.getDwgnameFromArchibusJson(archibusJson);
        /*
         * Get the georeferenced condition (of the JSON).
         */
        final String isGeoreferenced =
                archibusJson.getString(ArcgisExtensionsConstants.ISGEOREFERENCED).toString();
        /*
         * Create the dwgInfo object.
         */
        final JSONObject dwgInfo = new JSONObject();
        dwgInfo.put(ArcgisExtensionsConstants.DWGNAME, dwgname);
        dwgInfo.put(ArcgisExtensionsConstants.JSON_ISGEOREFERENCED, isGeoreferenced);
        
        /*
         * Get the geoLevel from the database.
         */
        Integer geoLevel = null;
        final JSONObject geoInfo =
                GeoreferenceManager.getDrawingGeoreferenceParametersFromDatabase(dwgname);
        if (geoInfo.has(ArcgisExtensionsConstants.JSON_GEOLEVEL)) {
            geoLevel = geoInfo.getInt(ArcgisExtensionsConstants.JSON_GEOLEVEL);
        }
        
        /*
         * Get the ARCHIBUS assets from the ARCHIBUS JSON.
         */
        final JSONObject archibusAssets =
                archibusJson.getJSONObject(ArcgisExtensionsConstants.ASSETS);
        
        /*
         * Create the GeoJSON features.
         */
        final JSONArray geoJsonFeatures = new JSONArray();
        
        /*
         * Convert each feature in the publish asset list.
         */
        for (final String assetType : publishAssetList) {
            /*
             * Convert the features.
             */
            convertFeatures(geoJsonFeatures, archibusAssets, dwgname, geoLevel, assetType);
            
        }
        
        /*
         * Convert the background graphics.
         */
        if (pubConfig.getPublishBackground()) {
            /*
             * Get the background from the ARCHIBUS JSON.
             */
            JSONArray archibusBackground = new JSONArray();
            if (archibusJson.has(ArcgisExtensionsConstants.BACKGROUND)) {
                archibusBackground =
                        archibusJson.getJSONArray(ArcgisExtensionsConstants.BACKGROUND);
                /*
                 * Convert the background features.
                 */
                convertBackground(geoJsonFeatures, archibusBackground, dwgname, geoLevel);
            } else {
                final String errorMessage =
                        String
                            .format(
                                "Cannot publish background. Background JSON not available for drawing=[%s]",
                                dwgname);
                log.error(errorMessage);
            }
            
        }
        
        /*
         * Create the GeoJSON feature collection.
         */
        final JSONObject geoJsonFeatureCollection = new JSONObject();
        final JSONObject properties = new JSONObject();
        properties.put(ArcgisExtensionsConstants.JSON_DWGINFO, dwgInfo);
        geoJsonFeatureCollection.put(ArcgisExtensionsConstants.FIELD_FEATURES, geoJsonFeatures);
        geoJsonFeatureCollection.put(ArcgisExtensionsConstants.JSON_PROPERTIES, properties);
        geoJsonFeatureCollection.put(ArcgisExtensionsConstants.JSON_TYPE,
            ArcgisExtensionsConstants.FEATURECOLLECTION);
        
        log.debug("GeoJSON (CAD) : " + geoJsonFeatureCollection.toString());
        
        return geoJsonFeatureCollection;
    }
    
    /**
     *
     * Convert ARCHIBUS assets to GeoJSON format.
     *
     * @param geoJsonFeatures The converted GeoJSON features.
     * @param archibusAssets The ARCHIBUS assets.
     * @param dwgname The ARCHIBUS drawing name.
     * @param geoLevel The geo level for the ARCHIBUS draiwng.
     * @param assetType The ARCHIBUS asset type to convert.
     *
     */
    private static void convertFeatures(final JSONArray geoJsonFeatures,
            final JSONObject archibusAssets, final String dwgname, final Integer geoLevel,
            final String assetType) {
        
        log.debug("Converting features...");
        /*
         * Get the ARCHIBUS assets from the ARCHIBUS JSON.
         */
        if (archibusAssets.has(assetType)) {
            final JSONArray archibusJsonAssets = archibusAssets.getJSONArray(assetType);
            if (StringUtil.notNullOrEmpty(archibusAssets)) {
                archibusJsonToGeoJson(geoJsonFeatures, archibusJsonAssets, dwgname, geoLevel,
                    assetType);
            }
        }
    }
    
    /**
     *
     * Convert the ARCHBUS background graphics to GeoJSON format.
     *
     * @param geoJsonFeatures The converted GeoJSON features.
     * @param archibusBackground The ARCHIBUS background graphics.
     * @param dwgname The ARCHIBUS drawing name.
     * @param geoLevel The geo level of the ARCHIBUS drawing.
     */
    private static void convertBackground(final JSONArray geoJsonFeatures,
            final JSONArray archibusBackground, final String dwgname, final Integer geoLevel) {
        
        archibusBackgroundAssetsToGeoJson(geoJsonFeatures, archibusBackground, dwgname, geoLevel);
    }
    
    /**
     *
     * Convert ARCHIBUS GeoJSON to standard GeoJSON format.
     *
     * @param geoJsonFeatures The converted GeoJSON features.
     * @param archibusJsonAssets The ARCHIBUS assets.
     * @param dwgname The ARCHIBUS drawing name.
     * @param geoLevel The geo level of the ARCHIBUS drawing.
     * @param assetType The ARCHIBUS asset type to convert.
     */
    private static void archibusJsonToGeoJson(final JSONArray geoJsonFeatures,
            final JSONArray archibusJsonAssets, final String dwgname, final Integer geoLevel,
            final String assetType) {
        
        /*
         * Get geometry type from feature layer.
         */
        final ArcgisFeatureLayer featureLayer =
                AbstractArcgisFeatureLayerFactory.createFeatureLayer(assetType,
                    ArcgisExtensionsConstants.SQL_ONE_EQUALS_ONE);
        final String geometryType = featureLayer.getGeometryType();
        
        if (geometryType.equalsIgnoreCase(ArcgisExtensionsConstants.POLYGON)) {
            archibusPolygonAssetsToGeoJson(geoJsonFeatures, archibusJsonAssets, dwgname, geoLevel,
                assetType);
        } else if (geometryType.equalsIgnoreCase(ArcgisExtensionsConstants.POINT)) {
            archibusPointAssetsToGeoJson(geoJsonFeatures, archibusJsonAssets, dwgname, geoLevel,
                assetType);
        } else if (assetType.equalsIgnoreCase(ArcgisExtensionsConstants.ASSET_TYPE_BACKGROUND)) {
            archibusBackgroundAssetsToGeoJson(geoJsonFeatures, archibusJsonAssets, dwgname,
                geoLevel);
            // } else if (geometryType.equalsIgnoreCase(ArcgisExtensionsConstants.LINE)) {
            // TODO
            // archibusLineAssetsToGeoJson(geoJsonFeatures, archibusJsonAssets, dwgname, geoLevel,
            // assetType);
        } else {
            log.error("Geometry type not found for asset : " + assetType);
        }
        
    }
    
    /**
     *
     * Convert ARCHIBUS polygon geometry to GeoJSON format.
     *
     * @param geoJsonFeatures The converted GeoJSON features.
     * @param archibusJsonAssets The ARCHIBUS assets.
     * @param dwgname The ARCHIBUS drawing name.
     * @param geoLevel The geo level of the ARCHIBUS drawing.
     * @param assetType The ARCHIBUS asset type to convert.
     * @return The GeoJSON features.
     */
    private static JSONArray archibusPolygonAssetsToGeoJson(final JSONArray geoJsonFeatures,
            final JSONArray archibusJsonAssets, final String dwgname, final Integer geoLevel,
            final String assetType) {
        
        /*
         * Loop over the list of assets.
         */
        for (int i = 0; i < archibusJsonAssets.length(); i++) {
            /*
             * Get the asset.
             */
            final JSONObject asset = archibusJsonAssets.getJSONObject(i);

            /*
             * If the asset has a shape, proceed.
             */
            if (asset.has(ArcgisExtensionsConstants.SHAPE)) {
                /*
                 * Get the asset key.
                 */
                final String assetKey = asset.getString(ArcgisExtensionsConstants.KEY);
                /*
                 * Get the asset key values.
                 */
                final String[] assetKeys = assetKey.split(ArcgisExtensionsConstants.SEMICOLON);
                /*
                 * Get the asset key fields.
                 */
                final String[] assetKeyFields =
                        ArchibusProjectUtilities.getAssetKeyFieldNames(assetType);
                /*
                 * Get the asset shape/geometry.
                 */
                final JSONObject shapeObj = asset.getJSONObject(ArcgisExtensionsConstants.SHAPE);
                /*
                 * Convert the geometry to GeoJson
                 */
                final JSONArray polygonRings = convertArchibusShapeObjToGeoJsonPolygon(shapeObj);

                /*
                 * Create the GeoJson feature.
                 */
                final JSONObject geoJsonFeature = new JSONObject();
                geoJsonFeature.put(ArcgisExtensionsConstants.JSON_TYPE,
                    ArcgisExtensionsConstants.FEATURE);
                
                geoJsonFeature.put(ArcgisExtensionsConstants.JSON_ID, assetKey);
                
                final JSONObject featureProperties = new JSONObject();
                
                featureProperties.put(assetKeyFields[0], assetKeys[0]);
                featureProperties.put(assetKeyFields[1], assetKeys[1]);
                featureProperties.put(assetKeyFields[2], assetKeys[2]);
                
                if (StringUtil.notNullOrEmpty(geoLevel)) {
                    featureProperties.put(ArcgisExtensionsConstants.FIELD_GEO_LEVEL, geoLevel);
                } else {
                    // TODO
                    featureProperties.put(ArcgisExtensionsConstants.FIELD_GEO_LEVEL,
                        ArcgisExtensionsConstants.INT_1);
                }
                
                featureProperties.put(ArcgisExtensionsConstants.FIELD_ASSET_TYPE, assetType);
                featureProperties.put(ArcgisExtensionsConstants.DWGNAME, dwgname);
                geoJsonFeature.put(ArcgisExtensionsConstants.JSON_PROPERTIES, featureProperties);
                
                final JSONObject featureGeometry = new JSONObject();
                featureGeometry.put(ArcgisExtensionsConstants.JSON_TYPE,
                    ArcgisExtensionsConstants.POLYGON);
                
                featureGeometry.put(ArcgisExtensionsConstants.JSON_COORDINATES, polygonRings);
                geoJsonFeature.put(ArcgisExtensionsConstants.JSON_GEOMETRY, featureGeometry);
                
                /*
                 * If we have geometry, add the feature to the features array.
                 */
                final List<GeoJsonPoint> polygonRing = (List<GeoJsonPoint>) polygonRings.get(0);
                if (!polygonRing.isEmpty()) {
                    geoJsonFeatures.put(geoJsonFeature);
                }
                
            }
            
        }
        
        return geoJsonFeatures;
    }
    
    /**
     *
     * Convert ARCHIBUS point geometry to GeoJSON format.
     *
     * @param geoJsonFeatures The converted GeoJSON features.
     * @param archibusJsonAssets The ARCHIBUS assets.
     * @param dwgname The ARCHIBUS drawing name.
     * @param geoLevel The geo level of the ARCHIBUS drawing. param assetType The ARCHIBUS asset
     *            type.
     * @param assetType The ARCHIBUS asset type.
     * @return The GeoJSON point features.
     */
    private static JSONArray archibusPointAssetsToGeoJson(final JSONArray geoJsonFeatures,
            final JSONArray archibusJsonAssets, final String dwgname, final Integer geoLevel,
            final String assetType) {
        /*
         * Loop over the list of assets.
         */
        for (int i = 0; i < archibusJsonAssets.length(); i++) {
            
            /*
             * Get the asset.
             */
            final JSONObject asset = archibusJsonAssets.getJSONObject(i);
            
            /*
             * Verify that we have a valid asset.
             */
            if (ArchibusJsonUtilities.assetIsValid(asset)) {
                /*
                 * Get the asset key value.
                 */
                final String assetKey = asset.getString(ArcgisExtensionsConstants.KEY);
                ArchibusProjectUtilities.getAssetKeyFieldNames(assetType);
                
                /*
                 * Get the asset key fields.
                 */
                final String[] assetKeyFields =
                        ArchibusProjectUtilities.getAssetKeyFieldNames(assetType);
                
                /*
                 * Get the asset type.
                 */
                final String assetTypeVal = asset.getString(ArcgisExtensionsConstants.ASSETTYPE);
                
                /*
                 * Get the asset shape/geometry.
                 */
                final JSONObject shapeObj = asset.getJSONObject(ArcgisExtensionsConstants.SHAPE);
                /*
                 * Get the insertion point from the shape/geometry.
                 */
                final JSONObject extentMin =
                        shapeObj.getJSONObject(ArcgisExtensionsConstants.EXTENTSMIN);
                final JSONObject extentMax =
                        shapeObj.getJSONObject(ArcgisExtensionsConstants.EXTENTSMAX);
                
                /*
                 * Construct the point.
                 */
                final GeoJsonPoint coordinate =
                        ArchibusJsonUtilities.calculateCenterFromExtent(extentMin, extentMax);
                
                /*
                 * Create feature properties JSON.
                 */
                final JSONObject featureProperties =
                        ArchibusJsonUtilities.createFeatureProperties(geoLevel, assetKeyFields,
                            assetKey, assetTypeVal, dwgname);
                
                /*
                 * Create the GeoJson feature.
                 */
                final JSONObject geoJsonFeature =
                        AbstractGeoJsonFeatureFactory.createGeoJsonPointFeature(assetKey,
                            featureProperties, coordinate);
                
                /*
                 * Add geoJSON feature to asset list.
                 */
                geoJsonFeatures.put(geoJsonFeature);
            } else {
                log.info("Skipping conversion of asset ->  Asset missing one or more required elements...");
            }
            
        }
        
        return geoJsonFeatures;
    }
    
    /**
     *
     * Convert ARCHIBUS background graphics to GeoJSON format.
     *
     * @param geoJsonFeatures The converted GeoJSON features.
     * @param archibusBackground The ARCHIBUS background graphics.
     * @param dwgname The ARCHIBUS drawing name.
     * @param geoLevel The geo level of the ARCHIBUS drawing.
     */
    private static void archibusBackgroundAssetsToGeoJson(final JSONArray geoJsonFeatures,
            final JSONArray archibusBackground, final String dwgname, final Integer geoLevel) {
        for (int i = 0; i < archibusBackground.length(); i++) {
            // Get the asset object.
            final JSONObject backgroundObj = archibusBackground.getJSONObject(i);
            // Get the geometry for the object
            final JSONArray backgroundGeometry =
                    ArchibusJsonUtilities.getGeometryForBackgroundObject(backgroundObj);
            
            for (int j = 0; j < backgroundGeometry.length(); j++) {
                
                if (backgroundGeometry.length() == 0) {
                    log.debug("Object contains no geometry");
                }
                
                // Get the geometry object.
                final JSONObject geometryObj = backgroundGeometry.getJSONObject(j);
                
                // Create the LineString coordinates.
                List<GeoJsonPoint> coordinates = new ArrayList<GeoJsonPoint>();
                
                // Check to see if this is a segment.
                if (geometryObj.has(ArcgisExtensionsConstants.SEGMENTS)) {
                    coordinates = createLineStringCoordinatesFromSegments(geometryObj);
                }
                // Check to see if this is a line.
                if (geometryObj.has(ArcgisExtensionsConstants.UPPERCASE_P1)
                        && (geometryObj.has(ArcgisExtensionsConstants.UPPERCASE_P2))) {
                    coordinates = createLineStringCoordinatesFromLine(geometryObj);
                }
                
                // Create the feature JSON.
                final JSONObject geoJsonFeature = new JSONObject();
                geoJsonFeature.put(ArcgisExtensionsConstants.JSON_TYPE,
                    ArcgisExtensionsConstants.FEATURE);
                
                // Get bl_id and fl_id for the feature properties.
                final String spaceHierFieldValues =
                        GeoreferenceManager.getSpaceHierFieldValuesFromDatabase(dwgname);
                final String[] buildingFloorKeys =
                        spaceHierFieldValues.split(ArcgisExtensionsConstants.SEMICOLON);
                final String buildingId = buildingFloorKeys[0];
                final String floorId = buildingFloorKeys[1];
                
                // Get the CAD layer
                String layerName = "";
                if (geometryObj.has(ArcgisExtensionsConstants.LAYER)) {
                    layerName = geometryObj.getString(ArcgisExtensionsConstants.LAYER);
                }

                // The feature properties.
                final JSONObject featureProperties = new JSONObject();
                // TODO add additional/configurable attributes
                featureProperties.put(ArcgisExtensionsConstants.FIELD_BL_ID, buildingId);
                featureProperties.put(ArcgisExtensionsConstants.FIELD_FL_ID, floorId);
                
                if (StringUtil.notNullOrEmpty(geoLevel)) {
                    featureProperties.put(ArcgisExtensionsConstants.FIELD_GEO_LEVEL, geoLevel);
                } else {
                    featureProperties.put(ArcgisExtensionsConstants.FIELD_GEO_LEVEL,
                        ArcgisExtensionsConstants.INT_1);
                }
                
                featureProperties.put(ArcgisExtensionsConstants.FIELD_ASSET_TYPE,
                    ArcgisExtensionsConstants.JSON_BACKGROUND);
                featureProperties.put(ArcgisExtensionsConstants.DWGNAME, dwgname);
                featureProperties.put(ArcgisExtensionsConstants.JSON_LAYER, layerName);

                geoJsonFeature.put(ArcgisExtensionsConstants.JSON_PROPERTIES, featureProperties);

                // The feature geometry.
                final JSONObject featureGeometry = new JSONObject();
                featureGeometry.put(ArcgisExtensionsConstants.JSON_TYPE,
                    ArcgisExtensionsConstants.LINESTRING);
                featureGeometry.put(ArcgisExtensionsConstants.JSON_COORDINATES, coordinates);
                geoJsonFeature.put(ArcgisExtensionsConstants.JSON_GEOMETRY, featureGeometry);
                
                // Add the feature to the feature list.
                geoJsonFeatures.put(geoJsonFeature);
            }
        }
    }
    
    /**
     *
     * Convert ARCHIBUS shape geometry to GeoJSON polygon.
     *
     * @param shapeObj The ARCHIBUS shape object to convert.
     * @return The GeoJSON polygon object.
     */
    private static JSONArray convertArchibusShapeObjToGeoJsonPolygon(final JSONObject shapeObj) {
        
        /*
         * The GeoJson polygon.
         */
        final JSONArray polygonRings = new JSONArray();
        /*
         * Construct outer ring of polygon.
         */
        final List<GeoJsonPoint> outerRing = new ArrayList<GeoJsonPoint>();
        
        /*
         * If we have a valid shape object.
         */
        if (shapeObj.has(ArcgisExtensionsConstants.VERTICES)) {
            /*
             * Get the list of vertices.
             */
            final JSONArray verticesList =
                    shapeObj.getJSONArray(ArcgisExtensionsConstants.VERTICES);
            
            /*
             * Loop over list of vertices.
             */
            for (int j = 0; j < verticesList.length(); j++) {
                final JSONObject verticeObj = verticesList.getJSONObject(j);
                final double xCoord = verticeObj.getDouble(ArcgisExtensionsConstants.UPPERCASE_X);
                final double yCoord = verticeObj.getDouble(ArcgisExtensionsConstants.UPPERCASE_Y);
                /*
                 * Create a new 2D point.
                 */
                final GeoJsonPoint coord = new GeoJsonPoint(xCoord, yCoord);
                /*
                 * Add 2D Point to outerRing.
                 */
                outerRing.add(coord);
            }
            /*
             * The first and last point in polygon array must be the same (coincident).
             */
            outerRing.add(outerRing.get(0));
            
        }
        /*
         * Add the outer ring.
         */
        polygonRings.put(0, outerRing);
        
        return polygonRings;
    }
    
    /**
     *
     * Create GeoJSON LineString coordinates from ARCHIBUS Segments.
     *
     * @param geometryObj The ARCHIBUS geometry object (segments).
     * @return The GeoJSON LineString coordinates.
     */
    private static List<GeoJsonPoint> createLineStringCoordinatesFromSegments(
            final JSONObject geometryObj) {
        
        final List<GeoJsonPoint> coordinates = new ArrayList<GeoJsonPoint>();
        
        final JSONArray geometryArray =
                geometryObj.getJSONArray(ArcgisExtensionsConstants.SEGMENTS);
        log.debug(geometryArray.toString());
        
        for (int k = 0; k < geometryArray.length(); k++) {
            
            final JSONObject geometrySegment = geometryArray.getJSONObject(k);
            /*
             * For the first segment, get X and Y coordinates of P1 and P2 and add to LineString
             * coordinates.
             */
            if (geometrySegment.has(ArcgisExtensionsConstants.UPPERCASE_P1)
                    && (geometrySegment.has(ArcgisExtensionsConstants.UPPERCASE_P2))) {
                
                if (k == 0) {
                    final JSONObject point1 =
                            geometrySegment.getJSONObject(ArcgisExtensionsConstants.UPPERCASE_P1);
                    final double xCoord1 = point1.getDouble(ArcgisExtensionsConstants.UPPERCASE_X);
                    final double yCoord1 = point1.getDouble(ArcgisExtensionsConstants.UPPERCASE_Y);
                    final GeoJsonPoint coord1 = new GeoJsonPoint(xCoord1, yCoord1);
                    
                    final JSONObject point2 =
                            geometrySegment.getJSONObject(ArcgisExtensionsConstants.UPPERCASE_P2);
                    final double xCoord2 = point2.getDouble(ArcgisExtensionsConstants.UPPERCASE_X);
                    final double yCoord2 = point2.getDouble(ArcgisExtensionsConstants.UPPERCASE_Y);
                    final GeoJsonPoint coord2 = new GeoJsonPoint(xCoord2, yCoord2);
                    
                    coordinates.add(coord1);
                    coordinates.add(coord2);
                }
                /*
                 * For subsequent segments, get coordinates of P2 and add to linestring coordinates.
                 */
                if (k > 0) {
                    final JSONObject point2 =
                            geometrySegment.getJSONObject(ArcgisExtensionsConstants.UPPERCASE_P2);
                    final double xCoord2 = point2.getDouble(ArcgisExtensionsConstants.UPPERCASE_X);
                    final double yCoord2 = point2.getDouble(ArcgisExtensionsConstants.UPPERCASE_Y);
                    final GeoJsonPoint coord2 = new GeoJsonPoint(xCoord2, yCoord2);
                    
                    coordinates.add(coord2);
                }
            }

        }
        return coordinates;
    }
    
    /**
     *
     * Create GeoJSON LineString coordinates from ARCHIBUS Line.
     *
     * @param geometryObj The ARCHIBUS geometry object (line).
     * @return The GeoJSON LineString coordinates.
     */
    private static List<GeoJsonPoint> createLineStringCoordinatesFromLine(
            final JSONObject geometryObj) {
        
        final List<GeoJsonPoint> coordinates = new ArrayList<GeoJsonPoint>();
        
        /*
         * Get the X and Y coordinates for P1 and P2
         */
        final JSONObject point1 = geometryObj.getJSONObject(ArcgisExtensionsConstants.UPPERCASE_P1);
        final double xCoord1 = point1.getDouble(ArcgisExtensionsConstants.UPPERCASE_X);
        final double yCoord1 = point1.getDouble(ArcgisExtensionsConstants.UPPERCASE_Y);
        final GeoJsonPoint coord1 = new GeoJsonPoint(xCoord1, yCoord1);
        
        final JSONObject point2 = geometryObj.getJSONObject(ArcgisExtensionsConstants.UPPERCASE_P2);
        final double xCoord2 = point2.getDouble(ArcgisExtensionsConstants.UPPERCASE_X);
        final double yCoord2 = point2.getDouble(ArcgisExtensionsConstants.UPPERCASE_Y);
        final GeoJsonPoint coord2 = new GeoJsonPoint(xCoord2, yCoord2);
        
        coordinates.add(coord1);
        coordinates.add(coord2);
        
        return coordinates;
    }
    
}
