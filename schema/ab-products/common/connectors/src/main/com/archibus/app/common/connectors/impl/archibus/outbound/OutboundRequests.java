package com.archibus.app.common.connectors.impl.archibus.outbound;

import java.util.*;

import org.json.JSONObject;

import com.archibus.app.common.connectors.AbstractRequests;
import com.archibus.app.common.connectors.domain.ConnectorConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.impl.archibus.DataSourceUtil;
import com.archibus.app.common.connectors.logging.IUserLog;
import com.archibus.app.common.connectors.transfer.*;
import com.archibus.app.common.connectors.transfer.exception.AdaptorException;
import com.archibus.app.common.connectors.translation.common.inbound.*;
import com.archibus.app.common.connectors.translation.common.outbound.*;
import com.archibus.datasource.DataSource;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.StringUtil;

/**
 * Requests to provide ARCHIBUS data to a foreign system.
 *
 * @author cole
 *
 * @param <RequestType> the type of request to be made to the foreign system.
 */
public class OutboundRequests<RequestType>
extends
AbstractRequests<RequestType, Void, Void, ResponseTxDef<Void, Void, IResponseTxFieldDef<Void>>> {
    /**
     * Connector parameter for using a data source from a view file.
     */
    public static final String AXVW_DS_PARAM = "useAxvwDataSource";
    
    /**
     * An intermediate field name. Request template parameters were designed to come from database
     * records (more useful on export), so the file or folder name needs to be labeled.
     */
    protected static final String DATA_SOURCE_PARAM = "dataSource";

    /**
     * The interval at which the number of outbound requests generated is logged.
     */
    private static final int REQUEST_LOG_INTERVAL = 1000;

    /**
     * Create a series of requests to provide ARCHIBUS data to a foreign system.
     *
     * @param stepName a descriptive name for this step.
     * @param connector the connector defining the requests.
     * @param requestRecordDef a method for providing the field in a request.
     * @param requestTemplate a means for constructing requests.
     * @param adaptor a means for making requests to the foreign system.
     * @param log a place to write user friendly status messages.
     * @throws ConfigurationException if a connector rule is present that cannot be instantiated.
     */
    public OutboundRequests(final String stepName, final ConnectorConfig connector,
            final ArchibusRequestRecordDef requestRecordDef,
            final IRequestTemplate<RequestType> requestTemplate,
            final IAdaptor<RequestType, Void> adaptor, final IUserLog log)
                    throws ConfigurationException {
        // CHECKSTYLE:OFF because the formatter wants the space with the generic
        // method emptyList, and that would cause a compilation error.
        super(stepName, createTemplateParameters(connector), new OutboundRequestDefProxy(
            requestRecordDef, log), requestTemplate, createWrapperAdaptor(adaptor, log,
                requestTemplate instanceof IWrappedRequestTemplate<?>), Collections
                .<ResponseTxDef<Void, Void, IResponseTxFieldDef<Void>>> emptyList());
        // CHECKSTYLE:ON
    }

    /**
     * Create a request template that logs when requests are generated, and applies connector rules.
     *
     * @param originalAdaptor the originalAdaptor to be used to communicate with the foreign system.
     * @param log the log to log request creation to.
     * @param wrappedTemplate whether the template is wrapped (affects counts).
     * @param <RequestType> the type of the request to be created by the original template.
     * @return the request created by the originalTemplate.
     */
    private static <RequestType> IAdaptor<RequestType, Void> createWrapperAdaptor(
        final IAdaptor<RequestType, Void> originalAdaptor, final IUserLog log,
        final boolean wrappedTemplate) {
        return new IAdaptor<RequestType, Void>() {
            private long requestsGenerated = wrappedTemplate ? -1 : 0;

            public String request(final RequestType message)
                    throws com.archibus.app.common.connectors.transfer.exception.AdaptorException {
                this.requestsGenerated++;
                if (this.requestsGenerated % REQUEST_LOG_INTERVAL == 0
                        && this.requestsGenerated > 0) {
                    log.writeMessage("Requests Processed: [" + this.requestsGenerated + ']');
                }
                return originalAdaptor.request(message);
            }

            public boolean expectsResponses(final String requestHandle) {
                return originalAdaptor.expectsResponses(requestHandle);
            }

            public AdaptorResponse<Void> receive(final String requestHandle)
                    throws AdaptorException {
                return originalAdaptor.receive(requestHandle);
            }

            public void close() throws AdaptorException {
                log.writeMessage("Total Requests Processed: ["
                        + (this.requestsGenerated - (wrappedTemplate ? 1 : 0)) + ']');
                originalAdaptor.close();
            }
        };
    }

    /**
     * Create template parameters for an AbstractDataSourceRequestTemplate to generate requests to
     * provide records to a foreign system.
     *
     * @param connector the afm_connector record to use as configuration
     * @return template parameters to be used with the AbstractDataSourceRequestTemplate.
     * @throws ConfigurationException if a connector rule is present that cannot be instantiated, or
     *             useAxvwDataSource is specified without appropriate configuration.
     */
    private static List<? extends Map<String, Object>> createTemplateParameters(
        final ConnectorConfig connector) throws ConfigurationException {
        DataSource sourceDataSource = null;
        final JSONObject parameters = connector.getConnParams();
        if (parameters.has(AXVW_DS_PARAM)) {
            sourceDataSource =
                    DataSourceUtil.getDataSource(parameters.getJSONObject(AXVW_DS_PARAM));
        } else {
            sourceDataSource = DataSourceUtil.getDataSource(connector);
        }
        if (!StringUtil.isNullOrEmpty(connector.getClause())) {
            sourceDataSource.addRestriction(Restrictions.sql(connector.getClause()));
        }
        return Collections.singletonList(Collections.singletonMap(DATA_SOURCE_PARAM,
            (Object) sourceDataSource));
    }

    @Override
    protected IRecordHandler<Void, List<ForeignTxRecord>> getTxRecordHandler(
        final List<ResponseTxDef<Void, Void, IResponseTxFieldDef<Void>>> responseTxDef,
        final Map<String, Object> requestParameters, final Date responseTime) {
        /*
         * No responses to handle.
         */
        return null;
    }
}
