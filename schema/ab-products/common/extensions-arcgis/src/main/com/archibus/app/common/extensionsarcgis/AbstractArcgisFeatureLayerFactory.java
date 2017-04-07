package com.archibus.app.common.extensionsarcgis;

import com.archibus.context.ContextStore;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

import freemarker.template.utility.StringUtil;

/**
 *
 * Provides methods to create ArcGIS Feature Layers for ARCHIBUS Assets.
 *
 * @author knight
 *
 */
public abstract class AbstractArcgisFeatureLayerFactory {

    /**
     *
     * Create an ARCHIBUS ArcGIS Feature Layer. The method gets the necessary activity parameters to
     * create the feature layer.
     *
     * @param assetType ARCHIBUS asset type.
     * @param whereClause The where clause for the feature layer.
     * @return an ARCHIBUS ArcGISFeatureLayer.
     */
    public static ArcgisFeatureLayer createFeatureLayer(final String assetType,
            final String whereClause) {

        /*
         * Create a new feature layer.
         */
        final ArcgisFeatureLayer featureLayer = new ArcgisFeatureLayer();
        
        /*
         * Set the layer URL.
         */
        final String urlParameter =
                ArcgisExtensionsConstants.ARCGIS + capitalize(assetType)
                        + ArcgisExtensionsConstants.LAYERURL;
        final String url = getActivityParameterValue(urlParameter);
        featureLayer.setUrl(url);

        /*
         * Set the where clause.
         */
        featureLayer.setWhereClause(whereClause);

        /*
         * Add additional properties for ARCHIBUS assets.
         */
        if (!(assetType.equalsIgnoreCase(ArcgisExtensionsConstants.ASSET_TYPE_BACKGROUND))) {
            addAssetParameters(featureLayer, assetType);
        }
        
        return featureLayer;
    }

    /**
     *
     * Add additional parameters to the feature layer specific to ARCHIBUS asset. The method gets
     * the necessary activity parameters to add the additional parameters.
     *
     * @param featureLayer The feature layer.
     * @param assetType The ARCHIBUS asset type.
     */
    private static void addAssetParameters(final ArcgisFeatureLayer featureLayer,
            final String assetType) {

        /*
         * Set the ArcGIS asset type field.
         */
        final String assetTypeFieldParameter =
                ArcgisExtensionsConstants.ARCGIS + capitalize(assetType)
                        + ArcgisExtensionsConstants.LAYERASSETYPEFIELD;
        final String assetTypeField = getActivityParameterValue(assetTypeFieldParameter);
        featureLayer.setAssetTypeField(assetTypeField);
        
        /*
         * Set the ARCHIBUS primary keys
         */
        final String[] assetKeyFields = ArchibusProjectUtilities.getAssetKeyFieldNames(assetType);
        featureLayer.setAssetKeyFields(assetKeyFields);

        /*
         * Set the ARCHIBUS layer id field.
         */
        final String idFieldParameter =
                ArcgisExtensionsConstants.ARCGIS + capitalize(assetType)
                        + ArcgisExtensionsConstants.LAYERIDFIELD;
        final String idField = getActivityParameterValue(idFieldParameter);
        featureLayer.setIdField(idField);

        /*
         * Set the ArcGIS layer object id field.
         */
        final String objectIdFieldParameter =
                ArcgisExtensionsConstants.ARCGIS + capitalize(assetType)
                        + ArcgisExtensionsConstants.LAYEROBJECTIDFIELD;
        final String objectIdField = getActivityParameterValue(objectIdFieldParameter);
        featureLayer.setObjectIdField(objectIdField);

        /*
         * Set the import connector id.
         */
        final String importConnectorIdParameter =
                ArcgisExtensionsConstants.ARCGIS + capitalize(assetType)
                        + ArcgisExtensionsConstants.IMPORTCONNECTORID;
        final String importConnectorId = getActivityParameterValue(importConnectorIdParameter);
        featureLayer.setImportConnectorId(importConnectorId);

        /*
         * Set the export connector id.
         */
        final String exportConnectorIdParameter =
                ArcgisExtensionsConstants.ARCGIS + capitalize(assetType)
                        + ArcgisExtensionsConstants.EXPORTCONNECTORID;
        final String exportConnectorId = getActivityParameterValue(exportConnectorIdParameter);
        featureLayer.setExportConnectorId(exportConnectorId);
        
        /*
         * Set the feature geometry type.
         */
        final String geometryTypeParameter =
                ArcgisExtensionsConstants.ARCGIS + capitalize(assetType)
                        + ArcgisExtensionsConstants.GEOMETRYTYPE;
        final String geometryType = getActivityParameterValue(geometryTypeParameter);
        featureLayer.setGeometryType(geometryType);

    }

    /**
     *
     * Capitalize a string.
     *
     * @param string The string to capitalize.
     * @return The capitalized string.
     */
    private static String capitalize(final String string) {
        return StringUtil.capitalize(string);
    }
    
    /**
     *
     * Get an activity parameter value from the database.
     *
     * @param parameterName The activity parameter name.
     * @return The activity parameter value.
     */
    private static String getActivityParameterValue(final String parameterName) {
        String parameterValue = null;

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();

        parameterValue =
                EventHandlerBase.getActivityParameterString(context,
                    ArcgisExtensionsConstants.ABCOMMONRESOURCES, parameterName);

        return parameterValue;
    }

}
