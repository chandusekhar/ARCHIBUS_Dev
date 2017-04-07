package com.archibus.app.common.extensionsarcgis;

import org.json.*;

import com.archibus.utility.StringUtil;

/**
 *
 * Provides a set of shared / helper methods for working with ARCHIBUS JSON features.
 *
 * Used by the Extensions for Esri.
 *
 * @author knight
 *
 */
public final class ArchibusJsonUtilities {

    /**
     *
     * Constructor not called.
     */
    private ArchibusJsonUtilities() {
        
    }

    /**
     *
     * Get the drawing name from the ARCHIBUS JSON.
     *
     * @param archibusJson The ARCHIBUS JSON.
     * @return The ARCHIBUS drawing name.
     */
    public static String getDwgnameFromArchibusJson(final JSONObject archibusJson) {
        final String id = archibusJson.getString(ArcgisExtensionsConstants.ID_STRING).toString();
        final String[] idStrings = id.split("[\\\\]");
        final String dwgFilename = idStrings[idStrings.length - 1];

        return dwgFilename.substring(0, dwgFilename.length() - ArcgisExtensionsConstants.INT_4);
    }
    
    /**
     *
     * Verify that an ARCHIBUS asset is valid.
     *
     * @param asset the ARCHIBUS asset.
     * @return true if the asset is valid, false if the asset is not valid.
     */
    public static Boolean assetIsValid(final JSONObject asset) {
        Boolean valid = false;

        if (asset.has(ArcgisExtensionsConstants.KEY)
                && asset.has(ArcgisExtensionsConstants.ASSETTYPE)
                && asset.has(ArcgisExtensionsConstants.SHAPE)) {

            final JSONObject shape = asset.getJSONObject(ArcgisExtensionsConstants.SHAPE);
            if (shape.has(ArcgisExtensionsConstants.EXTENTSMIN)
                    && shape.has(ArcgisExtensionsConstants.EXTENTSMAX)) {
                valid = true;
            }

        }

        return valid;
    }
    
    /**
     *
     * Create the feature property object.
     *
     * @param geoLevel The drawing geo level.
     * @param assetKeyFields The asset key fields.
     * @param assetKey The asset key.
     * @param assetType The ARCHIBUS asset type.
     * @param dwgname The ARCHIBUS drawing name.
     * @return The feature property object.
     */
    public static JSONObject createFeatureProperties(final int geoLevel,
            final String[] assetKeyFields, final String assetKey, final String assetType,
            final String dwgname) {
        final JSONObject featureProperties = new JSONObject();

        if (StringUtil.notNullOrEmpty(geoLevel)) {
            featureProperties.put(ArcgisExtensionsConstants.FIELD_GEO_LEVEL, geoLevel);
        } else {
            featureProperties.put(ArcgisExtensionsConstants.FIELD_GEO_LEVEL, null);
        }

        // TODO more work to do here...
        featureProperties.put(assetKeyFields[0], assetKey);

        featureProperties.put(ArcgisExtensionsConstants.FIELD_ASSET_TYPE, assetType);
        featureProperties.put(ArcgisExtensionsConstants.DWGNAME, dwgname);

        return featureProperties;
    }

    /**
     *
     * Calculate the center point of an extent.
     *
     * @param extentMin The lower left corner of the extent.
     * @param extentMax The upper right corner of the extent.
     * @return The center point of the extent.
     */
    public static GeoJsonPoint calculateCenterFromExtent(final JSONObject extentMin,
            final JSONObject extentMax) {

        final double xMin = extentMin.getDouble(ArcgisExtensionsConstants.UPPERCASE_X);
        final double yMin = extentMin.getDouble(ArcgisExtensionsConstants.UPPERCASE_Y);
        final double xMax = extentMax.getDouble(ArcgisExtensionsConstants.UPPERCASE_X);
        final double yMax = extentMax.getDouble(ArcgisExtensionsConstants.UPPERCASE_Y);

        final double xCoord = (xMax + xMin) / 2;
        final double yCoord = (yMax + yMin) / 2;

        final GeoJsonPoint centerPoint = new GeoJsonPoint(xCoord, yCoord);

        return centerPoint;
    }
    
    /**
     *
     * Parse a background object for its geometry.
     *
     * @param backgroundObj a background element with geometry.
     * @return The background coordinates.
     */
    public static JSONArray getGeometryForBackgroundObject(final JSONObject backgroundObj) {
        final JSONArray backgroundGeometry = new JSONArray();

        /*
         * Check to see if we have a line.
         */
        if (backgroundObj.has(ArcgisExtensionsConstants.UPPERCASE_P1)
                && (backgroundObj.has(ArcgisExtensionsConstants.UPPERCASE_P2))) {
            backgroundGeometry.put(backgroundObj);
        }
        
        /*
         * Check to see if we have a segment.
         */
        if (backgroundObj.has(ArcgisExtensionsConstants.SEGMENTS)) {
            backgroundGeometry.put(backgroundObj);
        }
        
        /*
         * Check to see if we have a block insert.
         */
        if (backgroundObj.has(ArcgisExtensionsConstants.SHAPE)) {
            
            String backgroundLayer = "";
            if (backgroundObj.has(ArcgisExtensionsConstants.LAYER)) {
                backgroundLayer = backgroundObj.getString(ArcgisExtensionsConstants.LAYER);
            }
            
            final JSONObject backgroundShape =
                    backgroundObj.getJSONObject(ArcgisExtensionsConstants.SHAPE);
            if (backgroundShape.has(ArcgisExtensionsConstants.PARTS)) {
                final JSONArray backgroundParts =
                        backgroundShape.getJSONArray(ArcgisExtensionsConstants.PARTS);
                
                final JSONObject backgroundSegments = new JSONObject();
                backgroundSegments.put(ArcgisExtensionsConstants.LAYER, backgroundLayer);
                backgroundSegments.put(ArcgisExtensionsConstants.SEGMENTS, backgroundParts);

                backgroundGeometry.put(backgroundSegments);
            }
        }

        return backgroundGeometry;
    }

}
