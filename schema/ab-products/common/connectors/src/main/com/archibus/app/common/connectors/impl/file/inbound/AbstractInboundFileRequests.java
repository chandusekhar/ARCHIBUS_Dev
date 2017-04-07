package com.archibus.app.common.connectors.impl.file.inbound;

import java.io.InputStream;
import java.util.*;

import com.archibus.app.common.connectors.domain.ConnectorConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.archibus.inbound.*;
import com.archibus.app.common.connectors.impl.file.FtpUtil;
import com.archibus.app.common.connectors.logging.IUserLog;
import com.archibus.app.common.connectors.transfer.IAdaptor;
import com.archibus.app.common.connectors.transfer.file.InboundFileSystemAdaptor;
import com.archibus.app.common.connectors.transfer.ftp.InboundFtpAdaptor;
import com.archibus.app.common.connectors.translation.common.outbound.*;
import com.archibus.app.common.connectors.translation.file.inbound.FileReadRequestTemplate;
import com.archibus.app.common.fileaccess.AbstractFtpTemplate;
import com.archibus.utility.StringUtil;

/**
 * A series of requests to a file system, and a means for executing them.
 *
 * @author cole
 *
 * @param <ResponseTxType> the type of records to be extracted from the response from the adaptor.
 * @param <ResponseTxDefType> the type of record definition to be used to extract and translate the
 *            message.
 */
public abstract class AbstractInboundFileRequests<
/*
 * Disabled formatter, due to resulting line length.
 */
// @formatter:off
ResponseTxType, ResponseTxDefType extends ArchibusResponseTxDef<InputStream, ResponseTxType, ? extends AbstractArchibusResponseFieldDefinition<ResponseTxType>>>
        extends InboundRequests<String, InputStream, ResponseTxType, ResponseTxDefType> {
    // @formatter:on
    /**
     * An intermediate field name. Request template parameters were designed to come from database
     * records (more useful on export), so the file or folder name needs to be labeled.
     */
    protected static final String FILE_NODE_PARAM = "fileNode";

    /**
     * Define a series of requests to a file system to retrieve data.
     *
     * @param stepName a descriptive name for this step.
     * @param templateParameters a set of static field values for use in each request in sequence.
     * @param requestRecordDef translates database field values to foreign field values for the
     *            requests.
     * @param requestTemplate constructs a request using foreign field values.
     * @param adaptor sends the requests.
     * @param responseTxDefs translates foreign field values to database field values for the
     *            response.
     * @param log a place to write user friendly status messages
     */
    public AbstractInboundFileRequests(final String stepName,
            final List<? extends Map<String, Object>> templateParameters,
            final IRequestDef requestRecordDef, final IRequestTemplate<String> requestTemplate,
            final IAdaptor<String, InputStream> adaptor,
            final List<ResponseTxDefType> responseTxDefs, final IUserLog log) {
        super(stepName, templateParameters, requestRecordDef, requestTemplate, adaptor,
            responseTxDefs, log);
    }

    /**
     * Define a series of requests to a file system.
     *
     * @param stepName a descriptive name for this step.
     * @param templateParameters a set of static field values for use in each request in sequence.
     * @param responseTxDefs translates foreign field values to database field values for the
     *            response.
     * @param log a place to write user friendly status messages
     */
    public AbstractInboundFileRequests(final String stepName,
            final List<? extends Map<String, Object>> templateParameters,
            final List<ResponseTxDefType> responseTxDefs, final IUserLog log) {
        super(stepName, templateParameters, new FileRequestRecordDef(FILE_NODE_PARAM),
            new FileReadRequestTemplate(FILE_NODE_PARAM), new InboundFileSystemAdaptor(),
            responseTxDefs, log);
    }

    /**
     * Define a series of requests to a file system.
     *
     * @param stepName a descriptive name for this step.
     * @param templateParameters a set of static field values for use in each request in sequence.
     * @param responseTxDefs translates foreign field values to database field values for the
     *            response.
     * @param connector the connector, with which to configure the adaptor (e.g. FTP).
     * @param log a place to write user friendly status messages
     * @throws ConfigurationException if a connection cannot be established to an FTP server.
     */
    public AbstractInboundFileRequests(final String stepName,
            final List<? extends Map<String, Object>> templateParameters,
            final List<ResponseTxDefType> responseTxDefs, final ConnectorConfig connector,
            final IUserLog log) throws ConfigurationException {
        super(stepName, templateParameters, new FileRequestRecordDef(FILE_NODE_PARAM),
            new FileReadRequestTemplate(FILE_NODE_PARAM, usesFtp(connector)),
            createAdaptor(connector), responseTxDefs, log);
    }

    /**
     * Create template parameters for the FileRequestTemplate to generate requests for the file or
     * files that need to be read by this connector.
     *
     * @param connector the afm_connector record to use as configuration
     * @return template parameters to be used with the FileRequestTemplate.
     */
    protected static List<? extends Map<String, Object>> createTemplateParameters(
        final ConnectorConfig connector) {
        final String path;
        final String connString = connector.getConnString();
        if (usesFtp(connector)) {
            final String configuredFtpFolder = connector.getFtpFolder();
            if (StringUtil.isNullOrEmpty(configuredFtpFolder)) {
                path = connString;
            } else {
                path = configuredFtpFolder + connString;
            }
        } else {
            path = connString;
        }
        return Collections.singletonList(Collections.singletonMap(FILE_NODE_PARAM, (Object) path));
    }

    /**
     * Create an inbound adaptor for these requests based on the connector configuration.
     *
     * @param connector the configuration for the adaptor.
     * @return a file or FTP adaptor depending on the connector's configuration.
     * @throws ConfigurationException if a connection cannot be established to an FTP server.
     */
    protected static IAdaptor<String, InputStream> createAdaptor(final ConnectorConfig connector)
            throws ConfigurationException {
        IAdaptor<String, InputStream> adaptor;
        if (usesFtp(connector)) {
            adaptor =
                    new InboundFtpAdaptor<AbstractFtpTemplate<?>>(
                        FtpUtil.createFtpClient(connector));
        } else {
            adaptor = new InboundFileSystemAdaptor();
        }
        return adaptor;
    }

    /**
     * @param connector the configuration for the adaptor.
     * @return whether the connector uses an FTP protocol.
     */
    private static boolean usesFtp(final ConnectorConfig connector) {
        return !StringUtil.isNullOrEmpty(connector.getFtpString());
    }
}
