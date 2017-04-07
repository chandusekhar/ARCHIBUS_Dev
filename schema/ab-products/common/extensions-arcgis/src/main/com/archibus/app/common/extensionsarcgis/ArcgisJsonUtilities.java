package com.archibus.app.common.extensionsarcgis;

import org.json.*;

/**
 *
 * Provides a set of shared / helper methods for working with collections of JSON features. Used by
 * the Extensions for ArcGIS.
 *
 * @author knight
 *
 */

public final class ArcgisJsonUtilities {

    /**
     *
     * Constructor not called.
     */
    private ArcgisJsonUtilities() {

    }
    
    /**
     *
     * Filter an asset list by asset type.
     *
     * @param geoJsonFeatures The asset list.
     * @param assetType The ARCHIBUS asset type.
     * @return The filtered asset list.
     */
    public static JSONArray filterGeoJsonFeatures(final JSONArray geoJsonFeatures,
            final String assetType) {
        final JSONArray filteredAssetList = new JSONArray();
        
        for (int i = 0; i < geoJsonFeatures.length(); i++) {
            final JSONObject asset = geoJsonFeatures.getJSONObject(i);
            final JSONObject assetProperties =
                    asset.getJSONObject(ArcgisExtensionsConstants.JSON_PROPERTIES);
            if (assetProperties.getString(ArcgisExtensionsConstants.FIELD_ASSET_TYPE).equals(
                assetType)) {
                filteredAssetList.put(asset);
            }
        }
        
        return filteredAssetList;
        
    }

    /**
     *
     * Filter an Esri feature list by asset type.
     *
     * @param esriFeatures The Esri features.
     * @param assetType The ARCHIBUS asset type.
     * @return The filtered Esri features.
     */
    public static JSONArray filterEsriFeatures(final JSONArray esriFeatures, final String assetType) {

        final JSONArray filteredFeatures = new JSONArray();

        for (int i = 0; i < esriFeatures.length(); i++) {
            final JSONObject feature = esriFeatures.getJSONObject(i);
            final JSONObject featureAttributes =
                    feature.getJSONObject(ArcgisExtensionsConstants.JSON_ATTRIBUTES);
            if (featureAttributes.getString(ArcgisExtensionsConstants.FIELD_ASSET_TYPE).equals(
                assetType)) {
                filteredFeatures.put(feature);
            }
        }

        return filteredFeatures;

    }

    /**
     *
     * Filter an Esri features list for Rm and Gros features. Provided as a convenience to
     * filterEsriFeatuers.
     *
     * @param esriFeatures the Esri features.
     * @return the filtered space features.
     */
    public static JSONArray filterEsriFeaturesForRmAndGros(final JSONArray esriFeatures) {
        
        final JSONArray spaceFeatures = new JSONArray();
        
        for (int i = 0; i < esriFeatures.length(); i++) {
            final JSONObject feature = esriFeatures.getJSONObject(i);
            final JSONObject featureAttributes =
                    feature.getJSONObject(ArcgisExtensionsConstants.JSON_ATTRIBUTES);
            if (featureAttributes.getString(ArcgisExtensionsConstants.FIELD_ASSET_TYPE).equals(
                ArcgisExtensionsConstants.JSON_RM)
                    || featureAttributes.getString(ArcgisExtensionsConstants.FIELD_ASSET_TYPE)
                        .equals(ArcgisExtensionsConstants.JSON_GROS)) {
                spaceFeatures.put(feature);
            }
        }
        
        return spaceFeatures;
    }

}
