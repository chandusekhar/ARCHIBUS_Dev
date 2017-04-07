package com.archibus.app.common.drawing.bim.service.impl;

import java.io.InputStream;
import java.util.Map;

import com.archibus.app.common.drawing.bim.service.IDrawingBimService;
import com.archibus.app.common.drawing.bim.service.impl.cloud.*;
import com.archibus.utility.ExceptionBase;

/**
 * <p>
 * Implementation of <code>IDrawingBimService</code>.
 * <p>
 * This is a bean managed by Spring, configured in
 * /schema/ab-products/common/resources/appContext-services.xml.
 * <p>
 * Exposed to JavaScript clients through DWR, configured in /WEB-INF/dwr.xml.
 *
 *
 * @author Yong Shao
 * @since 21.4
 *
 */
public class DrawingBimService implements IDrawingBimService {
    /**
     * {@inheritDoc}
     */
    @Override
    public String getAccessToken(final String clientId, final String clientSecret)
            throws ExceptionBase {
        return AccessToken.getToken(clientId, clientSecret);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String convertRvitGuid(final String revitGuid) {
        return DataUtilities.convertRvitGuid2ModelGuid(revitGuid);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Map<String, String> getGuidPKValueMap(final String tableName, final String restriction,
            final boolean isRevit) {
        return DataUtilities.getGuidPKValueMap(tableName, restriction, isRevit);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Map<String, Integer> getRevitGuid2NodeMap(final String objectIdDbFullPath,
            final String accessToken) {
        return RevitGuid.getMapping(objectIdDbFullPath, accessToken);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Map<String, String> getGuidRGBColorMap(final String asset, final String viewName,
            final String dataSourceId, final String restriction, final boolean isRevit) {
        return DataUtilities.getGuidRGBColorMap(asset, viewName, dataSourceId, restriction,
            isRevit);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Map<String, String> getHighlightColors(final String asset, final String viewName,
            final String dataSourceId, final String restriction,
            final Map<String, String> parameters) {
        return DataUtilities.getRGBColors(asset, viewName, dataSourceId, restriction, parameters);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void createBucket(final String bucketName, final String clientId,
            final String clientSecret) throws ExceptionBase {
        Registration.createBucket(bucketName, clientId, clientSecret);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void uploadFile(final InputStream file, final String fileName, final String bucketName,
            final String clientId, final String clientSecret, final boolean registering)
                    throws ExceptionBase {
        UploadFile.upload(file, fileName, bucketName, clientId, clientSecret);
        if (registering) {
            Registration.register(fileName, bucketName, clientId, clientSecret);
        }
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void registerFile(final String fileName, final String bucketName, final String clientId,
            final String clientSecret) throws ExceptionBase {
        Registration.register(fileName, bucketName, clientId, clientSecret);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Status checKStatus(final String fileName, final String bucketName, final String clientId,
            final String clientSecret) throws ExceptionBase {
        return Registration.checKStatus(fileName, bucketName, clientId, clientSecret);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String getLogo() {
        return "ARCHIBUS";
    }
}
