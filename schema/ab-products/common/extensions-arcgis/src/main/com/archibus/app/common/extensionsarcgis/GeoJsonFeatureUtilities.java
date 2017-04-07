package com.archibus.app.common.extensionsarcgis;

import java.util.List;

import org.json.*;

/**
 *
 * Provides methods to work with GeoJSON features.
 *
 * Used by the Extensions for Esri.
 *
 * @author knight
 *
 */
public final class GeoJsonFeatureUtilities {
    
    /**
     *
     * Constructor not called.
     */
    private GeoJsonFeatureUtilities() {
        
    }

    /**
     *
     * Add a point to a coordinate array.
     *
     * @param coordinates The coordinate array.
     * @param point The point to add to the array.
     */
    public static void addPointToCoordinateArray(final List<GeoJsonPoint> coordinates,
            final GeoJsonPoint point) {
        
        coordinates.add(point);
        
    }
    
    /**
     *
     * Check to see that all the georeference parameters exist.
     *
     * @param geoInfo The georeference parameters to check.
     * @return True or false to indicate all of the georeference parameters exist.
     */
    public static Boolean checkGeoreferenceParams(final JSONObject geoInfo) {
        
        Boolean hasGeoreferenceParams = false;
        
        int count = 0;
        
        if (geoInfo.has(ArcgisExtensionsConstants.JSON_GEOX)) {
            count = count + 1;
        }
        if (geoInfo.has(ArcgisExtensionsConstants.JSON_GEOY)) {
            count = count + 1;
        }
        if (geoInfo.has(ArcgisExtensionsConstants.JSON_GEOSCALE)) {
            count = count + 1;
        }
        if (geoInfo.has(ArcgisExtensionsConstants.JSON_GEOROTATE)) {
            count = count + 1;
        }
        if (geoInfo.has(ArcgisExtensionsConstants.JSON_GEOSRS)) {
            count = count + 1;
        }
        
        if (count == ArcgisExtensionsConstants.INT_5) {
            hasGeoreferenceParams = true;
        }
        
        return hasGeoreferenceParams;
    }
    
    /**
     *
     * Check to see that the spatial reference system exists.
     *
     * @param geoInfo The georeference parameters to check.
     * @return True or false to indicate whether the spatial reference system exists.
     */
    public static Boolean checkSpatialReferenceSystem(final JSONObject geoInfo) {
        Boolean hasSpatialReference = false;
        
        if (geoInfo.has(ArcgisExtensionsConstants.JSON_GEOSRS)) {
            hasSpatialReference = true;
        }
        
        return hasSpatialReference;
    }
    
    /**
     *
     * Create a GeoJSON coordinate reference system object.
     *
     * @param geoSRS The spatial reference system.
     * @return The GeoJSON coordinate reference system object.
     */
    public static JSONObject createCoordinateReferenceSystem(final String geoSRS) {
        
        final JSONObject crsObj = new JSONObject();
        final JSONObject crsName = new JSONObject();
        crsName.put(ArcgisExtensionsConstants.JSON_NAME, geoSRS);
        crsObj.put(ArcgisExtensionsConstants.JSON_TYPE, ArcgisExtensionsConstants.JSON_NAME);
        crsObj.put(ArcgisExtensionsConstants.JSON_PROPERTIES, crsName);
        
        return crsObj;
    }

    /**
     *
     * Get the drawing info from the GeoJSON.
     *
     * @param geoJson The GeoJSON.
     * @return The drawing info.
     */
    public static JSONObject getDrawingInfoFromCollection(final JSONObject geoJson) {
        final JSONObject dwgInfo =
                geoJson.getJSONObject(ArcgisExtensionsConstants.JSON_PROPERTIES).getJSONObject(
                    ArcgisExtensionsConstants.JSON_DWGINFO);
        return dwgInfo;
    }
    
    /**
     *
     * Get the features from a GeoJSON feauture collection.
     *
     * @param geoJson The GeoJSON collection.
     * @return The GeoJSON features.
     */
    public static JSONArray getFeaturesFromCollection(final JSONObject geoJson) {
        JSONArray geoJsonFeatures = new JSONArray();
        if (geoJson.has(ArcgisExtensionsConstants.FIELD_FEATURES)) {
            geoJsonFeatures = geoJson.getJSONArray(ArcgisExtensionsConstants.FIELD_FEATURES);
        }
        return geoJsonFeatures;
    }
    
    /**
     *
     * Round the coordinates of a point for Web Mercator (2 decimals) or Lat-Lon (6 decimals).
     *
     * @param point The point with coordinates to round.
     * @param epsg The spatial reference system.
     * @return The point with rounded coordinates.
     */
    public static GeoJsonPoint roundPointCoordinates(final GeoJsonPoint point, final String epsg) {
        
        double xCoord = 0;
        double yCoord = 0;
        GeoJsonPoint newPoint = null;
        
        if (epsg.equalsIgnoreCase(ArcgisExtensionsConstants.EPSG_WEB_MERC)) {
            xCoord =
                    Math.round(point.x * ArcgisExtensionsConstants.DOUBLE_ONE_HUNDRED_POINT_ZERO)
                            / ArcgisExtensionsConstants.DOUBLE_ONE_HUNDRED_POINT_ZERO;
            yCoord =
                    Math.round(point.y * ArcgisExtensionsConstants.DOUBLE_ONE_HUNDRED_POINT_ZERO)
                            / ArcgisExtensionsConstants.DOUBLE_ONE_HUNDRED_POINT_ZERO;
            newPoint = new GeoJsonPoint(xCoord, yCoord);
        } else if (epsg.equalsIgnoreCase(ArcgisExtensionsConstants.EPSG_LAT_LON)) {
            xCoord =
                    Math.round(point.x * ArcgisExtensionsConstants.DOUBLE_ONE_MILLION_POINT_ZERO)
                            / ArcgisExtensionsConstants.DOUBLE_ONE_MILLION_POINT_ZERO;
            yCoord =
                    Math.round(point.y * ArcgisExtensionsConstants.DOUBLE_ONE_MILLION_POINT_ZERO)
                            / ArcgisExtensionsConstants.DOUBLE_ONE_MILLION_POINT_ZERO;
            newPoint = new GeoJsonPoint(xCoord, yCoord);
        } else {
            newPoint = point;
        }
        
        return newPoint;
    }
}
