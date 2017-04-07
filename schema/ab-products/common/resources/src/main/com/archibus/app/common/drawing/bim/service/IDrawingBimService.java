package com.archibus.app.common.drawing.bim.service;

import java.io.InputStream;
import java.util.Map;

import com.archibus.app.common.drawing.bim.service.impl.cloud.Status;
import com.archibus.utility.ExceptionBase;

/**
 *
 *
 * API of the Service for bim application.
 *
 * @author Yong Shao
 * @since 21.4
 *
 */
public interface IDrawingBimService {
    /**
     * Gets Autodesk View 360 Data Access key.
     *
     * @param clientId like "56vRODyX63SwkFRCbuQWfIi5QULGlVg5".
     * @param clientSecret like "9HUtjlMAyL7IeqR4".
     * @return String access token.
     * @throws ExceptionBase if Could throws an exception.
     */
    String getAccessToken(final String clientId, final String clientSecret) throws ExceptionBase;

    /**
     *
     * Converts revit guid to model valid guid.
     *
     * @param revitGuid revit guid.
     * @return model valid guid.
     */
    String convertRvitGuid(final String revitGuid);

    /**
     *
     * Gets the map of BIM Guid and corresponding Primary Key value.
     *
     * @param tableName String.
     * @param restriction String.
     * @param isRevit boolean.
     * @return Map<String, String>.
     */
    Map<String, String> getGuidPKValueMap(final String tableName, final String restriction,
            final boolean isRevit);

    /**
     *
     * Gets the map of BIM Guid and corresponding Primary Key value.
     *
     * @param objectIdDbFullPath String.
     * @param accessToken String.
     * @return Map<String, Integer>.
     */
    Map<String, Integer> getRevitGuid2NodeMap(final String objectIdDbFullPath,
            final String accessToken);

    /**
     *
     * Gets paired guid and database defined color map .
     *
     * @param asset String.
     * @param viewName String.
     * @param dataSourceId String.
     * @param restriction String.
     * @param isRevit boolean.
     * @return Map<String, String>.
     */
    Map<String, String> getGuidRGBColorMap(final String asset, final String viewName,
            final String dataSourceId, final String restriction, final boolean isRevit);

    /**
     *
     * Gets Highlight Colors.
     *
     * @param asset table name.
     * @param viewName axvw file name.
     * @param dataSourceId datasource id.
     * @param restriction client-side.
     * @param parameters Map<String, String>.
     * @return Map as {pk:rgb()}.
     */
    Map<String, String> getHighlightColors(final String asset, final String viewName,
            final String dataSourceId, final String restriction,
            final Map<String, String> parameters);

    /**
     *
     * Creates Bucket.
     *
     * @param bucketName bucket Name.
     * @param clientId client Id.
     * @param clientSecret client Secret key.
     * @throws ExceptionBase if Could throws an exception.
     */
    void createBucket(final String bucketName, final String clientId, final String clientSecret)
            throws ExceptionBase;

    /**
     *
     * Uploads a file.
     *
     * @param file InputStream.
     * @param fileName file name.
     * @param bucketName bucket Name.
     * @param clientId client Id.
     * @param clientSecret client Secret key.
     * @param registering boolean to register it.
     * @throws ExceptionBase if Could throws an exception.
     */
    void uploadFile(final InputStream file, final String fileName, final String bucketName,
            final String clientId, final String clientSecret, final boolean registering)
                    throws ExceptionBase;

    /**
     *
     * Registers uploaded File.
     *
     * @param fileName file name.
     * @param bucketName bucket Name.
     * @param clientId client Id.
     * @param clientSecret client Secret key.
     * @throws ExceptionBase if Could throws an exception.
     */
    void registerFile(final String fileName, final String bucketName, final String clientId,
            final String clientSecret) throws ExceptionBase;

    /**
     *
     * Check uploaded file's processing Status.
     *
     * @param fileName file name.
     * @param bucketName bucket Name.
     * @param clientId client Id.
     * @param clientSecret client Secret key.
     * @throws ExceptionBase if Could throws an exception.
     * @return Status.
     */
    Status checKStatus(final String fileName, final String bucketName, final String clientId,
            final String clientSecret) throws ExceptionBase;

    /**
     *
     * Gets Logo name. make it a little hard for client-side change?????
     *
     * @return String.
     */
    String getLogo();
}
