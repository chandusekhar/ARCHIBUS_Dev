package com.archibus.app.common.connectors;

import java.util.*;

import com.archibus.app.common.connectors.exception.StepException;
import com.archibus.app.common.connectors.transfer.*;
import com.archibus.app.common.connectors.translation.common.inbound.*;
import com.archibus.app.common.connectors.translation.common.outbound.*;

/**
 * A means for executing a series of related requests to a foreign system.
 *
 * @author cole
 *
 * @param <RequestType> the type of request made to the adaptor.
 * @param <ResponseType> the type of response received from the adaptor.
 * @param <ResponseTxType> the type of transactions to be extracted from the response from the
 *            adaptor.
 * @param <ResponseTxDefType> the type of transaction definition to be used to extract and translate
 *            the message.
 */
public abstract class AbstractRequests<
/*
 * Disabled formatter, due to resulting line length.
 */
// @formatter:off
            RequestType,
            ResponseType,
            ResponseTxType,
            ResponseTxDefType extends ResponseTxDef<
                ResponseType,
                ResponseTxType,
                ? extends IResponseTxFieldDef<ResponseTxType>
            >
        >
        extends AbstractStep<Void> {
    // @formatter:on
    /**
     * A template for a type of requests to be sent to this adaptor.
     */
    protected final IRequestTemplate<RequestType> requestTemplate;

    /**
     * An request definition for populating the request template (fields must align).
     */
    private final IRequestDef requestDef;

    /**
     * An adaptor for sending the request (must support the requests produced by the
     * requestTemplate).
     */
    private final IAdaptor<RequestType, ResponseType> adaptor;

    /**
     * Variations on a request as specified by sets of parameters, to be processed in the order
     * specified.
     */
    private final List<? extends Map<String, Object>> templateParametersList;

    /**
     * An response transaction definition for extracting data from the response(s).
     */
    private final List<ResponseTxDefType> responseTxDefs;

    /**
     * Define a series of requests to a foreign system.
     *
     * @param stepName a descriptive name for this step.
     * @param templateParameters a set of static field values for use in each request in sequence.
     * @param requestDef translates database field values to foreign field values for the requests.
     * @param requestTemplate constructs a request using foreign field values.
     * @param adaptor sends the requests.
     * @param responseTxDefs translates foreign field values to database field values for the
     *            response.
     */
    public AbstractRequests(final String stepName,
            final List<? extends Map<String, Object>> templateParameters,
            final IRequestDef requestDef, final IRequestTemplate<RequestType> requestTemplate,
            final IAdaptor<RequestType, ResponseType> adaptor,
            final List<ResponseTxDefType> responseTxDefs) {
        super(stepName);
        this.adaptor = adaptor;
        this.requestTemplate = requestTemplate;
        this.templateParametersList = templateParameters;
        this.requestDef = requestDef;
        this.responseTxDefs = responseTxDefs;
    }

    /**
     * A method for receiving data from a foreign system in the data migration process of a
     * Connector.
     *
     * @param previousResults results of previous steps by step name.
     * @return null
     * @throws StepException if an error occurs when trying to send the request, or when trying to
     *             initialize the database
     */
    @Override
    public Void execute(final Map<String, Object> previousResults) throws StepException {
        /*
         * TODO lock transaction tables?
         */
        /*
         * First, for simplicity and efficiency, initialize any tables representing foreign data
         * where the step does not required a persistent state.
         */
        for (final ResponseTxDefType responseTxDef : this.responseTxDefs) {
            if (responseTxDef.isStateless()) {
                responseTxDef.getTransactionTable().resetTable();
            }
        }

        /*
         * Then make requests and interpret responses.
         */
        for (final Map<String, Object> templateParameters : this.templateParametersList) {
            if (this.requestTemplate instanceof IWrappedRequestTemplate<?>) {
                final String requestHandle =
                        this.adaptor
                            .request(((IWrappedRequestTemplate<RequestType>) this.requestTemplate)
                                .generateStart(templateParameters));
                processResponses(requestHandle, templateParameters);
            }

            for (final Map<String, Object> requestParameters : this.requestTemplate
                .generateRequestParameters(templateParameters)) {
                final String reason = this.requestDef.shouldSkip(requestParameters);
                if (reason == null) {
                    /*
                     * Create requests using a request definition to populate the request template
                     * for each set of parameters.
                     */
                    final RequestType request =
                            this.requestDef.createRequest(this.requestTemplate, requestParameters);
                    /*
                     * Send the request.
                     */
                    final String requestHandle = this.adaptor.request(request);
                    /*
                     * Retrieve the responses from the adaptor. This could continue indefinitely
                     * depending on the adaptor.
                     */
                    processResponses(requestHandle, requestParameters);
                }
            }
            if (this.requestTemplate instanceof IWrappedRequestTemplate<?>) {
                final String requestHandle =
                        this.adaptor
                            .request(((IWrappedRequestTemplate<RequestType>) this.requestTemplate)
                                .generateEnd(templateParameters));
                processResponses(requestHandle, templateParameters);
            }
        }

        this.adaptor.close();

        return null;
    }

    /**
     * Interpret responses.
     *
     * @param requestHandle handle for getting requests from an adaptor.
     * @param requestParameters parameters used to make the request to the adaptor.
     *
     * @throws StepException if anything goes wrong receiving or parsing responses.
     */
    private void processResponses(final String requestHandle,
            final Map<String, Object> requestParameters) throws StepException {
        while (this.adaptor.expectsResponses(requestHandle)) {
            final AdaptorResponse<ResponseType> response = this.adaptor.receive(requestHandle);
            if (response != null && !this.responseTxDefs.isEmpty()) {
                processResponse(response, requestParameters);
            }
        }
    }

    /**
     * Interpret a response.
     *
     * @param response a response to the request.
     * @param requestParameters parameters used to make the request to the adaptor.
     *
     * @throws StepException if anything goes wrong receiving or parsing the response.
     */
    private void processResponse(final AdaptorResponse<ResponseType> response,
            final Map<String, Object> requestParameters) throws StepException {
        final Iterator<ResponseTxDefType> responseTxDefIterator = this.responseTxDefs.iterator();
        ResponseTxDefType currTxDef = responseTxDefIterator.next();
        IRecordParser<ResponseType, ResponseTxType> currTxParser = currTxDef.getParser();
        /*
         * As an optimization, so we don't parse the same response more times than necessary, group
         * consecutive definitions using the same parser and pass the resulting records to each
         * record definition in turn.
         */
        final List<ResponseTxDefType> parserTxDefs = new ArrayList<ResponseTxDefType>();
        while (true) {
            if (currTxDef.getParser() == currTxParser) {
                parserTxDefs.add(currTxDef);
                if (responseTxDefIterator.hasNext()) {
                    /*
                     * There are more definitions, and we should wait until we know if they use the
                     * same parser.
                     */
                    currTxDef = responseTxDefIterator.next();
                } else {
                    /*
                     * There are no more definitions, so we should parse the response and exit the
                     * loop.
                     */
                    parseResponse(currTxParser, response, parserTxDefs, requestParameters);
                    break;
                }
            } else {
                /*
                 * There are more definitions, but the current definition has a different parser, so
                 * we should parse the transactions we can with the current parser ...
                 */
                parseResponse(currTxParser, response, parserTxDefs, requestParameters);
                /*
                 * ... and then update the current parser and definition list for the new parser.
                 */
                currTxParser = currTxDef.getParser();
                parserTxDefs.clear();
            }
        }
    }

    /**
     * Parse a response.
     *
     * @param parser the parser to use to parse the response.
     * @param response the response to parse.
     * @param parserTxDefs the definitions to use to interpret transactions provided by the parser.
     * @param requestParameters the parameters for the request that elicited the response.
     * @throws StepException an AdaptorException if an error occurs reading the message or a
     *             TranslationException if an error occurs parsing the data read.
     */
    private void parseResponse(final IRecordParser<ResponseType, ResponseTxType> parser,
            final AdaptorResponse<ResponseType> response,
            final List<ResponseTxDefType> parserTxDefs, final Map<String, Object> requestParameters)
            throws StepException {
        parser.parse(response.getMessage(),
            getTxRecordHandler(parserTxDefs, requestParameters, response.getResponseTime()));

    }

    /**
     * @param requestParameters parameters used to make the request to the adaptor.
     * @param responseTxDef describes how to translate the transaction.
     * @param responseTime the time at which the response was received.
     * @return a handler for the given response transaction definition.
     */
    protected abstract IRecordHandler<ResponseTxType, List<ForeignTxRecord>> getTxRecordHandler(
            final List<ResponseTxDefType> responseTxDef,
            final Map<String, Object> requestParameters, final Date responseTime);
}
