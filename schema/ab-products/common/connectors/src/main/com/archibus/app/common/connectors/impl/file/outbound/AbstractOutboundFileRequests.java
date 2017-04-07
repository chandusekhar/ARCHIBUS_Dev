package com.archibus.app.common.connectors.impl.file.outbound;

import java.io.*;
import java.util.*;

import org.json.JSONObject;

import com.archibus.app.common.connectors.domain.ConnectorConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.archibus.outbound.*;
import com.archibus.app.common.connectors.impl.file.FtpUtil;
import com.archibus.app.common.connectors.logging.IUserLog;
import com.archibus.app.common.connectors.transfer.IAdaptor;
import com.archibus.app.common.connectors.transfer.common.InputStreamMultiAdaptor;
import com.archibus.app.common.connectors.transfer.docmgmt.OutboundDocumentManagementAdaptor;
import com.archibus.app.common.connectors.transfer.file.OutboundFileAdaptor;
import com.archibus.app.common.connectors.transfer.ftp.OutboundFtpAdaptor;
import com.archibus.app.common.connectors.translation.common.outbound.IRequestTemplate;
import com.archibus.app.common.fileaccess.AbstractFtpTemplate;
import com.archibus.utility.*;

/**
 * A series of requests to a write to a file, and a means for executing them.
 *
 * @author cole
 *
 */
public abstract class AbstractOutboundFileRequests extends OutboundRequests<InputStream> {

    /**
     * Upload document connector parameter name.
     */
    private static final String UPLOAD_DOCUMENT_PARAM = "uploadDocument";

    /**
     * Upload document table parameter name.
     */
    private static final String TABLE_PARAM = "table";

    /**
     * Upload document field parameter name.
     */
    private static final String DOCUMENT_FIELD_PARAM = "docField";

    /**
     * Upload document primary key values parameter name.
     */
    private static final String PRIMARY_KEY_VALUES_PARAM = "value";

    /**
     * Upload document comment parameter name.
     */
    private static final String COMMENT_PARAM = "comment";
    
    /**
     * Document management unlocked status.
     */
    private static final String UNLOCKED_STATUS = "0";

    /**
     * Create a series of requests to provide ARCHIBUS data to a file.
     *
     * @param stepName a descriptive name for this step.
     * @param connector the connector defining the requests.
     * @param requestRecordDef a method for providing the field in a request.
     * @param requestTemplate a means for constructing requests.
     * @param log a place to write user friendly status messages.
     * @throws ConfigurationException if a connector rule is present that cannot be instantiated, or
     *             if a connection cannot be established to an FTP server.
     */
    public AbstractOutboundFileRequests(final String stepName, final ConnectorConfig connector,
            final ArchibusRequestRecordDef requestRecordDef,
            final IRequestTemplate<InputStream> requestTemplate, final IUserLog log)
            throws ConfigurationException {
        super(stepName, connector, requestRecordDef, requestTemplate, createAdaptor(connector), log);
    }

    /**
     * Create an outbound adaptor for these requests based on the connector configuration.
     *
     * @param connector the configuration for the adaptor.
     * @return a file or FTP adaptor depending on the connector's configuration.
     * @throws ConfigurationException if a connection cannot be established to an FTP server.
     */
    protected static IAdaptor<InputStream, Void> createAdaptor(final ConnectorConfig connector)
            throws ConfigurationException {
        IAdaptor<InputStream, Void> adaptor;
        final String pathname = connector.getConnString();
        if (StringUtil.isNullOrEmpty(connector.getFtpString())) {
            adaptor = new OutboundFileAdaptor(new File(pathname));
        } else {
            adaptor =
                    new OutboundFtpAdaptor<AbstractFtpTemplate<?>>(
                        FtpUtil.createFtpClient(connector), pathname, false);
        }
        if (connector.getConnParams().has(UPLOAD_DOCUMENT_PARAM)) {
            /*
             * Extract parameters.
             */
            final JSONObject documentManagementConfiguration =
                    connector.getConnParams().getJSONObject(UPLOAD_DOCUMENT_PARAM);
            final String tableName = documentManagementConfiguration.getString(TABLE_PARAM);
            final String documentField =
                    documentManagementConfiguration.getString(DOCUMENT_FIELD_PARAM);
            final List<String> primaryKeyValues =
                    Arrays.asList(documentManagementConfiguration.getString(
                        PRIMARY_KEY_VALUES_PARAM).split("\\|"));
            String comment = "Uploaded from Connector: " + connector.getConnectorId();
            if (documentManagementConfiguration.has(COMMENT_PARAM)) {
                comment = documentManagementConfiguration.getString(COMMENT_PARAM);
            }
            final String documentName = FileUtil.getName(connector.getConnString());
            
            /*
             * Create supplemental adaptor.
             */
            final IAdaptor<InputStream, Void> documentManagementAdaptor =
                    new OutboundDocumentManagementAdaptor(tableName, documentField, documentName,
                        primaryKeyValues, UNLOCKED_STATUS, comment);
            final List<IAdaptor<InputStream, Void>> adaptors =
                    new ArrayList<IAdaptor<InputStream, Void>>();
            adaptors.add(adaptor);
            adaptors.add(documentManagementAdaptor);
            adaptor = new InputStreamMultiAdaptor<Void>(adaptors);
        }
        return adaptor;
    }
}
