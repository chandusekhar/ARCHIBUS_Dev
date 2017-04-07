package com.archibus.app.common.extensionsarcgis;

import java.io.File;

import com.archibus.config.Project;
import com.archibus.context.ContextStore;
import com.archibus.schema.ArchibusFieldDefBase;
import com.archibus.utility.ListWrapper;

/**
 *
 * Provides a set of shared / helper methods for working with Web Central projects used by the
 * Extensions for ArcGIS.
 *
 * @author knight
 *
 */
public final class ArchibusProjectUtilities {

    /**
     * Constructor not called.
     */
    private ArchibusProjectUtilities() {

    }

    /**
     *
     * Get the app path for the current project.
     *
     * @return a string containing the app path.
     */
    public static String getAppPath() {
        final String webAppPath = getWebAppPath();
        return new File(webAppPath).getParent().toString();
    }
    
    /**
     *
     * Get the web app path for the current project.
     *
     * @return a string containing the web app path.
     */
    public static String getWebAppPath() {
        return ContextStore.get().getWebAppPath();
    }

    /**
     *
     * Get the request URL for the current context.
     *
     * @return a string containing the request URL.
     */
    public static String getRequestURL() {
        return ContextStore.get().getRequestURL();
    }

    /**
     *
     * Get the base URL for the current context.
     *
     * @return a string containing the base URL.
     */
    public static String getBaseURL() {
        return getRequestURL();
    }
    
    /**
     *
     * Get the project folder from the enterprise graphics path.
     *
     * @return a string with the project folder.
     */
    public static String getProjectFolderFromEnterpriseGraphicsPath() {
        final String enterpriseGraphicsPath = getEnterpriseGraphicsPath();
        return new File(enterpriseGraphicsPath).getParent().toString();
    }

    /**
     *
     * Get the enterprise graphics path.
     *
     * @return a string with the enterprise graphcis path.
     */
    public static String getEnterpriseGraphicsPath() {
        final Project.Immutable project = ContextStore.get().getProject();
        return project.getEnterpriseGraphicsFolder();

    }

    /**
     *
     * Get the drawings folder for the current project.
     *
     * @return a string with the current drawings folder.
     */
    public static String getDrawingsFolder() {
        final Project.Immutable project = ContextStore.get().getProject();
        return project.getDrawingsFolder();
    }

    /**
     *
     * Get the drawings folder for the Smart Client.
     *
     * @return a string with the drawings folder for the Smart Client.
     */
    public static String getDrawingsFolderForSmartClient() {
        final Project.Immutable project = ContextStore.get().getProject();
        return project.getDrawingsFolderForSmartClient();

    }

    /**
     *
     * Get the geoJson path for the current project.
     *
     * @return a string with the geoJson path for the current project.
     */
    public static String getGeoJsonPath() {
        String enterpriseGraphicsPath = getEnterpriseGraphicsPath() + "/geo/";

        /*
         * If enterpriseGraphicsPath doesn't include a drive letter or a UNC path, append the
         * application path to the enterprise graphics path.
         */
        if (!enterpriseGraphicsPath.startsWith(ArcgisExtensionsConstants.DOUBLE_FORWARD_SLASH)
                && !enterpriseGraphicsPath.matches(ArcgisExtensionsConstants.REGEX_DRIVE_LETTER)) {
            enterpriseGraphicsPath = getAppPath() + enterpriseGraphicsPath;
        }

        return enterpriseGraphicsPath;

    }

    /**
     *
     * Get the ARCHIBUS assets file name (published JSON) for a drawing.
     *
     * @param dwgname the drawing name.
     * @return a string with the asset file name.
     */
    public static String getAssetsFilename(final String dwgname) {
        
        String assetsFilename = "/" + dwgname + ".json";
        final String enterpriseGraphicsPath = getEnterpriseGraphicsPath();
        
        // If enterpriseGraphicsPath doesn't include a drive letter or a UNC path,
        // append the application path, enterprise graphics path, and assets filename.
        if (enterpriseGraphicsPath.startsWith(ArcgisExtensionsConstants.DOUBLE_FORWARD_SLASH)
                || enterpriseGraphicsPath.matches(ArcgisExtensionsConstants.REGEX_DRIVE_LETTER)) {
            assetsFilename = enterpriseGraphicsPath + assetsFilename;
        } else {
            assetsFilename = getAppPath() + enterpriseGraphicsPath + assetsFilename;
        }
        
        return assetsFilename;
    }

    /**
     *
     * Get the ARCHIBUS primary key field names for an asset type.
     *
     * @param assetType The ARCHIBUS asset type.
     * @return The ARCHIBUS key field names.
     */
    public static String[] getAssetKeyFieldNames(final String assetType) {

        final ListWrapper.Immutable<ArchibusFieldDefBase.Immutable> primaryKeyFields =
                ContextStore.get().getProject().loadTableDef(assetType).getPrimaryKey().getFields();
        
        int index = 0;
        final String[] assetKeyFieldNames = new String[primaryKeyFields.size()];
        
        for (final com.archibus.schema.ArchibusFieldDefBase.Immutable primaryKeyField : primaryKeyFields) {
            final String fieldName = primaryKeyField.getName();
            assetKeyFieldNames[index] = fieldName;
            index += 1;
        }

        return assetKeyFieldNames;
    }
}
