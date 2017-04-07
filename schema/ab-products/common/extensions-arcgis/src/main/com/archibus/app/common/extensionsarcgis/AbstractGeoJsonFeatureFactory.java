package com.archibus.app.common.extensionsarcgis;

import java.util.List;

import org.json.*;

/**
 *
 * Provides methods for creating GeoJSON features.
 *
 * Used by the Extensions for Esri.
 *
 * @author knight
 *
 */
public abstract class AbstractGeoJsonFeatureFactory {
    
    /**
     *
     * Create a GeoJSON Point feature.
     *
     * @param featureId The feature id.
     * @param featureProperties The feature properties.
     * @param coordinates The feature coordinate.
     * @return The GeoJSON feature.
     */
    public static final JSONObject createGeoJsonPointFeature(final String featureId,
            final JSONObject featureProperties, final GeoJsonPoint coordinates) {
        
        final JSONObject geoJsonFeature = new JSONObject();
        
        geoJsonFeature.put(ArcgisExtensionsConstants.JSON_ID, featureId);
        geoJsonFeature.put(ArcgisExtensionsConstants.JSON_PROPERTIES, featureProperties);
        geoJsonFeature.put(ArcgisExtensionsConstants.JSON_TYPE, ArcgisExtensionsConstants.FEATURE);
        
        final JSONObject featureGeometry =
                createGeoJsonPointFeatureGeometry(ArcgisExtensionsConstants.POINT, coordinates);
        
        geoJsonFeature.put(ArcgisExtensionsConstants.JSON_GEOMETRY, featureGeometry);
        
        return geoJsonFeature;
    }

    /**
     *
     * Create a GeoJSON LineString feature.
     *
     * @param featureId The feature id.
     * @param featureProperties The feature properties.
     * @param coordinates The feature coordinates.
     * @return The GeoJSON feature.
     */
    public static final JSONObject createGeoJsonLineStringFeature(final String featureId,
            final JSONObject featureProperties, final List<GeoJsonPoint> coordinates) {

        final JSONObject geoJsonFeature = new JSONObject();

        geoJsonFeature.put(ArcgisExtensionsConstants.JSON_ID, featureId);
        geoJsonFeature.put(ArcgisExtensionsConstants.JSON_PROPERTIES, featureProperties);
        geoJsonFeature.put(ArcgisExtensionsConstants.JSON_TYPE, ArcgisExtensionsConstants.FEATURE);

        final JSONObject featureGeometry =
                createGeoJsonLineStringFeatureGeometry(ArcgisExtensionsConstants.LINESTRING,
                    coordinates);

        geoJsonFeature.put(ArcgisExtensionsConstants.JSON_GEOMETRY, featureGeometry);

        return geoJsonFeature;
    }
    
    /**
     *
     * Create a GeoJSON Polygon feature.
     *
     * @param featureId The feature id.
     * @param featureProperties The feature properties.
     * @param coordinates The feature coordinates.
     * @return The GeoJSON feature.
     */
    public static final JSONObject createGeoJsonPolygonFeature(final String featureId,
            final JSONObject featureProperties, final JSONArray coordinates) {

        final JSONObject geoJsonFeature = new JSONObject();

        geoJsonFeature.put(ArcgisExtensionsConstants.JSON_ID, featureId);
        geoJsonFeature.put(ArcgisExtensionsConstants.JSON_PROPERTIES, featureProperties);
        geoJsonFeature.put(ArcgisExtensionsConstants.JSON_TYPE, ArcgisExtensionsConstants.FEATURE);

        final JSONObject featureGeometry =
                createGeoJsonFeatureGeometry(ArcgisExtensionsConstants.POLYGON, coordinates);

        geoJsonFeature.put(ArcgisExtensionsConstants.JSON_GEOMETRY, featureGeometry);

        return geoJsonFeature;
    }

    /**
     *
     * Create GeoJSON Point feature geometry.
     *
     * @param featureType The GeoJSON feature type.
     * @param coordinates The feature coordinates.
     * @return The GeoJSON feature geometry.
     */
    private static JSONObject createGeoJsonPointFeatureGeometry(final String featureType,
            final GeoJsonPoint coordinates) {
        
        final JSONObject featureGeometry = new JSONObject();
        
        featureGeometry.put(ArcgisExtensionsConstants.JSON_TYPE, featureType);
        featureGeometry.put(ArcgisExtensionsConstants.JSON_COORDINATES, coordinates);
        
        return featureGeometry;
        
    }

    /**
     *
     * Create GeoJSON LineString feature geometry.
     *
     * @param featureType The GeoJSON feature type.
     * @param coordinates The feature coordinates.
     * @return The GeoJSON feature geometry.
     */
    private static JSONObject createGeoJsonLineStringFeatureGeometry(final String featureType,
            final List<GeoJsonPoint> coordinates) {

        final JSONObject featureGeometry = new JSONObject();

        featureGeometry.put(ArcgisExtensionsConstants.JSON_TYPE, featureType);
        featureGeometry.put(ArcgisExtensionsConstants.JSON_COORDINATES, coordinates);

        return featureGeometry;

    }
    
    /**
     *
     * Create GeoJSON Polygon feature geometry.
     *
     * @param featureType The GeoJSON feature type.
     * @param coordinates The feature coordinates.
     * @return The GeoJSON feature geometry.
     */
    private static JSONObject createGeoJsonFeatureGeometry(final String featureType,
            final JSONArray coordinates) {

        final JSONObject featureGeometry = new JSONObject();

        featureGeometry.put(ArcgisExtensionsConstants.JSON_TYPE, featureType);
        featureGeometry.put(ArcgisExtensionsConstants.JSON_COORDINATES, coordinates);

        return featureGeometry;

    }
    
    /**
     *
     * Creates a GeoJSON feature collection.
     *
     * @param epsgCode The coordinate reference system object.
     * @param properties The properties of the feature collection.
     * @param features The features of the feature collection.
     * @return The GeoJSON feature collection;
     */
    public static JSONObject createGeoJsonFeatureCollection(final String epsgCode,
            final JSONObject properties, final JSONArray features) {

        final JSONObject geoJsonFeatureCollection = new JSONObject();
        final JSONObject crsObj = GeoJsonFeatureUtilities.createCoordinateReferenceSystem(epsgCode);
        geoJsonFeatureCollection.put(ArcgisExtensionsConstants.JSON_CRS, crsObj);
        geoJsonFeatureCollection.put(ArcgisExtensionsConstants.FIELD_FEATURES, features);
        geoJsonFeatureCollection.put(ArcgisExtensionsConstants.JSON_PROPERTIES, properties);
        geoJsonFeatureCollection.put(ArcgisExtensionsConstants.JSON_TYPE,
            ArcgisExtensionsConstants.FEATURECOLLECTION);

        return geoJsonFeatureCollection;
    }

}
