package com.archibus.app.common.extensionsarcgis;

import org.jfree.util.Log;

import com.archibus.context.ContextStore;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

/**
 *
 * Stores publishing properties used by the Extensions for Esri (ArcGIS) classes.
 *
 * @author knight
 * @since 22.1
 *
 */

public final class ArcgisPublishingConfiguration {

    /**
     * Include the background graphics when publishing.
     *
     */
    private Boolean publishBackground;

    /**
     * The format which the Extensions will publish to.
     *
     */
    private String publishFormat;

    /**
     * The list of asset types to publish.
     */
    private String[] publishAssetTypes;

    /**
     *
     * Create an instance of the publishing configuration.
     */
    public ArcgisPublishingConfiguration() {

        // create the publish configuration.
        getPublishConfigurationPropertiesFromDatabase();
    }
    
    /**
     * Get the publish configuration properties from the database.
     */
    private void getPublishConfigurationPropertiesFromDatabase() {
        
        // AbCommonResources.ArcgisPublishFormat
        this.getPublishFormatFromDatabase();

        // AbCommonResources.ArcgisPublishBackground
        this.getPublishBackgroundFromDatabase();

        // AcCommonResources.ArcgisPublishAssetTypes
        this.getPublishAssetTypesFromDatabase();
        
    }
    
    /**
     * Get the publish format from the database.
     */
    private void getPublishFormatFromDatabase() {

        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final String format =
                EventHandlerBase.getActivityParameterString(context,
                    ArcgisExtensionsConstants.ABCOMMONRESOURCES, "ArcgisPublishFormat");
        
        if ("".equals(format)) {
            Log.error("There is no format configured for ArcGIS publishing.");

        } else {
            this.setPublishFormat(format);
        }
    }

    /**
     * Get publish background flag from database.
     */
    private void getPublishBackgroundFromDatabase() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final String background =
                EventHandlerBase.getActivityParameterString(context,
                    ArcgisExtensionsConstants.ABCOMMONRESOURCES, "ArcgisPublishBackground");
        
        if ("TRUE".equals(background)) {
            this.setPublishBackground(true);
        } else if ("FALSE".equals(background)) {
            this.setPublishBackground(false);
            Log.info("ArcGIS background publishing is disabled.");

        } else {
            this.setPublishBackground(false);
            Log.error("ArcGIS background publishing is not configured.");
        }
    }

    /**
     * Get the list of asset types to publish from the database.
     */
    private void getPublishAssetTypesFromDatabase() {
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final String assetList =
                EventHandlerBase.getActivityParameterString(context,
                    ArcgisExtensionsConstants.ABCOMMONRESOURCES, "ArcgisPublishAssetTypes");
        
        if ("".equals(assetList)) {
            Log.error("There are no asset types configured for publishing.");

        } else {
            final String[] assetTypes = assetList.split(",");
            this.setPublishAssetTypes(assetTypes);
        }

    }
    
    /**
     * Getter for the publishBackground property.
     *
     * @see publishBackground
     * @return the publishBackground property.
     */
    public Boolean getPublishBackground() {
        return this.publishBackground;
    }

    /**
     * Setter for the publishBackground property.
     *
     * @see publishBackground
     * @param publishBackground the publishBackground to set
     */

    public void setPublishBackground(final Boolean publishBackground) {
        this.publishBackground = publishBackground;
    }

    /**
     * Getter for the publishFormat property.
     *
     * @see publishFormat
     * @return the publishFormat property.
     */

    public String getPublishFormat() {
        return this.publishFormat;
    }

    /**
     * Setter for the publishFormat property.
     *
     * @see publishFormat
     * @param publishFormat the publishFormat to set.
     */

    public void setPublishFormat(final String publishFormat) {
        this.publishFormat = publishFormat;
    }

    /**
     *
     * Getter for the publishAssetTypes property.
     *
     * @see publishAssetTypes
     * @return the publishAssetTypes property.
     */
    public String[] getPublishAssetTypes() {
        return this.publishAssetTypes.clone();
    }

    /**
     *
     * Setter for the publishAssetTypes property.
     *
     * @see publishAssetTypes
     * @param publishAssetTypes the assetTypes to set.
     */
    public void setPublishAssetTypes(final String[] publishAssetTypes) {
        this.publishAssetTypes = publishAssetTypes.clone();
    }

}