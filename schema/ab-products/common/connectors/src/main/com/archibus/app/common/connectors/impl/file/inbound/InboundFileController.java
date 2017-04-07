package com.archibus.app.common.connectors.impl.file.inbound;

import java.io.InputStream;
import java.util.*;

import com.archibus.app.common.connectors.dao.datasource.ConnectorDataSource;
import com.archibus.app.common.connectors.domain.*;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.archibus.inbound.*;
import com.archibus.app.common.connectors.logging.IUserLog;
import com.archibus.app.common.connectors.translation.common.inbound.IRecordParser;

/**
 * A series of requests to a file system to produce records from multiple sheets in an XLS document.
 *
 * @author cole
 * @since 22.1
 *
 * @param <ResponseTxType> the type of records to be extracted from the response from the adaptor.
 * @param <ResponseTxDefType> the type of record definition to be used to extract and translate the
 *            message.
 * @param <ParsedType> type of elements after parsing.
 */
public class InboundFileController<
// @formatter:off
ResponseTxType,
ResponseTxDefType extends ArchibusResponseTxDef<
    InputStream,
    ResponseTxType,
    ? extends AbstractArchibusResponseFieldDefinition<ResponseTxType>
    >,
ParsedType
// @formatter:on
> extends AbstractInboundFileRequests<ResponseTxType, ResponseTxDefType> {
    /**
     * Provides methods for creating components of the response transaction definitions.
     *
     * @author cole
     * @since 22.1
     *
     * @param <ResponseTxType> the type of records to be extracted from the response from the
     *            adaptor.
     * @param <ResponseTxDefType> the type of record definition to be used to extract and translate
     *            the message.
     * @param <ParsedType> type of elements after parsing.
     */
    protected interface ComponentFactory<
// @formatter:off
    ResponseTxType,
    ResponseTxDefType extends ArchibusResponseTxDef<
        InputStream,
        ResponseTxType,
        ? extends AbstractArchibusResponseFieldDefinition<ResponseTxType>>,
    ParsedType
    // @formatter:on
    > {
        /**
         * @param responseTxDefConfig configuration for a response transaction definition.
         * @param parser a parser whose records should be interpreted by this definition.
         * @return a response transaction definition.
         * @throws ConfigurationException if the transaction definition is invalid.
         */
        ResponseTxDefType createResponseTxDef(final ConnectorConfig responseTxDefConfig,
                final IRecordParser<InputStream, ParsedType> parser) throws ConfigurationException;

        /**
         * @return a parser of the specified type for the specified parser configuration.
         * @throws ConfigurationException if the parser configuration is invalid.
         */
        IRecordParser<InputStream, ParsedType> createParser() throws ConfigurationException;
    }

    /**
     * Generate a series of requests to a file system to produce records from delimited text.
     *
     * @param stepName a descriptive name for this step.
     * @param connector the afm_connector record to use as configuration.
     * @param log a place to write user friendly status messages.
     * @param factory a factory for components of response transaction definitions.
     * @throws ConfigurationException if a connector rule associated with these requests cannot be
     *             instantiated, or if a connection can't be opened to an FTP server.
     */
    public InboundFileController(final String stepName, final ConnectorConfig connector,
            final IUserLog log,
            final ComponentFactory<ResponseTxType, ResponseTxDefType, ParsedType> factory)
            throws ConfigurationException {
        /*
         * Create requests.
         */
        super(stepName, createTemplateParameters(connector), createResponseTxDefs(connector,
            factory), connector, log);
    }

    /**
     * @param connector the connector configuration for the controller.
     * @param factory a factory for components of response transaction definitions.
     * @return response transaction definitions.
     *
     * @param <ResponseTxType> the type of records to be extracted from the response from the
     *            adaptor.
     * @param <ResponseTxDefType> the type of record definition to be used to extract and translate
     *            the message.
     * @param <ParsedType> type of elements after parsing.
     * @throws ConfigurationException if any connector configuration is invalid.
     */
    private static <
// @formatter:off
    ResponseTxType,
    ResponseTxDefType extends ArchibusResponseTxDef<
        InputStream,
        ResponseTxType,
        ? extends AbstractArchibusResponseFieldDefinition<ResponseTxType>
        >,
    ParsedType
    // @formatter:on
    > List<ResponseTxDefType> createResponseTxDefs(final ConnectorConfig connector,
            final ComponentFactory<ResponseTxType, ResponseTxDefType, ParsedType> factory)
            throws ConfigurationException {
        final LinkedHashMap<String, ConnectorConfig> txDefConfigs =
                new LinkedHashMap<String, ConnectorConfig>(connector.getConnectorFields().size());
        final ConnectorDataSource connectorDataSource = new ConnectorDataSource();

        /*
         * retrieve connector configurations for sheets.
         */
        for (final ConnectorFieldConfig connectorField : connector.getConnectorFields()) {
            final ConnectorConfig txDefConfig =
                    connectorDataSource.get(connectorField.getFieldId());
            if (txDefConfig == null) {
                throw new ConfigurationException("Controller found no connector with id: "
                        + connectorField.getFieldId(), null);
            }
            txDefConfigs.put(txDefConfig.getConnectorId(), txDefConfig);
        }

        /*
         * create parser for workbook and transaction definitions for sheets.
         */
        final IRecordParser<InputStream, ParsedType> parser = factory.createParser();
        final List<ResponseTxDefType> transactionDefinitions = new ArrayList<ResponseTxDefType>();
        final Map<String, ResponseTxDefType> transactionDefinitionsById =
                new HashMap<String, ResponseTxDefType>();
        /*
         * This is a map of connector->configuredPosition->fieldDefinition.
         */
        for (final ConnectorConfig sheetConnector : txDefConfigs.values()) {
            final ResponseTxDefType responseTxDef =
                    factory.createResponseTxDef(sheetConnector, parser);
            for (final String ancestorId : responseTxDef.getAncestorIds()) {
                transactionDefinitionsById.get(ancestorId).addPredecessor(responseTxDef);
            }
            transactionDefinitions.add(responseTxDef);
            transactionDefinitionsById.put(responseTxDef.getId(), responseTxDef);
        }
        return transactionDefinitions;
    }
}
